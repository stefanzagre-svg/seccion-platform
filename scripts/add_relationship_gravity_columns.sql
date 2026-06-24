-- ========================================================
-- Add Conversation Gravity and Traits columns to Relationships table
-- ========================================================

ALTER TABLE public.relationships
ADD COLUMN IF NOT EXISTS gravity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gravity_summary TEXT,
ADD COLUMN IF NOT EXISTS gravity_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS extracted_traits TEXT[];

COMMENT ON COLUMN public.relationships.gravity_score IS 'AI-determined conversation gravity/momentum score (-100 to 100)';
COMMENT ON COLUMN public.relationships.gravity_summary IS 'AI summary of the relationship health';
COMMENT ON COLUMN public.relationships.extracted_traits IS 'Mutual personality traits extracted from the chat logs';
