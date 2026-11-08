// Partiu — base compartilhada: ícones, estado, utilidades e troca de telas.
const $ = (id) => document.getElementById(id);
const ICON = {
  comer: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.2 1-3.5 3.8-3.5 7.5V13H17"/>',
  ver: '<path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
  dormir: '<path d="M3 5v15M3 15h18M21 20v-6.5A3.5 3.5 0 0 0 17.5 10H11v5"/><circle cx="7" cy="11.5" r="1.8"/>',
  pin: '<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  vdots: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  swap: '<path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>', chevR: '<path d="M9 5l7 7-7 7"/>', chevU: '<path d="M5 15l7-7 7 7"/>', chevD: '<path d="M5 9l7 7 7-7"/>',
  minus: '<path d="M5 12h14"/>', plus: '<path d="M5 12h14M12 5v14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  cards: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
  move: '<path d="M7 8l5-5 5 5M7 16l5 5 5-5M12 3v18"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  praia: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>',
  natureza: '<path d="M2.5 20l6.5-11 4.5 7 2.5-3.5 5.5 7.5z"/>',
  noite: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  compras: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  aventura: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  nublado: '<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 12 3.3 3.3 0 0 0 7 18.5z"/>',
  parcial: '<path d="M8.5 4.5v1.2M3.7 9.3h1.2M5.1 5.9l.9.9M12 6.8a3.6 3.6 0 0 0-6.6 2.7"/><path d="M9 20h8.5a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.4 14.5 2.8 2.8 0 0 0 9 20z"/>',
  chuva: '<path d="M7 15.5h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9 3.3 3.3 0 0 0 7 15.5z"/><path d="M9 18.5l-1 2M13 18.5l-1 2M17 18.5l-1 2"/>',
  relax: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
  mapa: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  roteiro: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 10h16M9 3v4M15 3v4M8 14h3M8 17h6"/>',
  feed: '<rect x="3" y="7" width="14" height="14" rx="3"/><path d="M7 3.5h10.5A3.5 3.5 0 0 1 21 7v10.5"/><path d="M3.5 17.5l4-4 3 3 2-2 4.5 4.5"/>',
  conta: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  heart: '<path d="M12 20s-7.5-4.6-9-9.3C2 7.4 4.2 4.5 7.3 4.5c2 0 3.6 1.2 4.7 2.9 1.1-1.7 2.7-2.9 4.7-2.9 3.1 0 5.3 2.9 4.3 6.2-1.5 4.7-9 9.3-9 9.3z"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  bookmark: '<path d="M6 3.5h12v17l-6-4.5-6 4.5z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.2v.1"/>',
  logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
};
// Fotos reais do litoral (img/, créditos em img/CREDITOS.md), escolhidas pelo nome do lugar.
const PHOTOS = [
  [/laranjeiras/i, 'laranjeiras'], [/unipraias|bondinho/i, 'unipraias'], [/cristo/i, 'cristo-luz'], [/estaleiro/i, 'estaleiro'],
  [/molhe|barco pirata/i, 'barra-sul'], [/praia grossa|plaza/i, 'praia-grossa'], [/bombas|caixa d/i, 'bombas'], [/bom jesus|aflitos|igreja|casar[aã]o|museu|centro hist/i, 'igreja-porto-belo'],
  [/rio tijucas|margem do rio|praia de tijucas/i, 'rio-tijucas'], [/golfinho/i, 'golfinhos'], [/bar |m[uú]sica ao vivo|feirinha|noturn/i, 'bar'],
  [/praia central/i, 'praia-central'],
  [/trilha|mirante|ilha|barco|ara[cç][aá]/i, 'post3'],
  [/sorvet/i, 'sorvete'], [/padaria|p[aã]o/i, 'padaria'], [/caf[eé]|gr[aã]o/i, 'cafe'], [/pizz/i, 'pizza'], [/cantina|italian|massa/i, 'cantina'],
  [/sushi|japones/i, 'sushi'], [/ostra/i, 'ostras'], [/hamb[uú]rg|burger|lanch/i, 'hamburguer'], [/salgad|pastel|coxinha|petisc|boteco/i, 'salgados'],
  [/brasa|grelha/i, 'mar-brasa'], [/frutos do mar|peix|camar|cais/i, 'frutos-mar'], [/prato feito|\bpf\b|almo[cç]o|buffet/i, 'prato-feito'],
  [/jantar|bistr|restaurante|engenho|contempor|feijoada/i, 'jantar'],
  [/hotel|pousada/i, 'hotel']
];
const photoFor = (text) => { const hit = PHOTOS.find(([re]) => re.test(text || '')); return hit ? `img/${hit[1]}.jpg` : null; };
const svg = (name, size = 20, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

// Dados de exemplo. Coordenadas aproximadas; restaurantes e hotéis são fictícios.
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const QUIZ = ['dest', 'dates', 'budget', 'prefs'];
const TODAY = 20261106;
// Categorias do orçamento: ícone, nome e o tom usado na barra de distribuição.
// Categorias do orçamento: ícone, nome e o tom de cinza do anel (do preto ao cinza claro).
const ALLOC = [['dormir', 'Hospedagem', '#111111'], ['comer', 'Alimentação', '#5E5E64'], ['ver', 'Passeios', '#A2A2A8'], ['aventura', 'Transporte', '#DCDCDF']];
const DEFAULT_SPLIT = [0.4, 0.3, 0.2, 0.1];
// [chave, nome, como aparece no texto de carregamento]
const INTERESTS = [
  ['praia', 'Praia', 'praias'], ['noite', 'Vida noturna', 'bares'], ['comida', 'Gastronomia', 'restaurantes'],
  ['compras', 'Compras', 'lojas'], ['cultura', 'História', 'lugares históricos'], ['natureza', 'Natureza', 'mirantes'],
  ['aventura', 'Aventura', 'aventuras'], ['relax', 'Descanso', 'cafés e spas']
];
const S = {
  step: 'intro', slide: 0, city: 'bc', query: 'Balneário Camboriú', monthOff: 0,
  // Exemplo: quem já chegou e decide no destino (pesquisa de rua, nov. 2026): começa hoje, fim de semana prolongado.
  start: 20261106, end: 20261109, budget: 2000, alloc: [800, 600, 400, 200], maxStep: 0,
  interests: new Set(['praia', 'comida']),
  filter: 'all', sel: null
};

// Desktop: o app ocupa a tela inteira e o painel do mapa vira uma coluna lateral (css/desktop.css).
const DESK = () => !document.documentElement.classList.contains('phone-mode') && window.matchMedia('(min-width: 900px)').matches;
const SIDE_W = 432; // largura da coluna lateral do mapa no desktop, com margem
const keyOf = (y, m, d) => y * 10000 + (m + 1) * 100 + d;
const dateOf = (k) => new Date(Math.floor(k / 10000), Math.floor(k / 100) % 100 - 1, k % 100);
const shortDate = (k) => { const d = dateOf(k); return d.getDate() + ' ' + MON[d.getMonth()]; };
const money = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const nights = () => (S.start && S.end ? Math.round((dateOf(S.end) - dateOf(S.start)) / 864e5) : 0);
const perDay = () => S.budget / Math.max(1, nights());
const city = () => CITIES.find((c) => c.id === S.city) || CITIES[0];
const rangeLabel = () => {
  if (!S.start || !S.end) return '';
  const a = dateOf(S.start), z = dateOf(S.end);
  return a.getMonth() === z.getMonth() ? `${a.getDate()}–${z.getDate()} ${MON[z.getMonth()]}` : `${shortDate(S.start)} – ${shortDate(S.end)}`;
};
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

/* ---------- navegação, com transição entre telas ---------- */
const FLOW = ['login', 'intro', 'dest', 'dates', 'budget', 'prefs', 'loading', 'main', 'plan', 'feed', 'conta', 'perfil'];
const SCREENS = ['login', 'intro', 'quiz', 'loading', 'plan', 'main', 'feed', 'conta', 'perfil'];
// Abas da barra inferior (área logada): a barra fica fixa e flutuando sobre todas elas.
const TABS = ['main', 'plan', 'feed', 'conta'];
let loadTimer, loadRaf, shown = null;
// Avançar desliza a tela nova da direita; voltar, da esquerda. A anterior some por baixo.
function showScreen(id, dir) {
  const next = $(id), prev = shown;
  if (!prev) SCREENS.forEach((s) => { $(s).hidden = s !== id; });
  if (prev === next) return;
  next.hidden = false;
  next.classList.remove('enter-f', 'enter-b', 'leave');
  void next.offsetWidth;
  next.classList.add(dir < 0 ? 'enter-b' : 'enter-f');
  if (prev) {
    prev.classList.remove('enter-f', 'enter-b');
    prev.classList.add('leave');
    setTimeout(() => { if (shown !== prev) { prev.hidden = true; prev.classList.remove('leave'); } }, 260);
  }
  shown = next;
}
function go(step) {
  clearTimeout(loadTimer);
  cancelAnimationFrame(loadRaf);
  S.stepDir = FLOW.indexOf(step) < FLOW.indexOf(S.step) ? -1 : 1;
  S.step = step;
  const dir = S.stepDir;
  if (step === 'login') { showScreen('login', dir); renderLogin(); }
  else if (step === 'intro') { showScreen('intro', dir); renderIntro(); }
  else if (QUIZ.includes(step)) { S.maxStep = Math.max(S.maxStep, QUIZ.indexOf(step)); showScreen('quiz', dir); renderQuiz(); }
  else if (step === 'loading') { showScreen('loading', dir); startLoading(); }
  else if (step === 'plan') { showScreen('plan', dir); ensurePlan(); renderPlan({ enter: true }); }
  else if (step === 'feed') { showScreen('feed', dir); renderFeed(); }
  else if (step === 'conta') { showScreen('conta', dir); renderConta(); }
  else if (step === 'perfil') { showScreen('perfil', dir); renderPerfil(); }
  else { showScreen('main', dir); showMain(); }
  document.documentElement.dataset.screen = shown ? shown.id : step; // a barra de status do iPhone fica branca sobre foto
  setTabbar(step);
  if (TABS.includes(step)) saveTrip();
  if (typeof syncRoute === 'function') syncRoute(step);
}
// Barra inferior: aparece só nas abas, marca a atual e anima a pílula azul até ela.
function setTabbar(step) {
  const bar = $('tabbar'), on = TABS.includes(step);
  bar.hidden = !on;
  if (!on) return;
  bar.querySelectorAll('[data-tab]').forEach((b) => { if (b.dataset.tab === step) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  // mede de novo quando o nome da aba termina de aparecer (a largura anima)
  const place = () => {
    const cur = bar.querySelector('[aria-current]');
    if (cur) { bar.style.setProperty('--ix', cur.offsetLeft + 'px'); bar.style.setProperty('--iw', cur.offsetWidth + 'px'); }
  };
  requestAnimationFrame(place);
  clearTimeout(setTabbar.t); setTabbar.t = setTimeout(place, 430);
  // acompanha a largura da aba enquanto o nome aparece (evita a pílula desalinhada)
  if (!setTabbar.ro) { setTabbar.ro = new ResizeObserver(() => { const c = bar.querySelector('[aria-current]'); if (c) { bar.style.setProperty('--ix', c.offsetLeft + 'px'); bar.style.setProperty('--iw', c.offsetWidth + 'px'); } }); bar.querySelectorAll('[data-tab]').forEach((x) => setTabbar.ro.observe(x)); }
}
// Reinicia uma animação de entrada num elemento (usada nas trocas de etapa e de slide).
function replay(el, cls) {
  el.classList.remove('step-f', 'step-b', 'swap');
  void el.offsetWidth;
  el.classList.add(cls);
}
