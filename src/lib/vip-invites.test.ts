import { describe, it, expect } from 'vitest';
import {
  normalizeSocialHandle,
  generateVipInviteCode,
  maskEmailAddress,
  resolveVipInviteStatus,
  buildFoundingYear1Timestamps,
  buildVipDmTemplates,
  checkPublicIpRateLimit,
} from './vip-invites';
import { resolveCreatorSplitRatio } from './escrow-dual-ledger';

describe('vip-invites helpers & Year-1 90% -> 80% invariant', () => {
  it('normalizes social handles from @handles and full URLs', () => {
    expect(normalizeSocialHandle('@Elena_Fit')).toBe('Elena_Fit');
    expect(normalizeSocialHandle('https://instagram.com/elena.fit/?hl=en')).toBe('elena.fit');
    expect(normalizeSocialHandle('https://www.tiktok.com/@nadia.ma/video/123')).toBe('nadia.ma');
    expect(normalizeSocialHandle('')).toBe('');
  });

  it('generates clean unique invite codes with URL-safe characters', () => {
    const c1 = generateVipInviteCode('@Elena_Fit');
    const c2 = generateVipInviteCode('@Elena_Fit');
    expect(c1).toMatch(/^elenafit-[a-z2-9]{8}$/);
    expect(c2).toMatch(/^elenafit-[a-z2-9]{8}$/);
    expect(c1).not.toBe(c2);

    const generic = generateVipInviteCode(null);
    expect(generic).toMatch(/^vip-[a-z2-9]{8}$/);
  });

  it('masks locked email addresses safely for public /vip preview', () => {
    expect(maskEmailAddress('elena.creator@gmail.com')).toBe('el***********@gmail.com');
    expect(maskEmailAddress('ab@x.io')).toBe('ab**@x.io');
    expect(maskEmailAddress(null)).toBeNull();
  });

  it('resolves public invite lifecycle statuses accurately', () => {
    const now = Date.UTC(2026, 10, 13, 12, 0, 0);
    const future = new Date(now + 86_400_000).toISOString();
    const past = new Date(now - 1_000).toISOString();

    expect(resolveVipInviteStatus(null, now)).toBe('not_found');
    expect(
      resolveVipInviteStatus(
        { is_revoked: true, expires_at: future, uses_count: 0, max_uses: 1 },
        now
      )
    ).toBe('revoked');
    expect(
      resolveVipInviteStatus(
        { is_revoked: false, expires_at: past, uses_count: 0, max_uses: 1 },
        now
      )
    ).toBe('expired');
    expect(
      resolveVipInviteStatus(
        { is_revoked: false, expires_at: future, uses_count: 1, max_uses: 1 },
        now
      )
    ).toBe('claimed');
    expect(
      resolveVipInviteStatus(
        { is_revoked: false, expires_at: future, uses_count: 0, max_uses: 1 },
        now
      )
    ).toBe('active');
  });

  it('preserves existing promo_90_approved_at so Year-1 clock never resets and shifts 90% -> 80% after 365 days', () => {
    const approvedMs = Date.UTC(2026, 0, 1, 0, 0, 0);
    const existingApprovedIso = new Date(approvedMs).toISOString();
    const laterClaimMs = approvedMs + 100 * 86_400_000;

    const preserved = buildFoundingYear1Timestamps(
      { promo_90_approved_at: existingApprovedIso, ai_free_until: null },
      12,
      laterClaimMs
    );
    expect(preserved.promo90ApprovedAt).toBe(existingApprovedIso);

    // Day 364 -> still 90% / 10%
    const withinYear1 = resolveCreatorSplitRatio(
      {
        is_approved_founder_creator: true,
        promo_90_approved_at: preserved.promo90ApprovedAt,
        custom_creator_rate: null,
      },
      approvedMs + 364 * 86_400_000
    );
    expect(withinYear1.creatorSplitRatio).toBe(0.9);
    expect(withinYear1.platformSplitRatio).toBeCloseTo(0.1, 6);

    // Day 366 -> automatically shifts back to 80% / 20%
    const afterYear1 = resolveCreatorSplitRatio(
      {
        is_approved_founder_creator: true,
        promo_90_approved_at: preserved.promo90ApprovedAt,
        custom_creator_rate: null,
      },
      approvedMs + 366 * 86_400_000
    );
    expect(afterYear1.creatorSplitRatio).toBe(0.8);
    expect(afterYear1.platformSplitRatio).toBeCloseTo(0.2, 6);
  });

  it('builds localized EN/ES/FR DM templates clearly stating 90% 1st year and 80% thereafter', () => {
    const templates = buildVipDmTemplates({
      inviteUrl: 'https://seccion.ai/vip/nadia-abcd1234',
      creatorName: 'Nadia',
      moroccoShield: true,
    });

    expect(templates.en).toContain('90%');
    expect(templates.en).toContain('80%');
    expect(templates.en).toContain('Morocco Domestic IP Shield');
    expect(templates.en).toContain('https://seccion.ai/vip/nadia-abcd1234');

    expect(templates.es).toContain('90%');
    expect(templates.es).toContain('80%');
    expect(templates.es).toContain('Escudo IP Doméstico Marruecos');

    expect(templates.fr).toContain('90%');
    expect(templates.fr).toContain('80%');
    expect(templates.fr).toContain('Bouclier IP Maroc');
  });

  it('rate-limits public IP lookups after maxHits within window and resets afterward', () => {
    const t0 = 1_794_600_000_000;
    expect(checkPublicIpRateLimit('203.0.113.10', 'vip_test', 2, 60, t0)).toBe(false);
    expect(checkPublicIpRateLimit('203.0.113.10', 'vip_test', 2, 60, t0 + 1000)).toBe(false);
    expect(checkPublicIpRateLimit('203.0.113.10', 'vip_test', 2, 60, t0 + 2000)).toBe(true);
    expect(checkPublicIpRateLimit('203.0.113.10', 'vip_test', 2, 60, t0 + 61_000)).toBe(false);
  });
});
