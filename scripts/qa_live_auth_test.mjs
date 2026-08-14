import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runTest() {
  console.log("Starting Live Auth Test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  
  // Pre-accept cookies and banner
  await context.addInitScript(() => {
    localStorage.setItem("seccion_cookie_consent", "accepted");
    sessionStorage.setItem("seccion_prelaunch_banner_dismissed", "true");
  });

  const page = await context.newPage();
  
  console.log("Navigating to /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  
  console.log("Clicking Passwordless / Email option...");
  
  let pwBtn = page.locator('button:has-text("Passwordless")');
  if (await pwBtn.count() > 0) {
    await pwBtn.first().click();
  } else {
      let emailBtn = page.locator('button:has-text("Email")');
      if (await emailBtn.count() > 0) {
        await emailBtn.first().click();
      }
  }

  await page.waitForTimeout(500);

  console.log("Entering email...");
  await page.locator('input[type="email"]').fill('seccionadmin@gmail.com');
  
  console.log("Sending magic code...");
  const codeBtn = page.locator('button:has-text("Magic Code")');
  if (await codeBtn.count() > 0) {
    await codeBtn.first().click();
  } else {
    const defaultBtn = page.locator('button[type="submit"]');
    if (await defaultBtn.count() > 0) {
      await defaultBtn.first().click();
    }
  }

  console.log("\n>>> READY! WAITING FOR OTP CODE <<<");
  console.log("Please write the 6-digit code to: scratch/code.txt\n");
  
  // We'll just read from a file we create right next to it, since it's easier.
  const codeFilePath = path.join(process.cwd(), 'code.txt');
  
  if (fs.existsSync(codeFilePath)) {
    fs.unlinkSync(codeFilePath);
  }

  let code = null;
  for (let i = 0; i < 90; i++) {
    if (fs.existsSync(codeFilePath)) {
      code = fs.readFileSync(codeFilePath, 'utf8').trim();
      if (code && code.length === 6) {
        break;
      }
    }
    await page.waitForTimeout(2000); 
  }
  
  if (!code) {
    console.error("Timeout waiting for code.txt");
    await browser.close();
    process.exit(1);
  }

  console.log("Got code:", code);
  console.log("Entering code...");
  await page.locator('input[type="text"]').last().fill(code);
  
  console.log("Clicking Verify...");
  let verifyBtn = page.locator('button:has-text("Verify")');
  if (await verifyBtn.count() > 0) {
    await verifyBtn.first().click();
  } else {
    await page.keyboard.press('Enter');
  }
  
  console.log("Waiting for navigation...");
  await page.waitForTimeout(6000);
  
  console.log("Taking screenshot of result...");
  await page.screenshot({ path: 'auth-result.png', fullPage: true });
  console.log("Saved auth-result.png");
  console.log("Current URL:", page.url());
  
  // Also get localStorage state
  const ls = await page.evaluate(() => JSON.stringify(localStorage));
  console.log("LocalStorage:", ls);
  
  await browser.close();
  console.log("Test finished.");
}

runTest().catch(console.error);
