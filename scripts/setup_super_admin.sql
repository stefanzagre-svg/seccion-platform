-- SECCIØN PLATFORM — SUPER ADMIN PRIVILEGES SCRIPT
-- Grants super_admin access to Stefan (stefan.zagre@gmail.com)

DO $$
BEGIN
  -- 1. Update public.profiles by matching username or email pattern
  UPDATE public.profiles
  SET platform_role = 'super_admin'
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'stefan.zagre@gmail.com'
  ) OR username ILIKE '%stefan%';

  -- 2. If profile doesn't exist yet, insert fallback placeholder for stefan.zagre@gmail.com
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE platform_role = 'super_admin'
  ) THEN
    UPDATE public.profiles
    SET platform_role = 'super_admin'
    WHERE role = 'creator' OR role = 'member'
    LIMIT 1;
  END IF;
END $$;

-- Verify super admin profiles
SELECT id, username, display_name, role, platform_role, created_at
FROM public.profiles
WHERE platform_role IN ('super_admin', 'admin');
