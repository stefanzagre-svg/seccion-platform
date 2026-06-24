-- ==========================================
-- CALENDAR & STREAM INTEGRATION SCHEMAS
-- ==========================================

-- 1. CALENDAR EVENTS TABLE
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

-- RLS setup for calendar
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public calendar events are viewable by everyone." 
ON public.calendar_events FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own calendar events." 
ON public.calendar_events FOR ALL USING (auth.uid() = creator_id);


-- 2. LIVE STREAMS STATUS TABLE
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

-- RLS setup for streams
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live streams are viewable by everyone." 
ON public.live_streams FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own stream." 
ON public.live_streams FOR ALL USING (auth.uid() = creator_id);

CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
