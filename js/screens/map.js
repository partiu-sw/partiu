// Explorar: mapa Leaflet, painel de lugares e localização.
/* ---------- tela principal ---------- */
let map, markers = {}, meMarker, routeLine, mapCity;
function haversine(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const pinIcon = (n, sel, title) => L.divIcon({
  className: '', iconSize: [44, 44], iconAnchor: [22, 22],
  html: `<div class="pin${sel ? ' sel' : ''}"><span class="pin-dot">${n}</span>${sel ? `<span class="pin-label">${esc(title)}</span>` : ''}</div>`
});
const homeIcon = () => L.divIcon({ className: '', iconSize: [44, 44], iconAnchor: [22, 22], html: `<div class="pin home"><span class="pin-dot">${svg('dormir', 18)}</span></div>` });

// Previsão do tempo de exemplo (fictícia): muda por cidade e por dia.
const WX = [['sol', 'Ensolarado', 29, 21], ['chuva', 'Chuva à tarde', 23, 19], ['parcial', 'Sol e nuvens', 27, 20], ['sol', 'Ensolarado', 30, 22], ['nublado', 'Nublado', 25, 20], ['parcial', 'Sol e nuvens', 26, 20]];
const wxFor = (d) => WX[(Math.max(0, CITIES.findIndex((c) => c.id === S.city)) + d) % WX.length];

// Onde a pessoa está: GPS quando o navegador permite; senão, o Shopping Russi & Russi (Itapema).
const FALLBACK_ME = { ll: [-27.12853, -48.60103], name: 'Shopping Russi & Russi, em Itapema' };
const TRIP_CARD_H = 112; // área ocupada pelo cartão da viagem no topo do mapa
let me = null, sheetState = 'half', noteT;

function initMap() {
  if (map || !window.L) return;
  map = L.map('map', { zoomControl: false, attributionControl: true, minZoom: 11, maxZoom: 16 });
  // Blocos do mapa (Esri Light Gray, base + nomes) publicados junto com a página; onde faltar, aparece a grade do fundo.
  L.tileLayer('tiles/{z}/{x}/{y}.png', {
    minZoom: 11, maxZoom: 16, maxNativeZoom: 15,
    errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap'
  }).addTo(map);
  map.attributionControl.setPrefix(false);
  map.attributionControl.setPosition('bottomleft');
  meMarker = L.marker(FALLBACK_ME.ll, {
    icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
    interactive: false, keyboard: false, zIndexOffset: 500
  }).addTo(map);
}

/* Painel de lugares: recolhido, metade ou tela cheia. Arraste o puxador ou use o botão. */
function sheetHeights() {
  const H = $('main').clientHeight || 844;
  return { collapsed: 150, half: Math.round(H * 0.5), full: H - TRIP_CARD_H };
}
const curSheetH = () => parseFloat($('main').style.getPropertyValue('--sheet-h')) || sheetHeights().half;
function setSheet(state) {
  if (DESK()) state = 'full'; // no desktop o painel é uma coluna sempre aberta
  sheetState = state;
  $('main').style.setProperty('--sheet-h', sheetHeights()[state] + 'px');
  $('placesSheet').classList.toggle('collapsed', state === 'collapsed');
  $('grabber').setAttribute('aria-expanded', state !== 'collapsed');
}
let sd = null, justDragged = false;
$('grabber').addEventListener('pointerdown', (e) => {
  sd = { y: e.clientY, h: curSheetH(), moved: false };
  $('grabber').setPointerCapture(e.pointerId);
});
$('grabber').addEventListener('pointermove', (e) => {
  if (!sd) return;
  const dy = sd.y - e.clientY;
  if (!sd.moved && Math.abs(dy) < 5) return;
  sd.moved = true;
  const hs = sheetHeights();
  $('main').classList.add('resizing');
  $('placesSheet').classList.remove('collapsed');
  $('main').style.setProperty('--sheet-h', Math.max(hs.collapsed, Math.min(hs.full, sd.h + dy)) + 'px');
});
function endSheetDrag() {
  if (!sd) return;
  $('main').classList.remove('resizing');
  if (sd.moved) {
    const hs = sheetHeights(), h = curSheetH();
    setSheet(Object.keys(hs).sort((a, b) => Math.abs(hs[a] - h) - Math.abs(hs[b] - h))[0]);
    justDragged = true;
  }
  sd = null;
}
$('grabber').addEventListener('pointerup', endSheetDrag);
$('grabber').addEventListener('pointercancel', endSheetDrag);
$('grabber').addEventListener('click', () => {
  if (justDragged) { justDragged = false; return; }
  setSheet({ collapsed: 'half', half: 'full', full: 'collapsed' }[sheetState]);
});
window.addEventListener('resize', () => { if (!$('main').hidden) setSheet(sheetState); });

// Centraliza um ponto na parte do mapa que fica visível entre o cartão do topo e o painel.
function flyVisible(ll, zoom) {
  const z = zoom ?? map.getZoom();
  const pt = map.project(ll, z).add(DESK() ? [-SIDE_W / 2, 0] : [0, (curSheetH() - TRIP_CARD_H) / 2]);
  map.flyTo(map.unproject(pt, z), z, { duration: 0.6 });
}

// Sem nada no roteiro (ex.: abrindo #main direto), monta um exemplo espalhando as sugestões pelos dias.
function seedTrip() {
  if (chosen().length) return;
  const order = ['cafe', 'praia', 'refeicao', 'passeio', 'noite'];
  // Um lugar de cada tipo por dia, na ordem do dia, até acabarem as sugestões.
  S.plan.days.forEach((list, d) => order.forEach((ty) => {
    const it = S.plan.sugg.find((x) => x.type === ty), t = it && suggestTime(it, d);
    if (!t) return;
    it.time = t;
    list.push(it);
    S.plan.sugg = S.plan.sugg.filter((x) => x !== it);
  }));
}

let mapDay = 0, mapPlan = null, homeMarker, curB = null;

/* ---------- decidir no destino (pesquisa de rua, nov. 2026) ---------- */
// "Agora": o que está aberto perto de você no horário atual (horário de exemplo fixo).
const NOW = '15:30';
const fitsNow = (ty) => TYPES[ty].windows.some(([a, b]) => toMin(NOW) >= toMin(a) && toMin(NOW) <= toMin(b));
const asItem = (p) => ({ title: p.name, sub: p.sub, icon: p.icon === 'pin' ? 'ver' : p.icon, type: typeFor(p), ll: p.ll, id: 'it' + planSeq++ });
const nowPicks = () => searchPool().filter((p) => !['dormir', 'pin', 'compras'].includes(p.icon) && !inPlan(p) && fitsNow(typeFor(p))).slice(0, 3);
// Plano B: com previsão de chuva, sugere trocar a praia do dia por um lugar coberto perto do hotel.
function planB(items) {
  const [ic, wx] = wxFor(mapDay);
  if (ic !== 'chuva') return null;
  const beach = items.slice().reverse().find((x) => x.type === 'praia');
  const alt = beach && searchPool().find((p) => p.icon === 'relax' && !inPlan(p));
  return alt ? { beach, alt, wx } : null;
}
function extrasHTML(items, isToday) {
  curB = planB(items);
  const b = curB ? `<div class="planb" role="status"><span class="planb-ic">${svg('chuva', 20)}</span>
      <span class="planb-tx"><strong>${esc(curB.wx)} · plano B</strong><small>Trocar ${esc(curB.beach.title)} por ${esc(curB.alt.name)}, coberto e perto</small></span>
      <button class="pill planb-go" data-swap>Trocar</button></div>` : '';
  const picks = isToday ? nowPicks() : [];
  const now = picks.length ? `<section class="now" aria-label="O que fazer agora">
      <div class="now-head"><strong>Agora, ${NOW}</strong><span>Aberto perto de você</span></div>
      ${picks.map((p) => `<div class="now-item"><span class="now-ic">${photoFor(p.name + ' ' + p.sub) ? `<img src="${photoFor(p.name + ' ' + p.sub)}" alt="">` : svg(p.icon, 18)}</span>
        <span class="stop-tx"><strong>${esc(p.name)}</strong><small>${esc(p.info)} · ${shortDist(p.m)}</small></span>
        <button class="pill now-go" data-now="${p.id}" aria-label="Ir agora para ${esc(p.name)}">Ir agora</button></div>`).join('')}
    </section>` : '';
  return b + now;
}
function showMain() {
  initMap();
  ensurePlan();
  seedTrip();
  if (mapPlan !== S.plan) {
    mapPlan = S.plan; S.sel = null;
    const first = S.plan.days.findIndex((l) => l.length);
    mapDay = first < 0 ? 0 : first;
  }
  $('tripCity').textContent = city().name;
  setSheet(sheetState);
  if (map) map.invalidateSize();
  renderDay(true);
}

// Painel: dias da viagem, a ordem do dia (saindo do hotel) e o tempo entre um lugar e outro.
function renderDay(fit) {
  const hotel = city().places[0], items = dayItems(mapDay), [ic, wx, max, min] = wxFor(mapDay);
  const x = dayDate(mapDay);
  $('tripWx').innerHTML = `${svg(ic, 22, 1.8)}<span><b>${max}°</b><small>${wx}</small></span>`;
  $('tripWx').setAttribute('aria-label', `Previsão para ${dayShort(mapDay)}: ${wx.toLowerCase()}, máxima de ${max}° e mínima de ${min}°`);
  // Na ilha do topo: o dia que está sendo visto ("Hoje" quando for o dia de hoje).
  const isToday = keyOf(x.getFullYear(), x.getMonth(), x.getDate()) === TODAY;
  $('tripMeta').textContent = `${isToday ? 'Hoje · ' : ''}${DAYNAME[x.getDay()]}, ${x.getDate()} ${MON[x.getMonth()]}`;
  $('placesMeta').textContent = items.length ? plural(items.length, 'lugar', 'lugares') : 'Dia livre';
  $('mapDays').innerHTML = S.plan.days.map((_, d) => {
    const y = dayDate(d);
    return `<button class="pill day-pill" data-d="${d}" aria-pressed="${d === mapDay}">${svg(wxFor(d)[0], 16, 1.8)}${WEEK[y.getDay()]} ${y.getDate()}</button>`;
  }).join('');
  const left = S.plan.picked.length;
  const edit = `<button class="text-btn rt-edit" data-edit>${left ? `Editar roteiro · ${plural(left, 'lugar', 'lugares')} para organizar` : 'Editar roteiro'}</button>`;
  if (!items.length) {
    $('list').innerHTML = extrasHTML(items, isToday) + `<div class="rt-empty"><strong>Dia livre</strong><p>Nada marcado para este dia ainda.</p><button class="btn-out" data-edit>Organizar roteiro</button></div>`;
  } else {
    let prev = hotel.ll;
    $('list').innerHTML = extrasHTML(items, isToday) + `<div class="rt-start"><span class="rt-n home">${svg('dormir', 16)}</span><span>Saída de <b>${esc(hotel.name)}</b></span></div>` +
      items.map((it, i) => {
        const leg = `<div class="rt-leg">${distText(prev, it.ll)}</div>`;
        prev = it.ll;
        return `${leg}<button class="stop" data-id="${it.id}" aria-pressed="${it.id === S.sel}">
          <span class="rt-n">${i + 1}</span>
          <span class="stop-tx"><strong>${esc(it.title)}</strong><small><b>${it.time}</b> · ${esc(it.sub)}</small></span>
          <span class="stop-go">${svg('chevR', 16, 2.4)}</span>
        </button>`;
      }).join('') + edit;
  }
  if (!map) return;
  Object.values(markers).forEach((m) => m.remove()); markers = {};
  if (!homeMarker) homeMarker = L.marker(hotel.ll, { icon: homeIcon(), title: hotel.name, keyboard: false, zIndexOffset: 200 }).addTo(map);
  homeMarker.setLatLng(hotel.ll);
  items.forEach((it, i) => {
    const sel = it.id === S.sel;
    markers[it.id] = L.marker(it.ll, { icon: pinIcon(i + 1, sel, it.title), title: it.title, keyboard: true, zIndexOffset: sel ? 1000 : 300 }).on('click', () => select(it.id, false)).addTo(map);
  });
  if (routeLine) routeLine.remove();
  routeLine = L.polyline([hotel.ll, ...items.map((it) => it.ll)], { color: '#134A8E', weight: 3, opacity: 0.7, dashArray: '1 8', lineCap: 'round', interactive: false }).addTo(map);
  if (fit) map.fitBounds(L.latLngBounds([hotel.ll, ...items.map((it) => it.ll)]), DESK() ? { paddingTopLeft: [SIDE_W + 32, 100], paddingBottomRight: [48, 48], maxZoom: 15 } : { paddingTopLeft: [36, TRIP_CARD_H + 12], paddingBottomRight: [36, curSheetH() + 24], maxZoom: 15 });
}

function select(id, fromList) {
  S.sel = S.sel === id && fromList ? null : id;
  if (!fromList && sheetState === 'collapsed') setSheet('half');
  renderDay(false);
  const it = dayItems(mapDay).find((x) => x.id === id);
  if (map && fromList && S.sel) flyVisible(it.ll, Math.max(map.getZoom(), 15));
  if (!fromList) { const el = $('list').querySelector(`[data-id="${id}"]`); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
}
$('list').addEventListener('click', (e) => {
  if (e.target.closest('[data-edit]')) { curDay = mapDay; return go('plan'); }
  const nowBtn = e.target.closest('[data-now]');
  if (nowBtn) {
    const p = searchPool().find((x) => x.id === nowBtn.dataset.now), it = asItem(p), t = suggestTime(it, mapDay, toMin(NOW));
    if (t) { it.time = t; S.plan.days[mapDay].push(it); S.sel = it.id; showNote(`${p.name} entrou no seu dia às ${t}`); }
    else { S.plan.picked.push(it); showNote(`${p.name} foi para "Para organizar"`); }
    return renderDay(true);
  }
  if (e.target.closest('[data-swap]') && curB) {
    const { beach, alt } = curB, it = asItem(alt), list = S.plan.days[mapDay];
    it.time = beach.time;
    list.splice(list.indexOf(beach), 1, it);
    S.plan.sugg.push(beach);
    S.sel = it.id;
    showNote(`Plano B: ${alt.name} às ${it.time}`);
    return renderDay(true);
  }
  const t = e.target.closest('.stop'); if (t) select(t.dataset.id, true);
});
$('mapDays').addEventListener('click', (e) => {
  const t = e.target.closest('[data-d]'); if (!t) return;
  mapDay = +t.dataset.d; S.sel = null;
  renderDay(true);
  replay($('list'), 'swap');
});

function showNote(msg) {
  const n = $('mapNote');
  n.textContent = msg;
  n.hidden = false;
  clearTimeout(noteT);
  noteT = setTimeout(() => { n.hidden = true; }, 4000);
}
function placeMe(ll, msg) {
  me = ll;
  meMarker.setLatLng(ll);
  flyVisible(ll, 15);
  if (msg) showNote(msg);
}
$('locate').onclick = () => {
  if (!map) return;
  if (me) return flyVisible(me, 15);
  const fallback = () => placeMe(FALLBACK_ME.ll, `Sem acesso à sua localização. Mostrando o ${FALLBACK_ME.name}.`);
  if (!navigator.geolocation) return fallback();
  navigator.geolocation.getCurrentPosition((pos) => placeMe([pos.coords.latitude, pos.coords.longitude]), fallback, { timeout: 4000, maximumAge: 60000 });
};

/* ---------- busca de lugares e empresas ---------- */
// Empresas de exemplo (fictícias), perto do hotel de cada cidade: [ícone, nome, tipo, nota, horário, deslocamento lat, lng]
const BIZ = [
  ['comer', 'Pizzaria Bella Onda', 'Pizzaria', '4,5', 'Aberto até 23h', 0.0021, -0.0018],
  ['comer', 'Sushi Maré', 'Japonesa', '4,6', 'Aberto até 22h30', -0.0034, 0.0012],
  ['comer', 'Hamburgueria do Porto', 'Hambúrguer', '4,4', 'Aberto até 23h', 0.0046, 0.0009],
  ['relax', 'Café Grão da Ilha', 'Cafeteria', '4,7', 'Aberto até 19h', -0.0012, -0.0027],
  ['relax', 'Sorveteria Brisa', 'Sorveteria', '4,6', 'Aberto até 22h', 0.0008, 0.0024],
  ['compras', 'Farmácia Saúde Mais', 'Farmácia', '4,3', 'Aberto 24 horas', -0.0026, -0.0006],
  ['compras', 'Mercado Bom Preço', 'Supermercado', '4,2', 'Aberto até 22h', 0.0032, -0.0031],
  ['compras', 'Surf Point', 'Loja de surfe', '4,8', 'Aberto até 20h', -0.0041, 0.0021],
  ['aventura', 'Pedala Bike', 'Aluguel de bicicletas', '4,7', 'Aberto até 18h', 0.0015, 0.0036],
  ['aventura', 'Mar Aberto Passeios', 'Passeio de barco', '4,8', 'Saídas às 9h e 14h', -0.0052, -0.0019],
  ['noite', 'Bar Sereia', 'Bar · música ao vivo', '4,5', 'Abre às 18h', 0.0039, 0.0027],
  ['dormir', 'Pousada Vento Sul', 'Pousada', '4,6', 'Recepção 24 horas', -0.0019, 0.0042],
  ['pin', 'Posto Rota Litoral', 'Posto de combustível', '4,1', 'Aberto 24 horas', 0.0058, -0.0012],
  ['pin', 'Lavanderia Express', 'Lavanderia', '4,4', 'Aberto até 20h', -0.0007, 0.0051]
];
const SEARCH_CATS = [['all', 'Tudo'], ['comer', 'Comer'], ['relax', 'Cafés'], ['compras', 'Compras'], ['ver', 'Passeios'], ['dormir', 'Hospedagem'], ['pin', 'Serviços']];
const catGroup = (ic) => (['aventura', 'noite', 'praia', 'natureza'].includes(ic) ? 'ver' : ic);
let searchCat = 'all', found = null, foundMarker;

function searchPool() {
  const c = city(), h = c.places[0].ll;
  const own = c.places.map((p) => ({ id: p.id, icon: p.cat, name: p.name, sub: p.sub, rating: p.rating, info: p.price, ll: p.ll }));
  const biz = BIZ.map(([icon, name, sub, rating, info, a, b], i) => ({ id: c.id + 'b' + i, icon, name, sub, rating, info, ll: [h[0] + a, h[1] + b] }));
  return [...own, ...biz].map((p) => ({ ...p, m: haversine(h, p.ll) })).sort((a, b) => a.m - b.m);
}
const shortDist = (m) => (m < 1000 ? `${Math.max(50, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);

function renderSearch() {
  const raw = $('searchInput').value.trim(), q = norm(raw);
  $('searchCats').innerHTML = SEARCH_CATS.map(([k, l]) => `<button class="pill" data-cat="${k}" aria-pressed="${k === searchCat}">${l}</button>`).join('');
  const list = searchPool().filter((p) => (searchCat === 'all' || catGroup(p.icon) === searchCat) && (!q || norm(p.name + ' ' + p.sub).includes(q)));
  const head = q || searchCat !== 'all' ? plural(list.length, 'resultado', 'resultados') : `Perto do seu hotel em ${city().name}`;
  $('searchList').innerHTML = `<p class="label sv-label">${head}</p>` + (list.length ? list.map((p) => `
    <button class="row-btn sv-row" data-res="${p.id}">
      <span class="ic">${svg(p.icon, 20, 1.8)}</span>
      <span class="tx"><strong>${esc(p.name)}</strong><small>${esc(p.sub)} · ${shortDist(p.m)}</small></span>
      <span class="sv-rate">★ ${p.rating}</span>
    </button>`).join('') : `<p class="empty">Nada encontrado para “${esc(raw)}”. Tente outro nome ou categoria.</p>`);
}
function openSearch() {
  closeFound();
  $('searchView').hidden = false;
  $('searchInput').value = '';
  searchCat = 'all';
  renderSearch();
  setTimeout(() => $('searchInput').focus(), 50);
}
function closeSearch() { $('searchView').hidden = true; }

// Resultado escolhido: aparece no mapa com um cartão e a opção de entrar no roteiro.
const typeFor = (p) => p.icon === 'comer' ? 'refeicao' : p.icon === 'relax' ? 'cafe' : p.icon === 'noite' ? 'noite' : /praia/i.test(p.sub) ? 'praia' : 'passeio';
const inPlan = (p) => chosen().some((x) => x.title === p.name);
function showFound(p) {
  found = p;
  closeSearch();
  setSheet('collapsed');
  $('main').classList.add('has-found');
  renderFound();
  if (!map) return;
  if (foundMarker) foundMarker.remove();
  foundMarker = L.marker(p.ll, { icon: L.divIcon({ className: '', iconSize: [44, 44], iconAnchor: [22, 22], html: `<div class="pin sel"><span class="pin-dot">${svg(p.icon, 20)}</span><span class="pin-label">${esc(p.name)}</span></div>` }), zIndexOffset: 2000, keyboard: false }).addTo(map);
  flyVisible(p.ll, 16);
}
function renderFound() {
  const p = found, added = inPlan(p);
  $('found').hidden = false;
  $('found').innerHTML = `
    <div class="found-top">
      <span class="ic">${svg(p.icon, 22, 1.8)}</span>
      <span class="tx"><strong>${esc(p.name)}</strong><small>${esc(p.sub)} · ★ ${p.rating}</small></span>
      <button class="icon-btn" data-found="close" aria-label="Fechar">${svg('x', 18, 2.2)}</button>
    </div>
    <p class="found-meta">${esc(p.info)} · ${distText(city().places[0].ll, p.ll)} do hotel</p>
    ${p.icon === 'dormir' ? '' : added
      ? `<button class="btn-out found-act" data-found="plan">${svg('check', 18, 2.4)} No roteiro · organizar</button>`
      : `<button class="btn-primary sm found-act" data-found="add">${svg('plus', 18, 2.4)} Adicionar ao roteiro</button>`}`;
}
function closeFound() {
  if (!found) return;
  found = null;
  $('found').hidden = true;
  $('main').classList.remove('has-found');
  if (foundMarker) { foundMarker.remove(); foundMarker = null; }
  setSheet('half');
}
$('found').addEventListener('click', (e) => {
  const a = e.target.closest('[data-found]'); if (!a) return;
  if (a.dataset.found === 'close') return closeFound();
  if (a.dataset.found === 'plan') { curDay = mapDay; return go('plan'); }
  if (!inPlan(found)) S.plan.picked.push({ title: found.name, sub: found.sub, icon: found.icon === 'pin' ? 'ver' : found.icon, type: typeFor(found), ll: found.ll, id: 'it' + planSeq++ });
  renderFound();
  renderDay(false);
});
$('openSearch').onclick = openSearch;
$('searchClose').onclick = closeSearch;
$('searchInput').addEventListener('input', renderSearch);
$('searchInput').addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });
$('searchCats').addEventListener('click', (e) => { const t = e.target.closest('[data-cat]'); if (t) { searchCat = t.dataset.cat; renderSearch(); } });
$('searchList').addEventListener('click', (e) => { const t = e.target.closest('[data-res]'); if (t) showFound(searchPool().find((p) => p.id === t.dataset.res)); });
