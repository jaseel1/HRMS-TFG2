import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AssignManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: string;
    employee_id: string;
    reporting_manager_id: string | null;
    profiles?: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export function AssignManagerDialog({ open, onOpenChange, employee }: AssignManagerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

  // Fetch all employees who can be managers
  const { data: potentialManagers, isLoading } = useQuery({
    queryKey: ["potential-managers", employee?.id],
    queryFn: async () => {
      const { data: employeesData, error: empError } = await supabase
        .from("employees")
        .select("id, employee_id, user_id")
        .eq("is_active", true)
        .neq("id", employee?.id || "");

      if (empError) throw empError;

      // Fetch profiles separately
      const userIds = employeesData.map(e => e.user_id).filter(Boolean);
      const { data: profilesData, error: profError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profError) throw profError;

      // Merge the data
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      return employeesData.map(emp => ({
        ...emp,
        profiles: emp.user_id ? profilesMap.get(emp.user_id) : null,
      })).sort((a, b) => a.employee_id.localeCompare(b.employee_id));
    },
    enabled: open && !!employee,
  });

  const updateManagerMutation = useMutation({
    mutationFn: async ({ employeeId, managerId }: { employeeId: string; managerId: string | null }) => {
      const { error } = await supabase
        .from("employees")
        .update({ reporting_manager_id: managerId })
        .eq("id", employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Reporting manager updated" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && employee) {
      setSelectedManagerId(employee.reporting_manager_id);
    }
    onOpenChange(isOpen);
  };

  const handleSave = () => {
    if (!employee) return;
    updateManagerMutation.mutate({
      employeeId: employee.id,
      managerId: selectedManagerId,
    });
  };

  const handleRemoveManager = () => {
    if (!employee) return;
    updateManagerMutation.mutate({
      employeeId: employee.id,
      managerId: null,
    });
  };

  const employeeName = employee?.profiles
    ? `${employee.profiles.first_name} ${employee.profiles.last_name}`
    : "Employee";

  const currentManager = potentialManagers?.find((m) => m.id === employee?.reporting_manager_id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Reporting Manager
          </DialogTitle>
          <DialogDescription>
            Select a reporting manager for {employeeName} ({employee?.employee_id})
          </DialogDescription>
        </DialogHeader>

        {currentManager && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="mb-2 text-sm text-muted-foreground">Current Manager:</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {currentManager.profiles?.first_name?.[0]}
                    {currentManager.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {currentManager.profiles?.first_name} {currentManager.profiles?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{currentManager.employee_id}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleRemoveManager}
                disabled={updateManagerMutation.isPending}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <Command className="rounded-lg border">
            <CommandInput placeholder="Search employees..." />
            <CommandList className="max-h-64">
              <CommandEmpty>No employees found.</CommandEmpty>
              <CommandGroup>
                {potentialManagers?.map((manager) => {
                  const isSelected = selectedManagerId === manager.id;
                  const fullName = manager.profiles
                    ? `${manager.profiles.first_name} ${manager.profiles.last_name}`
                    : "Unknown";
                  const initials = manager.profiles
                    ? `${manager.profiles.first_name[0]}${manager.profiles.last_name[0]}`
                    : "?";

                  return (
                    <CommandItem
                      key={manager.id}
                      value={`${fullName} ${manager.employee_id}`}
                      onSelect={() => setSelectedManagerId(manager.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? "border-primary bg-primary" : ""
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{fullName}</p>
                          <p className="text-xs text-muted-foreground">{manager.employee_id}</p>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !selectedManagerId ||
              selectedManagerId === employee?.reporting_manager_id ||
              updateManagerMutation.isPending
            }
          >
            {updateManagerMutation.isPending ? "Saving..." : "Assign Manager"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
