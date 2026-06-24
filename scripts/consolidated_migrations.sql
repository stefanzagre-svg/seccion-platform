-- ========================================================
-- CONSOLIDATED DATABASE MIGRATION SCRIPT
-- Phase 2 + Phase 3 + Telemetry Additions
-- ========================================================

-- 1. PROFILES TABLE ENHANCEMENTS (PHASE 2 & PHASE 3)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS connection_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quest_stage INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS archetype TEXT,
ADD COLUMN IF NOT EXISTS ab_group TEXT CHECK (ab_group IN ('A', 'B')),
ADD COLUMN IF NOT EXISTS sexual_preferences JSONB DEFAULT NULL;

COMMENT ON COLUMN public.profiles.ab_group IS 'A = Compatibility-Prioritized Feed, B = Engagement-Prioritized Feed';


-- 2. MESSAGES TABLE & POLICIES FOR REALTIME CHAT (PHASE 1 & PHASE 2 ENHANCEMENTS)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_suggestion BOOLEAN DEFAULT false,
    suggestion_move_id TEXT,
    suggestion_status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent collision on re-run
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages as themselves" ON public.messages;

-- RLS Policies for Messages
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages as themselves" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Enable real-time for the messages table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Try to add table to publication. Ignore if already added.
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
      -- Table is already in the publication
    END;
  END IF;
END $$;


-- 3. SUGGESTION CACHE TABLE & POLICIES (PHASE 2 CACHING)
CREATE TABLE IF NOT EXISTS public.suggestion_caches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    suggestions JSONB NOT NULL,
    model_version TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestion_caches_user_id ON public.suggestion_caches(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_caches_created_at ON public.suggestion_caches(created_at);

ALTER TABLE public.suggestion_caches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own suggestion cache" ON public.suggestion_caches;
DROP POLICY IF EXISTS "Users can insert their own suggestion cache" ON public.suggestion_caches;
DROP POLICY IF EXISTS "Users can update their own suggestion cache" ON public.suggestion_caches;

CREATE POLICY "Users can view their own suggestion cache"
ON public.suggestion_caches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestion cache"
ON public.suggestion_caches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestion cache"
ON public.suggestion_caches FOR UPDATE
USING (auth.uid() = user_id);


-- 4. RATINGS SCHEMA (PHASE 3 RATING SYSTEM)
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

CREATE INDEX IF NOT EXISTS ratings_ratee_id_idx ON public.ratings(ratee_id);

-- Enable RLS for Ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can rate" ON public.ratings;

CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);


-- 5. CROWDFUNDING & GOALS SCHEMA (PHASE 3 GOALS)
CREATE TABLE IF NOT EXISTS public.creator_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (current_amount >= 0),
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID REFERENCES public.creator_goals(id) ON DELETE CASCADE NOT NULL,
    contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS creator_goals_creator_id_idx ON public.creator_goals(creator_id);
CREATE INDEX IF NOT EXISTS goal_contributions_goal_id_idx ON public.goal_contributions(goal_id);

ALTER TABLE public.creator_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creator goals are viewable by everyone" ON public.creator_goals;
DROP POLICY IF EXISTS "Goal contributions are viewable by everyone" ON public.goal_contributions;
DROP POLICY IF EXISTS "Creators can manage their own goals" ON public.creator_goals;
DROP POLICY IF EXISTS "Members can log contributions" ON public.goal_contributions;

CREATE POLICY "Creator goals are viewable by everyone" ON public.creator_goals FOR SELECT USING (true);
CREATE POLICY "Goal contributions are viewable by everyone" ON public.goal_contributions FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own goals" ON public.creator_goals 
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Members can log contributions" ON public.goal_contributions
    FOR INSERT WITH CHECK (auth.uid() = contributor_id);

DROP TRIGGER IF EXISTS update_creator_goals_updated_at ON public.creator_goals;
CREATE TRIGGER update_creator_goals_updated_at BEFORE UPDATE ON public.creator_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 6. CALENDAR EVENTS SCHEMA (PHASE 3 CALENDAR)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT DEFAULT 'public' CHECK (type IN ('public', 'vip', 'master')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public calendar events are viewable by everyone." ON public.calendar_events;
DROP POLICY IF EXISTS "Creators can manage their own calendar events." ON public.calendar_events;

CREATE POLICY "Public calendar events are viewable by everyone." 
ON public.calendar_events FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own calendar events." 
ON public.calendar_events FOR ALL USING (auth.uid() = creator_id);


-- 7. LIVE STREAMS STATUS SCHEMA (PHASE 3 LIVE STREAMS)
CREATE TABLE IF NOT EXISTS public.live_streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    is_live BOOLEAN DEFAULT false,
    viewer_count INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    stream_key TEXT,
    playback_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Live streams are viewable by everyone." ON public.live_streams;
DROP POLICY IF EXISTS "Creators can manage their own stream." ON public.live_streams;

CREATE POLICY "Live streams are viewable by everyone." 
ON public.live_streams FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own stream." 
ON public.live_streams FOR ALL USING (auth.uid() = creator_id);

DROP TRIGGER IF EXISTS update_live_streams_updated_at ON public.live_streams;
CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 8. STRIPE FIELD ON SUBSCRIPTIONS (PHASE 3 BILLING)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_id_idx ON public.subscriptions(stripe_subscription_id);


-- 9. FEED A/B TESTING & CLICK TELEMETRY (PHASE 2 & TELEMETRY SUMMARY)
CREATE TABLE IF NOT EXISTS public.feed_ab_clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ab_group TEXT NOT NULL CHECK (ab_group IN ('A', 'B')),
    post_id TEXT NOT NULL,
    creator_id TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feed_ab_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own clicks" ON public.feed_ab_clicks;
DROP POLICY IF EXISTS "Users can view their own clicks" ON public.feed_ab_clicks;

CREATE POLICY "Users can insert their own clicks" 
ON public.feed_ab_clicks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clicks" 
ON public.feed_ab_clicks 
FOR SELECT 
USING (auth.uid() = user_id);
