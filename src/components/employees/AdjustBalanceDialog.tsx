import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEmployeeLeaveBalances, useAdjustLeaveBalance } from "@/hooks/useLeaveBalanceAdjustment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Employee {
  id: string;
  employee_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const formSchema = z.object({
  balance_id: z.string().min(1, "Please select a leave type"),
  adjustment: z.coerce.number(),
  reason: z.string().trim().min(1, "Please provide a reason").max(500, "Reason must be less than 500 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  employee,
}: AdjustBalanceDialogProps) {
  const { data: balances, isLoading: balancesLoading } = useEmployeeLeaveBalances(
    open ? employee?.id || null : null
  );
  const adjustBalance = useAdjustLeaveBalance();
  const [selectedBalance, setSelectedBalance] = useState<typeof balances extends (infer T)[] ? T | null : null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance_id: "",
      adjustment: 0,
      reason: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedBalance(null);
    }
  }, [open, form]);

  // Update selected balance when balance_id changes
  const watchedBalanceId = form.watch("balance_id");
  useEffect(() => {
    if (watchedBalanceId && balances) {
      const balance = balances.find((b) => b.id === watchedBalanceId);
      setSelectedBalance(balance || null);
      if (balance) {
        form.setValue("adjustment", balance.adjusted_days);
      }
    }
  }, [watchedBalanceId, balances, form]);

  async function onSubmit(data: FormData) {
    try {
      await adjustBalance.mutateAsync({
        balanceId: data.balance_id,
        adjustedDays: data.adjustment,
        reason: data.reason,
      });

      toast.success("Leave balance adjusted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to adjust balance");
      console.error("Adjust balance error:", error);
    }
  }

  const employeeName = employee?.profiles
    ? `${employee.profiles.first_name} ${employee.profiles.last_name}`
    : "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Leave Balance</DialogTitle>
          <DialogDescription>
            Adjust leave balance for {employeeName} ({employee?.employee_id})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="balance_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {balancesLoading ? (
                        <div className="p-2 space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : balances?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No leave balances found for this employee
                        </div>
                      ) : (
                        balances?.map((balance) => (
                          <SelectItem key={balance.id} value={balance.id}>
                            {balance.leave_type_name} ({balance.leave_type_code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBalance && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entitled Days</span>
                  <span className="font-medium">{selectedBalance.entitled_days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carried Forward</span>
                  <span className="font-medium">{selectedBalance.carried_forward_days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used Days</span>
                  <span className="font-medium">{selectedBalance.used_days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Adjustment</span>
                  <span className="font-medium">{selectedBalance.adjusted_days}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-bold">{selectedBalance.available}</span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="adjustment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment (Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use positive values to add days, negative to deduct. This replaces the current adjustment value.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this adjustment..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adjustBalance.isPending}>
                {adjustBalance.isPending ? "Saving..." : "Save Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
