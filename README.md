<p align="center"><img src="brand/logo.svg" alt="Partiu" width="320"></p>

# Partiu

Protótipo navegável de um app para decidir o que fazer no litoral catarinense quando você já está no destino: a pessoa responde algumas perguntas, escolhe lugares deslizando cartões e organiza tudo numa linha do tempo por dia. No mapa, o bloco "Agora" mostra o que está aberto perto dela e, com previsão de chuva, um plano B troca a praia por um lugar coberto.

O foco vem da pesquisa de rua de novembro de 2026 (`pesquisa/insights.md` e o dashboard em `pesquisa/dashboard/`): reservar já é fácil para a maioria; a dor é decidir o que fazer no destino, com informação espalhada e imprevistos durante a viagem. Por isso o orçamento virou uma referência opcional.

## Como abrir

Não precisa de build. Abra `index.html` no navegador para ver todas as telas, ou `app.html` para seguir o fluxo do começo.

A página de apresentação do projeto, com o modelo de negócio e o formulário para comércios, é a `landing.html`. Na Vercel ela abre na raiz do site (`vercel.json`), e o app fica em `/app`.

Para evitar bloqueios do navegador com arquivos locais, dá para servir a pasta:

```bash
npx serve .
```

Cada tela também abre direto pelo endereço:

| Endereço | Tela |
| --- | --- |
| `app.html#login` | Entrar (redes sociais ou e-mail; `demo@partiu.app` já tem viagem) |
| `app.html#intro` | Apresentação |
| `app.html#dest` | Destino |
| `app.html#dates` | Datas |
| `app.html#budget` | Orçamento |
| `app.html#prefs` | Interesses |
| `app.html#loading` | Busca de lugares |
| `app.html#discover` | Escolher lugares |
| `app.html#organize` | Organizar roteiro (com exemplo preenchido) |
| `app.html#main` | Explorar no mapa |

## Estrutura

```
landing.html               página de apresentação (problema, solução, modelo de negócio)
index.html                 página de desenvolvimento com a prévia de todas as telas
app.html                   o app (marcação das telas)
brand/                     logo, favicon, ícones e imagens para o GitHub (gerar.py recria os PNGs)
img/                       fotos do litoral usadas no app e na landing (créditos em img/CREDITOS.md)
css/
  base.css                 cores, tipografia, botões e moldura do celular
  motion.css               animações (entradas em cascata, fotos que respiram, toques)
  screens/                 um arquivo por tela: onboarding, quiz, loading, plan, map
js/
  data.js                  cidades e lugares de exemplo
  core.js                  ícones, estado, utilidades e troca de telas
  ui/hnav.js               rolagem lateral com setas
  screens/                 um arquivo por tela: intro, quiz, loading, plan, map
  main.js                  inicialização e abertura de uma tela pelo endereço
tiles/                     blocos do mapa (CARTO Positron), zoom 11 a 15
scripts/download-tiles.js  baixa os blocos do mapa de novo
explorations/              variações de design que ficaram de referência
```

## Mapa

O mapa usa [Leaflet 1.9.4](https://leafletjs.com) (via cdnjs) com os blocos do estilo CARTO Positron salvos em `tiles/`, cobrindo as quatro cidades. Para baixar de novo ou ampliar a área, edite as coordenadas em `scripts/download-tiles.js` e rode:

```bash
node scripts/download-tiles.js
```

Mapa: © OpenStreetMap contributors © CARTO.

## Dados

Os pontos turísticos (praias, Cristo Luz, Unipraias, igrejas) têm coordenadas conferidas no OpenStreetMap. Restaurantes, hotéis, notas e preços são fictícios. Sem acesso ao GPS, a localização usada é o Shopping Russi & Russi, em Itapema.
