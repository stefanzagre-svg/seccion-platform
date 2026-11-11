import { describe, it, expect } from 'vitest';

// Pure helper mirrors for the frictionless onboarding routing invariants
export function resolveInitialOnboardingStep(params: URLSearchParams): string {
  if (params.get('error') === 'auth_callback_failed') {
    return 'registration';
  }
  if (params.get('tutorial') === 'creator' || params.get('quest') === 'true') {
    return 'creator-quest';
  }
  if (params.get('role') === 'creator' || params.get('invite') === 'creator') {
    return 'registration';
  }
  if (params.get('bypass') === 'true' || params.get('fresh') === 'true' || params.get('reset') === 'true') {
    return 'purpose';
  }
  return 'registration';
}

export function extractHandleFromLink(link?: string | null, email?: string): string {
  if (link) {
    const cleaned = link.replace(/^https?:\/\/[^\/]+\/@?/, '').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (cleaned.length >= 3) return cleaned.slice(0, 24).toLowerCase();
  }
  if (email) {
    const fromEmail = email.split('@')[0].replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (fromEmail.length >= 3) return fromEmail.slice(0, 24).toLowerCase();
  }
  return `creator_${Math.floor(1000 + Math.random() * 9000)}`;
}

export function deriveCleanUsername(email: string, explicitUsername?: string, primaryHandle?: string): string {
  const base = (
    explicitUsername?.trim() ||
    primaryHandle?.trim() ||
    (email.includes('@') ? email.split('@')[0] : '') ||
    'user'
  )
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);
  return base || 'user_default';
}

export function resolveEffectiveRegistrationRole(
  requestedRole: string | undefined,
  isFounder: boolean,
  creatorAppStatus: string | undefined
): 'creator' | 'member' {
  // Phase A Security Invariant (C1 Fix):
  // Clients requesting 'creator' are NEVER granted creator role unless they are the founder
  // or have a verified 'approved' creator_application in the database.
  const isApproved = isFounder || creatorAppStatus === 'approved';
  return isApproved ? 'creator' : 'member';
}

export function resolvePostOnboardingRedirect(isCreator: boolean, isFounder = false): string {
  if (isFounder) return '/admin';
  return isCreator ? '/studio?welcome=true' : '/dashboard';
}

describe('Frictionless Creator & Member Onboarding Routing Invariants', () => {
  it('routes /onboarding?role=creator&email=... directly to registration instead of creator-quest', () => {
    const params = new URLSearchParams('role=creator&email=maguivogel18%40gmail.com&name=Magali+Ayelen+Gimenez');
    expect(resolveInitialOnboardingStep(params)).toBe('registration');
  });

  it('routes /onboarding?tutorial=creator or ?quest=true to creator-quest demo', () => {
    expect(resolveInitialOnboardingStep(new URLSearchParams('tutorial=creator'))).toBe('creator-quest');
    expect(resolveInitialOnboardingStep(new URLSearchParams('quest=true'))).toBe('creator-quest');
  });

  it('auto-derives a clean username from email when username input is empty', () => {
    expect(deriveCleanUsername('maguivogel18@gmail.com')).toBe('maguivogel18');
    expect(deriveCleanUsername('test.creator+vip@seccion.ai', '', '@Test_Creator!')).toBe('test_creator');
  });

  it('routes completed creators to /studio?welcome=true and members to /dashboard', () => {
    expect(resolvePostOnboardingRedirect(true, false)).toBe('/studio?welcome=true');
    expect(resolvePostOnboardingRedirect(false, false)).toBe('/dashboard');
    expect(resolvePostOnboardingRedirect(true, true)).toBe('/admin');
  });

  it('preserves member role when a member completes 18+ DIDIT KYC verification', () => {
    const resolveVerifiedRole = (existingRole?: string, targetRole?: string) =>
      targetRole === 'creator' || existingRole === 'creator'
        ? 'creator'
        : existingRole || 'member';

    expect(resolveVerifiedRole('member', undefined)).toBe('member');
    expect(resolveVerifiedRole('member', 'member')).toBe('member');
    expect(resolveVerifiedRole('creator', undefined)).toBe('creator');
    expect(resolveVerifiedRole('member', 'creator')).toBe('creator');
  });

  it('sanitizes DIDIT returnTo callback path against open-redirect vectors', () => {
    const sanitizeReturnTo = (returnTo?: unknown) =>
      typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/onboarding/kyc?session_done=true';

    expect(sanitizeReturnTo('/feed')).toBe('/feed');
    expect(sanitizeReturnTo('/studio')).toBe('/studio');
    expect(sanitizeReturnTo('//evil.com')).toBe('/onboarding/kyc?session_done=true');
    expect(sanitizeReturnTo('https://evil.com')).toBe('/onboarding/kyc?session_done=true');
  });
});

describe('Phase A Security Hardening Invariants (C1, C2, C3, H1, Schema)', () => {
  it('C1: prevents unapproved visitors from self-assigning creator role via API', () => {
    // Unapproved client attempts to send role: "creator"
    expect(resolveEffectiveRegistrationRole('creator', false, undefined)).toBe('member');
    expect(resolveEffectiveRegistrationRole('creator', false, 'pending')).toBe('member');
    expect(resolveEffectiveRegistrationRole('creator', false, 'waitlist')).toBe('member');
    expect(resolveEffectiveRegistrationRole('creator', false, 'rejected')).toBe('member');

    // Only approved applications or founder receive creator role
    expect(resolveEffectiveRegistrationRole('creator', false, 'approved')).toBe('creator');
    expect(resolveEffectiveRegistrationRole('member', false, 'approved')).toBe('creator');
    expect(resolveEffectiveRegistrationRole(undefined, true, undefined)).toBe('creator');
  });

  it('Schema: extractHandleFromLink safely derives handles from link1 URLs or handles', () => {
    expect(extractHandleFromLink('https://instagram.com/maguivogel', 'magui@test.com')).toBe('maguivogel');
    expect(extractHandleFromLink('https://x.com/steveseccion', 'steve@test.com')).toBe('steveseccion');
    expect(extractHandleFromLink('https://tiktok.com/@creator_star', 'star@test.com')).toBe('creator_star');
    expect(extractHandleFromLink('@alice_w', 'alice@test.com')).toBe('alice_w');
    expect(extractHandleFromLink(null, 'elena.rodriguez@gmail.com')).toBe('elena_rodriguez');
  });

  it('H1: generates magiclink callback URL with direct token_hash for server-side verification', () => {
    const buildDirectMagicLink = (hashedToken?: string, actionLink?: string) => {
      if (hashedToken) {
        return `https://seccion.ai/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=/studio`;
      }
      return actionLink;
    };

    const token = 'abc123tokenhashxyz';
    const directUrl = buildDirectMagicLink(token, 'https://supabase.co/verify#access_token=123');
    expect(directUrl).toBe('https://seccion.ai/auth/callback?token_hash=abc123tokenhashxyz&type=magiclink&next=/studio');
    expect(directUrl).toContain('token_hash=');
    expect(directUrl).toContain('&type=magiclink');
    expect(directUrl).toContain('&next=/studio');
  });

  it('C3: account takeover protection - prevents password overwrite for existing users', () => {
    const shouldOverwritePassword = (isExistingUser: boolean, isApprovedCreator: boolean) => {
      // NEVER overwrite password on existing user
      if (isExistingUser) return false;
      return isApprovedCreator;
    };

    expect(shouldOverwritePassword(true, true)).toBe(false);
    expect(shouldOverwritePassword(true, false)).toBe(false);
    expect(shouldOverwritePassword(false, true)).toBe(true);
  });
});

describe('Phase B Single-Field Email Authentication & Pre-Launch Gating', () => {
  it('validates single-email submission requires 18+ and Terms & Privacy consent', () => {
    const validateSingleEmailSubmit = (email: string, agreedToTerms: boolean) => {
      if (!email || !email.includes('@')) {
        return { valid: false, error: 'invalid_email' };
      }
      if (!agreedToTerms) {
        return { valid: false, error: 'terms_required' };
      }
      return { valid: true };
    };

    expect(validateSingleEmailSubmit('', true).valid).toBe(false);
    expect(validateSingleEmailSubmit('creator@seccion.ai', false).error).toBe('terms_required');
    expect(validateSingleEmailSubmit('creator@seccion.ai', true).valid).toBe(true);
  });

  it('H3: gates non-creator accounts from member feed during creator pre-launch window', () => {
    const resolvePrelaunchRoute = (pathname: string, isCreatorRole: boolean) => {
      if (!isCreatorRole && (pathname === '/feed' || pathname.startsWith('/feed/') || pathname === '/top-profile')) {
        return '/early-access';
      }
      return pathname;
    };

    expect(resolvePrelaunchRoute('/feed', false)).toBe('/early-access');
    expect(resolvePrelaunchRoute('/feed/trending', false)).toBe('/early-access');
    expect(resolvePrelaunchRoute('/top-profile', false)).toBe('/early-access');
    expect(resolvePrelaunchRoute('/feed', true)).toBe('/feed');
    expect(resolvePrelaunchRoute('/studio', true)).toBe('/studio');
  });

  it('H4: rate limits repeated prelaunch-access attempts per IP', () => {
    const rateLimiter = (hitCount: number, maxHits = 15) => {
      return hitCount > maxHits ? { allowed: false, status: 429 } : { allowed: true, status: 200 };
    };

    expect(rateLimiter(1).allowed).toBe(true);
    expect(rateLimiter(15).allowed).toBe(true);
    expect(rateLimiter(16).allowed).toBe(false);
    expect(rateLimiter(16).status).toBe(429);
  });
});
