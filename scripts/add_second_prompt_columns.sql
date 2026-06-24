-- ========================================================
-- ADD COLUMN FOR SECOND RELATIONAL PROMPT TO PROFILES TABLE
-- ========================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio_prompt_category_2 TEXT,
ADD COLUMN IF NOT EXISTS bio_prompt_question_2 TEXT,
ADD COLUMN IF NOT EXISTS bio_prompt_answer_2 TEXT,
ADD COLUMN IF NOT EXISTS bio_analysis_2 JSONB DEFAULT NULL;
