-- ======================================================
-- SESSION PLATFORM - ADD STRIPE FIELDS TO SUBSCRIPTIONS
-- ======================================================

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_id_idx ON public.subscriptions(stripe_subscription_id);
