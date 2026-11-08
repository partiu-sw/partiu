// Perguntas: destino, datas, orçamento e interesses.
const WAVE = (y, x0 = 0) => `M${x0} ${y} q10 -5 20 0` + ' t20 0'.repeat(12);
// Prédios separados: [esquerda, direita, topo]; janelas em grade regular.
const TOWERS = [[2, 20, 62], [24, 42, 46], [46, 62, 60], [66, 82, 40], [86, 102, 64], [106, 122, 52], [126, 140, 68]];
const WINDOWS = TOWERS.flatMap(([a, b, top]) => {
  const cols = b - a >= 18 ? [a + 4, b - 7] : [(a + b) / 2 - 1.5];
  const out = [];
  for (let y = top + 7; y <= 82; y += 9) cols.forEach((x) => out.push([x, y]));
  return out;
});
// estrela de quatro pontas com lados curvos
const SPARK = (x, y, r, d) => `<path class="st" style="animation-delay:${d}s" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z"/>`;
// pinheiro em gota, com tronco
const PINE = (x, y, h) => `<path class="mtn" d="M${x - 5} ${y} C ${x - 5} ${y - h * 0.45}, ${x - 1.5} ${y - h * 0.8}, ${x} ${y - h} C ${x + 1.5} ${y - h * 0.8}, ${x + 5} ${y - h * 0.45}, ${x + 5} ${y} Z"/><path d="M${x} ${y}v3"/>`;
const BENTO = {
  // pôr do sol no horizonte, gaivotas e mar em movimento
  praia: { cls: 'wide', d: 'Orlas e ilhas', art: `<svg class="art" style="right:14px;top:8px" width="190" height="52" viewBox="0 0 190 52" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs><clipPath id="seaClip"><rect x="0" y="28" width="190" height="24"/></clipPath></defs>
    <g class="gull"><path d="M58 14 q4 -4 8 0 q4 -4 8 0"/></g>
    <g class="gull" style="animation-delay:.5s"><path d="M86 22 q3 -3 6 0 q3 -3 6 0"/></g>
    <g class="rays"><path d="M150 9v-5M139 13l-3-3M161 13l3-3M134 21l-4-1M166 21l4-1"/></g>
    <path d="M136 26a14 14 0 0 1 28 0"/>
    <path d="M4 26H190"/>
    <g clip-path="url(#seaClip)"><g class="w"><path d="${WAVE(35)}" stroke-opacity=".8"/><path d="${WAVE(44, -10)}" stroke-opacity=".4"/></g></g>
  </svg>` },
  // prédios separados com telhados variados, janelas alinhadas, lua e estrelas
  noite: { cls: 'tall', d: 'Bares e baladas', art: `<svg class="art" style="right:12px;top:10px" width="131" height="86" viewBox="0 0 140 92" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path transform="translate(94 0) scale(1.5)" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="1.2"/>
    <g fill="currentColor" stroke="none">${SPARK(16, 14, 4, 0)}${SPARK(52, 24, 3, 0.6)}${SPARK(84, 10, 2.5, 1.1)}${SPARK(36, 36, 2.2, 0.3)}${SPARK(132, 50, 2.5, 0.9)}</g>
    <rect class="mtn" x="2" y="62" width="18" height="32" rx="2"/>
    <rect class="mtn" x="24" y="46" width="18" height="48" rx="2"/><path d="M33 46 V39"/>
    <path class="mtn" d="M46 94 V60 L54 52 L62 60 V94 Z"/>
    <rect class="mtn" x="66" y="40" width="16" height="54" rx="2"/><path d="M74 40 V32"/>
    <path class="mtn" d="M86 94 V64 A8 8 0 0 1 102 64 V94 Z"/>
    <rect class="mtn" x="106" y="52" width="16" height="42" rx="2"/>
    <rect class="mtn" x="126" y="68" width="14" height="26" rx="2"/>
    <g fill="currentColor" stroke="none">${WINDOWS.map(([x, y], i) => `<rect class="win" x="${x}" y="${y}" width="3" height="3.4" rx=".6" style="animation-delay:${(i * 0.43) % 3}s"/>`).join('')}</g>
    <path d="M0 90 H140"/>
  </svg>` },
  comida: { d: 'Frutos do mar e mais', art: `<span class="art wiggle" style="right:14px;top:12px">${svg('comer', 26, 1.8)}</span>` },
  compras: { d: 'Lojas e feirinhas', art: `<span class="art bounce" style="right:14px;top:12px">${svg('compras', 26, 1.8)}</span>` },
  cultura: { d: 'Centros históricos', art: `<svg class="art" style="right:12px;top:8px" width="40" height="36" viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 3V11"/><path class="flag" d="M20 3h9l-2.5 2.6L29 8.2h-9z" fill="currentColor"/><path d="M5 17L20 11L35 17Z"/><path d="M8 19V29M14 19V29M20 19V29M26 19V29M32 19V29"/><path d="M5 31H35M3 34H37"/></svg>` },
  // duas montanhas com pico arredondado e neve, colina com pinheiros e o sol nascendo atrás
  natureza: { cls: 'tall', d: 'Mirantes e parques', art: `<svg class="art" style="left:0;right:0;top:12px;margin:auto" width="140" height="84" viewBox="0 0 140 84" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <circle class="sun" cx="110" cy="22" r="9"/><g class="moonc"><path transform="translate(99 11)" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></g>
    <path class="mtn" d="M50 92 L80 52 Q92 36 104 52 L146 92 Z" stroke-opacity=".5"/>
    <path class="mtn" d="M-6 92 L30 40 Q44 18 58 40 L96 92 Z"/>
    <path d="M25.8 46 L30 40 Q44 18 58 40 L62.4 46 L56 42.5 L50 47 L44 42.5 L38 47 L32 42.5 Z"/>
    <path class="mtn" d="M-4 94 C 30 74, 64 78, 90 82 C 108 76, 126 72, 146 78 V94 Z"/>
    ${PINE(8, 89, 14)}${PINE(19, 86, 18)}${PINE(103, 80, 17)}${PINE(114, 78, 23)}${PINE(125, 76, 18)}${PINE(135, 77, 21)}
  </svg>` },
  aventura: { d: 'Esportes radicais', art: `<svg class="art" style="right:14px;top:12px" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path class="needle" d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>` },
  relax: { cls: 'wide', d: 'Spas e cafés', art: `<svg class="art" style="right:18px;top:8px" width="56" height="54" viewBox="0 0 56 54" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="stm" d="M18 16 q-4 -5 0 -10"/><path class="stm" d="M26 16 q-4 -5 0 -10" style="animation-delay:.5s"/><path class="stm" d="M34 16 q-4 -5 0 -10" style="animation-delay:1s"/><path d="M8 22h32v10a12 12 0 0 1 -12 12h-8a12 12 0 0 1 -12 -12z"/><path d="M40 26h4a5 5 0 0 1 0 10h-4"/></svg>` }
};

/* ---------- perguntas ---------- */
function canNext() {
  if (S.step === 'dest') return !!S.city;
  if (S.step === 'dates') return !!(S.start && S.end);
  if (S.step === 'budget') return S.budget >= 100;
  if (S.step === 'prefs') return S.interests.size > 0;
  return true;
}
function updateFoot() {
  const n = nights();
  let note = '';
  if (S.step === 'dates') note = S.start && S.end ? `${shortDate(S.start)} – ${shortDate(S.end)} · ${plural(n, 'noite', 'noites')}` : S.start ? 'Agora escolha a volta' : 'Escolha a data de ida';
  if (S.step === 'prefs' && !S.interests.size) note = 'Escolha pelo menos um interesse';
  $('qNote').hidden = !note;
  $('qNote').textContent = note;
  $('qNext').disabled = !canNext();
  $('qNext').textContent = S.step === 'prefs' ? 'Ver meu roteiro' : 'Continuar';
  // Orçamento é opcional: na pesquisa, preço pesou pouco na decisão.
  $('qSkip').style.visibility = S.step === 'budget' ? 'visible' : 'hidden';
}
function renderQuiz() {
  const i = QUIZ.indexOf(S.step);
  if (renderQuiz.last !== S.step) { $('quiz').scrollTop = 0; renderQuiz.last = S.step; } // etapa nova começa do topo
  $('qStep').textContent = `Etapa ${i + 1} de 4`;
  $('qProg').innerHTML = QUIZ.map((q, j) => `<button data-step="${j}" class="${j <= i ? 'on' : ''}" ${j > S.maxStep ? 'disabled' : ''} aria-label="Ir para a etapa ${j + 1}"${j === i ? ' aria-current="step"' : ''}><i></i></button>`).join('');
  const b = $('qBody');
  b.scrollTop = 0;
  replay(b, S.stepDir < 0 ? 'step-b' : 'step-f');
  if (S.step === 'dest') {
    b.innerHTML = `
      <div class="q-title"><h1>Para onde você <em>vai?</em></h1><p class="sub">Cidades do litoral catarinense.</p></div>
      <div class="group">
        <label class="label" for="destInput">Destino</label>
        <div class="search">${svg('search', 20, 2.2)}<input id="destInput" type="text" autocomplete="off" placeholder="Buscar cidade" value="${S.query}"></div>
      </div>
      <div class="group"><span class="label">Sugestões</span><div class="rows" id="destList"></div></div>`;
    renderDestList();
  } else if (S.step === 'dates') {
    b.innerHTML = `
      <div class="q-title"><h1>Quando é a <em>viagem?</em></h1><p class="sub">Já chegou? Comece por hoje. Toque na ida e depois na volta.</p></div>
      <div class="group" id="cal"></div>`;
    renderCal();
  } else if (S.step === 'budget') {
    b.innerHTML = `
      <div class="q-title"><h1>Quanto quer <em>gastar?</em></h1><p class="sub">Só uma referência para as sugestões. Dá para mudar depois.</p></div>
      <div class="ring">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="trk" cx="100" cy="100" r="86"/>${ALLOC.map((a) => `<circle class="seg" cx="100" cy="100" r="86" stroke="${a[2]}"/>`).join('')}</svg>
        <div class="ring-center">
          <p class="amount-view" aria-live="polite"><span>R$</span><b id="budgetTotal"></b></p>
          <small id="budgetDay"></small>
        </div>
      </div>
      <div class="total-ctl"><button class="icon-btn" data-act="minus" aria-label="Diminuir o total em R$ 100">${svg('minus', 18, 2.4)}</button><span>Total da viagem</span><button class="icon-btn" data-act="plus" aria-label="Aumentar o total em R$ 100">${svg('plus', 18, 2.4)}</button></div>
      <div class="quick" id="quick">${[1000, 2000, 3000, 5000].map((v) => `<button class="pill" data-act="quick" data-v="${v}">${money(v)}</button>`).join('')}</div>
      <p class="free" id="free"></p>
      <div class="cat-rows">${ALLOC.map(([k, l, bg], i) => `
        <div class="cat-row" data-i="${i}">
          <i style="background:${bg}"></i><b>${svg(k, 16, 2)}${l}</b>
          <button class="icon-btn" data-act="catMinus" data-i="${i}" aria-label="Diminuir ${l.toLowerCase()} em R$ 100">${svg('minus', 16, 2.4)}</button>
          <input class="cat-in" data-cat="${i}" type="text" inputmode="numeric" autocomplete="off" aria-label="Valor para ${l.toLowerCase()}">
          <button class="icon-btn" data-act="catPlus" data-i="${i}" aria-label="Aumentar ${l.toLowerCase()} em R$ 100">${svg('plus', 16, 2.4)}</button>
        </div>`).join('')}
      </div>
`;
    renderBudget();
  } else if (S.step === 'prefs') {
    b.innerHTML = `
      <div class="q-title"><h1>O que você <em>curte?</em></h1><p class="sub">Toque nas fotos. Quantas quiser.</p></div>
      <div class="group">
        <div class="group-head"><span class="label">Interesses</span><span class="label" id="intCount"></span></div>
        <div class="ints">${INTERESTS.map(([k, l], i) => `
          <button class="int" data-act="interest" data-k="${k}" aria-pressed="${S.interests.has(k)}" style="--i:${i}">
            <img src="${INT_PIC[k]}" alt="" loading="lazy"><span class="int-ok">${svg('check', 14, 3)}</span>
            <span class="int-tx"><b>${l}</b><small>${BENTO[k].d}</small></span>
          </button>`).join('')}
        </div>
      </div>`;
    renderPrefs();
  }
  updateFoot();
}

// fotos de cada interesse (do litoral), para escolher vendo o lugar
const INT_PIC = { praia: 'img/laranjeiras.jpg', noite: 'img/bar.jpg', comida: 'img/mar-brasa.jpg', compras: 'img/praia-central.jpg', cultura: 'img/igreja-porto-belo.jpg', natureza: 'img/praia-grossa.jpg', aventura: 'img/golfinhos.jpg', relax: 'img/cafe.jpg' };

function renderDestList() {
  const q = norm(S.query);
  const exact = CITIES.find((c) => norm(c.name) === q);
  // foto e frase de cada cidade na escolha do destino
  const CITY_PIC = { bc: 'img/praia-central.jpg', itapema: 'img/post1.jpg', portobelo: 'img/bombas.jpg', tijucas: 'img/rio-tijucas.jpg' };
  const CITY_SUB = { bc: 'Orla, bondinho e vida noturna', itapema: 'Meia Praia e praias de trilha', portobelo: 'Ilha, mar calmo e ostras', tijucas: 'Centro histórico e beira-rio' };
  const list = exact || !q ? CITIES : CITIES.filter((c) => norm(c.name).includes(q));
  $('destList').innerHTML = list.length ? list.map((c) => `
    <button class="row-btn" data-act="city" data-id="${c.id}" aria-pressed="${c.id === S.city}">
      <span class="ic city-ph"><img src="${CITY_PIC[c.id] || 'img/post2.jpg'}" alt=""></span>
      <span class="tx"><strong>${c.name}</strong><small>${CITY_SUB[c.id] || 'Santa Catarina'}</small></span>
      ${c.id === S.city ? svg('check', 20, 2.5) : ''}
    </button>`).join('') : '<p class="empty">Ainda não temos esse destino. Tente uma das cidades do litoral catarinense.</p>';
}

function renderCal() {
  const base = new Date(2026, 10 + S.monthOff, 1);
  const y = base.getFullYear(), m = base.getMonth();
  const first = base.getDay(), dim = new Date(y, m + 1, 0).getDate();
  const both = S.start && S.end;
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    const k = keyOf(y, m, d);
    const cls = ['day', k === TODAY && 'today', k === S.start && 's', k === S.end && 'e', both && 'both', both && k > S.start && k < S.end && 'in'].filter(Boolean).join(' ');
    const extra = (k === TODAY ? ', hoje' : '') + (k === S.start ? ', ida' : k === S.end ? ', volta' : '');
    cells += `<button class="${cls}" data-act="day" data-k="${k}" ${k < TODAY ? 'disabled' : ''} aria-label="${d} de ${MONTHS[m]}${extra}"><span>${d}</span></button>`;
  }
  $('cal').innerHTML = `
    <div class="cal-head">
      <strong>${MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1)} de ${y}</strong>
      <div style="display:flex;gap:4px">
        <button class="icon-btn" data-act="prevMonth" aria-label="Mês anterior">${svg('chevL', 18, 2.4)}</button>
        <button class="icon-btn" data-act="nextMonth" aria-label="Próximo mês">${svg('chevR', 18, 2.4)}</button>
      </div>
    </div>
    <div class="cal-week" aria-hidden="true"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
    <div class="cal-grid">${cells}</div>`;
}

// O total é definido pela pessoa (−/+ e valores rápidos); o meio do anel só mostra.
// As categorias dividem esse total: aumentar uma tira dos outras, sem mudar o total.
function renderBudget() {
  if (!Array.isArray(S.alloc) || S.alloc.length !== ALLOC.length) S.alloc = DEFAULT_SPLIT.map((p) => Math.round(S.budget * p / 10) * 10);
  const diff = S.budget - S.alloc.reduce((a, b) => a + b, 0); S.alloc[0] = Math.max(0, S.alloc[0] + diff);
  $('budgetTotal').textContent = S.budget.toLocaleString('pt-BR');
  $('budgetDay').textContent = `${money(perDay())} por dia · ${plural(nights(), 'noite', 'noites')}`;
  document.querySelectorAll('#quick .pill').forEach((p) => p.setAttribute('aria-pressed', +p.dataset.v === S.budget));
  renderCats();
  updateFoot();
}
const RING_C = 2 * Math.PI * 86;
function renderCats() {
  const total = S.budget, big = S.alloc.indexOf(Math.max(...S.alloc));
  $('free').textContent = total ? `Maior parte em ${ALLOC[big][1].toLowerCase()} · ${Math.round(S.alloc[big] / total * 100)}%` : '';
  let start = 0;
  document.querySelectorAll('.ring .seg').forEach((s, i) => {
    const len = total ? S.alloc[i] / total * RING_C : 0, vis = Math.max(0, len - 8);
    s.style.strokeDasharray = `${vis} ${RING_C}`; s.style.strokeDashoffset = -(start + 4); s.style.opacity = vis > 0 ? 1 : 0; start += len;
  });
  document.querySelectorAll('.cat-row').forEach((row) => {
    const i = +row.dataset.i, inp = row.querySelector('.cat-in'), others = total - S.alloc[i];
    if (document.activeElement !== inp) inp.value = money(S.alloc[i]);
    row.querySelector('[data-act="catPlus"]').disabled = others <= 0;
    row.querySelector('[data-act="catMinus"]').disabled = S.alloc[i] <= 0;
  });
}
// muda uma categoria e compensa nas outras, na proporção de cada uma
function setAlloc(i, v) {
  v = Math.max(0, Math.min(S.budget, Math.round(v / 10) * 10));
  let delta = v - S.alloc[i]; S.alloc[i] = v;
  const idx = S.alloc.map((_, k) => k).filter((k) => k !== i);
  while (delta !== 0) {
    const pool = idx.filter((k) => (delta > 0 ? S.alloc[k] > 0 : true));
    if (!pool.length) break;
    const k = pool.sort((a, b) => (delta > 0 ? S.alloc[b] - S.alloc[a] : S.alloc[a] - S.alloc[b]))[0];
    const step = delta > 0 ? Math.min(delta, S.alloc[k], 10) : Math.max(delta, -10);
    S.alloc[k] -= step; delta -= step;
  }
  renderBudget();
}
// total novo: as categorias acompanham na mesma proporção
function setBudget(v) {
  const old = S.budget || 1; S.budget = Math.max(100, Math.min(100000, Math.round(v / 10) * 10));
  S.alloc = S.alloc.map((a) => Math.round(a * S.budget / old / 10) * 10);
  renderBudget();
}

// Atualiza os cartões no lugar, para as transições de seleção rodarem.
function renderPrefs() {
  const b = $('qBody');
  b.querySelectorAll('[data-act="interest"]').forEach((t) => t.setAttribute('aria-pressed', S.interests.has(t.dataset.k)));
  $('intCount').textContent = S.interests.size ? plural(S.interests.size, 'selecionado', 'selecionados') : '';
  updateFoot();
}

$('qBody').addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t || t.disabled) return;
  const act = t.dataset.act;
  if (act === 'city') { const c = CITIES.find((x) => x.id === t.dataset.id); S.city = c.id; S.query = c.name; $('destInput').value = c.name; renderDestList(); updateFoot(); }
  if (act === 'day') {
    const k = +t.dataset.k;
    if (!S.start || S.end) { S.start = k; S.end = null; } else if (k <= S.start) S.start = k; else S.end = k;
    renderCal(); updateFoot();
  }
  if (act === 'prevMonth') { S.monthOff--; renderCal(); }
  if (act === 'nextMonth') { S.monthOff++; renderCal(); }
  if (act === 'quick') setBudget(+t.dataset.v);
  if (act === 'minus') setBudget(S.budget - 100);
  if (act === 'plus') setBudget(S.budget + 100);
  if (act === 'catMinus') setAlloc(+t.dataset.i, S.alloc[+t.dataset.i] - 100);
  if (act === 'catPlus') setAlloc(+t.dataset.i, S.alloc[+t.dataset.i] + 100);
  if (act === 'interest') { const k = t.dataset.k; S.interests.has(k) ? S.interests.delete(k) : S.interests.add(k); renderPrefs(); }
});
$('qBody').addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'destInput') {
    S.query = t.value;
    const exact = CITIES.find((c) => norm(c.name) === norm(t.value));
    S.city = exact ? exact.id : null;
    renderDestList(); updateFoot();
  }
  if (t.classList.contains('cat-in')) {
    const i = +t.dataset.cat, raw = t.value.replace(/\D/g, '');
    setAlloc(i, raw ? +raw : 0);
    t.value = raw ? S.alloc[i].toLocaleString('pt-BR') : '';
  }
});
$('qBody').addEventListener('keydown', (e) => { if (e.target.classList.contains('cat-in') && e.key === 'Enter') e.target.blur(); });
$('qBody').addEventListener('focusin', (e) => { if (e.target.classList.contains('cat-in')) setTimeout(() => e.target.select(), 0); });
$('qBody').addEventListener('focusout', (e) => { if (e.target.classList.contains('cat-in')) setTimeout(renderCats, 0); });

$('qNext').onclick = () => {
  if (!canNext()) return;
  const i = QUIZ.indexOf(S.step);
  go(i < 3 ? QUIZ[i + 1] : 'loading');
};
$('qProg').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  const j = +b.dataset.step;
  if (j > QUIZ.indexOf(S.step) && !canNext()) return;
  go(QUIZ[j]);
};
$('qSkip').onclick = () => { if (S.step === 'budget') go('prefs'); };
$('qBack').onclick = () => {
  const i = QUIZ.indexOf(S.step);
  if (i === 0) { S.slide = 2; go('intro'); } else go(QUIZ[i - 1]);
};
