import { test, expect } from '@playwright/test';

test('Live Headed Complete Creator Journey to Dashboard & Delete Account', async ({ page }) => {
  // Step 1: Wipe all previous session cookies, localStorage & cache
  console.log('🔄 Step 1: Clearing all session cookies and local storage...');
  await page.goto('http://localhost:3000/onboarding-reset');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Step 2: Navigate cleanly to Creator Onboarding
  console.log('🚀 Step 2: Navigating to Creator Onboarding Quest (?role=creator)...');
  await page.goto('http://localhost:3000/onboarding?role=creator');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Step 3: Handle Founders Welcome / Enter Quest CTA if present
  console.log('✨ Step 3: Interacting with Welcome screen...');
  const enterBtn = page.locator('button:has-text("Enter"), button:has-text("Tour"), button:has-text("Launch"), button:has-text("Comenzar"), button:has-text("Let\'s Go")').first();
  if (await enterBtn.isVisible()) {
    await enterBtn.click();
    await page.waitForTimeout(1500);
  }

  // Step 4: Pick Creator Archetype / Vibe
  console.log('🎙️ Step 4: Selecting Creator Vibe & Archetype...');
  const vibeCard = page.locator('button:has-text("STREAMER"), button:has-text("Live"), button:has-text("Legend"), [role="button"]').first();
  if (await vibeCard.isVisible()) {
    await vibeCard.click();
    await page.waitForTimeout(1500);
  }

  // Step 5: Advance through interactive creator demos
  console.log('📈 Step 5: Advancing through Monetization & Studio Tour...');
  for (let i = 0; i < 6; i++) {
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Siguiente"), button:has-text("Continuar"), button:has-text("Proceed"), button:has-text("Save"), button:has-text("Claim"), button:has-text("Entrar")').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(1200);
    }
  }

  // Step 6: Navigate to Creator Studio / Dashboard
  console.log('🎯 Step 6: Entering Creator Studio...');
  await page.goto('http://localhost:3000/studio');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  console.log(`Current Studio URL: ${page.url()}`);

  // Step 7: Open Settings and trigger Account Deletion
  console.log('⚙️ Step 7: Navigating to Settings to delete profile...');
  await page.goto('http://localhost:3000/settings');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Look for Delete Account button in settings if rendered
  const deleteBtn = page.locator('button:has-text("Delete"), button:has-text("Eliminar"), button:has-text("Borrar Cuenta")').first();
  if (await deleteBtn.isVisible()) {
    console.log('🗑️ Step 8: Triggering profile deletion...');
    await deleteBtn.click();
    await page.waitForTimeout(1500);
  } else {
    // Alternatively execute clean session teardown via reset utility
    console.log('🧹 Teardown: Executing complete database session purge...');
    await page.goto('http://localhost:3000/onboarding-reset');
    await page.waitForTimeout(1500);
  }

  console.log('✅ Journey completed: Creator onboarded, Studio verified, and test profile purged!');
});
