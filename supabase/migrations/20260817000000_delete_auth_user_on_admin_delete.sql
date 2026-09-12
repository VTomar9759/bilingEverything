-- Migration: Delete auth user when admin record is deleted
-- Date: 2026-08-17
-- Description: Automatically deletes the corresponding user from auth.users when an admin row in public.admin is deleted.

-- 1. Trigger function with SECURITY DEFINER to delete matching user from auth.users
CREATE OR REPLACE FUNCTION public.delete_auth_user_on_admin_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email IS NOT NULL THEN
    DELETE FROM auth.users WHERE LOWER(email) = LOWER(OLD.email);
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to public.admin table
DROP TRIGGER IF EXISTS on_admin_deleted_remove_auth_user ON public.admin;

CREATE TRIGGER on_admin_deleted_remove_auth_user
  AFTER DELETE ON public.admin
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_auth_user_on_admin_delete();

-- 3. RPC function to explicitly delete admin and auth user in a single transaction
CREATE OR REPLACE FUNCTION public.delete_admin_user(p_admin_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Retrieve email before deletion
  SELECT email INTO v_email FROM public.admin WHERE id = p_admin_id AND org_id = p_org_id;

  -- Delete from public.admin
  DELETE FROM public.admin WHERE id = p_admin_id AND org_id = p_org_id;

  -- Delete from auth.users if email exists
  IF v_email IS NOT NULL THEN
    DELETE FROM auth.users WHERE LOWER(email) = LOWER(v_email);
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
