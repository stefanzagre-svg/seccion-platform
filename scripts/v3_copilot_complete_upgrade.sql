-- =========================================================================
-- SECCION AI COPILOT 2.0: COMPLETE ARCHITECTURE MIGRATION
-- Priorities:
-- 1. Hardened audit logs & telemetry
-- 2. Obsidian Markdown Vault notes with bidirectional links
-- 3. Hierarchical Conversation Goals (Global, by-RLS, per-Member)
-- 4. Multi-turn Sales Pitch Ramp state tracking
-- 5. Granular Intent & Media Restrictions Matrix
-- 6. Pre-approved Creator Copilot Media Vault & deduplicated dispatch log
-- =========================================================================

-- 1. Extend AI Interaction Logs with Security & Sentiment Telemetry
ALTER TABLE public.ai_interaction_logs
ADD COLUMN IF NOT EXISTS flagged_intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS pii_redacted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS redacted_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS whale_escalated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS execution_status VARCHAR(20) DEFAULT 'success',
ADD COLUMN IF NOT EXISTS latency_emulated_ms INT DEFAULT 0;

-- 2. Obsidian Markdown Vault Notes
CREATE TABLE IF NOT EXISTS public.creator_vault_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    note_type VARCHAR(30) NOT NULL CHECK (note_type IN ('PERSONA', 'MEMBER_DOSSIER', 'TOPIC', 'BOUNDARY')),
    target_member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    outgoing_links TEXT[] DEFAULT '{}',
    frontmatter JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(creator_id, title)
);

-- 3. Hierarchical Conversation Goals Table
CREATE TABLE IF NOT EXISTS public.copilot_interaction_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('GLOBAL', 'RLS_LEVEL', 'MEMBER_SPECIFIC')),
    rls_level_key VARCHAR(50),
    target_member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN (
        'DISCOVERY', 'SUBSCRIBE_VIP', 'BOOK_CONSULTATION', 
        'PLAN_VIDEO_CALL', 'PROMOTE_STREAM', 'CROWDFUND_GOAL', 'HUMAN_ESCALATION'
    )),
    custom_pitch_instructions TEXT,
    target_cta_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_goal_scope UNIQUE NULLS NOT DISTINCT (creator_id, scope_type, rls_level_key, target_member_id)
);

-- 4. Multi-Turn Sales Pitch Calibration Tracker
CREATE TABLE IF NOT EXISTS public.copilot_sales_ramps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    active_goal_type VARCHAR(50) NOT NULL,
    current_step INT NOT NULL DEFAULT 1 CHECK (current_step IN (1, 2, 3)), -- 1: Need Identification, 2: Tease Solution, 3: Deliver CTA
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false,
    UNIQUE(creator_id, member_id, active_goal_type)
);

-- 5. Granular Intent & Media Restriction Table
CREATE TABLE IF NOT EXISTS public.copilot_intent_restrictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('GLOBAL', 'RLS_LEVEL', 'MEMBER_SPECIFIC')),
    rls_level_key VARCHAR(50),
    target_member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    allow_photos BOOLEAN DEFAULT true,
    allow_videos BOOLEAN DEFAULT true,
    allow_voice_notes BOOLEAN DEFAULT false,
    
    block_in_person_meetups BOOLEAN DEFAULT true,
    block_off_platform_financials BOOLEAN DEFAULT true,
    block_financial_crypto_advice BOOLEAN DEFAULT true,
    block_nsfw_text BOOLEAN DEFAULT false,
    max_auto_replies_per_day INT DEFAULT 20,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_restriction_scope UNIQUE NULLS NOT DISTINCT (creator_id, scope_type, rls_level_key, target_member_id)
);

-- 6. Dedicated Creator Copilot Media Vault (Pre-Approved Assets)
CREATE TABLE IF NOT EXISTS public.copilot_media_vault (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
    title VARCHAR(100) NOT NULL,
    tag VARCHAR(50) NOT NULL, -- 'greeting', 'workout', 'coffee', 'voice_thankyou'
    min_rls_score INT DEFAULT 0,
    is_ppv BOOLEAN DEFAULT false,
    price_cents INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    max_uses_per_fan INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Media Dispatch Logs
CREATE TABLE IF NOT EXISTS public.copilot_media_dispatches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vault_media_id UUID NOT NULL REFERENCES public.copilot_media_vault(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- UNIVERSAL ROW-LEVEL SECURITY HARDENING (RLS)
-- =========================================================================
ALTER TABLE public.creator_vault_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_interaction_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_sales_ramps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_intent_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_media_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_media_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vault notes owner isolation" ON public.creator_vault_notes;
CREATE POLICY "Vault notes owner isolation" 
ON public.creator_vault_notes FOR ALL TO authenticated 
USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Goals owner isolation" ON public.copilot_interaction_goals;
CREATE POLICY "Goals owner isolation" 
ON public.copilot_interaction_goals FOR ALL TO authenticated 
USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Ramps creator isolation" ON public.copilot_sales_ramps;
CREATE POLICY "Ramps creator isolation" 
ON public.copilot_sales_ramps FOR ALL TO authenticated 
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Restrictions owner isolation" ON public.copilot_intent_restrictions;
CREATE POLICY "Restrictions owner isolation" 
ON public.copilot_intent_restrictions FOR ALL TO authenticated 
USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Media vault owner isolation" ON public.copilot_media_vault;
CREATE POLICY "Media vault owner isolation" 
ON public.copilot_media_vault FOR ALL TO authenticated 
USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Media dispatches creator view" ON public.copilot_media_dispatches;
CREATE POLICY "Media dispatches creator view" 
ON public.copilot_media_dispatches FOR SELECT TO authenticated 
USING (auth.uid() = creator_id);
