-- ============================================================================
-- SECCION P0 SECURITY MIGRATION (Stage 1)
-- File: web/supabase/migrations/20261115060000_p0_security_rpc_and_profile_column_lockdown.sql
-- Purpose:
--   1. Revoke PUBLIC / anon / authenticated EXECUTE on privileged SECURITY DEFINER
--      financial, wallet, wingman-credit, and admin telemetry RPCs.
--   2. Ensure all financial/entitlement columns on public.profiles exist and lock
--      them + privacy_settings trust/credit keys inside protect_profile_trust_columns().
--   3. Eliminate the hardcoded `username = 'stefan'` RLS backdoor on admin tables
--      and enforce `platform_role IN ('admin', 'super_admin')`.
-- Run once in Supabase SQL Editor as `postgres` / `service_role`.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Ensure protected columns exist on public.profiles before trigger compilation
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS platform_role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_approved_founder_creator BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS promo_90_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_creator_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS ai_agent_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS content_ops_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_audit_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_free_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS creator_ultimate_pack BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS creator_ultimate_pack_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS promo_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS promo_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS connection_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wingman_credits INTEGER DEFAULT 10;

-- ----------------------------------------------------------------------------
-- 2. Revoke PUBLIC / anon / authenticated EXECUTE on sensitive SECURITY DEFINER RPCs
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  fn_sig TEXT;
  fn_sigs TEXT[] := ARRAY[
    'public.credit_wallet_for_order(text, uuid, integer, text, text, text, numeric, numeric, numeric, numeric, text, text, text, text, jsonb)',
    'public.escrow_lock_dual_wallet(uuid, numeric, text, uuid, text, text, text, text, timestamp with time zone)',
    'public.escrow_refund_dual_wallet(uuid, text)',
    'public.consume_wingman_credit(uuid, integer)',
    'public.add_wingman_credits(uuid, integer)',
    'public.get_platform_kpis()',
    'public.get_user_growth_timeseries(integer)',
    'public.get_revenue_timeseries(integer)',
    'public.get_moderation_stats()',
    'public.claim_creator_vip_invite(text, uuid, text)'
  ];
BEGIN
  FOREACH fn_sig IN ARRAY fn_sigs LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn_sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn_sig);
    EXCEPTION
      WHEN undefined_function THEN
        RAISE NOTICE 'Skipping absent RPC signature: %', fn_sig;
    END;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Upgrade protect_profile_trust_columns() to lock ALL privilege & V3 columns
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 4. Eliminate hardcoded username = 'stefan' RLS policies on admin tables
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.admin_audit_logs') IS NOT NULL THEN
    ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
    DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.admin_audit_logs;
    CREATE POLICY "Admins can view audit logs"
      ON public.admin_audit_logs
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
        )
      );
  ELSE
    RAISE NOTICE 'Skipping absent table: public.admin_audit_logs';
  END IF;

  IF to_regclass('public.content_moderation_queue') IS NOT NULL THEN
    ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins manage moderation queue" ON public.content_moderation_queue;
    DROP POLICY IF EXISTS "Admins can view moderation queue" ON public.content_moderation_queue;
    DROP POLICY IF EXISTS "Admins can update moderation queue" ON public.content_moderation_queue;
    CREATE POLICY "Admins manage moderation queue"
      ON public.content_moderation_queue
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
        )
      );
  ELSE
    RAISE NOTICE 'Skipping absent table: public.content_moderation_queue';
  END IF;

  IF to_regclass('public.platform_settings') IS NOT NULL THEN
    ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins manage platform settings" ON public.platform_settings;
    DROP POLICY IF EXISTS "Admins can view platform settings" ON public.platform_settings;
    DROP POLICY IF EXISTS "Super admins can update platform settings" ON public.platform_settings;
    CREATE POLICY "Admins manage platform settings"
      ON public.platform_settings
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
        )
      );
  ELSE
    RAISE NOTICE 'Skipping absent table: public.platform_settings';
  END IF;

  IF to_regclass('public.bug_reports') IS NOT NULL THEN
    ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins full access on bug reports" ON public.bug_reports;
    CREATE POLICY "Admins full access on bug reports"
      ON public.bug_reports
      FOR ALL
      USING (
        auth.role() = 'service_role'
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
        )
      );
  ELSE
    RAISE NOTICE 'Skipping absent table: public.bug_reports';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. Sealed Compliance Consents Ledger (SnapSign Explicit Move Consent Proof)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL DEFAULT 'snapsign_explicit_move',
  move_id TEXT NOT NULL,
  move_label TEXT,
  signature_name TEXT NOT NULL,
  consent_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own compliance consents" ON public.compliance_consents;
CREATE POLICY "Users can view own compliance consents"
  ON public.compliance_consents
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all compliance consents" ON public.compliance_consents;
CREATE POLICY "Admins can view all compliance consents"
  ON public.compliance_consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
    )
  );

-- Ensure creator_profiles has kyc_status for DIDIT webhook sync
DO $$
BEGIN
  IF to_regclass('public.creator_profiles') IS NOT NULL THEN
    ALTER TABLE public.creator_profiles
      ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'unverified';
  END IF;
END $$;

COMMIT;

NOTIFY pgrst, 'reload schema';
