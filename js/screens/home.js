// Início e Detalhe, no estilo da referência visual: saudação, pergunta em destaque, filtros em pílula,
// cartões de foto inclinados com etiquetas de vidro e a tela de detalhe com foto, informações e ação principal.
const HOME_CATS = [['all', 'Tudo'], ['praia', 'Praias'], ['comer', 'Comer'], ['ver', 'Passeios'], ['relax', 'Cafés'], ['noite', 'Noite']];
let homeCat = 'all', homeIdx = 0, detailPlace = null;
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia!' : h < 18 ? 'Boa tarde!' : 'Boa noite!'; };
const ICON_SM = {
  clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  route: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>',
  money: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="12" r="2.5"/></svg>',
  star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF8A3D" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3L3 10.5l7.5 3 3 7.5z"/></svg>',
  chat: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20.5l1.4-5A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>',
  bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>'
};
const priceOf = (p) => (/^\$+$|Grátis/.test(p.info) ? p.info : p.icon === 'comer' ? '$$' : p.icon === 'relax' ? '$' : 'Grátis');
const hoursOf = (p) => (/Aberto|Abre|Saídas/.test(p.info) ? p.info.replace('Aberto ', '') : 'até 18h');
function homePool() {
  return searchPool().filter((p) => !['dormir', 'pin', 'compras'].includes(p.icon) && photoFor(p.name + ' ' + p.sub))
    .filter((p) => homeCat === 'all' || (homeCat === 'praia' ? /praia/i.test(p.sub + p.name) : homeCat === 'ver' ? ['ver', 'aventura', 'natureza'].includes(p.icon) && !/praia/i.test(p.sub) : p.icon === homeCat));
}
function homeCardHTML(p, cls) {
  return `<button class="hcard ${cls}" data-place="${p.id}" aria-label="Ver ${esc(p.name)}">
    <img src="${photoFor(p.name + ' ' + p.sub)}" alt="">
    <span class="hcard-top"><strong>${esc(p.name)}</strong><span class="glass-circ">${ICON_SM.arrow}</span></span>
    <span class="hcard-tiles">
      <span class="gtile">${ICON_SM.route}<span><small>Distância</small>${shortDist(p.m)}</span></span>
      <span class="gtile">${ICON_SM.clock}<span><small>Horário</small>${esc(hoursOf(p))}</span></span>
      <span class="gtile">${ICON_SM.money}<span><small>Preço</small>${esc(priceOf(p))}</span></span>
      <span class="gtile">${ICON_SM.star}<span><small>Nota</small>${esc(p.rating)}</span></span>
    </span>
  </button>`;
}
function renderHome() {
  const u = S.user || { name: 'viajante' };
  $('homeHello').textContent = greet();
  $('homeName').textContent = u.name;
  $('homeAv').textContent = (u.name || 'V')[0].toUpperCase();
  $('homeCats').innerHTML = HOME_CATS.map(([k, l]) => `<button class="pill" data-hcat="${k}" aria-pressed="${k === homeCat}">${l}</button>`).join('');
  const pool = homePool();
  if (!pool.length) { $('homeStack').innerHTML = '<p class="home-empty">Nada aberto nessa categoria agora.</p>'; return; }
  homeIdx = homeIdx % pool.length;
  const a = pool[homeIdx], b = pool[(homeIdx + 1) % pool.length];
  $('homeStack').innerHTML = (pool.length > 1 ? homeCardHTML(b, 'back') : '') + homeCardHTML(a, 'front');
  $('homeCount').textContent = `${homeIdx + 1} de ${pool.length}`;
}
function showHome() { ensurePlan(); renderHome(); }

function renderDetail() {
  const p = detailPlace; if (!p) return;
  const added = inPlan(p), c = city();
  $('dtPhoto').src = photoFor(p.name + ' ' + p.sub);
  $('dtRating').innerHTML = `${ICON_SM.star}<span>${esc(p.rating)}</span>`;
  $('dtPlace').innerHTML = `${ICON_SM.pin}<span>${esc(p.sub.split('·').pop().trim())}, ${esc(c.name)}</span>`;
  $('dtTitle').textContent = p.name;
  $('dtChips').innerHTML = [[ICON_SM.clock, hoursOf(p)], [ICON_SM.money, priceOf(p)], [ICON_SM.route, shortDist(p.m) + ' do hotel'], [ICON_SM.star, `Nota ${p.rating}`]]
    .map(([ic, t]) => `<span class="dchip">${ic}${esc(t)}</span>`).join('');
  $('dtAbout').innerHTML = `${esc(p.name)} fica em ${esc(p.sub.toLowerCase())}, a ${shortDist(p.m)} do seu hotel em ${esc(c.name)}. ${p.icon === 'comer' ? 'Bom para almoçar ou jantar sem precisar reservar.' : p.icon === 'relax' ? 'Ótimo para uma pausa à tarde ou para fugir da chuva.' : 'Vale chegar cedo para aproveitar com calma.'} <span class="dt-more" hidden>As informações de horário e preço são de exemplo e mudam com a temporada.</span><button class="text-btn dt-read" data-dt="more">Ler mais</button>`;
  $('dtAdd').textContent = added ? 'No roteiro · organizar' : 'Adicionar ao roteiro';
  $('dtAdd').classList.toggle('done', added);
}
function openDetail(p) { detailPlace = p; go('detail'); }

$('home').addEventListener('click', (e) => {
  const cat = e.target.closest('[data-hcat]');
  if (cat) { homeCat = cat.dataset.hcat; homeIdx = 0; renderHome(); replay($('homeStack'), 'swap'); return; }
  const card = e.target.closest('[data-place]');
  if (card) {
    if (card.classList.contains('back')) { homeIdx++; renderHome(); return; }
    return openDetail(searchPool().find((x) => x.id === card.dataset.place));
  }
  if (e.target.closest('#homeNext')) { homeIdx++; renderHome(); return; }
  if (e.target.closest('#homeSearch')) { go('main'); setTimeout(openSearch, 420); return; }
  if (e.target.closest('#homeMap')) return go('main');
  if (e.target.closest('#homeBell')) { const b = $('homeBell'); b.classList.add('seen'); b.setAttribute('aria-label', 'Sem notificações novas'); }
});
$('detail').addEventListener('click', (e) => {
  const d = e.target.closest('[data-dt]'); if (!d) return;
  const act = d.dataset.dt, p = detailPlace;
  if (act === 'back') return go('home');
  if (act === 'more') { const m = $('dtAbout').querySelector('.dt-more'); m.hidden = !m.hidden; d.textContent = m.hidden ? 'Ler mais' : 'Ler menos'; return; }
  if (act === 'map') { go('main'); setTimeout(() => showFound(p), 420); return; }
  if (act === 'share') { d.classList.add('ok'); d.setAttribute('aria-label', 'Link copiado'); try { navigator.clipboard.writeText(location.href.split('#')[0] + '#home'); } catch (err) { /* sem área de transferência */ } return; }
  if (act === 'chat') { $('dtChatNote').hidden = false; setTimeout(() => { $('dtChatNote').hidden = true; }, 3200); return; }
  if (act === 'add') {
    if (inPlan(p)) { curDay = 0; return go('plan'); }
    S.plan.picked.push(asItem(p));
    renderDetail();
  }
});
// arrastar os cartões para o lado também troca de lugar
(() => {
  let x0 = null;
  $('homeStack').addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  $('homeStack').addEventListener('pointerup', (e) => { if (x0 != null && Math.abs(e.clientX - x0) > 60) { homeIdx++; renderHome(); } x0 = null; });
})();

$('tabHome').onclick = () => go('home');
$('homeTabMap').onclick = () => go('main');
$('homeTabPlan').onclick = () => { curDay = 0; go('plan'); };
