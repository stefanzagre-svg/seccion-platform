-- Migration: 20261113121500_creator_copilot_memory_provenance.sql
-- Description: Plan E — Provenance-Backed VIP & Brand Memory Graph for Creator AI Copilot
-- Enforces PII-scrubbed storage, active/superseded decision trail, and Zero-Trust RLS.

CREATE TABLE IF NOT EXISTS public.creator_copilot_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_member_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  memory_type VARCHAR(32) NOT NULL CHECK (
    memory_type IN ('brand_voice', 'boundary', 'vip_preference', 'vip_offer_decision')
  ),
  topic_slug VARCHAR(80) NOT NULL,
  summary TEXT NOT NULL,
  wikilinks TEXT[] NOT NULL DEFAULT '{}'::text[],
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'superseded')),
  superseded_by UUID NULL REFERENCES public.creator_copilot_memories(id) ON DELETE SET NULL,
  source_context VARCHAR(120) NOT NULL DEFAULT 'studio_cockpit',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recheck_when TEXT NOT NULL DEFAULT 'When creator pricing, boundaries, or VIP agreement changes.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guarantees at most ONE active offer decision per (creator, VIP, topic)
CREATE UNIQUE INDEX IF NOT EXISTS uq_copilot_active_vip_offer_topic
  ON public.creator_copilot_memories (
    creator_id,
    COALESCE(target_member_id, '00000000-0000-0000-0000-000000000000'::uuid),
    topic_slug
  )
  WHERE status = 'active' AND memory_type = 'vip_offer_decision';

CREATE INDEX IF NOT EXISTS idx_copilot_memories_creator_active
  ON public.creator_copilot_memories (creator_id, target_member_id, status, checked_at DESC);

-- Zero-Trust Row-Level Security (verified by .harness/sensors/sensor_sql_rls.py)
ALTER TABLE public.creator_copilot_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators manage own copilot memories" ON public.creator_copilot_memories;
CREATE POLICY "Creators manage own copilot memories"
  ON public.creator_copilot_memories
  FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
