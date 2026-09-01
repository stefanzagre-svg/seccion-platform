-- ==============================================================================
-- SECCION Platform: Scale & Reliability Remediation Script (Phase 1)
-- ==============================================================================

-- 1. Atomic Wingman Credit Deduction RPC (Eliminates Race Conditions)
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

    -- Lock the profile row to prevent concurrent double-spending
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

    RETURN jsonb_build_object('success', true, 'balance', v_new_credits);
END;
$$;

-- 2. Scalable Feed Query via WHERE NOT EXISTS (Eliminates PostgREST HTTP 414)
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
      AND p.is_onboarded = true
      AND NOT EXISTS (
          SELECT 1 FROM public.interactions i
          WHERE i.actor_id = p_user_id AND i.target_id = p.id
      )
    ORDER BY p.created_at DESC
    LIMIT LEAST(p_limit, 50);
$$;

-- 3. High-Performance Composite Indexes for High-Traffic Query Paths
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subs_subscriber_active ON public.subscriptions(subscriber_id, is_active);
CREATE INDEX IF NOT EXISTS idx_interactions_actor_target ON public.interactions(actor_id, target_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_onboarded ON public.profiles(role, is_onboarded);
