// Feed: publicações de outros viajantes no litoral (exemplo fictício). Curtir, salvar, comentar
// e levar o lugar da foto direto para o roteiro. As interações ficam guardadas no navegador.
const FEED_KEY = 'partiu.feed';
const POSTS = [
  { id: 'p1', who: 'Marina Costa', at: 'marina.viaja', place: 'Praia de Laranjeiras', city: 'Balneário Camboriú', ago: '12 min', photo: 'img/laranjeiras.jpg', text: 'Mar calminho e água verde hoje cedo. Vale ir antes das 10h que ainda tem sombra.', likes: 128, comments: 14, near: true, follow: true, tag: 'Praia' },
  { id: 'p2', who: 'Lucas e Bia', at: 'lucasebia', place: 'Café Grão da Ilha', city: 'Balneário Camboriú', ago: '40 min', photo: 'img/cafe.jpg', text: 'Plano B perfeito pra tarde de chuva. Café passado e pão de queijo saindo do forno.', likes: 86, comments: 9, near: true, follow: false, tag: 'Café' },
  { id: 'p3', who: 'Rafa Nunes', at: 'rafanunes', place: 'Parque Unipraias', city: 'Balneário Camboriú', ago: '1 h', photo: 'img/unipraias.jpg', text: 'Bondinho no fim da tarde. A vista da Barra Sul lá de cima é outra coisa.', likes: 214, comments: 31, near: true, follow: true, tag: 'Passeio' },
  { id: 'p4', who: 'Júlia Prado', at: 'juprado', place: 'Mar & Brasa', city: 'Balneário Camboriú', ago: '2 h', photo: 'img/mar-brasa.jpg', text: 'Peixe na brasa, batata assada e limão. Simples e muito bom, a 5 min da orla.', likes: 97, comments: 12, near: true, follow: false, tag: 'Restaurante' },
  { id: 'p5', who: 'Diego Alves', at: 'diegoalves', place: 'Pôr do sol na Barra', city: 'Itapema', ago: '3 h', photo: 'img/por-do-sol.jpg', text: 'Ontem o céu fez isso aqui. Leva casaco que venta depois das 18h.', likes: 302, comments: 40, near: false, follow: true, tag: 'Mirante' },
  { id: 'p6', who: 'Carol Meirelles', at: 'carolm', place: 'Cristo Luz', city: 'Balneário Camboriú', ago: '5 h', photo: 'img/cristo-luz.jpg', text: 'Subida rápida e a cidade inteira lá embaixo. À noite ele acende.', likes: 77, comments: 6, near: true, follow: false, tag: 'Mirante' },
  { id: 'p7', who: 'Fernanda Rocha', at: 'fe.rocha', place: 'Meia Praia', city: 'Itapema', ago: '25 min', photo: 'img/post1.jpg', text: 'Faixa de areia enorme e água tranquila pra criança. Guarda-sol a R$ 30 o dia.', likes: 64, comments: 8, follow: true, tag: 'Praia' },
  { id: 'p8', who: 'Tiago Martins', at: 'tiagom', place: 'Peixaria do Canto', city: 'Itapema', ago: '1 h', photo: 'img/frutos-mar.jpg', text: 'Sequência de camarão pra dois saiu R$ 140. Chega cedo que enche depois das 13h.', likes: 119, comments: 22, follow: false, tag: 'Restaurante' },
  { id: 'p9', who: 'Paula e Leo', at: 'paulaeleo', place: 'Ilha de Porto Belo', city: 'Porto Belo', ago: '35 min', photo: 'img/post3.jpg', text: 'Barco sai do cais de hora em hora. Água cristalina e dá pra ver peixinho na beira.', likes: 241, comments: 27, follow: true, tag: 'Passeio' },
  { id: 'p10', who: 'Bruna Lopes', at: 'brunalopes', place: 'Ostras da Baía', city: 'Porto Belo', ago: '2 h', photo: 'img/jantar.jpg', text: 'Ostra gratinada com vista pra baía. Reserva pelo WhatsApp no fim de semana.', likes: 88, comments: 11, follow: false, tag: 'Restaurante' },
  { id: 'p11', who: 'André Souza', at: 'andre.souza', place: 'Igreja São Sebastião', city: 'Tijucas', ago: '50 min', photo: 'img/manha-praia.jpg', text: 'Centro pequeno e tranquilo, dá pra fazer tudo a pé. Café do Largo do lado da igreja.', likes: 41, comments: 5, follow: true, tag: 'História' },
  { id: 'p12', who: 'Luiza Prates', at: 'luizap', place: 'Praia do Estaleiro', city: 'Balneário Camboriú', ago: '4 h', photo: 'img/manha-praia.jpg', text: 'Interpraias de manhã cedo é outra praia. Estacionamento lota às 10h.', likes: 156, comments: 18, follow: false, tag: 'Praia' }
];
const STORIES = [['Praias', 'img/manha-praia.jpg'], ['Comer', 'img/frutos-mar.jpg'], ['Pôr do sol', 'img/por-do-sol.jpg'], ['Cafés', 'img/cafe.jpg'], ['Lanches', 'img/lanche.jpg'], ['Passeios', 'img/unipraias.jpg']];
let feedState = null;

function feedData() {
  if (feedState) return feedState;
  try { feedState = JSON.parse(localStorage.getItem(FEED_KEY) || 'null'); } catch (e) { feedState = null; }
  return (feedState = feedState || { liked: [], saved: [], mine: [] });
}
function feedSave() { try { localStorage.setItem(FEED_KEY, JSON.stringify(feedState)); } catch (e) { /* ok */ } }
const initials = (n) => n.split(/\s+/).filter((w) => w.length > 1 && w !== 'e').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const kfmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + ' mil' : String(n));

function renderFeed() {
  const st = feedData(), me = (S.user && S.user.name) || 'Ana';
  $('feedNew').innerHTML = svg('plus', 20, 2.2);
  $('stories').innerHTML = `<button class="story mine" data-compose role="listitem"><span class="story-ring"><span class="story-av">${esc(me[0])}</span><i>${svg('plus', 12, 3)}</i></span><small>Seu dia</small></button>` +
    STORIES.map(([n, ph], i) => `<button class="story" role="listitem" style="--i:${i}" data-story="${esc(n)}"><span class="story-ring"><img src="${ph}" alt=""></span><small>${esc(n)}</small></button>`).join('');
  const all = [...st.mine, ...POSTS];
  // só a cidade da viagem aberta (as suas publicações aparecem sempre)
  const list = all.filter((p) => p.mine || p.city === city().name);
  $('posts').innerHTML = list.length ? list.map((p, i) => postHTML(p, i)).join('') :
    `<div class="tl-empty"><strong>Nada por aqui ainda</strong><p>Seja o primeiro a postar um lugar desta cidade.</p></div>`;
}
function postHTML(p, i) {
  const st = feedData(), liked = st.liked.includes(p.id), saved = st.saved.includes(p.id), added = chosen && S.plan && chosen().some((x) => x.title === p.place);
  return `<article class="post" style="--i:${i}" data-post="${p.id}">
    <div class="post-photo" data-dbl="${p.id}"><img src="${p.photo}" alt="Foto de ${esc(p.place)}" loading="lazy">
      <header class="post-head">
        <span class="post-av${p.mine ? ' me' : ''}">${esc(initials(p.who))}</span>
        <span class="post-who"><strong>${esc(p.who)}</strong><small>${esc(p.ago)}</small></span>
      </header>
      <span class="burst" aria-hidden="true">${svg('heart', 84, 1.6)}</span></div>
    <div class="post-acts">
      <button class="pa like" aria-pressed="${liked}" data-like="${p.id}" aria-label="Curtir">${svg('heart', 22, 2)}<span>${kfmt(p.likes + (liked ? 1 : 0))}</span></button>
      <button class="pa" data-comment="${p.id}" aria-label="Comentários">${svg('chat', 22, 2)}<span>${p.comments}</span></button>
      <button class="pa" data-share="${p.id}" aria-label="Compartilhar">${svg('send', 21, 2)}</button>
      <button class="pa save" aria-pressed="${saved}" data-save="${p.id}" aria-label="Salvar">${svg('bookmark', 22, 2)}</button>
    </div>
    <p class="post-text"><b>${esc(p.at)}</b> ${esc(p.text)}</p>
    <button class="post-add${added ? ' done' : ''}" data-add="${p.id}">${added ? svg('check', 16, 2.6) + 'No seu roteiro' : svg('plus', 16, 2.6) + `Quero ir: ${esc(p.place)}`}</button>
  </article>`;
}
function toggleIn(arr, id) { const i = arr.indexOf(id); if (i < 0) arr.push(id); else arr.splice(i, 1); return i < 0; }
function likePost(id, burst) {
  const st = feedData();
  if (burst && st.liked.includes(id)) { popBurst(id); return; }
  const on = toggleIn(st.liked, id); feedSave();
  const b = $('posts').querySelector(`[data-like="${id}"]`), p = [...st.mine, ...POSTS].find((x) => x.id === id);
  if (b) { b.setAttribute('aria-pressed', on); b.querySelector('span').textContent = kfmt(p.likes + (on ? 1 : 0)); replay(b, 'pop'); }
  if (on && burst) popBurst(id);
}
function popBurst(id) { const el = $('posts').querySelector(`[data-dbl="${id}"] .burst`); if (el) replay(el, 'go'); }
function feedNote(msg) {
  let n = $('feedToast');
  if (!n) { n = document.createElement('div'); n.id = 'feedToast'; n.className = 'feed-toast'; n.setAttribute('role', 'status'); $('feed').appendChild(n); }
  n.textContent = msg; replay(n, 'show');
}

let lastTap = 0;
$('feed').addEventListener('click', (e) => {
  const t = e.target;
  const lk = t.closest('[data-like]'); if (lk) return likePost(lk.dataset.like, false);
  const sv = t.closest('[data-save]'); if (sv) { const on = toggleIn(feedData().saved, sv.dataset.save); feedSave(); sv.setAttribute('aria-pressed', on); replay(sv, 'pop'); return feedNote(on ? 'Salvo para ver depois' : 'Removido dos salvos'); }
  const dbl = t.closest('[data-dbl]');
  if (dbl) { const now = Date.now(); if (now - lastTap < 320) likePost(dbl.dataset.dbl, true); lastTap = now; return; }
  if (t.closest('[data-share]')) return feedNote('Link copiado para compartilhar');
  if (t.closest('[data-comment]')) return feedNote('Comentários chegam na próxima versão');
  const ad = t.closest('[data-add]');
  if (ad) {
    const p = [...feedData().mine, ...POSTS].find((x) => x.id === ad.dataset.add);
    ensurePlan();
    if (!chosen().some((x) => x.title === p.place)) {
      const ty = /praia/i.test(p.tag) ? 'praia' : /caf/i.test(p.tag) ? 'cafe' : /restaurante/i.test(p.tag) ? 'refeicao' : 'passeio';
      const h = city().places[0].ll;
      S.plan.picked.push({ title: p.place, sub: p.tag + ' · ' + p.city, icon: ty === 'praia' ? 'praia' : ty === 'cafe' ? 'relax' : ty === 'refeicao' ? 'comer' : 'ver', type: ty, ll: [h[0] + 0.004, h[1] + 0.002], id: 'it' + planSeq++ });
      saveTrip();
    }
    ad.classList.add('done'); ad.innerHTML = svg('check', 16, 2.6) + 'No seu roteiro'; replay(ad, 'pop');
    return feedNote(`${p.place} foi para "Para organizar" no roteiro`);
  }
  if (t.closest('[data-compose]') || t.closest('#feedNew')) return openCompose();
});

/* ---------- nova publicação: escolhe um lugar do roteiro, a foto vem dele ---------- */
let composePick = null;
function openCompose() {
  ensurePlan();
  const opts = chosen().length ? chosen() : S.plan.sugg.slice(0, 6);
  composePick = opts[0] || null;
  $('composeClose').innerHTML = svg('x', 18, 2.2);
  $('composeBody').innerHTML = `
    <p class="label">Onde você está?</p>
    <div class="chips compose-places">${opts.map((o, i) => `<button class="pill" data-cpick="${o.id}" aria-pressed="${i === 0}">${esc(o.title)}</button>`).join('')}</div>
    <div class="compose-photo" id="composePhoto">${composePick ? `<img src="${photoFor(composePick.title + ' ' + composePick.sub) || 'img/post2.jpg'}" alt="">` : ''}</div>
    <textarea class="compose-text" id="composeText" rows="3" maxlength="220" placeholder="Conte como está sendo..."></textarea>
    <button class="btn-primary" id="composeGo">Publicar</button>`;
  $('compose').hidden = false;
}
function closeCompose() { $('compose').hidden = true; }
$('composeClose').onclick = closeCompose;
$('compose').addEventListener('click', (e) => {
  if (e.target === $('compose')) return closeCompose();
  const c = e.target.closest('[data-cpick]');
  if (c) {
    composePick = chosen().concat(S.plan.sugg).find((x) => x.id === c.dataset.cpick);
    $('composeBody').querySelectorAll('[data-cpick]').forEach((b) => b.setAttribute('aria-pressed', b === c));
    $('composePhoto').innerHTML = `<img src="${photoFor(composePick.title + ' ' + composePick.sub) || 'img/post2.jpg'}" alt="">`;
    return;
  }
  if (e.target.closest('#composeGo')) {
    const txt = $('composeText').value.trim() || 'Aproveitando o dia por aqui.';
    const me = (S.user && S.user.name) || 'Ana';
    const st = feedData();
    st.mine.unshift({ id: 'm' + Date.now(), who: me, at: me.toLowerCase().replace(/\s+/g, ''), place: composePick ? composePick.title : city().name, city: city().name, ago: 'agora', photo: composePick ? photoFor(composePick.title + ' ' + composePick.sub) || 'img/post2.jpg' : 'img/post2.jpg', text: txt, likes: 0, comments: 0, near: true, follow: true, mine: true, tag: 'Você' });
    feedSave();
    closeCompose();
    renderFeed();
    $('feedScroll').scrollTo({ top: 0, behavior: 'smooth' });
    feedNote('Publicado no feed');
  }
});
