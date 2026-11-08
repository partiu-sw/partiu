// Roteiro: escolher lugares por categoria e organizar numa linha do tempo livre.
/* ---------- roteiro: escolher lugares por categoria e depois organizar ---------- */
const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const DAYNAME = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
// Tipos de lugar, na ordem em que a pessoa escolhe. Cada um tem janelas de horário em que faz sentido;
// dentro delas, qualquer horário de 30 em 30 minutos vale.
const TYPES = {
  refeicao: { stage: 'Restaurantes', hint: 'Almoço ou jantar', icon: 'comer', windows: [['11:30', '14:30', 'Almoço'], ['19:00', '22:30', 'Jantar']], prefer: ['12:30', '20:00', '13:00', '19:30'] },
  cafe: { stage: 'Cafés', hint: 'Café da manhã ou da tarde', icon: 'relax', windows: [['07:00', '10:30', 'Café da manhã'], ['15:00', '17:30', 'Café da tarde']], prefer: ['08:30', '16:00'] },
  praia: { stage: 'Praias', hint: 'Melhor durante o dia', icon: 'praia', windows: [['07:00', '18:30', 'Durante o dia']], prefer: ['09:30', '14:30', '16:00'] },
  passeio: { stage: 'Pontos turísticos', hint: 'De manhã ou à tarde', icon: 'ver', windows: [['08:00', '18:30', 'Durante o dia']], prefer: ['10:00', '15:00', '16:30'] },
  noite: { stage: 'Vida noturna', hint: 'Para a noite', icon: 'noite', windows: [['19:00', '23:30', 'Noite']], prefer: ['21:00', '22:00', '20:30'] }
};
const STAGES = Object.keys(TYPES);
const MIN_GAP = 60; // minutos mínimos entre dois lugares no mesmo dia
// Atividades sugeridas a partir dos interesses (exemplos): [nome, detalhe, ícone da foto, tipo]
const GENERIC = {
  praia: [['Manhã de praia', 'Praia', 'praia', 'praia'], ['Pôr do sol na orla', 'Passeio · fim de tarde', 'praia', 'praia'], ['Aula de stand up paddle', 'Praia · 1 h', 'praia', 'praia']],
  comida: [['Almoço de frutos do mar', 'Restaurante', 'comer', 'refeicao'], ['Jantar no centro', 'Restaurante', 'comer', 'refeicao']],
  noite: [['Bar com música ao vivo', 'Vida noturna', 'noite', 'noite'], ['Feirinha noturna da orla', 'Vida noturna · artesanato', 'noite', 'noite']],
  natureza: [['Trilha até o mirante', 'Natureza · 2 h', 'natureza', 'passeio'], ['Observação de golfinhos', 'Natureza · barco', 'natureza', 'passeio']],
  cultura: [['Passeio pelo centro histórico', 'História · a pé', 'ver', 'passeio']],
  compras: [['Tarde de compras', 'Compras', 'compras', 'passeio']],
  aventura: [['Passeio de barco', 'Aventura · 3 h', 'aventura', 'passeio']],
  relax: [['Café da tarde', 'Descanso', 'relax', 'cafe'], ['Spa e massagem', 'Descanso · 1 h', 'relax', 'passeio']]
};
const placeType = (p) => p.cat === 'comer' ? (/caf|padaria/i.test(p.name + ' ' + p.sub) ? 'cafe' : 'refeicao') : /praia/i.test(p.sub) ? 'praia' : 'passeio';

let planSig = '', planSeq = 0, flashId = null, curDay = 0, stage = STAGES[0];
const dayDate = (d) => { const x = dateOf(S.start); x.setDate(x.getDate() + d); return x; };
const dayShort = (d) => { const x = dayDate(d); return `${WEEK[x.getDay()]}, ${x.getDate()} ${MON[x.getMonth()]}`; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chosen = () => [...S.plan.picked, ...S.plan.days.flat()];
const hotelLL = () => city().places[0].ll;
const typeIcon = (it, size = 14) => svg(TYPES[it.type].icon, size, 2);
const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
const toTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const dayItems = (d) => S.plan.days[d].slice().sort((a, b) => a.time.localeCompare(b.time));
const windowOf = (it, t) => TYPES[it.type].windows.find(([a, b]) => toMin(t) >= toMin(a) && toMin(t) <= toMin(b));
const timesOf = ([a, b]) => { const out = []; for (let m = toMin(a); m <= toMin(b); m += 30) out.push(toTime(m)); return out; };
const allTimes = (it) => TYPES[it.type].windows.flatMap(timesOf);

// Um horário não serve se fica a menos de 1 h de outro lugar do dia, ou se já existe uma
// refeição no mesmo período (ninguém almoça duas vezes no mesmo dia).
function conflict(it, d, t, ignore) {
  const others = S.plan.days[d].filter((x) => x !== ignore && x !== it);
  const near = others.find((x) => Math.abs(toMin(x.time) - toMin(t)) < MIN_GAP);
  if (near) return `Perto de ${near.title}`;
  if (it.type === 'refeicao') {
    const w = windowOf(it, t), dup = others.find((x) => x.type === 'refeicao' && windowOf(x, x.time) === w);
    if (dup) return `Já tem ${w[2].toLowerCase()}`;
  }
  return null;
}
// Sugere um horário livre: depois de "afterMin", se informado; senão, os horários mais comuns do tipo.
function suggestTime(it, d, afterMin) {
  const all = allTimes(it);
  const order = afterMin != null ? [...all.filter((t) => toMin(t) >= afterMin), ...all] : [...TYPES[it.type].prefer, ...all];
  return order.find((t) => !conflict(it, d, t)) || null;
}

// Distância e tempo estimado: a pé até ~2 km, de carro acima disso.
function distText(a, b) {
  const m = haversine(a, b);
  const d = m < 1000 ? `${Math.max(50, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  const t = m <= 2000 ? `${Math.max(1, Math.round(m / 80))} min a pé` : `${Math.max(2, Math.round(m / 450))} min de carro`;
  return `${d} · ${t}`;
}
// Previsão na hora da parada: a temperatura sobe até umas 14h e cai depois; chuva à tarde só depois do meio-dia.
function wxAt(d, time) {
  if (typeof wxFor !== 'function') return null;
  const [ic, , max, min] = wxFor(d), h = toMin(time) / 60;
  const k = Math.max(0, 1 - Math.abs(h - 14) / 9);
  return [ic === 'chuva' && h < 12 ? 'parcial' : ic, Math.round(min + (max - min) * k)];
}
// Só o tempo de deslocamento, para caber na linha do cartão
const legText = (a, b) => { const m = haversine(a, b); return m <= 2000 ? `${Math.max(1, Math.round(m / 80))} min a pé` : `${Math.max(2, Math.round(m / 450))} min de carro`; };
const distTag = (it, from, label) => `<span class="dist">${typeIcon(it, 13)}${distText(from, it.ll)}${label ? ` ${label}` : ''}</span>`;

// Foto real do lugar quando houver (photoFor, em core.js); senão, uma ilustração.
const SCENE_KIND = { praia: 'praia', comer: 'comer', ver: 'ver', compras: 'ver', pin: 'ver', natureza: 'natureza', aventura: 'natureza', noite: 'noite', relax: 'relax', dormir: 'relax' };
function scene(icon, title) {
  const ph = photoFor(title);
  if (ph) return `<img src="${ph}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`;
  const k = SCENE_KIND[icon] || 'ver', night = k === 'noite', bg = night ? '#3A3A3F' : '#DEDEE2', st = '#9A9AA0', fl = night ? '#2C2C30' : '#CDCDD2';
  const art = {
    praia: `<circle cx="88" cy="28" r="10" fill="${fl}"/><path d="M0 46H120" stroke="${st}"/><path d="M0 56q10-5 20 0t20 0t20 0t20 0t20 0t20 0" stroke="${st}"/><path d="M0 66q10-5 20 0t20 0t20 0t20 0t20 0t20 0" stroke="${st}" opacity=".6"/>`,
    comer: `<circle cx="60" cy="42" r="24" fill="#E9E9EC" stroke="${st}"/><circle cx="60" cy="42" r="15" stroke="${st}"/><path d="M26 22v40M22 22v10a4 4 0 0 0 8 0V22M96 62V22c-4 2-6 8-6 15v5h6" stroke="${st}"/>`,
    ver: `<path d="M30 34L60 20L90 34Z" fill="${fl}" stroke="${st}"/><path d="M36 38V62M48 38V62M60 38V62M72 38V62M84 38V62M28 66H92" stroke="${st}"/>`,
    natureza: `<circle cx="88" cy="22" r="8" fill="${fl}"/><path d="M-4 80L40 32Q48 24 56 32L100 80Z" fill="${fl}" stroke="${st}"/><path d="M50 80L80 48Q86 42 92 48L126 80Z" fill="#D5D5DA" stroke="${st}"/>`,
    noite: `<path d="M98 14a9 9 0 1 0 8 13a7 7 0 0 1-8-13z" fill="#9A9AA0"/><rect x="10" y="40" width="18" height="40" fill="${fl}"/><rect x="32" y="28" width="20" height="52" fill="${fl}"/><rect x="56" y="46" width="16" height="34" fill="${fl}"/><rect x="76" y="34" width="20" height="46" fill="${fl}"/><g fill="#8E8E94"><rect x="15" y="46" width="3" height="3"/><rect x="38" y="34" width="3" height="3"/><rect x="44" y="44" width="3" height="3"/><rect x="62" y="52" width="3" height="3"/><rect x="82" y="40" width="3" height="3"/><rect x="88" y="52" width="3" height="3"/></g>`,
    relax: `<path d="M38 36h36v12a14 14 0 0 1-14 14h-8a14 14 0 0 1-14-14z" fill="#E9E9EC" stroke="${st}"/><path d="M74 40h4a6 6 0 0 1 0 12h-4M48 30q-4-5 0-10M56 30q-4-5 0-10M64 30q-4-5 0-10" stroke="${st}"/>`
  }[k];
  return `<svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="120" height="80" fill="${bg}"/>${art}</svg>`;
}

// Tudo o que foi encontrado começa na etapa "Escolher lugares"; os dias começam vazios.
// Atividades sem endereço próprio ficam perto de um lugar do mesmo tipo (posição aproximada).
function ensurePlan() {
  const sig = [S.city, S.start, S.end, [...S.interests].sort().join()].join('|');
  if (S.plan && planSig === sig) return;
  planSig = sig;
  const cp = city().places;
  const near = (ty, i) => {
    const same = cp.filter((p, j) => j && placeType(p) === ty), base = (same.length ? same[i % same.length] : cp[0]).ll;
    return [base[0] + 0.0012 * ((i % 3) - 1), base[1] - 0.001];
  };
  const sugg = cp.slice(1).map((p) => ({ title: p.name, sub: p.sub, icon: p.cat, type: placeType(p), ll: p.ll }));
  INTERESTS.forEach(([k]) => { if (S.interests.has(k)) (GENERIC[k] || []).forEach(([t, s, ic, ty], i) => sugg.push({ title: t, sub: s, icon: ic, type: ty, ll: near(ty, sugg.length + i) })); });
  const D = Math.max(2, Math.min(10, nights() + 1));
  S.plan = { days: Array.from({ length: D }, () => []), sugg: sugg.map((s) => ({ ...s, id: 'it' + planSeq++ })), skipped: [], picked: [] };
  curDay = 0;
  stage = STAGES[0];
}

// Dias da viagem num formato só, igual no mapa e no roteiro: dia da semana (ou "Hoje"), número e quantos lugares.
// No mapa, o ícone do clima do dia aparece ao lado do dia da semana.
function dayChipsHTML(sel, attr, withWx) {
  return S.plan.days.map((items, d) => {
    const x = dayDate(d), n = items.length, today = keyOf(x.getFullYear(), x.getMonth(), x.getDate()) === TODAY;
    const wx = withWx && typeof wxFor === 'function' ? svg(wxFor(d)[0], 13, 2) : '';
    return `<button class="day-chip${d === sel ? ' on' : ''}" ${attr}="${d}" aria-pressed="${d === sel}" style="--i:${d}" aria-label="${DAYNAME[x.getDay()]}, ${x.getDate()} de ${MONTHS[x.getMonth()]}: ${plural(n, 'lugar', 'lugares')}"><span class="dc-w">${wx}${today ? 'Hoje' : WEEK[x.getDay()]}</span><b>${x.getDate()}</b><small>${n ? plural(n, 'lugar', 'lugares') : 'livre'}</small></button>`;
  }).join('');
}

/* ---------- etapa 2: linha do tempo livre ---------- */
// Reposiciona os cartões com animação quando a ordem muda (técnica FLIP).
function flip(update) {
  const before = new Map([...document.querySelectorAll('#timeline .ev')].map((el) => [el.dataset.id, el.getBoundingClientRect().top]));
  update();
  document.querySelectorAll('#timeline .ev').forEach((el) => {
    const b = before.get(el.dataset.id);
    const dy = b == null ? 0 : b - el.getBoundingClientRect().top;
    if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
}
function renderPlan(opts = {}) {
  $('planMeta').textContent = `${city().name} · ${rangeLabel()}`;
  // capa da viagem: foto da cidade, datas, total de lugares e o clima do dia escolhido
  const total = S.plan.days.reduce((n, d) => n + d.length, 0), wxd = typeof wxFor === 'function' ? wxFor(curDay) : null;
  $('tripHero').innerHTML = `<img src="${(typeof CITY_PHOTO !== 'undefined' && CITY_PHOTO[S.city]) || 'img/post2.jpg'}" alt="">
    <span class="th-tx"><small>Sua viagem</small><strong>${esc(city().name)}</strong><span>${rangeLabel()} · ${plural(S.plan.days.length, 'dia', 'dias')} · ${plural(total, 'lugar', 'lugares')}</span></span>
    ${wxd ? `<span class="th-wx">${svg(wxd[0], 20, 1.9)}<b>${wxd[2]}°</b><small>${esc(wxd[1])}</small></span>` : ''}`;
  $('dayStrip').innerHTML = dayChipsHTML(curDay, 'data-day');
  const pk = S.plan.picked, h = hotelLL();
  $('tray').hidden = !pk.length;
  $('trayTitle').textContent = `Para organizar (${pk.length})`;
  $('trayRow').innerHTML = pk.map((it) => `
    <button class="tcard" data-pick="${it.id}" aria-label="Escolher dia e horário para ${esc(it.title)}">
      <span class="tph">${scene(it.icon, it.title + ' ' + it.sub)}</span><strong>${esc(it.title)}</strong>${distTag(it, h)}
    </button>`).join('');
  const x = dayDate(curDay), items = dayItems(curDay);
  const isToday = keyOf(x.getFullYear(), x.getMonth(), x.getDate()) === TODAY, nowMin = typeof NOW === 'string' ? toMin(NOW) : 0;
  $('dayTitle').textContent = `${isToday ? 'Hoje, ' : ''}${isToday ? DAYNAME[x.getDay()].toLowerCase() : DAYNAME[x.getDay()]}, ${x.getDate()} ${MON[x.getMonth()]}`;
  // agenda e Google Maps viram dois botões redondos ao lado do título do dia
  $('dayCount').innerHTML = items.length
    ? `<button class="tl-ic" data-ics="trip" aria-label="Salvar na agenda">${GCAL_IC}</button><a class="tl-ic" href="${mapsDayRoute(curDay)}" target="_blank" rel="noopener" aria-label="Ver a rota do dia no Google Maps">${GMAPS_IC}</a>`
    : '<span>Dia livre</span>';
  const tl = $('timeline');
  if (!items.length) {
    tl.innerHTML = `<div class="tl-empty"><strong>Nada planejado ainda</strong>
      <p>${pk.length ? 'Coloque aqui o que você escolheu, no horário que quiser.' : 'Escolha lugares para montar este dia.'}</p>
      <div class="acts">${pk.length ? '<button class="btn-out" data-add="end">Adicionar lugar</button><button class="btn-primary sm" data-auto>Organizar automático</button>' : '<button class="btn-primary sm" data-discover>Escolher lugares</button>'}</div></div>`;
  } else {
    // resumo do dia: quantos lugares, quanto se anda e de que horas a que horas
    let km = 0, pp = h; items.forEach((it) => { km += haversine(pp, it.ll); pp = it.ll; });
    let prev = null, html = `<p class="tl-sum">${plural(items.length, 'parada', 'paradas')} · ${shortDist(km)} · ${items[0].time}–${items[items.length - 1].time}</p>`;
    let nowShown = false;
    items.forEach((it, i) => {
      const wx = wxAt(curDay, it.time), leg = legText(prev ? prev.ll : h, it.ll) + (prev ? '' : ' do hotel');
      // hoje: marca o horário de agora na linha do tempo e o que já passou
      const past = isToday && toMin(it.time) + 60 <= nowMin, live = isToday && !past && toMin(it.time) <= nowMin;
      if (isToday && !nowShown && toMin(it.time) > nowMin) { html += `<div class="tl-now"><span>Agora · ${NOW}</span></div>`; nowShown = true; }
      html += `<div class="ev${i === items.length - 1 ? ' last' : ''}${it.id === flashId ? ' flash' : ''}${past ? ' past' : ''}${live ? ' live' : ''}" data-id="${it.id}" style="--i:${i * 2 + 1}">
          <button class="ev-time" data-time="${it.id}" aria-label="${it.time}, ${esc(it.title)}: mudar dia ou horário">${it.time}${wx ? `<small>${svg(wx[0], 13, 2)}${wx[1]}°</small>` : ''}</button>
          <span class="ev-dot" aria-hidden="true">${past ? svg('check', 11, 3) : i + 1}</span>
          <div class="ev-card">
            <a class="pph ev-map" href="${mapsPlace(it)}" target="_blank" rel="noopener" aria-label="Abrir ${esc(it.title)} no Google Maps">${scene(it.icon, it.title + ' ' + it.sub)}<i>${svg('pin', 11, 2.6)}</i></a>
            <span class="tx"><strong>${esc(it.title)}</strong><span class="dist" title="${esc(it.sub)}">${typeIcon(it, 13)}${leg}</span>${live ? '<span class="ev-tag">Agora</span>' : past ? '<span class="ev-tag done">Feito</span>' : ''}</span>
            <button class="rm" data-rm="${it.id}" aria-label="Tirar ${esc(it.title)} do dia">${svg('x', 15, 2.2)}</button>
            <span class="handle" data-drag="${it.id}" title="Arraste para reordenar">${svg('grip', 16, 2)}</span>
          </div>
        </div>
`;
      prev = it;
    });
    if (isToday && !nowShown) html += `<div class="tl-now"><span>Agora · ${NOW}</span></div>`;
    html += `<button class="ins end" data-add="${toMin(items[items.length - 1].time)}" style="--i:${items.length * 2}">${svg('plus', 14, 2.4)}Adicionar</button>`;
    tl.innerHTML = html;
  }
  if (opts.enter) { tl.classList.remove('enter'); void tl.offsetWidth; tl.classList.add('enter'); } else tl.classList.remove('enter');
  flashId = null;
  const left = S.plan.sugg.length + S.plan.skipped.length;
  $('openDiscover').innerHTML = `${svg('cards', 18, 2)}Escolher${left ? `<i>${left}</i>` : ''}`;
  $('openDiscover').setAttribute('aria-label', `Escolher lugares: ${plural(left, 'sugestão', 'sugestões')}`);
}
$('dayCount').addEventListener('click', (e) => { if (e.target.closest('[data-ics]')) { const n = downloadICS(); toast(n ? `${plural(n, 'evento', 'eventos')} da viagem no arquivo de agenda` : 'Nada no roteiro para salvar ainda'); } });
$('dayStrip').addEventListener('click', (e) => { const c = e.target.closest('[data-day]'); if (c && +c.dataset.day !== curDay) { curDay = +c.dataset.day; renderPlan({ enter: true }); } });
$('trayRow').addEventListener('click', (e) => {
  const c = e.target.closest('[data-pick]');
  if (c) openWhen({ mode: 'time', item: S.plan.picked.find((p) => p.id === c.dataset.pick), day: curDay });
});
let dragJustEnded = false;
$('timeline').addEventListener('click', (e) => {
  if (e.target.closest('[data-ics]')) { const n = downloadICS(); return toast(n ? `${plural(n, 'evento', 'eventos')} da viagem no arquivo de agenda` : 'Nada no roteiro para salvar ainda'); }
  if (dragJustEnded) { dragJustEnded = false; return; }
  const t = e.target.closest('[data-time]'), r = e.target.closest('[data-rm]'), add = e.target.closest('[data-add]');
  if (t) openWhen({ mode: 'time', item: S.plan.days[curDay].find((x) => x.id === t.dataset.time), day: curDay });
  else if (r) unplace(r.dataset.rm);
  else if (add) openWhen({ mode: 'add', day: curDay, after: add.dataset.add === 'end' ? null : +add.dataset.add + MIN_GAP });
  else if (e.target.closest('[data-auto]')) autoOrganize();
  else if (e.target.closest('[data-discover]')) openDiscover();
});

let toastT, lastUndo = null;
function toast(msg, undo) {
  lastUndo = undo || null;
  const t = $('toast');
  t.firstElementChild.textContent = msg;
  $('undo').hidden = !undo;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; lastUndo = null; }, 4000);
}
$('undo').onclick = () => { if (lastUndo) lastUndo(); lastUndo = null; $('toast').hidden = true; };

// Coloca um lugar (escolhido ou já no roteiro) num dia e horário.
function placeItem(it, d, t) {
  S.plan.picked = S.plan.picked.filter((p) => p !== it);
  S.plan.days.forEach((list, i) => { S.plan.days[i] = list.filter((x) => x !== it); });
  it.time = t;
  S.plan.days[d].push(it);
  flashId = it.id;
  const sameDay = d === curDay;
  curDay = d;
  if (sameDay) flip(() => renderPlan()); else renderPlan({ enter: true });
}
// Tirar do dia devolve o lugar para "Para organizar".
function unplace(id) {
  const d = S.plan.days.findIndex((list) => list.some((x) => x.id === id)), it = S.plan.days[d].find((x) => x.id === id);
  flip(() => { S.plan.days[d] = S.plan.days[d].filter((x) => x !== it); S.plan.picked.unshift(it); renderPlan(); });
  toast('Voltou para "Para organizar"', () => placeItem(it, d, it.time));
}
// Distribui os escolhidos pelos dias, respeitando as janelas de horário e espalhando tipos iguais.
function autoOrganize() {
  const snap = { days: S.plan.days.map((l) => l.map((x) => ({ x, t: x.time }))), picked: [...S.plan.picked] };
  const left = [];
  for (const it of S.plan.picked) {
    const same = (d) => S.plan.days[d].filter((x) => x.type === it.type).length;
    const order = S.plan.days.map((_, d) => d).sort((a, b) => same(a) - same(b) || S.plan.days[a].length - S.plan.days[b].length || a - b);
    const d = order.find((dd) => suggestTime(it, dd));
    if (d == null) { left.push(it); continue; }
    it.time = suggestTime(it, d);
    S.plan.days[d].push(it);
  }
  const placed = S.plan.picked.length - left.length;
  S.plan.picked = left;
  renderPlan({ enter: true });
  toast(left.length ? `${plural(placed, 'lugar organizado', 'lugares organizados')} · ${left.length} sem horário livre` : plural(placed, 'lugar organizado', 'lugares organizados'),
    () => { S.plan.days = snap.days.map((l) => l.map(({ x, t }) => { x.time = t; return x; })); S.plan.picked = snap.picked; renderPlan({ enter: true }); });
}
$('autoPlace').onclick = autoOrganize;

/* ---------- antes de escolher: na mão ou com as recomendações ---------- */
function openChoose() {
  if (location.hash !== '#/itinerary/choose') history.replaceState(null, '', '#/itinerary/choose');
  const n = S.plan.sugg.length + S.plan.skipped.length + chosen().length;
  $('chooseSub').textContent = `${plural(n, 'lugar', 'lugares')} em ${city().name} para ${plural(S.plan.days.length, 'dia', 'dias')}.`;
  $('choose').hidden = false;
  replay($('choose').querySelector('.choose-body'), 'step-f');
}
function closeChoose() { $('choose').hidden = true; if (location.hash === '#/itinerary/choose') history.replaceState(null, '', '#/itinerary'); }
// Recomendações: até 3 lugares por dia, alternando os tipos, e já organizados nos dias.
function useRecommended() {
  const pool = [...S.plan.sugg, ...S.plan.skipped], take = [], max = S.plan.days.length * 3;
  const types = [...new Set(pool.map((s) => s.type))];
  for (let r = 0; take.length < max && take.length < pool.length; r++) {
    let added = false;
    types.forEach((ty) => { const it = pool.filter((s) => s.type === ty)[r]; if (it && take.length < max) { take.push(it); added = true; } });
    if (!added) break;
  }
  S.plan.sugg = pool.filter((s) => !take.includes(s)); S.plan.skipped = [];
  S.plan.picked.push(...take);
  closeChoose();
  autoOrganize();
}
$('chooseClose').onclick = closeChoose;
$('choose').addEventListener('click', (e) => {
  const c = e.target.closest('[data-choose]');
  if (!c) return;
  if (c.dataset.choose === 'auto') useRecommended(); else { closeChoose(); openDiscover(); }
});

// Arrastar pelo puxador: solte entre dois lugares para reordenar (o horário se ajusta) ou
// num dia da faixa de cima para levar o lugar para aquele dia.
let drag = null;
$('timeline').addEventListener('pointerdown', (e) => {
  const h = e.target.closest('[data-drag]');
  if (!h) return;
  e.preventDefault();
  const ev = h.closest('.ev'), card = ev.querySelector('.ev-card'), r = card.getBoundingClientRect();
  const ghost = card.cloneNode(true);
  ghost.classList.add('ghost');
  Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
  document.body.appendChild(ghost);
  ev.classList.add('dragging');
  drag = { id: ev.dataset.id, ghost, oy: e.clientY, ox: e.clientX, target: null };
  window.addEventListener('pointermove', onDrag);
  window.addEventListener('pointerup', endDrag, { once: true });
  window.addEventListener('pointercancel', endDrag, { once: true });
});
function onDrag(e) {
  drag.ghost.style.transform = `translate(${e.clientX - drag.ox}px, ${e.clientY - drag.oy}px) rotate(1.5deg) scale(1.02)`;
  document.querySelector('#timeline .drop-line')?.remove();
  document.querySelectorAll('.day-chip.drop').forEach((c) => c.classList.remove('drop'));
  const chip = document.elementFromPoint(e.clientX, e.clientY)?.closest('#dayStrip [data-day]');
  if (chip) { chip.classList.add('drop'); drag.target = { day: +chip.dataset.day }; return; }
  const evs = [...document.querySelectorAll('#timeline .ev:not(.dragging)')];
  let idx = evs.length;
  for (let i = 0; i < evs.length; i++) { const b = evs[i].getBoundingClientRect(); if (e.clientY < b.top + b.height / 2) { idx = i; break; } }
  const line = document.createElement('div');
  line.className = 'drop-line';
  if (evs[idx]) evs[idx].before(line); else (evs[evs.length - 1] || $('timeline').firstChild)?.after(line);
  drag.target = { idx };
  const tl = $('timeline'), tr = tl.getBoundingClientRect();
  // a tela inteira do roteiro rola: perto das bordas, desce ou sobe sozinha enquanto arrasta
  const sc = $('plan'), sr = sc.getBoundingClientRect();
  if (e.clientY > sr.bottom - 110) sc.scrollTop += 12; else if (e.clientY < sr.top + 60) sc.scrollTop -= 12;
}
function endDrag() {
  window.removeEventListener('pointermove', onDrag);
  if (!drag) return;
  const { id, ghost, target } = drag;
  drag = null;
  ghost.remove();
  document.querySelector('#timeline .drop-line')?.remove();
  document.querySelectorAll('.day-chip.drop').forEach((c) => c.classList.remove('drop'));
  document.querySelector('#timeline .ev.dragging')?.classList.remove('dragging');
  dragJustEnded = true;
  setTimeout(() => { dragJustEnded = false; }, 0);
  const it = S.plan.days[curDay].find((x) => x.id === id);
  if (!it || !target) return;
  if (target.day != null) {
    if (target.day === curDay) return;
    const t = conflict(it, target.day, it.time) ? suggestTime(it, target.day) : it.time;
    if (!t) return toast(`Sem horário livre para ${it.title} nesse dia`);
    placeItem(it, target.day, t);
    return toast(`${it.title} foi para ${dayShort(target.day)}, ${t}`);
  }
  // Reordenar: procura o horário permitido mais próximo do meio entre os vizinhos.
  const rest = dayItems(curDay).filter((x) => x !== it), before = rest[target.idx - 1], after = rest[target.idx];
  const lo = before ? toMin(before.time) + MIN_GAP : 0, hi = after ? toMin(after.time) - MIN_GAP : 24 * 60;
  const mid = (lo + hi) / 2, ok = allTimes(it).filter((t) => toMin(t) >= lo && toMin(t) <= hi && !conflict(it, curDay, t));
  if (!ok.length) {
    const el = document.querySelector(`#timeline .ev[data-id="${id}"]`);
    el?.classList.add('shake');
    setTimeout(() => el?.classList.remove('shake'), 400);
    return toast(`${TYPES[it.type].hint}: não cabe nesse ponto do dia`);
  }
  const t = ok.sort((a, b) => Math.abs(toMin(a) - mid) - Math.abs(toMin(b) - mid))[0];
  if (t !== it.time) placeItem(it, curDay, t);
}

/* ---------- painel: dia e horário de um lugar / adicionar num ponto do dia ---------- */
let wh = null;
function openWhen(o) { wh = o; $('when').hidden = false; renderWhen(); }
function closeWhen() { $('when').hidden = true; wh = null; }
function renderWhen() {
  const b = $('whenBody'), h = hotelLL();
  if (wh.mode === 'add') {
    const opts = S.plan.picked.map((it) => ({ it, t: suggestTime(it, wh.day, wh.after) })).sort((a, b) => (a.t ? 0 : 1) - (b.t ? 0 : 1));
    $('whenTitle').textContent = `Adicionar em ${dayShort(wh.day)}`;
    $('whenSub').textContent = 'O horário sugerido pode ser trocado depois, tocando nele.';
    b.innerHTML = (opts.length
      ? `<div class="fit-list">${opts.map(({ it, t }) => `<button class="fit-row" data-fit="${it.id}" data-t="${t || ''}" ${t ? '' : 'disabled'}><span class="pph">${scene(it.icon, it.title + ' ' + it.sub)}</span><span class="tx"><strong>${esc(it.title)}</strong>${distTag(it, h, 'do hotel')}</span><em>${t || 'Sem horário'}</em></button>`).join('')}</div>`
      : '<p class="when-empty">Você ainda não tem lugares para organizar.</p>') +
      '<button class="btn-out" data-more>Escolher mais lugares</button>';
    return;
  }
  const it = wh.item, placed = S.plan.days.some((l) => l.includes(it));
  $('whenTitle').textContent = it.title;
  $('whenSub').innerHTML = `${typeIcon(it, 16)}${TYPES[it.type].hint}`;
  b.innerHTML = `<div class="day-strip" data-wdays>${dayChipsHTML(wh.day, 'data-wday')}</div>` +
    TYPES[it.type].windows.map((w) => `<div class="time-win"><span>${w[2]}</span><div class="times">${timesOf(w).map((t) => {
      const cur = placed && wh.day === S.plan.days.findIndex((l) => l.includes(it)) && t === it.time, why = conflict(it, wh.day, t, it);
      return `<button class="time-chip" data-t="${t}" ${why && !cur ? `disabled title="${esc(why)}"` : ''} ${cur ? 'aria-current="true"' : ''}>${t}</button>`;
    }).join('')}</div></div>`).join('') +
    (placed ? `<div class="when-out"><a class="pill" href="${gcalLink(it, S.plan.days.findIndex((l) => l.includes(it)))}" target="_blank" rel="noopener">${GCAL_IC}Google Agenda</a><a class="pill" href="${mapsPlace(it)}" target="_blank" rel="noopener">${GMAPS_IC}Google Maps</a></div><button class="text-btn" data-unplace>Tirar do dia</button>` : '');
}
$('whenBody').addEventListener('click', (e) => {
  const day = e.target.closest('[data-wday]'), chip = e.target.closest('.time-chip'), fit = e.target.closest('[data-fit]');
  if (day) { wh.day = +day.dataset.wday; renderWhen(); return; }
  if (chip && !chip.disabled) { const o = wh; closeWhen(); placeItem(o.item, o.day, chip.dataset.t); return; }
  if (fit && !fit.disabled) { const o = wh; closeWhen(); placeItem(S.plan.picked.find((p) => p.id === fit.dataset.fit), o.day, fit.dataset.t); return; }
  if (e.target.closest('[data-unplace]')) { const it = wh.item; closeWhen(); unplace(it.id); return; }
  if (e.target.closest('[data-more]')) { closeWhen(); openDiscover(); }
});
$('whenClose').onclick = closeWhen;
$('when').addEventListener('click', (e) => { if (e.target === $('when')) closeWhen(); });

/* ---------- etapa 1: escolher lugares, uma categoria por vez (direita = quero ir, esquerda = pular) ---------- */
let lastAct = null, busy = false;
const pendingOf = (ty) => S.plan.sugg.filter((s) => s.type === ty);
const stagesInUse = () => STAGES.filter((k) => [...S.plan.sugg, ...S.plan.skipped, ...chosen()].some((s) => s.type === k));
const nextStage = () => stagesInUse().find((k) => STAGES.indexOf(k) > STAGES.indexOf(stage) && pendingOf(k).length);
function openDiscover() {
  if (!S.plan.sugg.length && S.plan.skipped.length) { S.plan.sugg = S.plan.skipped; S.plan.skipped = []; }
  stage = stagesInUse().find((k) => pendingOf(k).length) || stagesInUse()[0] || STAGES[0];
  $('disc').hidden = false;
  renderDiscover();
}
function closeDiscover() { $('disc').hidden = true; renderPlan(); }
function cardHTML(it, cls) {
  return `<div class="dcard ${cls}" data-id="${it.id}">
    <span class="photo" role="img" aria-label="Foto de ${esc(it.title)}">${scene(it.icon, it.title + ' ' + it.sub)}</span>
    <span class="stamp yes">QUERO IR</span><span class="stamp no">PULAR</span>
    <div class="body">
      <span class="cicon" role="img" aria-label="${TYPES[it.type].hint}">${svg(TYPES[it.type].icon, 20, 2)}</span>
      <span class="tx"><strong>${esc(it.title)}</strong><span class="dist">${svg('dormir', 13, 2)}${distText(hotelLL(), it.ll)} do hotel</span></span>
    </div>
  </div>`;
}
function renderDiscover() {
  const queue = pendingOf(stage), picked = S.plan.picked.length, ty = TYPES[stage];
  $('discCount').textContent = queue.length ? `${ty.stage} · ${plural(queue.length, 'sugestão', 'sugestões')}` : ty.stage;
  $('stages').innerHTML = stagesInUse().map((k) => {
    const n = chosen().filter((c) => c.type === k).length, rest = pendingOf(k).length;
    return `<button class="stage${rest ? '' : ' done'}" data-stage="${k}" aria-current="${k === stage ? 'step' : 'false'}" aria-label="${TYPES[k].stage}: ${plural(n, 'escolhido', 'escolhidos')}, ${rest} para ver">${svg(TYPES[k].icon, 18, 2)}<small>${n}</small></button>`;
  }).join('');
  const [a, b] = queue;
  if (a) {
    $('stack').innerHTML = `${b ? cardHTML(b, 'next') : ''}${cardHTML(a, 'top')}`;
  } else {
    const n = chosen().filter((c) => c.type === stage).length, skippedHere = S.plan.skipped.filter((s) => s.type === stage).length, nx = nextStage();
    $('stack').innerHTML = `
      <div class="stage-done">
        <span class="cicon">${svg(ty.icon, 26, 2)}</span>
        <strong>${ty.stage}: pronto</strong>
        <p>${n ? plural(n, 'escolhido', 'escolhidos') : 'Nenhum escolhido'}</p>
        ${nx ? `<button class="btn-primary" data-next="${nx}">Próximo: ${TYPES[nx].stage}</button>`
          : picked ? `<button class="btn-primary" data-organize>Organizar ${plural(picked, 'lugar', 'lugares')}</button>`
          : '<button class="btn-primary" data-organize>Ver meu roteiro</button>'}
        ${skippedHere ? `<button class="text-btn" data-review="${stage}">Rever ${plural(skippedHere, 'pulado', 'pulados')}</button>` : ''}
      </div>`;
  }
  $('noAct').disabled = $('yesAct').disabled = !a;
  $('undoAct').disabled = !lastAct;
  $('discFoot').hidden = !picked || !a;
  $('goOrganize').textContent = `Organizar ${plural(picked, 'lugar', 'lugares')}`;
}
$('stages').addEventListener('click', (e) => { const s = e.target.closest('[data-stage]'); if (s) { stage = s.dataset.stage; renderDiscover(); } });
$('stack').addEventListener('click', (e) => {
  const nx = e.target.closest('[data-next]'), org = e.target.closest('[data-organize]'), rv = e.target.closest('[data-review]');
  if (nx) { stage = nx.dataset.next; renderDiscover(); }
  if (org) closeDiscover();
  if (rv) {
    const back = S.plan.skipped.filter((s) => s.type === rv.dataset.review);
    S.plan.skipped = S.plan.skipped.filter((s) => s.type !== rv.dataset.review);
    S.plan.sugg.push(...back);
    renderDiscover();
  }
});
function fling(dir) {
  const c = $('stack').querySelector('.dcard.top');
  if (!c) return Promise.resolve();
  c.classList.add('anim');
  c.querySelector(dir > 0 ? '.yes' : '.no').style.opacity = 1;
  c.style.transform = `translate(${dir * 480}px, 30px) rotate(${dir * 24}deg)`;
  c.style.opacity = 0;
  return new Promise((r) => setTimeout(r, 280));
}
async function decide(yes) {
  const it = pendingOf(stage)[0];
  if (!it || busy) return;
  busy = true;
  await fling(yes ? 1 : -1);
  busy = false;
  S.plan.sugg = S.plan.sugg.filter((s) => s !== it);
  (yes ? S.plan.picked : S.plan.skipped).push(it);
  lastAct = { yes, it };
  renderDiscover();
}
function undoLast() {
  const a = lastAct;
  if (!a) return;
  if (a.yes) S.plan.picked = S.plan.picked.filter((p) => p !== a.it);
  else S.plan.skipped = S.plan.skipped.filter((p) => p !== a.it);
  S.plan.sugg.unshift(a.it);
  stage = a.it.type;
  lastAct = null;
  renderDiscover();
}
$('noAct').onclick = () => decide(false);
$('yesAct').onclick = () => decide(true);
$('undoAct').onclick = undoLast;
$('discClose').onclick = closeDiscover;
$('goOrganize').onclick = closeDiscover;
$('openDiscover').onclick = openDiscover;
document.addEventListener('keydown', (e) => {
  if ($('disc').hidden || e.target.matches('input, textarea')) return;
  if (e.key === 'ArrowRight') decide(true);
  if (e.key === 'ArrowLeft') decide(false);
  if (e.key === 'Escape') closeDiscover();
});

let sw = null;
$('stack').addEventListener('pointerdown', (e) => {
  const c = e.target.closest('.dcard.top');
  if (!c || busy) return;
  sw = { c, x: e.clientX, y: e.clientY, dx: 0 };
  c.classList.remove('anim');
  c.setPointerCapture(e.pointerId);
});
$('stack').addEventListener('pointermove', (e) => {
  if (!sw) return;
  sw.dx = e.clientX - sw.x;
  sw.c.style.transform = `translate(${sw.dx}px, ${(e.clientY - sw.y) * 0.3}px) rotate(${sw.dx / 16}deg)`;
  sw.c.querySelector('.yes').style.opacity = Math.max(0, Math.min(1, sw.dx / 90));
  sw.c.querySelector('.no').style.opacity = Math.max(0, Math.min(1, -sw.dx / 90));
});
function endSwipe() {
  if (!sw) return;
  const { c, dx } = sw;
  sw = null;
  if (dx > 90) return decide(true);
  if (dx < -90) return decide(false);
  c.classList.add('anim');
  c.style.transform = '';
  c.querySelectorAll('.stamp').forEach((s) => { s.style.opacity = 0; });
}
$('stack').addEventListener('pointerup', endSwipe);
$('stack').addEventListener('pointercancel', endSwipe);

