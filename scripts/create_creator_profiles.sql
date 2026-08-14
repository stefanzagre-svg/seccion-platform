-- SECCION: Dual-Persona Creator Architecture
-- Purpose: Create creator_profiles table to separate Creator data from Member data
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  creator_archetype text,
  specialization text,
  creator_purposes jsonb DEFAULT '[]'::jsonb,
  video_presentation_url text,
  creator_bio text,
  tier_price numeric,
  face_blur_active boolean DEFAULT true,
  tax_residence text,
  sexual_preference text,
  relationship_goals jsonb DEFAULT '[]'::jsonb,
  relationship_types jsonb DEFAULT '[]'::jsonb,
  is_adult_content boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Creators can read and update their own profile
CREATE POLICY "Users can read their own creator profile" 
ON public.creator_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own creator profile" 
ON public.creator_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own creator profile" 
ON public.creator_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Public can read basic creator data (if needed by frontend UI)
CREATE POLICY "Public can view creator profiles" 
ON public.creator_profiles FOR SELECT 
USING (true);
