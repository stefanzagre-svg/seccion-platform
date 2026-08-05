/**
 * SECCIØN Platform — Unified Supabase Client Layer
 *
 * M1 ARCHITECTURE STANDARD:
 * ─────────────────────────────────────────────────────────────────────────────
 * Use the appropriate export below depending on where your code runs:
 *
 * 1. `createClient()` (from `@/lib/supabase/client`)
 *    - For React Client Components ('use client')
 *    - Stores sessions in cookies via `@supabase/ssr`
 *
 * 2. `createClient()` (from `@/lib/supabase/server`)
 *    - For Next.js Server Components, Server Actions & API Routes
 *    - Automatically reads HTTP request cookies for authenticated context
 *
 * 3. `createAdminClient()` (from `@/lib/supabase/admin-client`)
 *    - For administrative background jobs, cron tasks & system-level operations
 *    - Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row-Level Security (RLS)
 *    - NEVER call from client-side code
 *
 * 4. `supabase` (from `@/lib/supabase`)
 *    - Singleton browser client for global state / non-component client utils
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { createAdminClient } from './admin-client';
export { supabase } from '../supabase';
