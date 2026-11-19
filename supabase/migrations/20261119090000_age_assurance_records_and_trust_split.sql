-- ============================================================================
-- SECCION Phase 1 — Method-Agnostic Age Assurance & Trust Flag Separation
-- ============================================================================
-- Decouples Member 18+ Age Assurance (`profiles.is_age_verified` +
-- `public.age_assurance_records`) from Creator 18 U.S.C. § 2257 / DAC7 / AML
-- KYC (`profiles.is_kyc_verified`).
-- Zero PII is stored in `age_assurance_records` (only SHA-256 proof hashes).
-- ============================================================================

-- 1. Separate Member 18+ Age Verification column on public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_age_verified boolean NOT NULL DEFAULT false;

-- Backfill existing KYC-verified profiles so zero verified accounts lose access
UPDATE public.profiles
SET is_age_verified = true
WHERE is_kyc_verified = true AND is_age_verified = false;

-- 2. Method-agnostic zero-PII audit ledger for age assurance receipts
CREATE TABLE IF NOT EXISTS public.age_assurance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (
    method IN (
      'declared',
      'didit_age',
      'didit_reusable',
      'didit_kyc',
      'us_registry',
      'eudi_wallet',
      'privado_zkp'
    )
  ),
  provider text NOT NULL CHECK (
    provider IN (
      'internal',
      'didit',
      'agechecker',
      'openid4vp',
      'privado'
    )
  ),
  assurance_level text NOT NULL CHECK (
    assurance_level IN (
      'self',
      'estimated',
      'transactional',
      'document',
      'cryptographic'
    )
  ),
  country_code text,
  region_code text,
  proof_hash text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_age_assurance_provider_proof UNIQUE (provider, proof_hash)
);

CREATE INDEX IF NOT EXISTS idx_age_assurance_records_user_verified
  ON public.age_assurance_records (user_id, verified_at DESC);

-- 3. Strict Zero-Trust Row-Level Security (Owner Read-Only; Writes Strictly via service_role)
ALTER TABLE public.age_assurance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own age assurance receipts" ON public.age_assurance_records;
CREATE POLICY "Users can view own age assurance receipts"
  ON public.age_assurance_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Extend protect_profile_trust_columns() to lock is_age_verified alongside is_kyc_verified
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
  old_wingman jsonb;
BEGIN
  IF is_trusted_backend THEN
    RETURN NEW;
  END IF;

  -- Block unprivileged claiming of reserved admin username
  IF TG_OP = 'INSERT' AND LOWER(COALESCE(NEW.username, '')) = 'stefan' THEN
    RAISE EXCEPTION 'Reserved username';
  END IF;

  IF TG_OP = 'UPDATE' AND LOWER(COALESCE(NEW.username, '')) = 'stefan'
     AND LOWER(COALESCE(OLD.username, '')) <> 'stefan' THEN
    RAISE EXCEPTION 'Reserved username';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_kyc_verified := false;
    NEW.is_age_verified := false;
    NEW.platform_role := 'user';
    NEW.role := 'member';

    -- VIP / Financial / Entitlement Columns (service_role only)
    NEW.is_approved_founder_creator := false;
    NEW.promo_90_approved_at := NULL;
    NEW.custom_creator_rate := NULL;
    NEW.creator_ultimate_pack := false;
    NEW.creator_ultimate_pack_expires_at := NULL;
    NEW.ai_free_until := NULL;
    NEW.ai_agent_active := false;
    NEW.content_ops_enabled := false;
    NEW.legal_audit_enabled := false;
    NEW.promo_status := 'none';
    NEW.promo_reviewed_at := NULL;
    NEW.connection_points := 0;
    NEW.wingman_credits := LEAST(GREATEST(COALESCE(NEW.wingman_credits, 10), 0), 10);

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

    IF NEW.privacy_settings IS NOT NULL AND (NEW.privacy_settings ? 'wingman_credits') THEN
      NEW.privacy_settings := jsonb_set(
        NEW.privacy_settings,
        '{wingman_credits}',
        '10'::jsonb,
        true
      );
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Preserve all server-controlled identity, privilege, and financial columns
    NEW.is_kyc_verified := OLD.is_kyc_verified;
    NEW.is_age_verified := OLD.is_age_verified;
    NEW.platform_role := OLD.platform_role;
    NEW.role := OLD.role;

    NEW.is_approved_founder_creator := OLD.is_approved_founder_creator;
    NEW.promo_90_approved_at := OLD.promo_90_approved_at;
    NEW.custom_creator_rate := OLD.custom_creator_rate;
    NEW.creator_ultimate_pack := OLD.creator_ultimate_pack;
    NEW.creator_ultimate_pack_expires_at := OLD.creator_ultimate_pack_expires_at;
    NEW.ai_free_until := OLD.ai_free_until;
    NEW.ai_agent_active := OLD.ai_agent_active;
    NEW.content_ops_enabled := OLD.content_ops_enabled;
    NEW.legal_audit_enabled := OLD.legal_audit_enabled;
    NEW.promo_status := OLD.promo_status;
    NEW.promo_reviewed_at := OLD.promo_reviewed_at;
    NEW.connection_points := OLD.connection_points;
    NEW.wingman_credits := OLD.wingman_credits;

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

    -- Preserve server-managed wingman_credits inside privacy_settings
    IF NEW.privacy_settings IS NOT NULL THEN
      old_wingman := OLD.privacy_settings -> 'wingman_credits';
      IF old_wingman IS NOT NULL THEN
        NEW.privacy_settings := jsonb_set(
          NEW.privacy_settings,
          '{wingman_credits}',
          old_wingman,
          true
        );
      ELSIF (NEW.privacy_settings ? 'wingman_credits') THEN
        NEW.privacy_settings := jsonb_set(
          NEW.privacy_settings,
          '{wingman_credits}',
          '10'::jsonb,
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
