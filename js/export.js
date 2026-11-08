// Levar o roteiro para fora do app: agenda (arquivo .ics, abre no Google Agenda, Apple e Outlook)
// e Google Maps (rota do dia com todas as paradas, ou um lugar só).
// Horário de Brasília (UTC−3, sem horário de verão): os eventos vão em UTC no arquivo.
const STAY_MIN = { cafe: 60, refeicao: 90, praia: 150, passeio: 120, noite: 120 };
const pad2 = (n) => String(n).padStart(2, '0');
function utcStamp(date, hhmm, addMin = 0) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h + 3, m + addMin));
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;
}
const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
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
