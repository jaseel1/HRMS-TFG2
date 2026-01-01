-- Function to initialize leave balances for a new employee
CREATE OR REPLACE FUNCTION public.initialize_employee_leave_balances()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  leave_type_record RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Loop through all enabled leave types and create balances
  FOR leave_type_record IN 
    SELECT id, entitlement_days, post_probation_only, gender_specific
    FROM public.leave_types 
    WHERE is_enabled = true
  LOOP
    -- Skip gender-specific leaves if employee gender doesn't match
    IF leave_type_record.gender_specific IS NOT NULL THEN
      IF NEW.gender IS NULL OR NEW.gender != leave_type_record.gender_specific THEN
        CONTINUE;
      END IF;
    END IF;
    
    -- Skip post-probation leaves if employee is still in probation
    IF leave_type_record.post_probation_only = true THEN
      IF NEW.probation_end_date IS NOT NULL AND NEW.probation_end_date > CURRENT_DATE THEN
        CONTINUE;
      END IF;
    END IF;
    
    -- Insert leave balance
    INSERT INTO public.leave_balances (
      employee_id,
      leave_type_id,
      year,
      entitled_days,
      used_days,
      carried_forward_days,
      adjusted_days
    ) VALUES (
      NEW.id,
      leave_type_record.id,
      current_year,
      leave_type_record.entitlement_days,
      0,
      0,
      0
    )
    ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize balances when employee is created
DROP TRIGGER IF EXISTS on_employee_created_init_balances ON public.employees;
CREATE TRIGGER on_employee_created_init_balances
  AFTER INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_employee_leave_balances();

-- Function to update leave balance when leave is approved
CREATE OR REPLACE FUNCTION public.update_leave_balance_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  leave_year INTEGER;
  existing_balance RECORD;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    leave_year := EXTRACT(YEAR FROM NEW.start_date);
    
    -- Get the current balance
    SELECT * INTO existing_balance
    FROM public.leave_balances
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = leave_year;
    
    IF existing_balance IS NOT NULL THEN
      -- Update used days
      UPDATE public.leave_balances
      SET used_days = used_days + NEW.days_count,
          updated_at = now()
      WHERE id = existing_balance.id;
    ELSE
      -- Create balance record if it doesn't exist
      INSERT INTO public.leave_balances (
        employee_id,
        leave_type_id,
        year,
        entitled_days,
        used_days,
        carried_forward_days,
        adjusted_days
      )
      SELECT 
        NEW.employee_id,
        NEW.leave_type_id,
        leave_year,
        COALESCE(lt.entitlement_days, 0),
        NEW.days_count,
        0,
        0
      FROM public.leave_types lt
      WHERE lt.id = NEW.leave_type_id;
    END IF;
  END IF;
  
  -- Handle reversal when approved leave is cancelled/rejected
  IF OLD.status = 'approved' AND NEW.status IN ('cancelled', 'rejected') THEN
    leave_year := EXTRACT(YEAR FROM NEW.start_date);
    
    UPDATE public.leave_balances
    SET used_days = GREATEST(0, used_days - NEW.days_count),
        updated_at = now()
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = leave_year;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update balance when leave application status changes
DROP TRIGGER IF EXISTS on_leave_status_change ON public.leave_applications;
CREATE TRIGGER on_leave_status_change
  AFTER UPDATE OF status ON public.leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leave_balance_on_approval();

-- Function to initialize balances for a specific year (for year rollover)
CREATE OR REPLACE FUNCTION public.initialize_yearly_balances(target_year INTEGER DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp RECORD;
  lt RECORD;
  yr INTEGER := COALESCE(target_year, EXTRACT(YEAR FROM CURRENT_DATE));
BEGIN
  FOR emp IN SELECT id, gender, probation_end_date FROM public.employees WHERE is_active = true
  LOOP
    FOR lt IN SELECT id, entitlement_days, post_probation_only, gender_specific 
              FROM public.leave_types WHERE is_enabled = true
    LOOP
      -- Skip gender-specific leaves if gender doesn't match
      IF lt.gender_specific IS NOT NULL AND (emp.gender IS NULL OR emp.gender != lt.gender_specific) THEN
        CONTINUE;
      END IF;
      
      -- Skip post-probation leaves if still in probation
      IF lt.post_probation_only = true AND emp.probation_end_date IS NOT NULL AND emp.probation_end_date > CURRENT_DATE THEN
        CONTINUE;
      END IF;
      
      INSERT INTO public.leave_balances (employee_id, leave_type_id, year, entitled_days, used_days, carried_forward_days, adjusted_days)
      VALUES (emp.id, lt.id, yr, lt.entitlement_days, 0, 0, 0)
      ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;