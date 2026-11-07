"""Baixa os blocos do mapa (Esri Light Gray: base + nomes) para tiles/, cobrindo de Balneário Camboriú a Tijucas.

  python3 -I scripts/baixar-tiles.py

Para ampliar a área, mude N, S_, W, E (latitude/longitude) e o maxBounds em js/screens/map.js.
"""
import os, io, math, urllib.request, concurrent.futures as cf
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tiles')
U = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_{}/MapServer/tile/{}/{}/{}'
N, S_, W, E = -26.94, -27.27, -48.70, -48.50
def tx(lon, z): return int((lon + 180) / 360 * 2**z)
def ty(lat, z): r = math.radians(lat); return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2**z)
def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'partiu-prototipo'})
    return Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=30).read())).convert('RGBA')
def one(t):
    z, x, y = t; p = f'{ROOT}/{z}/{x}/{y}.png'
    os.makedirs(os.path.dirname(p), exist_ok=True)
    b = get(U.format('Base', z, y, x)); r = get(U.format('Reference', z, y, x))
    b.alpha_composite(r); b.convert('P', palette=Image.ADAPTIVE, colors=64).save(p, optimize=True); return 1
todo = [(z, x, y) for z in range(11, 16) for x in range(tx(W, z), tx(E, z) + 1) for y in range(ty(N, z), ty(S_, z) + 1)]
with cf.ThreadPoolExecutor(8) as ex: n = sum(ex.map(one, todo))
print(len(todo), 'novos', n)
