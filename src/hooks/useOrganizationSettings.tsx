import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationSettings {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  fiscal_year_start: string | null;
  working_days: string | null;
  leave_policy_url: string | null;
  employee_handbook_url: string | null;
  posh_policy_url: string | null;
  cpp_url: string | null;
}

export function useOrganizationSettings() {
  return useQuery({
    queryKey: ["organization-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as OrganizationSettings | null;
    },
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<OrganizationSettings> & { id: string }) => {
      const { id, ...updates } = settings;
      const { data, error } = await supabase
        .from("organization_settings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-settings"] });
    },
  });
}
