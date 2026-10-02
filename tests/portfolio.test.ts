import { test, expect } from '@playwright/test';

test('portfolio is prerendered and readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.locator('h1')).toHaveText('YOUR NEXT EMAILDESERVESTO STAND OUT.');
  await expect(page.locator('.project-card')).toHaveCount(8);
  await expect(page.locator('#contact-form')).toBeVisible();
  await context.close();
});

test('responsive Svelte components preserve layout, navigation, and keyboard behavior', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [768, 1024],
    [1440, 1000],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      await Promise.all(
        [...document.querySelectorAll<HTMLImageElement>('main img')].map((img) => img.decode()),
      );
      scrollTo({ top: 0, behavior: 'instant' });
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('.hero')).toHaveCSS('background-color', 'rgb(35, 60, 57)');
    await expect(page.locator('.hero h1')).toHaveCount(0);
    await expect(page.locator('.project-card')).toHaveCount(8);
    if (width <= 700) {
      const menu = page.locator('.menu-toggle');
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await menu.click();
    }
    await page.locator('#site-nav').getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL(/#work$/);
    if (width <= 700)
      await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    const first = page.locator('.project-card').first();
    await first.click();
    await expect(page.locator('#project-dialog')).toBeVisible();
    await expect(page.locator('#project-counter')).toHaveText('1 / 8');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#project-counter')).toHaveText('2 / 8');
    await page.getByRole('button', { name: 'Previous project', exact: true }).click();
    await expect(page.locator('#project-counter')).toHaveText('1 / 8');
    await page.keyboard.press('Escape');
    await expect(page.locator('#project-dialog')).not.toBeVisible();
    await expect(first).toBeFocused();
    await page.screenshot({ path: `test-results/portfolio-${width}.png`, fullPage: true });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.ticker-track').first()).toHaveCSS('animation-name', 'none');
  expect(errors).toEqual([]);
});

test('contact form validates, retains text on delivery failure, and allows retry', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#contact-form button').click();
  expect(
    await page.locator('#email').evaluate((input: HTMLInputElement) => input.validity.valueMissing),
  ).toBe(true);
  await page.locator('#email').fill('test@example.com');
  await page.locator('#subject').fill('Browser verification');
  await page.locator('#message').fill('A test of the SvelteKit contact form.');
  let attempts = 0;
  await page.route('**/api/contact', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: 'test@example.com',
      subject: 'Browser verification',
      message: 'A test of the SvelteKit contact form.',
    });
    attempts += 1;
    await route.fulfill({
      status: attempts === 1 ? 502 : 201,
      contentType: 'application/json',
      body: JSON.stringify(attempts === 1 ? { error: 'Please try again.' } : { success: true }),
    });
  });
  await page.locator('#contact-form button').click();
  await expect(page.locator('#form-status.error')).toBeVisible();
  await expect(page.locator('#message')).toHaveValue('A test of the SvelteKit contact form.');
  await expect(page.locator('#contact-form button')).toBeEnabled();
  await page.locator('#contact-form button').click();
  await expect(page.locator('#form-status.success')).toBeVisible();
  await expect(page.locator('#contact-form')).not.toBeVisible();
  expect(attempts).toBe(2);
});

test('SvelteKit owns the API route and protects private files', async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405);
  expect(
    (
      await request.post('/api/contact', { data: { email: '', subject: '', message: '' } })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/contact', {
        data: { email: 'test@example.com', subject: 'Test', message: 'Test' },
      })
    ).status(),
  ).toBe(503);
  for (const file of ['/.env', '/src/lib/server/contact.ts', '/data/messages.jsonl']) {
    expect((await request.get(file)).status()).toBe(404);
  }
});
