-- Add new columns to employees table for comprehensive profile
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS personal_email TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS current_address TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS emergency_contact_number TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'on_site';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS about_me TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS last_modified_by UUID;

-- Policy acknowledgements (hidden for now but in schema)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS leave_policy_acknowledged_at TIMESTAMPTZ;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS handbook_acknowledged_at TIMESTAMPTZ;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS posh_policy_acknowledged_at TIMESTAMPTZ;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cpp_acknowledged_at TIMESTAMPTZ;

-- Create avatars storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar (folder structure: user_id/filename)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);