-- SECCION: Demo Account Cleanup Migration
-- Purpose: Remove ghost accounts created by legacy demo/guest login infrastructure
-- Run once in Supabase SQL Editor with service role
-- Safe: only targets rows matching demo naming patterns

-- Step 1: Remove demo profiles (cascades to related tables via FK)
DELETE FROM profiles
WHERE
  id::text LIKE 'demo-guest-%'
  OR id::text LIKE 'demo-phone-%'
  OR username LIKE 'guest\_%' ESCAPE '\'
  OR username LIKE 'Guest\_%' ESCAPE '\';

-- Step 2: Remove guest auth users (requires service role key)
-- Run this separately in a server-side context or Supabase service role client:
-- DELETE FROM auth.users
-- WHERE email LIKE 'guest\_%@session.com' ESCAPE '\';

-- Verification query (run after to confirm cleanup):
SELECT COUNT(*) as remaining_demo_profiles
FROM profiles
WHERE
  id::text LIKE 'demo-guest-%'
  OR id::text LIKE 'demo-phone-%'
  OR username LIKE 'guest\_%' ESCAPE '\';
