// Busca de lugares: etapas com tempo variável.
// Busca de lugares, no estilo "pensando": fotos dos lugares aparecem em volta do pino, um pensamento curto
// se escreve sozinho de cada vez e uma barra fina mostra o progresso.
function startLoading() {
  const c = city();
  const liked = INTERESTS.filter(([k]) => S.interests.has(k)).map((x) => x[2]);
  ensurePlan();
  const found = S.plan.sugg.length;
  const thoughts = [
    `Olhando ${liked[0] || 'praias'} em ${c.name}`,
    liked[1] ? `Agora ${liked[1]} perto do hotel` : 'Conferindo avaliações e dicas locais',
    'Vendo o que abre nesses horários',
    `Cabendo em ${money(perDay())} por dia`,
    `${found} lugares separados para você`
  ];
  const pics = [...new Set(c.places.concat(S.plan.sugg.map((x) => ({ name: x.title, sub: x.sub }))).map((p) => photoFor(p.name + ' ' + p.sub)).filter(Boolean))].slice(0, 8);
  const orb = $('orbit');
  orb.querySelectorAll('.pic').forEach((x) => x.remove());
  pics.forEach((src, i) => {
    const a = (i / pics.length) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 78 : 104;
    orb.insertAdjacentHTML('beforeend', `<span class="pic" style="--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;--d:${(i * 0.32).toFixed(2)}s;--s:${i % 2 ? 46 : 58}px"><img src="${src}" alt=""></span>`);
  });
  $('loadTitle').innerHTML = 'Pensando<i class="dots"><b>.</b><b>.</b><b>.</b></i>';
  $('loadMeta').textContent = `${c.name} · ${rangeLabel()}`;
  const total = 3600 + Math.random() * 600, per = total / thoughts.length;
  let shown = -1;
  const type = (txt) => { const el = $('loadThought'); el.textContent = ''; let i = 0; clearInterval(type.t); type.t = setInterval(() => { el.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(type.t); }, 22); };
  const t0 = performance.now();
  const frame = (t) => {
    const k = Math.min(1, (t - t0) / total);
    $('loadBar').style.transform = `scaleX(${1 - Math.pow(1 - k, 1.4)})`;
    const idx = Math.min(thoughts.length - 1, Math.floor((t - t0) / per));
    if (idx !== shown) { shown = idx; type(thoughts[idx]); }
    if (k < 1) { loadRaf = requestAnimationFrame(frame); return; }
    $('loadTitle').textContent = 'Pronto!';
    orb.classList.add('done');
    loadTimer = setTimeout(() => { go('plan'); if (!S.plan.days.some((d) => d.length) && !S.plan.picked.length) openChoose(); }, 800);
  };
  orb.classList.remove('done');
  loadRaf = requestAnimationFrame(frame);
}
