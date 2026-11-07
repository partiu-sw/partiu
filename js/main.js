// Inicialização e rotas. Endereços em inglês, no formato #/caminho (ex.: #/explore, #/new-trip/dates).
// A área logada só abre com sessão; sem sessão, qualquer endereço leva ao login.
const ROUTES = {
  '/login': 'login', '/welcome': 'intro',
  '/new-trip/destination': 'dest', '/new-trip/dates': 'dates', '/new-trip/budget': 'budget', '/new-trip/interests': 'prefs', '/new-trip/searching': 'loading',
  '/explore': 'main', '/itinerary': 'plan', '/itinerary/choose': 'plan', '/itinerary/discover': 'plan', '/feed': 'feed', '/account': 'conta'
};
const PATH_OF = Object.fromEntries(Object.entries(ROUTES).filter(([p]) => !/choose|discover/.test(p)).map(([p, s]) => [s, p]));
QUIZ.forEach((q) => { PATH_OF[q] = Object.keys(ROUTES).find((p) => ROUTES[p] === q); });
let routing = false;
// Mantém o endereço igual à tela atual (o voltar do navegador funciona).
function syncRoute(step) {
  const h = '#' + (PATH_OF[step] || '/explore');
  if (location.hash === h) return;
  history[routing ? 'replaceState' : 'pushState'](null, '', h);
}
function route() {
  const path = location.hash.replace(/^#/, '') || '/login';
  let step = ROUTES[path];
  const logged = !!S.user || loadSession();
  if (!step) step = logged ? 'main' : 'login';
  if (step !== 'login' && !logged) step = 'login';
  if (step === 'login' && logged) step = 'main';
  if (step === S.step && shown && !/choose|discover/.test(path)) return;
  routing = true;
  if (logged && !S.tripId && step !== 'login') { seedTrips(); const last = readTrips().filter((t) => t.plan).sort((a, b) => b.updated - a.updated)[0]; if (last) openTrip(last.id); else if (step !== 'dest' && QUIZ.indexOf(step) < 0 && step !== 'intro' && step !== 'loading') { ensurePlan(); seedTrip(); } }
  go(step);
  if (path === '/itinerary/choose') openChoose();
  if (path === '/itinerary/discover') openDiscover();
  routing = false;
}
window.addEventListener('hashchange', route);
// Página de desenvolvimento com todas as telas: só aparece rodando localmente.
if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) { const d = document.querySelector('.dev-link'); if (d) d.remove(); }

// No desktop, um botão alterna entre tela cheia e ver no formato de celular (fica guardado no navegador).
const PHONE_IC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M11 18.5h2"/></svg>';
const WIDE_IC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="13" rx="2.5"/><path d="M8 21h8M12 17.5V21"/></svg>';
function paintViewToggle() {
  const on = document.documentElement.classList.contains('phone-mode');
  $('viewToggle').innerHTML = on ? `${WIDE_IC}Tela cheia` : `${PHONE_IC}Ver no celular`;
  $('viewToggle').setAttribute('aria-pressed', on);
}
$('viewToggle').onclick = () => {
  const on = document.documentElement.classList.toggle('phone-mode');
  try { localStorage.setItem('partiu.modo', on ? 'celular' : 'tela'); } catch (e) { /* ok */ }
  paintViewToggle();
  // o layout muda: painel do mapa, mapa e barra se ajustam
  setSheet(DESK() ? 'full' : 'half');
  setTimeout(() => { if (map) map.invalidateSize(); setTabbar(S.step); if (S.step === 'main') renderDay(true); }, 60);
};
paintViewToggle();

// Barra inferior: ícones e troca de aba.
$('tabbar').querySelectorAll('[data-ic]').forEach((s) => { s.innerHTML = svg(s.dataset.ic, 22, 1.9); });
$('tabbar').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b && b.dataset.tab !== S.step) go(b.dataset.tab); });
window.addEventListener('resize', () => setTabbar(S.step));

hnav($('dayStrip'));
hnav($('trayRow'));
$('noAct').innerHTML = svg('x', 24, 2.4);
$('yesAct').innerHTML = svg('check', 26, 2.6);
$('undoAct').innerHTML = svg('undo', 18, 2.2);
setSheet('half');

route();
