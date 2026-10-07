import { test, expect } from '../fixtures/ux-fixture';

test.describe('Creator 1st Steps Guide & Studio Onboarding Cockpit', () => {

  test('Verify Creator Onboarding Cockpit renders in Studio', async ({ page }) => {
    // Navigate to studio
    await page.goto('/studio');
    await page.waitForLoadState('domcontentloaded');

    // Check cockpit header renders
    const titleLocator = page.locator('text=/Creator 1st Steps Cockpit|Cockpit de Primeros Pasos/i');
    await expect(titleLocator).toBeVisible({ timeout: 15000 });

    // Verify presence of tour button
    const tourBtn = page.locator('text=/Studio Tour|Tour del Studio/i');
    await expect(tourBtn).toBeVisible();

    // Verify presence of step items
    const pricingItem = page.locator('text=/Set Base VIP & PPV Rates|Fijar Tarifas VIP & PPV/i');
    await expect(pricingItem).toBeVisible();

    // Click Studio Tour button and verify tour modal opens
    await tourBtn.click();
    const tourModalTitle = page.locator('text=/Welcome to SECCION Creator Studio|Bienvenido a tu Creator Studio/i');
    await expect(tourModalTitle).toBeVisible();

    // Click Next button inside tour modal
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Siguiente")').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Verify step 2 (Monetization Rates)
    const step2Title = page.locator('text=/Configure Your Founding Rates|Configura tus Tarifas Fundadoras/i');
    await expect(step2Title).toBeVisible();

    // Close tour modal
    const closeBtn = page.locator('button[aria-label="Close Tour"]');
    await closeBtn.click();
    await expect(tourModalTitle).not.toBeVisible();
  });
});
