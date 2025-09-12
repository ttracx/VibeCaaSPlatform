import { test, expect } from '@playwright/test';

test.describe('Hero Section', () => {
  test('should display hero content correctly', async ({ page }) => {
    await page.goto('/');

    // Check main headline
    await expect(page.getByRole('heading', { name: /Build the Future of AI Development/i })).toBeVisible();
    
    // Check subheadline
    await expect(page.getByText(/Collaborate in real-time with intelligent agents/i)).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('button', { name: /Start Building Free/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Watch Demo/i })).toBeVisible();
  });

  test('should have working scroll indicator', async ({ page }) => {
    await page.goto('/');

    // Check scroll indicator is visible
    const scrollIndicator = page.getByText('Scroll to explore');
    await expect(scrollIndicator).toBeVisible();

    // Test scroll functionality
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
  });

  test('should display stats correctly', async ({ page }) => {
    await page.goto('/');

    // Check stats are visible
    await expect(page.getByText('10K+')).toBeVisible();
    await expect(page.getByText('Active Developers')).toBeVisible();
    
    await expect(page.getByText('99.9%')).toBeVisible();
    await expect(page.getByText('Uptime')).toBeVisible();
    
    await expect(page.getByText('50ms')).toBeVisible();
    await expect(page.getByText('Global Latency')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check for proper landmark roles
    await expect(page.getByRole('main')).toBeVisible();

    // Check for alt text on images (if any)
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should handle reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Content should still be visible
    await expect(page.getByRole('heading', { name: /Build the Future of AI Development/i })).toBeVisible();
  });
});