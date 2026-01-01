import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  user_id: string | null;
  table_name: string;
  action: string;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
  user_email?: string;
}

export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ["audit-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch user emails for the logs
      const userIds = [...new Set(data?.map((log) => log.user_id).filter(Boolean) as string[])];
      
      let userEmails: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        
        userEmails = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p.email;
          return acc;
        }, {} as Record<string, string>);
      }

      return (data || []).map((log) => ({
        ...log,
        user_email: log.user_id ? userEmails[log.user_id] : undefined,
      })) as AuditLog[];
    },
  });
}
