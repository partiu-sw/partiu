// Inicialização e rotas. Endereços em inglês, no formato #/caminho (ex.: #/explore, #/new-trip/dates).
// A área logada só abre com sessão; sem sessão, qualquer endereço leva ao login.
const ROUTES = {
  '/login': 'login', '/welcome': 'intro',
  '/new-trip/destination': 'dest', '/new-trip/dates': 'dates', '/new-trip/budget': 'budget', '/new-trip/interests': 'prefs', '/new-trip/searching': 'loading',
  '/explore': 'main', '/itinerary': 'plan', '/itinerary/choose': 'plan', '/itinerary/discover': 'plan', '/feed': 'feed', '/account': 'conta', '/account/profile': 'perfil'
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
if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) document.querySelectorAll('.dev-link').forEach((d) => d.remove());

// Clima de teste (só local): automático → sol → sol e nuvens → nublado → chuva → automático.
const DEV_WX_ORDER = [null, 'sol', 'parcial', 'nublado', 'chuva'];
function paintDevWx() {
  const b = $('devWx'); if (!b) return;
  b.innerHTML = `${svg(devWx ? DEV_WX[devWx][0] : 'parcial', 16, 2)}Clima: ${devWx ? DEV_WX[devWx][1].toLowerCase() : 'automático'}`;
}
if ($('devWx')) {
  paintDevWx();
  $('devWx').addEventListener('click', () => {
    devWx = DEV_WX_ORDER[(DEV_WX_ORDER.indexOf(devWx) + 1) % DEV_WX_ORDER.length];
    try { if (devWx) localStorage.setItem(DEV_WX_KEY, devWx); else localStorage.removeItem(DEV_WX_KEY); } catch (e) { /* ok */ }
    paintDevWx();
    if (S.step === 'main') renderDay(false);
    else if (S.step === 'plan') renderPlan();
  });
}

// Botão celular/desktop (js/viewmode.js): quando o modo muda, o layout se ajusta.
window.addEventListener('partiu:modo', () => {
  setSheet(DESK() ? 'full' : 'half');
  setTimeout(() => { if (map) map.invalidateSize(); setTabbar(S.step); if (S.step === 'main') renderDay(true); }, 60);
});

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
