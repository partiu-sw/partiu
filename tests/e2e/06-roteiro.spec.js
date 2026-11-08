// Roteiro: dias, horários, menu ⋮, arrastar para reordenar, para organizar, agenda, Google Maps e viagens.
const { test, expect, abrir, rota } = require('./apoio');

test.describe('Roteiro', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/itinerary', { session: true });
    await expect(page.locator('#timeline .ev').first()).toBeVisible();
  });

  test('cada dia da faixa abre suas paradas', async ({ page }) => {
    const dias = page.locator('#dayStrip [data-day]');
    const n = await dias.count();
    expect(n).toBeGreaterThan(1);
    for (let i = 0; i < n; i++) {
      await dias.nth(i).click();
      await expect(dias.nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#dayTitle')).not.toBeEmpty();
    }
  });

  test('tocar no horário abre o painel e escolher outro horário muda a parada', async ({ page }) => {
    const id = await page.locator('#timeline .ev').first().getAttribute('data-id');
    await page.locator('#timeline .ev-time').first().click();
    await expect(page.locator('#when')).toBeVisible();
    const livre = page.locator('#when .time-chip:not([disabled]):not([aria-current="true"])').first();
    const hora = (await livre.textContent()).trim();
    await livre.click();
    await expect(page.locator('#when')).toBeHidden();
    expect(await page.evaluate((id) => S.plan.days.flat().find((x) => x.id === id).time, id)).toBe(hora);
  });

  test('no painel de horário, trocar o dia e fechar', async ({ page }) => {
    await page.locator('#timeline .ev-time').first().click();
    await page.locator('#when [data-wday]').nth(1).click();
    await expect(page.locator('#when [data-wday]').nth(1)).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#whenClose').click();
    await expect(page.locator('#when')).toBeHidden();
  });

  test('tirar do dia pelo painel de horário manda para Para organizar', async ({ page }) => {
    const n = await page.locator('#timeline .ev').count();
    await page.locator('#timeline .ev-time').first().click();
    await page.locator('#when [data-unplace]').click();
    await expect(page.locator('#timeline .ev')).toHaveCount(n - 1);
    await expect(page.locator('#tray')).toBeVisible();
  });

  test('menu ⋮: mudar horário abre o painel', async ({ page }) => {
    await page.locator('#timeline .ev-more').first().click();
    await expect(page.locator('#evPop')).toBeVisible();
    await page.locator('#evPop [data-pop="time"]').click();
    await expect(page.locator('#when')).toBeVisible();
  });

  test('menu ⋮: tirar do dia e desfazer pelo aviso', async ({ page }) => {
    const n = await page.locator('#timeline .ev').count();
    await page.locator('#timeline .ev-more').first().click();
    await page.locator('#evPop [data-pop="rm"]').click();
    await expect(page.locator('#timeline .ev')).toHaveCount(n - 1);
    if (await page.locator('#undo').isVisible()) {
      await page.locator('#undo').click();
      await expect(page.locator('#timeline .ev')).toHaveCount(n);
    }
  });

  test('menu ⋮ fecha com Escape e tocando fora', async ({ page }) => {
    await page.locator('#timeline .ev-more').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#evPop')).toHaveCount(0);
    await page.locator('#timeline .ev-more').first().click();
    await page.mouse.click(10, 300);
    await expect(page.locator('#evPop')).toHaveCount(0);
  });

  test('arrastar a parada pelo ⋮ muda a ordem', async ({ page }) => {
    const ordem = () => page.locator('#timeline .ev').evaluateAll((els) => els.map((e) => e.dataset.id));
    const antes = await ordem();
    test.skip(antes.length < 2, 'dia com uma parada só');
    const h = await page.locator('#timeline .ev-more').first().boundingBox();
    const alvo = await page.locator('#timeline .ev').nth(antes.length - 1).boundingBox();
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2); await page.mouse.down();
    await page.mouse.move(h.x + h.width / 2, h.y + 20, { steps: 4 });
    await page.mouse.move(h.x + h.width / 2, alvo.y + alvo.height - 4, { steps: 16 });
    await page.mouse.up();
    await expect.poll(ordem).not.toEqual(antes);
  });

  test('adicionar a um dia abre o painel para encaixar lugares', async ({ page }) => {
    await page.locator('[data-add-day]').click();
    await expect(page.locator('#when')).toBeVisible();
  });

  test('para organizar: tocar no cartão escolhe dia e horário; organizar automático encaixa tudo', async ({ page }) => {
    await page.locator('#timeline .ev-more').first().click();
    await page.locator('#evPop [data-pop="rm"]').click();
    await expect(page.locator('#tray')).toBeVisible();
    await page.locator('#trayRow [data-pick]').first().click();
    await expect(page.locator('#when')).toBeVisible();
    await page.locator('#whenClose').click();
    await page.locator('#autoPlace').click();
    await expect(page.locator('#tray')).toBeHidden();
  });

  test('salvar na agenda baixa um arquivo .ics com os eventos', async ({ page }) => {
    const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('[data-ics]').first().click()]);
    expect(dl.suggestedFilename()).toMatch(/\.ics$/);
    expect(await dl.failure()).toBeNull();
    const txt = require('fs').readFileSync(await dl.path(), 'utf8');
    expect(txt).toContain('BEGIN:VCALENDAR');
    expect((txt.match(/BEGIN:VEVENT/g) || []).length).toBeGreaterThan(0);
  });

  test('links do Google Maps apontam para rotas reais', async ({ page }) => {
    const hrefs = await page.locator('#plan a[href*="google.com/maps"]').evaluateAll((a) => a.map((x) => x.href));
    expect(hrefs.length).toBeGreaterThan(0);
    hrefs.forEach((h) => expect(h).toMatch(/^https:\/\/www\.google\.com\/maps\//));
  });

  test('trocar de viagem: abre a lista, abre outra viagem e planeja uma nova', async ({ page }) => {
    await page.locator('#planTrips').click();
    await expect(page.locator('#tripsSheet')).toBeVisible();
    const outras = page.locator('#tripsBody [data-trip]');
    expect(await outras.count()).toBeGreaterThan(1);
    await page.locator('#tripsClose').click();
    await expect(page.locator('#tripsSheet')).toBeHidden();
    await page.locator('#planTrips').click();
    await page.locator('#tripsBody [data-new-trip]').click();
    await rota(page, '/new-trip/destination');
  });
});
