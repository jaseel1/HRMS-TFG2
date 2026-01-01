import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEmployee } from "./useEmployee";

export interface LeaveHistoryItem {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  is_lop: boolean;
  lop_days: number | null;
  created_at: string;
  updated_at: string;
  leave_types: {
    id: string;
    name: string;
    code: string;
  } | null;
  employees: {
    id: string;
    employee_id: string;
    department_id: string | null;
    departments: {
      id: string;
      name: string;
    } | null;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export function useLeaveHistory(filters?: {
  year?: number;
  status?: string;
  departmentId?: string;
  employeeId?: string;
}) {
  const { role } = useAuth();
  const { data: employee } = useEmployee();

  return useQuery({
    queryKey: ["leave-history", role, employee?.id, filters],
    queryFn: async (): Promise<LeaveHistoryItem[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the user's role
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const currentRole = userRole?.role;

      // Build the query
      let query = supabase
        .from("leave_applications")
        .select(`
          id,
          employee_id,
          leave_type_id,
          start_date,
          end_date,
          days_count,
          reason,
          status,
          is_lop,
          lop_days,
          created_at,
          updated_at,
          leave_types (
            id,
            name,
            code
          ),
          employees!leave_applications_employee_id_fkey (
            id,
            employee_id,
            department_id,
            departments (
              id,
              name
            ),
            profiles:profiles!employees_user_id_profiles_fkey (
              first_name,
              last_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      // Apply role-based filtering
      if (currentRole === "admin" || currentRole === "hr") {
        // Admin/HR can see all leave history - no additional filter
      } else if (currentRole === "manager") {
        // Managers see their own + their team members' leave history
        if (!employee) return [];

        // Get team member IDs
        const { data: teamMembers } = await supabase
          .from("employees")
          .select("id")
          .eq("reporting_manager_id", employee.id)
          .eq("is_active", true);

        const teamMemberIds = teamMembers?.map(e => e.id) || [];
        // Include manager's own ID
        const allIds = [employee.id, ...teamMemberIds];

        query = query.in("employee_id", allIds);
      } else {
        // Team members only see their own history
        if (!employee) return [];
        query = query.eq("employee_id", employee.id);
      }

      // Apply optional filters
      if (filters?.year) {
        const startOfYear = `${filters.year}-01-01`;
        const endOfYear = `${filters.year}-12-31`;
        query = query.gte("start_date", startOfYear).lte("start_date", endOfYear);
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status as "pending" | "approved" | "rejected" | "cancelled");
      }

      if (filters?.departmentId && filters.departmentId !== "all") {
        // Need to filter by department through the employees table
        const { data: deptEmployees } = await supabase
          .from("employees")
          .select("id")
          .eq("department_id", filters.departmentId);

        if (deptEmployees) {
          query = query.in("employee_id", deptEmployees.map(e => e.id));
        }
      }

      if (filters?.employeeId && filters.employeeId !== "all") {
        query = query.eq("employee_id", filters.employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as unknown as LeaveHistoryItem[];
    },
    enabled: !!role,
  });
}
