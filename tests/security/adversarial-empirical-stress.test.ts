import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { middleware } from '../../src/middleware';
import { GET as blurGet, isPrivateOrBlockedHost } from '../../src/app/api/media/blur/route';
import { POST as cryptoWebhookPost } from '../../src/app/api/billing/crypto/webhook/route';
import { POST as segpayPostbackPost, verifySegpaySignature } from '../../src/app/api/billing/segpay-postback/route';
import { POST as diditWebhookPost, verifyDiditSignature, shortenFloats, sortKeys } from '../../src/app/api/kyc/didit-webhook/route';
import { nowPayments } from '../../src/lib/nowpayments';

describe('CHALLENGER EMPIRICAL VERIFICATION & STRESS HARNESS', () => {

  // =========================================================================
  // PILLAR 1: Middleware Pass-Through for Webhooks & Public APIs
  // =========================================================================
  describe('Pillar 1: Middleware Pass-Through for Webhooks', () => {
    const requiredWebhookEndpoints = [
      '/api/billing/crypto/webhook',
      '/api/billing/segpay-postback',
      '/api/kyc/didit-webhook',
      '/api/media/blur',
    ];

    for (const endpoint of requiredWebhookEndpoints) {
      it(`[Mandatory] Unauthenticated request to ${endpoint} returns HTTP 200 pass-through without 307 redirect`, async () => {
        const req = new NextRequest(`http://localhost:3000${endpoint}`);
        const res = await middleware(req);
        
        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      });

      it(`[Stress] Request with query parameters to ${endpoint}?foo=bar&baz=1 returns HTTP 200 pass-through`, async () => {
        const req = new NextRequest(`http://localhost:3000${endpoint}?foo=bar&baz=1`);
        const res = await middleware(req);
        
        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      });

      it(`[Stress] Request with trailing slash to ${endpoint}/ returns HTTP 200 pass-through`, async () => {
        const req = new NextRequest(`http://localhost:3000${endpoint}/`);
        const res = await middleware(req);
        
        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      });
    }

    it('[Control] Unauthenticated request to private API (/api/v2/messages/analyze) returns 401 Unauthorized', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/messages/analyze');
      const res = await middleware(req);
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });

    it('[Control] Unauthenticated request to protected page (/stream-demo) redirects to /login with 307', async () => {
      const req = new NextRequest('http://localhost:3000/stream-demo');
      const res = await middleware(req);
      
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login');
    });
  });

  // =========================================================================
  // PILLAR 2: SSRF Attack Scenarios & Boundary Stress
  // =========================================================================
  describe('Pillar 2: SSRF Attack Scenarios against /api/media/blur', () => {
    const loopbackTargets = [
      'http://127.0.0.1/admin',
      'http://127.0.0.2:8080/internal',
      'http://127.255.255.254/secret',
      'http://localhost/metrics',
      'http://localhost:3000/api/admin',
      'http://foo.localhost/leak',
      'http://0.0.0.0:8000/keys',
      'http://[::1]/config',
    ];

    const metadataTargets = [
      'http://169.254.169.254/latest/meta-data/',
      'http://169.254.169.254/computeMetadata/v1/',
      'http://169.254.0.1/metadata',
      'http://169.254.1.1:80/secret',
      'http://metadata.google.internal/computeMetadata/v1/',
      'http://corp.local/keys',
    ];

    const rfc1918Targets = [
      'http://10.0.0.1/admin',
      'http://10.254.254.254:9000/api',
      'http://172.16.0.1/status',
      'http://172.31.255.255/intranet',
      'http://192.168.0.1/router-login',
      'http://192.168.1.1:8080/setup',
      'http://100.64.0.1/carrier-nat',
      'http://100.127.255.255/internal',
    ];

    const protocolAttackTargets = [
      'ftp://example.com/image.png',
      'file:///etc/passwd',
      'javascript:alert(1)',
      'gopher://127.0.0.1:6379/_flushall',
    ];

    it('[Mandatory] Strictly returns HTTP 400 for all Loopback targets', async () => {
      for (const target of loopbackTargets) {
        const req = new NextRequest(`http://localhost:3000/api/media/blur?url=${encodeURIComponent(target)}`);
        const res = await blurGet(req);
        
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/SSRF protection|Invalid URL protocol/);
      }
    });

    it('[Mandatory] Strictly returns HTTP 400 for Cloud Metadata targets (169.254.169.254 & .internal)', async () => {
      for (const target of metadataTargets) {
        const req = new NextRequest(`http://localhost:3000/api/media/blur?url=${encodeURIComponent(target)}`);
        const res = await blurGet(req);
        
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/SSRF protection/);
      }
    });

    it('[Mandatory] Strictly returns HTTP 400 for Private RFC 1918 IPs (10.x, 172.16-31.x, 192.168.x)', async () => {
      for (const target of rfc1918Targets) {
        const req = new NextRequest(`http://localhost:3000/api/media/blur?url=${encodeURIComponent(target)}`);
        const res = await blurGet(req);
        
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/SSRF protection/);
      }
    });

    it('[Stress] Protocol attack vectors (file, ftp, javascript, gopher) return HTTP 400', async () => {
      for (const target of protocolAttackTargets) {
        const req = new NextRequest(`http://localhost:3000/api/media/blur?url=${encodeURIComponent(target)}`);
        const res = await blurGet(req);
        
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/Invalid URL protocol|SSRF protection/);
      }
    });

    it('[Oracle] Directly tests isPrivateOrBlockedHost with diverse inputs', () => {
      // Must block
      expect(isPrivateOrBlockedHost('127.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedHost('127.10.20.30')).toBe(true);
      expect(isPrivateOrBlockedHost('localhost')).toBe(true);
      expect(isPrivateOrBlockedHost('api.internal')).toBe(true);
      expect(isPrivateOrBlockedHost('service.local')).toBe(true);
      expect(isPrivateOrBlockedHost('169.254.169.254')).toBe(true);
      expect(isPrivateOrBlockedHost('10.1.2.3')).toBe(true);
      expect(isPrivateOrBlockedHost('172.20.0.5')).toBe(true);
      expect(isPrivateOrBlockedHost('192.168.100.50')).toBe(true);
      expect(isPrivateOrBlockedHost('::1')).toBe(true);
      expect(isPrivateOrBlockedHost('fc00::1')).toBe(true);
      expect(isPrivateOrBlockedHost('fe80::dead:beef')).toBe(true);
      expect(isPrivateOrBlockedHost('0.0.0.0')).toBe(true);
      expect(isPrivateOrBlockedHost('224.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedHost('255.255.255.255')).toBe(true);

      // Must allow legitimate public hosts
      expect(isPrivateOrBlockedHost('images.unsplash.com')).toBe(false);
      expect(isPrivateOrBlockedHost('cdn.seccion.ai')).toBe(false);
      expect(isPrivateOrBlockedHost('supabase.co')).toBe(false);
      expect(isPrivateOrBlockedHost('8.8.8.8')).toBe(false);
      expect(isPrivateOrBlockedHost('1.1.1.1')).toBe(false);
    });
  });

  // =========================================================================
  // PILLAR 3: Cryptographic Verification & Fault Injection
  // =========================================================================
  describe('Pillar 3: Cryptographic Verification & Fault Injection', () => {
    
    // --- NOWPayments ---
    describe('NOWPayments Fault Injection', () => {
      const SECRET = 'challenger_nowpayments_secret_test_2026';
      const validPayload = JSON.stringify({
        payment_id: 888777,
        payment_status: 'finished',
        price_amount: 150,
        order_id: 'np_order_test',
      });
      const validSig = crypto.createHmac('sha512', SECRET).update(validPayload).digest('hex');

      it('accepts authentic HMAC-SHA512 signature', () => {
        (nowPayments as any).ipnSecret = SECRET;
        expect(nowPayments.verifyIPNSignature(validPayload, validSig)).toBe(true);
      });

      it('strictly fails closed on bit flip in first, middle, or last character', () => {
        (nowPayments as any).ipnSecret = SECRET;

        const flipChar = (c: string) => (c === '0' ? '1' : '0');

        const flippedFirst = flipChar(validSig[0]) + validSig.slice(1);
        const midIdx = Math.floor(validSig.length / 2);
        const flippedMid = validSig.slice(0, midIdx) + flipChar(validSig[midIdx]) + validSig.slice(midIdx + 1);
        const flippedLast = validSig.slice(0, -1) + flipChar(validSig.slice(-1));

        expect(nowPayments.verifyIPNSignature(validPayload, flippedFirst)).toBe(false);
        expect(nowPayments.verifyIPNSignature(validPayload, flippedMid)).toBe(false);
        expect(nowPayments.verifyIPNSignature(validPayload, flippedLast)).toBe(false);
      });

      it('strictly fails closed on tampered payload (price_amount changed from 150 to 1)', () => {
        (nowPayments as any).ipnSecret = SECRET;
        const tamperedPayload = JSON.stringify({
          payment_id: 888777,
          payment_status: 'finished',
          price_amount: 1, // tampered
          order_id: 'np_order_test',
        });
        expect(nowPayments.verifyIPNSignature(tamperedPayload, validSig)).toBe(false);
      });

      it('strictly fails closed when secret is empty or undefined', () => {
        (nowPayments as any).ipnSecret = '';
        expect(nowPayments.verifyIPNSignature(validPayload, validSig)).toBe(false);

        (nowPayments as any).ipnSecret = undefined;
        expect(nowPayments.verifyIPNSignature(validPayload, validSig)).toBe(false);
      });

      it('route handler returns 401 on missing signature and 403 on forged signature', async () => {
        (nowPayments as any).ipnSecret = SECRET;

        // Missing signature
        const reqMissing = new NextRequest('http://localhost:3000/api/billing/crypto/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: validPayload,
        });
        const resMissing = await cryptoWebhookPost(reqMissing);
        expect(resMissing.status).toBe(401);
        expect((await resMissing.json()).error).toBe('Missing signature');

        // Forged signature
        const reqForged = new NextRequest('http://localhost:3000/api/billing/crypto/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-nowpayments-sig': 'bad_forged_sig_12345',
          },
          body: validPayload,
        });
        const resForged = await cryptoWebhookPost(reqForged);
        expect(resForged.status).toBe(403);
        expect((await resForged.json()).error).toBe('Invalid signature');
      });
    });

    // --- Segpay ---
    describe('Segpay Fault Injection', () => {
      const SEGPAY_SECRET = 'segpay_challenger_test_secret_999';

      const validParams = new URLSearchParams({
        action: 'auth',
        custom1: 'sub_valid_123',
        custom2: 'creator_valid_456',
        custom3: 'vip',
        tranid: 'trans_valid_789',
        price: '49.99',
      });

      const sortedParams = Array.from(validParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

      const validHash = crypto.createHmac('sha256', SEGPAY_SECRET).update(sortedParams).digest('hex');

      it('authenticates valid Segpay signature successfully', () => {
        expect(verifySegpaySignature(validParams, SEGPAY_SECRET, validHash)).toBe(true);
      });

      it('strictly fails closed on bit flips and altered parameters', () => {
        const flippedHash = (validHash[0] === 'a' ? 'b' : 'a') + validHash.slice(1);
        expect(verifySegpaySignature(validParams, SEGPAY_SECRET, flippedHash)).toBe(false);

        // Alter price from 49.99 to 0.01
        const tamperedParams = new URLSearchParams(validParams);
        tamperedParams.set('price', '0.01');
        expect(verifySegpaySignature(tamperedParams, SEGPAY_SECRET, validHash)).toBe(false);
      });

      it('strictly fails closed when secret or received hash is empty', () => {
        expect(verifySegpaySignature(validParams, '', validHash)).toBe(false);
        expect(verifySegpaySignature(validParams, SEGPAY_SECRET, '')).toBe(false);
      });

      it('route handler returns 401 when signature header/param is missing', async () => {
        process.env.SEGPAY_POSTBACK_SECRET = SEGPAY_SECRET;
        try {
          const req = new NextRequest('http://localhost:3000/api/billing/segpay-postback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: validParams.toString(),
          });
          const res = await segpayPostbackPost(req);
          expect(res.status).toBe(401);
          expect((await res.json()).error).toBe('Missing security signature');
        } finally {
          delete process.env.SEGPAY_POSTBACK_SECRET;
        }
      });

      it('route handler returns 403 when signature is forged', async () => {
        process.env.SEGPAY_POSTBACK_SECRET = SEGPAY_SECRET;
        try {
          const forgedParams = new URLSearchParams(validParams);
          forgedParams.set('hash', 'deadbeef00000000000000000000000000000000000000000000000000000000');
          const req = new NextRequest('http://localhost:3000/api/billing/segpay-postback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: forgedParams.toString(),
          });
          const res = await segpayPostbackPost(req);
          expect(res.status).toBe(403);
          expect((await res.json()).error).toBe('Invalid security signature');
        } finally {
          delete process.env.SEGPAY_POSTBACK_SECRET;
        }
      });
    });

    // --- DIDIT KYC ---
    describe('DIDIT KYC Fault Injection', () => {
      const DIDIT_SECRET = 'didit_challenger_secret_xyz_789';

      const validObj = {
        session_id: 'didit_sess_123',
        status: 'Approved',
        vendor_data: 'user_challenger_999',
        score: 1.0, // whole float -> should become 1
      };

      const rawBody = JSON.stringify(validObj);
      const canonical = JSON.stringify(sortKeys(shortenFloats(validObj)));
      const validSig = crypto.createHmac('sha256', DIDIT_SECRET).update(canonical, 'utf8').digest('hex');

      it('authenticates canonicalized DIDIT payload and signature', () => {
        expect(verifyDiditSignature(rawBody, validSig, DIDIT_SECRET)).toBe(true);
      });

      it('canonicalization tests: float shortening and recursive key sorting', () => {
        expect(shortenFloats(1.0)).toBe(1);
        expect(shortenFloats(1.5)).toBe(1.5);
        expect(shortenFloats({ a: 2.0, b: [3.0, 4.2] })).toEqual({ a: 2, b: [3, 4.2] });

        const unsorted = { z: 1, a: 2, m: { y: 10, b: 20 } };
        const sorted = sortKeys(unsorted);
        expect(Object.keys(sorted as any)).toEqual(['a', 'm', 'z']);
        expect(Object.keys((sorted as any).m)).toEqual(['b', 'y']);
      });

      it('strictly fails closed on corrupted signature or bit flip', () => {
        const flippedSig = (validSig[0] === 'a' ? 'b' : 'a') + validSig.slice(1);
        expect(verifyDiditSignature(rawBody, flippedSig, DIDIT_SECRET)).toBe(false);
      });

      it('strictly fails closed on malformed JSON payload', () => {
        expect(verifyDiditSignature('{broken json', validSig, DIDIT_SECRET)).toBe(false);
      });

      it('route handler strictly returns 401 for bad signature and stale timestamps', async () => {
        process.env.DIDIT_WEBHOOK_SECRET = DIDIT_SECRET;
        try {
          // Bad sig
          const reqBadSig = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
            method: 'POST',
            headers: {
              'x-signature-v2': 'bad_sig_hex_1234567890abcdef',
              'Content-Type': 'application/json',
            },
            body: rawBody,
          });
          const resBadSig = await diditWebhookPost(reqBadSig);
          expect(resBadSig.status).toBe(401);
          expect(await resBadSig.text()).toBe('bad sig');

          // Stale timestamp (600s in the past)
          const staleTs = Math.floor(Date.now() / 1000) - 600;
          const reqStale = new NextRequest('http://localhost:3000/api/kyc/didit-webhook', {
            method: 'POST',
            headers: {
              'x-signature-v2': validSig,
              'x-timestamp': String(staleTs),
              'Content-Type': 'application/json',
            },
            body: rawBody,
          });
          const resStale = await diditWebhookPost(reqStale);
          expect(resStale.status).toBe(401);
          expect(await resStale.text()).toBe('stale');
        } finally {
          delete process.env.DIDIT_WEBHOOK_SECRET;
        }
      });
    });

  });
});
