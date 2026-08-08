-- Migration: Add Member Purpose Logic Architecture Columns
-- Applies to: public.profiles

-- 1. Add active purposes array to track which intents the member has currently enabled
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active_purposes TEXT[] DEFAULT '{}';

-- 2. Add specific fields for Growth & Lifestyle
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS income_bracket TEXT;

-- 3. Add specific fields for Dating & Intimate matching
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dealbreakers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS love_languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS nsfw_boundaries JSONB DEFAULT '[]'::jsonb;

-- Create basic indexes to optimize matching queries on active purposes
CREATE INDEX IF NOT EXISTS idx_profiles_active_purposes ON public.profiles USING GIN(active_purposes);
