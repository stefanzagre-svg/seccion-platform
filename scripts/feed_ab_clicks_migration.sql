-- =========================================================
-- FEED A/B TESTING & TELEMETRY MIGRATION
-- =========================================================

-- 1. Add A/B Test Group column to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ab_group TEXT CHECK (ab_group IN ('A', 'B'));

COMMENT ON COLUMN public.profiles.ab_group IS 'A = Compatibility-Prioritized Feed, B = Engagement-Prioritized Feed';

-- 2. Create Feed Telemetry Clicks Table
CREATE TABLE IF NOT EXISTS public.feed_ab_clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ab_group TEXT NOT NULL CHECK (ab_group IN ('A', 'B')),
    post_id TEXT NOT NULL,
    creator_id TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.feed_ab_clicks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can insert their own clicks" 
ON public.feed_ab_clicks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clicks" 
ON public.feed_ab_clicks 
FOR SELECT 
USING (auth.uid() = user_id);
