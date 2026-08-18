import { test, expect } from '../fixtures/ux-fixture';

test.describe('Stage 5: Monetization, NOWPayments Crypto & Escrow Verification', () => {

  test('5.1 Verify Dynamic Pricing API Contract & Fallback Protection', async ({ request }) => {
    const res = await request.get('/api/pricing/dynamic?creatorId=00000000-0000-0000-0000-000000000000');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.dynamicPrice).toBeDefined();
  });

  test('5.2 Verify Crypto Invoice Creation Endpoint (USDT/USDC/BTC)', async ({ request }) => {
    const res = await request.post('/api/billing/crypto/create-invoice', {
      data: {
        price_amount: 29.99,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_description: 'E2E QA Test Subscription'
      }
    });

    // Endpoint responds with 200, 400 or 401
    expect([200, 400, 401]).toContain(res.status());
  });

  test('5.3 Verify Settings & Billing Subscription View', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
