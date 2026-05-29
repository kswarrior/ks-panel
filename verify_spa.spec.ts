import { test, expect } from '@playwright/test';

test('verify login page', async ({ page }) => {
  await page.goto('http://localhost:8080/auth/login');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check for the title or some text
  await expect(page).toHaveTitle(/KS Panel/i);

  // Check for login form elements
  const loginHeader = page.locator('h1', { hasText: /Nexus Access/i });
  await expect(loginHeader).toBeVisible();

  const usernameInput = page.locator('input[placeholder*="Username or Email"]');
  await expect(usernameInput).toBeVisible();

  const passwordInput = page.locator('input[placeholder*="Password"]');
  await expect(passwordInput).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: 'login_verify.png' });
});
