-- 1. Add Age and Height columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER;

-- 2. Create index on search criteria for performance
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_height ON public.profiles(height);

-- 3. Populate existing users with sample data for testing search filters
UPDATE public.profiles SET age = 24, height = 168 WHERE username = 'hf1_rebel';
UPDATE public.profiles SET age = 25, height = 170 WHERE username = 'hf2_seeker';
UPDATE public.profiles SET age = 22, height = 165 WHERE username = 'hf3_dreamer';
UPDATE public.profiles SET age = 29, height = 180 WHERE username = 'hm1_provider';
UPDATE public.profiles SET age = 31, height = 182 WHERE username = 'hm2_caretaker';

UPDATE public.profiles SET age = 24, height = 167 WHERE username = 'af1_seductive';
UPDATE public.profiles SET age = 27, height = 165 WHERE username = 'af2_nurturing';
UPDATE public.profiles SET age = 26, height = 173 WHERE username = 'af3_intellectual';
UPDATE public.profiles SET age = 28, height = 185 WHERE username = 'am1_dominant';
UPDATE public.profiles SET age = 25, height = 178 WHERE username = 'am2_adventurous';
UPDATE public.profiles SET age = 23, height = 176 WHERE username = 'am3_playful';

-- Fallback defaults for any other mock profiles
UPDATE public.profiles 
SET age = floor(random() * (35 - 20 + 1) + 20)::INTEGER, 
    height = floor(random() * (190 - 160 + 1) + 160)::INTEGER
WHERE age IS NULL OR height IS NULL;
