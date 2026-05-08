const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto('http://localhost:8080/auth/login?username=admin&password=adminpassword123');
  await page.waitForLoadState('networkidle');

  console.log('Navigating to Plugin Studio...');
  await page.goto('http://localhost:8080/admin/plugins/studio');
  await page.waitForLoadState('networkidle');

  console.log('Capturing Desktop Screenshot...');
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.screenshot({ path: 'studio_desktop.png', fullPage: true });

  console.log('Capturing Mobile Screenshot...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'studio_mobile.png', fullPage: true });

  console.log('Testing View Switcher...');
  await page.click('#viewBtnTester');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'studio_tester.png' });

  await browser.close();
  console.log('Verification Complete.');
})();
