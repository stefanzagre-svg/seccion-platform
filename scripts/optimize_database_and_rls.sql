-- =================================================================================
-- SECCION PLATFORM: Performance & Security Optimization Migration
-- Applies B-Tree indexes for scaling and hardens Storage Bucket RLS
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------------------

-- Optimize user role lookups (e.g. filtering creators vs members)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);

-- Optimize relationship engine queries (e.g. fetching matches by level)
CREATE INDEX IF NOT EXISTS idx_relationships_target_level ON public.relationships USING btree (target_id, current_level);

-- Optimize feed content queries (fetching by creator and ordering by time)
CREATE INDEX IF NOT EXISTS idx_platform_content_creator ON public.platform_content USING btree (creator_id);
CREATE INDEX IF NOT EXISTS idx_platform_content_created_at ON public.platform_content USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_content_type ON public.platform_content USING btree (content_type);

-- ---------------------------------------------------------------------------------
-- 2. STORAGE BUCKET ROW LEVEL SECURITY (RLS) HARDENING
-- ---------------------------------------------------------------------------------
-- Note: These apply to Supabase's `storage.objects` table.

-- Ensure the buckets exist (avoids errors if they don't)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false) 
ON CONFLICT (id) DO UPDATE SET public = false;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- Policy: Avatars (Public Read, Authenticated Write)
-- --------------------------------------------------
-- Allow anyone to view avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload/update their own avatars
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND 
    auth.uid() = owner
);

-- --------------------------------------------------
-- Policy: KYC Documents (Strictly Private)
-- --------------------------------------------------
-- Allow users to read their own KYC docs, but NO ONE else (not even public)
DROP POLICY IF EXISTS "Users can read their own KYC documents" ON storage.objects;
CREATE POLICY "Users can read their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND 
    auth.uid() = owner
);

-- Allow users to upload their own KYC docs
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc-documents' AND 
    auth.uid() = owner
);

-- Note: The Supabase Service Role (admin) automatically bypasses RLS to read all KYC docs for verification.
