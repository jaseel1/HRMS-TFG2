import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useNotificationPreferences, useUpdateNotificationPreferences, NotificationPreferences as NotificationPrefs } from "@/hooks/useNotificationPreferences";

interface NotificationSetting {
  key: keyof Omit<NotificationPrefs, "id">;
  label: string;
  description: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: "new_leave_request",
    label: "New Leave Requests",
    description: "Notify when an employee submits a new leave request",
  },
  {
    key: "leave_approved",
    label: "Leave Approved",
    description: "Notify employees when their leave is approved",
  },
  {
    key: "leave_rejected",
    label: "Leave Rejected",
    description: "Notify employees when their leave is rejected",
  },
  {
    key: "low_balance_alert",
    label: "Low Balance Alerts",
    description: "Notify employees when their leave balance is low",
  },
  {
    key: "upcoming_holiday",
    label: "Upcoming Holidays",
    description: "Send reminders about upcoming holidays",
  },
  {
    key: "probation_ending",
    label: "Probation Ending",
    description: "Notify HR when an employee's probation is about to end",
  },
];

export function NotificationPreferences() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  
  const [settings, setSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (prefs) {
      setSettings({
        new_leave_request: prefs.new_leave_request,
        leave_approved: prefs.leave_approved,
        leave_rejected: prefs.leave_rejected,
        low_balance_alert: prefs.low_balance_alert,
        upcoming_holiday: prefs.upcoming_holiday,
        probation_ending: prefs.probation_ending,
      });
    }
  }, [prefs]);

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!prefs?.id) return;
    
    try {
      await updatePrefs.mutateAsync({
        id: prefs.id,
        new_leave_request: settings.new_leave_request,
        leave_approved: settings.leave_approved,
        leave_rejected: settings.leave_rejected,
        low_balance_alert: settings.low_balance_alert,
        upcoming_holiday: settings.upcoming_holiday,
        probation_ending: settings.probation_ending,
      });
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure which notifications are sent to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {NOTIFICATION_SETTINGS.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor={setting.key} className="font-medium">
                {setting.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            </div>
            <Switch
              id={setting.key}
              checked={settings[setting.key] ?? false}
              onCheckedChange={() => toggleSetting(setting.key)}
            />
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={updatePrefs.isPending}>
            {updatePrefs.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
