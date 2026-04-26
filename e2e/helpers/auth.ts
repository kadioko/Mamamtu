import { expect, type Page } from '@playwright/test';

export const TEST_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@mama-tu.health';
export const TEST_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Demo2025!';

export async function signInAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.getByLabel(/email/i).fill(TEST_ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_ADMIN_PASSWORD);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
}

export async function expectPageReady(page: Page, heading: RegExp | string) {
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  await expect(page.getByText(/failed to load/i)).toHaveCount(0);
}
