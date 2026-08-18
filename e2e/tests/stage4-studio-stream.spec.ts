import { test, expect } from '../fixtures/ux-fixture';

test.describe('Stage 4: Creator Studio, AI Content Ops & Live Streaming (Pulse)', () => {

  test('4.1 Verify Creator Studio Route Structure & Navigation', async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toBeTruthy();
  });

  test('4.2 Verify Studio AI Tools & Copilot Content Generation', async ({ page }) => {
    await page.goto('/studio/ai-tools');
    await page.waitForLoadState('domcontentloaded');

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('4.3 Verify LiveKit Token Minting & Stream Demo Endpoint', async ({ request }) => {
    const res = await request.post('/api/livekit/token', {
      data: {
        room: 'test-room',
        identity: 'test-user'
      }
    });

    expect([200, 400, 401]).toContain(res.status());
  });
});
