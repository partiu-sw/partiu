// Conta: perfil, viagens salvas (abrir outra ou começar uma nova) e ajustes.
const PREFS_KEY = 'partiu.ajustes';
let prefs = null;
function readPrefs() {
  if (prefs) return prefs;
  try { prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch (e) { prefs = null; }
  return (prefs = prefs || { notif: true, planb: true });
}
const CITY_PHOTO = { bc: 'img/praia-central.jpg', itapema: 'img/post1.jpg', portobelo: 'img/post3.jpg', tijucas: 'img/por-do-sol.jpg' };
function tripWhen(t) {
  if (t.id === S.tripId) return ['Atual', 'on'];
  return t.end && t.end < TODAY ? ['Já foi', ''] : ['Próxima', 'next'];
}
function tripRange(t) {
  if (!t.start || !t.end) return 'Sem datas';
  const a = dateOf(t.start), z = dateOf(t.end);
  return a.getMonth() === z.getMonth() ? `${a.getDate()}–${z.getDate()} ${MON[z.getMonth()]}` : `${shortDate(t.start)} – ${shortDate(t.end)}`;
}

function renderConta() {
  seedTrips();
  saveTrip();
  const u = S.user || { name: 'Ana', email: 'demo@partiu.app' };
  const trips = readTrips().sort((a, b) => (a.id === S.tripId ? -1 : b.id === S.tripId ? 1 : b.start - a.start));
  const places = trips.reduce((n, t) => n + tripPlaces(t), 0);
  // Conta: só você (toque para abrir o perfil) e as viagens; os ajustes ficam no perfil
  $('contaScroll').innerHTML = `
    <header class="tab-head"><div class="tab-title"><h1>Sua <em>conta</em></h1><span>${plural(trips.length, 'viagem', 'viagens')} · ${plural(places, 'lugar', 'lugares')} no roteiro</span></div></header>
    <button class="ct-me" data-profile aria-label="Abrir seu perfil">
      <span class="ct-av"><img src="img/avatares/ana.svg" alt=""></span>
      <span class="tx"><strong>${esc(u.name)}</strong><small>Ver perfil e ajustes</small></span>
      <span class="ct-go">${svg('chevR', 18, 2.2)}</span>
    </button>
    <section class="ct-sec">
      <div class="ct-sec-head"><h2>Minhas viagens</h2></div>
      <div class="ct-trips" role="list">
        ${trips.map((t, i) => { const [lbl, cls] = tripWhen(t), c = CITIES.find((x) => x.id === t.city) || CITIES[0]; return `
        <button class="ct-trip ${cls}" role="listitem" style="--i:${i}" data-trip="${t.id}" aria-label="${esc(c.name)}, ${tripRange(t)}${t.id === S.tripId ? ', viagem atual' : ', abrir'}">
          <span class="ct-ph"><img src="${CITY_PHOTO[t.city] || 'img/post2.jpg'}" alt=""></span>
          <span class="tx"><strong>${esc(c.name)}</strong><small>${tripRange(t)} · ${tripPlaces(t) ? plural(tripPlaces(t), 'lugar', 'lugares') : 'roteiro por montar'}</small></span>
          <span class="ct-badge">${lbl}</span>
        </button>`; }).join('')}
      </div>
      <button class="btn-out ct-new" data-new-trip>${svg('plus', 18, 2.4)} Planejar nova viagem</button>
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
      <span class="pf-av"><img src="img/avatares/ana.svg" alt="Foto de ${esc(u.name)}"></span>
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
