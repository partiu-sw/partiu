// Botão Ver no celular (desktop): alterna a moldura de iPhone, lembra a escolha e pode ser arrastado.
const { test, expect, abrir } = require('./apoio');

test.describe('Ver no celular', () => {
  test.skip(({ isMobile }) => isMobile, 'só no desktop');

  test('no app: alterna para a moldura de iPhone e volta para tela cheia', async ({ page }) => {
    await abrir(page, '/explore', { session: true });
    const b = page.locator('.vm-btn');
    await expect(b).toContainText('Ver no celular');
    await b.click();
    await expect(page.locator('html')).toHaveClass(/phone-mode/);
    const ph = await page.locator('.phone').boundingBox();
    expect(ph.height / ph.width).toBeGreaterThan(2.1);
    expect(ph.height / ph.width).toBeLessThan(2.25);
    await expect(page.locator('.device-ui .island')).toBeVisible();
    await expect(b).toContainText('Tela cheia');
    await b.click();
    await expect(page.locator('html')).not.toHaveClass(/phone-mode/);
  });

  test('a escolha fica guardada ao recarregar', async ({ page }) => {
    await abrir(page, '/feed', { session: true });
    await page.locator('.vm-btn').click();
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/phone-mode/);
  });

  test('arrastar muda o lugar do botão e ele não troca de modo', async ({ page }) => {
    await abrir(page, '/feed', { session: true });
    const b = page.locator('.vm-btn'), a = await b.boundingBox();
    await page.mouse.move(a.x + 20, a.y + a.height / 2); await page.mouse.down();
    await page.mouse.move(300, 200, { steps: 10 }); await page.mouse.up();
    const d = await b.boundingBox();
    expect(Math.abs(d.x - a.x)).toBeGreaterThan(100);
    await expect(page.locator('html')).not.toHaveClass(/phone-mode/);
    await page.reload();
    const e = await page.locator('.vm-btn').boundingBox();
    expect(Math.abs(e.x - d.x)).toBeLessThan(4);
  });

  test('no mapa o botão não cobre a busca nem a localização', async ({ page }) => {
    await abrir(page, '/explore', { session: true });
    await page.locator('#locate').click();
    await page.locator('#openSearch').click();
    await expect(page.locator('#searchView')).toBeVisible();
  });

  test('na landing: mostra a página dentro do celular', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('.vm-btn').click();
    await expect(page.locator('.vm-phone iframe')).toBeVisible();
    await page.locator('.vm-btn').click();
    await expect(page.locator('.vm-overlay')).toHaveCount(0);
  });
});
