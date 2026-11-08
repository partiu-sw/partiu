// Login: e-mail (conta nova e existente), validações, redes sociais, esqueci a senha, voltar e sessão.
const { test, expect, abrir, rota, entrarComEmail } = require('./apoio');

test.describe('Login', () => {
  test('sem sessão, qualquer área logada leva ao login', async ({ page }) => {
    for (const r of ['/explore', '/itinerary', '/feed', '/account', '/new-trip/dates']) {
      await abrir(page, r);
      await rota(page, '/login');
      await expect(page.locator('#login')).toBeVisible();
    }
  });

  test('e-mail inválido mostra o erro e não avança', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginEmail').fill('isso-nao-e-email');
    await page.locator('#loginGo').click();
    await expect(page.locator('#loginErr')).toBeVisible();
    await page.locator('#loginEmail').fill('ana@');
    await page.locator('#loginGo').click();
    await expect(page.locator('#loginErr')).toBeVisible();
    await rota(page, '/login');
  });

  test('o erro some quando a pessoa volta a digitar', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginGo').click();
    await expect(page.locator('#loginErr')).toBeVisible();
    await page.locator('#loginEmail').type('a');
    await expect(page.locator('#loginErr')).toBeHidden();
  });

  test('conta nova: pede nome e senha e abre a apresentação', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginEmail').fill('nova.pessoa@exemplo.com');
    await page.locator('#loginGo').click();
    await expect(page.locator('#signName')).toBeVisible();
    await page.locator('#loginGo').click(); // sem nome e senha
    await expect(page.locator('#loginErr')).toBeVisible();
    await page.locator('#signName').fill('Bruno Lima');
    await page.locator('#signPass').fill('segredo1');
    await page.locator('#loginGo').click();
    await rota(page, '/welcome');
  });

  test('conta existente (demo): pede senha e abre a apresentação', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginEmail').fill('demo@partiu.app');
    await page.locator('#loginGo').click();
    await expect(page.locator('#loginPass')).toBeVisible();
    await expect(page.locator('.lg-who')).toContainText('demo@partiu.app');
    await page.locator('#loginGo').click(); // sem senha
    await expect(page.locator('#loginErr')).toBeVisible();
    await page.locator('#loginPass').fill('qualquer');
    await page.locator('#loginGo').click();
    await rota(page, '/welcome');
  });

  test('conta criada fica lembrada: na segunda vez pede só a senha', async ({ page }) => {
    await abrir(page);
    await entrarComEmail(page, 'lembra@exemplo.com', { nome: 'Lia' });
    await rota(page, '/welcome');
    await page.evaluate(() => localStorage.removeItem('partiu.sessao'));
    await page.goto(`/app.html?t=${Date.now()}#/login`);
    await page.locator('#loginEmail').fill('lembra@exemplo.com');
    await page.locator('#loginGo').click();
    await expect(page.locator('#loginPass')).toBeVisible();
    await expect(page.locator('#loginBody')).toContainText('Lia');
  });

  for (const rede of ['google', 'apple', 'facebook']) {
    test(`entrar com ${rede} abre a apresentação`, async ({ page }) => {
      await abrir(page);
      await page.locator(`[data-social="${rede}"]`).click();
      await rota(page, '/welcome');
    });
  }

  test('esqueci a senha avisa que o link foi enviado', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginEmail').fill('demo@partiu.app');
    await page.locator('#loginGo').click();
    const f = page.locator('[data-forgot]');
    await f.click();
    await expect(f).toContainText('Enviamos');
    await expect(f).toBeDisabled();
  });

  test('voltar no passo da senha retorna ao e-mail; no primeiro passo vai para o site', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginEmail').fill('demo@partiu.app');
    await page.locator('#loginGo').click();
    await expect(page.locator('#loginPass')).toBeVisible();
    await page.locator('#loginBack').click();
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginEmail')).toHaveValue('demo@partiu.app');
    await page.locator('#loginBack').click();
    await expect(page).toHaveURL(/index\.html|\/$/);
  });

  test('Enter no campo de e-mail também avança', async ({ page }) => {
    await abrir(page);
    await page.locator('#loginEmail').fill('demo@partiu.app');
    await page.locator('#loginEmail').press('Enter');
    await expect(page.locator('#loginPass')).toBeVisible();
  });

  test('fotos da região passam sozinhas com legenda', async ({ page }) => {
    await abrir(page);
    const legenda = page.locator('.lg-slide.on figcaption strong');
    const primeira = await legenda.textContent();
    await expect(legenda).not.toHaveText(primeira, { timeout: 7_000 });
    await expect(page.locator('.lg-dots i.on')).toHaveCount(1);
  });

  test('com sessão, abrir o login leva para dentro do app', async ({ page }) => {
    await abrir(page, '/login', { session: true });
    await expect(page).not.toHaveURL(/#\/login$/);
    await expect(page.locator('#tabbar')).toBeVisible();
  });
});
