
-- Create trigger function to notify on leave status changes
CREATE OR REPLACE FUNCTION public.notify_leave_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  applicant_user_id UUID;
  leave_type_name TEXT;
  applicant_name TEXT;
BEGIN
  -- Get applicant user_id and leave type name
  SELECT e.user_id, lt.name, p.first_name || ' ' || p.last_name
  INTO applicant_user_id, leave_type_name, applicant_name
  FROM employees e
  JOIN leave_types lt ON lt.id = NEW.leave_type_id
  LEFT JOIN profiles p ON p.id = e.user_id
  WHERE e.id = NEW.employee_id;

  -- Notify applicant when status changes from pending
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO notifications (user_id, title, type, message, related_id)
    VALUES (
      applicant_user_id,
      'Leave ' || INITCAP(NEW.status::text),
      'leave_status',
      'Your ' || leave_type_name || ' leave request has been ' || NEW.status::text || '.',
      NEW.id
    );
  END IF;

  -- Notify approvers about new pending leave
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'pending' THEN
    -- Notify managers and HR about new pending requests
    INSERT INTO notifications (user_id, title, type, message, related_id)
    SELECT DISTINCT ur.user_id, 'New Leave Request', 'pending_approval',
      applicant_name || ' has requested ' || leave_type_name || ' leave.',
      NEW.id
    FROM user_roles ur
    WHERE ur.role IN ('manager', 'hr', 'admin')
      AND ur.user_id != applicant_user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for leave status notifications
DROP TRIGGER IF EXISTS on_leave_status_notify ON leave_applications;
CREATE TRIGGER on_leave_status_notify
  AFTER UPDATE ON leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_leave_status_change();

-- Create trigger for new leave applications
CREATE OR REPLACE FUNCTION public.notify_new_leave_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  applicant_user_id UUID;
  leave_type_name TEXT;
  applicant_name TEXT;
BEGIN
  -- Get applicant info
  SELECT e.user_id, lt.name, p.first_name || ' ' || p.last_name
  INTO applicant_user_id, leave_type_name, applicant_name
  FROM employees e
  JOIN leave_types lt ON lt.id = NEW.leave_type_id
  LEFT JOIN profiles p ON p.id = e.user_id
  WHERE e.id = NEW.employee_id;

  -- Notify managers and HR about new pending requests
  INSERT INTO notifications (user_id, title, type, message, related_id)
  SELECT DISTINCT ur.user_id, 'New Leave Request', 'pending_approval',
    applicant_name || ' has requested ' || leave_type_name || ' leave.',
    NEW.id
  FROM user_roles ur
  WHERE ur.role IN ('manager', 'hr', 'admin')
    AND ur.user_id != applicant_user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_leave_notify ON leave_applications;
CREATE TRIGGER on_new_leave_notify
  AFTER INSERT ON leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_leave_application();
