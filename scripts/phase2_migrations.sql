-- ========================================================
-- PHASE 2: DATABASE MIGRATIONS
-- ========================================================

-- 1. Profiles Table Enhancements (Archetypes, XP/Points, Quest Progression)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS connection_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quest_stage INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS archetype TEXT;

-- 2. Messages Table Enhancements (Interactive Suggestion Moves)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_suggestion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suggestion_move_id TEXT,
ADD COLUMN IF NOT EXISTS suggestion_status TEXT DEFAULT 'pending'; -- 'pending', 'accepted', 'rejected'
