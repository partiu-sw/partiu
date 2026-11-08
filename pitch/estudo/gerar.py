"""Gera o PDF de uma página para estudo antes do pitch: python3 -I pitch/estudo/gerar.py"""
import os, sys, time, base64
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(HERE))
from cdp import Chrome
c = Chrome(794, 1123)
c.goto('file://' + os.path.join(HERE, 'estudo.html')); c.js('document.fonts.ready'); time.sleep(1)
print('altura', c.js('document.body.scrollHeight'), c.js('Math.max(...[...document.body.children].map(e=>e.getBoundingClientRect().bottom))'))
pdf = c.send('Page.printToPDF', printBackground=True, preferCSSPageSize=True, marginTop=0, marginBottom=0, marginLeft=0, marginRight=0)
open(os.path.join(HERE, 'Partiu-estudo-pre-pitch.pdf'), 'wb').write(base64.b64decode(pdf['data']))
open(os.path.join(HERE, 'previa.png'), 'wb').write(c.shot())
c.close(); print('ok')
