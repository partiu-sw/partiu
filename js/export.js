// Levar o roteiro para fora do app: agenda (arquivo .ics, abre no Google Agenda, Apple e Outlook)
// e Google Maps (rota do dia com todas as paradas, ou um lugar só).
// Horário de Brasília (UTC−3, sem horário de verão): os eventos vão em UTC no arquivo.
const GMAPS_IC = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z" fill="#EA4335"/><path d="M5 9a7 7 0 0 1 2.05-4.95L12 9z" fill="#4285F4"/><path d="M7.05 4.05A7 7 0 0 1 12 2v7z" fill="#1A73E8"/><path d="M12 2a7 7 0 0 1 7 7h-7z" fill="#FBBC04"/><path d="M5 9h7l-5.6 6.2C5.5 13.4 5 11.2 5 9z" fill="#34A853"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>';
const GCAL_IC = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#DADCE0"/><path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3z" fill="#4285F4"/><path d="M17 21h1a3 3 0 0 0 3-3v-1h-4z" fill="#EA4335"/><path d="M21 17V8h-4v9z" fill="#FBBC04"/><path d="M8 21h9v-4H3v1a3 3 0 0 0 3 3z" fill="#34A853"/><text x="10" y="15.2" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="7.2" fill="#1A73E8">31</text></svg>';
const STAY_MIN = { cafe: 60, refeicao: 90, praia: 150, passeio: 120, noite: 120 };
const pad2 = (n) => String(n).padStart(2, '0');
function utcStamp(date, hhmm, addMin = 0) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h + 3, m + addMin));
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;
}
const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
// Rota no Google Maps de onde a pessoa está agora até o lugar (sem origem, o Maps usa a localização atual).
const mapsRoute = (it) => `https://www.google.com/maps/dir/?api=1&destination=${it.ll[0]},${it.ll[1]}`;
const mapsPlace = (it) => `https://www.google.com/maps/search/?api=1&query=${it.ll[0]},${it.ll[1]}`;

// Rota do dia no Google Maps: sai do hotel, passa pelas paradas na ordem e termina na última (a pé).
function mapsDayRoute(d) {
  const items = dayItems(d), h = hotelLL();
  if (!items.length) return null;
  const pt = (ll) => `${ll[0]},${ll[1]}`;
  const last = items[items.length - 1], mid = items.slice(0, -1).map((it) => pt(it.ll)).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${pt(h)}&destination=${pt(last.ll)}${mid ? `&waypoints=${encodeURIComponent(mid)}` : ''}&travelmode=walking`;
}

// Arquivo de agenda com todos os eventos da viagem (ou só de um dia).
function buildICS(onlyDay) {
  const c = city(), stamp = utcStamp(new Date(), new Date().toTimeString().slice(0, 5));
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Partiu//Roteiro//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${icsText('Partiu · ' + c.name)}`];
  S.plan.days.forEach((_, d) => {
    if (onlyDay != null && d !== onlyDay) return;
    const date = dayDate(d);
    dayItems(d).forEach((it, i) => {
      lines.push('BEGIN:VEVENT',
        `UID:${it.id}-${S.tripId || 'viagem'}@partiu.app`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${utcStamp(date, it.time)}`,
        `DTEND:${utcStamp(date, it.time, STAY_MIN[it.type] || 90)}`,
        `SUMMARY:${icsText(it.title)}`,
        `LOCATION:${icsText(`${it.title}, ${c.name}, SC`)}`,
        `GEO:${it.ll[0]};${it.ll[1]}`,
        `DESCRIPTION:${icsText(`${it.sub}\nParada ${i + 1} do dia no roteiro do Partiu.\nComo chegar: ${mapsPlace(it)}`)}`,
        `URL:${mapsPlace(it)}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(it.title + ' em 30 min')}`, 'TRIGGER:-PT30M', 'END:VALARM',
        'END:VEVENT');
    });
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
function downloadICS(onlyDay) {
  const n = onlyDay == null ? S.plan.days.reduce((a, l) => a + l.length, 0) : dayItems(onlyDay).length;
  if (!n) return 0;
  const blob = new Blob([buildICS(onlyDay)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  const slug = norm(city().name).replace(/[^a-z0-9]+/g, '-');
  a.href = URL.createObjectURL(blob);
  a.download = `partiu-${slug}${onlyDay == null ? '' : '-dia-' + (onlyDay + 1)}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return n;
}
// Um evento só no Google Agenda (abre a tela de criar evento já preenchida).
function gcalLink(it, d) {
  const date = dayDate(d), c = city();
  const q = new URLSearchParams({ action: 'TEMPLATE', text: it.title, dates: `${utcStamp(date, it.time)}/${utcStamp(date, it.time, STAY_MIN[it.type] || 90)}`, details: `${it.sub}\nComo chegar: ${mapsPlace(it)}`, location: `${it.title}, ${c.name}, SC` });
  return `https://calendar.google.com/calendar/render?${q}`;
}
