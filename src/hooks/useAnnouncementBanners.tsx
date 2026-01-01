import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnnouncementBanner {
  id: string;
  message: string;
  color: "red" | "yellow";
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useAnnouncementBanners() {
  return useQuery({
    queryKey: ["announcement-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcement_banners")
        .select("*")
        .order("position");

      if (error) throw error;
      return data as AnnouncementBanner[];
    },
  });
}

export function useActiveAnnouncementBanners() {
  return useQuery({
    queryKey: ["announcement-banners-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcement_banners")
        .select("*")
        .eq("is_active", true)
        .order("position");

      if (error) throw error;
      return data as AnnouncementBanner[];
    },
  });
}

export function useUpsertAnnouncementBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banner: Partial<AnnouncementBanner> & { position: number }) => {
      // Check if banner with this position exists
      const { data: existing } = await supabase
        .from("announcement_banners")
        .select("id")
        .eq("position", banner.position)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("announcement_banners")
          .update({
            message: banner.message,
            color: banner.color,
            is_active: banner.is_active,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("announcement_banners")
          .insert([{
            message: banner.message || "",
            color: banner.color || "yellow",
            is_active: banner.is_active ?? true,
            position: banner.position,
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-banners"] });
      queryClient.invalidateQueries({ queryKey: ["announcement-banners-active"] });
    },
  });
}
