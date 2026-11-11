-- ============================================================================
-- SECCION SECURITY HARDENING: Remediate Profile Privilege Escalation (C2)
-- Execute in Supabase SQL Editor as 'postgres' role
--
-- This trigger guarantees that:
-- 1. Anonymous and authenticated clients CANNOT escalate their role to 'creator' or 'admin'
-- 2. Client updates to profiles.role are silently ignored (reverted to OLD.role)
-- 3. Client inserts into profiles force role to 'member'
-- 4. Only trusted backend operations (service_role key) can set or update role to 'creator'
-- ============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_trust_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  jwt_role text := COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
    ''
  );
  is_trusted_backend boolean := (
    jwt_role = 'service_role'
    OR (jwt_role = '' AND session_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin'))
  );
  new_tier text;
  old_tier text;
BEGIN
  IF is_trusted_backend THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Clients can never insert themselves as KYC-verified, platform admins, or creators
    NEW.is_kyc_verified := false;
    IF NEW.platform_role IS DISTINCT FROM 'user' THEN
      NEW.platform_role := 'user';
    END IF;

    -- Force role to 'member' for all client inserts; only service_role can grant 'creator'
    NEW.role := 'member';

    -- Clamp any client-supplied age_verification tier to 'declared'
    IF NEW.privacy_settings IS NOT NULL AND (NEW.privacy_settings ? 'age_verification') THEN
      new_tier := COALESCE(NEW.privacy_settings #>> '{age_verification,verificationTier}', 'declared');
      IF new_tier <> 'declared' THEN
        NEW.privacy_settings := jsonb_set(
          NEW.privacy_settings,
          '{age_verification,verificationTier}',
          '"declared"'::jsonb,
          true
        );
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Preserve server-controlled trust & privilege columns
    NEW.is_kyc_verified := OLD.is_kyc_verified;
    NEW.platform_role := OLD.platform_role;
    -- Strictly preserve role: clients cannot elevate themselves from member to creator
    NEW.role := OLD.role;

    -- Prevent client-side forging of high-trust age_verification.verificationTier
    IF NEW.privacy_settings IS NOT NULL AND (NEW.privacy_settings ? 'age_verification') THEN
      new_tier := COALESCE(NEW.privacy_settings #>> '{age_verification,verificationTier}', 'declared');
      old_tier := COALESCE(OLD.privacy_settings #>> '{age_verification,verificationTier}', 'declared');

      IF new_tier <> 'declared' AND new_tier IS DISTINCT FROM old_tier THEN
        NEW.privacy_settings := jsonb_set(
          NEW.privacy_settings,
          '{age_verification,verificationTier}',
          to_jsonb(old_tier),
          true
        );
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_trust_columns ON public.profiles;

CREATE TRIGGER trg_protect_profile_trust_columns
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_trust_columns();

-- Verification query: ensure trigger is active
SELECT tgname, relname, proname
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname = 'trg_protect_profile_trust_columns';
