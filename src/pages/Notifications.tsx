import { useState } from "react";
import { format } from "date-fns";
import { Bell, Check, CheckCheck, Filter, Inbox } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

type FilterType = "all" | "unread" | "read";
type NotificationType = "all" | "leave_status" | "pending_approval";

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  leave_status: "Leave Status",
  pending_approval: "Pending Approval",
};

export default function Notifications() {
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");
  const [filterType, setFilterType] = useState<NotificationType>("all");
  
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const filteredNotifications = notifications.filter((notification) => {
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notification.is_read) ||
      (filterStatus === "read" && notification.is_read);

    const typeMatch =
      filterType === "all" || notification.type === filterType;

    return statusMatch && typeMatch;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave_status":
        return <Bell className="h-5 w-5 text-primary" />;
      case "pending_approval":
        return <CheckCheck className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              View and manage all your notifications
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read ({unreadCount})
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <div className="flex flex-wrap gap-3">
                <Select
                  value={filterStatus}
                  onValueChange={(value: FilterType) => setFilterStatus(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterType}
                  onValueChange={(value: NotificationType) => setFilterType(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="leave_status">Leave Status</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filterStatus !== "all" || filterType !== "all"
                    ? "No notifications match your filters"
                    : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-4 p-4 transition-colors hover:bg-muted/50",
                      !notification.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium truncate">
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="shrink-0">
                              {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
                            </Badge>
                            {!notification.is_read && (
                              <Badge variant="default" className="shrink-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), "PPp")}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => handleMarkAsRead(notification)}
                            disabled={markAsRead.isPending}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
