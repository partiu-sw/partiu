// Modelo de negócio: comércios parceiros pagam para aparecer em destaque para quem está perto.
// Grátis para o turista; o parceiro ganha visibilidade no mapa, na linha do tempo, no "Perto de você agora"
// e no topo da busca, sempre com o selo "Parceiro" e uma oferta exclusiva de quem usa o Partiu.
// Exemplo fictício: os parceiros são as empresas de exemplo de cada cidade (BIZ, em map.js).
const PARTNERS = {
  'Café Grão da Ilha': { offer: '10% no café com o Partiu', plano: 'Destaque' },
  'Sorveteria Brisa': { offer: 'Casquinha em dobro até 17h', plano: 'Destaque' },
  'Pizzaria Bella Onda': { offer: 'Sobremesa grátis no jantar', plano: 'Destaque' },
  'Mar Aberto Passeios': { offer: 'R$ 20 de desconto no barco', plano: 'Destaque' },
  'Bar Sereia': { offer: 'Chope em dobro até 20h', plano: 'Destaque' },
  'Pedala Bike': { offer: '1 hora grátis no aluguel de 3', plano: 'Destaque' }
};
const partnerOf = (name) => PARTNERS[name] || null;
const isPartner = (p) => !!(p && partnerOf(p.name || p.title));
const partnerPool = () => searchPool().filter(isPartner);
const PARTNER_IC = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z"/></svg>';
const partnerTag = (txt = 'Parceiro') => `<span class="pt-tag">${PARTNER_IC}${txt}</span>`;

// Um parceiro por dia na linha do tempo: o mais perto do roteiro que caiba num horário livre do dia.
function partnerSuggestion(d) {
  if (!S.plan || !S.plan.days[d]) return null;
  const items = dayItems(d), ref = items.length ? items[Math.min(1, items.length - 1)].ll : city().places[0].ll;
  const pool = partnerPool().filter((p) => !inPlan(p)).sort((a, b) => haversine(ref, a.ll) - haversine(ref, b.ll));
  for (const p of pool) {
    const it = { title: p.name, sub: p.sub, icon: p.icon === 'pin' ? 'ver' : p.icon, type: typeFor(p), ll: p.ll, partner: true };
    const t = suggestTime(it, d, items.length ? toMin(items[0].time) : null);
    if (!t) continue;
    const after = items.filter((x) => toMin(x.time) <= toMin(t)).length; // depois de quantas paradas entra
    return { p, it: { ...it, time: t }, after, m: haversine(ref, p.ll) };
  }
  return null;
}

// Cartão "Recomendado para você · Parceiro" que entra na linha do tempo, no horário livre sugerido.
function partnerCardHTML(s, d) {
  if (!s) return '';
  const ph = photoFor(s.p.name + ' ' + s.p.sub), o = partnerOf(s.p.name);
  return `<div class="pt-card" data-ptd="${d}">
    <span class="pt-time">${s.it.time}</span>
    <div class="pt-box">
      <div class="pt-head">${partnerTag()}<span>Recomendado para o seu horário livre</span></div>
      <div class="pt-body">
        <span class="pt-ph">${ph ? `<img src="${ph}" alt="" loading="lazy">` : svg(s.p.icon, 22, 1.8)}</span>
        <span class="tx"><strong>${esc(s.p.name)}</strong><small>${esc(s.p.sub)} · ${shortDist(s.m)} · ★ ${s.p.rating}</small><em class="pt-offer">${esc(o.offer)}</em></span>
      </div>
      <div class="pt-acts">
        <button class="btn-primary sm" data-pt-add="${s.p.id}" data-pt-day="${d}" data-pt-time="${s.it.time}">${svg('plus', 16, 2.4)} Adicionar às ${s.it.time}</button>
        <button class="text-btn" data-pt-map="${s.p.id}">Ver no mapa</button>
      </div>
      <p class="pt-why">Parceiros pagam para aparecer aqui. Você escolhe se quer ir.</p>
    </div>
  </div>`;
}

// Adiciona o parceiro ao dia no horário sugerido e avisa da oferta.
function addPartnerToDay(id, d, t) {
  const p = searchPool().find((x) => x.id === id);
  if (!p || inPlan(p)) return null;
  const it = { title: p.name, sub: p.sub, icon: p.icon === 'pin' ? 'ver' : p.icon, type: typeFor(p), ll: p.ll, partner: true, id: 'it' + planSeq++, time: t };
  S.plan.days[d].push(it);
  flashId = it.id;
  saveTrip();
  return { it, offer: partnerOf(p.name).offer };
}
