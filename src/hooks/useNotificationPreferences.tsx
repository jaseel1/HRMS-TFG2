import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationPreferences {
  id: string;
  new_leave_request: boolean;
  leave_approved: boolean;
  leave_rejected: boolean;
  low_balance_alert: boolean;
  upcoming_holiday: boolean;
  probation_ending: boolean;
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences> & { id: string }) => {
      const { id, ...updates } = prefs;
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}
