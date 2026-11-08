// Botão "Ver no celular" / "Tela cheia" em todas as páginas do projeto (desktop).
// Fica acima de tudo, dá para arrastar para qualquer lugar da tela e lembra a posição e o modo escolhido.
// No app (window.PHONE_NATIVE) o modo celular usa a moldura de iPhone do próprio app;
// nas outras páginas, a página é mostrada dentro de um iPhone (402 × 874, proporção do iPhone 17 Pro).
(() => {
  const qs = new URLSearchParams(location.search);
  // sem barra de rolagem em nenhuma página do projeto (a rolagem continua funcionando)
  const ns = document.createElement('style');
  ns.textContent = 'html, body, * { scrollbar-width: none; } *::-webkit-scrollbar { display: none; width: 0; height: 0; }';
  document.head.appendChild(ns);
  // escala do iPhone: proporção real (402 × 874), diminui inteiro para caber na altura da janela
  const scale = () => document.documentElement.style.setProperty('--phone-k', Math.min(1, (innerHeight - 56) / 874).toFixed(3));
  scale(); addEventListener('resize', scale);
  if (qs.has('inframe')) { // página mostrada dentro do iPhone: conteúdo fixo começa abaixo da Dynamic Island
    const st = document.createElement('style');
    st.textContent = 'html.in-phone .nav { top: 54px !important; } html.in-phone .hero { padding-top: 150px !important; }';
    document.head.appendChild(st); document.documentElement.classList.add('in-phone');
  }
  if (qs.has('embed') || qs.has('inframe') || window.top !== window) return; // dentro de um celular, sem botão
  const MODE = 'partiu.modo', POS = 'partiu.modo.pos';
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ok */ } };
  const html = document.documentElement, native = !!window.PHONE_NATIVE;
  const css = document.createElement('style');
  css.textContent = `
  .vm-btn { display: none; position: fixed; z-index: 2147483000; bottom: 16px; right: 16px; align-items: center; gap: 8px; min-height: 42px; padding: 0 16px 0 14px; border: 1px solid #E8E8EA; border-radius: 999px; background: rgba(255,255,255,.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); color: #111; font: 600 14px -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, Arial, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,.14); cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; transition: box-shadow .2s, transform .2s; }
  .vm-btn:hover { box-shadow: 0 12px 30px rgba(0,0,0,.18); }
  .vm-btn.drag { cursor: grabbing; transform: scale(1.04); transition: none; }
  .vm-btn[aria-pressed="true"] { background: #111; color: #fff; border-color: #111; }
  .vm-btn .grip { opacity: .45; margin-left: 2px; }
  @media (min-width: 900px) { .vm-btn { display: inline-flex; } }
  .vm-overlay { position: fixed; inset: 0; z-index: 2147482000; display: grid; place-items: center; background: #F4F4F5; animation: vm-in .35s cubic-bezier(.2,.8,.2,1); }
  @keyframes vm-in { from { opacity: 0; } }
  .vm-phone { position: relative; width: 402px; height: 874px; zoom: var(--phone-k, 1); border-radius: 58px; overflow: hidden; background: #fff; box-shadow: 0 0 0 11px #0B0B0D, 0 0 0 13px #3B3B40, 0 0 0 14px #1A1A1D, 0 40px 90px rgba(0,0,0,.28); }
  .vm-phone iframe { width: 100%; height: 100%; border: 0; display: block; }
  .vm-island { position: absolute; left: 50%; top: 11px; width: 124px; height: 36px; margin-left: -62px; border-radius: 18px; background: #000; z-index: 2; }
  html.vm-lock, html.vm-lock body { overflow: hidden !important; }`;
  document.head.appendChild(css);
  const PHONE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M11 18.5h2"/></svg>';
  const WIDE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="13" rx="2.5"/><path d="M8 21h8M12 17.5V21"/></svg>';
  const GRIP = '<svg class="grip" width="12" height="18" viewBox="0 0 12 18" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="4" r="1.4"/><circle cx="9" cy="4" r="1.4"/><circle cx="3" cy="9" r="1.4"/><circle cx="9" cy="9" r="1.4"/><circle cx="3" cy="14" r="1.4"/><circle cx="9" cy="14" r="1.4"/></g></svg>';
  const btn = document.createElement('button');
  btn.className = 'vm-btn'; btn.type = 'button'; btn.title = 'Arraste para mudar de lugar';
  document.body.appendChild(btn);
  let overlay = null;
  const isPhone = () => (native ? html.classList.contains('phone-mode') : !!overlay);
  function paint() {
    const on = isPhone();
    btn.innerHTML = (on ? `${WIDE}Tela cheia` : `${PHONE}Ver no celular`) + GRIP;
    btn.setAttribute('aria-pressed', on);
  }
  function apply(on) {
    if (native) {
      html.classList.toggle('phone-mode', on);
      window.dispatchEvent(new Event('partiu:modo'));
    } else if (on && !overlay) {
      const sep = location.search ? '&' : '?';
      overlay = document.createElement('div'); overlay.className = 'vm-overlay';
      overlay.innerHTML = `<div class="vm-phone"><iframe title="Esta página no celular" src="${location.pathname}${location.search}${sep}inframe=1${location.hash}"></iframe><span class="vm-island"></span></div>`;
      document.body.appendChild(overlay); html.classList.add('vm-lock');
    } else if (!on && overlay) { overlay.remove(); overlay = null; html.classList.remove('vm-lock'); }
    set(MODE, on ? 'celular' : 'tela');
    paint();
  }
  // posição guardada, sempre dentro da janela
  function place(x, y) {
    const w = btn.offsetWidth || 160, h = btn.offsetHeight || 42;
    x = Math.max(8, Math.min(innerWidth - w - 8, x)); y = Math.max(8, Math.min(innerHeight - h - 8, y));
    Object.assign(btn.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
    return [x, y];
  }
  const saved = (get(POS) || '').split(',').map(Number);
  paint();
  if (saved.length === 2 && !isNaN(saved[0])) requestAnimationFrame(() => place(saved[0], saved[1]));
  addEventListener('resize', () => { if (btn.style.left) place(parseFloat(btn.style.left), parseFloat(btn.style.top)); });
  let d = null;
  btn.addEventListener('pointerdown', (e) => { const r = btn.getBoundingClientRect(); d = { x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false }; btn.setPointerCapture(e.pointerId); });
  btn.addEventListener('pointermove', (e) => {
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
    d.moved = true; btn.classList.add('drag');
    place(e.clientX - d.ox, e.clientY - d.oy);
  });
  btn.addEventListener('pointerup', () => {
    if (!d) return;
    btn.classList.remove('drag');
    if (d.moved) set(POS, `${parseFloat(btn.style.left)},${parseFloat(btn.style.top)}`); else apply(!isPhone());
    d = null;
  });
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(!isPhone()); } });
  // no app o modo já vem aplicado antes de carregar; nas outras páginas, abre o celular se foi o último modo escolhido
  if (!native && get(MODE) === 'celular' && matchMedia('(min-width: 900px)').matches) apply(true);
})();
