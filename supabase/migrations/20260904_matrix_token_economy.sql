-- Migration: 20260904_matrix_token_economy.sql
-- Description: Matrix Token Economy (Red Pills 💊 & Blue Pills 💊 Dual-Loop)

-- 1. User Wallets (Dual-loop Blue Pill XP vs Red Pill Tokens)
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    red_pills_balance INTEGER NOT NULL DEFAULT 0,  -- Matrix Tokens (Purchased / Spent)
    blue_pills_xp INTEGER NOT NULL DEFAULT 0,      -- Chemistry XP (Earned via connection)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_wallets_user_id_unique UNIQUE (user_id),
    CONSTRAINT positive_red_pills CHECK (red_pills_balance >= 0),
    CONSTRAINT positive_blue_pills CHECK (blue_pills_xp >= 0)
);

-- 2. Matrix Transactions Ledger
CREATE TABLE IF NOT EXISTS public.matrix_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'spend_tip', 'spend_ppv', 'spend_sub', 'burn_xp_discount', 'cashout'
    red_pills_amount INTEGER NOT NULL DEFAULT 0,
    blue_pills_xp_amount INTEGER NOT NULL DEFAULT 0,
    fiat_amount NUMERIC(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_method VARCHAR(50), -- 'revolut_pay', 'open_banking', 'credit_card', 'crypto_usdt', 'internal_balance'
    gateway_toll_fee NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Creator Payout Settings
CREATE TABLE IF NOT EXISTS public.creator_payout_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_rail VARCHAR(50) NOT NULL DEFAULT 'sepa', -- 'sepa', 'crypto_usdt', 'wise', 'cosmo_card'
    sepa_iban VARCHAR(100),
    sepa_bic VARCHAR(50),
    account_holder_name VARCHAR(255),
    crypto_network VARCHAR(50) DEFAULT 'solana', -- 'solana', 'tron_trc20'
    crypto_wallet_address VARCHAR(255),
    wise_email VARCHAR(255),
    cosmo_account_id VARCHAR(100),
    auto_payout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    min_payout_threshold INTEGER NOT NULL DEFAULT 50, -- in Red Pills (min 50 💊 = ~€45.00)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT creator_payout_creator_id_unique UNIQUE (creator_id)
);

-- 4. Creator Earnings Settlement Ledger (90% Creator / 10% Platform)
CREATE TABLE IF NOT EXISTS public.creator_earnings_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fan_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    item_type VARCHAR(50) NOT NULL, -- 'tip', 'stream_access', 'ppv_teaser', 'vip_subscription'
    red_pills_gross INTEGER NOT NULL,
    gross_fiat_value NUMERIC(10, 2) NOT NULL,
    gateway_toll_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_pool_value NUMERIC(10, 2) NOT NULL,
    creator_share_amount NUMERIC(10, 2) NOT NULL, -- 90% of Net Pool
    platform_share_amount NUMERIC(10, 2) NOT NULL, -- 10% of Net Pool
    split_ratio_creator NUMERIC(3, 2) NOT NULL DEFAULT 0.90,
    split_ratio_platform NUMERIC(3, 2) NOT NULL DEFAULT 0.10,
    status VARCHAR(30) NOT NULL DEFAULT 'credited', -- 'credited', 'in_payout', 'settled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_tx_user ON public.matrix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator ON public.creator_earnings_ledger(creator_id);
