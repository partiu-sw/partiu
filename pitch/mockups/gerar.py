"""Gera mockups de celular (PNG transparente) com telas do app, para os slides.

  python3 -I pitch/mockups/gerar.py   (precisa do app servido em http://localhost:8000)
"""
import os, sys, time, io, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from cdp import Chrome
from PIL import Image

B = 'http://localhost:8000/app.html'
SESSION = "localStorage.setItem('partiu.sessao', JSON.stringify({name:'Ana', email:'demo@partiu.app'}))"
# nome, rota, precisa de sessão, ações depois de abrir
SHOTS = [
    ('login', '/login', False, []),
    ('apresentacao', '/welcome', True, []),
    ('datas', '/new-trip/dates', True, []),
    ('interesses', '/new-trip/interests', True, []),
    ('montar', '/itinerary/choose', True, []),
    ('escolher', '/itinerary/discover', True, []),
    ('explorar', '/explore', True, []),
    ('roteiro', '/itinerary', True, []),
    ('feed', '/feed', True, []),
    ('conta', '/account', True, []),
    ('busca', '/explore', True, ["document.getElementById('openSearch').click()"]),
    # onde o comércio pagante (parceiro) aparece no app
    ('parceiro-mapa', '/explore', True, ["setSheet('collapsed'); setTimeout(()=>map.fitBounds([city().places[0].ll,...partnerPool().map(p=>p.ll)],{paddingTopLeft:[50,220],paddingBottomRight:[70,curSheetH()+60],maxZoom:16.3}),400)", "0"]),
    ('parceiro-roteiro', '/itinerary', True, ["document.querySelector('.pt-card').scrollIntoView({block:'center'})"]),
    ('parceiro-oferta', '/explore', True, ["showFound(partnerPool().find(p=>!inPlan(p)))", "0"]),
    ('parceiro-feed', '/feed', True, ["const p=document.querySelector('.post.sponsored'); p.scrollIntoView({block:'start'}); p.parentElement.scrollTop-=60"]),
]
# telas com foto ou mapa até o topo: em vez de descer a tela, só os controles do topo descem
NOTCH = {
    'login': '.lg-top{top:62px!important}',
    'apresentacao': '#intro{padding-top:66px!important}',
    'explorar': ':root{--safe-top:62px!important}',
    'parceiro-mapa': ':root{--safe-top:62px!important}',
    'parceiro-oferta': ':root{--safe-top:62px!important}',
}
LIGHT_BAR = {'login', 'apresentacao'}  # barra de status branca sobre foto
ch = Chrome(390, 844, 2)
ch.send('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=2, mobile=True)
ch.goto(B + f'?z={time.time()}#/login'); time.sleep(1)
ch.js('localStorage.clear()')
screens = {}
for name, route, sess, acts in SHOTS:
    if sess: ch.js(SESSION)
    else: ch.js('localStorage.clear()')
    ch.goto(B + f'?z={time.time()}#{route}'); time.sleep(4.5)
    for a in acts: ch.js(a); time.sleep(2.5)
    ch.js("document.querySelectorAll('.dev-link,.view-toggle').forEach(e => e.remove())")
    # área da barra de status: as telas descem para o conteúdo não ficar embaixo da ilha (notch)
    css = NOTCH.get(name, '.screen{top:18px!important} .phone{background:#fff}')
    ch.js("const st=document.createElement('style');st.textContent=" + repr(css) + ";document.head.appendChild(st)"); time.sleep(.8)
    screens[name] = ch.shot()
    print('tela', name)

# moldura: corpo branco com contorno escuro fino e ilha no topo, fundo transparente
W, H = 860, 1760
ch.send('Emulation.setDeviceMetricsOverride', width=W, height=H, deviceScaleFactor=1, mobile=False)
ch.send('Emulation.setDefaultBackgroundColorOverride', color={'r': 0, 'g': 0, 'b': 0, 'a': 0})
for name, png in screens.items():
    sbc = '#fff' if name in LIGHT_BAR else '#111'
    src = 'data:image/png;base64,' + base64.b64encode(png).decode()
    html = f'''<!doctype html><style>html,body{{margin:0;background:transparent}}
    .ph{{position:absolute;left:20px;top:20px;width:820px;height:1720px;border-radius:120px;background:#fff;box-shadow:0 0 0 5px #1B1F27, 0 0 0 7px #3A3F48}}
    .sc{{position:absolute;left:22px;top:22px;right:22px;bottom:22px;border-radius:100px;overflow:hidden;background:#fff}}
    .sc img{{width:100%;height:100%;object-fit:cover;object-position:top;display:block}}
    .is{{position:absolute;left:50%;top:40px;width:220px;height:62px;margin-left:-110px;border-radius:31px;background:#0B0D10}}
    .sb{{position:absolute;left:22px;right:22px;top:22px;height:96px;display:flex;align-items:center;justify-content:space-between;padding:8px 84px 0 96px;font:600 30px -apple-system,'SF Pro Text',Inter,Arial,sans-serif;color:{sbc};letter-spacing:-.5px}}
    .sb i{{display:inline-flex;gap:10px;align-items:center}}
    .btn{{position:absolute;width:8px;border-radius:4px;background:#2A2F37}}</style>
    <div class="ph"><div class="sc"><img src="{src}"></div><div class="sb"><span>9:41</span><i><svg width="34" height="22" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="{sbc}"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="{sbc}"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="{sbc}"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="{sbc}"/></svg><svg width="50" height="24" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="{sbc}" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="1.8" fill="{sbc}"/><rect x="22.5" y="4" width="1.8" height="4" rx=".9" fill="{sbc}" opacity=".5"/></svg></i></div><div class="is"></div></div>
    <div class="btn" style="left:10px;top:330px;height:110px"></div><div class="btn" style="left:10px;top:470px;height:110px"></div><div class="btn" style="right:10px;top:400px;height:170px"></div>'''
    p = os.path.join(HERE, '_tmp.html'); open(p, 'w').write(html)
    ch.goto('file://' + p); time.sleep(.8)
    im = Image.open(io.BytesIO(ch.shot())).convert('RGBA')
    im.save(os.path.join(HERE, f'celular-{name}.png'), optimize=True)
    os.remove(p)
    print('mockup', name)
ch.close()
