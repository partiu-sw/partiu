// Apoio comum dos testes: navegador limpo, conta de demonstração, atalhos de fluxo e uma
// verificação automática de que nenhum teste termina com erro de JavaScript na página.
const base = require('@playwright/test');

const test = base.test.extend({
  page: async ({ page }, use, info) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|tiles\.openfreemap|router\.project-osrm|routing\.openstreetmap/.test(m.text())) erros.push(m.text()); });
    await use(page);
    base.expect(erros, `erros de JavaScript em ${info.title}`).toEqual([]);
  },
});
const { expect } = base;

const isMobile = (page) => (page.viewportSize() || {}).width < 900;

// Abre uma rota do app com o navegador limpo. session: entra com a conta de demonstração (Ana).
async function abrir(page, rota = '/login', { session = false, modo = '', storage = {} } = {}) {
  await page.goto('/app.html');
  await page.evaluate(({ session, modo, storage }) => {
    localStorage.clear(); sessionStorage.clear();
    if (session) localStorage.setItem('partiu.sessao', JSON.stringify({ name: 'Ana', email: 'demo@partiu.app' }));
    if (modo) localStorage.setItem('partiu.modo', modo);
    Object.entries(storage).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
  }, { session, modo, storage });
  // endereço novo (com ?t=) para o app carregar do zero, já com o navegador limpo
  await page.goto(`/app.html?t=${Date.now()}#${rota}`);
  await page.waitForLoadState('domcontentloaded');
}

async function rota(page, r, timeout = 10_000) {
  await expect(page).toHaveURL(new RegExp(`#${r.replace(/[/]/g, '\\/')}$`), { timeout });
}

// Login por e-mail: conta existente pede senha; conta nova pede nome e senha.
async function entrarComEmail(page, email, { senha = 'senha123', nome = 'Bruno Lima' } = {}) {
  await page.locator('#loginEmail').fill(email);
  await page.locator('#loginGo').click();
  const passo = page.locator('#loginPass, #signName').first();
  await passo.waitFor();
  if (await page.locator('#loginPass').count()) await page.locator('#loginPass').fill(senha);
  else { await page.locator('#signName').fill(nome); await page.locator('#signPass').fill(senha); }
  await page.locator('#loginGo').click();
}

// Desliza a foto da apresentação para o lado (como o dedo): para a esquerda avança, para a direita volta.
async function deslizar(page, direcao = -1) {
  const vp = page.viewportSize();
  const y = vp.height * 0.35, x0 = vp.width * (direcao < 0 ? 0.8 : 0.2), x1 = vp.width * (direcao < 0 ? 0.2 : 0.8);
  await page.mouse.move(x0, y); await page.mouse.down();
  await page.mouse.move(x1, y, { steps: 10 }); await page.mouse.up();
  await page.waitForTimeout(400);
}

async function passarApresentacao(page) {
  await rota(page, '/welcome');
  for (let i = 0; i < 3; i++) await page.locator('#introNext').click();
  await rota(page, '/new-trip/destination');
}

async function escolherDatas(page, ida = 0, noites = 3) {
  const dias = page.locator('.cal-grid .day:not([disabled])');
  await dias.nth(ida).click();
  await dias.nth(ida + noites).click();
}

// Destino → datas → orçamento → interesses → busca, até "Como montar seu roteiro?".
async function planejarViagem(page, { cidade = 0, interesses = ['praia', 'comida'] } = {}) {
  await rota(page, '/new-trip/destination');
  await page.locator('[data-act="city"]').nth(cidade).click();
  await page.locator('#qNext').click();
  await rota(page, '/new-trip/dates');
  await escolherDatas(page);
  await page.locator('#qNext').click();
  await rota(page, '/new-trip/budget');
  await page.locator('#qNext').click();
  await rota(page, '/new-trip/interests');
  for (const k of ['praia', 'noite', 'comida', 'compras', 'cultura', 'natureza', 'aventura', 'relax']) {
    const el = page.locator(`[data-act="interest"][data-k="${k}"]`);
    const on = (await el.getAttribute('aria-pressed')) === 'true';
    if (on !== interesses.includes(k)) await el.click();
  }
  await page.locator('#qNext').click();
  await rota(page, '/new-trip/searching');
  await rota(page, '/itinerary/choose', 20_000);
}

async function aba(page, nome) {
  await page.locator(`#tabbar [data-tab="${nome}"]`).click();
}

module.exports = { test, expect, abrir, rota, entrarComEmail, deslizar, passarApresentacao, escolherDatas, planejarViagem, aba, isMobile };
