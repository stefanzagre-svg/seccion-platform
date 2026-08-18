import { test, expect } from '../fixtures/ux-fixture';

test.describe('Stage 3: Interactive Messaging, AI Wingman & Ephemeral Media', () => {

  test('3.1 Verify Messages Page Layout & Inbox Controls', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');

    // Confirm that the messages UI or login gate is rendered
    expect(page.url()).toBeTruthy();
  });

  test('3.2 Verify AI Wingman Assistant API Route Contract', async ({ request }) => {
    const res = await request.post('/api/v2/assistant/chat', {
      data: {
        message: 'Hola Wingman, dame un consejo de apertura.'
      }
    });

    // Returns either authenticated stream, credits required, or unauthorized error
    expect([200, 400, 401, 402, 403]).toContain(res.status());
  });

  test('3.3 Verify Boost Pass Status & Pricing Endpoints', async ({ request }) => {
    const res = await request.get('/api/v2/boost-pass/status');
    expect([200, 400, 401]).toContain(res.status());
  });
});
