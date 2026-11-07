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
$('introNext').onclick = () => { if (S.slide < 2) { S.slide++; renderIntro(); } else go('dest'); };
$('skip').onclick = () => go('dest');

// Arrastar o botão para a direita também avança, como um controle de deslizar.
(() => {
  const b = $('introNext'); let x0 = null, moved = false;
  b.addEventListener('pointerdown', (e) => { x0 = e.clientX; moved = false; });
  b.addEventListener('pointermove', (e) => { if (x0 == null) return; const dx = Math.max(0, Math.min(140, e.clientX - x0)); if (dx > 4) moved = true; b.querySelector('.go-ic').style.transform = `translateX(${dx}px)`; });
  const end = (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; b.querySelector('.go-ic').style.transform = ''; if (moved && dx > 90) b.click(); };
  b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
})();
