import { useState } from "react";
import { format } from "date-fns";
import { Users, Calendar, Clock, TrendingUp, Mail, Building, Briefcase, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useTeamMembers, useTeamStats, useTeamLeaveRequests, useIsReportingManager } from "@/hooks/useTeamData";
import { useApproveLeave } from "@/hooks/useLeaves";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

interface TeamMemberBalance {
  memberId: string;
  balances: {
    id: string;
    name: string;
    code: string;
    entitled: number;
    used: number;
    available: number;
  }[];
}

interface TeamMemberStats {
  memberId: string;
  totalLeavesTaken: number;
  pendingRequests: number;
  lopDays: number;
  attendanceRate: number;
}

// Hook to fetch leave balances for all team members
function useTeamMemberBalances(teamMemberIds: string[]) {
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["team-member-balances", teamMemberIds, currentYear],
    queryFn: async (): Promise<Map<string, TeamMemberBalance["balances"]>> => {
      if (!teamMemberIds || teamMemberIds.length === 0) {
        return new Map();
      }

      const { data, error } = await supabase
        .from("leave_balances")
        .select(`
          employee_id,
          entitled_days,
          used_days,
          carried_forward_days,
          adjusted_days,
          leave_types (
            id,
            name,
            code
          )
        `)
        .in("employee_id", teamMemberIds)
        .eq("year", currentYear);

      if (error) throw error;

      const balanceMap = new Map<string, TeamMemberBalance["balances"]>();

      (data || []).forEach((balance) => {
        const leaveType = balance.leave_types as { id: string; name: string; code: string } | null;
        const memberId = balance.employee_id;
        
        if (!balanceMap.has(memberId)) {
          balanceMap.set(memberId, []);
        }

        const entitled = Number(balance.entitled_days) + Number(balance.carried_forward_days) + Number(balance.adjusted_days);
        const used = Number(balance.used_days);

        balanceMap.get(memberId)!.push({
          id: leaveType?.id || "",
          name: leaveType?.name || "Unknown",
          code: leaveType?.code || "??",
          entitled,
          used,
          available: Math.max(0, entitled - used),
        });
      });

      return balanceMap;
    },
    enabled: teamMemberIds.length > 0,
  });
}

// Hook to fetch stats for all team members
function useTeamMemberStats(teamMemberIds: string[]) {
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["team-member-stats", teamMemberIds, currentYear],
    queryFn: async (): Promise<Map<string, TeamMemberStats>> => {
      if (!teamMemberIds || teamMemberIds.length === 0) {
        return new Map();
      }

      // Get all leave applications for team members this year
      const { data: applications, error } = await supabase
        .from("leave_applications")
        .select("employee_id, status, days_count, is_lop, lop_days")
        .in("employee_id", teamMemberIds)
        .gte("start_date", `${currentYear}-01-01`)
        .lte("end_date", `${currentYear}-12-31`);

      if (error) throw error;

      const statsMap = new Map<string, TeamMemberStats>();

      // Initialize stats for all team members
      teamMemberIds.forEach((id) => {
        statsMap.set(id, {
          memberId: id,
          totalLeavesTaken: 0,
          pendingRequests: 0,
          lopDays: 0,
          attendanceRate: 100,
        });
      });

      // Calculate stats from applications
      (applications || []).forEach((app) => {
        const stats = statsMap.get(app.employee_id);
        if (!stats) return;

        if (app.status === "approved") {
          stats.totalLeavesTaken += Number(app.days_count);
          if (app.is_lop) {
            stats.lopDays += Number(app.lop_days) || Number(app.days_count);
          }
        } else if (app.status === "pending") {
          stats.pendingRequests += 1;
        }
      });

      // Calculate attendance rate (simplified: based on working days this year)
      const today = new Date();
      const startOfYear = new Date(currentYear, 0, 1);
      const daysPassed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const workingDaysPassed = Math.floor(daysPassed * 5 / 7); // Approximate

      statsMap.forEach((stats) => {
        if (workingDaysPassed > 0) {
          stats.attendanceRate = Math.max(0, Math.round(((workingDaysPassed - stats.totalLeavesTaken) / workingDaysPassed) * 100));
        }
      });

      return statsMap;
    },
    enabled: teamMemberIds.length > 0,
  });
}

function TeamMemberCard({ 
  member, 
  balances, 
  stats 
}: { 
  member: { id: string; employee_id: string; first_name: string; last_name: string; email: string; department_name: string | null; employment_type: string; date_of_joining: string };
  balances: TeamMemberBalance["balances"] | undefined;
  stats: TeamMemberStats | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {member.first_name[0]}{member.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{member.first_name} {member.last_name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </CardDescription>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Building className="h-3.5 w-3.5" />
              {member.department_name || "No department"}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {member.employment_type.replace("_", " ")}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {format(new Date(member.date_of_joining), "MMM yyyy")}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats?.totalLeavesTaken ?? 0}</p>
              <p className="text-xs text-muted-foreground">Days Taken</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats?.pendingRequests ?? 0}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats?.lopDays ?? 0}</p>
              <p className="text-xs text-muted-foreground">LOP Days</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats?.attendanceRate ?? 100}%</p>
              <p className="text-xs text-muted-foreground">Attendance</p>
            </div>
          </div>

          <CollapsibleContent>
            {/* Leave Balances */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Leave Balances
              </h4>
              {balances && balances.length > 0 ? (
                <div className="space-y-3">
                  {balances.map((balance) => (
                    <div key={balance.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{balance.name} ({balance.code})</span>
                        <span className="font-medium">
                          {balance.available} / {balance.entitled} days
                        </span>
                      </div>
                      <Progress 
                        value={balance.entitled > 0 ? (balance.available / balance.entitled) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No leave balances found</p>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

export default function MyTeam() {
  const { role } = useAuth();
  const { data: employee, isLoading: employeeLoading } = useEmployee();
  const { data: isReportingManager, isLoading: isManagerLoading } = useIsReportingManager();
  
  // HR and Admin see all employees, managers only see their direct reports
  const showAllEmployees = role === "hr" || role === "admin";
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembers(showAllEmployees);
  const { data: teamStats, isLoading: teamStatsLoading } = useTeamStats(showAllEmployees);
  const { data: teamLeaveRequests, isLoading: teamLeavesLoading } = useTeamLeaveRequests("pending", showAllEmployees);
  const approveLeave = useApproveLeave();

  const teamMemberIds = teamMembers?.map((m) => m.id) || [];
  const { data: balancesMap, isLoading: balancesLoading } = useTeamMemberBalances(teamMemberIds);
  const { data: statsMap, isLoading: statsLoading } = useTeamMemberStats(teamMemberIds);

  const isLoading = employeeLoading || isManagerLoading;

  // Redirect non-managers (unless HR/Admin) to dashboard
  if (!isLoading && !isReportingManager && role !== "hr" && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {showAllEmployees ? "All Employees" : "My Team"}
          </h1>
          <p className="text-muted-foreground">
            {showAllEmployees 
              ? "View all employees, their leave balances, and approve requests."
              : "Manage your team members, view their leave balances, and approve requests."}
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teamStatsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamStats?.totalTeamMembers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{showAllEmployees ? "Total employees" : "Direct reports"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamStats?.onLeaveToday ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Members absent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamStats?.pendingApprovals ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting action</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Leaves</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamStats?.upcomingLeaves ?? 0}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs for Members and Requests */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="requests">
              Leave Requests
              {teamStats?.pendingApprovals && teamStats.pendingApprovals > 0 && (
                <Badge variant="secondary" className="ml-2">{teamStats.pendingApprovals}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {teamMembersLoading || balancesLoading || statsLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-16 rounded-lg" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {teamMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    balances={balancesMap?.get(member.id)}
                    stats={statsMap?.get(member.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members found.</p>
                  <p className="text-sm">Team members will appear here when employees are assigned to report to you.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
                <CardDescription>Review and approve leave requests from your team</CardDescription>
              </CardHeader>
              <CardContent>
                {teamLeavesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : teamLeaveRequests && teamLeaveRequests.length > 0 ? (
                  <div className="space-y-4">
                    {teamLeaveRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 last:pb-0 gap-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{request.employee_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.leave_type} ({request.leave_type_code}) · {format(new Date(request.start_date), "MMM d, yyyy")}
                            {request.start_date !== request.end_date && (
                              <> - {format(new Date(request.end_date), "MMM d, yyyy")}</>
                            )}
                            {" · "}{request.days_count} day{request.days_count !== 1 ? "s" : ""}
                          </p>
                          {request.reason && (
                            <p className="text-sm text-muted-foreground italic">
                              Reason: {request.reason}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Applied on {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              approveLeave.mutate(
                                { applicationId: request.id, action: "approve" },
                                {
                                  onSuccess: () => toast.success(`Leave approved for ${request.employee_name}`),
                                  onError: () => toast.error("Failed to approve leave"),
                                }
                              );
                            }}
                            disabled={approveLeave.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              approveLeave.mutate(
                                { applicationId: request.id, action: "reject" },
                                {
                                  onSuccess: () => toast.success(`Leave rejected for ${request.employee_name}`),
                                  onError: () => toast.error("Failed to reject leave"),
                                }
                              );
                            }}
                            disabled={approveLeave.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending leave requests</p>
                    <p className="text-sm">All caught up! New requests from your team will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
