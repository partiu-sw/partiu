// Partiu — base compartilhada: ícones, estado, utilidades e troca de telas.
const $ = (id) => document.getElementById(id);
const ICON = {
  comer: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.2 1-3.5 3.8-3.5 7.5V13H17"/>',
  ver: '<path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
  dormir: '<path d="M3 5v15M3 15h18M21 20v-6.5A3.5 3.5 0 0 0 17.5 10H11v5"/><circle cx="7" cy="11.5" r="1.8"/>',
  pin: '<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>', chevR: '<path d="M9 5l7 7-7 7"/>', chevU: '<path d="M5 15l7-7 7 7"/>', chevD: '<path d="M5 9l7 7 7-7"/>',
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
};
// Fotos reais do litoral (img/, créditos em img/CREDITOS.md), escolhidas pelo nome do lugar.
const PHOTOS = [
  [/laranjeiras/i, 'laranjeiras'], [/unipraias|bondinho/i, 'unipraias'], [/cristo/i, 'cristo-luz'], [/praia central|orla/i, 'praia-central'],
  [/p[oô]r do sol/i, 'por-do-sol'], [/meia praia|itapema/i, 'post1'], [/trilha|mirante|ilha|barco|grossa|ara[cç][aá]/i, 'post3'],
  [/praia/i, 'manha-praia'], [/caf[eé]|padaria|sorvet|gr[aã]o/i, 'cafe'], [/cantina|pizz|italian/i, 'cantina'],
  [/brasa|grelha/i, 'mar-brasa'], [/frutos do mar|peix|ostra|sushi|cais/i, 'frutos-mar'], [/jantar|bistr|restaurante|engenho|almo[cç]o|hamburg/i, 'jantar'],
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
const ALLOC = [['dormir', 'Hospedagem', '#134A8E', '#FFFFFF'], ['comer', 'Alimentação', '#5B86C2', '#FFFFFF'], ['ver', 'Passeios', '#B9CDE8', '#1B1F27']];
const DEFAULT_SPLIT = [0.4, 0.35, 0.25];
// [chave, nome, como aparece no texto de carregamento]
const INTERESTS = [
  ['praia', 'Praia', 'praias'], ['noite', 'Vida noturna', 'bares'], ['comida', 'Gastronomia', 'restaurantes'],
  ['compras', 'Compras', 'lojas'], ['cultura', 'História', 'lugares históricos'], ['natureza', 'Natureza', 'mirantes'],
  ['aventura', 'Aventura', 'aventuras'], ['relax', 'Descanso', 'cafés e spas']
];
const S = {
  step: 'intro', slide: 0, city: 'bc', query: 'Balneário Camboriú', monthOff: 0,
  // Exemplo: quem já chegou e decide no destino (pesquisa de rua, nov. 2026): começa hoje, fim de semana prolongado.
  start: 20261106, end: 20261109, budget: 2000, alloc: [800, 700, 500], maxStep: 0,
  interests: new Set(['praia', 'comida']),
  filter: 'all', sel: null
};

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
const FLOW = ['login', 'intro', 'dest', 'dates', 'budget', 'prefs', 'loading', 'plan', 'home', 'main', 'detail'];
const SCREENS = ['login', 'intro', 'quiz', 'loading', 'plan', 'home', 'main', 'detail'];
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
  else if (step === 'home') { showScreen('home', dir); showHome(); }
  else if (step === 'detail') { showScreen('detail', dir); renderDetail(); }
  else { showScreen('main', dir); showMain(); }
}
// Reinicia uma animação de entrada num elemento (usada nas trocas de etapa e de slide).
function replay(el, cls) {
  el.classList.remove('step-f', 'step-b', 'swap');
  void el.offsetWidth;
  el.classList.add(cls);
}
