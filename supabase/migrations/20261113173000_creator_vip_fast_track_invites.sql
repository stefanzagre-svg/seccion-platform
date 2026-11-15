-- ============================================================================
-- VIP FAST-TRACK CREATOR INVITES & YEAR-1 FOUNDING PERKS MIGRATION
-- Run once in Supabase SQL Editor (postgres / service_role)
-- ============================================================================

-- Ensure profiles has all columns needed for Year-1 90% split & 1-year Free AI pack
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_approved_founder_creator BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS promo_90_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_creator_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS ai_agent_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS content_ops_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_free_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.creator_vip_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  creator_name TEXT,
  social_handle TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  email TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  niche TEXT,
  morocco_shield BOOLEAN NOT NULL DEFAULT false,
  ai_free_months INTEGER NOT NULL DEFAULT 12,
  founding_split INTEGER NOT NULL DEFAULT 90,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses_count INTEGER NOT NULL DEFAULT 0,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_by_user_id UUID,
  claimed_email TEXT,
  claimed_at TIMESTAMPTZ,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_vip_invites_uses_chk CHECK (uses_count >= 0 AND max_uses >= 1 AND uses_count <= max_uses)
);

CREATE INDEX IF NOT EXISTS idx_creator_vip_invites_code ON public.creator_vip_invites (code);
CREATE INDEX IF NOT EXISTS idx_creator_vip_invites_created_at ON public.creator_vip_invites (created_at DESC);

ALTER TABLE public.creator_vip_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to creator_vip_invites" ON public.creator_vip_invites;
CREATE POLICY "Service role full access to creator_vip_invites"
  ON public.creator_vip_invites
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Atomic FOR UPDATE invite claim RPC preventing race-condition double claims
CREATE OR REPLACE FUNCTION public.claim_creator_vip_invite(
  p_code TEXT,
  p_user_id UUID,
  p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.creator_vip_invites%ROWTYPE;
  v_clean_email TEXT := LOWER(TRIM(COALESCE(p_email, '')));
BEGIN
  SELECT *
  INTO v_invite
  FROM public.creator_vip_invites
  WHERE code = TRIM(p_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF v_invite.is_revoked THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'revoked');
  END IF;

  IF v_invite.expires_at <= NOW() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  -- Idempotent re-claim by the same user who already claimed it
  IF v_invite.claimed_by_user_id = p_user_id THEN
    RETURN jsonb_build_object('ok', true, 'already_claimed_by_self', true, 'invite', to_jsonb(v_invite));
  END IF;

  IF v_invite.email IS NOT NULL AND TRIM(v_invite.email) <> '' AND LOWER(TRIM(v_invite.email)) <> v_clean_email THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'email_mismatch');
  END IF;

  IF v_invite.uses_count >= v_invite.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  UPDATE public.creator_vip_invites
  SET
    uses_count = uses_count + 1,
    claimed_by_user_id = COALESCE(claimed_by_user_id, p_user_id),
    claimed_email = COALESCE(claimed_email, NULLIF(v_clean_email, '')),
    claimed_at = COALESCE(claimed_at, NOW()),
    updated_at = NOW()
  WHERE id = v_invite.id
  RETURNING * INTO v_invite;

  RETURN jsonb_build_object('ok', true, 'already_claimed_by_self', false, 'invite', to_jsonb(v_invite));
END;
$$;

REVOKE ALL ON FUNCTION public.claim_creator_vip_invite(TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_creator_vip_invite(TEXT, UUID, TEXT) TO service_role;
