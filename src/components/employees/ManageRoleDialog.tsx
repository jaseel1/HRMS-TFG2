import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS, type AppRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ManageRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: string;
    user_id: string | null;
    employee_id: string;
    profiles?: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

const AVAILABLE_ROLES: { role: AppRole; description: string }[] = [
  { role: "admin", description: "Full system access, can manage all settings and users" },
  { role: "hr", description: "Manage employees, leave policies, and approve all leaves" },
  { role: "finance", description: "Access to reimbursements and financial reports" },
  { role: "manager", description: "Approve team member leaves, view team data" },
  { role: "team_member", description: "Apply for leave, view own data" },
];

export function ManageRoleDialog({ open, onOpenChange, employee }: ManageRoleDialogProps) {
  const { toast } = useToast();
  const { role: currentUserRole } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  // Fetch current roles for this employee
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles", employee?.user_id],
    queryFn: async () => {
      if (!employee?.user_id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", employee.user_id);
      if (error) throw error;
      return data;
    },
    enabled: open && !!employee?.user_id,
  });

  // Get the primary (highest) role
  const primaryRole = userRoles?.sort((a, b) => {
    const order = ["admin", "hr", "finance", "manager", "team_member"];
    return order.indexOf(a.role) - order.indexOf(b.role);
  })[0]?.role as AppRole | undefined;

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // First, delete existing roles (except team_member as base)
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole }]);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Role updated successfully" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    if (!employee?.user_id || !selectedRole) return;
    updateRoleMutation.mutate({ userId: employee.user_id, newRole: selectedRole });
  };

  // Reset selected role when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && primaryRole) {
      setSelectedRole(primaryRole);
    }
    onOpenChange(isOpen);
  };

  // Determine which roles the current user can assign
  const canAssignRole = (role: AppRole): boolean => {
    if (currentUserRole === "admin") return true;
    if (currentUserRole === "hr") return role !== "admin";
    return false;
  };

  const employeeName = employee?.profiles
    ? `${employee.profiles.first_name} ${employee.profiles.last_name}`
    : "Employee";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Role
          </DialogTitle>
          <DialogDescription>
            Assign a role to {employeeName} ({employee?.employee_id})
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !employee?.user_id ? (
          <div className="py-8 text-center text-muted-foreground">
            This employee doesn't have a linked user account yet.
          </div>
        ) : (
          <div className="space-y-2">
            {AVAILABLE_ROLES.map(({ role, description }) => {
              const isSelected = selectedRole === role || (!selectedRole && primaryRole === role);
              const isCurrent = primaryRole === role;
              const canAssign = canAssignRole(role);

              return (
                <button
                  key={role}
                  type="button"
                  disabled={!canAssign}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    isSelected && "border-primary bg-primary/5",
                    !isSelected && canAssign && "hover:border-muted-foreground/50",
                    !canAssign && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      isSelected && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ROLE_LABELS[role]}</span>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {role === "admin" && currentUserRole !== "admin" && (
                        <Badge variant="outline" className="text-xs">
                          Admin only
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !employee?.user_id ||
              !selectedRole ||
              selectedRole === primaryRole ||
              updateRoleMutation.isPending
            }
          >
            {updateRoleMutation.isPending ? "Saving..." : "Save Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
