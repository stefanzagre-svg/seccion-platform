import { test, expect } from '../fixtures/ux-fixture';

test.describe('Creator 1st Steps Guide & Studio Onboarding Cockpit', () => {

  test('Verify Creator Onboarding Cockpit renders in Studio', async ({ page }) => {
    // Navigate to studio
    await page.goto('/studio');
    await page.waitForLoadState('domcontentloaded');

    // Check checklist header renders
    const titleLocator = page.locator('text=/Creator 1st Steps|Primeros Pasos|Premiers Pas/i');
    await expect(titleLocator).toBeVisible({ timeout: 15000 });

    // Verify presence of tour button
    const tourBtn = page.locator('text=/Studio Tour|Tour del Studio|Visite Studio/i');
    await expect(tourBtn).toBeVisible();

    // Verify presence of step items
    const pricingItem = page.locator('text=/Set Your VIP & Post Prices|Fijar Precios VIP y PPV|Fixer Vos Tarifs VIP & PPV/i');
    await expect(pricingItem).toBeVisible();

    // Click Studio Tour button and verify tour modal opens
    await tourBtn.click();
    const tourModalTitle = page.locator('text=/Welcome to SECCION Creator Studio|Bienvenido a SECCION Creator Studio|Bienvenue dans le Creator Studio SECCION/i');
    await expect(tourModalTitle).toBeVisible();

    // Click Next button inside tour modal
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Siguiente"), button:has-text("Suivant")').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Verify step 2 (Pricing)
    const step2Title = page.locator('text=/Set Your Prices|Configura Tus Precios|Fixez Vos Tarifs/i');
    await expect(step2Title).toBeVisible();

    // Close tour modal
    const closeBtn = page.locator('button[aria-label="Close Tour"]');
    await closeBtn.click();
    await expect(tourModalTitle).not.toBeVisible();
  });
});
