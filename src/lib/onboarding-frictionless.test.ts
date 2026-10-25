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
});
