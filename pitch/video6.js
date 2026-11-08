/* Pitch v6 (telas atuais do app, mesma narração do v5): animação quadro a quadro. render(t) desenha o instante t (s); tempos vêm de timeline5.js. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  lin: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  out5: (t) => 1 - Math.pow(1 - t, 5),
  in: (t) => t * t * t,
  io: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t) => (t >= 1 ? 1 : 1 - Math.exp(-6.5 * t) * Math.cos(9.5 * t)),
  back: (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
const P = (t, t0, d, e = 'out') => E[e](clamp((t - t0) / d));
function css(el, { o, x = 0, y = 0, s = 1, r = 0, b }) {
  if (o !== undefined) el.style.opacity = clamp(o);
  el.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;
  if (b !== undefined) el.style.filter = b > 0.1 ? `blur(${b}px)` : 'none';
}
function words(root, t, tin, gap = .1, d = .8, dy = 90) {
  $$('.w', root).forEach((w, i) => { const a = P(t, tin + i * gap, d, 'out5'); css(w, { o: a, y: (1 - a) * dy, b: (1 - a) * 16 }); });
}
function ripple(el, t, t0, max = 1400, d = 1.4) {
  const k = P(t, t0, d, 'out'), live = t >= t0 && t < t0 + d;
  el.style.opacity = live ? (1 - k) * .5 : 0;
  const sz = k * max;
  Object.assign(el.style, { width: sz + 'px', height: sz + 'px', marginLeft: -sz / 2 + 'px', marginTop: -sz / 2 + 'px' });
}
const gray = (k) => `rgb(${lerp(29, 134, k)},${lerp(29, 134, k)},${lerp(31, 139, k)})`;

const S = TL.scenes, A = TL.app, K = TL.K, D = TL.duration;
const SCENES = [['hook', S.hook, S.chaos], ['chaos', S.chaos, S.n1], ['nums', S.n1, S.reveal + .2], ['reveal', S.reveal, S.app + .2],
  ['app', S.app - .4, S.market + .5], ['end', S.end, D]];

/* ---------- caos: fragmentos (mesmos do v3) ---------- */
const ICON = {
  heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#1D1D1F"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
  chat: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20.5l1.4-5A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  pin: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/></svg>',
  cal: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  star: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 3 1.3-6.2L3 9.5l6.3-.7z"/></svg>',
  money: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="6" width="20" height="12" rx="3"/><circle cx="12" cy="12" r="3"/></svg>',
  tabs: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3" y="7" width="14" height="13" rx="2.5"/><path d="M7 4h11.5A2.5 2.5 0 0 1 21 6.5V16"/></svg>',
};
const post = (n, img) => `<div class="card post"><div class="ph" style="background:url(photos/${img}.jpg) center/cover"></div><div class="row">${ICON.heart}${n}</div></div>`;
const tab = (t, d) => `<div class="card tab"><i></i>${t}<b>${d}</b></div>`;
const notif = (title, msg) => `<div class="card notif"><div class="ic">${ICON.chat}</div><div style="flex:1"><strong>${title}<span>agora</span></strong><p>${msg}</p></div></div>`;
const chip = (ic, t, dark) => `<div class="chip${dark ? ' dark' : ''}">${ICON[ic] || ''}${t}</div>`;
const sheet = `<div class="card sheet"><strong>roteiro_final_v3.xlsx</strong><div class="g">${'<span></span>'.repeat(20)}</div></div>`;
const FR = [
  [250, 170, -6, post('Salvo', 'post1'), [-1, -1]],
  [1420, 140, 3, tab('Melhores praias de SC', 'blog'), [1, -1]],
  [1480, 225, -2, tab('Hotéis em Balneário', 'R$ 480'), [1, -1]],
  [1540, 310, 2, tab('Passeio de barco', 'Porto Belo'), [1, -1]],
  [200, 690, 4, sheet, [-1, 1]],
  [620, 110, 5, post('Salvo', 'post2'), [0, -1]],
  [1330, 790, -3, notif('Grupo da viagem', 'e aí, onde a gente vai comer?'), [1, 1]],
  [1620, 470, 6, chip('pin', '23 lugares salvos'), [1, 0]],
  [500, 830, -4, chip('money', 'R$ ??? por dia'), [0, 1]],
  [130, 450, -3, tab('Restaurantes frutos do mar', '4,6'), [-1, 0]],
  [1030, 860, 2, chip('cal', 'Que dia vamos?'), [0, 1]],
  [1360, 600, 3, notif('Grupo da viagem', 'alguém viu o preço do hotel?'), [1, 1]],
  [1010, 120, -5, chip('tabs', '14 abas abertas'), [0, -1]],
  [760, 640, 0, post('Salvo', 'post3'), [0, 1]],
];
const POP = TL.sfx.filter((c) => c[1] === 'pop' && c[0] >= S.chaos && c[0] < S.chaos + 3).map((c) => c[0]);
$('#frags').innerHTML = FR.map((f) => `<div class="abs fr" style="left:${f[0]}px;top:${f[1]}px">${f[3]}</div>`).join('');

/* ---------- números ---------- */
$('#dots').innerHTML = Array.from({ length: 22 }, (_, i) => `<i class="${i >= 15 ? 'e' : ''}"></i>`).join('');
const DOTS = $$('#dots i');

/* ---------- app ---------- */
const SHOTS = ['intro', 'dest', 'dates', 'budget', 'prefs', 'loading', 'discover', 'discover1', 'discover2', 'discover3', 'organize', 'main'];
$('#scr').insertAdjacentHTML('afterbegin', SHOTS.map((s) => `<img data-s="${s}" src="shots6/${s}.png">`).join(''));
const IMG = Object.fromEntries($$('#scr img').map((i) => [i.dataset.s, i]));
const SEQ = [
  [A.dest - .8, 'intro'], [A.dest, 'dest'], [A.dates, 'dates'], [A.budget, 'budget'], [A.prefs, 'prefs'], [A.loading, 'loading'],
  [A.discover, 'discover'], [A.sw1, 'discover1', 'discover'], [A.sw2, 'discover2', 'discover1'], [A.sw3, 'discover3', 'discover2'],
  [A.organize, 'organize'], [A.main, 'main'],
];
// cada passo responde a uma das dúvidas do começo
const CAPS = [
  [S.app, '01', 'Do seu<br>jeito.', 'Destino, datas, orçamento<br>e o que você curte.'],
  [A.loading, '02', 'Pensando<br>por você.', 'Os melhores lugares perto,<br>dentro do orçamento.'],
  [A.discover, '03', 'Escolha<br>deslizando.', 'Ou use as recomendações<br>em um toque.'],
  [A.organize, '04', 'Roteiro pronto,<br>hora a hora.', 'Direto na agenda e no<br>Google Maps.'],
  [A.main, '05', 'Aberto<br>agora.', 'No mapa, com plano B<br>se chover.'],
];
const CH = [
  [A.dest + .3, A.loading, 900, 170, chip('pin', 'Balneário Camboriú')],
  [A.dates + .3, A.loading, 1560, 400, chip('cal', '6 a 9 nov')],
  [A.budget + .3, A.loading, 980, 660, chip('money', 'R$ 2.000')],
  [A.prefs + .3, A.loading, 1530, 800, chip('', 'Praia · Gastronomia', true)],
  [A.loading + 2.2, A.discover, 1500, 820, chip('check', '23 lugares para você', true)],
  [A.sw1 + .15, A.organize, 1560, 300, chip('check', 'Pizzaria Forno da Praia', true)],
  [A.sw2 + .15, A.organize, 1560, 400, chip('check', 'Sorveteria Gelato Mar', true)],
  [A.sw3 + .15, A.organize, 1560, 500, chip('check', 'Sushi Maré da Barra', true)],
  [A.organize + .8, A.main, 930, 470, chip('', '09:30 · Praia Central')],
  [A.organize + 1.2, A.main, 1510, 640, chip('', '15:00 · Cristo Luz')],
  [A.organize + 1.6, A.main, 990, 820, chip('cal', 'Hoje, sexta 6 nov')],
  [A.main + 2.2, S.market - .2, 1500, 230, chip('check', 'Aberto agora · 250 m', true)],
];
$('#chips').innerHTML = CH.map((c) => `<div class="abs ch" style="left:${c[2]}px;top:${c[3]}px">${c[4]}</div>`).join('');
const PINS = [[.236, .20], [.405, .254], [.436, .227], [.67, .34], [.30, .175], [.5, .21]]; // paradas no mapa da tela atual
$('#scr').insertAdjacentHTML('beforeend', PINS.map((p) => `<div class="ripple" style="left:${p[0] * 100}%;top:${p[1] * 100}%"></div>`).join(''));
let capShown = -1;

/* ---------- render ---------- */
function render(t) {
  for (const [id, a, b] of SCENES) $('#' + id).style.visibility = t >= a && t < b ? 'visible' : 'hidden';

  /* 1. gancho */
  if (t < S.chaos) {
    words($('#hk1'), t, .2, .16, .8, 110);
    words($('#hk2'), t, 1.55, .12, .8, 110);
    const out = P(t, K.q1 - .55, .45, 'in');
    css($('#hk1'), { o: 1 - out, y: -out * 160, b: out * 20, s: 1 - out * .1 });
    css($('#hk2'), { o: 1 - out, y: -out * 120, b: out * 20, s: 1 - out * .1 });
    // três dúvidas: entram com mola e ficam inquietas
    [['#q1', K.q1], ['#q2', K.q2], ['#q3', K.q3]].forEach(([q, t0], i) => {
      const a = P(t, t0 - .05, .7, 'spring'), ao = P(t, t0 - .05, .2);
      const jit = P(t, t0 + .6, .5) * Math.sin(t * 9 + i * 2) * 1.2;
      const z = P(t, S.chaos - .45, .45, 'in');
      const dim = (i < 2 ? P(t, [K.q2, K.q3][i], .4) * .55 : 0);
      $(q).style.color = gray(dim);
      css($(q), { o: ao * (1 - z), s: lerp(1.5, 1, a) * (1 + z * .6), y: (1 - a) * 40 + (i - 1) * z * 160, r: jit, b: (1 - ao) * 18 + z * 24 });
    });
  }

  /* 2. caos */
  if (t >= S.chaos && t < S.n1) {
    const u = t - S.chaos, end = S.n1 - .55;
    const collapse = P(t, end, .45, 'in');
    css($('#cam'), { s: lerp(1, 1.1, P(u, 0, 6, 'lin')) * (1 - collapse * .2) });
    $$('#frags .fr').forEach((el, i) => {
      const f = FR[i], t0 = POP[i] ?? (S.chaos + .2 + i * .18);
      const a = P(t, t0 - .05, .7, 'spring'), ao = P(t, t0 - .05, .2);
      const fl = Math.sin(t * 1.6 + i * 1.7) * 8, fr = Math.sin(t * 1.1 + i) * 1.5;
      const blur = P(t, K.lose - .1, .5) * 10;
      const cx = 960 - f[0] - 150, cy = 540 - f[1] - 40;
      css(el, {
        o: ao * (1 - P(t, K.lose - .1, .5) * .82) * (1 - collapse),
        x: (1 - a) * f[4][0] * 700 + cx * collapse,
        y: (1 - a) * f[4][1] * 500 + fl + cy * collapse,
        s: lerp(.6, 1, a) * (1 - collapse * .85),
        r: f[2] * a + fr + (1 - a) * 20 * (i % 2 ? 1 : -1) + collapse * 90,
        b: blur + collapse * 6,
      });
    });
    words($('#never'), t, K.lose, .11, .7, 90);
    // "decidindo." ganha peso no fim
    const no = P(t, end, .45, 'in');
    css($('#never'), { o: 1 - no, s: (1 - no * .7) * (1 + P(t, K.lose, 2.6, 'lin') * .04), b: no * 10 });
  }

  /* 3. validação da dor */
  if (t >= S.n1 && t < S.reveal + .2) {
    const keys = ['n1', 'n2'], ends = [S.n2, S.reveal - .05];
    $$('#nums .stat').forEach((st, i) => {
      const t0 = S[keys[i]], t1 = ends[i];
      const on = t >= t0 - .1 && t < t1 + .6;
      st.style.visibility = on ? '' : 'hidden';
      if (!on) return;
      const z = P(t, t1 - .35, .4, 'in');
      const [num, lab, extra, src, vis] = st.children;
      const a = P(t, t0, .9, 'out5');
      css(num, { o: a * (1 - z), y: (1 - a) * 160 - z * 140, b: (1 - a) * 20 + z * 14 });
      const la = P(t, t0 + .25, .8, 'out5');
      css(lab, { o: la * (1 - z), y: (1 - la) * 60 - z * 100, b: (1 - la) * 10 });
      css(src, { o: P(t, t0 + .6, .6) * (1 - z), y: -z * 80 });
      const va = P(t, t0 + .1, .9, 'out5');
      css(vis, { o: va * (1 - z), s: lerp(.85, 1, va) * (1 - z * .1), y: (1 - va) * 60, b: z * 10 });
      const cnt = $('.cnt', st), target = [68, 59][i], k = P(t, t0 + .1, 1.4, 'out');
      cnt.textContent = Math.round(target * k);
      if (i === 0) {
        DOTS.forEach((d, j) => { const wave = 1 + .09 * Math.sin((t * 1.4 - (j % 6) / 6 - Math.floor(j / 6) / 4) * Math.PI * 2) * P(t, t0 + 1.7, .6); d.style.transform = `scale(${P(t, t0 + .1 + (j / 22) * 1.2, .35, 'back') * wave})`; });
        const h = P(t, K.hours - .1, .7, 'spring');
        css(extra, { o: P(t, K.hours - .1, .15) * (1 - z), s: lerp(.5, 1, h), y: -z * 90 });
      } else {
        $('#arc').style.strokeDashoffset = 1571 * (1 - .59 * k);
        const h = P(t, K.srcs - .1, .7, 'spring');
        css(extra, { o: P(t, K.srcs - .1, .15) * (1 - z), s: lerp(.5, 1, h), y: -z * 90 });
      }
    });
  }

  /* 4. revelação */
  if (t >= S.reveal && t < S.app + .2) {
    const imp = K.impact;
    const d = P(t, imp - .5, .5, 'out'), dz = P(t, imp, .12);
    css($('#dot'), { o: d * (1 - dz), s: lerp(.2, 1.6, d) });
    ripple($('#ring1'), t, imp, 2200, 1.3); ripple($('#ring2'), t, imp + .18, 1500, 1.3);
    $$('#letters .w').forEach((w, i) => { const a = P(t, imp + i * .045, .9, 'out5'); css(w, { o: P(t, imp + i * .045, .25), y: (1 - a) * 120, s: lerp(1.6, 1, a), b: (1 - a) * 22 }); });
    const pp = $('.pinp'); pp.style.strokeDasharray = 60; pp.style.strokeDashoffset = 60 * (1 - P(t, imp, 1, 'io'));
    $('.pind').setAttribute('r', 2.4 * P(t, imp + .7, .6, 'spring'));
    words($('#tag'), t, imp + .9, .06, .7, 50);
    const m = P(t, S.app - .7, .7, 'io');
    css($('#logoBig'), { x: lerp(0, -790, m), y: lerp(0, -330, m), s: lerp(1, .15, m), o: 1 - P(t, S.app - .05, .15) });
    css($('#tag'), { o: 1 - P(t, S.app - .9, .3), y: -P(t, S.app - .9, .4) * 30 });
  }

  /* 5. app */
  if (t >= S.app - .4 && t < S.market + .5) {
    css($('#brand'), { o: P(t, S.app - .05, .2) * (1 - P(t, S.market - .5, .4)) });
    const enter = P(t, S.app, 1.3, 'out5'), straight = P(t, A.main, 1.2, 'io');
    const sway = Math.sin(t * .7) * 2.5, leave = P(t, S.market - .5, .7, 'in');
    const ry = lerp(-35, -14, enter) * (1 - straight) + sway * (1 - straight * .6) + leave * -40;
    const rx = lerp(25, 5, enter) * (1 - straight);
    $('#phone').style.transform = `translate(${leave * 900}px, ${(1 - enter) * 1000 + Math.sin(t * .9) * 8}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${(1 - enter) * 10 + leave * 15}deg) scale(${lerp(1, 1.04, straight)})`;
    let ci = 0; SEQ.forEach((q, i) => { if (t >= q[0]) ci = i; });
    for (const k in IMG) { IMG[k].style.opacity = 0; IMG[k].style.clipPath = 'none'; IMG[k].style.zIndex = 0; IMG[k].style.transform = 'none'; }
    const [ct, cs, sw] = SEQ[ci], prev = SEQ[ci - 1], k = P(t, ct, .55, 'out5');
    if (sw) {
      css(IMG[cs], { o: 1 });
      const im = IMG[sw]; im.style.zIndex = 2;
      im.style.clipPath = 'inset(14.5% 4% 12.5% 4% round 22px)'; // só o cartão de deslizar sai voando
      const m = P(t, ct, .5, 'in');
      css(im, { o: 1 - P(t, ct + .3, .2), x: m * 520, y: -m * 60, r: m * 22 });
    } else if (prev && ci > 0) {
      css(IMG[prev[1]], { o: 1, x: -k * 140 });
      css(IMG[cs], { o: 1, x: (1 - k) * 420 });
      IMG[cs].style.zIndex = 1;
      IMG[cs].style.boxShadow = '-20px 0 40px rgba(0,0,0,.12)';
      if (cs === 'organize' || cs === 'main') {
        const cam = P(t, ct + .3, 4.5, 'io');
        css(IMG[cs], { o: 1, x: (1 - k) * 420, s: lerp(1, 1.08, cam), y: cs === 'organize' ? -cam * 30 : cam * 18 });
      }
    } else css(IMG[cs], { o: 1 });
    $$('#scr .ripple').forEach((r, i) => {
      const t0 = A.main + .6 + i * .2, kk = P(t, t0, .9, 'out');
      r.style.opacity = t >= t0 && t < t0 + .9 ? (1 - kk) * .8 : 0;
      r.style.transform = `scale(${lerp(.3, 2.2, kk)})`;
    });
    let cp = 0; CAPS.forEach((c, i) => { if (t >= c[0] - .05) cp = i; });
    if (cp !== capShown) { const c = CAPS[cp]; $('#capK').textContent = c[1]; $('#capH').innerHTML = c[2]; $('#capS').innerHTML = c[3]; capShown = cp; }
    const c0 = Math.max(CAPS[cp][0], S.app + .4), cn = CAPS[cp + 1] ? CAPS[cp + 1][0] : S.market - .3;
    [['#capK', 0], ['#capH', .07], ['#capS', .16]].forEach(([q, dl]) => {
      const a = P(t, c0 + dl, .75, 'out5'), z = P(t, cn - .4, .35, 'in');
      css($(q), { o: a * (1 - z), y: (1 - a) * 130 - z * 130, b: (1 - a) * 8 });
    });
    $$('#chips .ch').forEach((el, i) => {
      const [ti, to] = CH[i], a = P(t, ti, .7, 'spring'), z = P(t, to - .3, .3, 'in');
      css(el, { o: P(t, ti, .15) * (1 - z), s: lerp(.4, 1, a) * (1 - z * .4), y: (1 - a) * 40 + Math.sin(t * 1.4 + i * 2) * 7 - z * 30, b: z * 8 });
    });
  }

  /* 6. mercado */
  if (t >= S.market && t < S.end + .3) {
    const t0 = S.market + .15, z = P(t, S.end - .35, .4, 'in');
    const a = P(t, t0, .9, 'out5');
    css($('#mNum'), { o: a * (1 - z), y: (1 - a) * 160 - z * 140, b: (1 - a) * 20 + z * 14 });
    const la = P(t, t0 + .25, .8, 'out5');
    css($('#mLab'), { o: la * (1 - z), y: (1 - la) * 60 - z * 100, b: (1 - la) * 10 });
    css($('#mSrc'), { o: P(t, t0 + .6, .6) * (1 - z), y: -z * 80 });
    const va = P(t, t0 + .1, .9, 'out5');
    css($('#mVis'), { o: va * (1 - z), s: lerp(.85, 1, va), y: (1 - va) * 60, b: z * 10 });
    $('#mNum .cnt').textContent = Math.round(60 * P(t, t0 + .15, 1.4, 'out'));
    $('#b1').style.height = 300 * P(t, t0 + .2, 1, 'out5') + 'px';
    $('#b2').style.height = 481 * P(t, t0 + .45, 1.2, 'spring') + 'px';
  }

  /* 7. fim: respostas e logo */
  if (t >= S.end) {
    [['#a1', K.a1], ['#a2', K.a2], ['#a3', K.a3]].forEach(([q, t0], i) => {
      const el = $(q), a = P(t, t0 - .1, .7, 'spring'), z = P(t, K.logo - .35, .3, 'in');
      css(el, { o: P(t, t0 - .1, .2) * (1 - z), y: (1 - a) * 60 + (1 - i) * z * 120, s: lerp(.85, 1, a) * (1 - z * .3), b: z * 14 });
      css($('.ck', el), { s: P(t, t0, .6, 'spring'), r: (1 - P(t, t0, .6, 'out')) * -90 });
    });
    ripple($('#ring3'), t, K.logo, 2400, 1.5);
    const a = P(t, K.logo, 1, 'out5');
    css($('#logoEnd'), { o: P(t, K.logo, .25), s: lerp(1.5, 1, a), b: (1 - a) * 20 });
    css($('#endTag'), { o: P(t, K.logo + .9, .6), y: (1 - P(t, K.logo + .9, .8, 'out5')) * 40 });
    css($('#credits'), { o: P(t, K.logo + 1.4, .6) });
    $('#stage').style.opacity = 1 - P(t, D - .8, .8, 'io');
  } else $('#stage').style.opacity = 1;
  motion(t);
  subtitle(t);
}

/* v5: movimento extra. Câmera que avança em cada cena, entrada com zoom, fundo vivo e flutuação sutil */
const BG = [$('#bg1'), $('#bg2'), $('#bg3')];
function motion(t) {
  for (const [id, a, b] of SCENES) {
    if (t < a || t >= b) continue;
    const u = clamp((t - a) / (b - a)), k = P(t, a, .7, 'out5');
    const push = id === 'app' ? .025 : .06;
    const s = (1 + push * u) * lerp(1.07, 1, k);
    const dx = Math.sin(t * .45 + a) * 14, dy = Math.cos(t * .38 + a) * 10;
    $('#' + id).style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
  }
  BG.forEach((el, i) => {
    const x = 960 + Math.sin(t * (.21 + i * .07) + i * 2.1) * (520 + i * 120);
    const y = 540 + Math.cos(t * (.17 + i * .05) + i * 1.3) * (300 + i * 60);
    const s = 1 + .25 * Math.sin(t * .3 + i);
    el.style.transform = `translate(${x - 600}px, ${y - 600}px) scale(${s})`;
  });
  if (t >= S.n2 && t < S.reveal + .2) $('#arc').closest('svg').style.transform = `rotate(${(t - S.n2) * 14}deg)`;
  const fl = (el, f, amp) => { if (el) el.style.translate = `0 ${Math.sin(t * f) * amp}px`; };
  fl($('#phoneWrap'), 1.1, 10);
  fl($('#mVis'), 1.3, 8);
  $$('#nums .vis').forEach((v, i) => fl(v, 1.2 + i * .2, 10));
}

/* legendas em pill: cada fala dividida em trechos com tempo proporcional ao número de letras */
const SUBS = [];
for (const [k, t0] of Object.entries(TL.voice)) {
  const parts = TL.captions[k].split('|'), dur = NARR[k], total = parts.join('').length;
  let at = t0;
  parts.forEach((p) => { const d = dur * p.length / total; SUBS.push([at, at + d, p]); at += d; });
}
let subShown = '';
function subtitle(t) {
  const el = $('#sub span');
  const endOf = (i) => (SUBS[i + 1] && SUBS[i + 1][0] - SUBS[i][1] < .5 ? SUBS[i + 1][0] - .05 : SUBS[i][1] + .25);
  const i = SUBS.findIndex(([a], j) => t >= a - .05 && t < endOf(j));
  if (i < 0) { el.style.opacity = 0; return; }
  const cur = SUBS[i];
  if (cur[2] !== subShown) { el.textContent = cur[2]; subShown = cur[2]; }
  const joined = SUBS[i + 1] && SUBS[i + 1][0] - cur[1] < .5;
  const a = P(t, cur[0] - .05, .25, 'out5'), z = joined ? 0 : P(t, endOf(i) - .2, .2, 'in');
  css(el, { o: a * (1 - z), y: (1 - a) * 16 + z * 8, s: lerp(.96, 1, a) });
}

window.DURATION = D;
window.ready = Promise.all([document.fonts.ready, ...$$('img').map((i) => i.decode().catch(() => {}))]);
if (!location.search.includes('capture')) {
  const q = new URLSearchParams(location.search), start = +(q.get('t') || 0);
  ready.then(() => { const t0 = performance.now(); const loop = () => { render((start + (performance.now() - t0) / 1000) % D); requestAnimationFrame(loop); }; loop(); });
} else render(0);
