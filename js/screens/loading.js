// Busca de lugares: etapas com tempo variável.
function startLoading() {
  const c = city(), n = plural(nights(), 'noite', 'noites');
  const liked = INTERESTS.filter(([k]) => S.interests.has(k)).map((x) => x[2]);
  const likes = liked.length > 2 ? `${liked[0]}, ${liked[1]} e mais` : liked.join(' e ');
  ensurePlan();
  const found = S.plan.sugg.length;
  // [enquanto roda, quando termina]
  const steps = [
    [`Buscando ${likes} em ${c.name}`, `${c.places.length - 1} lugares encontrados`],
    ['Juntando mapas, avaliações e dicas locais', 'Tudo num lugar só'],
    ['Vendo o que está aberto perto de você', `Dentro de ${money(perDay())} por dia`],
    ['Separando as melhores opções', `${found} sugestões prontas para você`]
  ];
  // Cada etapa leva entre 0,7 s e 1,5 s, para não parecer mecânico.
  const durs = steps.map(() => 700 + Math.random() * 800);
  const total = durs.reduce((a, b) => a + b, 0);
  $('loadTitle').textContent = 'Encontrando lugares';
  $('loadMeta').textContent = `${c.name} · ${rangeLabel()}`;
  $('loadSteps').innerHTML = steps.map((s) => `<li><span class="st">${svg('check', 12, 3)}</span><span>${s[0]}</span></li>`).join('');
  const items = [...$('loadSteps').children];
  const arc = $('loadArc'), C = 2 * Math.PI * 50;
  arc.style.strokeDasharray = C;
  arc.style.strokeDashoffset = C;
  const t0 = performance.now();
  const frame = (t) => {
    const el = t - t0, k = Math.min(1, el / total);
    const e = 1 - Math.pow(1 - k, 1.6);
    arc.style.strokeDashoffset = C * (1 - e);
    $('loadPct').textContent = Math.round(e * 100) + '%';
    let idx = steps.length, acc = 0;
    for (let i = 0; i < durs.length; i++) { if (el < acc + durs[i]) { idx = i; break; } acc += durs[i]; }
    items.forEach((li, i) => {
      const st = i < idx ? 'done' : i === idx ? 'active' : '';
      if (li.className !== st) { li.className = st; li.lastChild.textContent = steps[i][st === 'done' ? 1 : 0]; }
    });
    if (k < 1) { loadRaf = requestAnimationFrame(frame); return; }
    $('loadTitle').textContent = `Encontramos ${found} sugestões`;
    loadTimer = setTimeout(() => { go('plan'); if (!S.plan.days.some((d) => d.length) && !S.plan.picked.length) openChoose(); }, 700 + Math.random() * 300);
  };
  loadRaf = requestAnimationFrame(frame);
}
