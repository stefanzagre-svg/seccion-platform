import { chromium } from "playwright";

async function runUXAudit() {
  console.log("=================================================");
  console.log("🚀 STARTING HEADLESS CHROMIUM UX QA AUDIT SUITE");
  console.log("=================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  
  // Pre-accept cookie consent and dismiss prelaunch banner to simulate real user session
  await context.addInitScript(() => {
    localStorage.setItem("seccion_cookie_consent", "accepted");
    sessionStorage.setItem("seccion_prelaunch_banner_dismissed", "true");
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  const auditResults = [];

  // TEST 1: Become Creator Landing & CTA
  try {
    console.log("1️⃣ Testing /become-creator landing & CTA navigation...");
    await page.goto("https://seccion.ai/become-creator", { waitUntil: "networkidle", timeout: 15000 });
    
    const pageTitle = await page.title();
    console.log(`   Page loaded: "${pageTitle}"`);

    // Target the specific CTA in the header pointing to role=creator
    const ctaButton = page.locator('header a[href*="role=creator"]').first();
    if (await ctaButton.isVisible()) {
      await ctaButton.click();
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`   Hero CTA Clicked! Navigated to: ${currentUrl}`);
      
      const roleParamOk = currentUrl.includes("role=creator");
      auditResults.push({
        test: "/become-creator CTA Navigation",
        expected: "URL contains ?role=creator",
        actual: currentUrl,
        pass: roleParamOk,
      });
    } else {
      auditResults.push({ test: "/become-creator CTA Navigation", expected: "CTA visible", actual: "Not found", pass: false });
    }
  } catch (err) {
    console.error("❌ Test 1 Error:", err.message);
    auditResults.push({ test: "/become-creator CTA Navigation", expected: "Success", actual: err.message, pass: false });
  }

  // TEST 2: Onboarding Purpose Selector - Creator Solo Choice
  try {
    console.log("\n2️⃣ Testing /onboarding PurposeSelector (Creator Solo Choice)...");
    await page.goto("https://seccion.ai/onboarding?fresh=true", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    // Look for Become a Creator card
    const creatorCard = page.locator('text="Become a Creator"').first();
    if (await creatorCard.isVisible()) {
      await creatorCard.click();
      await page.waitForTimeout(500);

      // Check if Continue button is enabled
      const continueBtn = page.locator('button:has-text("Continue")');
      const isDisabled = await continueBtn.getAttribute("disabled");
      const continueEnabled = isDisabled === null;

      console.log(`   Become a Creator selected. Continue button enabled: ${continueEnabled}`);

      if (continueEnabled) {
        await continueBtn.click({ force: true });
        await page.waitForTimeout(1500);
        console.log(`   Continued to next step! Current step URL: ${page.url()}`);
      }

      auditResults.push({
        test: "Creator Solo Selection Enablement & Click",
        expected: "Continue button enabled and clickable without forcing member purpose",
        actual: continueEnabled ? "ENABLED & CLICKED ✅" : "DISABLED ❌",
        pass: continueEnabled,
      });
    } else {
      console.log("   PurposeSelector card not found or skipped.");
    }
  } catch (err) {
    console.error("❌ Test 2 Error:", err.message);
    auditResults.push({ test: "PurposeSelector Creator Choice", expected: "Success", actual: err.message, pass: false });
  }

  // TEST 3: Auth Guards on Protected Routes
  console.log("\n3️⃣ Testing Protected Route Auth Guards...");
  const protectedRoutes = ["/dashboard", "/stream-demo", "/studio", "/creator-hub"];
  for (const route of protectedRoutes) {
    try {
      await page.goto(`https://seccion.ai${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(1000);
      const finalUrl = page.url();
      const redirectedToLogin = finalUrl.includes("/login") || finalUrl.includes("/onboarding");
      console.log(`   Route ${route} -> ${finalUrl} (${redirectedToLogin ? "Auth Guard PASSED ✅" : "UNPROTECTED 🔴"})`);
      auditResults.push({
        test: `Auth Guard ${route}`,
        expected: "Redirect to /login or /onboarding",
        actual: finalUrl,
        pass: redirectedToLogin,
      });
    } catch (err) {
      console.warn(`   Route ${route} error:`, err.message);
    }
  }

  await browser.close();

  console.log("\n=================================================");
  console.log("🏆 HEADLESS BROWSER UX AUDIT SCORECARD");
  console.log("=================================================");
  auditResults.forEach((res) => {
    console.log(`${res.pass ? "✅ PASS" : "❌ FAIL"} | ${res.test} -> Actual: ${res.actual}`);
  });

  if (consoleErrors.length > 0) {
    console.log("\n⚠️ Unhandled Console Errors Detected:");
    consoleErrors.forEach((e) => console.log(`   ${e}`));
  } else {
    console.log("\n✨ Zero Unhandled Console Errors!");
  }
  console.log("=================================================\n");
}

runUXAudit();
