import { useState, useEffect } from "react";
import { ExternalLink, FileText, Save } from "lucide-react";
import { useOrganizationSettings, useUpdateOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function PolicyDocuments() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateSettings = useUpdateOrganizationSettings();

  const [leavePolicyUrl, setLeavePolicyUrl] = useState("");
  const [employeeHandbookUrl, setEmployeeHandbookUrl] = useState("");
  const [poshPolicyUrl, setPoshPolicyUrl] = useState("");
  const [cppUrl, setCppUrl] = useState("");

  useEffect(() => {
    if (settings) {
      setLeavePolicyUrl(settings.leave_policy_url || "");
      setEmployeeHandbookUrl(settings.employee_handbook_url || "");
      setPoshPolicyUrl(settings.posh_policy_url || "");
      setCppUrl(settings.cpp_url || "");
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        leave_policy_url: leavePolicyUrl || null,
        employee_handbook_url: employeeHandbookUrl || null,
        posh_policy_url: poshPolicyUrl || null,
        cpp_url: cppUrl || null,
      });
      toast({ title: "Policy documents updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const policyItems = [
    {
      label: "Leave Policy",
      value: leavePolicyUrl,
      onChange: setLeavePolicyUrl,
      placeholder: "https://docs.google.com/document/d/...",
      description: "Link to the company leave policy document",
    },
    {
      label: "Employee Handbook",
      value: employeeHandbookUrl,
      onChange: setEmployeeHandbookUrl,
      placeholder: "https://docs.google.com/document/d/...",
      description: "Link to the employee handbook",
    },
    {
      label: "POSH Policy",
      value: poshPolicyUrl,
      onChange: setPoshPolicyUrl,
      placeholder: "https://docs.google.com/document/d/...",
      description: "Prevention of Sexual Harassment policy",
    },
    {
      label: "CPP (Company Policy & Procedure)",
      value: cppUrl,
      onChange: setCppUrl,
      placeholder: "https://docs.google.com/document/d/...",
      description: "Company policies and procedures document",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Policy Documents</CardTitle>
        </div>
        <CardDescription>
          Add Google Doc links for company policies. These will be accessible to all employees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {policyItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <Label htmlFor={item.label}>{item.label}</Label>
            <div className="flex gap-2">
              <Input
                id={item.label}
                placeholder={item.placeholder}
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                className="flex-1"
              />
              {item.value && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(item.value, "_blank")}
                  title="Open document"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="w-full sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? "Saving..." : "Save Documents"}
        </Button>
      </CardContent>
    </Card>
  );
}
