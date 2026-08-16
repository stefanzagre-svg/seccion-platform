import { chromium } from 'playwright';

async function testChecklist() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set up local/session storage directly to land on profile-checklist step
  await page.goto('http://localhost:3000/onboarding?role=creator');
  
  await page.evaluate(() => {
    sessionStorage.setItem('_onboarding_creator_archive_choice', 'creator');
    localStorage.setItem('fusion_onboarding_step', 'profile-checklist');
    localStorage.setItem('fusion_onboarding_core', JSON.stringify({
      userId: 'test-qa-creator-uuid-1234',
      displayName: 'Creator QA',
      age: 24
    }));
  });

  await page.goto('http://localhost:3000/onboarding?role=creator');
  await page.waitForTimeout(1000);

  // Set avatar photo
  const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "test-avatar.png",
    mimeType: "image/png",
    buffer: buffer
  });
  console.log("📸 Avatar injected via file input");
  await page.waitForTimeout(500);

  const saveBtn = page.locator('button:has-text("Save Photos & Continue"), button:has-text("Guardar Fotos y Continuar")').first();
  console.log("Save button visible:", await saveBtn.isVisible(), "Enabled:", await saveBtn.isEnabled());

  await saveBtn.click();
  console.log("👉 Clicked Save Photos & Continue button");
  await page.waitForTimeout(1000);

  // Check if Bio tab is now active
  const bioHeading = page.locator('h3:has-text("Relational Prompt Check"), h3:has-text("Check de Prompts Relacionales")').first();
  console.log("🎉 Moved to Bio tab:", await bioHeading.isVisible());

  await page.screenshot({ path: 'scratch_after_save.png' });
  await browser.close();
}

testChecklist().catch(console.error);
