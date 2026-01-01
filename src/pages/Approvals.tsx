import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Clock, MessageSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePendingApprovals, useApproveLeave } from "@/hooks/useLeaves";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Approvals() {
  const { role } = useAuth();
  const { toast } = useToast();
  const { data: pendingApprovals, isLoading } = usePendingApprovals();
  const approveLeave = useApproveLeave();

  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");

  const handleAction = async () => {
    if (!selectedApplication || !actionType) return;

    try {
      await approveLeave.mutateAsync({
        applicationId: selectedApplication,
        action: actionType,
        remarks,
      });

      toast({
        title: actionType === "approve" ? "Leave approved" : "Leave rejected",
        description: `The leave request has been ${actionType === "approve" ? "approved" : "rejected"}.`,
      });

      setSelectedApplication(null);
      setActionType(null);
      setRemarks("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process leave request",
      });
    }
  };

  const openActionDialog = (applicationId: string, action: "approve" | "reject") => {
    setSelectedApplication(applicationId);
    setActionType(action);
    setRemarks("");
  };

  if (!["manager", "hr", "admin"].includes(role || "")) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">You don't have permission to view this page</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and process leave requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Requests Awaiting Approval</CardTitle>
            <CardDescription>
              {pendingApprovals?.length || 0} request(s) pending your action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : !pendingApprovals?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Check className="mb-4 h-12 w-12 text-success/50" />
                <p className="text-muted-foreground">No pending approvals</p>
                <p className="text-sm text-muted-foreground">
                  All caught up! New requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((app) => {
                  const employeeName = app.employees?.profiles
                    ? `${app.employees.profiles.first_name} ${app.employees.profiles.last_name}`
                    : "Unknown";
                  const initials = app.employees?.profiles
                    ? `${app.employees.profiles.first_name[0]}${app.employees.profiles.last_name[0]}`
                    : "?";

                  return (
                    <div
                      key={app.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.employees?.employee_id}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{app.leave_types?.name}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(app.start_date), "MMM d")} -{" "}
                              {format(new Date(app.end_date), "MMM d, yyyy")}
                            </span>
                            <Badge variant="secondary">{app.days_count} day(s)</Badge>
                          </div>
                          {app.reason && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              <MessageSquare className="mr-1 inline h-3 w-3" />
                              {app.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => openActionDialog(app.id, "reject")}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => openActionDialog(app.id, "approve")}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog 
        open={!!selectedApplication && !!actionType} 
        onOpenChange={() => {
          setSelectedApplication(null);
          setActionType(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this leave request?"
                : "Are you sure you want to reject this leave request?"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (optional)</label>
              <Textarea
                placeholder="Add any comments or notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedApplication(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              className={actionType === "approve" ? "bg-success hover:bg-success/90" : ""}
              onClick={handleAction}
              disabled={approveLeave.isPending}
            >
              {approveLeave.isPending
                ? "Processing..."
                : actionType === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
