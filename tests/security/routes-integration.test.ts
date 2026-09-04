import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('Adversarial Route Handlers Direct Invocations', () => {

  // =========================================================================
  // 1. /api/media/blur/route.ts
  // =========================================================================
  describe('GET /api/media/blur', () => {
    it('returns 400 when url query param is missing', async () => {
      const { GET } = await import('../../src/app/api/media/blur/route');
      const req = new NextRequest('http://localhost:3000/api/media/blur');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing image url parameter');
    });

    it('returns 400 on malformed URL or invalid protocol (e.g. ftp://)', async () => {
      const { GET } = await import('../../src/app/api/media/blur/route');
      const req = new NextRequest('http://localhost:3000/api/media/blur?url=ftp://example.com/image.jpg');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid URL protocol: must be http or https');
    });

    it('returns 400 on javascript: or file: protocol SSRF attempts', async () => {
      const { GET } = await import('../../src/app/api/media/blur/route');
      const req = new NextRequest('http://localhost:3000/api/media/blur?url=javascript:alert(1)');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid URL protocol: must be http or https');
    });

    it('rejects private and cloud metadata IPs with 400 (SSRF protection)', async () => {
      const { GET } = await import('../../src/app/api/media/blur/route');
      const ssrfTargets = [
        'http://127.0.0.1/admin',
        'http://localhost:3000/api',
        'http://169.254.169.254/latest/meta-data/',
        'http://10.0.0.1/internal.jpg',
        'http://172.16.0.1/internal.jpg',
        'http://192.168.1.1/router.png',
        'http://[::1]/secret.png',
      ];

      for (const target of ssrfTargets) {
        const req = new NextRequest(`http://localhost:3000/api/media/blur?url=${encodeURIComponent(target)}`);
        const res = await GET(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/SSRF protection|Invalid URL protocol/);
      }
    });
  });

  // =========================================================================
  // 2. /api/billing/crypto/webhook/route.ts (NOWPayments)
  // =========================================================================
  describe('POST /api/billing/crypto/webhook (NOWPayments)', () => {
    it('returns 401 when x-nowpayments-sig is missing', async () => {
      const { POST } = await import('../../src/app/api/billing/crypto/webhook/route');
      const req = new NextRequest('http://localhost:3000/api/billing/crypto/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: 12345 }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Missing signature');
    });

    it('returns 403 when signature is forged or bit-flipped', async () => {
      const { POST } = await import('../../src/app/api/billing/crypto/webhook/route');
      const req = new NextRequest('http://localhost:3000/api/billing/crypto/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-nowpayments-sig': 'bad_corrupted_signature_12345',
        },
        body: JSON.stringify({ payment_id: 12345 }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Invalid signature');
    });

    it('returns 403 when signature is truncated', async () => {
      const { POST } = await import('../../src/app/api/billing/crypto/webhook/route');
      const req = new NextRequest('http://localhost:3000/api/billing/crypto/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-nowpayments-sig': 'a', // 1 char truncated
        },
        body: JSON.stringify({ payment_id: 12345 }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Invalid signature');
    });
  });

  // =========================================================================
  // 3. /api/billing/segpay-postback/route.ts (Segpay)
  // =========================================================================
  describe('POST /api/billing/segpay-postback', () => {
    it('returns 400 when necessary custom tracking parameters are missing', async () => {
      const { POST } = await import('../../src/app/api/billing/segpay-postback/route');
      const req = new NextRequest('http://localhost:3000/api/billing/segpay-postback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'random_param=123',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing necessary custom tracking parameters');
    });

    it('returns 500 when SEGPAY_POSTBACK_SECRET is unconfigured in environment', async () => {
      const saved = process.env.SEGPAY_POSTBACK_SECRET;
      delete process.env.SEGPAY_POSTBACK_SECRET;
      try {
        const { POST } = await import('../../src/app/api/billing/segpay-postback/route');
        const req = new NextRequest('http://localhost:3000/api/billing/segpay-postback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=auth&custom1=user1&custom2=creator1&custom3=vip&tranid=tx1&price=10.00',
        });
        const res = await POST(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('Webhook secret not configured');
      } finally {
        if (saved) process.env.SEGPAY_POSTBACK_SECRET = saved;
      }
    });

    it('returns 401 when signature/hash is missing and secret is configured', async () => {
      process.env.SEGPAY_POSTBACK_SECRET = 'test_secret_key';
      try {
        const { POST } = await import('../../src/app/api/billing/segpay-postback/route');
        const req = new NextRequest('http://localhost:3000/api/billing/segpay-postback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=auth&custom1=user1&custom2=creator1&custom3=vip&tranid=tx1&price=10.00',
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toBe('Missing security signature');
      } finally {
        delete process.env.SEGPAY_POSTBACK_SECRET;
      }
    });

    it('returns 403 when signature is invalid or forged', async () => {
      process.env.SEGPAY_POSTBACK_SECRET = 'test_secret_key';
      try {
        const { POST } = await import('../../src/app/api/billing/segpay-postback/route');
        const req = new NextRequest('http://localhost:3000/api/billing/segpay-postback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=auth&custom1=user1&custom2=creator1&custom3=vip&tranid=tx1&price=10.00&hash=forged_invalid_hash',
        });
        const res = await POST(req);
        expect(res.status).toBe(403);
        const json = await res.json();
        expect(json.error).toBe('Invalid security signature');
      } finally {
        delete process.env.SEGPAY_POSTBACK_SECRET;
      }
    });
  });

  // =========================================================================
  // 4. /api/kyc/didit-webhook/route.ts (DIDIT)
  // =========================================================================
  describe('POST /api/kyc/didit-webhook', () => {
    it('returns 500 when DIDIT_WEBHOOK_SECRET is unconfigured', async () => {
      const saved = process.env.DIDIT_WEBHOOK_SECRET;
      delete process.env.DIDIT_WEBHOOK_SECRET;
      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          body: JSON.stringify({ status: 'Approved' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(500);
        const text = await res.text();
        expect(text).toBe('secret not configured');
      } finally {
        if (saved) process.env.DIDIT_WEBHOOK_SECRET = saved;
      }
    });

    it('returns 401 when x-signature-v2 is missing', async () => {
      process.env.DIDIT_WEBHOOK_SECRET = 'didit_secret';
      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          body: JSON.stringify({ status: 'Approved' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
        const text = await res.text();
        expect(text).toBe('missing signature');
      } finally {
        delete process.env.DIDIT_WEBHOOK_SECRET;
      }
    });

    it('returns 400 on malformed JSON payload', async () => {
      process.env.DIDIT_WEBHOOK_SECRET = 'didit_secret';
      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          headers: { 'x-signature-v2': 'fake_sig_1234567890' },
          body: '{"status": "unclosed_json',
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const text = await res.text();
        expect(text).toBe('invalid json');
      } finally {
        delete process.env.DIDIT_WEBHOOK_SECRET;
      }
    });

    it('returns 401 when signature is bad/forged', async () => {
      process.env.DIDIT_WEBHOOK_SECRET = 'didit_secret';
      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          headers: { 'x-signature-v2': 'bad_signature_digest' },
          body: JSON.stringify({ status: 'Approved', session_id: 'test' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
        const text = await res.text();
        expect(text).toBe('bad sig');
      } finally {
        delete process.env.DIDIT_WEBHOOK_SECRET;
      }
    });

    it('returns 401 when timestamp is stale (>300s)', async () => {
      process.env.DIDIT_WEBHOOK_SECRET = 'didit_secret';
      try {
        const { POST } = await import('../../src/app/api/kyc/didit-webhook/route');
        const staleTime = Math.floor(Date.now() / 1000) - 400; // 400s old
        const req = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
          method: 'POST',
          headers: {
            'x-timestamp': String(staleTime),
            'x-signature-v2': 'some_sig',
          },
          body: JSON.stringify({ status: 'Approved' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
        const text = await res.text();
        expect(text).toBe('stale');
      } finally {
        delete process.env.DIDIT_WEBHOOK_SECRET;
      }
    });
  });

  // =========================================================================
  // 5. middleware.ts Edge Routing
  // =========================================================================
  describe('Edge Middleware Behavior', () => {
    it('blocks unauthenticated requests to private API endpoints with 401', async () => {
      const { middleware } = await import('../../src/middleware');
      const req = new NextRequest('http://localhost:3000/api/v2/assistant/chat');
      const res = await middleware(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized: Valid user session required');
    });

    it('redirects unauthenticated requests to protected pages (/stream-demo) to /login', async () => {
      const { middleware } = await import('../../src/middleware');
      const req = new NextRequest('http://localhost:3000/stream-demo');
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login');
    });

    it('verifies middleware passes through public webhooks without redirect to /onboarding', async () => {
      const { middleware } = await import('../../src/middleware');
      const req = new NextRequest('http://localhost:3000/api/billing/crypto/webhook');
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });

    it('handles garbage/malformed cookies safely without crashing into 500', async () => {
      const { middleware } = await import('../../src/middleware');
      const req = new NextRequest('http://localhost:3000/feed', {
        headers: {
          cookie: 'sb-access-token=%%corrupt_garbage_jwt_cookie%%; other=123',
        },
      });
      const res = await middleware(req);
      // Because user is null/invalid, redirected to /login safely
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login');
    });
  });
});
