import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MonthlyLeaveTrend {
  month: string;
  approved: number;
  pending: number;
  rejected: number;
}

export interface DepartmentUsage {
  department: string;
  totalDays: number;
  employeeCount: number;
}

export interface LeaveTypeDistribution {
  name: string;
  code: string;
  totalDays: number;
  percentage: number;
}

export interface BalanceSummary {
  totalEntitled: number;
  totalUsed: number;
  totalAvailable: number;
  utilizationRate: number;
}

export function useLeaveAnalytics() {
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["leave-analytics", currentYear],
    queryFn: async () => {
      // Fetch all approved leave applications for the current year
      const { data: applications, error: appError } = await supabase
        .from("leave_applications")
        .select(`
          id,
          days_count,
          start_date,
          status,
          created_at,
          leave_types (
            id,
            name,
            code
          ),
          employees!leave_applications_employee_id_fkey (
            id,
            department_id,
            departments (
              id,
              name
            )
          )
        `)
        .gte("start_date", `${currentYear}-01-01`)
        .lte("start_date", `${currentYear}-12-31`);

      if (appError) throw appError;

      // Fetch leave balances
      const { data: balances, error: balError } = await supabase
        .from("leave_balances")
        .select(`
          entitled_days,
          used_days,
          carried_forward_days,
          adjusted_days
        `)
        .eq("year", currentYear);

      if (balError) throw balError;

      // Calculate monthly trends
      const monthlyData: Record<string, { approved: number; pending: number; rejected: number }> = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach((m) => {
        monthlyData[m] = { approved: 0, pending: 0, rejected: 0 };
      });

      applications?.forEach((app) => {
        const month = new Date(app.start_date).getMonth();
        const monthName = months[month];
        const status = app.status as "approved" | "pending" | "rejected";
        if (status in monthlyData[monthName]) {
          monthlyData[monthName][status] += Number(app.days_count);
        }
      });

      const monthlyTrends: MonthlyLeaveTrend[] = months.map((m) => ({
        month: m,
        ...monthlyData[m],
      }));

      // Calculate department usage
      const deptData: Record<string, { totalDays: number; employees: Set<string> }> = {};
      applications
        ?.filter((app) => app.status === "approved")
        .forEach((app) => {
          const employees = app.employees as { department_id: string | null; departments: { name: string } | null } | null;
          const deptName = employees?.departments?.name || "Unassigned";
          const empId = (app.employees as { id: string } | null)?.id;

          if (!deptData[deptName]) {
            deptData[deptName] = { totalDays: 0, employees: new Set() };
          }
          deptData[deptName].totalDays += Number(app.days_count);
          if (empId) deptData[deptName].employees.add(empId);
        });

      const departmentUsage: DepartmentUsage[] = Object.entries(deptData)
        .map(([department, data]) => ({
          department,
          totalDays: Math.round(data.totalDays),
          employeeCount: data.employees.size,
        }))
        .sort((a, b) => b.totalDays - a.totalDays);

      // Calculate leave type distribution
      const typeData: Record<string, { name: string; code: string; totalDays: number }> = {};
      applications
        ?.filter((app) => app.status === "approved")
        .forEach((app) => {
          const leaveType = app.leave_types as { id: string; name: string; code: string } | null;
          const typeId = leaveType?.id || "unknown";
          if (!typeData[typeId]) {
            typeData[typeId] = {
              name: leaveType?.name || "Unknown",
              code: leaveType?.code || "??",
              totalDays: 0,
            };
          }
          typeData[typeId].totalDays += Number(app.days_count);
        });

      const totalApprovedDays = Object.values(typeData).reduce((sum, t) => sum + t.totalDays, 0);
      const leaveTypeDistribution: LeaveTypeDistribution[] = Object.values(typeData)
        .map((t) => ({
          ...t,
          totalDays: Math.round(t.totalDays),
          percentage: totalApprovedDays > 0 ? Math.round((t.totalDays / totalApprovedDays) * 100) : 0,
        }))
        .sort((a, b) => b.totalDays - a.totalDays);

      // Calculate balance summary
      const totalEntitled = balances?.reduce(
        (sum, b) => sum + Number(b.entitled_days) + Number(b.carried_forward_days) + Number(b.adjusted_days),
        0
      ) || 0;
      const totalUsed = balances?.reduce((sum, b) => sum + Number(b.used_days), 0) || 0;

      const balanceSummary: BalanceSummary = {
        totalEntitled: Math.round(totalEntitled),
        totalUsed: Math.round(totalUsed),
        totalAvailable: Math.round(totalEntitled - totalUsed),
        utilizationRate: totalEntitled > 0 ? Math.round((totalUsed / totalEntitled) * 100) : 0,
      };

      return {
        monthlyTrends,
        departmentUsage,
        leaveTypeDistribution,
        balanceSummary,
        totalApplications: applications?.length || 0,
        approvedApplications: applications?.filter((a) => a.status === "approved").length || 0,
      };
    },
  });
}
