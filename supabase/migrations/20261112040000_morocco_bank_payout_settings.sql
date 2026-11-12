-- ============================================================================
-- Migration: 20261112040000_morocco_bank_payout_settings.sql
-- Description: Add Moroccan 24-digit Bank RIB & SWIFT BIC columns to 
--              creator_payout_settings and isolated creator_private_data
-- ============================================================================

-- 1. creator_payout_settings: Add Moroccan Banking Columns
ALTER TABLE public.creator_payout_settings
  ADD COLUMN IF NOT EXISTS morocco_rib VARCHAR(50),
  ADD COLUMN IF NOT EXISTS morocco_bank_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS morocco_swift_bic VARCHAR(50);

-- 2. creator_private_data: Add Moroccan Banking Columns to Isolated Financial Vault
ALTER TABLE public.creator_private_data
  ADD COLUMN IF NOT EXISTS morocco_rib TEXT,
  ADD COLUMN IF NOT EXISTS morocco_bank_name TEXT,
  ADD COLUMN IF NOT EXISTS morocco_swift_bic TEXT;

-- 3. Document Columns & Invariants
COMMENT ON COLUMN public.creator_payout_settings.morocco_rib IS '24-digit Bank Al-Maghrib RIB (Relevé d''Identité Bancaire)';
COMMENT ON COLUMN public.creator_payout_settings.morocco_bank_name IS 'Name of Moroccan Bank (e.g. Attijariwafa, CIH, BMCE, BCP)';
COMMENT ON COLUMN public.creator_payout_settings.morocco_swift_bic IS 'SWIFT BIC of Moroccan Bank for B2B Digital Export Wire';
