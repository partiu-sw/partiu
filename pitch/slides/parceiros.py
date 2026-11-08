"""Slide 'Onde o parceiro aparece': 4 telas do app com o comércio pagante (1920 × 1080).
  python3 -I pitch/slides/parceiros.py   (depois de pitch/mockups/gerar.py)"""
import os, sys, time, base64
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(HERE))
from cdp import Chrome
M = os.path.join(os.path.dirname(HERE), 'mockups') if False else os.path.join(HERE, '..', 'mockups')
TELAS = [('parceiro-mapa', 'Mapa'), ('parceiro-roteiro', 'Roteiro'), ('parceiro-oferta', 'Oferta'), ('parceiro-feed', 'Feed')]
def b64(n): return 'data:image/png;base64,' + base64.b64encode(open(os.path.join(M, f'celular-{n}.png'), 'rb').read()).decode()
cols = ''.join(f'<figure><img src="{b64(n)}"><figcaption><b>{i+1}</b>{t}</figcaption></figure>' for i, (n, t) in enumerate(TELAS))
html = f'''<!doctype html><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&display=swap" rel="stylesheet">
<style>html{{filter:grayscale(1)}} html,body{{margin:0;width:1920px;height:1080px;background:#fff;font-family:Montserrat,sans-serif;color:#111;overflow:hidden}}
.k{{position:absolute;top:70px;width:100%;text-align:center;font-size:20px;font-weight:700;letter-spacing:4px;color:#8A8A8E}}
h1{{position:absolute;top:80px;width:100%;margin:0;text-align:center;font-size:64px;font-weight:800;letter-spacing:-1.5px}}
.row{{position:absolute;top:220px;left:0;right:0;display:flex;justify-content:center;gap:88px}}
figure{{margin:0;display:flex;flex-direction:column;align-items:center;gap:22px}}
figure img{{height:720px;filter:drop-shadow(0 24px 40px rgba(0,0,0,.14))}}
figcaption{{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:700;letter-spacing:-.4px}}
figcaption b{{width:40px;height:40px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:20px}}
.f{{position:absolute;bottom:40px;width:100%;text-align:center;font-size:24px;font-weight:600;color:#6B6B70}}
.f strong{{color:#111}}</style>
<h1>Onde o parceiro aparece</h1>
<div class="row">{cols}</div>
'''
p = os.path.join(HERE, '_p.html'); open(p, 'w').write(html)
c = Chrome(1920, 1080); c.goto('file://' + p); c.js('document.fonts.ready'); time.sleep(1.5)
open(os.path.join(HERE, 'onde-o-parceiro-aparece.png'), 'wb').write(c.shot()); os.remove(p); c.close(); print('ok')
