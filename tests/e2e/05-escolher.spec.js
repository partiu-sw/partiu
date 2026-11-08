// Escolher lugares: quero ir, pular, desfazer, arrastar o cartão, categorias e fechar.
const { test, expect, abrir } = require('./apoio');

const titulo = (page) => page.locator('.dcard.top .body strong').textContent();

test.describe('Escolher lugares', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/itinerary/discover', { session: true });
    await expect(page.locator('#disc')).toBeVisible();
  });

  test('quero ir guarda o lugar e passa para o próximo', async ({ page }) => {
    const t = await titulo(page);
    const antes = await page.evaluate(() => S.plan.picked.length);
    await page.locator('#yesAct').click();
    await expect.poll(() => page.evaluate(() => S.plan.picked.length)).toBe(antes + 1);
    expect(await page.evaluate((t) => S.plan.picked.some((x) => x.title === t), t)).toBe(true);
  });

  test('pular descarta e desfazer traz o cartão de volta', async ({ page }) => {
    const t = await titulo(page);
    await page.locator('#noAct').click();
    await expect(page.locator('.dcard.top .body strong')).not.toHaveText(t);
    await page.locator('#undoAct').click();
    await expect(page.locator('.dcard.top .body strong')).toHaveText(t);
  });

  test('arrastar o cartão para a direita é quero ir; para a esquerda é pular', async ({ page }) => {
    const antes = await page.evaluate(() => S.plan.picked.length);
    const card = await page.locator('.dcard.top').boundingBox();
    const cx = card.x + card.width / 2, cy = card.y + card.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 260, cy, { steps: 12 }); await page.mouse.up();
    await expect.poll(() => page.evaluate(() => S.plan.picked.length)).toBe(antes + 1);
    await page.waitForTimeout(900); // o próximo cartão termina de aparecer
    const t = await titulo(page);
    const c2 = await page.locator('.dcard.top').boundingBox();
    await page.mouse.move(c2.x + c2.width / 2, c2.y + c2.height / 2); await page.mouse.down(); await page.mouse.move(c2.x + c2.width / 2 - 260, c2.y + c2.height / 2, { steps: 12 }); await page.mouse.up();
    await expect(page.locator('.dcard.top .body strong')).not.toHaveText(t);
    expect(await page.evaluate(() => S.plan.picked.length)).toBe(antes + 1);
  });

  test('arrastar pouco não decide e o cartão volta', async ({ page }) => {
    const t = await titulo(page);
    const c = await page.locator('.dcard.top').boundingBox();
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await page.mouse.down(); await page.mouse.move(c.x + c.width / 2 + 30, c.y + c.height / 2, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(500);
    await expect(page.locator('.dcard.top .body strong')).toHaveText(t);
  });

  test('cada categoria mostra seus lugares', async ({ page }) => {
    const n = await page.locator('#stages [data-stage]').count();
    expect(n).toBeGreaterThan(1);
    for (let i = 0; i < n; i++) {
      await page.locator('#stages [data-stage]').nth(i).click();
      await expect(page.locator('#stages [data-stage]').nth(i)).toHaveAttribute('aria-current', 'step');
      await expect(page.locator('#discCount')).not.toBeEmpty();
    }
  });

  // espera o próximo estado: cartão pronto para decidir, próxima categoria ou organizar
  async function proximo(page) {
    const alvo = page.locator('#yesAct:not([disabled]), [data-next], [data-organize]').first();
    await alvo.waitFor();
    if (await page.locator('[data-organize]').isVisible()) return 'organizar';
    if (await page.locator('[data-next]').isVisible()) return 'proxima';
    return 'cartao';
  }

  test('esgotar uma categoria oferece a próxima e no fim organizar', async ({ page }) => {
    let viuProxima = false;
    for (let guard = 0; guard < 80; guard++) {
      const s = await proximo(page);
      if (s === 'organizar') break;
      if (s === 'proxima') { viuProxima = true; await page.locator('[data-next]').click(); continue; }
      await page.locator('#yesAct').click();
      await page.waitForTimeout(420); // o cartão termina de voar antes do próximo toque
    }
    expect(viuProxima).toBe(true);
    await page.locator('[data-organize]').click();
    await expect(page.locator('#disc')).toBeHidden();
    await expect(page.locator('#plan')).toBeVisible();
  });

  test('rever os pulados de uma categoria traz os cartões de volta', async ({ page }) => {
    for (let guard = 0; guard < 40; guard++) {
      if (await page.locator('[data-review]').isVisible().catch(() => false)) break;
      if ((await proximo(page)) !== 'cartao') break;
      await page.locator('#noAct').click();
      await page.waitForTimeout(420);
    }
    await page.locator('[data-review]').click();
    await expect(page.locator('.dcard.top')).toBeVisible();
  });

  test('setas do teclado decidem e Escape fecha', async ({ page }) => {
    const antes = await page.evaluate(() => S.plan.picked.length);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => page.evaluate(() => S.plan.picked.length)).toBe(antes + 1);
    await page.waitForTimeout(350);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(350);
    await page.keyboard.press('Escape');
    await expect(page.locator('#disc')).toBeHidden();
  });

  test('fechar volta ao roteiro', async ({ page }) => {
    await page.locator('#discClose').click();
    await expect(page.locator('#disc')).toBeHidden();
    await expect(page.locator('#plan')).toBeVisible();
  });
});
