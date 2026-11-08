// Landing (index.html): links para o app, título estável, celulares ao vivo, carrosséis e sem rolagem lateral.
const { test, expect } = require('./apoio');

test.describe('Landing', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/index.html'); });

  test('Abrir o app leva ao login', async ({ page }) => {
    await page.locator('a[href*="app.html"]').first().click();
    await expect(page).toHaveURL(/app\.html#\/login/);
  });

  test('o título não muda de tamanho enquanto as palavras trocam', async ({ page }) => {
    const alturas = new Set();
    for (let i = 0; i < 6; i++) { alturas.add(Math.round((await page.locator('.hero h1').boundingBox()).height)); await page.waitForTimeout(700); }
    expect(alturas.size).toBe(1);
  });

  test('não rola para os lados', async ({ page }) => {
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw).toBeLessThanOrEqual(cw + 1);
  });

  test('os celulares mostram o app ao vivo', async ({ page }) => {
    await page.locator('#telas').scrollIntoViewIfNeeded();
    const frame = page.locator('.live iframe').first();
    await expect(frame).toBeVisible({ timeout: 10_000 });
    await expect(frame).toHaveAttribute('src', /app\.html\?embed=1#\//);
    const inner = page.frameLocator('.live iframe').first();
    await expect(inner.locator('#tabbar')).toBeVisible({ timeout: 10_000 });
  });

  test('links de comércio e âncoras do menu funcionam', async ({ page, isMobile }) => {
    const forms = await page.locator('a[href*="docs.google.com/forms"]').count();
    expect(forms).toBeGreaterThan(0);
    if (!isMobile) {
      await page.locator('.nav-links a').first().click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    }
  });

  test('no celular os cards andam sozinhos como carrossel', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'só no celular');
    const el = page.locator('.steps[data-auto]');
    await el.scrollIntoViewIfNeeded();
    const x0 = await el.evaluate((e) => e.scrollLeft);
    await expect.poll(() => el.evaluate((e) => e.scrollLeft), { timeout: 9000 }).not.toBe(x0);
  });
});
