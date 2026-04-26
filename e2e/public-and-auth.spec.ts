import { expect, test } from '@playwright/test';
import { expectPageReady, signInAsAdmin } from './helpers/auth';

test.describe('public and auth flows', () => {
  test('education resources load and a resource can be opened', async ({ page }) => {
    await page.goto('/education');
    await expectPageReady(page, /educational resources/i);

    const response = await page.request.get('/api/content?page=1&limit=1');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const firstResource = body.data?.[0];
    expect(firstResource?.id).toBeTruthy();

    await page.goto(`/education/${firstResource.id}`);
    await expect(page).toHaveURL(/\/education\/.+/);
    await expect(page.getByRole('main')).toContainText(/maternal|newborn|pregnancy|health/i);
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });

  test('admin can sign in and reach the dashboard', async ({ page }) => {
    await signInAsAdmin(page);
  });

  test('health endpoint responds for production checks', async ({ request }) => {
    const response = await request.get('/api/health');
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('checks.database');
  });
});
