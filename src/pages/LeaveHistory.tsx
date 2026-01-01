import { useState, useMemo } from "react";
import { format } from "date-fns";
import { History, Clock, CheckCircle, XCircle, AlertCircle, Filter, Download, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEAVE_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: AlertCircle,
};

const currentYear = new Date().getFullYear();

export default function LeaveHistory() {
  const { role } = useAuth();
  const { data: departments } = useDepartments();

  // Filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { data: leaveHistory, isLoading } = useLeaveHistory({
    year: selectedYear,
    status: selectedStatus,
    departmentId: selectedDepartment,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!leaveHistory) return { total: 0, approved: 0, rejected: 0, pending: 0, cancelled: 0 };
    
    return {
      total: leaveHistory.length,
      approved: leaveHistory.filter(l => l.status === "approved").length,
      rejected: leaveHistory.filter(l => l.status === "rejected").length,
      pending: leaveHistory.filter(l => l.status === "pending").length,
      cancelled: leaveHistory.filter(l => l.status === "cancelled").length,
    };
  }, [leaveHistory]);

  const isAdminOrHR = role === "admin" || role === "hr";
  const isManager = role === "manager";

  const getEmployeeName = (item: typeof leaveHistory extends (infer T)[] ? T : never) => {
    if (!item.employees?.profiles) return "Unknown";
    return `${item.employees.profiles.first_name} ${item.employees.profiles.last_name}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              Leave History
            </h1>
            <p className="text-muted-foreground">
              {isAdminOrHR 
                ? "Complete leave history for all employees" 
                : isManager 
                  ? "Leave history for you and your team members"
                  : "Your complete leave history"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.cancelled}</div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdminOrHR && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leave History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Applications</CardTitle>
            <CardDescription>
              {isAdminOrHR 
                ? "All leave applications across the organization"
                : isManager
                  ? "Leave applications from you and your team"
                  : "Your leave applications history"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !leaveHistory?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No leave applications found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {(isAdminOrHR || isManager) && <TableHead>Employee</TableHead>}
                      {isAdminOrHR && <TableHead>Department</TableHead>}
                      <TableHead>Leave Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveHistory.map((item) => {
                      const StatusIcon = statusIcons[item.status];
                      const statusColor = LEAVE_STATUS_COLORS[item.status];

                      return (
                        <TableRow key={item.id}>
                          {(isAdminOrHR || isManager) && (
                            <TableCell>
                              <div>
                                <p className="font-medium">{getEmployeeName(item)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.employees?.employee_id}
                                </p>
                              </div>
                            </TableCell>
                          )}
                          {isAdminOrHR && (
                            <TableCell>
                              <Badge variant="outline">
                                {item.employees?.departments?.name || "—"}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.leave_types?.name}</p>
                              <code className="text-xs text-muted-foreground">
                                {item.leave_types?.code}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(item.start_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{format(new Date(item.end_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <span className="font-medium">{item.days_count}</span>
                            {item.is_lop && item.lop_days && item.lop_days > 0 && (
                              <span className="text-xs text-destructive ml-1">
                                (LOP: {item.lop_days})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusColor === "muted" ? "secondary" : "default"}
                              className={cn(
                                "gap-1",
                                statusColor === "success" && "bg-success text-success-foreground",
                                statusColor === "warning" && "bg-warning text-warning-foreground",
                                statusColor === "destructive" && "bg-destructive text-destructive-foreground"
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="truncate text-sm text-muted-foreground" title={item.reason || undefined}>
                              {item.reason || "—"}
                            </p>
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {format(new Date(item.created_at), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
