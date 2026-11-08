// Busca de lugares e empresas: digitar, categorias, resultado no mapa, adicionar ao roteiro e fechar.
const { test, expect, abrir, rota, isMobile } = require('./apoio');

test.describe('Busca', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/explore', { session: true });
    if (isMobile(page)) await page.evaluate(() => setSheet('half'));
    await page.locator('#openSearch').click();
    await expect(page.locator('#searchView')).toBeVisible();
  });

  test('abre com a lista perto do hotel e o campo focado', async ({ page }) => {
    await expect(page.locator('#searchList [data-res]').first()).toBeVisible();
    await expect(page.locator('#searchInput')).toBeFocused();
  });

  test('digitar filtra; sem resultado mostra aviso', async ({ page }) => {
    await page.locator('#searchInput').fill('pizz');
    await expect(page.locator('#searchList [data-res]').first()).toContainText(/Pizz/i);
    await page.locator('#searchInput').fill('xyzzz');
    await expect(page.locator('#searchList .empty')).toBeVisible();
  });

  test('cada categoria filtra a lista', async ({ page }) => {
    const cats = page.locator('#searchCats [data-cat]');
    const n = await cats.count();
    for (let i = 0; i < n; i++) {
      await cats.nth(i).click();
      await expect(cats.nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('escolher um resultado mostra no mapa; adicionar e fechar', async ({ page }) => {
    await page.locator('#searchInput').fill('Sorveteria');
    await page.locator('#searchList [data-res]').first().click();
    await expect(page.locator('#searchView')).toBeHidden();
    await expect(page.locator('#found')).toBeVisible();
    const antes = await page.evaluate(() => S.plan.picked.length);
    await page.locator('#found [data-found="add"]').click();
    await expect.poll(() => page.evaluate(() => S.plan.picked.length)).toBe(antes + 1);
    await expect(page.locator('#found [data-found="plan"]')).toBeVisible();
    await page.locator('#found [data-found="close"]').click();
    await expect(page.locator('#found')).toBeHidden();
  });

  test('resultado já no roteiro leva para organizar', async ({ page }) => {
    await page.locator('#searchList [data-res]').nth(1).click();
    await page.locator('#found [data-found="add"]').click();
    await page.locator('#found [data-found="plan"]').click();
    await rota(page, '/itinerary');
  });

  test('voltar e Escape fecham a busca', async ({ page }) => {
    await page.locator('#searchClose').click();
    await expect(page.locator('#searchView')).toBeHidden();
    await page.locator('#openSearch').click();
    await page.locator('#searchInput').press('Escape');
    await expect(page.locator('#searchView')).toBeHidden();
  });
});
