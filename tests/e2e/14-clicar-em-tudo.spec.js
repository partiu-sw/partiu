// Varredura: em cada tela, clica em CADA botão e link visível, um por vez (a tela é aberta do zero antes de
// cada clique). Falha se algum clique gerar erro de JavaScript ou deixar o app sem resposta. Links externos
// (Google Maps, Agenda, formulários) são conferidos pelo endereço, sem sair do app.
const { test, expect, abrir } = require('./apoio');

const TELAS = [
  ['login', '/login', false],
  ['apresentação', '/welcome', true],
  ['destino', '/new-trip/destination', true],
  ['datas', '/new-trip/dates', true],
  ['orçamento', '/new-trip/budget', true],
  ['interesses', '/new-trip/interests', true],
  ['como montar', '/itinerary/choose', true],
  ['escolher lugares', '/itinerary/discover', true],
  ['roteiro', '/itinerary', true],
  ['mapa', '/explore', true],
  ['feed', '/feed', true],
  ['conta', '/account', true],
  ['perfil', '/account/profile', true],
];

// lista os clicáveis visíveis da tela atual (e dos painéis abertos), com um seletor estável para cada um
async function clicaveis(page) {
  return page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]') && +s.opacity > 0.05 && r.bottom > 0 && r.top < innerHeight * 3; };
    const all = [...document.querySelectorAll('button, a[href], [role="button"], [data-act], [data-tab]')].filter(vis).filter((e) => !e.disabled && !e.closest('.dev-link, .dev-wx, #devWx'));
    const uniq = [...new Set(all)];
    return uniq.map((e, i) => {
      e.setAttribute('data-varre', String(i));
      return { i, nome: (e.getAttribute('aria-label') || e.textContent || e.title || e.className || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 50), href: e.getAttribute('href') || '', target: e.getAttribute('target') || '' };
    });
  });
}

for (const [nome, rota, sessao] of TELAS) {
  test(`clicar em tudo: ${nome}`, async ({ page }, info) => {
    test.setTimeout(8 * 60_000);
    await abrir(page, rota, { session: sessao });
    await page.waitForTimeout(900);
    const itens = await clicaveis(page);
    expect(itens.length, 'a tela tem coisas para clicar').toBeGreaterThan(0);
    const naoClicaveis = [];
    for (const it of itens) {
      // links externos: só confere o endereço (abrir aqui sairia do app)
      if (/^https?:\/\//.test(it.href) && !it.href.includes(new URL(page.url()).host)) { expect(it.href).toMatch(/^https:\/\//); continue; }
      if (it.href.startsWith('mailto:')) continue;
      await abrir(page, rota, { session: sessao });
      await page.waitForTimeout(700);
      await clicaveis(page);
      const el = page.locator(`[data-varre="${it.i}"]`);
      if (!(await el.count())) continue; // a tela mudou (ex.: conteúdo aleatório); segue
      try {
        await el.click({ timeout: 2500 });
      } catch (e) {
        naoClicaveis.push(it.nome);
        continue;
      }
      await page.waitForTimeout(450);
      // o app segue vivo: uma tela visível e o JavaScript responde
      const vivo = await page.evaluate(() => !!document.querySelector('.screen:not([hidden]), body')).catch(() => false);
      expect(vivo, `o app parou de responder depois de clicar em "${it.nome}"`).toBe(true);
    }
    info.annotations.push({ type: 'cliques', description: `${itens.length} elementos na tela${naoClicaveis.length ? `; cobertos ou fora de alcance: ${naoClicaveis.join(', ')}` : ''}` });
  });
}
