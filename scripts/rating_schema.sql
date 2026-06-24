-- SQL Migration: Creator & Member Rating Schema
-- Enables unique rating rows per rater/ratee connection, ensuring members can rate a creator only once.

CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ratee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    c1 DECIMAL(3,2) NOT NULL, -- Content Quality (Creator) / Kindness (Member)
    c2 DECIMAL(3,2) NOT NULL, -- Content Exclusivity (Creator) / Communication experience (Member)
    c3 DECIMAL(3,2) NOT NULL, -- Communication experience (Creator) / Attractiveness (Member)
    c4 DECIMAL(3,2) NOT NULL, -- Attractiveness (Creator) / Creator Support or Common Interests (Member)
    c5 DECIMAL(3,2),          -- Kindness (Creator only, NULL for members)
    calculated_score DECIMAL(4,2) NOT NULL, -- Normalized score out of 20.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT rater_ratee_unique UNIQUE(rater_id, ratee_id)
);

-- Index for quick score aggregation on profiles
CREATE INDEX IF NOT EXISTS ratings_ratee_id_idx ON public.ratings(ratee_id);
