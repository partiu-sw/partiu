// Mapa 3D: MapLibre GL (a versão aberta do Mapbox GL, sem conta e sem token), inclinado e com os prédios em volume.
// Expõe o mesmo pedaço da API do Leaflet que o map.js usa (map, marker, divIcon, polyline, latLngBounds),
// para o resto do código não mudar. Sem WebGL, o map.js continua no Leaflet com os blocos salvos em tiles/.
const PITCH = 55, BEARING = -14;
const GL = (() => {
  const ll2 = (ll) => [ll[1], ll[0]];
  let seq = 0;

  function map(id, o = {}) {
    const m = new maplibregl.Map({
      container: id,
      style: { version: 8, sources: {}, layers: [{ id: 'fundo', type: 'background', paint: { 'background-color': '#F7F4EE' } }] },
      center: [-48.61, -27.13], zoom: 13, pitch: PITCH, bearing: BEARING, maxPitch: 70,
      minZoom: o.minZoom, maxZoom: (o.maxZoom || 16) + 1,
      maxBounds: o.maxBounds && [ll2(o.maxBounds[0]).map((v, i) => v - (i ? 0.02 : 0.03)), ll2(o.maxBounds[1]).map((v, i) => v + (i ? 0.02 : 0.03))],
      attributionControl: false, fadeDuration: 150
    });
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    const lines = new Map(); // linhas ativas: voltam sozinhas quando o estilo troca
    m.on('style.load', () => lines.forEach((add) => add()));
    // créditos começam fechados (o "i" abre)
    m.once('idle', () => { const a = m.getContainer().querySelector('.maplibregl-ctrl-attrib'); if (a) a.classList.remove('maplibregl-compact-show'); });
    const api = {
      gl: m, lines,
      getZoom: () => m.getZoom(),
      invalidateSize: () => m.resize(),
      fitBounds(b, p = {}) {
        const la = b.map((x) => x[0]), lo = b.map((x) => x[1]);
        const [l, t] = p.paddingTopLeft || [0, 0], [r, bt] = p.paddingBottomRight || [0, 0];
        m.fitBounds([[Math.min(...lo), Math.min(...la)], [Math.max(...lo), Math.max(...la)]],
          { padding: { left: l, top: t, right: r, bottom: bt }, maxZoom: p.maxZoom, pitch: m.getPitch(), bearing: m.getBearing(), duration: 900 });
      },
      flyTo(ll, z, o2 = {}) { m.flyTo({ center: ll2(ll), zoom: z, offset: o2.offset || [0, 0], duration: (o2.duration || 0.6) * 1000, essential: true }); },
      setStyle(st) { m.setStyle(st); },
      // alterna entre 3D (inclinado) e 2D (de cima)
      tilt(on) { m.easeTo({ pitch: on ? PITCH : 0, bearing: on ? BEARING : 0, duration: 700 }); }
    };
    return api;
  }

  function marker(ll, o = {}) {
    const ic = o.icon || {}, [w, h] = ic.iconSize || [10, 10], [ax, ay] = ic.iconAnchor || [w / 2, h / 2];
    const el = document.createElement('div');
    el.className = 'map-mk';
    el.style.cssText = `width:${w}px;height:${h}px;z-index:${o.zIndexOffset || 0}`;
    el.innerHTML = ic.html || '';
    if (o.title) { el.title = o.title; el.setAttribute('aria-label', o.title); }
    if (o.interactive === false) el.style.pointerEvents = 'none';
    const mk = new maplibregl.Marker({ element: el, anchor: 'center', offset: [w / 2 - ax, h / 2 - ay] }).setLngLat(ll2(ll));
    const api = {
      on(ev, fn) {
        if (ev !== 'click') return api;
        el.setAttribute('role', 'button');
        if (o.keyboard !== false) el.tabIndex = 0;
        el.addEventListener('click', (e) => { e.stopPropagation(); fn(e); });
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
        return api;
      },
      addTo(m) { mk.addTo(m.gl); return api; },
      remove() { mk.remove(); return api; },
      setLatLng(l) { mk.setLngLat(ll2(l)); return api; },
      getElement: () => el
    };
    return api;
  }

  // Linha (rota): camada GeoJSON. Com animate, "se desenha" do começo ao fim.
  function polyline(pts, o = {}) {
    const id = 'linha' + (++seq), coords = pts.map(ll2);
    let host = null, raf = 0;
    const feat = (c) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
    const add = () => {
      const m = host.gl;
      if (!m.style || !m.style._loaded || m.getSource(id)) return; // estilo pronto (sem esperar os blocos)
      m.addSource(id, { type: 'geojson', data: feat(o.animate ? coords.slice(0, 2) : coords) });
      const paint = { 'line-color': o.color || '#111', 'line-width': o.weight || 3, 'line-opacity': o.opacity ?? 1 };
      if (o.dashArray) paint['line-dasharray'] = o.dashArray.split(/[ ,]+/).map((v) => +v / (o.weight || 3));
      m.addLayer({ id, type: 'line', source: id, layout: { 'line-cap': o.lineCap || 'round', 'line-join': o.lineJoin || 'round' }, paint });
      if (o.animate && coords.length > 2) {
        const t0 = performance.now(), dur = 1100;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), n = Math.max(2, Math.ceil(e * coords.length));
          const src = m.getSource(id); if (!src) return;
          src.setData(feat(coords.slice(0, n)));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
    };
    const api = {
      addTo(m) { host = m; m.lines.set(id, add); add(); return api; },
      remove() {
        cancelAnimationFrame(raf);
        if (!host) return api;
        host.lines.delete(id);
        const m = host.gl;
        if (m.getLayer(id)) m.removeLayer(id);
        if (m.getSource(id)) m.removeSource(id);
        return api;
      },
      getElement: () => null
    };
    return api;
  }

  return { map, marker, polyline, divIcon: (o) => o, latLngBounds: (a) => a };
})();
