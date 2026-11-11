-- =============================================================================
-- SECCION Platform: Consolidated Profile Schema Synchronization Script
-- File: web/supabase/migrations/20261104031500_sync_all_missing_profile_columns.sql
-- Purpose:
--   Resolves PostgreSQL ERROR 42703 ("column profiles.<col> does not exist")
--   across Creator & Member Onboarding, Studio Settings, and Member Profile Edit
--   by adding the 16 columns from historical migration scripts that were not
--   yet applied to production `public.profiles`.
-- =============================================================================

BEGIN;

-- 1. Media & Privacy (from add_face_blur_columns.sql & onboarding album logic)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS album_photos TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS album_media JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS face_blur_active BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS avatar_face_coordinates JSONB DEFAULT NULL;

-- 2. Location & Residence (from location_expansion_migration.sql & RegistrationGate)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS residence TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS native_town TEXT,
  ADD COLUMN IF NOT EXISTS current_location TEXT;

-- 3. Creator & Studio Capabilities (from add_ai_assistant_columns.sql & specialization_migration.sql)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creator_purposes TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS specialization_tags TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS content_ops_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS legal_audit_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Member Demographics & Advanced Search (from add_education_career_columns.sql & advanced_search_migration.sql)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS career TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age IS NULL OR (age >= 18 AND age <= 120)),
  ADD COLUMN IF NOT EXISTS height INTEGER CHECK (height IS NULL OR (height >= 100 AND height <= 250));

-- 5. Performance Indexes for Discovery & Filtering
CREATE INDEX IF NOT EXISTS idx_profiles_residence ON public.profiles(residence);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_height ON public.profiles(height);
CREATE INDEX IF NOT EXISTS idx_profiles_specialization_tags ON public.profiles USING GIN (specialization_tags);
CREATE INDEX IF NOT EXISTS idx_profiles_creator_purposes ON public.profiles USING GIN (creator_purposes);

COMMIT;

-- Reload PostgREST schema cache immediately so API routes see the new columns
NOTIFY pgrst, 'reload schema';
