import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DepartmentWithCount {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  employee_count: number;
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments-with-counts"],
    queryFn: async (): Promise<DepartmentWithCount[]> => {
      const { data: departments, error: deptError } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (deptError) throw deptError;

      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("department_id")
        .not("department_id", "is", null);

      if (empError) throw empError;

      const countMap: Record<string, number> = {};
      employees?.forEach((emp) => {
        if (emp.department_id) {
          countMap[emp.department_id] = (countMap[emp.department_id] || 0) + 1;
        }
      });

      return (departments || []).map((dept) => ({
        ...dept,
        employee_count: countMap[dept.id] || 0,
      }));
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("departments")
        .insert({ name: data.name, description: data.description || null })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments-with-counts"] });
      toast.success("Department created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create department: " + error.message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("departments")
        .update({ name: data.name, description: data.description || null })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments-with-counts"] });
      toast.success("Department updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update department: " + error.message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments-with-counts"] });
      toast.success("Department deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete department: " + error.message);
    },
  });
}
