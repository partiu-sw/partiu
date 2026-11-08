// Conta: perfil, viagens salvas (abrir outra ou começar uma nova) e ajustes.
const PREFS_KEY = 'partiu.ajustes';
let prefs = null;
function readPrefs() {
  if (prefs) return prefs;
  try { prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch (e) { prefs = null; }
  return (prefs = prefs || { notif: true, planb: true });
}
const CITY_PHOTO = { bc: 'img/praia-central.jpg', itapema: 'img/post1.jpg', portobelo: 'img/post3.jpg', tijucas: 'img/por-do-sol.jpg' };
function tripRange(t) {
  if (!t.start || !t.end) return 'Sem datas';
  const a = dateOf(t.start), z = dateOf(t.end);
  return a.getMonth() === z.getMonth() ? `${a.getDate()}–${z.getDate()} ${MON[z.getMonth()]}` : `${shortDate(t.start)} – ${shortDate(t.end)}`;
}

// Quando é a viagem, em palavras: "agora", "em 40 dias", "amanhã", "já foi".
function tripWhenText(t) {
  if (t.start && t.end && t.start <= TODAY && t.end >= TODAY) return 'agora';
  if (t.end && t.end < TODAY) return 'já foi';
  if (!t.start) return 'sem datas';
  const d = Math.round((dateOf(t.start) - dateOf(TODAY)) / 864e5);
  return d === 1 ? 'amanhã' : `em ${d} dias`;
}

function renderConta() {
  seedTrips();
  saveTrip();
  const u = S.user || { name: 'Ana', email: 'demo@partiu.app' };
  const trips = readTrips().sort((a, b) => (a.id === S.tripId ? -1 : b.id === S.tripId ? 1 : b.start - a.start));
  const places = trips.reduce((n, t) => n + tripPlaces(t), 0);
  const cur = trips.find((t) => t.id === S.tripId), rest = trips.filter((t) => t !== cur);
  const cityOf = (t) => CITIES.find((x) => x.id === t.city) || CITIES[0];
  const meta = (t) => `${tripRange(t)} · ${tripPlaces(t) ? plural(tripPlaces(t), 'lugar', 'lugares') : 'roteiro por montar'}`;
  // Conta: você em destaque (toque abre o perfil e os ajustes) e as viagens; a atual em cartão com foto
  $('contaScroll').innerHTML = `
    <header class="tab-head"><div class="tab-title"><h1>Sua <em>conta</em></h1></div>
      <span class="ph-acts"><button class="ph-ic" data-profile aria-label="Perfil e ajustes">${svg('sliders', 20, 2)}</button></span></header>
    <button class="ct-me" data-profile aria-label="Abrir seu perfil">
      <span class="ct-av"><img src="img/avatares/ana.jpg" alt=""></span>
      <strong>${esc(u.name)}</strong>
      <small>${esc(u.email || '')}</small>
    </button>
    <section class="ct-sec">
      <div class="ct-sec-head"><div><h2>Minhas viagens</h2><span>${plural(trips.length, 'viagem', 'viagens')} · ${plural(places, 'lugar', 'lugares')}</span></div>
        <span class="ph-acts"><button class="ph-ic ph-edit" data-new-trip aria-label="Planejar nova viagem">${svg('plus', 20, 2.4)}</button></span></div>
      ${cur ? `<button class="ct-cur" data-trip="${cur.id}" aria-label="${esc(cityOf(cur).name)}, viagem aberta: ver no mapa">
        <img src="${CITY_PHOTO[cur.city] || 'img/post2.jpg'}" alt="">
        <span class="ct-cur-tag">${tripWhenText(cur) === 'agora' ? 'Acontecendo agora' : 'Viagem aberta'}</span>
        <span class="ct-cur-tx"><strong>${esc(cityOf(cur).name)}</strong><small>${meta(cur)}</small></span>
      </button>` : ''}
      <div class="ct-trips" role="list">
        ${rest.map((t, i) => { const w = tripWhenText(t); return `
        <button class="ct-trip${w === 'já foi' ? ' past' : ''}" role="listitem" style="--i:${i}" data-trip="${t.id}" aria-label="${esc(cityOf(t).name)}, ${tripRange(t)}, ${w}: abrir">
          <span class="ct-ph"><img src="${CITY_PHOTO[t.city] || 'img/post2.jpg'}" alt=""></span>
          <span class="tx"><strong>${esc(cityOf(t).name)}</strong><small>${meta(t)}</small></span>
          <span class="ct-when">${w}</span>
          <span class="ct-go">${svg('chevR', 16, 2.4)}</span>
        </button>`; }).join('')}
      </div>
    </section>`;
}

// Perfil: foto, nome (editável), e-mail e os ajustes em linhas simples
function renderPerfil() {
  const u = S.user || { name: 'Ana', email: 'demo@partiu.app' }, p = readPrefs();
  const chev = `<span class="ct-go">${svg('chevR', 16, 2.4)}</span>`;
  const row = (label, attr) => `<button class="pf-row" ${attr}><span>${label}</span>${chev}</button>`;
  const tg = (k, label) => `<button class="pf-row" role="switch" aria-checked="${p[k]}" data-toggle="${k}"><span>${label}</span><span class="switch" aria-hidden="true"><i></i></span></button>`;
  $('perfilBack').innerHTML = svg('chevL', 22, 2.2);
  $('perfilScroll').innerHTML = `
    <div class="pf-me">
      <span class="pf-av"><img src="img/avatares/ana.jpg" alt="Foto de ${esc(u.name)}"></span>
      <div class="pf-name" id="pfName"><strong>${esc(u.name)}</strong><small>${esc(u.email || '')}</small></div>
      <button class="pill pf-edit" data-edit-profile>Editar nome</button>
    </div>
    <section class="pf-sec">
      <h2>Ajustes</h2>
      ${tg('notif', 'Avisos do que abre perto')}
      ${tg('planb', 'Plano B quando chover')}
      ${row('Meus interesses', 'data-interests')}
      ${row('Sobre o Partiu', 'data-help')}
    </section>
    <button class="pf-out" data-logout>Sair da conta</button>`;
}

$('conta').addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-profile]')) return go('perfil');
  const tr = t.closest('[data-trip]');
  if (tr) { if (tr.dataset.trip !== S.tripId) openTrip(tr.dataset.trip); return go('main'); }
  if (t.closest('[data-new-trip]')) return newTrip();
});
$('perfilBack').addEventListener('click', () => go('conta'));
$('perfil').addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-edit-profile]')) {
    // edita o nome ali mesmo; Enter ou sair do campo salva
    const box = $('pfName'), cur = (S.user && S.user.name) || 'Ana';
    box.innerHTML = `<input class="ct-name" id="ctName" value="${esc(cur)}" aria-label="Seu nome" maxlength="30">`;
    const inp = $('ctName'); inp.focus(); inp.select();
    const done = () => { const v = inp.value.trim(); if (v) { S.user = { ...(S.user || { email: 'demo@partiu.app' }), name: firstName(v) }; saveSession(); } renderPerfil(); };
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') inp.blur(); });
    inp.addEventListener('blur', done, { once: true });
    return;
  }
  const tg = t.closest('[data-toggle]');
  if (tg) { const k = tg.dataset.toggle, p = readPrefs(); p[k] = !p[k]; try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (err) { /* ok */ } tg.setAttribute('aria-checked', p[k]); return; }
  if (t.closest('[data-interests]')) { S.maxStep = 3; return go('prefs'); }
  if (t.closest('[data-help]')) { location.href = 'index.html'; return; }
  if (t.closest('[data-logout]')) { endSession(); loginStep = 'email'; loginEmail = ''; return go('login'); }
});
