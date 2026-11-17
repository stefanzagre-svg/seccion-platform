-- ============================================================================
-- SECCION Closed-Loop Funnel & VIP Invite Link Telemetry Schema (Milestone 2)
-- Run in Supabase SQL Editor (service role) to persist real creator & member
-- step progression, time-on-step, and drop-off signals for Bayesian calibration.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.funnel_step_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  vip_code TEXT NULL,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'member')),
  country_code TEXT NOT NULL DEFAULT 'XX',
  locale TEXT NOT NULL DEFAULT 'en',
  device_type TEXT NOT NULL DEFAULT 'desktop_chrome',
  utm_source TEXT NULL,
  funnel_step TEXT NOT NULL CHECK (
    funnel_step IN (
      '1_entry',
      '2_registration',
      '3_profile_quest',
      '4_discovery_swipe',
      '5_first_action',
      '6_verification',
      '7_payment_payout'
    )
  ),
  raw_step TEXT NULL,
  event_action TEXT NOT NULL CHECK (
    event_action IN ('step_enter', 'step_complete', 'validation_error', 'cta_click', 'abandon_signal')
  ),
  duration_ms INTEGER NULL CHECK (duration_ms IS NULL OR duration_ms >= 0),
  detail TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funnel_telemetry_cohort
  ON public.funnel_step_telemetry (funnel_step, role, country_code, device_type);

CREATE INDEX IF NOT EXISTS idx_funnel_telemetry_vip_code
  ON public.funnel_step_telemetry (vip_code, created_at DESC)
  WHERE vip_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_funnel_telemetry_session
  ON public.funnel_step_telemetry (session_id, created_at DESC);

ALTER TABLE public.funnel_step_telemetry ENABLE ROW LEVEL SECURITY;

-- Service role performs all inserts and cohort aggregations via /api/v2/telemetry/funnel
DROP POLICY IF EXISTS "Service role full access on funnel_step_telemetry" ON public.funnel_step_telemetry;
CREATE POLICY "Service role full access on funnel_step_telemetry"
  ON public.funnel_step_telemetry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
