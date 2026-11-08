// Nova viagem: destino, datas, orçamento e interesses (todas as opções e validações).
const { test, expect, abrir, rota, escolherDatas } = require('./apoio');

test.describe('Destino', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/new-trip/destination', { session: true }); });

  test('as 4 cidades têm foto e dá para escolher cada uma', async ({ page }) => {
    const cidades = page.locator('[data-act="city"]');
    await expect(cidades).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await cidades.nth(i).click();
      await expect(cidades.nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(cidades.nth(i).locator('img')).toBeVisible();
    }
  });

  test('buscar filtra as cidades e cidade desconhecida avisa', async ({ page }) => {
    await page.locator('#destInput').fill('ita');
    await expect(page.locator('[data-act="city"]')).toHaveCount(1);
    await expect(page.locator('[data-act="city"]')).toContainText('Itapema');
    await page.locator('#destInput').fill('Paris');
    await expect(page.locator('#destList .empty')).toBeVisible();
    await expect(page.locator('#qNext')).toBeDisabled();
  });

  test('voltar sai da etapa e o progresso mostra a etapa 1', async ({ page }) => {
    await expect(page.locator('#qStep')).toHaveText('Etapa 1 de 4');
    await expect(page.locator('#qProg button.on')).toHaveCount(1);
  });
});

test.describe('Datas', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/new-trip/dates', { session: true }); });

  test('ida e volta marcam a faixa no calendário e mostram as noites', async ({ page }) => {
    await escolherDatas(page, 2, 4);
    await expect(page.locator('.cal-grid .day.s')).toHaveCount(1);
    await expect(page.locator('.cal-grid .day.e')).toHaveCount(1);
    await expect(page.locator('.cal-grid .day.in')).toHaveCount(3);
    await expect(page.locator('#qNote')).toContainText('4 noites');
    await expect(page.locator('#qNext')).toBeEnabled();
  });

  test('dias passados não podem ser escolhidos', async ({ page }) => {
    const passados = page.locator('.cal-grid .day[disabled]');
    if (await passados.count()) await expect(passados.first()).toBeDisabled();
  });

  test('trocar de mês e voltar', async ({ page }) => {
    const titulo = page.locator('.cal-head strong');
    const antes = await titulo.textContent();
    await page.locator('[data-act="nextMonth"]').click();
    await expect(titulo).not.toHaveText(antes);
    await page.locator('[data-act="prevMonth"]').click();
    await expect(titulo).toHaveText(antes);
  });

  test('só a ida pede a volta; tocar antes da ida muda a ida', async ({ page }) => {
    const dias = page.locator('.cal-grid .day:not([disabled])');
    await dias.nth(5).click(); await dias.nth(8).click(); // viagem completa
    await dias.nth(10).click(); // novo começo
    await expect(page.locator('#qNote')).toContainText('volta');
    await expect(page.locator('#qNext')).toBeDisabled();
    await dias.nth(12).click();
    await expect(page.locator('#qNext')).toBeEnabled();
  });

  test('a barra de progresso volta para a etapa anterior', async ({ page }) => {
    await page.locator('#qProg button').first().click();
    await rota(page, '/new-trip/destination');
  });
});

test.describe('Orçamento', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/new-trip/budget', { session: true }); });
  const total = (page) => page.locator('#budgetTotal').textContent().then((t) => +t.replace(/\D/g, ''));

  test('o meio do anel só mostra o total (não é campo de digitar)', async ({ page }) => {
    await expect(page.locator('.ring input')).toHaveCount(0);
    await expect(page.locator('#budgetTotal')).toBeVisible();
  });

  test('+ e − do total mudam de R$ 100 em R$ 100', async ({ page }) => {
    const t0 = await total(page);
    await page.locator('[data-act="plus"]').click();
    expect(await total(page)).toBe(t0 + 100);
    // as categorias acompanham o total novo
    const soma = (await page.locator('.cat-in').evaluateAll((els) => els.map((e) => +e.value.replace(/\D/g, '')))).reduce((a, b) => a + b, 0);
    expect(soma).toBe(t0 + 100);
    await page.locator('[data-act="minus"]').click(); await page.locator('[data-act="minus"]').click();
    expect(await total(page)).toBe(t0 - 100);
  });

  test('categorias dividem o total: aumentar uma tira das outras e a soma não muda', async ({ page }) => {
    const soma = async () => (await page.locator('.cat-in').evaluateAll((els) => els.map((e) => +e.value.replace(/\D/g, '')))).reduce((a, b) => a + b, 0);
    const t0 = await total(page);
    expect(await soma()).toBe(t0);
    const n = await page.locator('[data-act="catPlus"]').count();
    for (let i = 0; i < n; i++) { await page.locator('[data-act="catPlus"]').nth(i).click(); await page.locator('[data-act="catMinus"]').nth(i).click(); }
    await page.locator('[data-act="catPlus"]').nth(2).click();
    await page.locator('[data-act="catPlus"]').nth(2).click();
    expect(await soma()).toBe(t0);
    expect(await total(page)).toBe(t0);
  });

  test('digitar o valor de uma categoria', async ({ page }) => {
    const inp = page.locator('.cat-in').first();
    await inp.fill('900');
    await inp.press('Enter');
    await expect(inp).toHaveValue(/900/);
  });

  test('Pular vai para os interesses', async ({ page }) => {
    await page.locator('#qSkip').click();
    await rota(page, '/new-trip/interests');
  });
});

test.describe('Interesses', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/new-trip/interests', { session: true }); });

  test('os 8 interesses têm foto, ícone e alternam ao tocar', async ({ page }) => {
    const itens = page.locator('[data-act="interest"]');
    await expect(itens).toHaveCount(8);
    for (let i = 0; i < 8; i++) {
      const el = itens.nth(i);
      const antes = await el.getAttribute('aria-pressed');
      await el.click();
      await expect(el).toHaveAttribute('aria-pressed', antes === 'true' ? 'false' : 'true');
      await expect(el.locator('img')).toHaveCount(1);
    }
  });

  test('sem nenhum interesse não dá para seguir; o contador acompanha', async ({ page }) => {
    const itens = page.locator('[data-act="interest"]');
    for (let i = 0; i < 8; i++) if ((await itens.nth(i).getAttribute('aria-pressed')) === 'true') await itens.nth(i).click();
    await expect(page.locator('#qNext')).toBeDisabled();
    await expect(page.locator('#qNote')).toContainText('pelo menos um');
    await itens.nth(3).click();
    await expect(page.locator('#intCount')).toContainText('1');
    await expect(page.locator('#qNext')).toBeEnabled();
    await expect(page.locator('#qNext')).toHaveText('Ver meu roteiro');
  });

  test('Ver meu roteiro abre a busca e depois a escolha de como montar', async ({ page }) => {
    await page.locator('#qNext').click();
    await rota(page, '/new-trip/searching');
    await expect(page.locator('#loadThought')).not.toBeEmpty();
    await rota(page, '/itinerary/choose', 20_000);
  });
});

test('cabeçalho das etapas fica fixo ao rolar', async ({ page }) => {
  await abrir(page, '/new-trip/budget', { session: true });
  await page.locator('#quiz').evaluate((e) => e.scrollTo(0, 600));
  await page.waitForTimeout(300);
  const box = await page.locator('.q-top').boundingBox();
  expect(box.y).toBeLessThan(80);
  await expect(page.locator('#qStep')).toBeInViewport();
});
