import { test, expect } from '@playwright/test';

test.describe('Layout Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:8080/auth/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    // Wait for navigation to dashboard/instances
    await page.waitForURL('**/instances', { timeout: 10000 });
  });

  test('verify instances page layout', async ({ page }) => {
    await page.goto('http://localhost:8080/instances');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '../../instances_layout_verified.png', fullPage: true });
  });

  test('verify nodes page layout', async ({ page }) => {
    await page.goto('http://localhost:8080/nodes');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '../../nodes_layout_verified.png', fullPage: true });
  });

  test('verify templates page layout', async ({ page }) => {
    await page.goto('http://localhost:8080/templates');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '../../templates_layout_verified.png', fullPage: true });
  });
});
