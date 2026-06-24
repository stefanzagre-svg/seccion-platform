-- ========================================================
-- ADMIN DASHBOARD SCHEMA MIGRATION
-- Adds: platform_role, audit_logs, moderation queue,
--        platform settings, admin RPC functions
-- ========================================================

-- 1. Add platform_role to profiles (admin RBAC)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_role_enum') THEN
    CREATE TYPE platform_role_enum AS ENUM ('user', 'moderator', 'admin', 'super_admin');
  END IF;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS platform_role TEXT DEFAULT 'user'
  CHECK (platform_role IN ('user', 'moderator', 'admin', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_platform_role ON public.profiles(platform_role);

-- 2. Admin Audit Logs — Immutable, append-only
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,                    -- 'user.suspend', 'role.change', 'setting.update', etc.
    target_table TEXT,                       -- 'profiles', 'platform_content', etc.
    target_id UUID,                          -- ID of the affected record
    old_value JSONB DEFAULT '{}'::jsonb,     -- Snapshot before change
    new_value JSONB DEFAULT '{}'::jsonb,     -- Snapshot after change
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,      -- Extra context (reason, notes)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Immutable: No UPDATE or DELETE allowed via RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin can SELECT audit logs via regular client
CREATE POLICY "Super admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
  )
);

-- INSERT only via service role (no user-facing insert)
-- Service role bypasses RLS, so no INSERT policy needed for regular users

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.admin_audit_logs(target_table, target_id);


-- 3. Content Moderation Queue
CREATE TABLE IF NOT EXISTS public.content_moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES public.platform_content(id) ON DELETE CASCADE,
    content_type TEXT DEFAULT 'platform_content', -- 'platform_content', 'message', 'profile'
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,                          -- 'explicit', 'illegal', 'harassment', 'spam', 'other'
    description TEXT,                              -- Reporter's description
    status TEXT DEFAULT 'pending'
      CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'escalated')),
    priority TEXT DEFAULT 'normal'
      CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    escalated_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation queue"
ON public.content_moderation_queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND platform_role IN ('moderator', 'admin', 'super_admin')
  )
);

CREATE POLICY "Admins can update moderation queue"
ON public.content_moderation_queue FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND platform_role IN ('moderator', 'admin', 'super_admin')
  )
);

-- Users can insert reports (flagging content)
CREATE POLICY "Users can flag content"
ON public.content_moderation_queue FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE INDEX IF NOT EXISTS idx_moderation_status ON public.content_moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_priority ON public.content_moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_moderation_created ON public.content_moderation_queue(created_at DESC);

DROP TRIGGER IF EXISTS update_moderation_queue_updated_at ON public.content_moderation_queue;
CREATE TRIGGER update_moderation_queue_updated_at
  BEFORE UPDATE ON public.content_moderation_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 4. Platform Settings — Key-value config store
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view platform settings"
ON public.platform_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND platform_role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Super admins can update platform settings"
ON public.platform_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND platform_role = 'super_admin'
  )
);

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('feature_flags', '{"text_translation": true, "speech_translation": true, "ephemeral_media": true, "ai_suggestions": true, "blur_filter": true}'::jsonb, 'Platform-wide feature toggles'),
  ('pricing', '{"s2st_rate_per_min_eur": 0.10, "free_s2st_seconds": 300, "vip_price_default": 9.99, "master_price_default": 29.99}'::jsonb, 'Pricing configuration'),
  ('creator_promo', '{"max_promo_slots": 50, "promo_duration_months": 12, "selection_criteria": "best_50"}'::jsonb, 'Creator promotional program settings'),
  ('moderation', '{"auto_flag_threshold": 3, "escalation_timeout_hours": 24, "ban_appeal_window_days": 30}'::jsonb, 'Content moderation rules')
ON CONFLICT (key) DO NOTHING;


-- 5. RPC Functions for Admin Dashboard Aggregations

-- Get platform-wide KPIs
CREATE OR REPLACE FUNCTION get_platform_kpis()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_creators', (SELECT COUNT(*) FROM public.profiles WHERE role = 'creator'),
    'total_members', (SELECT COUNT(*) FROM public.profiles WHERE role = 'member'),
    'kyc_verified', (SELECT COUNT(*) FROM public.profiles WHERE is_kyc_verified = true),
    'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE is_active = true),
    'active_vip', (SELECT COUNT(*) FROM public.subscriptions WHERE is_active = true AND tier = 'vip'),
    'active_master', (SELECT COUNT(*) FROM public.subscriptions WHERE is_active = true AND tier = 'master'),
    'total_revenue', (SELECT COALESCE(SUM(price_paid), 0) FROM public.subscriptions),
    'mrr', (SELECT COALESCE(SUM(price_paid), 0) FROM public.subscriptions WHERE is_active = true),
    'platform_cut', (SELECT COALESCE(SUM(price_paid), 0) * 0.20 FROM public.subscriptions WHERE is_active = true),
    'moderation_pending', (SELECT COUNT(*) FROM public.content_moderation_queue WHERE status = 'pending'),
    'translation_revenue', (SELECT COALESCE(SUM(cost_charged), 0) FROM public.translation_audit_logs),
    'live_streams_active', (SELECT COUNT(*) FROM public.live_streams WHERE is_live = true)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user signup timeseries (last N days)
CREATE OR REPLACE FUNCTION get_user_growth_timeseries(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result FROM (
    SELECT
      d::date AS date,
      COUNT(p.id) AS signups
    FROM generate_series(
      CURRENT_DATE - (days_back || ' days')::interval,
      CURRENT_DATE,
      '1 day'::interval
    ) d
    LEFT JOIN public.profiles p ON p.created_at::date = d::date
    GROUP BY d::date
    ORDER BY d::date
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get revenue timeseries (last N days)
CREATE OR REPLACE FUNCTION get_revenue_timeseries(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result FROM (
    SELECT
      d::date AS date,
      COALESCE(SUM(s.price_paid), 0) AS revenue,
      COUNT(s.id) AS transactions
    FROM generate_series(
      CURRENT_DATE - (days_back || ' days')::interval,
      CURRENT_DATE,
      '1 day'::interval
    ) d
    LEFT JOIN public.subscriptions s ON s.created_at::date = d::date
    GROUP BY d::date
    ORDER BY d::date
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get content moderation stats
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM public.content_moderation_queue),
    'pending', (SELECT COUNT(*) FROM public.content_moderation_queue WHERE status = 'pending'),
    'under_review', (SELECT COUNT(*) FROM public.content_moderation_queue WHERE status = 'under_review'),
    'approved', (SELECT COUNT(*) FROM public.content_moderation_queue WHERE status = 'approved'),
    'rejected', (SELECT COUNT(*) FROM public.content_moderation_queue WHERE status = 'rejected'),
    'escalated', (SELECT COUNT(*) FROM public.content_moderation_queue WHERE status = 'escalated'),
    'avg_resolution_hours', (
      SELECT COALESCE(
        EXTRACT(EPOCH FROM AVG(resolved_at - created_at)) / 3600,
        0
      )
      FROM public.content_moderation_queue
      WHERE resolved_at IS NOT NULL
    ),
    'today_new', (
      SELECT COUNT(*) FROM public.content_moderation_queue
      WHERE created_at::date = CURRENT_DATE
    ),
    'today_resolved', (
      SELECT COUNT(*) FROM public.content_moderation_queue
      WHERE resolved_at::date = CURRENT_DATE
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
