# Partiu — padrão de design

Guia para quem (pessoa ou agente) for criar ou mudar telas do Partiu. Tudo aqui foi tirado do que já existe em `css/` e `js/`. Se algo novo não couber nestas regras, siga o componente mais parecido que já existe antes de inventar outro.

## Princípios

1. **Litoral, vidro e azul-marinho.** A identidade vem de fotos reais do litoral em tela cheia, com controles de vidro fosco por cima. O destaque é o azul-marinho `--brand`; o texto é grafite `--ink` sobre branco. Referências: apps de viagem com foto grande, cartões de foto com local e seta, barra de navegação escura flutuante.
2. **Um celular de 390 × 844.** Tudo é desenhado dentro de `.phone`. No desktop ele fica centralizado com moldura; abaixo de 500px ocupa a tela inteira.
3. **Selecionado = azul.** Um item escolhido troca para fundo `--brand` e texto branco. Não use outra cor, sombra extra ou ícone de check para indicar seleção.
4. **Foto em primeiro lugar.** Sobre foto: degradê escuro embaixo para o texto branco e vidro fosco (`--glass`, `--glass-line`, `backdrop-filter: blur`) nos controles. Fora da foto: bordas finas de 1px e sombras suaves só no que flutua.
5. **Toque confortável.** Toda área clicável tem no mínimo 44 × 44px (botões principais 56px de altura).
6. **Muito movimento, sempre suave.** Entradas em cascata, fotos que respiram (zoom lento), pinos que caem, toques com resposta. Fica em `css/motion.css` e tudo respeita `prefers-reduced-motion`.

## Marca

- Logo em `brand/`: o símbolo é um pino de mapa branco com furo redondo, num quadrado arredondado azul-marinho liso (`#134A8E`). O nome "Partiu" vai em peso bold, sem itálico, na fonte do sistema.
- Arquivos: `logo.svg` (azul) e `logo-branco.svg` (sobre foto), `icon.svg`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `avatar.png` (GitHub) e `social-preview.png` (1280 × 640).
- Toda página nova leva o favicon e `theme-color #134A8E` no `<head>`, como `app.html` e `index.html`.
- Para mudar a marca, edite `brand/gerar.py` e rode `python3 -I brand/gerar.py`.

## Cores

Os tokens ficam em `:root` no `css/base.css`. Use sempre a variável quando existir.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#EEF0F4` | fundo da página, atrás do celular |
| `--surface` | `#FFFFFF` | fundo das telas, cartões, painéis |
| `--fill` | `#F3F4F7` | fundos suaves: campo de busca, item ativo, miniaturas, trilho de progresso |
| `--line` | `#E6E8ED` | divisórias, bordas de cartão, botão desativado |
| `--ink` | `#1B1F27` | texto principal, barra de navegação flutuante |
| `--brand` | `#134A8E` | botão primário, estado selecionado, destaque nos títulos, rota no mapa |
| `--brand-deep` | `#0D3466` | hover do botão primário, fundos azuis escuros |
| `--brand-soft` | `#E3ECF7` | selos e fundos azuis claros |
| `--glass` / `--glass-line` | branco 16% / 34% | vidro fosco sobre foto (com `backdrop-filter: blur(14–16px)`) |
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

Categorias do orçamento usam três tons de azul (`#134A8E`, `#5B86C2`, `#B9CDE8`), definidos em `ALLOC` no `js/core.js`.

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

| Raio | Onde |
| --- | --- |
| 48px | moldura do celular (branca) |
| 28px | ilustração da apresentação |
| 20–22px | painéis que sobem de baixo (`20px 20px 0 0`), cartões de deslizar, estados vazios |
| 16–18px | cartões (bento, categorias, cartão da viagem) |
| 999px | botões primário, secundário e contornado (pílula) |
| 14px | cartões de lista, chips de dia, miniaturas de foto |
| 12px | botões de ícone, busca, miniaturas, chips de horário |
| 8–10px | controles segmentados, etiquetas pequenas |
| 50% / altura÷2 | pílulas, botões redondos, pins, pontos |

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
- `.tabbar` — barra escura (`--ink`) flutuante em pílula, com 2 abas (Explorar e Roteiro); a atual fica em pílula azul `--brand`.

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
- Toda tela nova precisa entrar também na prévia do `telas.html` e na tabela de endereços do `README.md`. A página de apresentação é o `index.html`.
- Bibliotecas externas só via cdnjs com versão fixa (ex.: Leaflet 1.9.4). O CSS do Leaflet está embutido em `map.css`.
- HTML gerado em JS passa pelo `esc()` quando mostra texto vindo de dados.
- Variações de design que não entraram no app ficam em `explorations/` como referência.

## Antes de entregar uma tela

- [ ] Só usei os tokens e cinzas listados acima; destaque sempre em `--brand`.
- [ ] Seleção é fundo `--brand` + texto branco, via `aria-pressed`/`aria-current`.
- [ ] Alvos de toque com 44px ou mais; uma única ação principal.
- [ ] Números com `tabular-nums`; textos longos cortam com reticências.
- [ ] Ícones no estilo de traço do `ICON`, com `aria-hidden` e `aria-label` no botão.
- [ ] Animações com a curva padrão e desligadas em movimento reduzido.
- [ ] Funciona em 390 × 844 e em tela cheia abaixo de 500px.
- [ ] Tela aparece no `telas.html` e no `README.md`.
