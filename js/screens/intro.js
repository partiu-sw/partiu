// Apresentação: três telas de boas-vindas.
// Mensagens a partir da pesquisa de rua (nov. 2026): a dor é decidir o que fazer no destino, a informação
// está espalhada em várias fontes e muita coisa foge do plano durante a viagem. Reservar já é fácil.
const SLIDES = [
  { photo: 'img/post2.jpg', title: 'O que fazer, já no destino', text: 'Chegou e não sabe por onde começar? O Partiu sugere o que fazer, onde comer e onde sair perto de você.' },
  { photo: 'img/post3.jpg', title: 'Tudo num lugar só', text: 'Sem pular entre Google, Instagram e o grupo da viagem. Escolha deslizando e o roteiro do dia sai pronto.' },
  { photo: 'img/cafe.jpg', title: 'Mudou o plano? A gente ajusta', text: 'Choveu, lotou ou fechou: o Partiu sugere outra opção perto de você, na hora.' }
];

/* ---------- onboarding ---------- */
function renderIntro(dir = 1) {
  const s = SLIDES[S.slide];
  $('illus').innerHTML = `<img src="${s.photo}" alt="">`;
  $('introTitle').textContent = s.title;
  $('introText').textContent = s.text;
  [...$('dots').children].forEach((d, i) => { d.classList.toggle('on', i === S.slide); if (i === S.slide) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
  $('introNext').innerHTML = `${S.slide < SLIDES.length - 1 ? 'Continuar' : 'Começar agora'}${svg('chevR', 20, 2.4)}`;
  $('skip').style.visibility = S.slide < SLIDES.length - 1 ? 'visible' : 'hidden';
  replay($('illus'), 'swap');
  replay($('introTitle').parentElement, dir < 0 ? 'step-b' : 'swap');
}
function introGo(i) { if (i < 0 || i >= SLIDES.length || i === S.slide) return; const dir = i > S.slide ? 1 : -1; S.slide = i; renderIntro(dir); }
function introAdvance() { if (S.slide < SLIDES.length - 1) introGo(S.slide + 1); else go('dest'); }
$('skip').onclick = () => go('dest');
$('introNext').onclick = introAdvance;
$('dots').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) introGo([...$('dots').children].indexOf(b)); });

// Deslizar a foto para o lado troca de tela, como um carrossel (sem precisar arrastar um botão).
(() => {
  const el = $('intro'); let x0 = null, y0 = 0;
  el.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; x0 = e.clientX; y0 = e.clientY; });
  el.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) introGo(S.slide + (dx < 0 ? 1 : -1));
  });
  el.addEventListener('pointercancel', () => { x0 = null; });
  document.addEventListener('keydown', (e) => {
    if (S.step !== 'intro') return;
    if (e.key === 'ArrowRight') introGo(S.slide + 1);
    if (e.key === 'ArrowLeft') introGo(S.slide - 1);
  });
})();
