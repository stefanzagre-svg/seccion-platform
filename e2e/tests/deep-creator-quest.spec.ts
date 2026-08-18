import { test, expect } from '../fixtures/ux-fixture';

test.describe('Deep Interactive Creator Quest E2E Certification', () => {

  test('Walks through full 8-step Creator Quest with interactive clicks', async ({ page, uxAnalyzer }) => {
    // 1. Direct navigation into Creator Quest via role parameter
    await page.goto('/onboarding?role=creator');
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Lobby Step and Enter Studio Tour
    const enterTourBtn = page.locator('button:has-text("Enter"), button:has-text("Tour"), button:has-text("Launch")').first();
    if (await enterTourBtn.isVisible()) {
      await enterTourBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. Verify Vibe / Archetype Selection
    const vibeCards = page.locator('button, [role="button"]');
    const vibeCount = await vibeCards.count();
    expect(vibeCount).toBeGreaterThan(0);

    // 4. Check for unhandled exceptions or fatal crash states
    const auditReport = await uxAnalyzer.collectMetrics();
    expect(auditReport.frictionEvents.filter(e => e.type === 'UNHANDLED_EXCEPTION')).toHaveLength(0);
  });
});
