import { expect, test } from '@playwright/test';
import { expectPageReady, signInAsAdmin } from './helpers/auth';

test.describe('dashboard care-team flows', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });

  test('patients and appointments creation screens are reachable', async ({ page }) => {
    await page.goto('/dashboard/patients/new');
    await expectPageReady(page, /new patient/i);
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/date of birth/i)).toBeVisible();

    await page.goto('/dashboard/appointments/new');
    await expectPageReady(page, /new appointment/i);
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create appointment/i })).toBeVisible();
  });

  test('reports and notifications pages render without not-found errors', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expectPageReady(page, /reports/i);
    await expect(page.getByText(/operational snapshot/i)).toBeVisible();

    await page.goto('/dashboard/notifications');
    await expectPageReady(page, /notifications/i);
    await expect(page.getByText(/care reminders/i)).toBeVisible();
  });

  test('medical records and vitals pages render without dashboard errors', async ({ page }) => {
    await page.goto('/dashboard/records');
    await expectPageReady(page, /medical records/i);
    await expect(page.getByText(/clinical notes/i)).toBeVisible();

    await page.goto('/dashboard/vitals');
    await expectPageReady(page, /vitals/i);
    await expect(page.getByText(/latest recorded blood pressure/i)).toBeVisible();
  });

  test('upload and education management controls are available', async ({ page }) => {
    await page.goto('/dashboard/education');
    await expectPageReady(page, /education/i);
    await expect(page.getByRole('button', { name: /new|create|add|publish/i }).first()).toBeVisible();

    await page.goto('/dashboard/patients');
    await expectPageReady(page, /patients/i);
    await expect(page.getByRole('link', { name: /new patient|add patient/i }).first()).toBeVisible();
    await expect(page.getByText(/loading patients/i)).toHaveCount(0);
    await expect(page.getByText(/DEMO-\d{4}|PAT-\d{4}/i).first()).toBeVisible();
  });

  test('clinical form entry points are reachable', async ({ page }) => {
    const clinicalPages = [
      ['/dashboard/pregnancies/new', /new pregnancy episode/i, /create pregnancy/i],
      ['/dashboard/antenatal/new', /new anc visit/i, /create anc visit/i],
      ['/dashboard/newborns/new', /new newborn record/i, /create newborn record/i],
      ['/dashboard/immunizations/new', /new immunization/i, /create immunization/i],
    ] as const;

    for (const [url, heading, submitLabel] of clinicalPages) {
      await page.goto(url);
      await expectPageReady(page, heading);
      await expect(page.getByRole('button', { name: submitLabel })).toBeVisible();
    }
  });
});
