import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, Briefcase, MapPin, Pencil, X, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS, ROLE_LABELS, type AppRole } from "@/lib/constants";
import type { Employee } from "@/hooks/useEmployee";

interface EmployeeProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  userRole?: AppRole;
}

export function EmployeeProfileDialog({
  open,
  onOpenChange,
  employee,
  userRole,
}: EmployeeProfileDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employmentType, setEmploymentType] = useState<"full_time" | "part_time" | "contract">("full_time");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dateOfJoining, setDateOfJoining] = useState<Date | undefined>();
  const [probationEndDate, setProbationEndDate] = useState<Date | undefined>();
  const [workLocation, setWorkLocation] = useState("");
  const [state, setState] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");

  // Fetch departments
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

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      setFirstName(employee.profiles?.first_name || "");
      setLastName(employee.profiles?.last_name || "");
      setPhone(employee.profiles?.phone || "");
      setEmployeeId(employee.employee_id);
      setEmploymentType(employee.employment_type);
      setGender(employee.gender || "");
      setDateOfJoining(employee.date_of_joining ? parseISO(employee.date_of_joining) : undefined);
      setProbationEndDate(employee.probation_end_date ? parseISO(employee.probation_end_date) : undefined);
      setWorkLocation(employee.work_location || "");
      setState(employee.state || "");
      setDepartmentId(employee.department_id || "");
    }
    setIsEditing(false);
  }, [employee, open]);

  const updateEmployee = useMutation({
    mutationFn: async () => {
      if (!employee) return;

      // Update profile
      if (employee.user_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim() || null,
          })
          .eq("id", employee.user_id);

        if (profileError) throw profileError;
      }

      // Update employee
      const { error: employeeError } = await supabase
        .from("employees")
        .update({
          employee_id: employeeId.trim(),
          employment_type: employmentType,
          gender: gender || null,
          date_of_joining: dateOfJoining ? format(dateOfJoining, "yyyy-MM-dd") : employee.date_of_joining,
          probation_end_date: probationEndDate ? format(probationEndDate, "yyyy-MM-dd") : null,
          work_location: workLocation.trim() || null,
          state: state.trim() || null,
          department_id: departmentId || null,
        })
        .eq("id", employee.id);

      if (employeeError) throw employeeError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      toast.success("Employee updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    },
  });

  if (!employee) return null;

  const fullName = employee.profiles
    ? `${employee.profiles.first_name} ${employee.profiles.last_name}`
    : "Unknown";
  const initials = employee.profiles
    ? `${employee.profiles.first_name[0]}${employee.profiles.last_name[0]}`
    : "?";

  const canEdit = userRole === "admin" || userRole === "hr";

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim() || !employeeId.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateEmployee.mutate();
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form
    if (employee) {
      setFirstName(employee.profiles?.first_name || "");
      setLastName(employee.profiles?.last_name || "");
      setPhone(employee.profiles?.phone || "");
      setEmployeeId(employee.employee_id);
      setEmploymentType(employee.employment_type);
      setGender(employee.gender || "");
      setDateOfJoining(employee.date_of_joining ? parseISO(employee.date_of_joining) : undefined);
      setProbationEndDate(employee.probation_end_date ? parseISO(employee.probation_end_date) : undefined);
      setWorkLocation(employee.work_location || "");
      setState(employee.state || "");
      setDepartmentId(employee.department_id || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{fullName}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <code className="text-sm">{employee.employee_id}</code>
                  <Badge variant="secondary">{employee.departments?.name || "Unassigned"}</Badge>
                </DialogDescription>
              </div>
            </div>
            {canEdit && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateEmployee.isPending}>
                  <Check className="h-4 w-4 mr-2" />
                  {updateEmployee.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Employment</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Location</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{employee.profiles?.first_name || "-"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{employee.profiles?.last_name || "-"}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm py-2 text-muted-foreground">
                  {employee.profiles?.email || "-"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                ) : (
                  <p className="text-sm py-2">{employee.profiles?.phone || "-"}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 capitalize">{employee.gender || "-"}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                {isEditing ? (
                  <Input
                    id="employeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">
                    <code>{employee.employee_id}</code>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <Select value={departmentId} onValueChange={setDepartmentId}>
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
                ) : (
                  <p className="text-sm py-2">{employee.departments?.name || "-"}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                {isEditing ? (
                  <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as typeof employmentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2">{EMPLOYMENT_TYPE_LABELS[employee.employment_type]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Reporting Manager</Label>
                <p className="text-sm py-2">
                  {employee.reporting_manager?.profiles
                    ? `${employee.reporting_manager.profiles.first_name} ${employee.reporting_manager.profiles.last_name}`
                    : "-"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date of Joining</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfJoining && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfJoining ? format(dateOfJoining, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfJoining}
                        onSelect={setDateOfJoining}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="text-sm py-2">
                    {employee.date_of_joining
                      ? format(parseISO(employee.date_of_joining), "PPP")
                      : "-"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Probation End Date</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !probationEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {probationEndDate ? format(probationEndDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={probationEndDate}
                        onSelect={setProbationEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="text-sm py-2">
                    {employee.probation_end_date
                      ? format(parseISO(employee.probation_end_date), "PPP")
                      : "-"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div>
                <Badge variant={employee.is_active ? "default" : "secondary"}>
                  {employee.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="workLocation">Work Location</Label>
              {isEditing ? (
                <Input
                  id="workLocation"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g., Mumbai Office"
                />
              ) : (
                <p className="text-sm py-2">{employee.work_location || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., Maharashtra"
                />
              ) : (
                <p className="text-sm py-2">{employee.state || "-"}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
