-- SQL Migration: Date Plan Module & RLS Integration
-- Defines the database schema for the Date Plan feature and extends the Relationship Level System (RLS) enums.

-- 1. Enable PostGIS extension (required for GEOGRAPHY type if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Extend the existing interaction_type enum to include Date Plan interactions
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in older Postgres versions,
-- so we execute these independently.
ALTER TYPE public.interaction_type ADD VALUE IF NOT EXISTS 'date_plan_confirmed';
ALTER TYPE public.interaction_type ADD VALUE IF NOT EXISTS 'date_plan_denied';
ALTER TYPE public.interaction_type ADD VALUE IF NOT EXISTS 'date_plan_shortlisted_not_chosen';

-- 3. Create Custom Enums for Dating Plan Lifecycles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_status') THEN
        CREATE TYPE plan_status AS ENUM ('New', 'Active', 'FinalCall', 'Booked', 'Expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_scope') THEN
        CREATE TYPE plan_scope AS ENUM ('In-Person', 'Digital Screen', 'Hybrid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_intent') THEN
        CREATE TYPE plan_intent AS ENUM ('Offer', 'LookingFor');
    END IF;
END$$;

-- 4. Create the session_intent_plans table
CREATE TABLE IF NOT EXISTS public.session_intent_plans (
    plan_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poster_user_uuid UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    intent_type plan_intent NOT NULL,
    plan_scope plan_scope NOT NULL,
    start_timestamp_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    end_timestamp_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    max_applications_int INTEGER DEFAULT 10 CHECK (max_applications_int <= 10),
    plan_scope_geo_point GEOGRAPHY(Point, 4326),
    allowed_move_tags_array TEXT[], -- References to suggestion_moves keys/ids (e.g. 'coffee')
    description TEXT, -- Short description from the poster
    plan_status plan_status DEFAULT 'New' NOT NULL,
    applicants_waiting_list UUID[] DEFAULT '{}'::UUID[] NOT NULL, -- Shortlisted applicants
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.session_intent_plans ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for session_intent_plans
DROP POLICY IF EXISTS "Public plans are viewable by matched users." ON public.session_intent_plans;
CREATE POLICY "Public plans are viewable by matched users."
ON public.session_intent_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.relationships r
    WHERE r.is_matched = true 
    AND ((r.user_id = auth.uid() AND r.target_id = poster_user_uuid) 
      OR (r.target_id = auth.uid() AND r.user_id = poster_user_uuid))
  )
  OR auth.uid() = poster_user_uuid
);

DROP POLICY IF EXISTS "Users can create their own date plans." ON public.session_intent_plans;
CREATE POLICY "Users can create their own date plans."
ON public.session_intent_plans FOR INSERT
WITH CHECK (auth.uid() = poster_user_uuid);

DROP POLICY IF EXISTS "Posters can update their own plans." ON public.session_intent_plans;
CREATE POLICY "Posters can update their own plans."
ON public.session_intent_plans FOR UPDATE
USING (auth.uid() = poster_user_uuid);

-- 7. Add automated trigger for updated_at column
DROP TRIGGER IF EXISTS update_session_intent_plans_updated_at ON public.session_intent_plans;
CREATE TRIGGER update_session_intent_plans_updated_at
BEFORE UPDATE ON public.session_intent_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 8. Indexes for performance optimizations
CREATE INDEX IF NOT EXISTS session_intent_plans_poster_uuid_idx ON public.session_intent_plans(poster_user_uuid);
CREATE INDEX IF NOT EXISTS session_intent_plans_status_idx ON public.session_intent_plans(plan_status);

-- 9. Security Definer Function (RPC) to allow matched users to safely apply to a plan
-- This bypasses RLS to allow waitlist additions while enforcing capacity, matches, and plan status.
CREATE OR REPLACE FUNCTION public.apply_to_date_plan(target_plan_id UUID, applicant_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.session_intent_plans
    SET applicants_waiting_list = array_append(applicants_waiting_list, applicant_id)
    WHERE plan_id = target_plan_id
      -- Ensure applicant is not already waitlisted
      AND NOT (applicants_waiting_list @> ARRAY[applicant_id])
      -- Ensure the applicant is matched with the poster of this plan
      AND EXISTS (
        SELECT 1 FROM public.relationships r
        WHERE r.is_matched = true
          AND ((r.user_id = applicant_id AND r.target_id = poster_user_uuid)
            OR (r.target_id = applicant_id AND r.user_id = poster_user_uuid))
      )
      -- Ensure capacity has not been exceeded
      AND COALESCE(cardinality(applicants_waiting_list), 0) < max_applications_int
      -- Ensure plan status is open
      AND plan_status IN ('New', 'Active', 'FinalCall');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

