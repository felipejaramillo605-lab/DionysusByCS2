import { expect, test } from '@playwright/test';

test('RestaurantERP renders without browser runtime errors', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!text.startsWith('Failed to load resource:')) consoleErrors.push(text);
  });
  page.on('response', response => {
    if (response.status() < 400) return;
    const pathname = new URL(response.url()).pathname;
    if (pathname === '/favicon.ico') return;
    failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.getByRole('heading', { name: 'RestaurantERP', exact: true })).toBeVisible();

  expect(pageErrors, `Uncaught page errors: ${pageErrors.join('\n')}`).toEqual([]);
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  expect(failedResponses, `Failed HTTP responses: ${failedResponses.join('\n')}`).toEqual([]);
});