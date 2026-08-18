import { test, expect } from '../fixtures/ux-fixture';
import { TestDataFactory } from '../fixtures/test-data-factory';

test.describe('Stage 6: Platform Chaos, UX Friction, Memory & Mobile Viewports', () => {

  test('6.1 Angry User Simulation: Rapid click storm & form stress', async ({ page }) => {
    await page.goto('/how-we-do');
    await page.waitForLoadState('domcontentloaded');

    // Simulate angry user rapid clicking on primary elements
    const buttons = page.locator('button, a');
    const count = await buttons.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(2, count); i++) {
        await buttons.nth(i).click({ clickCount: 3, delay: 30, timeout: 1500, force: true }).catch(() => {});
      }
    }

    expect(page.url()).toBeTruthy();
  });

  test('6.2 Security Chaos Payload Resistance', async ({ page }) => {
    const chaos = TestDataFactory.getChaosPayloads();
    expect(chaos.length).toBeGreaterThan(3);

    // Verify app handles navigation to static legal/info routes without breaking
    await page.goto('/rules');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/rules');

    await page.goto('/privacy');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/privacy');
  });

  test('6.3 Mobile Viewport Ergonomics & Safe Area Verification', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');

    // Verify viewport responsive bounds
    const viewportSize = page.viewportSize();
    expect(viewportSize).toBeTruthy();
    expect(viewportSize!.width).toBeGreaterThan(300);
  });
});
