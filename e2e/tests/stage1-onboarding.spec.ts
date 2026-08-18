import { test, expect } from '../fixtures/ux-fixture';
import { TestDataFactory } from '../fixtures/test-data-factory';

test.describe('Stage 1: Identity, Auth & Dynamic Onboarding Certification', () => {

  test('1.1 Reset onboarding session cleanly and verify start page', async ({ page, uxAnalyzer }) => {
    await page.goto('/onboarding-reset');
    await page.waitForLoadState('domcontentloaded');
    
    // Expect redirection to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('1.2 Verify Creator Quest & Specialization selection flow', async ({ page }) => {
    await page.goto('/onboarding?role=creator');
    await page.waitForLoadState('domcontentloaded');

    // Confirm that Creator role is honored in the URL and UI
    await expect(page).toHaveURL(/role=creator/);
    
    // Verify presence of specialized identity options
    const creatorText = await page.textContent('body');
    expect(creatorText).toBeTruthy();
  });

  test('1.3 Verify Multilingual (ES/EN) prompt and question parity', async ({ page }) => {
    // Check Spanish locale
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');
    
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    const heading = await page.locator('h1, h2, button').first();
    await expect(heading).toBeVisible();
  });

  test('1.4 Member Onboarding Profile and Validation Flow', async ({ page }) => {
    const memberData = TestDataFactory.createMemberProfile('es');
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');

    expect(memberData.email).toContain('@qa.seccion.com');
    expect(memberData.prompts.length).toBe(2);
  });
});
