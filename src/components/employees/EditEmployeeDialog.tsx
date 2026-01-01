import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Employee } from "@/hooks/useEmployee";
import { INDIAN_STATES } from "@/lib/constants";

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EditEmployeeDialog({ open, onOpenChange, employee }: EditEmployeeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    designation: "",
    department_id: "",
    work_location: "",
    work_mode: "",
    state: "",
    personal_email: "",
    linkedin_url: "",
    blood_group: "",
    gender: "",
    employment_type: "",
    date_of_joining: "",
    probation_end_date: "",
    current_address: "",
    permanent_address: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    about_me: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.profiles?.first_name || "",
        last_name: employee.profiles?.last_name || "",
        phone: employee.profiles?.phone || "",
        designation: employee.designation || "",
        department_id: employee.department_id || "",
        work_location: employee.work_location || "",
        work_mode: employee.work_mode || "",
        state: employee.state || "",
        personal_email: employee.personal_email || "",
        linkedin_url: employee.linkedin_url || "",
        blood_group: employee.blood_group || "",
        gender: employee.gender || "",
        employment_type: employee.employment_type || "full_time",
        date_of_joining: employee.date_of_joining || "",
        probation_end_date: employee.probation_end_date || "",
        current_address: employee.current_address || "",
        permanent_address: employee.permanent_address || "",
        emergency_contact_name: employee.emergency_contact_name || "",
        emergency_contact_number: employee.emergency_contact_number || "",
        about_me: employee.about_me || "",
      });
    }
  }, [employee]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!employee) return;

      // Update profile
      if (employee.user_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || null,
          })
          .eq("id", employee.user_id);

        if (profileError) throw profileError;
      }

      // Update employee
      const { error: employeeError } = await supabase
        .from("employees")
        .update({
          designation: formData.designation || null,
          department_id: formData.department_id || null,
          work_location: formData.work_location || null,
          work_mode: formData.work_mode || null,
          state: formData.state || null,
          personal_email: formData.personal_email || null,
          linkedin_url: formData.linkedin_url || null,
          blood_group: formData.blood_group || null,
          gender: (formData.gender as "male" | "female" | "other") || null,
          employment_type: formData.employment_type as "full_time" | "part_time" | "contract" || "full_time",
          date_of_joining: formData.date_of_joining || null,
          probation_end_date: formData.probation_end_date || null,
          current_address: formData.current_address || null,
          permanent_address: formData.permanent_address || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_number: formData.emergency_contact_number || null,
          about_me: formData.about_me || null,
        })
        .eq("id", employee.id);

      if (employeeError) throw employeeError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      toast({ title: "Employee updated successfully" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      toast({ variant: "destructive", title: "First name and last name are required" });
      return;
    }
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Personal Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal_email">Personal Email</Label>
                <Input
                  id="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={(e) => setFormData((p) => ({ ...p, personal_email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(v) => setFormData((p) => ({ ...p, blood_group: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
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
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData((p) => ({ ...p, linkedin_url: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Employment Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(v) => setFormData((p) => ({ ...p, department_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_mode">Work Mode</Label>
                <Select
                  value={formData.work_mode}
                  onValueChange={(v) => setFormData((p) => ({ ...p, work_mode: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_site">On-Site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_location">Work Location</Label>
                <Input
                  id="work_location"
                  value={formData.work_location}
                  onChange={(e) => setFormData((p) => ({ ...p, work_location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(v) => setFormData((p) => ({ ...p, state: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(v) => setFormData((p) => ({ ...p, employment_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input
                  id="date_of_joining"
                  type="date"
                  value={formData.date_of_joining}
                  onChange={(e) => setFormData((p) => ({ ...p, date_of_joining: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probation_end_date">Probation End Date</Label>
                <Input
                  id="probation_end_date"
                  type="date"
                  value={formData.probation_end_date}
                  onChange={(e) => setFormData((p) => ({ ...p, probation_end_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Address Information</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_address">Current Address</Label>
                <Textarea
                  id="current_address"
                  value={formData.current_address}
                  onChange={(e) => setFormData((p) => ({ ...p, current_address: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permanent_address">Permanent Address</Label>
                <Textarea
                  id="permanent_address"
                  value={formData.permanent_address}
                  onChange={(e) => setFormData((p) => ({ ...p, permanent_address: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="font-medium">Emergency Contact</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData((p) => ({ ...p, emergency_contact_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_number">Contact Number</Label>
                <Input
                  id="emergency_contact_number"
                  value={formData.emergency_contact_number}
                  onChange={(e) => setFormData((p) => ({ ...p, emergency_contact_number: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-2">
            <Label htmlFor="about_me">About</Label>
            <Textarea
              id="about_me"
              value={formData.about_me}
              onChange={(e) => setFormData((p) => ({ ...p, about_me: e.target.value }))}
              rows={3}
              placeholder="Brief introduction..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
