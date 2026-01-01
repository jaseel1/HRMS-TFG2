-- Add foreign key constraint from employees.user_id to profiles.id
ALTER TABLE public.employees
ADD CONSTRAINT employees_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;