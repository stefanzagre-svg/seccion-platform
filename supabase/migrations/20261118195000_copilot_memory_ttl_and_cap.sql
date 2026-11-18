-- Migration: 20261118195000_copilot_memory_ttl_and_cap.sql
-- Description: Adds optional explicit expires_at column for Creator Copilot Memory TTL
-- and ensures Zero-Trust Row-Level Security remains enforced.

ALTER TABLE public.creator_copilot_memories
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_copilot_memories_active_expires
  ON public.creator_copilot_memories (creator_id, expires_at)
  WHERE status = 'active' AND expires_at IS NOT NULL;

-- Zero-Trust Row-Level Security verification guard
ALTER TABLE public.creator_copilot_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators manage own copilot memories" ON public.creator_copilot_memories;
CREATE POLICY "Creators manage own copilot memories"
  ON public.creator_copilot_memories
  FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
