import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmployee } from "./useEmployee";
import { useAuth } from "./useAuth";

export interface TeamMember {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_name: string | null;
  employment_type: string;
  date_of_joining: string;
  is_active: boolean;
}

export interface TeamLeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  leave_type_code: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
}

export interface TeamStats {
  totalTeamMembers: number;
  onLeaveToday: number;
  pendingApprovals: number;
  upcomingLeaves: number;
}

// Check if current user is a reporting manager or HR/Admin
export function useIsReportingManager() {
  const { data: employee } = useEmployee();
  const { role } = useAuth();

  return useQuery({
    queryKey: ["is-reporting-manager", employee?.id, role],
    queryFn: async (): Promise<boolean> => {
      // HR and Admin always have team access
      if (role === "hr" || role === "admin") return true;
      
      if (!employee) return false;

      const { count, error } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("reporting_manager_id", employee.id)
        .eq("is_active", true);

      if (error) throw error;
      return (count || 0) > 0;
    },
    enabled: !!role && (role === "hr" || role === "admin" || !!employee),
  });
}

// Fetch all direct reports of the current employee (or all employees for HR/Admin)
export function useTeamMembers(showAll: boolean = false) {
  const { data: employee } = useEmployee();

  return useQuery({
    queryKey: ["team-members", employee?.id, showAll],
    queryFn: async (): Promise<TeamMember[]> => {
      let query = supabase
        .from("employees")
        .select(`
          id,
          employee_id,
          employment_type,
          date_of_joining,
          is_active,
          user_id,
          departments (
            name
          )
        `)
        .eq("is_active", true);

      // If not showing all, filter by reporting manager
      if (!showAll && employee) {
        query = query.eq("reporting_manager_id", employee.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles separately
      const userIds = (data || [])
        .map(emp => emp.user_id)
        .filter((id): id is string => !!id);

      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map(emp => {
        const profile = emp.user_id ? profileMap.get(emp.user_id) : null;
        const departments = emp.departments as { name: string } | null;
        
        return {
          id: emp.id,
          employee_id: emp.employee_id,
          first_name: profile?.first_name || "Unknown",
          last_name: profile?.last_name || "",
          email: profile?.email || "",
          department_name: departments?.name || null,
          employment_type: emp.employment_type,
          date_of_joining: emp.date_of_joining,
          is_active: emp.is_active,
        };
      });
    },
    // For showAll (HR/Admin), we don't need an employee record
    enabled: showAll || !!employee,
  });
}

// Fetch team member IDs for filtering (or all employee IDs for HR/Admin)
export function useTeamMemberIds(showAll: boolean = false) {
  const { data: employee } = useEmployee();

  return useQuery({
    queryKey: ["team-member-ids", employee?.id, showAll],
    queryFn: async (): Promise<string[]> => {
      let query = supabase
        .from("employees")
        .select("id")
        .eq("is_active", true);

      // If not showing all, filter by reporting manager
      if (!showAll && employee) {
        query = query.eq("reporting_manager_id", employee.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(emp => emp.id);
    },
    // For showAll (HR/Admin), we don't need an employee record
    enabled: showAll || !!employee,
  });
}

// Fetch leave requests from team members only (or all for HR/Admin)
export function useTeamLeaveRequests(status?: "pending" | "all", showAll: boolean = false) {
  const { data: employee } = useEmployee();
  const { data: teamMemberIds } = useTeamMemberIds(showAll);

  return useQuery({
    queryKey: ["team-leave-requests", employee?.id, teamMemberIds, status, showAll],
    queryFn: async (): Promise<TeamLeaveRequest[]> => {
      if (!teamMemberIds || teamMemberIds.length === 0) return [];

      let query = supabase
        .from("leave_applications")
        .select(`
          id,
          employee_id,
          start_date,
          end_date,
          days_count,
          reason,
          status,
          created_at,
          leave_types (
            name,
            code
          )
        `)
        .in("employee_id", teamMemberIds)
        .order("created_at", { ascending: false });

      if (status === "pending") {
        query = query.eq("status", "pending");
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch employee profiles
      const empIds = [...new Set((data || []).map(app => app.employee_id))];
      
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("id, user_id")
        .in("id", empIds);

      if (empError) throw empError;

      const userIds = (employees || [])
        .map(e => e.user_id)
        .filter((id): id is string => !!id);

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profileError) throw profileError;

      const empUserMap = new Map((employees || []).map(e => [e.id, e.user_id]));
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (data || []).map(app => {
        const leaveTypes = app.leave_types as { name: string; code: string } | null;
        const userId = empUserMap.get(app.employee_id);
        const profile = userId ? profileMap.get(userId) : null;

        return {
          id: app.id,
          employee_id: app.employee_id,
          employee_name: profile 
            ? `${profile.first_name} ${profile.last_name}` 
            : "Unknown",
          leave_type: leaveTypes?.name || "Unknown",
          leave_type_code: leaveTypes?.code || "??",
          start_date: app.start_date,
          end_date: app.end_date,
          days_count: Number(app.days_count),
          reason: app.reason,
          status: app.status as TeamLeaveRequest["status"],
          created_at: app.created_at,
        };
      });
    },
    enabled: (showAll || !!employee) && !!teamMemberIds && teamMemberIds.length > 0,
  });
}

// Get team stats for the manager dashboard (or all employees for HR/Admin)
export function useTeamStats(showAll: boolean = false) {
  const { data: employee } = useEmployee();
  const { data: teamMemberIds } = useTeamMemberIds(showAll);

  return useQuery({
    queryKey: ["team-stats", employee?.id, teamMemberIds, showAll],
    queryFn: async (): Promise<TeamStats> => {
      if (!teamMemberIds) {
        return {
          totalTeamMembers: 0,
          onLeaveToday: 0,
          pendingApprovals: 0,
          upcomingLeaves: 0,
        };
      }

      const today = new Date().toISOString().split("T")[0];
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const weekEnd = weekFromNow.toISOString().split("T")[0];

      // Count team members
      const totalTeamMembers = teamMemberIds.length;

      if (totalTeamMembers === 0) {
        return {
          totalTeamMembers: 0,
          onLeaveToday: 0,
          pendingApprovals: 0,
          upcomingLeaves: 0,
        };
      }

      // Count on leave today
      const { count: onLeaveCount, error: leaveError } = await supabase
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .in("employee_id", teamMemberIds)
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today);

      if (leaveError) throw leaveError;

      // Count pending approvals
      const { count: pendingCount, error: pendingError } = await supabase
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .in("employee_id", teamMemberIds)
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      // Count upcoming leaves this week
      const { count: upcomingCount, error: upcomingError } = await supabase
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .in("employee_id", teamMemberIds)
        .eq("status", "approved")
        .gt("start_date", today)
        .lte("start_date", weekEnd);

      if (upcomingError) throw upcomingError;

      return {
        totalTeamMembers,
        onLeaveToday: onLeaveCount || 0,
        pendingApprovals: pendingCount || 0,
        upcomingLeaves: upcomingCount || 0,
      };
    },
    enabled: (showAll || !!employee) && !!teamMemberIds,
  });
}
