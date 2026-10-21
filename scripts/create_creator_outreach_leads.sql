-- =============================================================================
-- SECCION Autonomous Creator Outreach Suite — Supabase CRM & Rate Ledger Schema
-- Enforces strict Row-Level Security (RLS) for service_role / Admin Dashboard
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.creator_outreach_leads (
    id BIGSERIAL PRIMARY KEY,
    target_uuid TEXT UNIQUE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'x', 'twitter', 'tiktok', 'facebook')),
    official_seccion_account TEXT NOT NULL,
    handle_masked TEXT NOT NULL,
    handle_raw TEXT,
    display_name TEXT,
    profile_url TEXT,
    followers_count INTEGER NOT NULL DEFAULT 0,
    primary_archetype TEXT NOT NULL CHECK (
        primary_archetype IN ('digital_content_creator', 'live_streamer', 'online_coach', 'micro_influencer')
    ),
    portfolio_bucket TEXT NOT NULL,
    is_adult_explicit BOOLEAN NOT NULL DEFAULT FALSE,
    native_language TEXT NOT NULL DEFAULT 'en',
    native_language_label TEXT NOT NULL DEFAULT 'English',
    contact_emails TEXT,
    contact_telegram TEXT,
    contact_whatsapp TEXT,
    external_links_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    promo_plan_fit TEXT NOT NULL DEFAULT 'QUALIFIED_CREATOR_AND_PROMO',
    routing_decision TEXT NOT NULL,
    authenticity_probability NUMERIC(5,4) NOT NULL DEFAULT 0.0,
    qualification_confidence NUMERIC(5,4) NOT NULL DEFAULT 0.0,
    shap_rationale_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    warmup_comment TEXT,
    curated_dm_text TEXT,
    dm_char_count INTEGER NOT NULL DEFAULT 0,
    hitl_status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (
        hitl_status IN ('PENDING_APPROVAL', 'APPROVED', 'SENT', 'REJECTED', 'BLACKLISTED', 'SKIPPED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_outreach_leads_status
    ON public.creator_outreach_leads (hitl_status, platform);

CREATE INDEX IF NOT EXISTS idx_creator_outreach_leads_language
    ON public.creator_outreach_leads (native_language);

ALTER TABLE public.creator_outreach_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_outreach_leads" ON public.creator_outreach_leads;
CREATE POLICY "service_role_full_access_outreach_leads"
    ON public.creator_outreach_leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
