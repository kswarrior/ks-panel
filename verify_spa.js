const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto('http://localhost:8080/auth/login?username=admin&password=password123');
  await page.waitForURL('**/instances');

  // Inject a marker to check for full page reload
  await page.evaluate(() => { window.SPA_MARKER = true; });

  console.log('Navigating to Users via SPA...');
  // Find the Users link in sidebar
  await page.click('a[href="/admin/users"]');

  // Wait for content change
  await page.waitForSelector('h1:has-text("Identity & Access")');

  const spaMarker = await page.evaluate(() => window.SPA_MARKER);
  console.log('SPA Marker present:', spaMarker);

  if (spaMarker) {
    console.log('SUCCESS: Page did not fully reload.');
  } else {
    console.log('FAILURE: Page fully reloaded.');
  }

  // Take screenshot of fixed header and content
  await page.screenshot({ path: 'spa_users.png' });

  // Try to capture loading state by clicking back
  console.log('Navigating back...');
  await page.goBack();

  // We might catch the skeleton if we are fast, but unlikely.
  // Instead, let's check if instances page is back.
  await page.waitForSelector('h1:has-text("Instances")');
  await page.screenshot({ path: 'spa_instances.png' });

  await browser.close();
})();
