import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.resolve(__dirname, '..', 'fixtures');

test('upload → view → delete', async ({ page }) => {
  await page.goto('/');

  // Empty state
  await expect(page.getByText('把你的第一張全景上傳吧')).toBeVisible();

  // Open upload modal
  await page.getByRole('button', { name: '上傳第一張' }).click();
  await expect(page.getByRole('dialog', { name: '新增全景' })).toBeVisible();

  // Upload panorama
  const panoInput = page.locator('input[type="file"]').first();
  await panoInput.setInputFiles(path.join(FIX, 'panorama-2to1.jpg'));

  // Title is auto-filled from filename
  const titleInput = page.locator('input').nth(1);
  await expect(titleInput).not.toHaveValue('');

  // Submit
  await page.getByRole('button', { name: '上傳', exact: true }).click();
  await expect(page.locator('[data-sonner-toast]')).toContainText('上傳完成', { timeout: 15_000 });

  // Card visible
  const card = page.getByRole('button', { name: /panorama-2to1/ });
  await expect(card).toBeVisible();

  // Open viewer
  await card.click();
  await expect(page).toHaveURL(/\/view\//, { timeout: 10_000 });
  // Viewer loaded — back button is present (canvas may not be visible in headless WebGL)
  await expect(page.getByRole('button', { name: '返回' })).toBeVisible({ timeout: 10_000 });

  // Back to home
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);

  // Delete — wait for card to be visible again after navigation
  await expect(card).toBeVisible({ timeout: 10_000 });
  await card.hover();
  await page.getByRole('button', { name: '刪除' }).click();
  await page.getByRole('button', { name: '刪除' }).last().click();
  await expect(card).not.toBeVisible();
});
