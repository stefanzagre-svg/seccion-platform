import { test, expect } from '@playwright/test';

test('Diagnose live prompt flow with seccionadmin@gmail.com', async ({ page }) => {
  page.on('console', (msg) => console.log(`BROWSER_LOG: [${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.log(`PAGE_ERROR: ${err.message}`));

  console.log('🌐 Step 1: Navigating to /login...');
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  console.log('✍️ Step 2: Typing seccionadmin@gmail.com...');
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  await emailInput.fill('seccionadmin@gmail.com');

  console.log('👆 Step 3: Submitting login...');
  const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Enter"), button:has-text("Submit")').first();
  await submitBtn.click();
  await page.waitForTimeout(1000);

  console.log('🚀 Step 4: Navigating to /onboarding?role=creator...');
  await page.goto('/onboarding?role=creator');
  await page.waitForLoadState('networkidle');

  // If on profile checklist, switch to Bio tab
  const bioTab = page.locator('button:has-text("Bio"), :text("Answer 2 Relational Prompts")').first();
  if (await bioTab.isVisible().catch(() => false)) {
    console.log('👆 Step 5: Clicking Bio tab...');
    await bioTab.click();
    await page.waitForTimeout(500);
  }

  // Check category button
  const skillCategoryBtn = page.locator('button:has-text("SKILLS")').first();
  if (await skillCategoryBtn.isVisible().catch(() => false)) {
    console.log('👆 Step 6: Selecting SKILLS category...');
    await skillCategoryBtn.click();
    await page.waitForTimeout(300);
  }

  // Type in textarea
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible().catch(() => false)) {
    console.log('✍️ Step 7: Typing 25-character response into prompt textarea...');
    await textarea.fill('i like the patience skill');
    await page.waitForTimeout(300);

    const saveBtn = page.locator('button:has-text("ANALYZE & SAVE PROMPT"), button:has-text("Analyze & Save Prompt")').first();
    console.log('Save button visible:', await saveBtn.isVisible());
    console.log('Save button text:', await saveBtn.innerText());
    console.log('Save button disabled:', await saveBtn.isDisabled());

    console.log('👆 Step 8: Clicking ANALYZE & SAVE PROMPT 1...');
    await saveBtn.click();
    await page.waitForTimeout(2000);

    console.log('Save button text after click:', await saveBtn.innerText().catch(() => 'Gone or transitioned'));
  }
});
