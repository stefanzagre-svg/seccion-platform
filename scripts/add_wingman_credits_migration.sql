-- =======================================================
-- SESSION PLATFORM - MIGRATION: ADD WINGMAN CREDITS
-- =======================================================

ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS wingman_credits INT DEFAULT 10;
