-- Add RLS policy allowing employees to update their own profile
CREATE POLICY "Employees can update own profile"
ON public.employees
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());