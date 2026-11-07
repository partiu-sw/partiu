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
  const u = S.user || { name: 'Ana', email: 'demo@partiu.app' }, p = readPrefs();
  const trips = readTrips().sort((a, b) => (a.id === S.tripId ? -1 : b.id === S.tripId ? 1 : b.start - a.start));
  const places = trips.reduce((n, t) => n + tripPlaces(t), 0), posts = feedData().mine.length;
  const row = (ic, label, extra, attr) => `<button class="row-btn ct-row" ${attr}><span class="ic">${svg(ic, 20, 1.9)}</span><span class="tx"><strong>${label}</strong></span>${extra}</button>`;
  const sw = (k, on) => `<span class="switch" role="switch" aria-checked="${on}" data-pref="${k}"><i></i></span>`;
  $('contaScroll').innerHTML = `
    <header class="ct-hero">
      <span class="ct-av">${esc(u.name[0].toUpperCase())}</span>
      <div class="ct-id"><h1>${esc(u.name)}</h1><span>${esc(u.email || '')}</span></div>
      <button class="icon-btn round ct-gear" data-edit-profile aria-label="Ajustes do perfil">${svg('gear', 20, 2)}</button>
    </header>
    <div class="ct-stats">
      <div style="--i:0"><b>${trips.length}</b><span>${trips.length === 1 ? 'viagem' : 'viagens'}</span></div>
      <div style="--i:1"><b>${places}</b><span>lugares</span></div>
      <div style="--i:2"><b>${posts}</b><span>${posts === 1 ? 'publicação' : 'publicações'}</span></div>
    </div>
    <section class="ct-sec">
      <div class="ct-sec-head"><h2>Minhas viagens</h2><button class="link-sm" data-new-trip>Nova viagem</button></div>
      <div class="trips" role="list">
        ${trips.map((t, i) => { const [lbl, cls] = tripWhen(t), c = CITIES.find((x) => x.id === t.city) || CITIES[0]; return `
        <button class="trip ${cls}" role="listitem" style="--i:${i}" data-trip="${t.id}" aria-label="${esc(c.name)}, ${tripRange(t)}${t.id === S.tripId ? ', viagem atual' : ', abrir'}">
          <img src="${CITY_PHOTO[t.city] || 'img/post2.jpg'}" alt="">
          <span class="trip-badge">${lbl}</span>
          <span class="trip-tx"><strong>${esc(c.name)}</strong><small>${tripRange(t)} · ${tripPlaces(t) ? plural(tripPlaces(t), 'lugar', 'lugares') : 'roteiro por montar'}</small></span>
        </button>`; }).join('')}
        <button class="trip add" role="listitem" data-new-trip><span class="trip-plus">${svg('plus', 26, 2.2)}</span><strong>Planejar nova viagem</strong><small>Destino, datas e o que você curte</small></button>
      </div>
    </section>
    <section class="ct-sec">
      <h2>Ajustes</h2>
      <div class="ct-list">
        ${row('bell', 'Avisos do que abre perto', sw('notif', p.notif), 'data-toggle="notif"')}
        ${row('chuva', 'Plano B quando chover', sw('planb', p.planb), 'data-toggle="planb"')}
        ${row('sparkle', 'Meus interesses', `<span class="ct-go">${svg('chevR', 16, 2.4)}</span>`, 'data-interests')}
        ${row('help', 'Ajuda e sugestões', `<span class="ct-go">${svg('chevR', 16, 2.4)}</span>`, 'data-help')}
      </div>
      <button class="ct-out" data-logout>${svg('logout', 20, 2)}Sair da conta</button>
      <p class="ct-foot">Partiu · versão de demonstração · Startup Weekend Itapema 2026</p>
    </section>`;
}

$('conta').addEventListener('click', (e) => {
  const t = e.target;
  const tr = t.closest('[data-trip]');
  if (tr) { if (tr.dataset.trip !== S.tripId) openTrip(tr.dataset.trip); return go('main'); }
  if (t.closest('[data-new-trip]')) return newTrip();
  const tg = t.closest('[data-toggle]');
  if (tg) { const k = tg.dataset.toggle, p = readPrefs(); p[k] = !p[k]; try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (err) { /* ok */ } tg.querySelector('.switch').setAttribute('aria-checked', p[k]); return; }
  if (t.closest('[data-interests]')) { S.maxStep = 3; return go('prefs'); }
  if (t.closest('[data-help]')) { location.href = 'index.html'; return; }
  if (t.closest('[data-logout]')) { endSession(); loginStep = 'email'; loginEmail = ''; return go('login'); }
});
