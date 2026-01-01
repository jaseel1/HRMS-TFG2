-- Create organization_settings table (singleton table)
CREATE TABLE public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Organization',
  email text,
  address text,
  fiscal_year_start text DEFAULT 'April',
  working_days text DEFAULT 'Monday - Friday',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage organization settings
CREATE POLICY "Admins can manage organization settings"
ON public.organization_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view organization settings
CREATE POLICY "Everyone can view organization settings"
ON public.organization_settings
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings row
INSERT INTO public.organization_settings (name, email) 
VALUES ('MakerGhat', 'hr@makerghat.org');

-- Create notification_preferences table (singleton table)
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  new_leave_request boolean NOT NULL DEFAULT true,
  leave_approved boolean NOT NULL DEFAULT true,
  leave_rejected boolean NOT NULL DEFAULT true,
  low_balance_alert boolean NOT NULL DEFAULT false,
  upcoming_holiday boolean NOT NULL DEFAULT true,
  probation_ending boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notification preferences
CREATE POLICY "Admins can manage notification preferences"
ON public.notification_preferences
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view notification preferences
CREATE POLICY "Everyone can view notification preferences"
ON public.notification_preferences
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default preferences row
INSERT INTO public.notification_preferences DEFAULT VALUES;