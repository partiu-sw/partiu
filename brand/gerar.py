"""Gera a marca do Partiu (logo, favicon, ícones e imagens para o GitHub).

  python3 -I brand/gerar.py

Os SVGs são escritos à mão aqui; os PNGs saem do Chrome sem janela (pitch/cdp.py).
"""
import os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'pitch'))
from cdp import Chrome

BRAND, DEEP, LIGHT = '#111111', '#000000', '#8A8A8E'
FONT = "https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=block"
FAMILY = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", Arial, sans-serif'

# Marca limpa: pino de mapa branco com o furo redondo, num quadrado arredondado azul liso.
PIN = 'M256 420s118-104 118-196a118 118 0 0 0-236 0c0 92 118 196 118 196zm0-150a46 46 0 1 1 0-92 46 46 0 0 1 0 92z'


def mark(rx=116):
    # quadrado azul liso com o pino branco por cima
    return f'<rect width="512" height="512" rx="{rx}" fill="{BRAND}"/><path d="{PIN}" fill="#fff" fill-rule="evenodd"/>'


def svg_icon(rx=116):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{mark(rx)}</svg>\n'


def svg_logo(color=BRAND, text='#1B1F27'):
    # ícone + nome em peso semibold, sem itálico, como as marcas da Apple.
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 300">'
            f'<style>@import url("{FONT}"); text {{ font-family: {FAMILY}; font-weight: 700; }}</style>'
            f'<g transform="translate(10 22) scale(.5)">{mark()}</g>'
            f'<text x="300" y="200" font-size="176" letter-spacing="-7" fill="{text}">Partiu</text></svg>\n')


def write(name, content):
    with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
        f.write(content)


write('icon.svg', svg_icon())
write('favicon.svg', svg_icon(rx=128))
write('logo.svg', svg_logo())
write('logo-branco.svg', svg_logo(text='#FFFFFF'))

PAGE = '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="' + FONT + '"><style>html,body{margin:0;background:transparent}*{box-sizing:border-box}</style>'


CH = Chrome(1280, 640, 1)  # um Chrome só para todas as imagens; muda o tamanho a cada uma


def render(html, w, h, out, transparent=True):
    path = os.path.join(HERE, '_tmp.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(PAGE + html)
    CH.send('Emulation.setDeviceMetricsOverride', width=w, height=h, deviceScaleFactor=1, mobile=False)
    alpha = 0 if transparent else 1
    CH.send('Emulation.setDefaultBackgroundColorOverride', color={'r': 255, 'g': 255, 'b': 255, 'a': alpha})
    CH.goto('file://' + path)
    CH.js('document.fonts.ready.then(() => true)')
    time.sleep(1.2)
    with open(os.path.join(HERE, out), 'wb') as f:
        f.write(CH.shot())
    os.remove(path)
    print('ok', out)


icon_img = lambda s, rx=116: f'<div style="width:{s}px;height:{s}px">{svg_icon(rx).replace("<svg ", f"<svg width=\"{s}\" height=\"{s}\" ")}</div>'
render(icon_img(32, 128), 32, 32, 'favicon-32.png')
render(icon_img(180, 0), 180, 180, 'apple-touch-icon.png', transparent=False)
render(icon_img(512), 512, 512, 'icon-512.png')
# foto da organização no GitHub (o GitHub recorta em círculo): marca sem cantos, com respiro
render(f'<div style="width:500px;height:500px;background:{BRAND};display:grid;place-items:center">'
       f'<svg width="300" height="300" viewBox="0 0 512 512"><path d="{PIN}" fill="#fff" fill-rule="evenodd"/></svg></div>', 500, 500, 'avatar.png', transparent=False)
# imagem de prévia do repositório (1280 × 640): foto do litoral, logo e frase
photo = 'file://' + os.path.join(ROOT, 'img', 'post2.jpg')
render(f'''<div style="position:relative;width:1280px;height:640px;overflow:hidden;font-family:-apple-system,'SF Pro Display',Inter,sans-serif;color:#fff">
  <img src="{photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,22,48,.86) 0%,rgba(6,22,48,.55) 55%,rgba(6,22,48,.1) 100%)"></div>
  <div style="position:absolute;left:84px;top:84px;width:520px">{svg_logo(text='#FFFFFF').replace('<svg ', '<svg width="420" ')}</div>
  <div style="position:absolute;left:88px;bottom:96px;width:760px">
    <div style="font-size:66px;line-height:1.02;font-weight:700;letter-spacing:-2px">Chegou? O Partiu<br>decide com você.</div>
    <div style="margin-top:22px;font-size:26px;font-weight:500;opacity:.85">O que fazer, onde comer e onde sair no litoral catarinense, na hora.</div>
  </div>
</div>''', 1280, 640, 'social-preview.png', transparent=False)

CH.close()
