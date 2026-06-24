-- ==========================================
-- GOOGLE CALENDAR OAUTH TOKENS & SYNC SCHEMA
-- ==========================================

-- 1. Create creator_google_tokens table
CREATE TABLE IF NOT EXISTS public.creator_google_tokens (
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    google_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.creator_google_tokens ENABLE ROW LEVEL SECURITY;

-- Creators can perform all actions on their own tokens
DROP POLICY IF EXISTS "Creators can manage their own Google tokens" ON public.creator_google_tokens;
CREATE POLICY "Creators can manage their own Google tokens" 
ON public.creator_google_tokens FOR ALL 
USING (auth.uid() = creator_id);

-- 2. Add google_event_id to calendar_events if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'calendar_events' 
          AND column_name = 'google_event_id'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN google_event_id TEXT;
    END IF;
END $$;
