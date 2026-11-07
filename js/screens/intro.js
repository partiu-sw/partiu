// Apresentação: três telas de boas-vindas.
// Mensagens a partir da pesquisa de rua (nov. 2026): a dor é decidir o que fazer no destino, a informação
// está espalhada em várias fontes e muita coisa foge do plano durante a viagem. Reservar já é fácil.
const SLIDES = [
  { photo: 'img/post2.jpg', title: 'O que fazer, já no destino', text: 'Chegou e não sabe por onde começar? O Partiu sugere o que fazer, onde comer e onde sair perto de você.' },
  { photo: 'img/post3.jpg', title: 'Tudo num lugar só', text: 'Sem pular entre Google, Instagram e o grupo da viagem. Escolha deslizando e o roteiro do dia sai pronto.' },
  { photo: 'img/cafe.jpg', title: 'Mudou o plano? A gente ajusta', text: 'Choveu, lotou ou fechou: o Partiu sugere outra opção perto de você, na hora.' }
];

/* ---------- onboarding ---------- */
function renderIntro() {
  const s = SLIDES[S.slide];
  $('illus').innerHTML = `<img src="${s.photo}" alt="">`;
  $('introTitle').textContent = s.title;
  $('introText').textContent = s.text;
  [...$('dots').children].forEach((d, i) => d.classList.toggle('on', i === S.slide));
  $('introNext').innerHTML = `<span class="go-ic">${svg('aventura', 20, 2)}</span><span>${S.slide < 2 ? 'Deslize para explorar' : 'Começar agora'}</span><span class="go-arr" aria-hidden="true">››</span>`;
  $('skip').style.visibility = S.slide < 2 ? 'visible' : 'hidden';
  replay($('illus'), 'swap');
  replay($('introTitle').parentElement, 'swap');
}
function introAdvance() { if (S.slide < 2) { S.slide++; renderIntro(); } else go('dest'); }
$('skip').onclick = () => go('dest');

// O botão é um controle de deslizar: arrastar a bolinha até o fim avança. Um toque só mostra o movimento;
// pelo teclado (Enter/Espaço) avança direto.
(() => {
  const b = $('introNext'); let x0 = null, dx = 0, busy = false;
  const knob = () => b.querySelector('.go-ic');
  const max = () => b.clientWidth - knob().offsetWidth - 12;
  const place = (x, anim) => {
    const k = knob(); k.style.transition = anim ? 'transform .28s cubic-bezier(.2, .8, .2, 1)' : 'none';
    k.style.transform = x ? `translateX(${x}px)` : '';
    b.style.setProperty('--slide', (x / max()).toFixed(3));
  };
  b.addEventListener('pointerdown', (e) => { if (busy) return; x0 = e.clientX; dx = 0; b.setPointerCapture(e.pointerId); });
  b.addEventListener('pointermove', (e) => { if (x0 == null) return; dx = Math.max(0, Math.min(max(), e.clientX - x0)); place(dx); });
  const end = () => {
    if (x0 == null) return; x0 = null;
    if (dx > max() * 0.6) {
      busy = true; place(max(), true);
      setTimeout(() => { introAdvance(); busy = false; place(0); }, 260);
    } else if (dx < 6) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); place(0); }
    else place(0, true);
  };
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  b.addEventListener('click', (e) => { if (e.detail === 0) introAdvance(); }); // teclado
})();
