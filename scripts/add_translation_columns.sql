-- SQL migration script to add Live Translation & Quota columns

-- 1. Add translation settings toggles and creator promo review fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS text_translation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS speech_translation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_ultimate_pack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_ultimate_pack_expires_at TIMESTAMP WITH TIME ZONE DEFAULT null,
ADD COLUMN IF NOT EXISTS promo_creator_link TEXT DEFAULT null,
ADD COLUMN IF NOT EXISTS promo_status TEXT DEFAULT 'none', -- 'none' | 'pending' | 'approved' | 'rejected'
ADD COLUMN IF NOT EXISTS promo_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT null;

-- 2. Quota Table to track Speech-to-Speech (S2ST) usage (5-min/24h resets for Members)
CREATE TABLE IF NOT EXISTS public.translation_quotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    speech_seconds_used_today INTEGER DEFAULT 0,
    last_quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Audit Logs to track sessions and billing (GDPR compliant)
CREATE TABLE IF NOT EXISTS public.translation_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL, -- 'TEXT' | 'SPEECH'
    duration_seconds INTEGER DEFAULT 0,
    characters_count INTEGER DEFAULT 0,
    cost_charged NUMERIC(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for performance when querying quota info
CREATE INDEX IF NOT EXISTS idx_translation_quotas_profile ON public.translation_quotas(profile_id);
