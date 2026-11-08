"""Captura as telas atuais do Partiu (servido em localhost:8000) para o pitch v6.

  python3 -m http.server 8000 --directory .. &
  python3 -I capture6.py

Usa um celular de 390 × 844 (tela inteira, sem moldura: a moldura é desenhada no vídeo) e a conta de demonstração.
Grava em shots6/ com os mesmos nomes usados pelo video6.js.
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from cdp import Chrome

BASE = 'http://localhost:8000/app.html'
OUT = os.path.join(os.path.dirname(__file__), 'shots6')
os.makedirs(OUT, exist_ok=True)
c = Chrome(390, 844, scale=3)
c.send('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=3, mobile=True)
HIDE = ".dev-link,.vm-btn,#devWx{display:none!important}"


def open_route(r, session=True, wait=3.0):
    c.goto(f'{BASE}?t={time.time()}#/login')
    c.js("localStorage.clear()" + (";localStorage.setItem('partiu.sessao', JSON.stringify({name:'Ana', email:'demo@partiu.app'}))" if session else ""))
    c.goto(f'{BASE}?t={time.time()}#{r}')
    c.js(f"(() => {{ const s = document.createElement('style'); s.textContent = {HIDE!r}; document.head.appendChild(s); }})()")
    time.sleep(wait)


def snap(name):
    c.js("document.fonts.ready")
    time.sleep(0.3)
    open(os.path.join(OUT, name + '.png'), 'wb').write(c.shot())
    print('ok', name)


def click(sel, wait=0.9):
    c.js(f"document.querySelector({json.dumps(sel)}).click()")
    time.sleep(wait)


open_route('/welcome'); snap('intro')
open_route('/new-trip/destination'); snap('dest')
open_route('/new-trip/dates'); snap('dates')
open_route('/new-trip/budget'); snap('budget')
open_route('/new-trip/interests'); snap('prefs')
open_route('/new-trip/searching', wait=1.9); snap('loading')
open_route('/itinerary/discover', wait=2.5); snap('discover')
for i in range(1, 4):
    click('#yesAct', 1.0)
    snap(f'discover{i}')
open_route('/itinerary', wait=2.5); snap('organize')
open_route('/explore', wait=5); snap('main')
open_route('/feed', wait=3); snap('feed')
c.proc.kill()
