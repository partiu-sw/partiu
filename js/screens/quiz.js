// Perguntas: destino, datas, orçamento e interesses.
// Interesses em galeria de fotos: cada um com foto, frase curta e um lugar no mosaico (3 colunas).
// Interesses em galeria: cada um com um ícone de traço (do ICON), frase curta, tamanho do ícone e lugar no mosaico.
const GALLERY = {
  praia: { ic: 'praia', size: 64, d: 'Orlas e ilhas', mv: 'sway' },
  noite: { ic: 'noite', size: 34, d: 'Bares e baladas', mv: 'twinkle' },
  comida: { ic: 'comer', size: 40, d: 'Frutos do mar', mv: 'bob' },
  natureza: { ic: 'natureza', size: 40, d: 'Mirantes e trilhas', mv: 'rise' },
  compras: { ic: 'compras', size: 30, d: 'Feirinhas', mv: 'bob' },
  relax: { ic: 'relax', size: 30, d: 'Cafés e spas', mv: 'steam' },
  cultura: { ic: 'ver', size: 30, d: 'Centros históricos', mv: 'rise' },
  aventura: { ic: 'aventura', size: 30, d: 'Bondinho e tirolesa', mv: 'spin' }
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
      <div class="q-title"><h1>Quando é a <em>viagem?</em></h1><p class="sub">Toque na ida e na volta, ou arraste de um dia ao outro.</p></div>
      <div class="group" id="cal"></div>`;
    renderCal();
  } else if (S.step === 'budget') {
    b.innerHTML = `
      <div class="q-title"><h1>Quanto quer <em>gastar?</em></h1><p class="sub">Só uma referência para as sugestões. Dá para mudar depois.</p></div>
      <div class="ring">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="trk" cx="100" cy="100" r="86"/>${ALLOC.map((a) => `<circle class="seg" cx="100" cy="100" r="86" stroke="${a[2]}"/>`).join('')}</svg>
        <div class="ring-center">
          <p class="amount-view" aria-live="polite"><span>R$</span><b id="budgetTotal"></b></p>
        </div>
      </div>
      <p class="ring-note" id="budgetDay"></p>
      <div class="total-ctl"><button class="icon-btn" data-act="minus" aria-label="Diminuir o total em R$ 100">${svg('minus', 18, 2.4)}</button><span>Total da viagem</span><button class="icon-btn" data-act="plus" aria-label="Aumentar o total em R$ 100">${svg('plus', 18, 2.4)}</button></div>
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
      <div class="q-title"><h1>O que você <em>curte?</em></h1><p class="sub">Toque no que combina com você.</p></div>
      <div class="group">
        <div class="group-head"><span class="label">Interesses</span><span class="label" id="intCount"></span></div>
        <div class="gal">${INTERESTS.map(([k, l], i) => `
          <button class="gal-it" data-act="interest" data-k="${k}" aria-pressed="${S.interests.has(k)}" style="--i:${i};grid-area:${k}">
            <img class="gal-bg" src="${INT_PIC[k]}" alt="" loading="lazy">
            <span class="gal-ic mv-${GALLERY[k].mv}" aria-hidden="true">${svg(GALLERY[k].ic, GALLERY[k].size, 1.6)}</span>
            <span class="gal-ok" aria-hidden="true">${svg('check', 14, 3)}</span>
            <span class="gal-tx"><b>${l}</b><small>${GALLERY[k].d}</small></span>
          </button>`).join('')}
        </div>
      </div>`;
    renderPrefs();
  }
  updateFoot();
}

// ícones animados (traço fino, estilo Airbnb) de cada interesse; cada um tem uma parte que se mexe
const AM = (body) => `<svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
// fotos de cada interesse (do litoral), para escolher vendo o lugar
const INT_PIC = { praia: 'img/laranjeiras.jpg', noite: 'img/bar.jpg', comida: 'img/mar-brasa.jpg', compras: 'img/praia-central.jpg', cultura: 'img/igreja-porto-belo.jpg', natureza: 'img/praia-grossa.jpg', aventura: 'img/barra-sul.jpg', relax: 'img/cafe.jpg' };

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

function renderCal(dir) {
  const base = new Date(2026, 10 + S.monthOff, 1);
  const y = base.getFullYear(), m = base.getMonth();
  const first = base.getDay(), dim = new Date(y, m + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    const k = keyOf(y, m, d);
    cells += `<button class="day${k === TODAY ? ' today' : ''}" data-act="day" data-k="${k}" ${k < TODAY ? 'disabled' : ''}><span>${d}</span></button>`;
  }
  $('cal').innerHTML = `
    <div class="cal-head" data-swipe>
      <strong>${MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1)} de ${y}</strong>
      <div style="display:flex;gap:4px">
        <button class="icon-btn" data-act="prevMonth" aria-label="Mês anterior" ${S.monthOff <= 0 ? 'disabled' : ''}>${svg('chevL', 18, 2.4)}</button>
        <button class="icon-btn" data-act="nextMonth" aria-label="Próximo mês">${svg('chevR', 18, 2.4)}</button>
      </div>
    </div>
    <div class="cal-week" aria-hidden="true" data-swipe><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
    <div class="cal-grid${dir ? (dir < 0 ? ' from-l' : ' from-r') : ''}" id="calGrid">${cells}</div>`;
  paintCal();
}
// Pinta ida, volta e o intervalo nos dias já montados (sem refazer a grade nem a animação de entrada).
function paintCal() {
  const both = S.start && S.end;
  document.querySelectorAll('#calGrid .day').forEach((b) => {
    const k = +b.dataset.k, d = k % 100, mo = Math.floor(k / 100) % 100 - 1;
    b.classList.toggle('s', k === S.start); b.classList.toggle('e', k === S.end);
    b.classList.toggle('both', !!both); b.classList.toggle('in', !!both && k > S.start && k < S.end);
    b.setAttribute('aria-pressed', k === S.start || k === S.end || (!!both && k > S.start && k < S.end));
    b.setAttribute('aria-label', `${d} de ${MONTHS[mo]}${k === TODAY ? ', hoje' : ''}${k === S.start ? ', ida' : k === S.end ? ', volta' : ''}`);
  });
}
function calMonth(step) {
  if (S.monthOff + step < 0 || S.monthOff + step > 12) return;
  S.monthOff += step; renderCal(step);
}
// Arrastar pelos dias marca ida e volta de uma vez; deslizar no título ou na semana troca o mês.
(() => {
  let drag = null;
  const dayAt = (x, y) => { const el = document.elementFromPoint(x, y); const b = el && el.closest('#calGrid .day'); return b && !b.disabled ? +b.dataset.k : null; };
  $('qBody').addEventListener('pointerdown', (e) => {
    if (S.step !== 'dates') return;
    const b = e.target.closest('#calGrid .day');
    if (b && !b.disabled) {
      const k = +b.dataset.k;
      // com só a ida marcada, um dia depois dela vira a volta; senão começa uma escolha nova
      if (S.start && !S.end && k > S.start) { S.end = k; drag = { anchor: S.start, moved: false, id: e.pointerId }; }
      else { S.start = k; S.end = null; drag = { anchor: k, moved: false, id: e.pointerId }; }
      paintCal(); updateFoot();
      e.preventDefault();
      return;
    }
    if (e.target.closest('[data-swipe]')) drag = { swipe: e.clientX, id: e.pointerId };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId || drag.swipe != null) return;
    const k = dayAt(e.clientX, e.clientY);
    if (k == null) return;
    drag.moved = true;
    if (k > drag.anchor) { S.start = drag.anchor; S.end = k; } else if (k < drag.anchor) { S.start = k; S.end = drag.anchor; } else { S.start = drag.anchor; S.end = null; }
    paintCal(); updateFoot();
  });
  window.addEventListener('pointerup', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (drag.swipe != null) { const dx = e.clientX - drag.swipe; if (Math.abs(dx) > 40) calMonth(dx < 0 ? 1 : -1); }
    drag = null;
  });
  window.addEventListener('pointercancel', () => { drag = null; });
})();

// O total é definido pela pessoa (−/+ e valores rápidos); o meio do anel só mostra.
// As categorias dividem esse total: aumentar uma tira dos outras, sem mudar o total.
function renderBudget() {
  if (!Array.isArray(S.alloc) || S.alloc.length !== ALLOC.length) S.alloc = DEFAULT_SPLIT.map((p) => Math.round(S.budget * p / 10) * 10);
  const diff = S.budget - S.alloc.reduce((a, b) => a + b, 0); S.alloc[0] = Math.max(0, S.alloc[0] + diff);
  $('budgetTotal').textContent = S.budget.toLocaleString('pt-BR');
  $('budgetDay').textContent = `${money(perDay())} por dia · ${plural(nights(), 'noite', 'noites')}`;
  renderCats();
  updateFoot();
}
const RING_C = 2 * Math.PI * 86;
function renderCats() {
  const total = S.budget;
  // fatias com pontas retas e o mesmo espaço entre todas (só entre as que têm valor)
  const shown = S.alloc.filter((a) => a > 0).length, GAP = shown > 1 ? 5 : 0;
  let start = 0;
  document.querySelectorAll('.ring .seg').forEach((s, i) => {
    const len = total ? S.alloc[i] / total * RING_C : 0, vis = Math.max(0, len - GAP);
    s.style.strokeDasharray = `${vis} ${RING_C}`; s.style.strokeDashoffset = -(start + GAP / 2); s.style.opacity = vis > 0 ? 1 : 0; start += len;
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
    if (e.detail === 0) { // teclado: Enter/Espaço num dia
      const k = +t.dataset.k;
      if (!S.start || S.end) { S.start = k; S.end = null; } else if (k <= S.start) S.start = k; else S.end = k;
      paintCal(); updateFoot();
    }
  }
  if (act === 'prevMonth') calMonth(-1);
  if (act === 'nextMonth') calMonth(1);
  if (act === 'minus') setBudget(S.budget - 100);
  if (act === 'plus') setBudget(S.budget + 100);
  if (act === 'catMinus') setAlloc(+t.dataset.i, S.alloc[+t.dataset.i] - 100);
  if (act === 'catPlus') setAlloc(+t.dataset.i, S.alloc[+t.dataset.i] + 100);
  if (act === 'interest') { const k = t.dataset.k; S.interests.has(k) ? S.interests.delete(k) : S.interests.add(k); renderPrefs(); t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }
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
