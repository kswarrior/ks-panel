import { test, expect } from '@playwright/test';

test('verify layout after login', async ({ page }) => {
  await page.goto('http://localhost:8080/auth/login');

  // Fill in login details
  await page.fill('input[placeholder*="USER_NAME_ALPHA"]', 'admin');
  await page.fill('input[type="password"]', 'password');

  // Click login
  await page.click('button:has-text("ESTABLISH UPLINK")');

  // Wait for navigation
  await page.waitForURL('**/instances', { timeout: 10000 });

  await page.waitForLoadState('networkidle');

  // Take screenshots
  await page.screenshot({ path: 'instances_layout_verified.png' });

  await page.goto('http://localhost:8080/nodes');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'nodes_layout_verified.png' });

  await page.goto('http://localhost:8080/templates');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'templates_layout_verified.png' });
});
