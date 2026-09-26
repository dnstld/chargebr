# Design

## Context

Ver `proposal.md` — Why. Os três requisitos vivos em
`openspec/specs/design-tokens/spec.md` (linhas 76–263 na versão corrente, do
início do primeiro requisito ao fim dos cenários do terceiro) misturam
obrigação e razão no corpo. `openspec/config.yaml` em `rules.specs`
exige, desde o ciclo 7, que o corpo contenha só o que obriga, com a razão num
bloco `**Por quê:**` — regra que o próprio ciclo 7 não cumpriu nestes três
requisitos porque o retrofit teria misturado redação editorial com conteúdo
normativo novo (ver ponto 5 de `docs/pontos-abertos.md`). Este ciclo separa as
duas coisas: primeiro decide a forma (este ciclo), depois — se algum dia
precisar — decide conteúdo novo (outro ciclo).

O comportamento do sistema — quais tokens existem, quais pisos valem, o que a
checagem de contraste e a de paleta reprovam, como cada gráfico se comporta —
não muda. Há, porém, uma peça de código nova: uma das quatro obrigações
implícitas explicitadas (nome do gráfico, legenda, ausências declaradas e
representação em texto na superfície da página) não tinha afirmação executada
que a provasse. O dono do repositório decidiu, depois da primeira leitura
deste change, que ela ganha teste nesta mesma mudança, em vez de ficar
registrada como lacuna para um ciclo futuro. Este documento registra como
cada frase foi classificada (obrigação, razão, ou obrigação implícita a
explicitar), para cada obrigação recém-explicitada qual teste a prova, e como
o teste novo funciona.

## Goals / Non-Goals

**Goals**
- Corpo de cada um dos três requisitos contém só o que obriga.
- Toda frase que hoje decide algo sem `SHALL` passa a ser obrigação explícita
  — ou, se for redundante com uma obrigação já existente no mesmo requisito
  (caso do "diagnóstico não reprova sozinho"), é reduzida a razão da
  obrigação existente, em vez de duplicá-la.
- Toda obrigação explicitada nomeia o teste que a prova. Uma delas não tinha
  teste; ganha um nesta mudança, e o cenário novo nomeia esse teste — a
  obrigação não fica só registrada.

**Non-Goals**
- Não decide se o piso de 3:1 devia ser outro, se a superfície de gráfico
  devia existir, ou qualquer outro conteúdo normativo. Isso alteraria
  comportamento e pediria proposta própria.
- O teste novo prova exatamente a obrigação explicitada — onde cada elemento
  de texto é pintado —, não um detalhe de implementação que por acaso a
  cumpre hoje. Não usa o atributo `data-plot` como critério de superfície.
- Não toca as demais nove requisitos de `design-tokens`, nem qualquer outra
  capability, nem a capability `domain-charts` — o teste novo mora em
  `packages/ui`, mas prova uma obrigação de `design-tokens`, do mesmo jeito
  que `expectNoInteractiveInPlot` já prova hoje.

## Decisions

### Classificação de cada frase

Cada requisito foi lido frase a frase e classificado em quatro grupos:

1. **Obrigação** (já tem `SHALL`/`SHALL NOT`, decide algo testável) — fica no
   corpo, sem alteração de sentido.
2. **Obrigação implícita** (decide algo testável, mas sem `SHALL`) — reescrita
   como obrigação explícita, no corpo. É o caso das quatro frases listadas em
   `proposal.md` — What Changes.
3. **Razão** (explica por quê, não decide nada por si — removê-la não muda o
   que é exigido) — move para `**Por quê:**`.
4. **Meta-instrução de leitura** (usa `SHALL`, mas não obriga comportamento do
   sistema — instrui como ler outra cláusula) — perde o `SHALL`, vira razão.
   Duas ocorrências, ambas no requisito "Estado de interação com
   legibilidade provada": "é assim que esta cláusula SHALL ser lida" e "a
   varredura SHALL continuar sem reprovar" para um token futuro — esta
   segunda já está coberta pela obrigação existente "Nenhum diagnóstico
   SHALL reprovar sozinho", então vira ilustração da razão, não obrigação
   duplicada.

O resultado de cada classificação está em
`specs/design-tokens/spec.md` deste change.

### Mapeamento obrigação explicitada → teste

| Obrigação explicitada | Requisito | Teste que já prova |
| --- | --- | --- |
| Superfície neutra nova entra na checagem sem edição do teste | Cor de ação legível... | `packages/tokens/src/contrast.test.ts` — "superfície neutra nova entra na varredura sem editar este arquivo" (cenário "Superfície neutra nova entra na checagem sem editar o teste", já existente) |
| Piso de 3:1, e não o de texto, para as séries da paleta contra a superfície de gráfico | Superfícies de gráfico... | `packages/tokens/src/palette.test.ts` — "o critério declara o modelo de simulação e os limiares" (declara `THRESHOLDS.surfaceContrastFloor = 3`) e "contraste insuficiente contra a superfície reprova nomeando a série e o tema" (planta série abaixo de 3:1). Novo cenário "Série da paleta abaixo do piso de objeto gráfico reprova nomeando a série e o tema" nomeia este segundo teste, que hoje prova a obrigação sem que nenhum cenário o cite. |
| A superfície de gráfico não declara hover nem foco | Superfícies de gráfico... | `packages/ui/src/charts/chart.assert.ts` — `expectNoInteractiveInPlot`, executada em toda história de gráfico (cenário existente "Elemento interativo na superfície de gráfico reprova"): sem elemento alcançável por foco ou que responda a ponteiro, não há hover nem foco possíveis. Nenhum cenário novo — o existente já cobre a consequência. |
| `color.focus.ring` repete o primitivo da cor de ação | Cor de ação legível... | `packages/tokens/src/contrast.test.ts` — "anel de foco descolado da cor de ação reprova nomeando os dois primitivos" (cenário existente, inalterado) |
| Nome do gráfico, legenda, ausências declaradas e representação em texto ficam na superfície da página | Superfícies de gráfico... | `packages/ui/src/charts/chart.assert.ts` — `expectTextOutsideChartSurface`, teste novo. Cenário novo "Texto do gráfico movido para a superfície de gráfico reprova" nomeia este teste. |

### Nome do gráfico, legenda, ausências e tabela ficam na superfície da página

Esta é a quarta obrigação implícita explicitada. Não tinha teste até esta
mudança: `packages/ui/src/charts/chart.tsx` renderiza `figcaption` (nome),
`ChartLegend`, a lista de ausências e `ChartValueTable` como irmãos de
`.plot` dentro de `<figure data-chart>` — nunca dentro dele — e
`chart.module.css` (linhas 27–36) só aplica
`background-color: var(--color-chart-surface)` a `.plot`, com o comentário:
"O texto ao redor — nome, legenda, ausências, tabela — fica na superfície da
página". Isso é o que o código faz hoje, mas nenhuma afirmação executada
conferia isso: `chart.assert.ts` tinha `expectNoInteractiveInPlot`, que varre
`[data-plot]` procurando interativo, e nada que varresse `figcaption`,
`[data-legend]`, `[data-absences]` ou `[data-value-table]` procurando onde
cada um é pintado.

**Decisão: o teste novo identifica a superfície pela cor que ela pinta, não
pelo atributo que a marca.** `expectNoInteractiveInPlot` já existente usa
`[data-plot]` diretamente — é a marcação de hoje, e funciona para "não há
interativo dentro do desenho". Mas a obrigação nova é sobre onde um elemento
de texto **é pintado**, e "onde" é uma pergunta sobre cor computada, não sobre
atributo. Se `expectTextOutsideChartSurface` também procurasse por
`[data-plot]`, uma reforma que renomeasse o atributo ou mudasse a técnica de
marcação — sem mover nenhum elemento de texto — faria o teste reprovar por um
motivo que não é o que a obrigação proíbe. Por isso ele funciona assim:

1. Resolve a cor computada de `--color-chart-surface` no tema corrente,
   independente de qual nó a usa hoje: cria um elemento de sondagem dentro do
   gráfico com `background-color: var(--color-chart-surface)` e lê
   `getComputedStyle` sobre ele. É a mesma técnica já usada em
   `evidence-anchor.stories.tsx` e `status-marker.stories.tsx` para conferir
   cor computada.
2. Para cada um dos quatro elementos — `figcaption` (nome), `[data-legend]`
   (legenda), `[data-absences]` (ausências) e `[data-value-table]` (tabela) —
   sobe pela árvore de ancestrais dentro do gráfico até achar o primeiro fundo
   não transparente, e lê a cor computada dele. Esse é "de que superfície o
   elemento está pintado", com ou sem `[data-plot]` no meio do caminho.
3. Reprova, nomeando o elemento, se essa cor bater com a da sondagem.
4. Roda em toda história de gráfico existente (`bar`, `dot`, `line`,
   `stacked-bar`, `small-multiples`), nos dois temas — mesmo padrão de
   `expectNoInteractiveInPlot`, chamada ao lado dela.

Elementos ausentes (legenda com uma série só, ausências quando não há ponto
ausente, gráfico bloqueado sem legenda nem tabela) são ignorados pela
afirmação, e não contam como violação — a obrigação é sobre onde um elemento
mora quando ele existe, não sobre obrigar sua existência.

**Prova de que o teste reprova quando deveria:** como os outros testes de
plantio em código de gráfico — a "elemento focalizável plantado dentro da
superfície de gráfico" do requisito vizinho —, a prova é um plantio manual
durante a implementação, e não um teste sintético permanente: mover um dos
quatro elementos para dentro do nó que hoje pinta `--color-chart-surface`,
rodar `pnpm verify`, confirmar que a nova afirmação reprova nomeando o
elemento nos dois temas, revert. Ver `tasks.md`. O precedente deste padrão
está em `openspec/changes/archive/2026-09-22-dark-action-color/tasks.md`,
tarefa 5.4.

## Risks / Trade-offs

- **[Risco] `color.chart.surface` e `color.surface.base` coincidem em valor
  no tema claro hoje (`#ffffff` nos dois, conforme `contrast.test.ts`).**
  Comparar só cor, sem limitar onde procurar, apagaria a diferença entre
  "pintado pela página" e "pintado pelo gráfico" nesse tema — todo elemento
  da página bateria com a cor da sondagem por coincidência. → Mitigação: a
  busca por ancestral pintado nunca sai da árvore de `<figure data-chart>`;
  ela para no próprio gráfico e devolve "transparente" se nenhum ancestral
  dentro dele tiver fundo próprio, em vez de continuar até `body` e herdar o
  fundo da página. É esse limite, não o valor da cor, que preserva a
  distinção mesmo quando os dois tokens coincidem.
- **[Risco] Redação de `**Por quê:**` mais longa que o corpo, no requisito
  "Superfícies de gráfico..."** → Mitigação: mediana de 4 linhas é do corpo
  vivo, não do par corpo+razão; o padrão já existente em
  `openspec/specs/backoffice-shell/spec.md` (por exemplo, o requisito "Tema
  sem script") tem blocos `**Por quê:**` de tamanho comparável.

## Migration Plan

Não há migração de dado ou API. A mudança de texto em
`openspec/specs/design-tokens/spec.md` chega lá pela sincronização normal no
arquivamento (`/opsx:archive tokens-obligation-form`, com "Sync now"), depois
de mergeado. Como agora há uma tarefa de código — `expectTextOutsideChartSurface`
em `packages/ui/src/charts/chart.assert.ts`, mais a chamada dela em cada
história de gráfico —, o ciclo segue os três pull requests normais de
`CLAUDE.md`, na ordem: `docs/tokens-obligation-form-proposal` (só
`openspec/changes/tokens-obligation-form/`), `feat/tokens-obligation-form`
(o teste novo e a chamada nas histórias) e `docs/archive-tokens-obligation-form`
(arquivamento e sincronização). A ideia inicial de propor e arquivar no mesmo
pull request — por não haver implementação — não se aplica mais.
