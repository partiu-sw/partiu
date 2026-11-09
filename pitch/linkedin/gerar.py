"""Imagem do app para o carrossel do LinkedIn (4:5, 1080 x 1350, gerada em 2x).
  python3 -I pitch/linkedin/gerar.py"""
import os, sys, time, base64
HERE = os.path.dirname(os.path.abspath(__file__)); PITCH = os.path.dirname(HERE)
sys.path.insert(0, PITCH)
from cdp import Chrome
def b64(n): return 'data:image/png;base64,' + base64.b64encode(open(os.path.join(PITCH, 'mockups', f'celular-{n}.png'), 'rb').read()).decode()
pin = 'data:image/svg+xml;base64,' + base64.b64encode(open(os.path.join(PITCH, '..', 'brand', 'pin.svg'), 'rb').read()).decode()
html = f'''<!doctype html><style>
html,body{{margin:0;width:1080px;height:1350px;background:#fff;overflow:hidden;font-family:-apple-system,"SF Pro Display",Inter,"Helvetica Neue",Arial,sans-serif;color:#111;-webkit-font-smoothing:antialiased}}
.top{{position:absolute;top:84px;left:0;right:0;text-align:center}}
.logo{{display:inline-flex;align-items:center;gap:12px;font-size:40px;font-weight:800;letter-spacing:-1.5px}}
.logo img{{height:42px}}
h1{{margin:26px 0 0;font-size:58px;line-height:1.06;font-weight:700;letter-spacing:-2.2px}}
h1 span{{color:#8a8a8e}}
.ph{{position:absolute;bottom:-150px;width:450px;filter:drop-shadow(0 40px 60px rgba(0,0,0,.18))}}
.a{{left:80px;transform:rotate(-6deg);bottom:-190px}}
.b{{left:315px;z-index:2;bottom:-120px;width:470px}}
.c{{right:80px;transform:rotate(6deg);bottom:-190px}}
.tag{{position:absolute;z-index:3;top:300px;left:50%;transform:translateX(-50%);display:flex;gap:10px}}
.tag span{{padding:10px 20px;border-radius:999px;background:#111;color:#fff;font-size:22px;font-weight:600}}
.tag span.l{{background:#f2f2f3;color:#111}}
</style>
<div class="top"><div class="logo"><img src="{pin}">Partiu</div>
<h1>From zero to hero<br><span>em 54 horas.</span></h1></div>
<div class="tag"><span>Roteiro do dia</span><span class="l">Mapa 3D</span><span class="l">Plano B</span></div>
<img class="ph a" src="{b64('parceiro-roteiro')}"><img class="ph c" src="{b64('parceiro-feed')}"><img class="ph b" src="{b64('explorar')}">'''
p = os.path.join(HERE, '_p.html'); open(p, 'w').write(html)
c = Chrome(1080, 1350, 2); c.goto('file://' + p); time.sleep(1.2)
open(os.path.join(HERE, 'partiu-app-4x5.png'), 'wb').write(c.shot()); os.remove(p); c.close(); print('ok')
