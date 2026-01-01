import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LEAVE_CATEGORY_LABELS } from "@/lib/constants";

interface LeaveType {
  id: string;
  name: string;
  code: string;
  category: keyof typeof LEAVE_CATEGORY_LABELS;
  description: string | null;
  entitlement_days: number;
  requires_approval: boolean;
  is_enabled: boolean;
  medical_proof_required_after_days: number | null;
  advance_notice_days: number | null;
  gender_specific: "male" | "female" | "other" | null;
  post_probation_only: boolean;
  max_days_per_month: number | null;
  max_days_per_year: number | null;
}

export default function LeavePolicies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LeaveType>>({});

  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LeaveType[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeaveType> }) => {
      const { error } = await supabase
        .from("leave_types")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast({ title: "Leave policy updated" });
      setEditingId(null);
      setEditValues({});
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const toggleEnabled = async (id: string, currentValue: boolean) => {
    updateMutation.mutate({ id, updates: { is_enabled: !currentValue } });
  };

  const startEditing = (leaveType: LeaveType) => {
    setEditingId(leaveType.id);
    setEditValues({
      entitlement_days: leaveType.entitlement_days,
      advance_notice_days: leaveType.advance_notice_days,
      max_days_per_month: leaveType.max_days_per_month,
      max_days_per_year: leaveType.max_days_per_year,
    });
  };

  const saveEditing = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: editValues });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Leave Policies</h1>
          <p className="text-muted-foreground">
            Configure leave types and entitlements for your organization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Types Configuration</CardTitle>
            <CardDescription>
              Enable/disable leave types and modify entitlements. Changes apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Active</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Entitlement</TableHead>
                      <TableHead>Notice (days)</TableHead>
                      <TableHead>Max/Month</TableHead>
                      <TableHead>Max/Year</TableHead>
                      <TableHead>Restrictions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveTypes?.map((leaveType) => {
                      const isEditing = editingId === leaveType.id;

                      return (
                        <TableRow key={leaveType.id} className={!leaveType.is_enabled ? "opacity-50" : ""}>
                          <TableCell>
                            <Switch
                              checked={leaveType.is_enabled}
                              onCheckedChange={() => toggleEnabled(leaveType.id, leaveType.is_enabled)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{leaveType.name}</p>
                              {leaveType.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {leaveType.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm">{leaveType.code}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {LEAVE_CATEGORY_LABELS[leaveType.category]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-20"
                                value={editValues.entitlement_days ?? ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev,
                                    entitlement_days: parseFloat(e.target.value) || 0,
                                  }))
                                }
                              />
                            ) : (
                              `${leaveType.entitlement_days} days`
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-20"
                                value={editValues.advance_notice_days ?? ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev,
                                    advance_notice_days: parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            ) : (
                              leaveType.advance_notice_days || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-20"
                                value={editValues.max_days_per_month ?? ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev,
                                    max_days_per_month: parseFloat(e.target.value) || null,
                                  }))
                                }
                              />
                            ) : (
                              leaveType.max_days_per_month || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-20"
                                value={editValues.max_days_per_year ?? ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev,
                                    max_days_per_year: parseFloat(e.target.value) || null,
                                  }))
                                }
                              />
                            ) : (
                              leaveType.max_days_per_year || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {leaveType.gender_specific && (
                                <Badge variant="secondary" className="text-xs">
                                  {leaveType.gender_specific}
                                </Badge>
                              )}
                              {leaveType.post_probation_only && (
                                <Badge variant="secondary" className="text-xs">
                                  Post-probation
                                </Badge>
                              )}
                              {leaveType.medical_proof_required_after_days && (
                                <Badge variant="secondary" className="text-xs">
                                  Medical proof &gt;{leaveType.medical_proof_required_after_days}d
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={saveEditing}>
                                  <Check className="h-4 w-4 text-success" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={cancelEditing}>
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEditing(leaveType)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
