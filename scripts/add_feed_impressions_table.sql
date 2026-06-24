-- =========================================================
-- FEED A/B TESTING IMPRESSIONS & POLICY UPGRADE MIGRATION
-- =========================================================

-- 1. Create Feed Telemetry Impressions Table
CREATE TABLE IF NOT EXISTS public.feed_ab_impressions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ab_group TEXT NOT NULL CHECK (ab_group IN ('A', 'B')),
    post_id TEXT NOT NULL,
    creator_id TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on Impressions
ALTER TABLE public.feed_ab_impressions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies on Impressions
DROP POLICY IF EXISTS "Users can insert their own impressions" ON public.feed_ab_impressions;
CREATE POLICY "Users can insert their own impressions" 
ON public.feed_ab_impressions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own impressions" ON public.feed_ab_impressions;
CREATE POLICY "Users can view their own impressions" 
ON public.feed_ab_impressions 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Creators can view impressions on their own posts" ON public.feed_ab_impressions;
CREATE POLICY "Creators can view impressions on their own posts"
ON public.feed_ab_impressions
FOR SELECT
USING (auth.uid()::text = creator_id);

-- 4. RLS Policy Upgrade on Clicks
DROP POLICY IF EXISTS "Creators can view clicks on their own posts" ON public.feed_ab_clicks;
CREATE POLICY "Creators can view clicks on their own posts"
ON public.feed_ab_clicks
FOR SELECT
USING (auth.uid()::text = creator_id);
