-- Migration: 20261104231000_v3_dual_wallet_and_escrow_rating_gate.sql
-- Description: V3.0 Anti-Cartel Dual-Ledger (sfw_credits vs sovereign_red_pills) & Two-Stage Escrow Content Rating Gate

-- 1. Add SFW Studio Credits balance to public.user_wallets
ALTER TABLE public.user_wallets
  ADD COLUMN IF NOT EXISTS sfw_credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (sfw_credits_balance >= 0);

-- 2. Add Stage 1 & Stage 2 Content Qualification columns to public.matrix_escrow_orders
ALTER TABLE public.matrix_escrow_orders
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Tutorial & Coaching',
  ADD COLUMN IF NOT EXISTS content_rating VARCHAR(20) NOT NULL DEFAULT 'SFW' CHECK (content_rating IN ('SFW', 'NSFW_18')),
  ADD COLUMN IF NOT EXISTS required_ledger VARCHAR(30) NOT NULL DEFAULT 'sfw_credits' CHECK (required_ledger IN ('sfw_credits', 'sovereign_red_pills')),
  ADD COLUMN IF NOT EXISTS sightengine_delivery_verdict JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_escrow_content_rating ON public.matrix_escrow_orders(content_rating);

-- 3. Zero-Trust Row-Level Security (RLS) Enforcement
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrix_escrow_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own wallet" ON public.user_wallets;
CREATE POLICY "Users view own wallet" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Fans and creators view own escrow orders" ON public.matrix_escrow_orders;
CREATE POLICY "Fans and creators view own escrow orders" ON public.matrix_escrow_orders
  FOR SELECT USING (auth.uid() = fan_id OR auth.uid() = creator_id);
