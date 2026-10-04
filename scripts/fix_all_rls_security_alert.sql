-- ==============================================================================
-- UNIVERSAL ZERO-TRUST FIX: REMEDY "Table publicly accessible" (rls_disabled_in_public)
-- 
-- Fix: Skips internal extension tables (e.g. PostGIS 'spatial_ref_sys') owned
-- by Postgres superusers, targeting ONLY user-created public tables.
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = false
          -- Exclude PostGIS and internal extension system tables
          AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    ) LOOP
        RAISE NOTICE 'Enabling RLS on exposed table: %', r.tablename;
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- 2. Preserve anonymous insert for prelaunch forms (waitlist, applications)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'creator_applications') THEN
        DROP POLICY IF EXISTS "Public can submit creator applications" ON public.creator_applications;
        CREATE POLICY "Public can submit creator applications" ON public.creator_applications FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "Service role manages creator applications" ON public.creator_applications;
        CREATE POLICY "Service role manages creator applications" ON public.creator_applications FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'member_waitlist') THEN
        DROP POLICY IF EXISTS "Public can join waitlist" ON public.member_waitlist;
        CREATE POLICY "Public can join waitlist" ON public.member_waitlist FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "Service role manages waitlist" ON public.member_waitlist;
        CREATE POLICY "Service role manages waitlist" ON public.member_waitlist FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bug_reports') THEN
        DROP POLICY IF EXISTS "Public can submit bug reports" ON public.bug_reports;
        CREATE POLICY "Public can submit bug reports" ON public.bug_reports FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "Users view own bug reports" ON public.bug_reports;
        CREATE POLICY "Users view own bug reports" ON public.bug_reports FOR SELECT USING (auth.uid() = reporter_id);
    END IF;
END $$;

-- 3. Verification Query: Confirm all user tables have RLS enabled
SELECT 
    tablename, 
    rowsecurity AS rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
ORDER BY tablename ASC;
