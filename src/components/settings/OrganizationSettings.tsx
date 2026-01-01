import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { useOrganizationSettings, useUpdateOrganizationSettings } from "@/hooks/useOrganizationSettings";

export function OrganizationSettings() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateSettings = useUpdateOrganizationSettings();
  
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("");
  const [workingDays, setWorkingDays] = useState("");

  useEffect(() => {
    if (settings) {
      setOrgName(settings.name || "");
      setOrgEmail(settings.email || "");
      setOrgAddress(settings.address || "");
      setFiscalYearStart(settings.fiscal_year_start || "");
      setWorkingDays(settings.working_days || "");
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;
    
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        name: orgName,
        email: orgEmail || null,
        address: orgAddress || null,
        fiscal_year_start: fiscalYearStart || null,
        working_days: workingDays || null,
      });
      toast.success("Organization settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Settings
        </CardTitle>
        <CardDescription>
          Configure your organization's basic information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgEmail">HR Contact Email</Label>
            <Input
              id="orgEmail"
              type="email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              placeholder="hr@company.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="orgAddress">Office Address</Label>
          <Textarea
            id="orgAddress"
            value={orgAddress}
            onChange={(e) => setOrgAddress(e.target.value)}
            placeholder="Enter office address"
            rows={2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fiscalYear">Fiscal Year Starts</Label>
            <Input
              id="fiscalYear"
              value={fiscalYearStart}
              onChange={(e) => setFiscalYearStart(e.target.value)}
              placeholder="e.g., April"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workingDays">Working Days</Label>
            <Input
              id="workingDays"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
              placeholder="e.g., Monday - Friday"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
