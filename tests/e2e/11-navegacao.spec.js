// Navegação: barra de abas, rotas em inglês, voltar do navegador, sessão ao recarregar e espaço do topo.
const { test, expect, abrir, rota, aba } = require('./apoio');

const ROTAS = { main: '/explore', plan: '/itinerary', feed: '/feed', conta: '/account' };

test.describe('Barra de abas', () => {
  test.beforeEach(async ({ page }) => { await abrir(page, '/explore', { session: true }); await expect(page.locator('#tabbar')).toBeVisible(); });

  test('cada aba abre sua tela, com a rota certa e a pílula na aba atual', async ({ page }) => {
    for (const [tab, r] of Object.entries(ROTAS)) {
      await aba(page, tab);
      await rota(page, r);
      await expect(page.locator(`#tabbar [data-tab="${tab}"]`)).toHaveAttribute('aria-current', 'page');
      await page.waitForTimeout(500);
      const ind = await page.locator('.tab-ind').boundingBox(), cur = await page.locator(`#tabbar [data-tab="${tab}"]`).boundingBox();
      expect(Math.abs(ind.x - cur.x)).toBeLessThan(4);
    }
  });

  test('a barra fica fixa embaixo nas 4 abas e some nos painéis por cima', async ({ page }) => {
    for (const tab of Object.keys(ROTAS)) {
      await aba(page, tab);
      const b = await page.locator('#tabbar').boundingBox(), vp = page.viewportSize();
      expect(b.y + b.height).toBeGreaterThan(vp.height - 60);
    }
    await aba(page, 'feed');
    await page.locator('#feedNew').click();
    await expect(page.locator('#tabbar')).not.toBeInViewport({ ratio: 0.9 });
  });

  test('a barra não aparece fora da área logada', async ({ page }) => {
    await page.goto(`/app.html?t=${Date.now()}#/new-trip/dates`);
    await expect(page.locator('#tabbar')).toBeHidden();
  });
});

test.describe('Rotas e histórico', () => {
  test('todas as rotas em inglês abrem a tela certa com sessão', async ({ page }) => {
    test.setTimeout(120_000); // abre 10 telas do zero
    const mapa = { '/explore': '#main', '/itinerary': '#plan', '/feed': '#feed', '/account': '#conta', '/account/profile': '#perfil', '/welcome': '#intro', '/new-trip/destination': '#quiz', '/new-trip/dates': '#quiz', '/new-trip/budget': '#quiz', '/new-trip/interests': '#quiz' };
    for (const [r, sel] of Object.entries(mapa)) {
      await abrir(page, r, { session: true });
      await expect(page.locator(sel)).toBeVisible();
    }
  });

  test('rota desconhecida leva para dentro do app', async ({ page }) => {
    await abrir(page, '/nao-existe', { session: true });
    await rota(page, '/explore');
  });

  test('voltar e avançar do navegador acompanham as abas', async ({ page }) => {
    await abrir(page, '/explore', { session: true });
    await aba(page, 'plan'); await rota(page, '/itinerary');
    await aba(page, 'feed'); await rota(page, '/feed');
    await page.goBack(); await rota(page, '/itinerary');
    await page.goBack(); await rota(page, '/explore');
    await page.goForward(); await rota(page, '/itinerary');
  });

  test('a sessão continua ao recarregar e o roteiro fica salvo', async ({ page }) => {
    await abrir(page, '/itinerary', { session: true });
    const n = await page.locator('#timeline .ev').count();
    await page.reload();
    await rota(page, '/itinerary');
    await expect(page.locator('#timeline .ev')).toHaveCount(n);
  });

  test('etapas: voltar da etapa leva à anterior', async ({ page }) => {
    await abrir(page, '/new-trip/budget', { session: true });
    await page.locator('#qBack').click();
    await rota(page, '/new-trip/dates');
  });
});

test.describe('Topo das telas', () => {
  for (const r of ['/itinerary', '/feed', '/account', '/new-trip/dates']) {
    test(`${r}: o conteúdo começa abaixo da barra de status, sem sobrar espaço`, async ({ page, isMobile }) => {
      await abrir(page, r, { session: true });
      await page.waitForTimeout(600);
      const y = await page.evaluate(() => {
        const s = document.querySelector('.screen:not([hidden])');
        const el = s.querySelector('h1, .q-head, .tab-head, .ph-head');
        return el ? el.getBoundingClientRect().top : -1;
      });
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(isMobile ? 90 : 140);
    });
  }
});
