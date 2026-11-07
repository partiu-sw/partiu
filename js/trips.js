// Viagens salvas: cada conta guarda várias viagens (cidade, datas, orçamento, interesses e roteiro).
// Fica no navegador (localStorage); a viagem aberta é salva sempre que se entra numa aba.
const TRIPS_KEY = 'partiu.viagens';
const SESSION_KEY = 'partiu.sessao';
const tripOwner = () => (S.user && S.user.email) || 'demo@partiu.app';

function readTrips() {
  try { return JSON.parse(localStorage.getItem(TRIPS_KEY) || '{}')[tripOwner()] || []; } catch (e) { return []; }
}
function writeTrips(list) {
  try {
    const all = JSON.parse(localStorage.getItem(TRIPS_KEY) || '{}');
    all[tripOwner()] = list;
    localStorage.setItem(TRIPS_KEY, JSON.stringify(all));
  } catch (e) { /* sem armazenamento: as viagens ficam só nesta visita */ }
}
const tripPlaces = (t) => (t.plan ? t.plan.days.reduce((n, d) => n + d.length, 0) : 0);

// Conta de demonstração: além da viagem atual, uma próxima e uma que já passou.
function seedTrips() {
  if (tripOwner() !== 'demo@partiu.app' || readTrips().length) return;
  writeTrips([
    { id: 'v-porto-belo', city: 'portobelo', query: 'Porto Belo', start: 20261218, end: 20261221, budget: 2600, alloc: [1100, 900, 600], interests: ['natureza', 'praia'], plan: null, updated: 2 },
    { id: 'v-itapema', city: 'itapema', query: 'Itapema', start: 20260912, end: 20260914, budget: 1400, alloc: [600, 500, 300], interests: ['comida', 'relax'], plan: null, updated: 1 }
  ]);
}

function saveTrip() {
  if (!S.plan || !S.start || !S.end) return;
  if (!S.tripId) S.tripId = 'v' + Date.now().toString(36);
  const snap = {
    id: S.tripId, city: S.city, query: S.query, start: S.start, end: S.end, budget: S.budget, alloc: S.alloc,
    interests: [...S.interests], plan: S.plan, updated: Date.now()
  };
  writeTrips([snap, ...readTrips().filter((t) => t.id !== S.tripId)]);
}

function openTrip(id) {
  const t = readTrips().find((x) => x.id === id);
  if (!t) return;
  saveTrip();
  Object.assign(S, { tripId: t.id, city: t.city, query: t.query, start: t.start, end: t.end, budget: t.budget, alloc: t.alloc, interests: new Set(t.interests), sel: null });
  if (t.plan) {
    S.plan = t.plan;
    planSig = [S.city, S.start, S.end, [...S.interests].sort().join()].join('|');
    // os itens guardados mantêm seus ids; o contador continua depois do maior
    const ids = [...t.plan.days.flat(), ...t.plan.sugg, ...t.plan.skipped, ...t.plan.picked].map((x) => +String(x.id).replace(/\D/g, '') || 0);
    planSeq = Math.max(planSeq, ...ids, 0) + 1;
  } else { S.plan = null; planSig = ''; }
  mapPlan = null;
  curDay = 0;
}

// Nova viagem: guarda a atual e começa de novo pelas perguntas.
function newTrip() {
  saveTrip();
  Object.assign(S, { tripId: null, plan: null, maxStep: 0, monthOff: 0, sel: null, start: TODAY, end: null });
  planSig = ''; mapPlan = null;
  go('dest');
}

// Sessão: quem entrou continua dentro ao recarregar a página.
function saveSession() { try { localStorage.setItem(SESSION_KEY, JSON.stringify(S.user || null)); } catch (e) { /* ok */ } }
function loadSession() { try { S.user = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') || undefined; } catch (e) { S.user = undefined; } return !!S.user; }
function endSession() { saveTrip(); try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ok */ } S.user = undefined; S.tripId = null; }
