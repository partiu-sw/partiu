// Explorar no mapa: dias, paradas, Agora, plano B, painel em estágios, localização, agenda e editar.
const { test, expect, abrir, rota, isMobile } = require('./apoio');

test.describe('Mapa', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/explore', { session: true });
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('#list .ev-card[data-sel]').first()).toBeVisible();
  });

  test('o mapa carrega com pinos e a rota do dia', async ({ page }) => {
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
    await expect(page.locator('.pin-dot').first()).toBeVisible();
    await expect(page.locator('#tripCity')).not.toBeEmpty();
  });

  test('cada dia troca as paradas', async ({ page }) => {
    const dias = page.locator('#mapDays [data-d]');
    const n = await dias.count();
    for (let i = 0; i < n; i++) {
      await dias.nth(i).click();
      await expect(dias.nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('tocar numa parada destaca o pino', async ({ page }) => {
    await page.locator('#list .ev-card[data-sel]').first().click();
    await expect(page.locator('#list .ev-card[data-sel]').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.pin.sel')).toBeVisible();
  });

  test('Ir agora coloca o lugar no dia de hoje', async ({ page }) => {
    await page.locator('#mapDays [data-d]').first().click();
    const ir = page.locator('[data-now]').first();
    test.skip(!(await ir.isVisible().catch(() => false)), 'sem sugestões abertas agora');
    const nome = (await ir.getAttribute('aria-label')).replace('Ir agora para ', '');
    await ir.click();
    await expect(page.locator('#mapNote')).toContainText(nome);
    expect(await page.evaluate((n) => S.plan.days[0].concat(S.plan.picked).some((x) => x.title === n), nome)).toBe(true);
  });

  test('plano B troca a praia por um lugar coberto quando chove', async ({ page }) => {
    const dias = page.locator('#mapDays [data-d]');
    let achou = false;
    for (let i = 0; i < (await dias.count()); i++) {
      await dias.nth(i).click();
      if (await page.locator('[data-swap]').isVisible().catch(() => false)) { achou = true; break; }
    }
    test.skip(!achou, 'nenhum dia com chuva e praia');
    await page.locator('[data-swap]').click();
    await expect(page.locator('#mapNote')).toContainText('Plano B');
  });

  test('botão de localização centraliza e avisa', async ({ page }) => {
    if (isMobile(page)) await page.evaluate(() => setSheet('half'));
    await page.locator('#locate').click();
    await expect(page.locator('#mapNote')).toBeVisible({ timeout: 8000 });
  });

  test('salvar o dia na agenda baixa um .ics', async ({ page }) => {
    const b = page.locator('[data-ics-day]');
    test.skip(!(await b.count()), 'sem botão de agenda no mapa');
    const [dl] = await Promise.all([page.waitForEvent('download'), b.first().click()]);
    expect(dl.suggestedFilename()).toMatch(/\.ics$/);
  });

  test('editar roteiro leva à aba Roteiro', async ({ page }) => {
    const e = page.locator('#placesActs [data-edit]').first();
    test.skip(!(await e.count()), 'sem botão de editar');
    await e.click();
    await rota(page, '/itinerary');
  });
});

test.describe('Painel do mapa (celular)', () => {
  test.skip(({ isMobile }) => !isMobile, 'só no celular');
  test.beforeEach(async ({ page }) => { await abrir(page, '/explore', { session: true }); await expect(page.locator('#placesSheet')).toBeVisible(); });

  const estado = (page) => page.evaluate(() => sheetState);
  async function puxar(page, dy) {
    const g = await page.locator('#grabber').boundingBox();
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await page.mouse.down();
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + dy, { steps: 14 }); await page.mouse.up();
    await page.waitForTimeout(600);
  }

  test('a alça alterna metade → aberto → recolhido', async ({ page }) => {
    expect(await estado(page)).toBe('half');
    await page.locator('#grabber').click(); await expect.poll(() => estado(page)).toBe('full');
    await page.locator('#grabber').click(); await expect.poll(() => estado(page)).toBe('collapsed');
    await page.locator('#grabber').click(); await expect.poll(() => estado(page)).toBe('half');
  });

  test('arrastar para cima abre e para baixo recolhe', async ({ page }) => {
    await puxar(page, -350); await expect.poll(() => estado(page)).toBe('full');
    await puxar(page, 700); await expect.poll(() => estado(page)).toBe('collapsed');
  });

  test('recolhido mostra mais mapa (painel baixo)', async ({ page }) => {
    await page.evaluate(() => setSheet('collapsed'));
    await page.waitForTimeout(700);
    const b = await page.locator('#placesSheet').boundingBox();
    expect(b.height).toBeLessThan(260);
  });
});
