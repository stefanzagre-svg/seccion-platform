-- ========================================================
-- ADD SEXUAL PREFERENCES JSONB COLUMN TO PROFILES TABLE
-- ========================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sexual_preferences JSONB DEFAULT NULL;

-- Populate existing rows for compatibility
UPDATE public.profiles
SET sexual_preferences = jsonb_build_array(sexual_preference)
WHERE sexual_preference IS NOT NULL AND sexual_preferences IS NULL;
