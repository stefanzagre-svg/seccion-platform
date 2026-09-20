-- ==============================================================================
-- SECCION Platform: Universal Row-Level Security (RLS) Remediation Script
-- Fixes Supabase Alert: "Table publicly accessible" (rls_disabled_in_public)
-- Enables RLS on ALL database tables and establishes zero-trust access control.
-- ==============================================================================

-- 1. PROFILES & DUAL-PERSONA TABLES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creator_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
CREATE POLICY "Public can view basic profiles"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view creator profiles" ON public.creator_profiles;
CREATE POLICY "Public can view creator profiles"
ON public.creator_profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Creators can manage own creator profile" ON public.creator_profiles;
CREATE POLICY "Creators can manage own creator profile"
ON public.creator_profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- 2. MESSAGES & INTERACTIONS (PRIVATE DATA)
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages as themselves" ON public.messages;
CREATE POLICY "Users can send messages as themselves"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can view their own interactions" ON public.interactions;
CREATE POLICY "Users can view their own interactions"
ON public.interactions FOR SELECT
USING (auth.uid() = actor_id OR auth.uid() = target_id);

DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.interactions;
CREATE POLICY "Users can insert their own interactions"
ON public.interactions FOR INSERT
WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can view their own relationships" ON public.relationships;
CREATE POLICY "Users can view their own relationships"
ON public.relationships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = target_id);

DROP POLICY IF EXISTS "Users can manage their own relationships" ON public.relationships;
CREATE POLICY "Users can manage their own relationships"
ON public.relationships FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
CREATE POLICY "Users can view their own blocks"
ON public.blocked_users FOR SELECT
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS "Users can manage their own blocks" ON public.blocked_users;
CREATE POLICY "Users can manage their own blocks"
ON public.blocked_users FOR ALL
USING (auth.uid() = blocker_id);


-- 3. MEDIA, CONTENT & PLATFORM DISCOVERY
ALTER TABLE IF EXISTS public.platform_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view platform content" ON public.platform_content;
CREATE POLICY "Public can view platform content"
ON public.platform_content FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Creators can manage their own platform content" ON public.platform_content;
CREATE POLICY "Creators can manage their own platform content"
ON public.platform_content FOR ALL
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Public can view profile media" ON public.profile_media;
CREATE POLICY "Public can view profile media"
ON public.profile_media FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can manage their own profile media" ON public.profile_media;
CREATE POLICY "Users can manage their own profile media"
ON public.profile_media FOR ALL
USING (auth.uid() = user_id);


-- 4. FINANCIAL, SUBSCRIPTIONS & TOKEN WALLETS
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matrix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creator_payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creator_earnings_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
CREATE POLICY "Users can view own wallet"
ON public.user_wallets FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.matrix_transactions;
CREATE POLICY "Users can view own transactions"
ON public.matrix_transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Creators can view and manage own payout settings" ON public.creator_payout_settings;
CREATE POLICY "Creators can view and manage own payout settings"
ON public.creator_payout_settings FOR ALL
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can view own earnings ledger" ON public.creator_earnings_ledger;
CREATE POLICY "Creators can view own earnings ledger"
ON public.creator_earnings_ledger FOR SELECT
USING (auth.uid() = creator_id);


-- 5. CROWDFUNDING, RATINGS & CALENDAR STREAMS
ALTER TABLE IF EXISTS public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creator_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_intent_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;
CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can rate" ON public.ratings;
CREATE POLICY "Authenticated users can rate"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Public can view creator goals" ON public.creator_goals;
CREATE POLICY "Public can view creator goals"
ON public.creator_goals FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Creators can manage own goals" ON public.creator_goals;
CREATE POLICY "Creators can manage own goals"
ON public.creator_goals FOR ALL
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Public can view goal contributions" ON public.goal_contributions;
CREATE POLICY "Public can view goal contributions"
ON public.goal_contributions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Members can log contributions" ON public.goal_contributions;
CREATE POLICY "Members can log contributions"
ON public.goal_contributions FOR INSERT
WITH CHECK (auth.uid() = contributor_id);

DROP POLICY IF EXISTS "Public can view calendar events" ON public.calendar_events;
CREATE POLICY "Public can view calendar events"
ON public.calendar_events FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Creators can manage calendar events" ON public.calendar_events;
CREATE POLICY "Creators can manage calendar events"
ON public.calendar_events FOR ALL
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Public can view live streams" ON public.live_streams;
CREATE POLICY "Public can view live streams"
ON public.live_streams FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Creators can manage own live stream" ON public.live_streams;
CREATE POLICY "Creators can manage own live stream"
ON public.live_streams FOR ALL
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Matched users can view dating plans" ON public.session_intent_plans;
CREATE POLICY "Matched users can view dating plans"
ON public.session_intent_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.relationships r
    WHERE r.is_matched = true 
    AND ((r.user_id = auth.uid() AND r.target_id = poster_user_uuid) 
      OR (r.target_id = auth.uid() AND r.user_id = poster_user_uuid))
  )
  OR auth.uid() = poster_user_uuid
);

DROP POLICY IF EXISTS "Users can manage own dating plans" ON public.session_intent_plans;
CREATE POLICY "Users can manage own dating plans"
ON public.session_intent_plans FOR ALL
USING (auth.uid() = poster_user_uuid);


-- 6. XP, SUGGESTIONS & CACHES
ALTER TABLE IF EXISTS public.user_xp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.boost_pass_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suggestion_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suggestion_caches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read XP profiles" ON public.user_xp_profiles;
CREATE POLICY "Public can read XP profiles"
ON public.user_xp_profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can view their boost pass transactions" ON public.boost_pass_transactions;
CREATE POLICY "Users can view their boost pass transactions"
ON public.boost_pass_transactions FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send boost passes" ON public.boost_pass_transactions;
CREATE POLICY "Users can send boost passes"
ON public.boost_pass_transactions FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update boost passes" ON public.boost_pass_transactions;
CREATE POLICY "Users can update boost passes"
ON public.boost_pass_transactions FOR UPDATE
USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "Public can view suggestion moves" ON public.suggestion_moves;
CREATE POLICY "Public can view suggestion moves"
ON public.suggestion_moves FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can manage own suggestion cache" ON public.suggestion_caches;
CREATE POLICY "Users can manage own suggestion cache"
ON public.suggestion_caches FOR ALL
USING (auth.uid() = user_id);


-- 7. SENSITIVE CREDENTIALS, LOGS & RATE LIMITS
ALTER TABLE IF EXISTS public.creator_google_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.translation_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.translation_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators manage own Google tokens" ON public.creator_google_tokens;
CREATE POLICY "Creators manage own Google tokens"
ON public.creator_google_tokens FOR ALL
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users view own translation quota" ON public.translation_quotas;
CREATE POLICY "Users view own translation quota"
ON public.translation_quotas FOR SELECT
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users view own translation audit logs" ON public.translation_audit_logs;
CREATE POLICY "Users view own translation audit logs"
ON public.translation_audit_logs FOR SELECT
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Rate limits service role only" ON public.rate_limits;
CREATE POLICY "Rate limits service role only"
ON public.rate_limits FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users view own AI interaction logs" ON public.ai_interaction_logs;
CREATE POLICY "Users view own AI interaction logs"
ON public.ai_interaction_logs FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);


-- 8. TELEMETRY, CRM & BUG REPORTS
ALTER TABLE IF EXISTS public.feed_ab_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_ab_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can log their clicks" ON public.feed_ab_clicks;
CREATE POLICY "Users can log their clicks"
ON public.feed_ab_clicks FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own clicks" ON public.feed_ab_clicks;
CREATE POLICY "Users view own clicks"
ON public.feed_ab_clicks FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log impressions" ON public.feed_ab_impressions;
CREATE POLICY "Users can log impressions"
ON public.feed_ab_impressions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own impressions" ON public.feed_ab_impressions;
CREATE POLICY "Users view own impressions"
ON public.feed_ab_impressions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "CRM leads service role only" ON public.crm_outreach_leads;
CREATE POLICY "CRM leads service role only"
ON public.crm_outreach_leads FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can submit bug reports" ON public.bug_reports;
CREATE POLICY "Public can submit bug reports"
ON public.bug_reports FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own bug reports" ON public.bug_reports;
CREATE POLICY "Users view own bug reports"
ON public.bug_reports FOR SELECT
USING (auth.uid() = reporter_id);


-- 9. PRELAUNCH FORMS & ADMIN PLATFORM TABLES
ALTER TABLE IF EXISTS public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.member_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit creator applications" ON public.creator_applications;
CREATE POLICY "Public can submit creator applications"
ON public.creator_applications FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages creator applications" ON public.creator_applications;
CREATE POLICY "Service role manages creator applications"
ON public.creator_applications FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can join waitlist" ON public.member_waitlist;
CREATE POLICY "Public can join waitlist"
ON public.member_waitlist FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages waitlist" ON public.member_waitlist;
CREATE POLICY "Service role manages waitlist"
ON public.member_waitlist FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR username = 'stefan')
  )
);

DROP POLICY IF EXISTS "Users can flag content" ON public.content_moderation_queue;
CREATE POLICY "Users can flag content"
ON public.content_moderation_queue FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins manage moderation queue" ON public.content_moderation_queue;
CREATE POLICY "Admins manage moderation queue"
ON public.content_moderation_queue FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR username = 'stefan')
  )
);

DROP POLICY IF EXISTS "Admins manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins manage platform settings"
ON public.platform_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR username = 'stefan')
  )
);
