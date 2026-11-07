<p align="center"><img src="brand/logo.svg" alt="Partiu" width="320"></p>

# Partiu

Protótipo navegável de um app para decidir o que fazer no litoral catarinense quando você já está no destino: a pessoa responde algumas perguntas, escolhe entre usar as recomendações ou montar na mão deslizando cartões, e organiza tudo numa linha do tempo por dia. A área logada tem uma barra fixa com quatro abas: Explorar (mapa com o roteiro do dia, rotas pelas ruas, o bloco "Agora" e plano B com chuva), Roteiro, Feed (publicações de outros viajantes) e Conta (perfil e viagens salvas).

O foco vem da pesquisa de rua de novembro de 2026 (`pesquisa/insights.md` e o dashboard em `pesquisa/dashboard/`): reservar já é fácil para a maioria; a dor é decidir o que fazer no destino, com informação espalhada e imprevistos durante a viagem. Por isso o orçamento virou uma referência opcional.

## Como abrir

Não precisa de build. Abra `index.html` para ver a página de apresentação e `app.html` para seguir o app do começo. Localmente, `telas.html` mostra todas as telas lado a lado (essa página não vai para o site publicado).

Publicado na Vercel: https://partiu-blue.vercel.app (o app fica em `/app`).

A página de apresentação do projeto, com o modelo de negócio e o formulário para comércios, é o `index.html`.

Para evitar bloqueios do navegador com arquivos locais, dá para servir a pasta:

```bash
npx serve .
```

As rotas ficam em inglês, no formato `app.html#/caminho`. Sem sessão, qualquer rota da área logada leva ao login; para ver uma viagem pronta, entre com `demo@partiu.app` (qualquer senha).

| Rota | Tela |
| --- | --- |
| `#/login` | Entrar (e-mail primeiro, depois redes sociais) |
| `#/welcome` | Apresentação |
| `#/new-trip/destination` | Destino |
| `#/new-trip/dates` | Datas |
| `#/new-trip/budget` | Orçamento |
| `#/new-trip/interests` | Interesses |
| `#/new-trip/searching` | Busca de lugares |
| `#/itinerary/choose` | Usar as recomendações ou montar na mão |
| `#/itinerary/discover` | Escolher lugares deslizando |
| `#/explore` | Explorar no mapa |
| `#/itinerary` | Roteiro |
| `#/feed` | Feed |
| `#/account` | Conta e viagens salvas |

## Estrutura

```
index.html                 página de apresentação (problema, solução, modelo de negócio)
telas.html                 prévia de todas as telas (só local, fora do deploy)
app.html                   o app (marcação das telas)
brand/                     logo, favicon, ícones e imagens para o GitHub (gerar.py recria os PNGs)
img/                       fotos do litoral usadas no app e na landing (créditos em img/CREDITOS.md)
css/
  base.css                 cores, tipografia, botões e moldura do celular
  motion.css               animações (entradas em cascata, fotos que respiram, toques)
  pill.css                 formato pílula em controles, campos e chips
  desktop.css              layout acima de 900px (sem moldura de celular)
  screens/                 um arquivo por tela: onboarding, quiz, loading, plan, map, login, feed, conta
js/
  data.js                  cidades e lugares de exemplo
  core.js                  ícones, estado, utilidades e troca de telas
  ui/hnav.js               rolagem lateral com setas
  trips.js                 viagens salvas e sessão (localStorage)
  screens/                 um arquivo por tela: login, intro, quiz, loading, plan, map, feed, conta
  main.js                  inicialização e abertura de uma tela pelo endereço
tiles/                     blocos do mapa (Esri Light Gray), zoom 11 a 15
scripts/baixar-tiles.py    baixa os blocos do mapa de novo
explorations/              variações de design que ficaram de referência
```

## Mapa

O mapa usa [Leaflet 1.9.4](https://leafletjs.com) com um mapa base vetorial: estilo Positron do [OpenFreeMap](https://openfreemap.org) (gratuito, sem chave), desenhado com [MapLibre GL 4.7.1](https://maplibre.org) pelo plugin `@maplibre/maplibre-gl-leaflet` 0.0.22 e recolorido no `js/screens/map.js` com o azul da marca. As rotas entre as paradas seguem as ruas a pé, calculadas pelo [OSRM](https://project-osrm.org) público da FOSSGIS (`routing.openstreetmap.de`, com o servidor de carro do OSRM como reserva) e guardadas no navegador; sem rede, aparece uma linha tracejada reta.

Sem WebGL ou sem acesso ao OpenFreeMap, o mapa usa os blocos salvos em `tiles/` (Esri Light Gray, de Balneário Camboriú a Tijucas). Para baixar de novo ou ampliar a área, edite as coordenadas em `scripts/baixar-tiles.py` e rode:

```bash
python3 -I scripts/baixar-tiles.py
```

Mapa: OpenFreeMap © OpenMapTiles © OpenStreetMap contributors. Blocos de reserva: Esri, HERE, Garmin, © OpenStreetMap contributors.

## Dados

Os pontos turísticos (praias, mirantes, Cristo Luz, Unipraias, igrejas, centros históricos) são lugares reais, com coordenadas aproximadas do OpenStreetMap: são 43 lugares nas quatro cidades (contando os hotéis), mais 14 empresas de exemplo perto de cada hotel. Restaurantes, hotéis, notas, preços, as publicações do feed e os viajantes são fictícios. No desktop, o botão "Ver no celular" mostra o app na moldura de celular. Sem acesso ao GPS, a localização usada é o Shopping Russi & Russi, em Itapema.
