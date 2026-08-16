import { chromium } from 'playwright';
import path from 'path';

async function runLiveTest() {
  console.log("🚀 Starting live browser test on http://localhost:3000/onboarding?role=creator");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('[Onboarding]')) {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000/onboarding?role=creator', { waitUntil: 'networkidle' });
    console.log("📍 Page loaded:", page.url());

    // 1. Click Start Creator Tour / Quest
    const startBtn = page.locator('button:has-text("Start Creator Tour"), button:has-text("Empezar Tour de Creador"), button:has-text("Comenzar Quest"), button:has-text("Start Creator Quest")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      console.log("👉 Clicked Start Creator Tour");
      await page.waitForTimeout(500);
    }

    // Step 2: Mode select (Live Creator)
    const creatorCard = page.locator('button:has-text("Live Creator / Host"), button:has-text("Creador en Vivo")').first();
    if (await creatorCard.isVisible()) {
      await creatorCard.click();
      console.log("👉 Selected Creator Mode");
      await page.waitForTimeout(500);
    }

    // Fast-forward through Creator Quest steps by clicking next/continue buttons
    for (let i = 0; i < 12; i++) {
      // If we see Claim Studio CTA
      const claimBtn = page.locator('button:has-text("Claim Your Studio"), button:has-text("Reclamar Tu Estudio"), button:has-text("Claim Studio")').first();
      if (await claimBtn.isVisible()) {
        console.log("👉 Claim Studio button visible! Clicking it...");
        await claimBtn.click();
        await page.waitForTimeout(1000);
        break;
      }

      // Next buttons
      const nextBtn = page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Siguiente"), button:has-text("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(400);
      }
    }

    console.log("📍 Checking current step on page...");
    await page.screenshot({ path: path.join(process.cwd(), 'scratch_checklist.png') });

    // Verify if we are on the checklist (Photo tab)
    const photoHeading = page.locator('h3:has-text("Select Profile Photo"), h3:has-text("Seleccionar Foto de Perfil")').first();
    if (await photoHeading.isVisible()) {
      console.log("✅ Profile Photo checklist panel is visible!");

      // Trigger avatar upload via synthetic base64 file injection or input
      const fileInput = page.locator('input[type="file"]').first();
      
      // Provide a 1x1 png buffer
      const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
      await fileInput.setInputFiles({
        name: "test-avatar.png",
        mimeType: "image/png",
        buffer: buffer
      });
      console.log("📸 Avatar image file uploaded into input");
      await page.waitForTimeout(1000);

      // Check if "Main Avatar Ready" or avatar preview is displayed
      const previewText = page.locator('text=Main Avatar Ready, text=Avatar Principal Listo').first();
      const isAvatarReady = await previewText.isVisible();
      console.log("📸 Is Main Avatar Ready visible?", isAvatarReady);

      // Check Save Photos & Continue button
      const saveBtn = page.locator('button:has-text("Save Photos & Continue"), button:has-text("Guardar Fotos y Continuar")').first();
      const isSaveBtnVisible = await saveBtn.isVisible();
      const isSaveBtnEnabled = await saveBtn.isEnabled();
      console.log(`🔘 Save Photos Button - Visible: ${isSaveBtnVisible}, Enabled: ${isSaveBtnEnabled}`);

      if (isSaveBtnVisible && isSaveBtnEnabled) {
        console.log("👉 Clicking Save Photos & Continue button...");
        await saveBtn.click();
        await page.waitForTimeout(1500);

        // Check if moved to bio tab
        const bioHeading = page.locator('h3:has-text("Relational Prompt Check"), h3:has-text("Check de Prompts Relacionales")').first();
        const isBioActive = await bioHeading.isVisible();
        console.log("🎉 Moved to Bio tab successfully?", isBioActive);
      }
    } else {
      console.log("ℹ️ Current step isn't photo checklist, current content:", await page.textContent('body'));
    }

  } catch (err) {
    console.error("❌ Live test error:", err);
  } finally {
    await browser.close();
  }
}

runLiveTest();
