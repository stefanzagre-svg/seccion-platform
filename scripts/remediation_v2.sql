-- ==============================================================================
-- SECCION Platform: Scale & Reliability Remediation Script (Phase 2)
-- ==============================================================================

-- 1. Atomic Wingman Credit Deduction RPC (Eliminates Race Conditions via FOR UPDATE)
CREATE OR REPLACE FUNCTION public.consume_wingman_credit(
    p_user_id UUID,
    p_amount INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_current_credits INT;
    v_new_credits INT;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid credit deduction amount');
    END IF;

    -- Lock the profile row exclusively to prevent concurrent double-spending
    SELECT COALESCE((privacy_settings->>'wingman_credits')::INT, 10)
    INTO v_current_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient wingman credits', 
            'balance', COALESCE(v_current_credits, 0)
        );
    END IF;

    v_new_credits := v_current_credits - p_amount;

    UPDATE public.profiles
    SET privacy_settings = jsonb_set(
            COALESCE(privacy_settings, '{}'::jsonb), 
            '{wingman_credits}', 
            to_jsonb(v_new_credits)
        ),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'balance', v_new_credits, 'remaining_credits', v_new_credits);
END;
$$;

-- 2. Atomic Wingman Credit Addition RPC (Prevents Lost Updates on Purchases)
CREATE OR REPLACE FUNCTION public.add_wingman_credits(
    p_user_id UUID,
    p_amount INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_current_credits INT;
    v_new_credits INT;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid credit addition amount');
    END IF;

    -- Lock the profile row exclusively to prevent lost updates
    SELECT COALESCE((privacy_settings->>'wingman_credits')::INT, 10)
    INTO v_current_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    v_new_credits := COALESCE(v_current_credits, 10) + p_amount;

    UPDATE public.profiles
    SET privacy_settings = jsonb_set(
            COALESCE(privacy_settings, '{}'::jsonb), 
            '{wingman_credits}', 
            to_jsonb(v_new_credits)
        ),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'balance', v_new_credits, 'new_credits', v_new_credits);
END;
$$;

-- 3. Distributed Rate Limiting Table and RPC
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    hit_count INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT rate_limits_user_endpoint_key UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT,
    p_max_hits INT DEFAULT 20,
    p_window_s INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record RECORD;
    v_now TIMESTAMPTZ := NOW();
    v_window_interval INTERVAL := (p_window_s || ' seconds')::INTERVAL;
    v_current_hits INT;
BEGIN
    SELECT * INTO v_record
    FROM public.rate_limits
    WHERE user_id = p_user_id AND endpoint = p_endpoint
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.rate_limits (user_id, endpoint, hit_count, window_start)
        VALUES (p_user_id, p_endpoint, 1, v_now);
        RETURN jsonb_build_object('allowed', true, 'remaining', p_max_hits - 1, 'hits', 1);
    END IF;

    -- If window has elapsed, reset window
    IF v_now - v_record.window_start > v_window_interval THEN
        UPDATE public.rate_limits
        SET hit_count = 1,
            window_start = v_now
        WHERE user_id = p_user_id AND endpoint = p_endpoint;
        RETURN jsonb_build_object('allowed', true, 'remaining', p_max_hits - 1, 'hits', 1);
    END IF;

    -- If limit exceeded
    IF v_record.hit_count >= p_max_hits THEN
        RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'hits', v_record.hit_count);
    END IF;

    -- Increment counter within active window
    UPDATE public.rate_limits
    SET hit_count = hit_count + 1
    WHERE user_id = p_user_id AND endpoint = p_endpoint
    RETURNING hit_count INTO v_current_hits;

    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_hits - v_current_hits, 'hits', v_current_hits);
END;
$$;

-- 4. Scalable Feed Query via WHERE NOT EXISTS (Eliminates PostgREST HTTP 414 & includes Blocked Filter)
CREATE OR REPLACE FUNCTION public.get_swipeable_profiles(
    p_user_id UUID,
    p_limit INT DEFAULT 20
)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT p.*
    FROM public.profiles p
    WHERE p.id != p_user_id
      AND p.avatar_url IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM public.interactions i
          WHERE i.actor_id = p_user_id AND i.target_id = p.id
      )
      AND NOT EXISTS (
          SELECT 1 FROM public.blocked_users b
          WHERE (b.blocker_id = p_user_id AND b.blocked_id = p.id)
             OR (b.blocker_id = p.id AND b.blocked_id = p_user_id)
      )
    ORDER BY p.created_at DESC
    LIMIT LEAST(p_limit, 50);
$$;

-- 5. High-Performance Composite Indexes for High-Traffic Query Paths
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON public.messages(receiver_id, sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subs_subscriber_active ON public.subscriptions(subscriber_id, is_active);
CREATE INDEX IF NOT EXISTS idx_interactions_actor_target ON public.interactions(actor_id, target_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON public.profiles(role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles(created_at DESC);
