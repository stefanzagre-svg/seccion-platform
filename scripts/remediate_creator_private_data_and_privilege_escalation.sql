-- ============================================================================
-- SECCION SECURITY & PRIVACY HARDENING (C1, C2, H2):
-- 1. Remediate Profile Privilege Escalation (protect profiles.role & trust columns)
-- 2. Create Isolated public.creator_private_data Table with strict RLS
-- 3. Migrate and purge financial PII out of public profiles.privacy_settings
--
-- Execute in Supabase SQL Editor as 'postgres' role
-- ============================================================================

-- ── PART 1: Strict Privilege Escalation Protection ───────────────────────────
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

-- ── PART 2: Isolated Creator Private Financial Data Table ────────────────────
CREATE TABLE IF NOT EXISTS public.creator_private_data (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    legal_business_name TEXT,
    tax_id_number TEXT,
    vat_gst_number TEXT,
    paxum_email TEXT,
    crypto_wallet_address TEXT,
    crypto_network TEXT DEFAULT 'USDT_TRC20',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Universal RLS on creator_private_data
ALTER TABLE public.creator_private_data ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if any exist
DROP POLICY IF EXISTS "Creators can view their own private data" ON public.creator_private_data;
DROP POLICY IF EXISTS "Creators can insert their own private data" ON public.creator_private_data;
DROP POLICY IF EXISTS "Creators can update their own private data" ON public.creator_private_data;
DROP POLICY IF EXISTS "Service role full access on creator_private_data" ON public.creator_private_data;

-- Strict Owner-Only Access
CREATE POLICY "Creators can view their own private data"
ON public.creator_private_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Creators can insert their own private data"
ON public.creator_private_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their own private data"
ON public.creator_private_data FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on creator_private_data"
ON public.creator_private_data FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ── PART 3: Data Migration & Sanitization from profiles.privacy_settings ────
-- Migrate existing creator financial details from profiles.privacy_settings into creator_private_data
INSERT INTO public.creator_private_data (
    user_id,
    legal_business_name,
    tax_id_number,
    vat_gst_number,
    paxum_email,
    crypto_wallet_address,
    crypto_network
)
SELECT 
    id,
    privacy_settings->>'legal_business_name',
    privacy_settings->>'tax_id_number',
    privacy_settings->>'vat_gst_number',
    privacy_settings->>'paxum_email',
    privacy_settings->>'crypto_wallet_address',
    COALESCE(privacy_settings->>'crypto_network', 'USDT_TRC20')
FROM public.profiles
WHERE role = 'creator'
  AND privacy_settings IS NOT NULL
  AND (
    privacy_settings ? 'tax_id_number' OR
    privacy_settings ? 'legal_business_name' OR
    privacy_settings ? 'vat_gst_number' OR
    privacy_settings ? 'paxum_email' OR
    privacy_settings ? 'crypto_wallet_address'
  )
ON CONFLICT (user_id) DO UPDATE SET
    legal_business_name = EXCLUDED.legal_business_name,
    tax_id_number = EXCLUDED.tax_id_number,
    vat_gst_number = EXCLUDED.vat_gst_number,
    paxum_email = EXCLUDED.paxum_email,
    crypto_wallet_address = EXCLUDED.crypto_wallet_address,
    crypto_network = EXCLUDED.crypto_network,
    updated_at = NOW();

-- Purge sensitive financial keys from public.profiles.privacy_settings
UPDATE public.profiles
SET privacy_settings = privacy_settings - 'legal_business_name' 
                                        - 'tax_id_number' 
                                        - 'vat_gst_number' 
                                        - 'paxum_email' 
                                        - 'crypto_wallet_address' 
                                        - 'crypto_network'
WHERE privacy_settings IS NOT NULL
  AND (
    privacy_settings ? 'tax_id_number' OR
    privacy_settings ? 'legal_business_name' OR
    privacy_settings ? 'vat_gst_number' OR
    privacy_settings ? 'paxum_email' OR
    privacy_settings ? 'crypto_wallet_address'
  );

-- Verification Query
SELECT 'Verification: trigger active' AS status, count(*) AS count
FROM pg_trigger WHERE tgname = 'trg_protect_profile_trust_columns';
