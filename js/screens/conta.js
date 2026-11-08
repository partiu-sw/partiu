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
  const places = trips.reduce((n, t) => n + tripPlaces(t), 0);
  const go = `<span class="ct-go">${svg('chevR', 16, 2.4)}</span>`;
  const row = (ic, label, extra, attr) => `<button class="row-btn ct-row" ${attr}><span class="ic">${svg(ic, 20, 1.9)}</span><span class="tx"><strong>${label}</strong></span>${extra}</button>`;
  const sw = (k, on) => `<span class="switch" role="switch" aria-checked="${on}" data-pref="${k}"><i></i></span>`;
  $('contaScroll').innerHTML = `
    <header class="tab-head"><div class="tab-title"><h1>Sua <em>conta</em></h1><span>${plural(trips.length, 'viagem', 'viagens')} · ${plural(places, 'lugar', 'lugares')} no roteiro</span></div></header>
    <div class="ct-me">
      <span class="ct-av"><img src="img/avatares/ana.svg" alt="Foto de ${esc(u.name)}"></span>
      <span class="tx"><strong>${esc(u.name)}</strong><small>${esc(u.email || '')}</small></span>
      <button class="pill ct-edit" data-edit-profile>Editar</button>
    </div>
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
    </section>
    <section class="ct-sec">
      <div class="ct-sec-head"><h2>Ajustes</h2></div>
      <div class="ct-list">
        ${row('bell', 'Avisos do que abre perto', sw('notif', p.notif), 'data-toggle="notif"')}
        ${row('chuva', 'Plano B quando chover', sw('planb', p.planb), 'data-toggle="planb"')}
        ${row('sparkle', 'Meus interesses', go, 'data-interests')}
        ${row('help', 'Sobre o Partiu', go, 'data-help')}
        ${row('logout', 'Sair da conta', '', 'data-logout')}
      </div>
    </section>`;
}

$('conta').addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-edit-profile]')) {
    // edita o nome ali mesmo; Enter ou sair do campo salva
    const box = $('contaScroll').querySelector('.ct-me .tx'), cur = (S.user && S.user.name) || 'Ana';
    box.innerHTML = `<input class="ct-name" id="ctName" value="${esc(cur)}" aria-label="Seu nome" maxlength="30">`;
    const inp = $('ctName'); inp.focus(); inp.select();
    const done = () => { const v = inp.value.trim(); if (v) { S.user = { ...(S.user || { email: 'demo@partiu.app' }), name: firstName(v) }; saveSession(); } renderConta(); };
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') inp.blur(); });
    inp.addEventListener('blur', done, { once: true });
    return;
  }
  const tr = t.closest('[data-trip]');
  if (tr) { if (tr.dataset.trip !== S.tripId) openTrip(tr.dataset.trip); return go('main'); }
  if (t.closest('[data-new-trip]')) return newTrip();
  const tg = t.closest('[data-toggle]');
  if (tg) { const k = tg.dataset.toggle, p = readPrefs(); p[k] = !p[k]; try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (err) { /* ok */ } tg.querySelector('.switch').setAttribute('aria-checked', p[k]); return; }
  if (t.closest('[data-interests]')) { S.maxStep = 3; return go('prefs'); }
  if (t.closest('[data-help]')) { location.href = 'index.html'; return; }
  if (t.closest('[data-logout]')) { endSession(); loginStep = 'email'; loginEmail = ''; return go('login'); }
});
