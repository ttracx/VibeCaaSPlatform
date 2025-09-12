import { test, expect } from '@playwright/test';

test.describe('IDE Shell', () => {
  test('should load IDE page correctly', async ({ page }) => {
    await page.goto('/launch');

    // Check page title
    await expect(page).toHaveTitle(/VibeCaaS IDE/);

    // Check main elements
    await expect(page.getByText('VibeCaaS IDE')).toBeVisible();
    await expect(page.getByRole('button', { name: /Deploy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Share/i })).toBeVisible();
  });

  test('should display file explorer', async ({ page }) => {
    await page.goto('/launch');

    // Check file explorer
    await expect(page.getByText('Files')).toBeVisible();
    await expect(page.getByText('app.tsx')).toBeVisible();
    await expect(page.getByText('package.json')).toBeVisible();
  });

  test('should show AI agents section', async ({ page }) => {
    await page.goto('/launch');

    // Check AI agents
    await expect(page.getByText('AI Agents')).toBeVisible();
    await expect(page.getByText('Code Assistant')).toBeVisible();
    await expect(page.getByText('Debug Helper')).toBeVisible();
  });

  test('should display online users', async ({ page }) => {
    await page.goto('/launch');

    // Check presence indicator
    await expect(page.getByText('Online Users')).toBeVisible();
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
  });

  test('should show terminal output', async ({ page }) => {
    await page.goto('/launch');

    // Check terminal
    await expect(page.getByText('$ npm run dev')).toBeVisible();
    await expect(page.getByText('Starting development server...')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/launch');

    // Main elements should still be visible
    await expect(page.getByText('VibeCaaS IDE')).toBeVisible();
  });
});