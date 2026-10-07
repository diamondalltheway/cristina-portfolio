import { expect, test } from '@playwright/test';

test('mobile Safari displays the three original emails without JavaScript', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator('.hero-stage');
  const artwork = hero.getByRole('img', { name: /^Original Little Beast/ });
  await expect(artwork).toBeVisible();
  await artwork.evaluate((img: HTMLImageElement) => img.decode());

  // Checking only successful image loading missed the original Safari bug:
  // all three files loaded, but the phone displays still rendered white.
  await expect(hero).toHaveScreenshot('hero-mobile.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.005,
  });
});
