import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmployeeLeaveBalance {
  id: string;
  leave_type_id: string;
  leave_type_name: string;
  leave_type_code: string;
  year: number;
  entitled_days: number;
  used_days: number;
  carried_forward_days: number;
  adjusted_days: number;
  available: number;
}

export function useEmployeeLeaveBalances(employeeId: string | null) {
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["employee-leave-balances", employeeId, currentYear],
    queryFn: async (): Promise<EmployeeLeaveBalance[]> => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from("leave_balances")
        .select(`
          *,
          leave_types (
            id,
            name,
            code
          )
        `)
        .eq("employee_id", employeeId)
        .eq("year", currentYear);

      if (error) throw error;

      return (data || []).map((b) => {
        const leaveType = b.leave_types as { id: string; name: string; code: string } | null;
        const entitled = Number(b.entitled_days);
        const used = Number(b.used_days);
        const carried = Number(b.carried_forward_days);
        const adjusted = Number(b.adjusted_days);

        return {
          id: b.id,
          leave_type_id: b.leave_type_id,
          leave_type_name: leaveType?.name || "Unknown",
          leave_type_code: leaveType?.code || "??",
          year: b.year,
          entitled_days: entitled,
          used_days: used,
          carried_forward_days: carried,
          adjusted_days: adjusted,
          available: entitled + carried + adjusted - used,
        };
      });
    },
    enabled: !!employeeId,
  });
}

export function useAdjustLeaveBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      balanceId,
      adjustedDays,
      reason,
    }: {
      balanceId: string;
      adjustedDays: number;
      reason: string;
    }) => {
      const { error } = await supabase
        .from("leave_balances")
        .update({ adjusted_days: adjustedDays })
        .eq("id", balanceId);

      if (error) throw error;

      // Log the adjustment in audit_logs
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          table_name: "leave_balances",
          record_id: balanceId,
          action: "balance_adjustment",
          new_values: { adjusted_days: adjustedDays, reason },
        });

      // Audit log insert failure shouldn't fail the whole operation
      if (auditError) {
        console.warn("Failed to log balance adjustment:", auditError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
