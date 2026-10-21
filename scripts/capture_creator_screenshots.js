const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000/studio');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Capture cockpit
  await page.screenshot({ path: 'creator_cockpit_screenshot.png' });

  // Open tour modal
  const tourBtn = page.locator('text=/Studio Tour|Tour del Studio/i').first();
  if (await tourBtn.isVisible()) {
    await tourBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'creator_tour_modal_screenshot.png' });
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
})();
