-- ============================================================================
-- SECCION PLATFORM — COMPREHENSIVE ROW LEVEL SECURITY (RLS) HARDENING SCRIPT
-- Resolves Supabase Security Advisor: "Table publicly accessible (rls_disabled_in_public)"
-- ============================================================================

-- 1. AUTOMATIC RLS ENFORCEMENT ON ALL APPLICATION TABLES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    ) 
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
            RAISE NOTICE 'RLS Enabled on: public.%', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipped system table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;


-- ============================================================================
-- 2. EXPLICIT RLS POLICIES FOR LIVE SERVICES
-- ============================================================================

-- A. Translation Quotas
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own translation quota" ON public.translation_quotas;
    CREATE POLICY "Users can view their own translation quota" 
    ON public.translation_quotas FOR SELECT USING (auth.uid() = profile_id);

    DROP POLICY IF EXISTS "Users can update their own translation quota" ON public.translation_quotas;
    CREATE POLICY "Users can update their own translation quota" 
    ON public.translation_quotas FOR UPDATE USING (auth.uid() = profile_id);

    DROP POLICY IF EXISTS "Users can insert their own translation quota" ON public.translation_quotas;
    CREATE POLICY "Users can insert their own translation quota" 
    ON public.translation_quotas FOR INSERT WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN undefined_table THEN null; END $$;

-- B. Translation Audit Logs
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own translation audit logs" ON public.translation_audit_logs;
    CREATE POLICY "Users can view their own translation audit logs" 
    ON public.translation_audit_logs FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION WHEN undefined_table THEN null; END $$;

-- C. Creator Applications
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can submit creator applications" ON public.creator_applications;
    CREATE POLICY "Public can submit creator applications" 
    ON public.creator_applications FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can view their own application by email or auth" ON public.creator_applications;
    CREATE POLICY "Users can view their own application by email or auth" 
    ON public.creator_applications FOR SELECT USING (auth.jwt() ->> 'email' = email);
EXCEPTION WHEN undefined_table THEN null; END $$;

-- D. Member Waitlist
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can join member waitlist" ON public.member_waitlist;
    CREATE POLICY "Public can join member waitlist" 
    ON public.member_waitlist FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can view their own waitlist entry" ON public.member_waitlist;
    CREATE POLICY "Users can view their own waitlist entry" 
    ON public.member_waitlist FOR SELECT USING (auth.jwt() ->> 'email' = email);
EXCEPTION WHEN undefined_table THEN null; END $$;

-- E. Suggestion Caches
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own suggestion cache" ON public.suggestion_caches;
    CREATE POLICY "Users can view their own suggestion cache" 
    ON public.suggestion_caches FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own suggestion cache" ON public.suggestion_caches;
    CREATE POLICY "Users can insert their own suggestion cache" 
    ON public.suggestion_caches FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own suggestion cache" ON public.suggestion_caches;
    CREATE POLICY "Users can update their own suggestion cache" 
    ON public.suggestion_caches FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN null; END $$;

-- F. Feed A/B Clicks
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert their own feed clicks" ON public.feed_ab_clicks;
    CREATE POLICY "Users can insert their own feed clicks" 
    ON public.feed_ab_clicks FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can view their own feed clicks" ON public.feed_ab_clicks;
    CREATE POLICY "Users can view their own feed clicks" 
    ON public.feed_ab_clicks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN null; END $$;

-- G. CRM Leads (Admin Service-Role Only)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Service role access on CRM leads" ON public.crm_outreach_leads;
    CREATE POLICY "Service role access on CRM leads" 
    ON public.crm_outreach_leads FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN undefined_table THEN null; END $$;

-- ============================================================================
-- 3. VERIFICATION (Displays any remaining user tables without RLS - should return 0)
-- ============================================================================
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
  AND rowsecurity = false;
