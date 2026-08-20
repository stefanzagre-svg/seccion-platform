-- ============================================================================
-- SECCION PLATFORM — COMMUNITY BUG BOUNTY & GLITCH REPORTING SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_email TEXT,
    reporter_role TEXT DEFAULT 'member', -- 'member' | 'creator' | 'guest'
    category TEXT NOT NULL DEFAULT 'visual_display', 
    -- 'visual_display' | 'payment_credits' | 'video_stream' | 'chat_messages' | 'login_signup' | 'other'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'under_review' | 'verified' | 'rejected' | 'resolved'
    
    -- Client Telemetry
    page_url TEXT,
    user_agent TEXT,
    viewport_size TEXT,
    network_type TEXT,
    screenshot_url TEXT,
    
    -- Reward Distribution
    reward_status TEXT NOT NULL DEFAULT 'none', -- 'none' | 'pending' | 'distributed'
    reward_type TEXT DEFAULT 'xp_vip', -- 'xp_vip' | 'radar_boost' | 'ai_credits' | 'custom'
    reward_amount INT DEFAULT 250,
    reward_distributed_at TIMESTAMPTZ,
    
    -- Admin Triage
    admin_notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexing for fast search and admin triage filtering
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_reporter ON public.bug_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created ON public.bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_category ON public.bug_reports(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- 1. Any authenticated user or guest can submit a bug report
DROP POLICY IF EXISTS "Public can submit bug reports" ON public.bug_reports;
CREATE POLICY "Public can submit bug reports"
ON public.bug_reports FOR INSERT
WITH CHECK (true);

-- 2. Users can view their own submitted bug reports
DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
CREATE POLICY "Users can view own bug reports"
ON public.bug_reports FOR SELECT
USING (auth.uid() = reporter_id);

-- 3. Service role & Admins have full access
DROP POLICY IF EXISTS "Admins full access on bug reports" ON public.bug_reports;
CREATE POLICY "Admins full access on bug reports"
ON public.bug_reports FOR ALL
USING (
    auth.role() = 'service_role' OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR username = 'stefan')
    )
);
