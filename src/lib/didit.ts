import crypto from 'node:crypto';

/**
 * Whole-number floats (1.0) -> integers (1), recursively.
 * Matches Didit's server JSON canonicalisation before HMAC signing.
 */
export function shortenFloats(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shortenFloats);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, shortenFloats(x)])
    );
  }
  if (typeof v === 'number' && !Number.isInteger(v) && v % 1 === 0) return Math.trunc(v);
  return v;
}

/**
 * Recursive lexicographic key sort (preserving array order).
 */
export function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.keys(v as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return v;
}

/**
 * Constant-time HMAC-SHA256 verification for Didit v2 webhook signatures.
 */
export function verifyDiditSignature(rawBody: string, sig: string, secret: string): boolean {
  if (!secret || !sig) return false;
  try {
    const parsed = JSON.parse(rawBody);
    const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));
    const expected = crypto
      .createHmac('sha256', secret)
      .update(canonical, 'utf8')
      .digest('hex');

    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expected.toLowerCase()),
      Buffer.from(sig.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Constant-time HMAC-SHA256 verification for Didit raw-body X-Signature header
 * (used by Didit webhook v1 / Dashboard test webhook requests).
 */
export function verifyDiditRawSignature(rawBody: string, sig: string, secret: string): boolean {
  if (!secret || !sig) return false;
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expected.toLowerCase()),
      Buffer.from(sig.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Resolves a verified profile's role strictly from server-side approval state,
 * preventing client-supplied targetRole escalation.
 */
export function resolveServerVerifiedRole(params: {
  existingRole?: string | null;
  email?: string | null;
  applicationStatus?: string | null;
}): 'creator' | 'member' | 'admin' {
  if (params.existingRole === 'admin') return 'admin';
  const cleanEmail = params.email?.toLowerCase().trim() || '';
  const isFounder = cleanEmail === 'stefan.zagre@gmail.com';
  const hasCreatorRole = params.existingRole === 'creator';
  const hasApprovedApp = params.applicationStatus === 'approved';
  return isFounder || hasCreatorRole || hasApprovedApp ? 'creator' : 'member';
}
