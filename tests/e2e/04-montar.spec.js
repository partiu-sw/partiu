// Como montar o roteiro: usar as recomendações ou escolher na mão; fechar.
const { test, expect, abrir, rota } = require('./apoio');

test.describe('Como montar o roteiro', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/itinerary/choose', { session: true }); });

  test('mostra as duas opções com foto e o resumo da viagem', async ({ page }) => {
    await expect(page.locator('#choose')).toBeVisible();
    await expect(page.locator('[data-choose]')).toHaveCount(2);
    await expect(page.locator('#chooseSub')).toContainText('dias');
  });

  test('usar as recomendações organiza os dias e abre o roteiro', async ({ page }) => {
    await page.locator('[data-choose="auto"]').click();
    await expect(page.locator('#choose')).toBeHidden();
    await rota(page, '/itinerary');
    await expect(page.locator('#timeline .ev').first()).toBeVisible();
    await expect(page.locator('#toast')).toBeVisible();
  });

  test('escolher na mão abre os cartões de deslizar', async ({ page }) => {
    await page.locator('[data-choose="manual"]').click();
    await expect(page.locator('#disc')).toBeVisible();
    await expect(page.locator('.dcard').first()).toBeVisible();
  });

  test('fechar volta ao roteiro sem montar nada', async ({ page }) => {
    await page.locator('#chooseClose').click();
    await expect(page.locator('#choose')).toBeHidden();
    await rota(page, '/itinerary');
  });
});
