/**
 * supabase-safe.ts — Resilient Supabase query helpers
 *
 * L2 ARCHITECTURE HARDENING:
 * - Replaced `any` types with strong Supabase types (`User`, `ResilientUserSession`, generic `T`)
 * - Maintains 100% backward compatibility with browser and server callers
 */

import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** Lazy browser client — only instantiated when no client is passed (client-side usage) */
function getBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export interface SafeQueryResult<T> {
  data: T | null;
  error: unknown | null;
  isTimeout: boolean;
}

export interface ResilientUserSession {
  user: User;
}

export interface MinimalSupabaseClient {
  auth: {
    getUser: () => PromiseLike<{ data: { user: User | null } | null; error: unknown }>;
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => PromiseLike<{ data: unknown; error: unknown }>;
      };
    };
  };
}

/**
 * Universal Resilient Query Wrapper for Supabase & API Calls.
 * Supports standard Promises and Supabase PostgrestFilterBuilder (PromiseLike).
 * Completely client-agnostic — pass any query promise from browser or server client.
 */
export async function safeSupabaseQuery<T = unknown>(
  queryPromise: PromiseLike<unknown> | Promise<unknown>,
  fallbackValue: T | null = null,
  timeoutMs = 5000
): Promise<SafeQueryResult<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<SafeQueryResult<T>>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[Supabase Resilient Guard] Query timed out after ${timeoutMs}ms. Serving fallback data.`);
      resolve({
        data: fallbackValue,
        error: new Error(`Network timeout (${timeoutMs}ms)`),
        isTimeout: true,
      });
    }, timeoutMs);
  });

  try {
    const rawResult = await Promise.race([Promise.resolve(queryPromise), timeoutPromise]);
    clearTimeout(timer);

    if (rawResult && typeof rawResult === 'object' && 'isTimeout' in rawResult && (rawResult as SafeQueryResult<T>).isTimeout) {
      return rawResult as SafeQueryResult<T>;
    }

    const res = rawResult as { data?: T | null; error?: unknown };
    return {
      data: res && res.data !== undefined ? res.data : (rawResult as T),
      error: (res && res.error) || null,
      isTimeout: false,
    };
  } catch (err) {
    clearTimeout(timer);
    console.error('[Supabase Resilient Guard] Unhandled query error caught safely:', err);
    return {
      data: fallbackValue,
      error: err,
      isTimeout: false,
    };
  }
}

/**
 * Safely fetches the authenticated user with zero-hang timeout fallback.
 * Returns { user: User } shape for backward compatibility with callers using session?.user.
 *
 * Uses getUser() (server-validated). Pass a server client when calling from API routes.
 */
export async function getResilientSession(
  timeoutMs = 4000,
  client?: MinimalSupabaseClient | unknown
): Promise<ResilientUserSession | null> {
  const supabase = (client as MinimalSupabaseClient) ?? getBrowserClient();
  const result = await safeSupabaseQuery<{ user: User | null }>(
    supabase.auth.getUser(),
    null,
    timeoutMs
  );
  const user = result.data?.user ?? null;
  return user ? { user } : null;
}

/**
 * Safely fetches a profile row by userId with zero-hang fallback.
 * Accepts generic type T for strong caller typing (defaults to Record<string, unknown>).
 */
export async function getResilientProfile<T = Record<string, unknown>>(
  userId: string,
  timeoutMs = 5000,
  client?: MinimalSupabaseClient | unknown
): Promise<T | null> {
  if (!userId) return null;
  const supabase = (client as MinimalSupabaseClient) ?? getBrowserClient();
  const result = await safeSupabaseQuery<T>(
    supabase.from('profiles').select('*').eq('id', userId).single(),
    null,
    timeoutMs
  );
  return result.data;
}
