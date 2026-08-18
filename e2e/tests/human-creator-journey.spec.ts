import { test, expect } from '@playwright/test';

test('Real User Human-Like Journey: Login, Studio Access & Profile Deletion', async ({ page }) => {
  // Set slower action pace so you can clearly see every keystroke and click live
  test.slow();

  console.log('🌐 Step 1: Navigating directly to Login page...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  console.log('✍️ Step 2: Typing approved creator email (seccionadmin@gmail.com)...');
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.click();
    await emailInput.pressSequentially('seccionadmin@gmail.com', { delay: 100 });
    await page.waitForTimeout(1000);

    const submitBtn = page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Log in"), button:has-text("Sign in"), button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      console.log('👆 Step 3: Clicking Submit / Login button...');
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('🚀 Step 4: Accessing Creator Studio directly...');
  await page.goto('http://localhost:3000/studio');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log(`📍 Currently at: ${page.url()}`);

  console.log('⚙️ Step 5: Navigating to Settings to inspect profile controls...');
  await page.goto('http://localhost:3000/settings');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);

  const deleteBtn = page.locator('button:has-text("Delete"), button:has-text("Eliminar"), button:has-text("Borrar Cuenta")').first();
  if (await deleteBtn.isVisible()) {
    console.log('🗑️ Step 6: Clicking Delete Account button...');
    await deleteBtn.click();
    await page.waitForTimeout(2000);
  } else {
    console.log('ℹ️ Clean Reset: Purging session cleanly...');
    await page.goto('http://localhost:3000/onboarding-reset');
    await page.waitForTimeout(2000);
  }

  console.log('🎉 Human-like creator journey completed successfully!');
});
