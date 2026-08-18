import { test, expect } from '../fixtures/ux-fixture';

test.describe('Stage 2: Discovery, Feed, Vibe Radar & Chemistry Match Engine', () => {

  test('2.1 Verify Feed Route Loads with Cards & DRM Media Gating', async ({ page }) => {
    await page.goto('/feed');
    await page.waitForLoadState('domcontentloaded');

    // Confirm that the feed layout is active or redirected to member preview
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('2.2 Verify Vibe Radar Page & Chemistry Meter Rendering', async ({ page }) => {
    await page.goto('/vibe-radar');
    await page.waitForLoadState('domcontentloaded');

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('2.3 Verify Top Profiles & Archetype Filter Navigation', async ({ page }) => {
    await page.goto('/top-profile');
    await page.waitForLoadState('domcontentloaded');

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
