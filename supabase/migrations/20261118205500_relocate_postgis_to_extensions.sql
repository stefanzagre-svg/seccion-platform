-- Migration: 20261118205500_relocate_postgis_to_extensions.sql
-- Description: Relocates PostGIS out of the exposed 'public' schema into 'extensions',
-- eliminating public.spatial_ref_sys (0013_rls_disabled_in_public) and 254 public PostGIS RPC endpoints
-- while preserving public.session_intent_plans.plan_scope_geo_point as extensions.geography(Point, 4326).

CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

ALTER TABLE public.session_intent_plans
  ALTER COLUMN plan_scope_geo_point TYPE text
  USING plan_scope_geo_point::text;

DROP EXTENSION IF EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

ALTER TABLE public.session_intent_plans
  ALTER COLUMN plan_scope_geo_point TYPE extensions.geography(Point, 4326)
  USING CASE
    WHEN plan_scope_geo_point IS NULL THEN NULL
    ELSE plan_scope_geo_point::extensions.geography(Point, 4326)
  END;

ALTER TABLE public.session_intent_plans ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
