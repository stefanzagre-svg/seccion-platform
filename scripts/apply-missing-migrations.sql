-- ========================================================
-- SESSION — Consolidated Missing Migrations
-- 
-- Adds missing columns and tables for later features:
--   - Core Passion, Gender, and Moods for Matchmaking
--   - Relational Prompts (Stage 1 & 2) for Onboarding Quest
--   - Live Translation & S2ST Quotas
--   - Content Moderation Status
--
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/sfthjyawyxjlbyszjkiu
-- ========================================================

-- 1. Extend public.profiles with missing features
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS core_passion TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS moods TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_prompt_category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_prompt_question TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_prompt_answer TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_analysis JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_prompt_category_2 TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_prompt_question_2 TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_prompt_answer_2 TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio_analysis_2 JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS text_translation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS speech_translation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_ultimate_pack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_ultimate_pack_expires_at TIMESTAMP WITH TIME ZONE DEFAULT null,
ADD COLUMN IF NOT EXISTS promo_creator_link TEXT DEFAULT null,
ADD COLUMN IF NOT EXISTS promo_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS promo_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT null;

-- 2. Extend public.platform_content with moderation status
ALTER TABLE public.platform_content 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';

-- Enforce CHECK constraint on moderation status
ALTER TABLE public.platform_content
DROP CONSTRAINT IF EXISTS chk_moderation_status,
ADD CONSTRAINT chk_moderation_status CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Set default for new rows to 'pending' (existing rows stay 'approved')
ALTER TABLE public.platform_content ALTER COLUMN moderation_status SET DEFAULT 'pending';

-- 3. Create Live Translation tables
CREATE TABLE IF NOT EXISTS public.translation_quotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    speech_seconds_used_today INTEGER DEFAULT 0,
    last_quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.translation_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL, -- 'TEXT' | 'SPEECH'
    duration_seconds INTEGER DEFAULT 0,
    characters_count INTEGER DEFAULT 0,
    cost_charged NUMERIC(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and Create Policies for Translation tables
ALTER TABLE public.translation_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own translation quota" ON public.translation_quotas;
CREATE POLICY "Users can view their own translation quota"
ON public.translation_quotas FOR SELECT
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view their own translation audit logs" ON public.translation_audit_logs;
CREATE POLICY "Users can view their own translation audit logs"
ON public.translation_audit_logs FOR SELECT
USING (auth.uid() = profile_id);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_translation_quotas_profile ON public.translation_quotas(profile_id);
