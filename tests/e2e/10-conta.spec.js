// Conta e perfil: viagens, nova viagem, perfil, editar nome, ajustes, interesses, sobre e sair.
const { test, expect, abrir, rota } = require('./apoio');

test.describe('Conta', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/account', { session: true }); await expect(page.locator('#conta')).toBeVisible(); });

  test('mostra você e as viagens (fixas de exemplo e a atual)', async ({ page }) => {
    await expect(page.locator('#conta .ct-me')).toContainText('Ana');
    const viagens = page.locator('#conta [data-trip]');
    expect(await viagens.count()).toBeGreaterThanOrEqual(2);
    expect(await viagens.count()).toBeLessThanOrEqual(4);
  });

  test('abrir uma viagem leva ao mapa daquela cidade', async ({ page }) => {
    const v = page.locator('#conta [data-trip]').last();
    await v.click();
    await rota(page, '/explore');
  });

  test('planejar nova viagem começa pelo destino', async ({ page }) => {
    await page.locator('#conta [data-new-trip]').first().click();
    await rota(page, '/new-trip/destination');
  });

  test('a lista de viagens não cresce ao criar várias', async ({ page }) => {
    const n = await page.locator('#conta [data-trip]').count();
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => { newTrip(); });
      await page.evaluate(() => { S.city = 'tijucas'; S.start = TODAY; S.end = TODAY + 2; ensurePlan(); saveTrip(); go('conta'); });
    }
    await expect(page.locator('#conta [data-trip]')).toHaveCount(Math.max(n, 3));
  });
});

test.describe('Perfil', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/account', { session: true });
    await page.locator('#conta [data-profile]').first().click();
    await rota(page, '/account/profile');
  });

  test('editar o nome com Enter e ver o novo nome', async ({ page }) => {
    await page.locator('[data-edit-profile]').click();
    await page.locator('#ctName').fill('Mariana Souza');
    await page.locator('#ctName').press('Enter');
    await expect(page.locator('#pfName')).toContainText('Mariana');
  });

  test('ajustes ligam e desligam e ficam guardados', async ({ page }) => {
    const t = page.locator('[data-toggle]').first();
    const v = await t.getAttribute('aria-checked');
    await t.click();
    await expect(t).toHaveAttribute('aria-checked', v === 'true' ? 'false' : 'true');
    await page.reload();
    await expect(page.locator('[data-toggle]').first()).toHaveAttribute('aria-checked', v === 'true' ? 'false' : 'true');
  });

  test('todos os ajustes respondem ao toque', async ({ page }) => {
    const n = await page.locator('[data-toggle]').count();
    for (let i = 0; i < n; i++) {
      const t = page.locator('[data-toggle]').nth(i), v = await t.getAttribute('aria-checked');
      await t.click();
      await expect(t).not.toHaveAttribute('aria-checked', v);
    }
  });

  test('meus interesses abre a etapa de interesses', async ({ page }) => {
    await page.locator('[data-interests]').click();
    await rota(page, '/new-trip/interests');
  });

  test('sobre o Partiu abre o site', async ({ page }) => {
    await page.locator('[data-help]').click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('voltar retorna à conta', async ({ page }) => {
    await page.locator('#perfilBack').click();
    await rota(page, '/account');
  });

  test('sair da conta volta ao login e bloqueia a área logada', async ({ page }) => {
    await page.locator('[data-logout]').click();
    await rota(page, '/login');
    await page.goto(`/app.html?t=${Date.now()}#/feed`);
    await rota(page, '/login');
  });
});
