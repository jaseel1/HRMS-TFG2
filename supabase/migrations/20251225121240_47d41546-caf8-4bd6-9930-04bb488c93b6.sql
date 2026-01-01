-- Add policy document URL columns to organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS leave_policy_url text,
ADD COLUMN IF NOT EXISTS employee_handbook_url text,
ADD COLUMN IF NOT EXISTS posh_policy_url text,
ADD COLUMN IF NOT EXISTS cpp_url text;

-- Create holiday_type enum
DO $$ BEGIN
  CREATE TYPE public.holiday_type AS ENUM ('national', 'company', 'regional');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add holiday_type column to holidays table
ALTER TABLE public.holidays 
ADD COLUMN IF NOT EXISTS holiday_type public.holiday_type DEFAULT 'company';

-- Create announcement_banners table
CREATE TABLE IF NOT EXISTS public.announcement_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  color text NOT NULL DEFAULT 'yellow' CHECK (color IN ('red', 'yellow')),
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 1 CHECK (position IN (1, 2)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on announcement_banners
ALTER TABLE public.announcement_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can view active announcements
CREATE POLICY "Everyone can view announcements" 
ON public.announcement_banners 
FOR SELECT 
USING (true);

-- Admin and HR can manage announcements
CREATE POLICY "Admin and HR can manage announcements" 
ON public.announcement_banners 
FOR ALL 
USING (is_admin_or_hr(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_announcement_banners_updated_at
BEFORE UPDATE ON public.announcement_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();