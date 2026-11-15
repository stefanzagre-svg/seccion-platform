import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  isCountryBlocked,
  buildMergedPrivacySettings,
  isProfileReadyForDiscovery,
  isOnboardingProfileComplete,
  normalizeCountryCode,
  getCountryDisplayName,
  readGeoRestrictionCodes,
} from '../../src/lib/profile-visibility';
import {
  findAuthUserByEmail,
  checkEndpointRateLimit,
  extractHandleFromLink,
} from '../../src/lib/auth-admin';

const mockGetUser = vi.fn();
const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockAdminRpc = vi.fn();
const mockAdminListUsers = vi.fn();
const mockAdminGetUserById = vi.fn();
const mockRequestHeaders = vi.fn(() => new Headers());
const mockNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => mockRequestHeaders()),
  cookies: vi.fn(async () => ({ getAll: () => [] })),
}));

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}));

vi.mock('../../src/app/[username]/page-client', () => ({
  default: vi.fn(() => null),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockServerFrom,
  })),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
    rpc: mockAdminRpc,
    auth: {
      admin: {
        listUsers: mockAdminListUsers,
        getUserById: mockAdminGetUserById,
      },
    },
  })),
}));

describe('Phase 2 Security, Privacy & Readiness Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Country Geoblock & Moroccan Domestic Shield', () => {
    it('blocks MA visitors when morocco_domestic_shield is true or MA is in blocked_countries', () => {
      expect(isCountryBlocked({ morocco_domestic_shield: true }, 'MA')).toBe(true);
      expect(isCountryBlocked({ morocco_domestic_shield: true }, ' ma ')).toBe(true);
      expect(isCountryBlocked({ blocked_countries: ['MA', 'FR'] }, 'FR')).toBe(true);
      expect(isCountryBlocked({ morocco_domestic_shield: true, blocked_countries: ['MA'] }, 'ES')).toBe(false);
      expect(isCountryBlocked({ morocco_domestic_shield: true }, 'XX')).toBe(false);
      expect(isCountryBlocked({ morocco_domestic_shield: true }, null)).toBe(false);
      expect(
        isCountryBlocked({ geo_restriction_enabled: false, blocked_countries: ['FR'] }, 'FR')
      ).toBe(false);
    });

    it('resolves full localized country names via Geo Restriction Code Reader', () => {
      expect(getCountryDisplayName('ma', 'en')).toBe('Morocco');
      expect(getCountryDisplayName('MA', 'es')).toBe('Marruecos');
      expect(getCountryDisplayName('MA', 'fr')).toBe('Maroc');
      expect(getCountryDisplayName('AE', 'en')).toBeTruthy();

      const parsed = readGeoRestrictionCodes('ma, gb, ma, ZZZ', 'en');
      expect(parsed).toHaveLength(3);
      expect(parsed[0]).toEqual({ code: 'MA', name: 'Morocco', isValid: true });
      expect(parsed[1].code).toBe('GB');
      expect(parsed[1].isValid).toBe(true);
      expect(parsed[2]).toEqual({ code: 'ZZZ', name: null, isValid: false });
    });

    it('merges privacy_settings without clobbering existing preferences or duplicating countries', () => {
      const existing = {
        face_blur: true,
        display_age: 25,
        blocked_countries: ['fr', 'US'],
        age_verification: { verified: true },
      };
      const merged = buildMergedPrivacySettings(existing, true, ['MA', 'FR', 'ma']);
      expect(merged.face_blur).toBe(true);
      expect(merged.display_age).toBe(25);
      expect(merged.age_verification).toEqual({ verified: true });
      expect(merged.morocco_domestic_shield).toBe(true);
      expect(merged.blocked_countries).toEqual(['FR', 'US', 'MA']);
    });
  });

  describe('Canonical profile_readiness & Onboarding Completion Gates', () => {
    it('requires avatar, bio/prompt, >= 2 profile_media items, and creator KYC for discovery', () => {
      const baseCreator = {
        id: 'c1',
        role: 'creator',
        avatar_url: 'https://cdn.seccion.ai/avatar.jpg',
        bio: 'Verified studio creator',
        is_kyc_verified: true,
      };

      expect(isProfileReadyForDiscovery(baseCreator, { publicMediaCount: 2 })).toBe(true);
      expect(isProfileReadyForDiscovery(baseCreator, { publicMediaCount: 1 })).toBe(false);
      expect(isProfileReadyForDiscovery({ ...baseCreator, avatar_url: '' }, { publicMediaCount: 3 })).toBe(false);
      expect(isProfileReadyForDiscovery({ ...baseCreator, bio: '   ' }, { publicMediaCount: 3 })).toBe(false);
      expect(isProfileReadyForDiscovery({ ...baseCreator, is_kyc_verified: false }, { publicMediaCount: 3 })).toBe(false);

      // Members with >= 2 real photos + avatar + bio_prompt_answer are discoverable before optional KYC
      expect(
        isProfileReadyForDiscovery(
          {
            id: 'm1',
            role: 'member',
            avatar_url: 'https://cdn.seccion.ai/member.jpg',
            bio_prompt_answer: 'Looking for creative language exchanges in Madrid.',
            is_kyc_verified: false,
          },
          { publicMediaCount: 2 }
        )
      ).toBe(true);
    });

    it('does not mark onboarding complete from archetype/role alone without avatar and bio', () => {
      expect(isOnboardingProfileComplete({ role: 'member', archetype: 'explorer' })).toBe(false);
      expect(isOnboardingProfileComplete({ role: 'creator', avatar_url: null, bio: null })).toBe(false);
      expect(isOnboardingProfileComplete({ role: 'creator', avatar_url: 'https://x/a.jpg', bio: 'Ready' })).toBe(true);
      expect(
        isOnboardingProfileComplete({
          role: 'member',
          avatar_url: 'https://x/m.jpg',
          bio_prompt_answer: 'Here for sports & events',
          lifestyle_habits: { smoking: 'never' },
        })
      ).toBe(true);
      expect(isOnboardingProfileComplete({ role: 'admin' })).toBe(true);
    });
  });

  describe('Unbounded Admin User Lookup & Fail-Closed Rate Limiting', () => {
    it('scans beyond 5,000 users (page > 5) without throwing away later pages', async () => {
      const fullPageUsers = Array.from({ length: 1000 }, (_, i) => ({
        id: `filler-${i}`,
        email: `filler-${i}@example.com`,
      }));
      const fakeAdmin: any = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: null, error: null })),
            })),
          })),
        })),
        auth: {
          admin: {
            listUsers: vi.fn(async ({ page }: { page: number }) => {
              if (page <= 6) {
                return { data: { users: fullPageUsers }, error: null };
              }
              return {
                data: {
                  users: [{ id: 'target-user-7', email: 'late.creator@seccion.ai' }],
                },
                error: null,
              };
            }),
          },
        },
      };

      const found = await findAuthUserByEmail(fakeAdmin, 'Late.Creator@seccion.ai');
      expect(found?.id).toBe('target-user-7');
      expect(fakeAdmin.auth.admin.listUsers).toHaveBeenCalledTimes(7);
    });

    it('extracts normalized handles across social URLs and emails', () => {
      expect(extractHandleFromLink('https://instagram.com/@Elena.Vibe', 'a@b.com')).toBe('elena_vibe');
      expect(extractHandleFromLink(null, 'marco.rossi@example.com')).toBe('marco_rossi');
    });

    it('fails closed when check_rate_limit RPC errors or throws', async () => {
      const rpcErrorClient = {
        rpc: vi.fn(async () => ({ data: null, error: { message: 'RPC timeout' } })),
      };
      expect(await checkEndpointRateLimit(rpcErrorClient, 'ip_1.2.3.4', 'auth/prelaunch-access')).toBe(true);

      const rpcThrowClient = {
        rpc: vi.fn(async () => {
          throw new Error('Network failure');
        }),
      };
      expect(await checkEndpointRateLimit(rpcThrowClient, 'ip_1.2.3.4', 'auth/prelaunch-access')).toBe(true);
    });

    it('/api/v2/auth/prelaunch-access enforces IP rate limit (429 after 15 requests)', async () => {
      mockAdminListUsers.mockResolvedValue({ data: { users: [] }, error: null });
      mockAdminFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { POST } = await import('../../src/app/api/v2/auth/prelaunch-access/route');
      let lastRes: Response | null = null;
      for (let i = 0; i < 16; i++) {
        lastRes = await POST(
          new NextRequest('https://seccion.ai/api/v2/auth/prelaunch-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.5' },
            body: JSON.stringify({ email: 'creator@seccion.ai' }),
          })
        );
      }
      expect(lastRes?.status).toBe(429);
    });
  });

  describe('/api/v2/geo & /api/v2/search/advanced Geoblock + Readiness Filters', () => {
    it('/api/v2/geo normalizes cf-ipcountry and suppresses unknown codes', async () => {
      const { GET } = await import('../../src/app/api/v2/geo/route');

      const maRes = await GET(
        new NextRequest('https://seccion.ai/api/v2/geo', {
          headers: { 'cf-ipcountry': 'ma' },
        })
      );
      expect(await maRes.json()).toEqual({ country: 'MA' });
      expect(normalizeCountryCode('XX')).toBeNull();
    });

    it('/api/v2/search/advanced excludes MA-geoblocked and unready profiles', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'searcher-1' } }, error: null });

      const searcherProfile = {
        id: 'searcher-1',
        role: 'creator',
        sexual_preference: 'Everyone',
        origins: 'Madrid, Spain',
        hobbies: ['Music'],
        lifestyle_habits: {},
        relationship_goals: ['Long-term'],
        relationship_types: ['Monogamous'],
      };

      const candidateProfiles = [
        {
          id: 'blocked-ma-creator',
          username: 'casablanca_star',
          display_name: 'Casablanca Star',
          avatar_url: 'https://cdn.seccion.ai/c1.jpg',
          bio: 'Verified creator',
          role: 'creator',
          is_kyc_verified: true,
          privacy_settings: { morocco_domestic_shield: true, blocked_countries: ['MA'] },
        },
        {
          id: 'unready-one-photo',
          username: 'new_creator',
          display_name: 'New Creator',
          avatar_url: 'https://cdn.seccion.ai/c2.jpg',
          bio: 'Only 1 public photo',
          role: 'creator',
          is_kyc_verified: true,
          privacy_settings: {},
        },
        {
          id: 'unverified-creator',
          username: 'no_kyc_creator',
          display_name: 'No KYC',
          avatar_url: 'https://cdn.seccion.ai/c3.jpg',
          bio: '2 photos but no KYC',
          role: 'creator',
          is_kyc_verified: false,
          privacy_settings: {},
        },
        {
          id: 'ready-madrid-creator',
          username: 'ready_creator',
          display_name: 'Ready Creator',
          avatar_url: 'https://cdn.seccion.ai/c4.jpg',
          bio: 'Verified & complete',
          role: 'creator',
          is_kyc_verified: true,
          privacy_settings: {},
        },
      ];

      const makeChain = (rows: any[]) => {
        const chain: any = {
          select: vi.fn(() => chain),
          update: vi.fn(() => chain),
          not: vi.fn(() => chain),
          eq: vi.fn(() => chain),
          or: vi.fn(() => chain),
          gte: vi.fn(() => chain),
          lte: vi.fn(() => chain),
          in: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          single: vi.fn(async () => ({ data: rows[0] ?? null, error: null })),
          maybeSingle: vi.fn(async () => ({ data: rows[0] ?? null, error: null })),
          then: (resolve: any) => resolve({ data: rows, error: null }),
        };
        return chain;
      };

      mockServerFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          let isSearcherLookup = false;
          const chain: any = {
            select: vi.fn((cols: string) => {
              isSearcherLookup = cols.includes('creator_ultimate_pack');
              return chain;
            }),
            eq: vi.fn(() => chain),
            not: vi.fn(() => chain),
            limit: vi.fn(() => chain),
            single: vi.fn(async () => ({
              data: isSearcherLookup ? searcherProfile : null,
              error: null,
            })),
            then: (resolve: any) => resolve({ data: candidateProfiles, error: null }),
          };
          return chain;
        }
        if (table === 'user_xp_profiles') {
          return makeChain([{ current_xp: 500, boost_passes_available: 0 }]);
        }
        if (table === 'profile_media') {
          return makeChain([
            { user_id: 'blocked-ma-creator' },
            { user_id: 'blocked-ma-creator' },
            { user_id: 'unready-one-photo' },
            { user_id: 'unverified-creator' },
            { user_id: 'unverified-creator' },
            { user_id: 'ready-madrid-creator' },
            { user_id: 'ready-madrid-creator' },
          ]);
        }
        return makeChain([]);
      });

      const { POST } = await import('../../src/app/api/v2/search/advanced/route');
      const res = await POST(
        new NextRequest('https://seccion.ai/api/v2/search/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'cf-ipcountry': 'MA' },
          body: JSON.stringify({ userId: 'searcher-1', freeSearch: true }),
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.results.map((r: any) => r.id)).toEqual(['ready-madrid-creator']);
    });
  });

  describe('/[username] Vanity Page Geoblock & Readiness Gate', () => {
    it('returns Creator Not Found metadata & notFound() to MA visitors and unready creators', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const maCreator = {
        id: 'creator-ma',
        username: 'amina_ma',
        display_name: 'Amina',
        avatar_url: 'https://cdn.seccion.ai/a.jpg',
        bio: 'Verified creator',
        role: 'creator',
        is_kyc_verified: true,
        privacy_settings: { morocco_domestic_shield: true, blocked_countries: ['MA'] },
      };

      const makeVanityChain = (rows: any[], singleRow: any = null) => {
        const chain: any = {
          select: vi.fn(() => chain),
          ilike: vi.fn(() => chain),
          eq: vi.fn(() => chain),
          filter: vi.fn(() => chain),
          order: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          maybeSingle: vi.fn(async () => ({ data: singleRow, error: null })),
          then: (resolve: any) => resolve({ data: rows, error: null }),
        };
        return chain;
      };

      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return makeVanityChain([maCreator], maCreator);
        }
        if (table === 'profile_media') {
          return makeVanityChain([{ id: 'p1' }, { id: 'p2' }]);
        }
        return makeVanityChain([]);
      });

      const { generateMetadata, default: CreatorVanityPage } = await import(
        '../../src/app/[username]/page'
      );

      // 1. Visitor in Morocco (MA) -> metadata & page both blocked cleanly
      mockRequestHeaders.mockReturnValue(new Headers({ 'cf-ipcountry': 'MA' }));
      const blockedMeta = await generateMetadata({
        params: Promise.resolve({ username: 'amina_ma' }),
      });
      expect(blockedMeta.title).toBe('Creator Not Found');
      await expect(
        CreatorVanityPage({ params: Promise.resolve({ username: 'amina_ma' }) })
      ).rejects.toThrow('NEXT_NOT_FOUND');

      // 2. Unready creator (< 2 profile_media items) viewed from Spain -> also blocked
      mockRequestHeaders.mockReturnValue(new Headers({ 'cf-ipcountry': 'ES' }));
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return makeVanityChain([maCreator], maCreator);
        }
        if (table === 'profile_media') {
          return makeVanityChain([{ id: 'only-1' }]);
        }
        return makeVanityChain([]);
      });
      await expect(
        CreatorVanityPage({ params: Promise.resolve({ username: 'amina_ma' }) })
      ).rejects.toThrow('NEXT_NOT_FOUND');

      // 3. Ready creator viewed from ES with >= 2 public media -> allowed
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return makeVanityChain([maCreator], maCreator);
        }
        if (table === 'profile_media') {
          return makeVanityChain([{ id: 'p1' }, { id: 'p2' }]);
        }
        return makeVanityChain([]);
      });
      const okMeta = await generateMetadata({
        params: Promise.resolve({ username: 'amina_ma' }),
      });
      expect(okMeta.title).toContain('Amina');
    });
  });
});
