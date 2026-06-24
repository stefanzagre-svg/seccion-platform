-- ========================================================
-- SUGGESTION CACHE TABLE & POLICIES
-- ========================================================

CREATE TABLE IF NOT EXISTS public.suggestion_caches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    suggestions JSONB NOT NULL,
    model_version TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for fast search and counting
CREATE INDEX IF NOT EXISTS idx_suggestion_caches_user_id ON public.suggestion_caches(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_caches_created_at ON public.suggestion_caches(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.suggestion_caches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own suggestion cache" ON public.suggestion_caches;
DROP POLICY IF EXISTS "Users can insert their own suggestion cache" ON public.suggestion_caches;
DROP POLICY IF EXISTS "Users can update their own suggestion cache" ON public.suggestion_caches;

-- RLS Policies
CREATE POLICY "Users can view their own suggestion cache"
ON public.suggestion_caches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestion cache"
ON public.suggestion_caches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestion cache"
ON public.suggestion_caches FOR UPDATE
USING (auth.uid() = user_id);
