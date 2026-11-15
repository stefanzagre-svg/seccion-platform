-- SECCION Financial Stack V3.1 — Atomic Dual-Ledger RPCs, Platform Content Rating Lock,
-- Settlement Ledger, Art. 24b 10-Year Proofs, & Creator Self-Billing / Veri*factu Schema
-- Date: 2026-11-12

-- 1. Extend public.platform_content with immutable classification & Sightengine verdict
ALTER TABLE public.platform_content
  ADD COLUMN IF NOT EXISTS content_rating TEXT DEFAULT 'SFW',
  ADD COLUMN IF NOT EXISTS required_ledger TEXT DEFAULT 'sfw_credits',
  ADD COLUMN IF NOT EXISTS sightengine_verdict JSONB DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'platform_content_rating_check'
  ) THEN
    ALTER TABLE public.platform_content
      ADD CONSTRAINT platform_content_rating_check
      CHECK (content_rating IN ('SFW', 'NSFW_18'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'platform_content_ledger_check'
  ) THEN
    ALTER TABLE public.platform_content
      ADD CONSTRAINT platform_content_ledger_check
      CHECK (required_ledger IN ('sfw_credits', 'sovereign_red_pills'));
  END IF;
END $$;

-- 2. Ensure prerequisite Matrix economy & escrow tables exist (idempotent if prior migrations were skipped)
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  red_pills_balance INTEGER NOT NULL DEFAULT 0,
  sfw_credits_balance INTEGER NOT NULL DEFAULT 0,
  blue_pills_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_wallets_user_id_unique UNIQUE (user_id),
  CONSTRAINT positive_red_pills CHECK (red_pills_balance >= 0),
  CONSTRAINT positive_blue_pills CHECK (blue_pills_xp >= 0)
);

ALTER TABLE public.user_wallets
  ADD COLUMN IF NOT EXISTS sfw_credits_balance INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON public.user_wallets(user_id);
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own wallet" ON public.user_wallets;
CREATE POLICY "Users view own wallet" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.matrix_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  red_pills_amount INTEGER NOT NULL DEFAULT 0,
  blue_pills_xp_amount INTEGER NOT NULL DEFAULT 0,
  fiat_amount NUMERIC(10, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'EUR',
  payment_method VARCHAR(50),
  gateway_toll_fee NUMERIC(10, 2) DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matrix_tx_user ON public.matrix_transactions(user_id);
ALTER TABLE public.matrix_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own matrix transactions" ON public.matrix_transactions;
CREATE POLICY "Users view own matrix transactions" ON public.matrix_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.creator_payout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_rail VARCHAR(50) NOT NULL DEFAULT 'sepa',
  sepa_iban VARCHAR(100),
  sepa_bic VARCHAR(50),
  account_holder_name VARCHAR(255),
  crypto_network VARCHAR(50) DEFAULT 'polygon',
  crypto_wallet_address VARCHAR(255),
  wise_email VARCHAR(255),
  cosmo_account_id VARCHAR(100),
  auto_payout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  min_payout_threshold INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_payout_creator_id_unique UNIQUE (creator_id)
);

ALTER TABLE public.creator_payout_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Creators manage own payout settings" ON public.creator_payout_settings;
CREATE POLICY "Creators manage own payout settings" ON public.creator_payout_settings
  FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE TABLE IF NOT EXISTS public.creator_earnings_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fan_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  item_type VARCHAR(50) NOT NULL,
  red_pills_gross INTEGER NOT NULL,
  gross_fiat_value NUMERIC(10, 2) NOT NULL,
  gateway_toll_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  net_pool_value NUMERIC(10, 2) NOT NULL,
  creator_share_amount NUMERIC(10, 2) NOT NULL,
  platform_share_amount NUMERIC(10, 2) NOT NULL,
  split_ratio_creator NUMERIC(3, 2) NOT NULL DEFAULT 0.90,
  split_ratio_platform NUMERIC(3, 2) NOT NULL DEFAULT 0.10,
  status VARCHAR(30) NOT NULL DEFAULT 'credited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator ON public.creator_earnings_ledger(creator_id);
ALTER TABLE public.creator_earnings_ledger ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.matrix_escrow_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Tutorial & Coaching',
  content_rating VARCHAR(20) NOT NULL DEFAULT 'SFW' CHECK (content_rating IN ('SFW', 'NSFW_18')),
  required_ledger VARCHAR(30) NOT NULL DEFAULT 'sfw_credits' CHECK (required_ledger IN ('sfw_credits', 'sovereign_red_pills')),
  red_pills_amount INTEGER NOT NULL CHECK (red_pills_amount > 0),
  blue_pills_xp_reward INTEGER NOT NULL DEFAULT 50,
  status VARCHAR(30) NOT NULL DEFAULT 'held_in_escrow',
  delivery_media_url TEXT,
  delivery_notes TEXT,
  sightengine_delivery_verdict JSONB DEFAULT NULL,
  dispute_reason TEXT DEFAULT NULL,
  deadline_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  auto_release_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.matrix_escrow_orders
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Tutorial & Coaching',
  ADD COLUMN IF NOT EXISTS content_rating VARCHAR(20) NOT NULL DEFAULT 'SFW',
  ADD COLUMN IF NOT EXISTS required_ledger VARCHAR(30) NOT NULL DEFAULT 'sfw_credits',
  ADD COLUMN IF NOT EXISTS sightengine_delivery_verdict JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dispute_reason TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_escrow_fan ON public.matrix_escrow_orders(fan_id);
CREATE INDEX IF NOT EXISTS idx_escrow_creator ON public.matrix_escrow_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON public.matrix_escrow_orders(status);
CREATE INDEX IF NOT EXISTS idx_escrow_content_rating ON public.matrix_escrow_orders(content_rating);

ALTER TABLE public.matrix_escrow_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Fans and creators view own escrow orders" ON public.matrix_escrow_orders;
CREATE POLICY "Fans and creators view own escrow orders" ON public.matrix_escrow_orders
  FOR SELECT USING (auth.uid() = fan_id OR auth.uid() = creator_id);

-- 3. Create / extend public.platform_transactions with V3.1 CJEU Fenix VAT & USDC fields
CREATE TABLE IF NOT EXISTS public.platform_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'nowpayments',
  provider_payment_id TEXT,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  net_base_eur NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vat_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
  vat_amount_eur NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  gross_total_eur NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  customer_country TEXT DEFAULT 'ES',
  tax_regime TEXT DEFAULT 'ES_DOMESTIC_IVA',
  aeat_return_form TEXT DEFAULT 'Modelo 303',
  settlement_asset TEXT DEFAULT 'USDC',
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_transactions
  ADD COLUMN IF NOT EXISTS order_id TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS creator_id UUID,
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'nowpayments',
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS net_base_eur NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(6, 4) DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS vat_amount_eur NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS gross_total_eur NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS customer_country TEXT DEFAULT 'ES',
  ADD COLUMN IF NOT EXISTS tax_regime TEXT DEFAULT 'ES_DOMESTIC_IVA',
  ADD COLUMN IF NOT EXISTS aeat_return_form TEXT DEFAULT 'Modelo 303',
  ADD COLUMN IF NOT EXISTS settlement_asset TEXT DEFAULT 'USDC',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_tx_order_id_unique
  ON public.platform_transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_tx_user_id ON public.platform_transactions(user_id);

ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own platform transactions" ON public.platform_transactions;
CREATE POLICY "Users view own platform transactions"
  ON public.platform_transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = creator_id);

-- 4. Implementing Regulation (EU) 282/2011 Art. 24b & Art. 24f 10-Year Location Proof Table
CREATE TABLE IF NOT EXISTS public.tax_location_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL,
  declared_country TEXT NOT NULL,
  resolved_country TEXT NOT NULL,
  proof_1_type TEXT NOT NULL,
  proof_1_country TEXT NOT NULL,
  proof_1_ref_hash TEXT,
  proof_2_type TEXT,
  proof_2_country TEXT,
  proof_2_ref_hash TEXT,
  extra_proofs JSONB DEFAULT '[]'::jsonb,
  valid_art24b BOOLEAN NOT NULL DEFAULT false,
  art70_dos_triggered BOOLEAN NOT NULL DEFAULT false,
  retain_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_location_order_id ON public.tax_location_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_tax_location_retain_until ON public.tax_location_proofs(retain_until);

ALTER TABLE public.tax_location_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own tax location proofs" ON public.tax_location_proofs;
CREATE POLICY "Users view own tax location proofs"
  ON public.tax_location_proofs FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Creator Self-Billing (Autofacturacion RD 1619/2012), DAC7 & Veri*factu Chain Table
CREATE TABLE IF NOT EXISTS public.creator_self_bill_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_series_number TEXT NOT NULL UNIQUE,
  domicile TEXT NOT NULL CHECK (domicile IN ('ES', 'EU_NON_ES', 'NON_EU')),
  net_taxable_base_eur NUMERIC(12, 2) NOT NULL,
  vat_added_rate NUMERIC(6, 4) NOT NULL DEFAULT 0,
  vat_added_eur NUMERIC(12, 2) NOT NULL DEFAULT 0,
  reverse_charge_vat_eur NUMERIC(12, 2) NOT NULL DEFAULT 0,
  irpf_or_irnr_rate NUMERIC(6, 4) NOT NULL DEFAULT 0,
  irpf_or_irnr_withheld_eur NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_cash_payout_eur NUMERIC(12, 2) NOT NULL,
  mandatory_legend TEXT NOT NULL,
  aeat_forms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  previous_hash TEXT NOT NULL DEFAULT '',
  sha256_hash TEXT NOT NULL,
  aeat_qr_url TEXT NOT NULL,
  verifactu_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  dac7_ready BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_self_bill_creator_issued
  ON public.creator_self_bill_invoices(creator_id, issued_at DESC);

ALTER TABLE public.creator_self_bill_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators view own self-bill invoices" ON public.creator_self_bill_invoices;
CREATE POLICY "Creators view own self-bill invoices"
  ON public.creator_self_bill_invoices FOR SELECT
  USING (auth.uid() = creator_id);

-- 6. Extend creator_payout_settings for V3.1 USDC Polygon/Solana + Self-Billing Mandate + DAC7 TIN
ALTER TABLE public.creator_payout_settings
  ADD COLUMN IF NOT EXISTS preferred_rail TEXT DEFAULT 'sepa',
  ADD COLUMN IF NOT EXISTS crypto_address TEXT,
  ADD COLUMN IF NOT EXISTS mandate_autofacturacion_signed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mandate_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tax_residence_country TEXT,
  ADD COLUMN IF NOT EXISTS tax_id_nif_vat TEXT,
  ADD COLUMN IF NOT EXISTS vies_validated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tax_residency_cert_on_file BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS new_autonomo_7pct_eligible BOOLEAN DEFAULT false;

-- Safely widen legacy CHECK constraints on creator_payout_settings & matrix_transactions if present
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'creator_payout_settings'
      AND c.contype = 'c'
      AND (c.conname ILIKE '%preferred_method%' OR c.conname ILIKE '%preferred_rail%' OR c.conname ILIKE '%crypto_network%')
  ) LOOP
    EXECUTE format('ALTER TABLE public.creator_payout_settings DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- 7. Atomic FOR UPDATE Dual-Ledger Escrow Lock RPC
CREATE OR REPLACE FUNCTION public.escrow_lock_dual_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_ledger TEXT,
  p_creator_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_content_rating TEXT,
  p_deadline_at TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_wallet RECORD;
  v_new_sfw NUMERIC;
  v_new_red NUMERIC;
  v_order_id UUID;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_AMOUNT');
  END IF;

  INSERT INTO public.user_wallets (user_id, red_pills_balance, sfw_credits_balance, blue_pills_xp)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet
  FROM public.user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF p_ledger = 'sfw_credits' THEN
    IF COALESCE(v_wallet.sfw_credits_balance, 0) < p_amount THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INSUFFICIENT_SFW_CREDITS',
        'available', COALESCE(v_wallet.sfw_credits_balance, 0)
      );
    END IF;
    v_new_sfw := COALESCE(v_wallet.sfw_credits_balance, 0) - p_amount;
    v_new_red := COALESCE(v_wallet.red_pills_balance, 0);

    UPDATE public.user_wallets
    SET sfw_credits_balance = v_new_sfw, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    IF COALESCE(v_wallet.red_pills_balance, 0) < p_amount THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INSUFFICIENT_RED_PILLS',
        'available', COALESCE(v_wallet.red_pills_balance, 0)
      );
    END IF;
    v_new_sfw := COALESCE(v_wallet.sfw_credits_balance, 0);
    v_new_red := COALESCE(v_wallet.red_pills_balance, 0) - p_amount;

    UPDATE public.user_wallets
    SET red_pills_balance = v_new_red, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO public.matrix_escrow_orders (
    fan_id, creator_id, title, description, category,
    content_rating, required_ledger, red_pills_amount,
    blue_pills_xp_reward, status, deadline_at
  ) VALUES (
    p_user_id, p_creator_id, p_title, p_description, COALESCE(p_category, 'General'),
    COALESCE(p_content_rating, 'SFW'), COALESCE(p_ledger, 'sfw_credits'), p_amount,
    GREATEST(25, ROUND(p_amount * 0.5)), 'held_in_escrow', p_deadline_at
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.matrix_transactions (
    user_id, transaction_type, red_pills_amount, fiat_amount,
    payment_method, status, metadata
  ) VALUES (
    p_user_id, 'escrow_lock', p_amount, ROUND((p_amount * 1.00)::NUMERIC, 2),
    'internal_balance', 'pending',
    jsonb_build_object(
      'orderId', v_order_id,
      'creatorId', p_creator_id,
      'category', COALESCE(p_category, 'General'),
      'contentRating', COALESCE(p_content_rating, 'SFW'),
      'requiredLedger', COALESCE(p_ledger, 'sfw_credits')
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'new_sfw_balance', v_new_sfw,
    'new_red_pills_balance', v_new_red
  );
END;
$$;

-- 8. Atomic FOR UPDATE Dual-Ledger Escrow Refund RPC
CREATE OR REPLACE FUNCTION public.escrow_refund_dual_wallet(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Creator or fan mutually cancelled escrow order.'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_wallet RECORD;
  v_ledger TEXT;
  v_new_sfw NUMERIC;
  v_new_red NUMERIC;
BEGIN
  SELECT * INTO v_order
  FROM public.matrix_escrow_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND');
  END IF;

  IF v_order.status NOT IN ('held_in_escrow', 'delivered') THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_CANNOT_BE_REFUNDED', 'status', v_order.status);
  END IF;

  INSERT INTO public.user_wallets (user_id, red_pills_balance, sfw_credits_balance, blue_pills_xp)
  VALUES (v_order.fan_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet
  FROM public.user_wallets
  WHERE user_id = v_order.fan_id
  FOR UPDATE;

  v_ledger := COALESCE(v_order.required_ledger, 'sovereign_red_pills');

  IF v_ledger = 'sfw_credits' THEN
    v_new_sfw := COALESCE(v_wallet.sfw_credits_balance, 0) + COALESCE(v_order.red_pills_amount, 0);
    v_new_red := COALESCE(v_wallet.red_pills_balance, 0);
    UPDATE public.user_wallets
    SET sfw_credits_balance = v_new_sfw, updated_at = NOW()
    WHERE user_id = v_order.fan_id;
  ELSE
    v_new_sfw := COALESCE(v_wallet.sfw_credits_balance, 0);
    v_new_red := COALESCE(v_wallet.red_pills_balance, 0) + COALESCE(v_order.red_pills_amount, 0);
    UPDATE public.user_wallets
    SET red_pills_balance = v_new_red, updated_at = NOW()
    WHERE user_id = v_order.fan_id;
  END IF;

  UPDATE public.matrix_escrow_orders
  SET status = 'refunded',
      dispute_reason = p_reason,
      refunded_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'refunded_ledger', v_ledger,
    'refunded_amount', v_order.red_pills_amount,
    'new_sfw_balance', v_new_sfw,
    'new_red_pills_balance', v_new_red
  );
END;
$$;

-- 9. Atomic Idempotent FOR UPDATE Top-Up Credit RPC (Webhook Settlement)
CREATE OR REPLACE FUNCTION public.credit_wallet_for_order(
  p_order_id TEXT,
  p_user_id UUID,
  p_credits_to_add INTEGER,
  p_ledger TEXT DEFAULT 'sfw_credits',
  p_provider TEXT DEFAULT 'nowpayments',
  p_provider_payment_id TEXT DEFAULT NULL,
  p_net_base_eur NUMERIC DEFAULT 0.00,
  p_vat_rate NUMERIC DEFAULT 0.0000,
  p_vat_amount_eur NUMERIC DEFAULT 0.00,
  p_gross_total_eur NUMERIC DEFAULT 0.00,
  p_customer_country TEXT DEFAULT 'ES',
  p_tax_regime TEXT DEFAULT 'ES_DOMESTIC_IVA',
  p_aeat_return_form TEXT DEFAULT 'Modelo 303',
  p_settlement_asset TEXT DEFAULT 'USDC',
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing RECORD;
  v_wallet RECORD;
  v_new_sfw NUMERIC;
  v_new_red NUMERIC;
  v_new_xp NUMERIC;
BEGIN
  SELECT id, status INTO v_existing
  FROM public.platform_transactions
  WHERE order_id = p_order_id
  FOR UPDATE;

  IF FOUND AND v_existing.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'idempotent_duplicate', true, 'order_id', p_order_id);
  END IF;

  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_USER_ID');
  END IF;

  INSERT INTO public.user_wallets (user_id, red_pills_balance, sfw_credits_balance, blue_pills_xp)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet
  FROM public.user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_new_xp := COALESCE(v_wallet.blue_pills_xp, 0) + GREATEST(0, COALESCE(p_credits_to_add, 0));

  IF p_ledger = 'sovereign_red_pills' THEN
    v_new_sfw := COALESCE(v_wallet.sfw_credits_balance, 0);
    v_new_red := COALESCE(v_wallet.red_pills_balance, 0) + GREATEST(0, COALESCE(p_credits_to_add, 0));
    UPDATE public.user_wallets
    SET red_pills_balance = v_new_red, blue_pills_xp = v_new_xp, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    v_new_sfw := COALESCE(v_wallet.sfw_credits_balance, 0) + GREATEST(0, COALESCE(p_credits_to_add, 0));
    v_new_red := COALESCE(v_wallet.red_pills_balance, 0);
    UPDATE public.user_wallets
    SET sfw_credits_balance = v_new_sfw, blue_pills_xp = v_new_xp, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO public.platform_transactions (
    order_id, user_id, provider, provider_payment_id,
    amount, net_base_eur, vat_rate, vat_amount_eur, gross_total_eur,
    customer_country, tax_regime, aeat_return_form, settlement_asset,
    currency, status, metadata, updated_at
  ) VALUES (
    p_order_id, p_user_id, COALESCE(p_provider, 'nowpayments'), p_provider_payment_id,
    COALESCE(p_gross_total_eur, p_net_base_eur), COALESCE(p_net_base_eur, 0),
    COALESCE(p_vat_rate, 0), COALESCE(p_vat_amount_eur, 0),
    COALESCE(p_gross_total_eur, p_net_base_eur),
    COALESCE(p_customer_country, 'ES'), COALESCE(p_tax_regime, 'ES_DOMESTIC_IVA'),
    COALESCE(p_aeat_return_form, 'Modelo 303'), COALESCE(p_settlement_asset, 'USDC'),
    'EUR', 'completed', COALESCE(p_metadata, '{}'::jsonb), NOW()
  )
  ON CONFLICT (order_id) DO UPDATE SET
    provider_payment_id = COALESCE(EXCLUDED.provider_payment_id, public.platform_transactions.provider_payment_id),
    status = 'completed',
    metadata = public.platform_transactions.metadata || EXCLUDED.metadata,
    updated_at = NOW();

  UPDATE public.matrix_transactions
  SET status = 'completed',
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'settlementAsset', COALESCE(p_settlement_asset, 'USDC'),
        'netBaseEur', p_net_base_eur,
        'vatAmountEur', p_vat_amount_eur,
        'grossTotalEur', p_gross_total_eur,
        'customerCountry', p_customer_country,
        'taxRegime', p_tax_regime
      )
  WHERE user_id = p_user_id
    AND status = 'pending'
    AND (metadata->>'orderId' = p_order_id OR metadata->>'order_id' = p_order_id);

  RETURN jsonb_build_object(
    'success', true,
    'idempotent_duplicate', false,
    'order_id', p_order_id,
    'credited_ledger', p_ledger,
    'credits_added', p_credits_to_add,
    'new_sfw_balance', v_new_sfw,
    'new_red_pills_balance', v_new_red,
    'new_blue_pills_xp', v_new_xp
  );
END;
$$;
