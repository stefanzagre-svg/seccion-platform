-- ==============================================================================
-- SECCION Platform: Universal Row-Level Security (RLS) & Trust Column Protection
-- Fixes Supabase Alert: "Table publicly accessible" (rls_disabled_in_public)
-- Safe & Idempotent: Automatically skips any table not present in public schema
-- ==============================================================================

DO $$
DECLARE
  tbl text;
  all_tables text[] := ARRAY[
    'profiles',
    'creator_profiles',
    'messages',
    'interactions',
    'relationships',
    'blocked_users',
    'platform_content',
    'profile_media',
    'subscriptions',
    'user_wallets',
    'matrix_transactions',
    'creator_payout_settings',
    'creator_earnings_ledger',
    'ratings',
    'creator_goals',
    'goal_contributions',
    'calendar_events',
    'live_streams',
    'session_intent_plans',
    'user_xp_profiles',
    'boost_pass_transactions',
    'suggestion_moves',
    'suggestion_caches',
    'creator_google_tokens',
    'translation_quotas',
    'translation_audit_logs',
    'rate_limits',
    'ai_interaction_logs',
    'feed_ab_clicks',
    'feed_ab_impressions',
    'crm_outreach_leads',
    'bug_reports',
    'creator_applications',
    'member_waitlist',
    'admin_audit_logs',
    'content_moderation_queue',
    'platform_settings'
  ];
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    END IF;
  END LOOP;
END;
$$;

-- Helper procedure to safely drop & recreate policies only if the table exists
CREATE OR REPLACE FUNCTION pg_temp.safe_policy(
  p_table text,
  p_name text,
  p_cmd text
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF to_regclass('public.' || p_table) IS NOT NULL THEN
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_name, p_table);
    EXECUTE p_cmd;
  END IF;
EXCEPTION
  WHEN undefined_table OR undefined_column THEN
    RAISE NOTICE 'Skipped policy "%" on public.% (table or column not present)', p_name, p_table;
END;
$$;

-- 1. PROFILES & DUAL-PERSONA TABLES
SELECT pg_temp.safe_policy('profiles', 'Public can view basic profiles',
  'CREATE POLICY "Public can view basic profiles" ON public.profiles FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('profiles', 'Users can update own profile',
  'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)');
SELECT pg_temp.safe_policy('profiles', 'Users can insert own profile',
  'CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)');

SELECT pg_temp.safe_policy('creator_profiles', 'Public can view creator profiles',
  'CREATE POLICY "Public can view creator profiles" ON public.creator_profiles FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('creator_profiles', 'Creators can manage own creator profile',
  'CREATE POLICY "Creators can manage own creator profile" ON public.creator_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id)');

-- 2. MESSAGES & INTERACTIONS (PRIVATE DATA)
SELECT pg_temp.safe_policy('messages', 'Users can view their own messages',
  'CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id)');
SELECT pg_temp.safe_policy('messages', 'Users can send messages as themselves',
  'CREATE POLICY "Users can send messages as themselves" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id)');
SELECT pg_temp.safe_policy('messages', 'Users can update their own messages',
  'CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id)');

SELECT pg_temp.safe_policy('interactions', 'Users can view their own interactions',
  'CREATE POLICY "Users can view their own interactions" ON public.interactions FOR SELECT USING (auth.uid() = actor_id OR auth.uid() = target_id)');
SELECT pg_temp.safe_policy('interactions', 'Users can insert their own interactions',
  'CREATE POLICY "Users can insert their own interactions" ON public.interactions FOR INSERT WITH CHECK (auth.uid() = actor_id)');

SELECT pg_temp.safe_policy('relationships', 'Users can view their own relationships',
  'CREATE POLICY "Users can view their own relationships" ON public.relationships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_id)');
SELECT pg_temp.safe_policy('relationships', 'Users can manage their own relationships',
  'CREATE POLICY "Users can manage their own relationships" ON public.relationships FOR ALL USING (auth.uid() = user_id)');

SELECT pg_temp.safe_policy('blocked_users', 'Users can view their own blocks',
  'CREATE POLICY "Users can view their own blocks" ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id)');
SELECT pg_temp.safe_policy('blocked_users', 'Users can manage their own blocks',
  'CREATE POLICY "Users can manage their own blocks" ON public.blocked_users FOR ALL USING (auth.uid() = blocker_id)');

-- 3. MEDIA, CONTENT & PLATFORM DISCOVERY
SELECT pg_temp.safe_policy('platform_content', 'Public can view platform content',
  'CREATE POLICY "Public can view platform content" ON public.platform_content FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('platform_content', 'Creators can manage their own platform content',
  'CREATE POLICY "Creators can manage their own platform content" ON public.platform_content FOR ALL USING (auth.uid() = creator_id)');

SELECT pg_temp.safe_policy('profile_media', 'Public can view profile media',
  'CREATE POLICY "Public can view profile media" ON public.profile_media FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('profile_media', 'Users can manage their own profile media',
  'CREATE POLICY "Users can manage their own profile media" ON public.profile_media FOR ALL USING (auth.uid() = user_id)');

-- 4. FINANCIAL, SUBSCRIPTIONS & TOKEN WALLETS
SELECT pg_temp.safe_policy('subscriptions', 'Users can view their own subscriptions',
  'CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = creator_id)');
SELECT pg_temp.safe_policy('user_wallets', 'Users can view own wallet',
  'CREATE POLICY "Users can view own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id)');
SELECT pg_temp.safe_policy('matrix_transactions', 'Users can view own transactions',
  'CREATE POLICY "Users can view own transactions" ON public.matrix_transactions FOR SELECT USING (auth.uid() = user_id)');
SELECT pg_temp.safe_policy('creator_payout_settings', 'Creators can view and manage own payout settings',
  'CREATE POLICY "Creators can view and manage own payout settings" ON public.creator_payout_settings FOR ALL USING (auth.uid() = creator_id)');
SELECT pg_temp.safe_policy('creator_earnings_ledger', 'Creators can view own earnings ledger',
  'CREATE POLICY "Creators can view own earnings ledger" ON public.creator_earnings_ledger FOR SELECT USING (auth.uid() = creator_id)');

-- 5. CROWDFUNDING, RATINGS & CALENDAR STREAMS
SELECT pg_temp.safe_policy('ratings', 'Anyone can view ratings',
  'CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('ratings', 'Authenticated users can rate',
  'CREATE POLICY "Authenticated users can rate" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id)');
SELECT pg_temp.safe_policy('creator_goals', 'Public can view creator goals',
  'CREATE POLICY "Public can view creator goals" ON public.creator_goals FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('creator_goals', 'Creators can manage own goals',
  'CREATE POLICY "Creators can manage own goals" ON public.creator_goals FOR ALL USING (auth.uid() = creator_id)');
SELECT pg_temp.safe_policy('goal_contributions', 'Public can view goal contributions',
  'CREATE POLICY "Public can view goal contributions" ON public.goal_contributions FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('goal_contributions', 'Members can log contributions',
  'CREATE POLICY "Members can log contributions" ON public.goal_contributions FOR INSERT WITH CHECK (auth.uid() = contributor_id)');
SELECT pg_temp.safe_policy('calendar_events', 'Public can view calendar events',
  'CREATE POLICY "Public can view calendar events" ON public.calendar_events FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('calendar_events', 'Creators can manage calendar events',
  'CREATE POLICY "Creators can manage calendar events" ON public.calendar_events FOR ALL USING (auth.uid() = creator_id)');
SELECT pg_temp.safe_policy('live_streams', 'Public can view live streams',
  'CREATE POLICY "Public can view live streams" ON public.live_streams FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('live_streams', 'Creators can manage own live stream',
  'CREATE POLICY "Creators can manage own live stream" ON public.live_streams FOR ALL USING (auth.uid() = creator_id)');
SELECT pg_temp.safe_policy('session_intent_plans', 'Matched users can view dating plans',
  'CREATE POLICY "Matched users can view dating plans" ON public.session_intent_plans FOR SELECT USING (EXISTS (SELECT 1 FROM public.relationships r WHERE r.is_matched = true AND ((r.user_id = auth.uid() AND r.target_id = poster_user_uuid) OR (r.target_id = auth.uid() AND r.user_id = poster_user_uuid))) OR auth.uid() = poster_user_uuid)');
SELECT pg_temp.safe_policy('session_intent_plans', 'Users can manage own dating plans',
  'CREATE POLICY "Users can manage own dating plans" ON public.session_intent_plans FOR ALL USING (auth.uid() = poster_user_uuid)');

-- 6. XP, SUGGESTIONS & CACHES
SELECT pg_temp.safe_policy('user_xp_profiles', 'Public can read XP profiles',
  'CREATE POLICY "Public can read XP profiles" ON public.user_xp_profiles FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('boost_pass_transactions', 'Users can view their boost pass transactions',
  'CREATE POLICY "Users can view their boost pass transactions" ON public.boost_pass_transactions FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id)');
SELECT pg_temp.safe_policy('boost_pass_transactions', 'Users can send boost passes',
  'CREATE POLICY "Users can send boost passes" ON public.boost_pass_transactions FOR INSERT WITH CHECK (auth.uid() = sender_id)');
SELECT pg_temp.safe_policy('boost_pass_transactions', 'Users can update boost passes',
  'CREATE POLICY "Users can update boost passes" ON public.boost_pass_transactions FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id)');
SELECT pg_temp.safe_policy('suggestion_moves', 'Public can view suggestion moves',
  'CREATE POLICY "Public can view suggestion moves" ON public.suggestion_moves FOR SELECT USING (true)');
SELECT pg_temp.safe_policy('suggestion_caches', 'Users can manage own suggestion cache',
  'CREATE POLICY "Users can manage own suggestion cache" ON public.suggestion_caches FOR ALL USING (auth.uid() = user_id)');

-- 7. SENSITIVE CREDENTIALS, LOGS & RATE LIMITS
SELECT pg_temp.safe_policy('creator_google_tokens', 'Creators manage own Google tokens',
  'CREATE POLICY "Creators manage own Google tokens" ON public.creator_google_tokens FOR ALL USING (auth.uid() = creator_id)');
SELECT pg_temp.safe_policy('translation_quotas', 'Users view own translation quota',
  'CREATE POLICY "Users view own translation quota" ON public.translation_quotas FOR SELECT USING (auth.uid() = profile_id)');
SELECT pg_temp.safe_policy('translation_audit_logs', 'Users view own translation audit logs',
  'CREATE POLICY "Users view own translation audit logs" ON public.translation_audit_logs FOR SELECT USING (auth.uid() = profile_id)');
SELECT pg_temp.safe_policy('rate_limits', 'Rate limits service role only',
  'CREATE POLICY "Rate limits service role only" ON public.rate_limits FOR ALL USING (auth.role() = ''service_role'')');
SELECT pg_temp.safe_policy('ai_interaction_logs', 'Users view own AI interaction logs',
  'CREATE POLICY "Users view own AI interaction logs" ON public.ai_interaction_logs FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id)');

-- 8. TELEMETRY, CRM & BUG REPORTS
SELECT pg_temp.safe_policy('feed_ab_clicks', 'Users can log their clicks',
  'CREATE POLICY "Users can log their clicks" ON public.feed_ab_clicks FOR INSERT WITH CHECK (auth.uid() = user_id)');
SELECT pg_temp.safe_policy('feed_ab_clicks', 'Users view own clicks',
  'CREATE POLICY "Users view own clicks" ON public.feed_ab_clicks FOR SELECT USING (auth.uid() = user_id)');
SELECT pg_temp.safe_policy('feed_ab_impressions', 'Users can log impressions',
  'CREATE POLICY "Users can log impressions" ON public.feed_ab_impressions FOR INSERT WITH CHECK (auth.uid() = user_id)');
SELECT pg_temp.safe_policy('feed_ab_impressions', 'Users view own impressions',
  'CREATE POLICY "Users view own impressions" ON public.feed_ab_impressions FOR SELECT USING (auth.uid() = user_id)');
SELECT pg_temp.safe_policy('crm_outreach_leads', 'CRM leads service role only',
  'CREATE POLICY "CRM leads service role only" ON public.crm_outreach_leads FOR ALL USING (auth.role() = ''service_role'')');
SELECT pg_temp.safe_policy('bug_reports', 'Public can submit bug reports',
  'CREATE POLICY "Public can submit bug reports" ON public.bug_reports FOR INSERT WITH CHECK (true)');
SELECT pg_temp.safe_policy('bug_reports', 'Users view own bug reports',
  'CREATE POLICY "Users view own bug reports" ON public.bug_reports FOR SELECT USING (auth.uid() = reporter_id)');

-- 9. PRELAUNCH FORMS & ADMIN PLATFORM TABLES
SELECT pg_temp.safe_policy('creator_applications', 'Public can submit creator applications',
  'CREATE POLICY "Public can submit creator applications" ON public.creator_applications FOR INSERT WITH CHECK (true)');
SELECT pg_temp.safe_policy('creator_applications', 'Service role manages creator applications',
  'CREATE POLICY "Service role manages creator applications" ON public.creator_applications FOR ALL USING (auth.role() = ''service_role'')');
SELECT pg_temp.safe_policy('member_waitlist', 'Public can join waitlist',
  'CREATE POLICY "Public can join waitlist" ON public.member_waitlist FOR INSERT WITH CHECK (true)');
SELECT pg_temp.safe_policy('member_waitlist', 'Service role manages waitlist',
  'CREATE POLICY "Service role manages waitlist" ON public.member_waitlist FOR ALL USING (auth.role() = ''service_role'')');
SELECT pg_temp.safe_policy('admin_audit_logs', 'Admins can view audit logs',
  'CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = ''admin'' OR username = ''stefan'')))');
SELECT pg_temp.safe_policy('content_moderation_queue', 'Users can flag content',
  'CREATE POLICY "Users can flag content" ON public.content_moderation_queue FOR INSERT WITH CHECK (auth.uid() = reporter_id)');
SELECT pg_temp.safe_policy('content_moderation_queue', 'Admins manage moderation queue',
  'CREATE POLICY "Admins manage moderation queue" ON public.content_moderation_queue FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = ''admin'' OR username = ''stefan'')))');
SELECT pg_temp.safe_policy('platform_settings', 'Admins manage platform settings',
  'CREATE POLICY "Admins manage platform settings" ON public.platform_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = ''admin'' OR username = ''stefan'')))');

-- ============================================================================
-- 10. PROTECT SERVER-ONLY TRUST & PRIVILEGE COLUMNS ON public.profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_trust_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  jwt_role text := COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
    ''
  );
  is_trusted_backend boolean := (
    jwt_role = 'service_role'
    OR (jwt_role = '' AND session_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin'))
  );
  new_tier text;
  old_tier text;
BEGIN
  IF is_trusted_backend THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_kyc_verified := false;
    IF NEW.platform_role IS DISTINCT FROM 'user' THEN
      NEW.platform_role := 'user';
    END IF;
    IF NEW.privacy_settings IS NOT NULL AND (NEW.privacy_settings ? 'age_verification') THEN
      new_tier := COALESCE(NEW.privacy_settings #>> '{age_verification,verificationTier}', 'declared');
      IF new_tier <> 'declared' THEN
        NEW.privacy_settings := jsonb_set(
          NEW.privacy_settings,
          '{age_verification,verificationTier}',
          '"declared"'::jsonb,
          true
        );
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.is_kyc_verified := OLD.is_kyc_verified;
    NEW.platform_role := OLD.platform_role;
    IF NEW.privacy_settings IS NOT NULL AND (NEW.privacy_settings ? 'age_verification') THEN
      new_tier := COALESCE(NEW.privacy_settings #>> '{age_verification,verificationTier}', 'declared');
      old_tier := COALESCE(OLD.privacy_settings #>> '{age_verification,verificationTier}', 'declared');
      IF new_tier <> 'declared' AND new_tier IS DISTINCT FROM old_tier THEN
        NEW.privacy_settings := jsonb_set(
          NEW.privacy_settings,
          '{age_verification,verificationTier}',
          to_jsonb(old_tier),
          true
        );
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_trust_columns ON public.profiles;

CREATE TRIGGER trg_protect_profile_trust_columns
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_trust_columns();
