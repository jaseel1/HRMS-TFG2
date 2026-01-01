import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { EmployeeCredentialsDialog } from "./EmployeeCredentialsDialog";

const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  departmentId: z.string().min(1, "Department is required"),
  employmentType: z.enum(["full_time", "part_time", "contract"]),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  gender: z.enum(["male", "female", "other"]).optional(),
  workLocation: z.string().optional(),
  state: z.string().optional(),
});

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{
    name: string;
    email: string;
    tempPassword: string;
    emailSent: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    employmentType: "full_time" as const,
    dateOfJoining: "",
    gender: "" as "male" | "female" | "other" | "",
    workLocation: "",
    state: "",
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = employeeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to create employee (uses service role to bypass RLS)
      const { data, error } = await supabase.functions.invoke("create-employee", {
        body: {
          employeeId: formData.employeeId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          departmentId: formData.departmentId,
          employmentType: formData.employmentType,
          dateOfJoining: formData.dateOfJoining,
          gender: formData.gender || null,
          workLocation: formData.workLocation || null,
          state: formData.state || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Store credentials for display
      setCredentials({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        tempPassword: data.tempPassword,
        emailSent: data.emailSent,
      });

      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
      resetForm();
      setShowCredentials(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add employee",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      departmentId: "",
      employmentType: "full_time",
      dateOfJoining: "",
      gender: "",
      workLocation: "",
      state: "",
    });
    setErrors({});
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee record. An account will be created with a temporary password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                placeholder="EMP001"
                value={formData.employeeId}
                onChange={(e) => updateField("employeeId", e.target.value)}
              />
              {errors.employeeId && (
                <p className="text-sm text-destructive">{errors.employeeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining *</Label>
              <Input
                id="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => updateField("dateOfJoining", e.target.value)}
              />
              {errors.dateOfJoining && (
                <p className="text-sm text-destructive">{errors.dateOfJoining}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => updateField("departmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-destructive">{errors.departmentId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => updateField("employmentType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => updateField("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Karnataka"
                value={formData.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workLocation">Work Location</Label>
            <Input
              id="workLocation"
              placeholder="Bangalore"
              value={formData.workLocation}
              onChange={(e) => updateField("workLocation", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <EmployeeCredentialsDialog
        open={showCredentials}
        onOpenChange={setShowCredentials}
        credentials={credentials}
      />
    </Dialog>
  );
}
