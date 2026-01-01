import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaveTypes, useApplyLeave, useMyLeaveBalances } from "@/hooks/useLeaves";
import { useEmployee } from "@/hooks/useEmployee";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ApplyLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyLeaveDialog({ open, onOpenChange }: ApplyLeaveDialogProps) {
  const { toast } = useToast();
  const { data: leaveTypes } = useLeaveTypes();
  const { data: balances } = useMyLeaveBalances();
  const { data: employee } = useEmployee();
  const applyLeave = useApplyLeave();

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const employeeGender = employee?.gender;

  // Check if leave type is applicable based on gender
  const isLeaveTypeApplicable = (genderSpecific: string | null) => {
    if (!genderSpecific) return true;
    if (!employeeGender) return true;
    return genderSpecific === employeeGender;
  };

  const selectedLeaveType = leaveTypes?.find((lt) => lt.id === leaveTypeId);
  const balance = balances?.find((b) => b.leave_type_id === leaveTypeId);
  const availableBalance = balance 
    ? balance.entitled_days + balance.carried_forward_days + balance.adjusted_days - balance.used_days
    : selectedLeaveType?.entitlement_days || 0;

  const daysCount = startDate && endDate 
    ? differenceInDays(endDate, startDate) + 1 
    : 0;

  const isOverBalance = daysCount > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveTypeId || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        variant: "destructive",
        title: "Invalid dates",
        description: "End date must be after start date",
      });
      return;
    }

    try {
      await applyLeave.mutateAsync({
        leave_type_id: leaveTypeId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        days_count: daysCount,
        reason,
      });

      toast({
        title: "Leave applied",
        description: "Your leave request has been submitted for approval",
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to apply for leave",
      });
    }
  };

  const resetForm = () => {
    setLeaveTypeId("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>
            Submit a new leave request for approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes?.map((lt) => {
                  const isApplicable = isLeaveTypeApplicable(lt.gender_specific);
                  return (
                    <SelectItem 
                      key={lt.id} 
                      value={lt.id} 
                      disabled={!isApplicable}
                      className={cn(!isApplicable && "opacity-50")}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lt.name}</span>
                        <code className="text-xs text-muted-foreground">({lt.code})</code>
                        {!isApplicable && (
                          <span className="text-xs text-muted-foreground">(Not Applicable)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedLeaveType && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Available:</span>
                <Badge variant={isOverBalance ? "destructive" : "secondary"}>
                  {availableBalance} days
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && (!endDate || endDate < date)) {
                        setEndDate(date);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {daysCount > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Days</span>
                <span className="font-semibold">{daysCount} day(s)</span>
              </div>
              {isOverBalance && (
                <p className="mt-2 text-sm text-destructive">
                  ⚠️ This exceeds your available balance. {daysCount - availableBalance} day(s) will be marked as LOP.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              placeholder="Provide a reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={applyLeave.isPending}>
              {applyLeave.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
