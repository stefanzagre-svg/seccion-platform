-- Add education_level and career columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS career TEXT;

-- Create indexes for potential matching algorithms
CREATE INDEX IF NOT EXISTS idx_profiles_education_level ON public.profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_career ON public.profiles(career);
