# Cor de ação do tema escuro

## Why

A cor de ação do tema escuro reprova AA, e reprova de duas maneiras diferentes.
Em repouso, `color.action.primary` (`indigo.400`, `#706FE2`) sustenta 4,578:1
contra `surface.base` e 4,263:1 contra `surface.raised` e `chart.surface`:
passa numa superfície e reprova nas outras duas. Em hover,
`color.action.primary-hover` carrega `indigo.600` (`#4640A7`) — o **mesmo valor
do tema claro**, nunca invertido —, e com `text.on-action` (`gray.950`) por cima
dá 2,308:1, menos da metade do piso, no estado em que a pessoa está
interagindo. Os mesmos pares no tema claro dão 12,210:1 em repouso e 8,230:1 em
hover.

Nada na verificação atual mede esses pares. A checagem de paleta mede séries de
gráfico contra a superfície de gráfico; o axe mede o que a história renderiza, e
não sabe passar o ponteiro. O defeito sobreviveu a seis ciclos porque ninguém o
media.

## What Changes

- Acrescenta dois primitivos à família índigo — `indigo.300` (`#8788FE`) e
  `indigo.200` (`#A8AEFE`) —, que são a ponta clara da rampa que o tema escuro
  precisa e que hoje não existe.
- Reaponta três referências semânticas do tema escuro: `color.action.primary` e
  `color.focus.ring` para `indigo.300`, `color.action.primary-hover` para
  `indigo.200`. Nenhum valor primitivo existente muda.
- Acrescenta à verificação duas checagens de contraste por execução, sobre os
  tokens resolvidos dos dois temas: cor de ação contra todas as superfícies
  neutras do tema, e par repouso/hover contra `text.on-action`.
- Declara o que a superfície de gráfico **não** hospeda — texto interativo —, e
  prova essa declaração por execução, nas histórias de gráfico, nos dois temas.
- Fecha o conjunto de superfícies: a superfície de gráfico de cada tema precisa
  ser uma das superfícies neutras declaradas do tema, e não um quarto valor que
  escaparia da checagem da cor de ação.

Nada disto é **BREAKING**: os nomes de token e a forma das saídas não mudam.
O que muda é o valor resolvido de três tokens semânticos no tema escuro.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `design-tokens`: ganha dois requisitos ADICIONADOS — cor de ação legível
  contra toda superfície neutra do tema, e estado de interação com legibilidade
  provada — e um requisito MODIFICADO, "Superfícies de gráfico declaradas por
  tema", que passa a declarar que a superfície de gráfico não hospeda texto
  interativo e que ela é uma das superfícies neutras do tema.

## Impact

- **Pacote:** `packages/tokens` — a fonte DTCG (`primitive/color.json`,
  `semantic/dark.json`) e um arquivo de teste novo. As saídas geradas
  (`generated/tokens.css`, `generated/tokens.ts`) mudam por regeração, nunca à
  mão.
- **Pacote:** `packages/ui` — uma afirmação a mais nas histórias de gráfico, sem
  mudança de componente e sem token novo consumido.
- **Dependências novas:** nenhuma. `culori` já é dependência de
  `@chargebr/tokens` e é o que a checagem de paleta usa.
- **Verificação:** nenhum estágio novo. As duas checagens entram no estágio de
  testes de `pnpm verify`, como a checagem de paleta.
- **Intocados:** `color.chart.series.1/2/3` nos dois temas, `apps/`, `src/`,
  `tests/`, `data/`, `queries/`, `supabase/`.

## A série 1 não muda, e por quê

`color.chart.series.1` no tema escuro referencia `indigo.400`, hoje o mesmo
primitivo de `color.action.primary`. A restrição do ciclo é que a decisão não
pode alterar `color.chart.series.1/2/3` sem reexecutar as seis checagens de
paleta categórica.

**O que esta mudança faz: muda apenas a referência semântica.** `indigo.400`
conserva o valor `#706FE2`, byte a byte, e `color.chart.series.1` continua
apontando para ele. O que sai de `indigo.400` é `color.action.primary`, que
passa a apontar para `indigo.300`.

**O que isso obriga a reverificar:** nada na paleta categórica. As entradas das
seis checagens — as três séries e a superfície de gráfico de cada tema — são
idênticas às do ciclo 2. As checagens seguem rodando em toda verificação, como
sempre rodaram, e o relatório por tema precisa sair com os mesmos piores pares e
as mesmas distâncias de antes. É isso, e só isso, que a tarefa de regressão
confere: igualdade com o registro anterior, não uma nova decisão de paleta.

A alternativa recusada era mudar o valor de `indigo.400` para clarear a cor de
ação. Ela arrastaria `color.chart.series.1` junto e obrigaria a reexecutar as
seis checagens como decisão, não como regressão — custo sem retorno, quando um
primitivo novo resolve o mesmo problema sem tocar em nada verificado.

## O que esta mudança não faz

- Não entrega nada em `apps/`: nenhum shell, nenhum layout, nenhuma rota.
- Não cria componente de botão, nem história de botão. `button.json` continua
  sendo o mínimo da camada de componente, e o par de ação é provado nos tokens,
  que é onde ele é mensurável — o estado de hover não é alcançável pelo axe.
- Não mexe no tema claro. Os valores de `action.primary`, `action.primary-hover`
  e `focus.ring` no claro ficam como estão; eles entram nas checagens novas como
  qualquer outro tema, e passam.
- Não mexe na paleta categórica, nos limiares de `palette.ts`, no modelo de
  simulação de daltonismo nem nas superfícies de gráfico declaradas.
- Não acrescenta estágio a `pnpm verify` nem dependência ao repositório.
- Não define cor de ação secundária, destrutiva, de status ou de link visitado —
  entram quando houver componente que as exija.
