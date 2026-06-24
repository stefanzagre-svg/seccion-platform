-- =======================================================
-- SESSION PLATFORM - MIGRATION: ADD AI ASSISTANT SCHEMA
-- =======================================================

-- 1. Profiles Table Extension: Core AI flags
ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS ai_agent_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS chat_auto_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS content_ops_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS legal_audit_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS digital_replica_consent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_suggestion_status VARCHAR(20) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS favorite_languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_languages JSONB DEFAULT '[]'::jsonb;

ALTER TABLE "public"."messages"
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- 2. Create AI Interaction Logs Table
CREATE TABLE IF NOT EXISTS public.ai_interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50), -- 'AUTO_CHAT', 'MANUAL', 'CONTENT_GEN', 'LEGAL_AUDIT'
    is_ai_generated BOOLEAN DEFAULT true,
    resolved_level_key VARCHAR(50), -- key corresponding to relationship_level
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS and Create Policies
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_interaction_logs' AND policyname = 'Users can view their own AI interaction logs.'
    ) THEN
        CREATE POLICY "Users can view their own AI interaction logs."
        ON public.ai_interaction_logs
        FOR SELECT
        USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
    END IF;
END
$$;

-- 4. Per-service toggle columns (additive migration — safe to run on existing deployments)
--    content_ops_enabled and legal_audit_enabled default to TRUE so existing users
--    keep full functionality until they opt to disable a specific service.
ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS content_ops_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS legal_audit_enabled BOOLEAN DEFAULT true;
