import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Globe, MapPin, CalendarIcon, Upload, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { STATE_NAME_TO_CODE } from "@/lib/constants";
import { ALL_HOLIDAYS_2026, MAX_REGIONAL_HOLIDAYS_PER_YEAR } from "@/lib/holidays2026";

type HolidayType = "national" | "regional" | "company";

interface Holiday {
  id: string;
  name: string;
  date: string;
  is_national: boolean;
  is_optional: boolean;
  states: string[] | null;
  year: number;
  created_at: string;
  holiday_type?: HolidayType | null;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Andaman and Nicobar Islands",
  "Chandigarh", "Daman and Diu", "Dadra and Nagar Haveli", "Lakshadweep", "Puducherry"
];

// Get state code from full name
const getStateCode = (stateName: string): string => {
  return STATE_NAME_TO_CODE[stateName] || stateName;
};

export default function Holidays() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  // Default to 2026 as per organization policy
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deleteHolidayId, setDeleteHolidayId] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [isImporting, setIsImporting] = useState(false);

  // Check if user is admin or HR for managing holidays
  const { data: userRole } = useQuery({
    queryKey: ["userRoleForHolidays"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return data?.role;
    },
  });

  const isAdminOrHR = userRole === "admin" || userRole === "hr";

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: undefined as Date | undefined,
    is_national: true,
    is_optional: false,
    states: [] as string[],
  });

  const { data: holidays, isLoading } = useQuery({
    queryKey: ["holidays", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holidays")
        .select("*")
        .eq("year", selectedYear)
        .order("date");
      if (error) throw error;
      return data as Holiday[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: Omit<Holiday, "id" | "created_at">) => {
      const { error } = await supabase.from("holidays").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast({ title: "Holiday added successfully" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Holiday> & { id: string }) => {
      const { error } = await supabase.from("holidays").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast({ title: "Holiday updated successfully" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("holidays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast({ title: "Holiday deleted" });
      setDeleteHolidayId(null);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleImport2026Holidays = async () => {
    setIsImporting(true);
    try {
      // Get existing holidays to avoid duplicates
      const { data: existingHolidays } = await supabase
        .from("holidays")
        .select("name, date")
        .eq("year", 2026);

      const existingSet = new Set(
        existingHolidays?.map(h => `${h.name}-${h.date}`) || []
      );

      // Filter out duplicates
      const newHolidays = ALL_HOLIDAYS_2026.filter(
        h => !existingSet.has(`${h.name}-${h.date}`)
      );

      if (newHolidays.length === 0) {
        toast({ title: "No new holidays to import", description: "All 2026 holidays are already imported." });
        setIsImporting(false);
        return;
      }

      // Insert in batches
      const batchSize = 50;
      for (let i = 0; i < newHolidays.length; i += batchSize) {
        const batch = newHolidays.slice(i, i + batchSize);
        const { error } = await supabase.from("holidays").insert(batch);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast({ 
        title: "Holidays imported successfully", 
        description: `Imported ${newHolidays.length} holidays for 2026.` 
      });
      setSelectedYear(2026);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Import failed", description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const openAddDialog = () => {
    setFormData({
      name: "",
      date: undefined,
      is_national: true,
      is_optional: false,
      states: [],
    });
    setEditingHoliday(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (holiday: Holiday) => {
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date),
      is_national: holiday.is_national,
      is_optional: holiday.is_optional,
      states: holiday.states || [],
    });
    setEditingHoliday(holiday);
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingHoliday(null);
    setFormData({
      name: "",
      date: undefined,
      is_national: true,
      is_optional: false,
      states: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.date) {
      toast({ variant: "destructive", title: "Please fill all required fields" });
      return;
    }

    const holidayData = {
      name: formData.name,
      date: format(formData.date, "yyyy-MM-dd"),
      is_national: formData.is_national,
      is_optional: formData.is_optional,
      states: formData.is_national ? null : formData.states,
      year: formData.date.getFullYear(),
      holiday_type: (formData.is_national ? "national" : "regional") as "national" | "regional" | "company",
    };

    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, ...holidayData } as any);
    } else {
      addMutation.mutate(holidayData);
    }
  };

  const toggleState = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter((s) => s !== state)
        : [...prev.states, state],
    }));
  };

  const nationalHolidays = holidays?.filter((h) => h.is_national) || [];
  const regionalHolidays = holidays?.filter((h) => !h.is_national) || [];

  // Apply state filter
  const filteredRegionalHolidays = stateFilter === "all" 
    ? regionalHolidays 
    : regionalHolidays.filter(h => h.states?.includes(stateFilter));

  // Get unique states from regional holidays for filter
  const availableStates = Array.from(
    new Set(regionalHolidays.flatMap(h => h.states || []))
  ).sort();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Holidays</h1>
            <p className="text-muted-foreground">Manage national and regional holidays</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdminOrHR && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleImport2026Holidays}
                  disabled={isImporting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? "Importing..." : "Import 2026 Holidays"}
                </Button>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Holiday
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Holiday Calendar Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <p>
              <strong>Leave Year Cycle:</strong> Organization leave balances reset on <strong>Dec 31</strong> and the new cycle starts from <strong>Jan 1</strong>.
            </p>
            <p>
              <strong>National holidays</strong> are mandatory for all employees. 
              <strong> Regional holidays</strong> are state-specific and employees can opt for a maximum of <strong>{MAX_REGIONAL_HOLIDAYS_PER_YEAR} regional holidays</strong> per year.
            </p>
          </AlertDescription>
        </Alert>

        {/* National Holidays */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>National Holidays</CardTitle>
            </div>
            <CardDescription>
              Holidays applicable to all employees across the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !nationalHolidays.length ? (
              <p className="py-8 text-center text-muted-foreground">
                No national holidays added for {selectedYear}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Holiday</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      {isAdminOrHR && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nationalHolidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{format(new Date(holiday.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(holiday.date), "EEEE")}</TableCell>
                        {isAdminOrHR && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(holiday)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteHolidayId(holiday.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Holidays */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Regional / Restricted Holidays</CardTitle>
                  <CardDescription>
                    Location-specific holidays employees can opt for (max {MAX_REGIONAL_HOLIDAYS_PER_YEAR}/year)
                  </CardDescription>
                </div>
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {availableStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state} ({getStateCode(state)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !filteredRegionalHolidays.length ? (
              <p className="py-8 text-center text-muted-foreground">
                {stateFilter === "all" 
                  ? `No regional holidays added for ${selectedYear}`
                  : `No holidays found for ${stateFilter} in ${selectedYear}`
                }
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Holiday</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Applicable States</TableHead>
                      <TableHead>Type</TableHead>
                      {isAdminOrHR && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TooltipProvider>
                      {filteredRegionalHolidays.map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>{format(new Date(holiday.date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{format(new Date(holiday.date), "EEEE")}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {holiday.states?.slice(0, 3).map((state) => (
                                <Tooltip key={state}>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-xs cursor-help">
                                      {getStateCode(state)}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{state}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {holiday.states && holiday.states.length > 3 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-xs cursor-help">
                                      +{holiday.states.length - 3} more
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">
                                      {holiday.states.slice(3).join(", ")}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {holiday.is_optional ? (
                              <Badge variant="outline">Optional</Badge>
                            ) : (
                              <Badge variant="secondary">Restricted</Badge>
                            )}
                          </TableCell>
                          {isAdminOrHR && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(holiday)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteHolidayId(holiday.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TooltipProvider>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingHoliday ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
            <DialogDescription>
              {editingHoliday ? "Update holiday details" : "Add a new holiday to the calendar"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Republic Day"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData((p) => ({ ...p, date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>National Holiday</Label>
                <p className="text-sm text-muted-foreground">
                  Applies to all employees organization-wide
                </p>
              </div>
              <Switch
                checked={formData.is_national}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, is_national: checked, states: [] }))
                }
              />
            </div>

            {!formData.is_national && (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Optional Holiday</Label>
                    <p className="text-sm text-muted-foreground">
                      Employees can choose to take this holiday
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_optional}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, is_optional: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Applicable States</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the states where this holiday applies
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border p-3">
                    {INDIAN_STATES.map((state) => (
                      <label
                        key={state}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={formData.states.includes(state)}
                          onChange={() => toggleState(state)}
                          className="rounded border-input"
                        />
                        <span className="truncate" title={state}>
                          {state} ({getStateCode(state)})
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.states.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formData.states.length} state{formData.states.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                {editingHoliday ? "Update" : "Add"} Holiday
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteHolidayId} onOpenChange={() => setDeleteHolidayId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteHolidayId && deleteMutation.mutate(deleteHolidayId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
