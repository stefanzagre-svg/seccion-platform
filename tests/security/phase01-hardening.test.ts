import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { resolveServerVerifiedRole, sortKeys, shortenFloats } from '../../src/lib/didit';

const mockGetUser = vi.fn();
const mockAdminUpdate = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock('@/lib/admin-auth', () => ({
  verifyAdminAuth: vi.fn(async () => null),
  unauthorizedResponse: vi.fn(
    (msg = 'Unauthorized') => new Response(JSON.stringify({ error: msg }), { status: 401 })
  ),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
    auth: {
      admin: {
        getUserById: vi.fn(async () => ({ data: { user: null } })),
      },
    },
  })),
}));

describe('Phase 0 & Phase 1 Security Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveServerVerifiedRole', () => {
    it('never grants creator without DB approval, founder email, or existing creator role', () => {
      expect(
        resolveServerVerifiedRole({
          existingRole: 'member',
          email: 'member@example.com',
          applicationStatus: 'pending',
        })
      ).toBe('member');

      expect(
        resolveServerVerifiedRole({
          existingRole: null,
          email: 'creator@example.com',
          applicationStatus: 'approved',
        })
      ).toBe('creator');

      expect(
        resolveServerVerifiedRole({
          existingRole: 'member',
          email: 'stefan.zagre@gmail.com',
          applicationStatus: null,
        })
      ).toBe('creator');

      expect(
        resolveServerVerifiedRole({
          existingRole: 'admin',
          email: 'admin@seccion.ai',
          applicationStatus: null,
        })
      ).toBe('admin');
    });
  });

  describe('Retired KYC Endpoints (410 Gone)', () => {
    it('POST /api/kyc/shufti-webhook returns 410 Gone', async () => {
      const { POST } = await import('../../src/app/api/kyc/shufti-webhook/route');
      const res = await POST();
      expect(res.status).toBe(410);
    });

    it('POST /api/kyc/verify returns 401 unauthenticated and 410 authenticated', async () => {
      const { POST } = await import('../../src/app/api/kyc/verify/route');

      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('No session') });
      const resUnauth = await POST(new NextRequest('http://localhost:3000/api/kyc/verify', { method: 'POST' }));
      expect(resUnauth.status).toBe(401);

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      const resAuth = await POST(new NextRequest('http://localhost:3000/api/kyc/verify', { method: 'POST' }));
      expect(resAuth.status).toBe(410);
    });
  });

  describe('POST /api/kyc/didit-session (Fail-Closed)', () => {
    it('returns 503 instead of static URL fallback when DIDIT_API_KEY is unset', async () => {
      const origKey = process.env.DIDIT_API_KEY;
      delete process.env.DIDIT_API_KEY;

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1', email: 'u@example.com' } }, error: null });

      try {
        const { POST } = await import('../../src/app/api/kyc/didit-session/route');
        const req = new NextRequest('http://localhost:3000/api/kyc/didit-session', {
          method: 'POST',
          body: JSON.stringify({ returnTo: '/onboarding/kyc?session_done=true', targetRole: 'creator' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(503);
        const json = await res.json();
        expect(json.url).toBeUndefined();
      } finally {
        if (origKey !== undefined) process.env.DIDIT_API_KEY = origKey;
      }
    });
  });

  describe('POST /api/kyc/didit-webhook (Required Timestamp & DB Idempotency)', () => {
    const signDidit = (obj: Record<string, unknown>, secret: string) => {
      const canonical = JSON.stringify(sortKeys(shortenFloats(obj)));
      return crypto.createHmac('sha256', secret).update(canonical, 'utf8').digest('hex');
    };

    it('rejects valid signature with 401 when x-timestamp header is missing', async () => {
      const origSecret = process.env.DIDIT_WEBHOOK_SECRET;
      process.env.DIDIT_WEBHOOK_SECRET = 'didit_test_secret_123';

      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const payload = { event_id: 'evt_missing_ts', status: 'Approved', vendor_data: 'user-1' };
        const raw = JSON.stringify(payload);
        const sig = signDidit(payload, process.env.DIDIT_WEBHOOK_SECRET);

        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          headers: { 'x-signature-v2': sig },
          body: raw,
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
        expect(await res.text()).toBe('missing timestamp');
      } finally {
        if (origSecret !== undefined) process.env.DIDIT_WEBHOOK_SECRET = origSecret;
        else delete process.env.DIDIT_WEBHOOK_SECRET;
      }
    });

    it('deduplicates replayed session_id via DB processed_sessions and skips duplicate XP update', async () => {
      const origSecret = process.env.DIDIT_WEBHOOK_SECRET;
      process.env.DIDIT_WEBHOOK_SECRET = 'didit_test_secret_123';

      mockAdminFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: 'user-1',
                username: 'alice',
                email: 'alice@example.com',
                role: 'creator',
                is_kyc_verified: true,
                connection_points: 500,
                privacy_settings: {
                  age_verification: {
                    verified: true,
                    sessionId: 'sess_123',
                    kyc_xp_awarded: true,
                    processed_sessions: ['evt_replayed_1'],
                  },
                },
              },
            }),
          }),
        }),
        update: mockAdminUpdate,
      }));

      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const payload = {
          event_id: 'evt_replayed_1',
          session_id: 'sess_123',
          status: 'Approved',
          vendor_data: 'user-1',
        };
        const raw = JSON.stringify(payload);
        const sig = signDidit(payload, process.env.DIDIT_WEBHOOK_SECRET);
        const nowTs = Math.floor(Date.now() / 1000);

        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          headers: { 'x-signature-v2': sig, 'x-timestamp': String(nowTs) },
          body: raw,
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(mockAdminUpdate).not.toHaveBeenCalled();
      } finally {
        if (origSecret !== undefined) process.env.DIDIT_WEBHOOK_SECRET = origSecret;
        else delete process.env.DIDIT_WEBHOOK_SECRET;
      }
    });
  });

  describe('/api/admin/creator-applications Admin Auth', () => {
    it('blocks unauthenticated GET, PATCH, and DELETE with 401', async () => {
      const { GET, PATCH, DELETE } = await import('../../src/app/api/admin/creator-applications/route');

      const resGet = await GET(new NextRequest('http://localhost:3000/api/admin/creator-applications'));
      expect(resGet.status).toBe(401);

      const resPatch = await PATCH(
        new NextRequest('http://localhost:3000/api/admin/creator-applications', {
          method: 'PATCH',
          body: JSON.stringify({ id: 'app-1', status: 'approved' }),
        })
      );
      expect(resPatch.status).toBe(401);

      const resDel = await DELETE(
        new NextRequest('http://localhost:3000/api/admin/creator-applications?id=app-1', {
          method: 'DELETE',
        })
      );
      expect(resDel.status).toBe(401);
    });
  });

  describe('/api/v2/search/advanced IDOR & Auth Guard', () => {
    it('returns 401 when unauthenticated and 403 when spoofing another userId', async () => {
      const { POST } = await import('../../src/app/api/v2/search/advanced/route');

      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('No user') });
      const resUnauth = await POST(
        new NextRequest('http://localhost:3000/api/v2/search/advanced', {
          method: 'POST',
          body: JSON.stringify({ userId: 'victim-id' }),
        })
      );
      expect(resUnauth.status).toBe(401);

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'attacker-id' } }, error: null });
      const resIdor = await POST(
        new NextRequest('http://localhost:3000/api/v2/search/advanced', {
          method: 'POST',
          body: JSON.stringify({ userId: 'victim-id' }),
        })
      );
      expect(resIdor.status).toBe(403);
    });
  });

  describe('Cloudflare Stream Webhooks (Fail-Closed)', () => {
    it('fails closed when webhook secret is missing or signature is invalid on both endpoints', async () => {
      const origA = process.env.CLOUDFLARE_WEBHOOK_SECRET;
      const origB = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
      delete process.env.CLOUDFLARE_WEBHOOK_SECRET;
      delete process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;

      try {
        const { POST: streamPost } = await import('../../src/app/api/stream/webhook/route');
        const { POST: v2Post } = await import('../../src/app/api/v2/cloudflare/webhook/route');

        const resNoSecret = await streamPost(
          new NextRequest('http://localhost:3000/api/stream/webhook', { method: 'POST', body: '{}' })
        );
        expect(resNoSecret.status).toBe(500);

        process.env.CLOUDFLARE_WEBHOOK_SECRET = 'cf_stream_secret_2026';

        const resMissingSig = await v2Post(
          new NextRequest('http://localhost:3000/api/v2/cloudflare/webhook', {
            method: 'POST',
            body: JSON.stringify({ uid: 'vid-1' }),
          })
        );
        expect(resMissingSig.status).toBe(401);

        const nowTs = Math.floor(Date.now() / 1000);
        const resBadSig = await streamPost(
          new NextRequest('http://localhost:3000/api/stream/webhook', {
            method: 'POST',
            headers: { 'Webhook-Signature': `time=${nowTs},t=${nowTs},v1=0000deadbeef` },
            body: JSON.stringify({ uid: 'vid-1' }),
          })
        );
        expect(resBadSig.status).toBe(401);
      } finally {
        if (origA !== undefined) process.env.CLOUDFLARE_WEBHOOK_SECRET = origA;
        else delete process.env.CLOUDFLARE_WEBHOOK_SECRET;
        if (origB !== undefined) process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET = origB;
        else delete process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
      }
    });
  });
});
