-- ========================================================
-- ADD MEMBER PROFILE PROMPT COLUMNS FOR RELATIONAL INSIGHTS
-- ========================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio_prompt_category TEXT,
ADD COLUMN IF NOT EXISTS bio_prompt_question TEXT,
ADD COLUMN IF NOT EXISTS bio_prompt_answer TEXT,
ADD COLUMN IF NOT EXISTS bio_analysis JSONB DEFAULT NULL;
