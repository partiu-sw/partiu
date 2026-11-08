// Apresentação (boas-vindas): 4 telas (uma sobre as ofertas dos parceiros), Continuar, pontinhos, deslizar a foto, teclado e Pular.
const { test, expect, abrir, rota, deslizar } = require('./apoio');

test.describe('Apresentação', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/welcome', { session: true }); });

  test('4 telas com textos diferentes; Continuar avança até o destino', async ({ page }) => {
    const titulos = [];
    for (let i = 0; i < 4; i++) {
      titulos.push(await page.locator('#introTitle').textContent());
      await expect(page.locator('#dots button.on')).toHaveCount(1);
      await expect(page.locator('#dots button').nth(i)).toHaveClass(/on/);
      await page.locator('#introNext').click();
    }
    expect(new Set(titulos).size).toBe(4);
    await rota(page, '/new-trip/destination');
  });

  test('deslizar a foto para a esquerda avança e para a direita volta', async ({ page }) => {
    const t1 = await page.locator('#introTitle').textContent();
    await deslizar(page, -1);
    await expect(page.locator('#introTitle')).not.toHaveText(t1);
    await deslizar(page, 1);
    await expect(page.locator('#introTitle')).toHaveText(t1);
  });

  test('deslizar pouco não troca de tela', async ({ page }) => {
    const t = await page.locator('#introTitle').textContent();
    const vp = page.viewportSize();
    await page.mouse.move(vp.width * 0.5, 300); await page.mouse.down(); await page.mouse.move(vp.width * 0.5 - 20, 300, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(400);
    await expect(page.locator('#introTitle')).toHaveText(t);
  });

  test('os pontinhos levam direto a cada tela', async ({ page }) => {
    const dots = page.locator('#dots button');
    await dots.nth(3).click();
    await expect(dots.nth(3)).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('#introNext')).toContainText('Começar agora');
    await dots.nth(0).click();
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'step');
  });

  test('setas do teclado trocam de tela', async ({ page }) => {
    const t = await page.locator('#introTitle').textContent();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#introTitle')).not.toHaveText(t);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#introTitle')).toHaveText(t);
  });

  test('Pular leva direto ao destino', async ({ page }) => {
    await page.locator('#skip').click();
    await rota(page, '/new-trip/destination');
  });

  test('na última tela aparece Começar agora e o Pular some', async ({ page }) => {
    for (let i = 0; i < 3; i++) await page.locator('#introNext').click();
    await expect(page.locator('#introNext')).toContainText('Começar agora');
    await expect(page.locator('#skip')).toBeHidden();
  });
});
