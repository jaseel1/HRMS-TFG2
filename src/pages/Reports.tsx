import { BarChart3, TrendingUp, PieChart, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveAnalytics } from "@/hooks/useLeaveAnalytics";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

export default function Reports() {
  const { role } = useAuth();
  const { data: analytics, isLoading } = useLeaveAnalytics();

  const currentYear = new Date().getFullYear();

  // Only HR, Admin, and Finance should see full reports
  const canViewReports = role && ["admin", "hr", "finance"].includes(role);

  if (!canViewReports) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view reports. Contact your HR or Admin.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Leave statistics and trends for {currentYear}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Applications"
                value={analytics?.totalApplications || 0}
                description="Leave requests this year"
                icon={TrendingUp}
              />
              <StatCard
                title="Approved Leaves"
                value={analytics?.approvedApplications || 0}
                description="Successfully approved"
                icon={BarChart3}
              />
              <StatCard
                title="Days Used"
                value={analytics?.balanceSummary.totalUsed || 0}
                description="Total days taken"
                icon={Users}
              />
              <StatCard
                title="Utilization Rate"
                value={`${analytics?.balanceSummary.utilizationRate || 0}%`}
                description="Of entitled days used"
                icon={PieChart}
              />
            </>
          )}
        </div>

        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Leave Trends</CardTitle>
            <CardDescription>Leave days by status across months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.monthlyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Approved"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="Pending"
                  />
                  <Line
                    type="monotone"
                    dataKey="rejected"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    name="Rejected"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Department Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Department Leave Usage</CardTitle>
              <CardDescription>Approved leave days by department</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : analytics?.departmentUsage.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No department data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.departmentUsage || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="department" type="category" width={100} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`${value} days`, "Total"]}
                    />
                    <Bar dataKey="totalDays" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Leave Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Type Distribution</CardTitle>
              <CardDescription>Breakdown by leave category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : analytics?.leaveTypeDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No leave data available
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics?.leaveTypeDistribution || []}
                        dataKey="totalDays"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {analytics?.leaveTypeDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`${value} days`, "Total"]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {analytics?.leaveTypeDistribution.map((type, index) => (
                      <div key={type.code} className="flex items-center gap-2 text-sm">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="flex-1">{type.name}</span>
                        <span className="font-medium">{type.totalDays}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Leave Balance Summary</CardTitle>
            <CardDescription>Aggregate leave balance across all employees</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Entitled</p>
                  <p className="text-3xl font-bold mt-1">
                    {analytics?.balanceSummary.totalEntitled || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">days across all employees</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Used</p>
                  <p className="text-3xl font-bold mt-1 text-primary">
                    {analytics?.balanceSummary.totalUsed || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">days taken this year</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Available</p>
                  <p className="text-3xl font-bold mt-1">
                    {analytics?.balanceSummary.totalAvailable || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">days remaining</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
