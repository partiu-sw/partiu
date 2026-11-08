# Partiu — padrão de design

Guia para quem (pessoa ou agente) for criar ou mudar telas do Partiu. Tudo aqui foi tirado do que já existe em `css/` e `js/`. Se algo novo não couber nestas regras, siga o componente mais parecido que já existe antes de inventar outro.

## Princípios

1. **Litoral, vidro, preto e branco.** A identidade vem de fotos reais do litoral em tela cheia, com controles de vidro fosco por cima. O app é só preto e branco: o destaque (`--brand`) é preto `#111111`, os fundos são brancos e os tons suaves são cinzas bem claros. Sem azul e sem degradê. Referências: apps de viagem com foto grande, cartões de foto com local e seta, barra de navegação flutuante.
2. **Celular primeiro, desktop de verdade.** As telas são desenhadas para 390 × 844 dentro de `.phone`. Abaixo de 500px ocupam a tela inteira; acima de 900px (`css/desktop.css`) o app ocupa a janela toda, sem moldura de celular: login em duas colunas (foto e formulário), perguntas e roteiro numa coluna central, e no mapa o painel vira uma coluna lateral fixa à esquerda (`DESK()` e `SIDE_W` no `js/core.js`).
3. **Selecionado = preto.** Um item escolhido troca para fundo `--brand` e texto branco. Não use outra cor, sombra extra ou ícone de check para indicar seleção.
4. **Foto em primeiro lugar.** Sobre foto: degradê escuro embaixo para o texto branco e vidro fosco (`--glass`, `--glass-line`, `backdrop-filter: blur`) nos controles. Fora da foto: bordas finas de 1px e sombras suaves só no que flutua.
5. **Toque confortável.** Toda área clicável tem no mínimo 44 × 44px (botões principais 56px de altura).
6. **Muito movimento, sempre suave.** Entradas em cascata, fotos que respiram (zoom lento), pinos que caem, toques com resposta. Fica em `css/motion.css` e tudo respeita `prefers-reduced-motion`.

## Marca

- Logo em `brand/`: o pino de mapa vazado (contorno grosso com furo redondo) ao lado do nome "Partiu" em peso bem pesado, tudo em preto (ou branco sobre foto). Arquivos do dia a dia: `pin.svg` / `pin-branco.svg` (só o pino) e `logo.svg` / `logo-branco.svg` (pino + nome). O quadrado preto com o pino branco (`icon.svg`) fica só para favicon e ícone de app.
- Arquivos: `logo.svg` (azul) e `logo-branco.svg` (sobre foto), `icon.svg`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `avatar.png` (GitHub) e `social-preview.png` (1280 × 640).
- Toda página nova leva o favicon e `theme-color #111111` no `<head>`, como `app.html` e `index.html`.
- Para mudar a marca, edite `brand/gerar.py` e rode `python3 -I brand/gerar.py`.

## Cores

Os tokens ficam em `:root` no `css/base.css`. Use sempre a variável quando existir.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#FFFFFF` | fundo da página (branco puro) |
| `--surface` | `#FFFFFF` | fundo das telas, cartões, painéis |
| `--fill` | `#F4F4F5` | fundos suaves em azul bem claro (nunca cinza): campo de busca, chips, resumo do dia |
| `--line` | `#E8E8EA` | divisórias e bordas de cartão |
| `--ink` | `#1B1F27` | texto principal, barra de navegação flutuante |
| `--brand` | `#111111` | botão primário, estado selecionado, destaque nos títulos, rota no mapa |
| `--brand-deep` | `#000000` | hover do botão primário, fundos azuis escuros |
| `--brand-soft` | `#F2F2F3` | selos, faixa de datas no calendário e fundos azuis claros |
| `--brand-sky` | `#8A8A8E` | ciano do mar, só em detalhes pequenos (nunca em degradê com o azul) |
| `--glass` / `--glass-line` | branco 16% / 34% | vidro fosco sobre foto (com `backdrop-filter: blur(14–16px)`) |
| `--screen` | `#FFFFFF` | fundo de todas as telas: branco puro, com o azul como única cor |
| `--sec` | `#7E8492` | texto secundário, legendas, rótulos |
| `--muted` | `#B9BEC8` | texto desativado (ex.: dias passados no calendário) |

Cinzas auxiliares já usados (sem token; reutilize estes, não crie novos):

| Valor | Uso |
| --- | --- |
| `#D4D4D9` | borda de botão secundário, pílula, botão redondo |
| `#D0D0D5` / `#C7C7CC` | bordas tracejadas (estado vazio, inserir aqui, trajeto) |
| `#D2D2D7` | pontos de paginação inativos, trilho do slider |
| `#D1D1D6` | alça (grabber) dos painéis |
| `#A2A2A8` | ícones apagados (alça de arrastar, inserir) |
| `#C7C7CC` | texto secundário sobre fundo `--ink` |
| `#3A3A3C` | selo/contador secundário sobre fundo `--ink` |
| `#101012` | moldura do celular |

Categorias do orçamento usam três tons de azul (`#111111`, `#6B6B70`, `#CFCFD3`), definidos em `ALLOC` no `js/core.js`.

Fotos ficam em `img/` (reduzidas, até 1000px) com créditos em `img/CREDITOS.md`; `photoFor(texto)` no `js/core.js` escolhe a foto pelo nome do lugar.

O app só tem tema claro (`color-scheme: light`). Não adicione tema escuro sem combinar antes.

## Tipografia

Fonte: **fonte do sistema (SF Pro no Apple) com Inter como alternativa** (400 a 700, itálico 600 e 700) via Google Fonts, com fallback do sistema em `--font`.

| Papel | Tamanho | Peso | Extra |
| --- | --- | --- | --- |
| Título de tela (`h1`) | 30px (34px sobre foto) | 800 itálico | `letter-spacing: -0.8px`; a palavra-chave vai em `<em>` e fica em `--brand` |
| Título secundário (carregando) | 24px | 700 | `letter-spacing: -0.5px` |
| Título de seção / painel (`h2`) | 18–20px | 700 | `letter-spacing: -0.3px` a `-0.4px` |
| Cabeçalho de tela, nome de cartão grande | 17–19px | 600–700 | |
| Corpo / subtítulo (`.sub`) | 17px | 400 | cor `--sec`, `line-height: 1.4` |
| Nome de item em lista | 15–16px | 600 | corta com reticências em uma linha |
| Texto de apoio | 14–15px | 400–500 | cor `--sec` |
| Rótulo / meta (`.label`) | 13px | 600 | cor `--sec` |
| Mínimo (abas, contadores) | 10–12px | 500–700 | só para detalhes |

Regras:

- Números que mudam ou se alinham (horários, valores, datas, porcentagens) usam `font-variant-numeric: tabular-nums`.
- Títulos grandes têm `letter-spacing` negativo; texto corrido não.
- Linhas de lista usam `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` com `min-width: 0` no pai flex.
- Não use maiúsculas no texto do app. (A página `index.html` usa caixa alta só nos rótulos de seção.)

## Espaçamento e layout

- **Margem lateral das telas:** 24px nas perguntas e na apresentação; 20px nas telas de conteúdo (roteiro, lista de lugares); 16px para elementos que flutuam sobre o mapa.
- **Topo:** cabeçalhos começam em ~48px do topo (área da barra de status). Rodapés com botão terminam com 28–34px de folga embaixo.
- **Espaços entre elementos:** use a escala 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32px. Entre blocos de uma etapa, 24px; dentro de um grupo, 8–12px.
- **Estrutura de tela:** `.screen` é `position: absolute; inset: 0` e coluna flex. Cabeçalho e rodapé são `flex: none`; o miolo é `flex: 1; min-height: 0; overflow-y: auto`.
- **Rodapé fixo:** separado por `border-top: 1px solid var(--line)`, com o botão principal ocupando a largura toda.
- Barras de rolagem ficam escondidas em todo o app; a rolagem lateral com setas usa `js/ui/hnav.js`.

## Formas

**Pílula primeiro.** Todo controle é arredondado por completo (`css/pill.css`, carregado depois das telas): botões, campos de texto e busca, chips de dia e de horário, segmentos, abas, avisos, cartão da viagem no mapa, selos. Botões só com ícone são círculos.

| Raio | Onde |
| --- | --- |
| 999px / 50% | botões, campos, chips, segmentos, barra de abas, avisos, selos, botões de ícone, miniaturas redondas |
| 36–48px | blocos grandes da landing, topo da conta |
| 26–28px | cartões com foto (feed, viagens, escolha), painéis que sobem de baixo, estados vazios |
| 20–22px | cartões de lista (paradas, linha do tempo), cartão de deslizar |

Sombras (só para o que flutua):

- leve: `0 2px 8px rgba(0,0,0,.08–.2)` — pins, botões redondos, setas
- cartão flutuante: `0 4px 16px rgba(0,0,0,.10)`
- painel inferior: `0 -4px 20px rgba(0,0,0,.08)`
- destaque (toast, item arrastado): `0 8px 24px rgba(0,0,0,.2)` a `0 16px 36px rgba(0,0,0,.22)`

## Componentes

Reutilize estas classes antes de criar novas. As globais estão em `css/base.css`; as demais, no CSS da tela onde nasceram — se uma passar a ser usada em mais de uma tela, mova para `base.css`.

**Botões**

- `.btn-primary` — ação principal da tela. 100% de largura, 56px, fundo `--ink`, texto branco 17px/600. Desativado: fundo `--line`, texto `--sec`. Variante `.sm` (48px, largura automática). **Uma por tela.**
- `.btn-sec` — ação secundária ao lado da principal: branco, borda `#D4D4D9`, 56px. Pode levar um contador `<i>`.
- `.btn-out` — botão contornado de 48px para ações em estados vazios.
- `.icon-btn` — 44 × 44, raio 12, transparente. Variantes `.filled` (fundo `--fill`) e `.round` (circular com borda).
- `.round-act` — botões redondos de 58px para decidir (pular/quero). `.ok` é o invertido; `.sm` tem 44px.
- `.link`, `.link-sm`, `.text-btn` — ações de texto. `.link` é cinza (ex.: "Pular"); `.link-sm` e `.text-btn` são sublinhados.

**Seleção**

- `.pill` — opções em pílula (40px, borda `#D4D4D9`). Selecionada: invertida.
- `.seg` — controle segmentado estilo iOS: trilho `#EEEEF0`, opção ativa branca com sombra leve.
- `.b` (bento) — cartões de interesse em grade 2 colunas, `.wide` e `.tall`. Selecionado: invertido.
- `.row-btn` — linha de lista com ícone redondo em `--fill`, título e subtítulo, divisória embaixo.
- `.day-chip`, `.time-chip`, `.stage` — chips de dia, horário e etapa; ativo invertido. Horário indisponível: fundo `--fill`, texto `#A2A2A8` riscado.

**Entradas**

- `.search` — campo com fundo `--fill`, 52px, raio 12; no foco ganha anel `0 0 0 2px var(--ink)`.
- `.amount-field` — valor grande editável (44px/700), fundo `--fill` ao passar o mouse.
- `.range` — slider com trilho de 6px e botão branco de 24px.
- `.stepper` — menos/valor/mais com `.icon-btn` de 40px.

**Estrutura e feedback**

- Cabeçalho de tela: `.icon-btn` voltar (chevron 22px, traço 2.2) · título + subtítulo centralizados · ação ou espaçador de 44px.
- `.progress` — barras de 4px por etapa; preenchidas em `--ink`.
- `.dots` — paginação; o ponto ativo estica para 22px.
- `.sheet` / `.when-panel` — painel que sobe de baixo, com `.grabber` (36 × 5px). Fundo escurecido `rgba(0,0,0,.28)` quando é modal.
- `.toast` — aviso escuro flutuante com ação "Desfazer" sublinhada.
- `.map-note` — aviso curto escuro sobre o mapa.
- Estados vazios (`.tl-empty`, `.disc-empty`, `.stage-done`) — caixa com borda tracejada `1.5px dashed #D0D0D5`, texto centralizado, título 17px/600 + explicação em `--sec` + ação.
- `.tabbar` — barra branca de vidro, flutuante e fixa em todas as abas da área logada (Explorar, Roteiro, Feed, Conta), fora das telas, no fim do `.phone`. A aba atual mostra o nome numa pílula azul sólida que desliza até ela (`setTabbar()` no `core.js`). Some quando um painel cobre a tela (escolher lugares, horários, busca, publicar).
- `.tab-head` — cabeçalho das abas: título grande (`h1` com a palavra-chave em `<em>`) e uma ação à direita.
- Painel do mapa (`.sheet`) — três estágios como no Uber (recolhido, metade, aberto); arrasta em qualquer parte, com resistência nas pontas e gesto rápido para pular de estágio.
- `.day-chip` — o mesmo chip de dia no mapa e no roteiro: dia da semana (ou "Hoje"), número e quantos lugares; no mapa, com o ícone do clima.

## Ícones

- Desenhados à mão em `ICON` no `js/core.js` e gerados com `svg(nome, tamanho, traço)`.
- Grade 24 × 24, `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, traço 2 (2.2 em setas e fechar do cabeçalho; 1.8 na tabbar).
- Tamanhos: 14–16px dentro de texto, 18–20px em botões, 22px no voltar, 24px na tabbar.
- Sempre `aria-hidden="true"`; o botão leva o `aria-label`.
- Para um ícone novo, adicione ao objeto `ICON` no mesmo estilo de traço. Não traga bibliotecas de ícones.

## Movimento

- Curva padrão: `cubic-bezier(.2, .8, .2, 1)`; mola para o que aparece: `cubic-bezier(.34, 1.56, .64, 1)`. Durações de 0,15s (toque) a 0,6s (entradas); o zoom lento das fotos leva 9–10s.
- Animações de entrada usam `animation-fill-mode: backwards`, para não segurar `transform` depois (arrastar cartões, pinos do mapa).
- **Troca de tela:** avançar desliza da direita (`enter-f`), voltar da esquerda (`enter-b`), a anterior some com leve redução (`leave`). Use `go(passo)` / `showScreen()` do `js/core.js`, nunca troque `hidden` na mão.
- **Troca de etapa:** os filhos entram em cascata com 40ms de atraso entre eles (`step-f`/`step-b`), reiniciados com `replay(el, cls)`.
- **Listas:** itens sobem 12px em cascata de 45ms (`--i` como índice).
- **Toque:** botões e cartões encolhem levemente no `:active` (`scale(.92–.97)`).
- **Painéis:** sobem de baixo (`@keyframes up`); fundo aparece com `fade`.
- Toda animação nova precisa ser desligada em `@media (prefers-reduced-motion: reduce)`.

## Acessibilidade

- Estado vai em atributo ARIA, e o CSS estiliza a partir dele: `aria-pressed="true"` para opções alternáveis, `aria-current="page" | "step" | "true"` para o item atual.
- Foco visível: `outline: 2px solid var(--ink); outline-offset: 2px` (já global em `base.css`). Não remova sem dar outro anel de foco.
- Botões só com ícone sempre têm `aria-label` em português.
- Painéis usam `role="dialog"` com `aria-label`; avisos usam `role="status"` ou `aria-live="polite"`.
- Use `<button>` para tudo que é clicável, mesmo cartões e linhas.

## Texto

- Português do Brasil, frase com maiúscula só no começo ("Ver no mapa", não "Ver No Mapa").
- Tom direto e próximo, falando com a pessoa ("Seu roteiro", "Quero ir"). Botões dizem a ação, curtos.
- Valores: `money(n)` → `R$ 4.000`. Datas: `12 nov`, `12–18 nov`, `qua, 12 nov`. Horários: `08:30`.
- Separador de detalhes: ` · ` (ex.: `Praia · Centro`). Faixa: travessão `–`.
- Plural com `plural(n, 'lugar', 'lugares')`.
- Comentários de código também em português.

## Código e arquivos

- Sem build e sem framework: HTML + CSS + JS puro, abre direto no navegador.
- Um CSS e um JS por tela (`css/screens/`, `js/screens/`); o compartilhado fica em `css/base.css` e `js/core.js`. A marcação das telas fica em `app.html`.
- Rotas em inglês no formato `#/caminho` (tabela em `ROUTES` no `js/main.js` e no `README.md`). A área logada só abre com sessão (`js/trips.js`). Toda tela nova entra nas rotas, no `README.md` e na prévia local `telas.html` (que não vai para o deploy, ver `.vercelignore`). A página de apresentação é o `index.html`.
- Bibliotecas externas com versão fixa, de preferência pelo cdnjs (Leaflet 1.9.4, MapLibre GL 4.7.1); o que não existe lá vem do jsDelivr (`@maplibre/maplibre-gl-leaflet` 0.0.22). O CSS do Leaflet está embutido em `map.css`.
- HTML gerado em JS passa pelo `esc()` quando mostra texto vindo de dados.
- Variações de design que não entraram no app ficam em `explorations/` como referência.

## Antes de entregar uma tela

- [ ] Só usei os tokens e cinzas listados acima; destaque sempre em `--brand`.
- [ ] Seleção é fundo `--brand` + texto branco, via `aria-pressed`/`aria-current`.
- [ ] Alvos de toque com 44px ou mais; uma única ação principal.
- [ ] Números com `tabular-nums`; textos longos cortam com reticências.
- [ ] Ícones no estilo de traço do `ICON`, com `aria-hidden` e `aria-label` no botão.
- [ ] Animações com a curva padrão e desligadas em movimento reduzido.
- [ ] Funciona em 390 × 844, em tela cheia abaixo de 500px e no desktop acima de 900px (ajustes em `css/desktop.css`).
- [ ] Tela tem rota em inglês e aparece no `README.md` e no `telas.html`.
- [ ] Só preto e branco (sem azul, sem degradê); controles em formato pílula.
