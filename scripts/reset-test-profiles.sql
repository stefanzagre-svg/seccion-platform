-- ========================================================
-- SESSION — Functional Acceptance Test: Profile Reset
-- 
-- Resets all test data between test runs while preserving
-- auth credentials (no re-signup needed).
--
-- Usage: Run in Supabase SQL Editor after a test session.
-- ========================================================

-- Identify test users by their @session-test.com email pattern
-- We match on the username prefix patterns used by the seed script.

DO $$
DECLARE
  test_usernames TEXT[] := ARRAY[
    'hf1_rebel', 'hf2_seeker', 'hf3_dreamer', 'hm1_provider', 'hm2_stable',
    'ai_valentina', 'ai_elena', 'ai_sofia', 'ai_marco', 'ai_luca', 'ai_theo'
  ];
  test_user_ids UUID[];
BEGIN
  -- 1. Collect all test user IDs
  SELECT ARRAY_AGG(id) INTO test_user_ids
  FROM public.profiles
  WHERE username = ANY(test_usernames);

  IF test_user_ids IS NULL OR array_length(test_user_ids, 1) IS NULL THEN
    RAISE NOTICE 'No test profiles found. Nothing to reset.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found % test profiles to reset.', array_length(test_user_ids, 1);

  -- 2. Clear messages between test users
  DELETE FROM public.messages
  WHERE sender_id = ANY(test_user_ids)
     OR receiver_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared messages.';

  -- 3. Clear suggestion caches
  DELETE FROM public.suggestion_caches
  WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared suggestion caches.';

  -- 4. Clear ratings given by or to test users
  DELETE FROM public.ratings
  WHERE rater_id = ANY(test_user_ids)
     OR ratee_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared ratings.';

  -- 5. Clear feed A/B click telemetry
  DELETE FROM public.feed_ab_clicks
  WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared feed A/B clicks.';

  -- 6. Clear goal contributions from test users
  DELETE FROM public.goal_contributions
  WHERE contributor_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared goal contributions.';

  -- 7. Clear creator goals from test creators
  DELETE FROM public.creator_goals
  WHERE creator_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared creator goals.';

  -- 8. Clear live stream records
  DELETE FROM public.live_streams
  WHERE creator_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared live streams.';

  -- 9. Clear calendar events
  DELETE FROM public.calendar_events
  WHERE creator_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared calendar events.';

  -- 10. Reset profile fields to seed defaults
  -- Human profiles get reset to their initial connection_points & quest_stage
  UPDATE public.profiles
  SET connection_points = CASE username
        WHEN 'hf1_rebel'    THEN 500
        WHEN 'hf2_seeker'   THEN 200
        WHEN 'hf3_dreamer'  THEN 500
        WHEN 'hm1_provider' THEN 200
        WHEN 'hm2_stable'   THEN 50
        ELSE connection_points -- AI agents keep their values
      END,
      quest_stage = CASE username
        WHEN 'hm2_stable' THEN 1  -- Cold start
        WHEN 'hf2_seeker' THEN 2
        WHEN 'hm1_provider' THEN 2
        ELSE 3
      END,
      ab_group = NULL
  WHERE username = ANY(test_usernames);
  RAISE NOTICE 'Reset profile fields (connection_points, quest_stage, ab_group).';

  -- 11. Clear subscriptions involving test users
  DELETE FROM public.subscriptions
  WHERE subscriber_id = ANY(test_user_ids)
     OR creator_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared subscriptions.';

  -- 12. Clear relationships/matches involving test users
  DELETE FROM public.relationships
  WHERE user_id = ANY(test_user_ids)
     OR target_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared relationships/matches.';

  RAISE NOTICE '══════════════════════════════════════════════════';
  RAISE NOTICE '✅ Test profile reset complete. Ready for next run.';
  RAISE NOTICE '══════════════════════════════════════════════════';
END $$;
