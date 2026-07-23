-- SECCIØN PLATFORM — CREATOR SPECIALIZATION & ADULT CONTENT SAFEGUARD MIGRATION
-- Adds specialization metadata and 18+ content flags to public.profiles

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT DEFAULT 'beauty';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_adult_content BOOLEAN DEFAULT false;

-- Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS profiles_specialization_idx ON public.profiles(specialization);
CREATE INDEX IF NOT EXISTS profiles_is_adult_content_idx ON public.profiles(is_adult_content);

-- Update sample creator profiles with initial specializations
UPDATE public.profiles 
SET specialization = 'beauty', specialization_tags = ARRAY['#MakeupGlowUp', '#SkincareTips', '#EveningGlam'], is_adult_content = false
WHERE role = 'creator' AND (username ILIKE '%beauty%' OR username ILIKE '%makeup%');

UPDATE public.profiles 
SET specialization = 'style', specialization_tags = ARRAY['#DateStyle', '#WardrobeAudit', '#FitCheck'], is_adult_content = false
WHERE role = 'creator' AND (username ILIKE '%style%' OR username ILIKE '%fashion%');

UPDATE public.profiles 
SET specialization = 'culinary', specialization_tags = ARRAY['#RomanticRecipes', '#CookAlong', '#ImpressionDinner'], is_adult_content = false
WHERE role = 'creator' AND (username ILIKE '%chef%' OR username ILIKE '%cook%');

UPDATE public.profiles 
SET specialization = 'dating', specialization_tags = ARRAY['#DatingCoach', '#OpenerAdvice', '#ChemistryCoach'], is_adult_content = false
WHERE role = 'creator' AND (username ILIKE '%coach%' OR username ILIKE '%advice%');
