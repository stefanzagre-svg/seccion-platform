import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../src/middleware';

describe('Empirical Verification of Middleware Webhook & Public API Pass-Through', () => {
  const publicApiEndpoints = [
    '/api/billing/crypto/webhook',
    '/api/crypto/nowpayments-webhook',
    '/api/billing/segpay-postback',
    '/api/kyc/didit-webhook',
    '/api/media/blur',
    '/api/webhooks/telegram',
    '/api/contact',
    '/api/early-access',
  ];

  for (const endpoint of publicApiEndpoints) {
    it(`verifies middleware passes through unauthenticated public API route ${endpoint} without redirection`, async () => {
      const req = new NextRequest(`http://localhost:3000${endpoint}`);
      const res = await middleware(req);
      
      console.log(`[Middleware Pass-Through] ${endpoint} -> Status: ${res.status}`);
      
      // Verified: Public API routes pass through to route handlers without HTTP 307 redirect
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });
  }
});
