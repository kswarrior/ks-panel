const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  async function login() {
    await page.goto('http://localhost:8080/auth/login');
    await page.fill('input[name="user"]', 'admin');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/instances');
  }

  await login();

  // Navigate to Settings
  await page.goto('http://localhost:8080/admin/settings');
  await page.waitForSelector('h1:has-text("General Settings")');

  // Verify horizontal nav is gone
  const horizontalNav = await page.$('.settings-nav-container');
  if (horizontalNav) {
    console.error('Horizontal navigation still exists!');
  } else {
    console.log('Horizontal navigation removed successfully.');
  }

  // Click Settings in sidebar to open dropdown
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(500); // Animation

  // Take screenshot of sidebar with dropdown
  await page.screenshot({ path: '/home/jules/verification/sidebar_settings_refined.png' });

  // Verify DASHBOARD is in the dropdown
  const dashboardLink = await page.$('a[href="/admin/settings/dashboard"]');
  if (dashboardLink) {
    console.log('DASHBOARD link found in sidebar.');
  } else {
    console.error('DASHBOARD link NOT found in sidebar.');
  }

  await browser.close();
})();
