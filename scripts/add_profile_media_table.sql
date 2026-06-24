-- =========================================================
-- PROFILE MEDIA GALLERY MIGRATION (PUBLIC & HIDDEN ALBUMS)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.profile_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    is_hidden BOOLEAN DEFAULT false,
    required_level TEXT DEFAULT 'public', -- 'public', 'subscriber', or connection level key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profile_media ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can select public profile media
CREATE POLICY "Public profile media is viewable by everyone." 
ON public.profile_media FOR SELECT USING (true);

-- 2. Users can insert their own media
CREATE POLICY "Users can insert their own media." 
ON public.profile_media FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own media
CREATE POLICY "Users can update their own media." 
ON public.profile_media FOR UPDATE USING (auth.uid() = user_id);

-- 4. Users can delete their own media
CREATE POLICY "Users can delete their own media." 
ON public.profile_media FOR DELETE USING (auth.uid() = user_id);

-- Apply updated_at trigger
CREATE TRIGGER update_profile_media_updated_at 
BEFORE UPDATE ON public.profile_media 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
