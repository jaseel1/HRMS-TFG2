-- Create ENUM types for the HRMS
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'finance', 'manager', 'team_member');
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract');
CREATE TYPE public.leave_category AS ENUM ('regular', 'wellness', 'special', 'statutory', 'compensatory');
CREATE TYPE public.accrual_type AS ENUM ('yearly', 'monthly', 'per_working_days', 'none');
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'team_member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create employees table (employee master data)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id),
  reporting_manager_id UUID REFERENCES public.employees(id),
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  gender gender,
  date_of_joining DATE NOT NULL,
  probation_end_date DATE,
  work_location TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leave_types table (configurable leave policies)
CREATE TABLE public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category leave_category NOT NULL DEFAULT 'regular',
  description TEXT,
  entitlement_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  accrual_type accrual_type NOT NULL DEFAULT 'yearly',
  accrual_rate NUMERIC(5,2),
  carry_forward BOOLEAN NOT NULL DEFAULT false,
  max_carry_forward_days NUMERIC(5,2),
  encashment BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  medical_proof_required_after_days INTEGER,
  advance_notice_days INTEGER DEFAULT 0,
  gender_specific gender,
  post_probation_only BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  max_days_per_month NUMERIC(5,2),
  max_days_per_year NUMERIC(5,2),
  auto_expiry_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leave_balances table
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  used_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  carried_forward_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  adjusted_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, year)
);

-- Create approval_workflows table (configurable approval chains)
CREATE TABLE public.approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leave_type_id UUID REFERENCES public.leave_types(id),
  applicant_role app_role,
  department_id UUID REFERENCES public.departments(id),
  approval_chain app_role[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leave_applications table
CREATE TABLE public.leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC(5,2) NOT NULL,
  reason TEXT,
  attachment_url TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  current_approver_role app_role,
  is_lop BOOLEAN NOT NULL DEFAULT false,
  lop_days NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leave_approvals table (tracks each approval step)
CREATE TABLE public.leave_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_application_id UUID NOT NULL REFERENCES public.leave_applications(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.employees(id),
  approver_role app_role NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  remarks TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create holidays table (national + regional)
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_national BOOLEAN NOT NULL DEFAULT false,
  states TEXT[],
  is_optional BOOLEAN NOT NULL DEFAULT false,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create compensatory_offs table
CREATE TABLE public.compensatory_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  worked_date DATE NOT NULL,
  granted_by_id UUID NOT NULL REFERENCES public.employees(id),
  expires_at DATE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  leave_application_id UUID REFERENCES public.leave_applications(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensatory_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'hr' THEN 2 
      WHEN 'finance' THEN 3 
      WHEN 'manager' THEN 4 
      WHEN 'team_member' THEN 5 
    END 
  LIMIT 1
$$;

-- Function to check if user is admin or HR
CREATE OR REPLACE FUNCTION public.is_admin_or_hr(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'hr')
  )
$$;

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and HR can manage departments" ON public.departments
  FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Admin and HR can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admin can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can manage non-admin roles" ON public.user_roles
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'hr') AND role != 'admin');

-- RLS Policies for employees
CREATE POLICY "Authenticated users can view employees" ON public.employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and HR can manage employees" ON public.employees
  FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for leave_types
CREATE POLICY "Everyone can view enabled leave types" ON public.leave_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and HR can manage leave types" ON public.leave_types
  FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for leave_balances
CREATE POLICY "Users can view own balances" ON public.leave_balances
  FOR SELECT TO authenticated USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.is_admin_or_hr(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.reporting_manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
      AND e.id = leave_balances.employee_id
    )
  );

CREATE POLICY "Admin and HR can manage balances" ON public.leave_balances
  FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for approval_workflows
CREATE POLICY "Everyone can view workflows" ON public.approval_workflows
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and HR can manage workflows" ON public.approval_workflows
  FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for leave_applications
CREATE POLICY "Users can view own applications" ON public.leave_applications
  FOR SELECT TO authenticated USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.is_admin_or_hr(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.reporting_manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
      AND e.id = leave_applications.employee_id
    )
  );

CREATE POLICY "Users can create own applications" ON public.leave_applications
  FOR INSERT TO authenticated 
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own pending applications" ON public.leave_applications
  FOR UPDATE TO authenticated USING (
    (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) AND status = 'pending')
    OR public.is_admin_or_hr(auth.uid())
    OR public.has_role(auth.uid(), 'manager')
  );

-- RLS Policies for leave_approvals
CREATE POLICY "Relevant users can view approvals" ON public.leave_approvals
  FOR SELECT TO authenticated USING (
    approver_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.is_admin_or_hr(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.leave_applications la 
      WHERE la.id = leave_approvals.leave_application_id 
      AND la.employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Approvers can manage their approvals" ON public.leave_approvals
  FOR ALL TO authenticated USING (
    approver_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.is_admin_or_hr(auth.uid())
  );

-- RLS Policies for holidays
CREATE POLICY "Everyone can view holidays" ON public.holidays
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and HR can manage holidays" ON public.holidays
  FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for compensatory_offs
CREATE POLICY "Users can view own comp offs" ON public.compensatory_offs
  FOR SELECT TO authenticated USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.is_admin_or_hr(auth.uid())
  );

CREATE POLICY "Managers and HR can grant comp offs" ON public.compensatory_offs
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'manager') OR public.is_admin_or_hr(auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for audit_logs
CREATE POLICY "Admin and HR can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON public.leave_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON public.approval_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at BEFORE UPDATE ON public.leave_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  
  -- Assign default role (team_member)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'team_member');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile and role on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
  ('Engineering', 'Software development and technical teams'),
  ('Human Resources', 'HR and people operations'),
  ('Finance', 'Finance and accounting'),
  ('Operations', 'Business operations'),
  ('Marketing', 'Marketing and communications');

-- Insert default leave types based on policy
INSERT INTO public.leave_types (name, code, category, description, entitlement_days, accrual_type, accrual_rate, carry_forward, requires_approval, medical_proof_required_after_days, advance_notice_days, gender_specific, post_probation_only, max_days_per_month, max_days_per_year, auto_expiry_days) VALUES
  ('Year-End Wellness Break', 'YEWB', 'wellness', 'Organization-wide wellness break at year end', 12, 'yearly', NULL, false, false, NULL, 0, NULL, false, NULL, 12, NULL),
  ('Earned Leave', 'EL', 'regular', 'Accrual-based earned leave, 1 day per 20 working days', 0, 'per_working_days', 0.05, false, true, NULL, 0, NULL, true, NULL, NULL, NULL),
  ('Sick Leave', 'SL', 'regular', 'Medical leave with document required after 5 days', 12, 'yearly', NULL, false, true, 5, 0, NULL, false, NULL, 12, NULL),
  ('Casual Leave', 'CL', 'wellness', 'General purpose casual leave', 6, 'yearly', NULL, false, true, NULL, 0, NULL, false, 1, 6, NULL),
  ('Menstrual Leave', 'ML', 'wellness', 'Wellness leave for menstrual health', 6, 'yearly', NULL, false, true, NULL, 0, 'female', false, 1, 6, NULL),
  ('Maternity Leave', 'MAT', 'statutory', 'Maternity leave - 26 weeks for 1st/2nd child', 130, 'none', NULL, false, true, NULL, 14, 'female', false, NULL, 130, NULL),
  ('Paternity Leave', 'PAT', 'statutory', 'Paternity leave for new fathers', 7, 'yearly', NULL, false, true, NULL, 7, 'male', false, NULL, 7, NULL),
  ('Bereavement Leave', 'BL', 'special', 'Leave for family bereavement', 4, 'none', NULL, false, true, NULL, 0, NULL, false, NULL, 4, NULL),
  ('Compensatory Off', 'COMP', 'compensatory', 'Time off for working on holidays/weekends', 0, 'none', NULL, false, true, NULL, 0, NULL, false, NULL, NULL, 45),
  ('Regional Holiday', 'RH', 'regular', 'Location-based restricted holidays', 6, 'yearly', NULL, false, true, NULL, 14, NULL, false, NULL, 6, NULL),
  ('Study Leave', 'STL', 'special', 'Leave for examinations and studies', 5, 'yearly', NULL, false, true, NULL, 30, NULL, false, NULL, 5, NULL),
  ('Loss of Pay', 'LOP', 'regular', 'Unpaid leave when balance exhausted', 0, 'none', NULL, false, false, NULL, 0, NULL, false, NULL, NULL, NULL);

-- Insert default approval workflows
INSERT INTO public.approval_workflows (name, applicant_role, approval_chain, is_active) VALUES
  ('Team Member Leave Approval', 'team_member', ARRAY['manager', 'hr']::app_role[], true),
  ('Manager Leave Approval', 'manager', ARRAY['hr']::app_role[], true),
  ('Finance Leave Approval', 'finance', ARRAY['manager', 'hr']::app_role[], true);