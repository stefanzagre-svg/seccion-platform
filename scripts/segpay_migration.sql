-- SECCIØN PLATFORM — SEGPAY PAYMENT PROCESSOR MIGRATION
-- Adds Segpay tracking columns to subscriptions and creator_earnings tables

-- 1. Add Segpay transaction and subscription columns to public.subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS segpay_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS segpay_transaction_id TEXT;

-- Create index for fast webhook lookups
CREATE INDEX IF NOT EXISTS subscriptions_segpay_sub_id_idx ON public.subscriptions(segpay_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_segpay_tran_id_idx ON public.subscriptions(segpay_transaction_id);

-- 2. Add Segpay transaction column to public.creator_earnings if present
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'creator_earnings') THEN
    ALTER TABLE public.creator_earnings ADD COLUMN IF NOT EXISTS segpay_transaction_id TEXT;
    CREATE INDEX IF NOT EXISTS creator_earnings_segpay_tran_id_idx ON public.creator_earnings(segpay_transaction_id);
  END IF;
END $$;
