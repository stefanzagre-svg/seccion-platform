import { test, expect } from '@playwright/test';

test('Diagnose live prompt 1 click and capture exact browser console & network logs', async ({ page }) => {
  const consoleMessages: string[] = [];
  const pageErrors: string[] = [];
  const networkRequests: { url: string; method: string; status?: number }[] = [];

  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    console.log(`BROWSER_LOG: [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
    console.log(`PAGE_ERROR: ${err.message}\n${err.stack}`);
  });

  page.on('response', (res) => {
    networkRequests.push({ url: res.url(), method: res.request().method(), status: res.status() });
  });

  console.log('🚀 Navigating to /onboarding?role=creator...');
  await page.goto('/onboarding?role=creator');
  await page.waitForLoadState('networkidle');

  // Handle any age gate splash if present
  const enterBtn = page.locator('button:has-text("Enter"), button:has-text("Confirm"), button:has-text("I am 18+")').first();
  if (await enterBtn.isVisible()) {
    console.log('👆 Clicking age gate enter...');
    await enterBtn.click();
    await page.waitForTimeout(500);
  }

  // Look for Prompt tab or if directly on checklist
  const bioTab = page.locator('button:has-text("Bio"), :text("Answer 2 Relational Prompts")').first();
  if (await bioTab.isVisible().catch(() => false)) {
    console.log('👆 Switching to Bio / Prompts tab...');
    await bioTab.click();
    await page.waitForTimeout(500);
  }

  // Find textarea
  const textarea = page.locator('textarea');
  if (await textarea.isVisible()) {
    console.log('✍️ Found prompt textarea. Typing response...');
    await textarea.fill('i like the patience skill and continuous improvement');
    await page.waitForTimeout(300);

    // Find Analyze & Save Prompt button
    const saveBtn = page.locator('button:has-text("Analyze & Save Prompt"), button:has-text("ANALYZE & SAVE PROMPT")').first();
    console.log('👆 Save button visible:', await saveBtn.isVisible());
    console.log('👆 Save button disabled:', await saveBtn.isDisabled());

    if (await saveBtn.isVisible()) {
      console.log('👆 Clicking Save button now...');
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
  } else {
    console.log('⚠️ Textarea not immediately visible. Current URL:', page.url());
  }

  console.log('--- SUMMARY OF BROWSER LOGS ---');
  consoleMessages.forEach(m => console.log('  ', m));
  console.log('--- PAGE ERRORS ---');
  pageErrors.forEach(e => console.log('  ', e));
});
