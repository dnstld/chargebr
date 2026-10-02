# Design

## Context

`nav-rail-shell` (arquivado em 2026-10-01) entregou o conjunto fixo
`color.nav.*` e a checagem própria dele. Ver `proposal.md` para o que ficou
devendo. Este ciclo não reabre nenhuma decisão daquele: a moldura continua
escura nos dois temas, a árvore continua por divulgação, e a forma da tela
continua a mesma.

Estado medido na main antes de propor, com os valores correntes:

| Par | Razão | Piso do papel |
| --- | --- | --- |
| `color.nav.text-muted` × `color.nav.rail` | 4,059:1 | — |
| `color.nav.text-muted` × `color.nav.panel` | 3,780:1 | — |
| `color.nav.text-muted` × `color.nav.edge` | 3,045:1 | — |
| `{color.gray.400}` × `color.nav.panel` | 6,515:1 | 4,5:1 (texto) |

O tom apagado não tem piso declarado na tabela acima porque **o papel dele
hoje é ambíguo**: o nome diz texto, os três consumidores são objeto gráfico
(`nav-folder-trigger.muted`, `nav-leaf.dot`, `nav-rail-item.color`). É a
ambiguidade que este ciclo desfaz.

## Goals / Non-Goals

**Goals:**
- Dar ao tom apagado de texto um valor que sustente 4,5:1, e ao tom gráfico um
  nome que diga o que ele é.
- Fazer a checagem do conjunto fixo medir cada token, com o piso do papel.
- Fechar os dois afastamentos visuais da maquete que a bancada mostrou.

**Non-Goals:**
- Mudar qualquer outro token do conjunto fixo, ou a aparência de qualquer
  componente além do efeito direto das quatro mudanças.
- Tocar `apps/`, o guardião de vocabulário, ou o ponto 21.

## Decisions

### D1 — O tom se parte em dois; nenhum valor da maquete é descartado

`color.nav.text-muted` passa a `{color.gray.400}` (6,515:1 contra o painel) e
`color.nav.glyph` nasce com `{color.gray.500}` — o tom da maquete, no papel em
que ele cumpre o piso (3:1 de objeto gráfico: 3,045:1 a 4,059:1 contra as três
superfícies).

Os três consumidores atuais de `text-muted` são objeto gráfico e passam a
`glyph`; **nenhum deles muda de cor na tela.** O que muda de valor é o token de
texto, que hoje não tem consumidor nenhum — ou seja, esta mudança não altera
um pixel do que já está construído, e desarma a falha que o próximo consumidor
de texto encontraria.

**Alternativa descartada:** manter um tom só e aceitar 3,780:1 para texto.
Recusada pelo piso — e pela regra já registrada em `design-tokens` de que
superfície alguma é isentada da varredura.

**Alternativa descartada:** renomear `text-muted` para `glyph` e não ter tom de
texto apagado. Recusada porque a maquete tem três textos apagados (rótulo de
seção, contagem, linha da organização): o nível existe no desenho, e some do
sistema se não tiver token.

### D2 — A cobertura é o que transforma "medido" em "medido de verdade"

A checagem passa a declarar, para cada token do conjunto, os pares em que ele
aparece — e a reprovar quando um token do conjunto não aparece em nenhum. Os
pares continuam declarados, e não o produto cartesiano: `nav-leaf.current.meta`
só existe sobre a pílula, e o tom apagado nunca cai sobre ela; multiplicar tudo
por tudo fabricaria reprovação de par que não acontece na tela.

**Por que não descobrir os pares sozinho, como a varredura por tema faz:**
lá, o papel de cada token está no prefixo do nome (`color-surface-*` é fundo,
`color-action-*` é primeiro plano), e o par é a combinação de todos com todos.
Aqui, o que é fundo e o que é primeiro plano não está no nome, e qual primeiro
plano pousa sobre qual fundo é fato de desenho. A cobertura é o que mantém a
declaração honesta sem fingir uma descoberta que o nome não sustenta.

### D3 — Os dois ajustes visuais, por estrutura e não por número

- **Marca na barra de conteúdo:** a regra vale só dentro de
  `.frame[data-shape="shell"]`, onde a barra existe. A moldura sem trilha nem
  navegação — a de `apps/backoffice` — continua sem regra nova, e o documento
  emitido continua o mesmo.
- **Página de primeiro nível:** ganha um vão do tamanho do chevron da pasta
  (`1em`, que é o que `Icon` mede), em vez de um recuo escrito à mão. Assim o
  alinhamento acompanha a tipografia: se a fonte da árvore mudar, ele continua
  alinhado.

## Risks / Trade-offs

- **[Risco]** Trocar o valor de um token semântico pode afetar consumidor que
  ninguém lembrou. **Mitigação:** medido — `color.nav.text-muted` tem três
  consumidores, todos listados, e os três passam a `glyph` com o mesmo valor
  de hoje; o token de texto fica sem consumidor até alguém adotá-lo.
- **[Trade-off]** A checagem do conjunto fixo fica mais longa, com a lista de
  pares escrita à mão. É o preço de medir o que o nome não diz; a cobertura
  impede que a lista fique menor que o conjunto.

## Migration Plan

Sem produção envolvida. Ordem: tokens primeiro (valor, token novo, os três
consumidores), com a checagem nova passando; depois os dois ajustes de CSS e
componente, com as histórias da bancada; `pnpm verify` no fim.

O commit local `64396ce` (branch `feat/nav-rail-shell`, nunca empurrada) carrega
os quatro itens numa implementação anterior da moldura, feita sobre a main de
antes de `nav-rail-shell` ser mergeado. Ele é fonte de aproveitamento — valores,
pares, texto de comentário —, nunca de aplicação direta: a moldura na main tem
outra estrutura de arquivo e outros nomes de token de componente, e um
`git cherry-pick` conflitaria em quase todos eles.
