import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationStats {
  totalPendingLeaves: number;
  employeesOnLeaveToday: number;
  upcomingLeavesThisWeek: number;
  totalLopDaysThisMonth: number;
}

export interface AllRecentLeaveRequest {
  id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
}

export interface DepartmentLeaveOverview {
  department_id: string;
  department_name: string;
  total_employees: number;
  on_leave_today: number;
  pending_requests: number;
}

export function useOrganizationStats() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0];
  
  // Calculate week start (Monday) and end (Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return useQuery({
    queryKey: ["organization-stats", today],
    queryFn: async (): Promise<OrganizationStats> => {
      // Count total pending leave applications
      const { count: pendingCount } = await supabase
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Count employees on leave today
      const { count: onLeaveToday } = await supabase
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today);

      // Count upcoming leaves this week (starting from today)
      const { count: upcomingCount } = await supabase
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("start_date", today)
        .lte("start_date", weekEnd.toISOString().split("T")[0]);

      // Sum LOP days this month
      const { data: lopData } = await supabase
        .from("leave_applications")
        .select("lop_days")
        .eq("status", "approved")
        .eq("is_lop", true)
        .gte("start_date", monthStart)
        .lte("end_date", monthEnd);

      const totalLopDays = lopData?.reduce((sum, app) => sum + (Number(app.lop_days) || 0), 0) || 0;

      return {
        totalPendingLeaves: pendingCount || 0,
        employeesOnLeaveToday: onLeaveToday || 0,
        upcomingLeavesThisWeek: upcomingCount || 0,
        totalLopDaysThisMonth: Math.round(totalLopDays),
      };
    },
  });
}

export function useAllRecentLeaveRequests(limit: number = 10) {
  return useQuery({
    queryKey: ["all-recent-leave-requests", limit],
    queryFn: async (): Promise<AllRecentLeaveRequest[]> => {
      const { data, error } = await supabase
        .from("leave_applications")
        .select(`
          id,
          start_date,
          end_date,
          days_count,
          status,
          created_at,
          leave_types (name),
          employees!leave_applications_employee_id_fkey (user_id)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get unique user IDs
      const userIds = (data || [])
        .map(app => (app.employees as { user_id: string | null } | null)?.user_id)
        .filter((id): id is string => !!id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map(app => {
        const employees = app.employees as { user_id: string | null } | null;
        const leaveTypes = app.leave_types as { name: string } | null;
        const profile = employees?.user_id ? profileMap.get(employees.user_id) : null;

        return {
          id: app.id,
          employee_name: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown",
          leave_type: leaveTypes?.name || "Unknown",
          start_date: app.start_date,
          end_date: app.end_date,
          days_count: Number(app.days_count),
          status: app.status as AllRecentLeaveRequest["status"],
          created_at: app.created_at,
        };
      });
    },
  });
}

export function useDepartmentLeaveOverview() {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["department-leave-overview", today],
    queryFn: async (): Promise<DepartmentLeaveOverview[]> => {
      // Fetch all departments
      const { data: departments } = await supabase
        .from("departments")
        .select("id, name");

      if (!departments || departments.length === 0) return [];

      // Fetch all active employees with their departments
      const { data: employees } = await supabase
        .from("employees")
        .select("id, department_id")
        .eq("is_active", true);

      // Fetch pending leave applications
      const { data: pendingApps } = await supabase
        .from("leave_applications")
        .select("employee_id")
        .eq("status", "pending");

      // Fetch employees on leave today
      const { data: onLeaveApps } = await supabase
        .from("leave_applications")
        .select("employee_id")
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today);

      // Create employee to department map
      const employeeDeptMap = new Map(employees?.map(e => [e.id, e.department_id]) || []);

      // Aggregate data by department
      return departments.map(dept => {
        const deptEmployees = employees?.filter(e => e.department_id === dept.id) || [];
        const deptEmployeeIds = new Set(deptEmployees.map(e => e.id));

        const onLeaveCount = onLeaveApps?.filter(a => deptEmployeeIds.has(a.employee_id)).length || 0;
        const pendingCount = pendingApps?.filter(a => deptEmployeeIds.has(a.employee_id)).length || 0;

        return {
          department_id: dept.id,
          department_name: dept.name,
          total_employees: deptEmployees.length,
          on_leave_today: onLeaveCount,
          pending_requests: pendingCount,
        };
      }).filter(d => d.total_employees > 0);
    },
  });
}
