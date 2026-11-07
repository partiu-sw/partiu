"""Gera a marca do Partiu (logo, favicon, ícones e imagens para o GitHub).

  python3 -I brand/gerar.py

Os SVGs são escritos à mão aqui; os PNGs saem do Chrome sem janela (pitch/cdp.py).
"""
import os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'pitch'))
from cdp import Chrome

BRAND, DEEP, LIGHT = '#134A8E', '#0D3466', '#1E5FAE'
FONT = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@1,800&display=block"

# Marca: pino de mapa branco com ondas do mar dentro, num quadrado arredondado azul-marinho.
PIN = 'M256 410s112-98 112-182a112 112 0 0 0-224 0c0 84 112 182 112 182z'
WAVES = (f'<path d="M190 214q16.5-15 33 0t33 0t33 0t33 0" fill="none" stroke="{BRAND}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<path d="M206 252q12.5-11 25 0t25 0t25 0t25 0" fill="none" stroke="{BRAND}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>')


def mark(rx=118, grad=True):
    fill = 'url(#g)' if grad else BRAND
    defs = f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{LIGHT}"/><stop offset="1" stop-color="{DEEP}"/></linearGradient></defs>' if grad else ''
    return f'{defs}<rect width="512" height="512" rx="{rx}" fill="{fill}"/><path d="{PIN}" fill="#fff"/>{WAVES}'


def svg_icon(rx=118):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{mark(rx)}</svg>\n'


def svg_logo(color=BRAND, text=BRAND):
    # ícone + nome. O nome usa Plus Jakarta Sans ExtraBold itálico (com alternativa do sistema).
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 300">'
            f'<style>@import url("{FONT}"); text {{ font-family: "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif; font-weight: 800; font-style: italic; }}</style>'
            f'<g transform="translate(10 10) scale(.5469)">{mark()}</g>'
            f'<text x="330" y="208" font-size="190" letter-spacing="-9" fill="{text}">Partiu</text></svg>\n')


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


icon_img = lambda s, rx=118: f'<div style="width:{s}px;height:{s}px">{svg_icon(rx).replace("<svg ", f"<svg width=\"{s}\" height=\"{s}\" ")}</div>'
render(icon_img(32, 128), 32, 32, 'favicon-32.png')
render(icon_img(180, 0), 180, 180, 'apple-touch-icon.png', transparent=False)
render(icon_img(512), 512, 512, 'icon-512.png')
# foto da organização no GitHub (o GitHub recorta em círculo): marca sem cantos, com respiro
render(f'<div style="width:500px;height:500px;background:linear-gradient(135deg,{LIGHT},{DEEP});display:grid;place-items:center">'
       f'<svg width="330" height="330" viewBox="0 0 512 512"><path d="{PIN}" fill="#fff"/>{WAVES.replace(BRAND, DEEP)}</svg></div>', 500, 500, 'avatar.png', transparent=False)
# imagem de prévia do repositório (1280 × 640): foto do litoral, logo e frase
photo = 'file://' + os.path.join(ROOT, 'img', 'post2.jpg')
render(f'''<div style="position:relative;width:1280px;height:640px;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;color:#fff">
  <img src="{photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,22,48,.86) 0%,rgba(6,22,48,.55) 55%,rgba(6,22,48,.1) 100%)"></div>
  <div style="position:absolute;left:84px;top:84px;width:520px">{svg_logo(text='#FFFFFF').replace('<svg ', '<svg width="420" ')}</div>
  <div style="position:absolute;left:88px;bottom:96px;width:760px">
    <div style="font-size:66px;line-height:1.02;font-weight:800;font-style:italic;letter-spacing:-2.5px">Chegou? O Partiu<br>decide com você.</div>
    <div style="margin-top:22px;font-size:26px;font-weight:500;opacity:.85">O que fazer, onde comer e onde sair no litoral catarinense, na hora.</div>
  </div>
</div>''', 1280, 640, 'social-preview.png', transparent=False)

CH.close()
