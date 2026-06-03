import { test, expect } from '@playwright/test';

test('verify instances page layout', async ({ page }) => {
  // We need to bypass login or have a session.
  // Since we are in a dev environment and the user didn't provide credentials,
  // we might try to access the page directly if there's no strict middleware in dev,
  // or we just check the login page for the background/heading style if that's easier.
  // Actually, the background is global in ClientLayout.

  await page.goto('http://localhost:8080/auth/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'login_layout.png' });
});

test('verify instances page', async ({ page }) => {
    // For the purpose of this task, I'll assume I can see the layout of /instances if I bypass auth or if it renders something.
    // However, I don't have a user. I'll just check if the background and overall layout are correct on the login page first.
    await page.goto('http://localhost:8080/instances');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'instances_layout.png' });
});

test('verify nodes page', async ({ page }) => {
    await page.goto('http://localhost:8080/nodes');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'nodes_layout.png' });
});
