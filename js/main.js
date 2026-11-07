// Inicialização e navegação de desenvolvimento (abrir uma tela pelo endereço).
/* ---------- navegação de desenvolvimento: abrir qualquer tela pelo endereço (#plan, #main…) ---------- */
const DEV_ROUTES = ['login', 'intro', 'dest', 'dates', 'budget', 'prefs', 'loading', 'discover', 'organize', 'main'];
// Exemplo para abrir "Organizar" já com lugares escolhidos e alguns horários preenchidos.
function seedDemo() {
  const take = (ty, n) => S.plan.sugg.filter((s) => s.type === ty).slice(0, n);
  const picks = [...take('refeicao', 2), ...take('praia', 2), ...take('passeio', 2), ...take('cafe', 1)];
  S.plan.sugg = S.plan.sugg.filter((s) => !picks.includes(s));
  S.plan.picked = picks;
  const first = picks.find((p) => p.type === 'refeicao'), beach = picks.find((p) => p.type === 'praia');
  if (first) placeItem(first, 0, '12:00');
  if (beach) placeItem(beach, 0, '10:00');
}
function route() {
  const r = location.hash.slice(1);
  // Sem endereço, o app começa pelo login.
  if (!DEV_ROUTES.includes(r)) return go('login');
  if (r === 'discover' || r === 'organize') {
    ensurePlan();
    if (r === 'organize' && !chosen().length) seedDemo();
    go('plan');
    if (r === 'discover') openDiscover();
    return;
  }
  go(r);
}
window.addEventListener('hashchange', route);

hnav($('dayStrip'));
hnav($('trayRow'));
$('noAct').innerHTML = svg('x', 24, 2.4);
$('yesAct').innerHTML = svg('check', 26, 2.6);
$('undoAct').innerHTML = svg('undo', 18, 2.2);
setSheet('half');

route();
