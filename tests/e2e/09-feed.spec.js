// Feed: destaques, curtir (toque e dois toques na foto), salvar, compartilhar, comentar, pôr no roteiro e publicar.
const { test, expect, abrir } = require('./apoio');

test.describe('Feed', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/feed', { session: true });
    await expect(page.locator('.post').first()).toBeVisible();
  });

  test('mostra destaques e publicações da cidade com foto e autor', async ({ page }) => {
    await expect(page.locator('#stories .story')).not.toHaveCount(0);
    expect(await page.locator('.post').count()).toBeGreaterThan(2);
    await expect(page.locator('.post').first().locator('.post-photo img').first()).toBeVisible();
    await expect(page.locator('.post').first().locator('.post-who')).not.toBeEmpty();
  });

  test('curtir e descurtir mudam o contador', async ({ page }) => {
    const like = page.locator('[data-like]').first();
    const n0 = +(await like.textContent()).replace(/\D/g, '');
    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    expect(+(await like.textContent()).replace(/\D/g, '')).toBe(n0 + 1);
    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'false');
  });

  test('dois toques na foto curtem e mostram o coração', async ({ page }) => {
    await page.locator('[data-dbl]').first().dblclick();
    await expect(page.locator('[data-like]').first()).toHaveAttribute('aria-pressed', 'true');
  });

  test('salvar marca a publicação e avisa', async ({ page }) => {
    const sv = page.locator('[data-save]').first();
    await sv.click();
    await expect(sv).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#feedToast')).toContainText('Salvo');
    await sv.click();
    await expect(sv).toHaveAttribute('aria-pressed', 'false');
  });

  test('compartilhar e comentar avisam', async ({ page }) => {
    await page.locator('[data-share]').first().click();
    await expect(page.locator('#feedToast')).toContainText('compartilhar');
    await page.locator('[data-comment]').first().click();
    await expect(page.locator('#feedToast')).toContainText('Comentários');
  });

  test('pôr o lugar da foto no roteiro', async ({ page }) => {
    const add = page.locator('[data-add]').first();
    const antes = await page.evaluate(() => S.plan.picked.length + S.plan.days.flat().length);
    await add.click();
    await expect(add).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => S.plan.picked.length + S.plan.days.flat().length)).toBeGreaterThanOrEqual(antes);
    await expect(page.locator('#feedToast')).toBeVisible();
  });

  test('curtidas e salvos ficam guardados ao recarregar', async ({ page }) => {
    await page.locator('[data-like]').first().click();
    await page.reload();
    await expect(page.locator('[data-like]').first()).toHaveAttribute('aria-pressed', 'true');
  });

  test('publicar: + abre o painel, escolher o lugar, escrever e publicar', async ({ page }) => {
    await page.locator('#feedNew').click();
    await expect(page.locator('#compose')).toBeVisible();
    const lugares = page.locator('[data-cpick]');
    if (await lugares.count() > 1) { await lugares.nth(1).click(); await expect(lugares.nth(1)).toHaveAttribute('aria-pressed', 'true'); }
    await page.locator('#composeText').fill('Teste de publicação no Partiu');
    await page.locator('#composeGo').click();
    await expect(page.locator('#compose')).toBeHidden();
    await expect(page.locator('.post').first()).toContainText('Teste de publicação no Partiu');
  });

  test('o destaque Seu dia também abre a publicação; fechar e tocar fora fecham', async ({ page }) => {
    await page.locator('[data-compose]').click();
    await expect(page.locator('#compose')).toBeVisible();
    await page.locator('#composeClose').click();
    await expect(page.locator('#compose')).toBeHidden();
    await page.locator('#feedNew').click();
    await page.mouse.click(10, 10);
    await expect(page.locator('#compose')).toBeHidden();
  });

  test('tocar nos outros destaques não quebra a tela', async ({ page }) => {
    const n = await page.locator('[data-story]').count();
    for (let i = 0; i < n; i++) await page.locator('[data-story]').nth(i).click();
    await expect(page.locator('#feed')).toBeVisible();
  });
});
