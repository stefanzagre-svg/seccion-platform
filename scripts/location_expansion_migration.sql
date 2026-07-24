-- Migration: Location Expansion
-- Adds native_town, residence, and current_location columns to profiles table

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS native_town TEXT,
  ADD COLUMN IF NOT EXISTS residence TEXT,
  ADD COLUMN IF NOT EXISTS current_location TEXT;
