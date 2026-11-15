/**
 * Shared server-side Admin Auth helpers.
 * Consolidates user lookup (O(1) fast-path + unbounded pagination),
 * handle generation, and fail-closed distributed rate limiting.
 */

export function extractHandleFromLink(
  link?: string | null,
  email?: string,
  fallbackPrefix = 'creator'
): string {
  if (link) {
    const cleaned = link
      .replace(/^https?:\/\/[^/]+\/@?/, '')
      .replace(/\./g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    if (cleaned.length >= 3) return cleaned.slice(0, 24).toLowerCase();
  }
  if (email) {
    const fromEmail = email
      .split('@')[0]
      .replace(/\./g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    if (fromEmail.length >= 3) return fromEmail.slice(0, 24).toLowerCase();
  }
  return `${fallbackPrefix}_${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Look up a Supabase Auth user by normalized email without hard 5,000-user caps.
 * Attempts an O(1) indexed lookup via profiles when available, then scans
 * auth.admin.listUsers across all pages until exhausted.
 */
export async function findAuthUserByEmail(adminClient: any, email: string): Promise<any | null> {
  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail) return null;

  try {
    const { data: profileMatch } = await adminClient
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileMatch?.id && typeof adminClient.auth?.admin?.getUserById === 'function') {
      const { data: userRes } = await adminClient.auth.admin.getUserById(profileMatch.id);
      if (userRes?.user?.email?.toLowerCase().trim() === normalizedEmail) {
        return userRes.user;
      }
    }
  } catch {
    // profiles.email may not exist on all schemas; continue to paginated listUsers scan
  }

  let page = 1;
  const perPage = 1000;
  const maxSafetyPages = 10000; // Defensive cap (10M users) against infinite mock loops

  while (page <= maxSafetyPages) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users || data.users.length === 0) break;

    const match = data.users.find(
      (u: any) => u?.email?.toLowerCase().trim() === normalizedEmail
    );
    if (match) return match;

    if (data.users.length < perPage) break;
    page++;
  }

  return null;
}

/**
 * Check distributed endpoint rate limit via Supabase RPC.
 * Fails CLOSED (returns true = blocked) if the RPC errors or throws so
 * auth/enumeration endpoints stay protected during transient outages.
 */
export async function checkEndpointRateLimit(
  supabaseAdmin: any,
  identifier: string,
  endpoint: string,
  maxHits = 15,
  windowSeconds = 60
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: identifier,
      p_endpoint: endpoint,
      p_max_hits: maxHits,
      p_window_s: windowSeconds,
    });
    if (error) {
      console.error(`[RateLimit:${endpoint}] RPC failed — failing closed:`, error.message);
      return true;
    }
    return !(data?.allowed ?? false);
  } catch (err) {
    console.error(`[RateLimit:${endpoint}] Unexpected error — failing closed:`, err);
    return true;
  }
}
