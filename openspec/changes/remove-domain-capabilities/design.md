# Design

## Context

Ver `proposal.md` para a motivação. Este documento registra as cinco decisões
do dono citadas lá (D1, D2, D3, D4, D6), a medição por trás de cada uma, e uma
constatação — a dissolução de "Uma escala por gráfico" (D5) — que não é
decisão do dono, é consequência mecânica da forma de série que ele decidiu.

`packages/ui/src/organisms/charts/series.ts` (hoje) declara `ChartPoint` como
união de três formas (`resolved`/`unresolved`/`missing`, cada uma com
`category`, e as duas primeiras com `value` e `evidence` obrigatórios) e
`ChartSeries` com `measure` por série, usado só para o tipo `SingleMeasureRule`
recusar uma segunda escala. `palette.ts` já expõe `seriesColor(index)`, que
lança em execução quando `index` excede `CHART_SERIES_TOKENS.length` — o
limite de execução da decisão 2 não é mecanismo novo, é o que já existe,
menos a checagem de tipo redundante em cima dele.

## Goals / Non-Goals

**Goals:**
- Registrar, com a medição, as cinco decisões do dono citadas em
  `proposal.md`.
- Mostrar por que "Uma escala por gráfico" deixa de ter o que provar, sem
  decidir a pergunta do ponto aberto 7 (canal de tamanho).
- Apontar as consequências de código que a proposta não decide sozinha
  (guardião, mapa de exportações) para o `tasks.md` desta mudança.

**Non-Goals:**
- Não constrói nenhuma variante de átomo (`variant`, `size`, `disabled`,
  `loading`) — fora de escopo desde `docs/decisao-biblioteca-de-componentes.md`.
- Não decide se "escala" abrange o canal de tamanho (ponto aberto 7) — só
  constata que o requisito que hospedava a pergunta deixa de existir.

## Decisions

### D1 — Formatação de valor: função recebida, padrão `String(value)`

**Decisão do dono.** A variante tabular do átomo de texto genérico recebe um
`format?: (value: number) => string` opcional; sem ele, o padrão é
`String(value)`. Nenhum locale — `pt-BR` ou outro — cravado no componente.

**O que isso substitui:** hoje `NumericValue` chama
`new Intl.NumberFormat("pt-BR", format).format(value)` sempre, com `format`
só ajustando opções de `Intl.NumberFormatOptions` dentro do locale fixo. Um
átomo genérico não decide locale — decisão de quem compõe, não do átomo,
mesma razão já registrada para `weight`/`emphasis` em
`docs/decisao-biblioteca-de-componentes.md`.

**O que me faria mudar de ideia:** um consumidor real precisando do mesmo
formato em toda chamada seria razão para um valor padrão diferente de
`String(value)` — não é o caso hoje, não há consumidor de rota de negócio.

### D2 — Limite de séries: de `verify:types` para execução

**Decisão do dono.** `SeriesLimitRule`, `ExceedsSeriesLimit` e o truque de
tupla em `series.ts` saem. A garantia passa a ser só o que `seriesColor` já
faz: lançar ao pedir uma cor além de `CHART_SERIES_LIMIT`.

**O que medi:** `seriesColor(index)` (`palette.ts`, linhas 17–25) já lança
`` `série ${index + 1} sem cor: a paleta validada tem ${CHART_SERIES_LIMIT} cores` ``
quando o índice excede o comprimento de `CHART_SERIES_TOKENS`. A checagem de
tipo em `series.ts` reprovava o mesmo excesso antes, em `verify:types`, com
mensagem construída por template literal type. As duas garantiam a mesma
coisa, em dois estágios diferentes.

**O que concluo:** manter os dois é manter uma garantia duplicada — o texto
da decisão do dono a favor de uma delas (execução) é o que se aplica: o
requisito adicionado a `interface-charts` prova pela primeira que já lança,
não pela segunda, que sai.

**Impacto de forma:** com `SeriesLimitRule` fora, `ShapeChartProps` não
precisa mais do parâmetro de tipo `Title` só para compor a mensagem de erro
— mas isso é detalhe de implementação da tarefa que remover o arquivo, não
uma decisão de design.

### D3 — Teste de componente, e por que `Hatch`/`ChartHatchPattern` ficam

**Decisão do dono, tomada depois da primeira versão desta proposta.** A
primeira versão media a sobrevivência de `Hatch` pelo mesmo teste de
`rules.specs` que decide requisito — "o que quebra sem ele, hoje, no que está
construído" — e concluía que, sem consumidor, `Hatch` devia ficar
desconectada, capacidade desligada de propósito. O dono corrigiu o teste, não
só a conclusão: **o teste de um componente de biblioteca é ser genérico,
nunca ter consumidor.** Biblioteca de UI é inventário — componente genérico
sem consumidor construído é catálogo, não lacuna. A distinção entrou em
`rules.specs` de `openspec/config.yaml` nesta mesma data (ver proposal.md), e
o registro completo, com a razão de cada átomo afetado, está em
`docs/decisao-biblioteca-de-componentes.md`.

**Decisão, aplicada aos gráficos.** `Hatch` (`atoms/hatch/`) e
`ChartHatchPattern` (`organisms/charts/hatch-pattern/`) ficam — a primeira já
passava no teste corrigido por ser puramente genérica; a segunda ganha um
motivo direto para ficar: o ponto do gráfico passa a aceitar uma opção
genérica de preenchimento, `fill?: "solid" | "textured"`, padrão `"solid"` —
escolha visual de quem compõe, sem estado nem significado de negócio
atribuído a ela. Com as duas definições de hachura em uso de novo, o
requisito "A hachura é uma só" continua tendo o que provar: migra para
`interface-charts`, em vez de sair com o resto de `domain-charts`.

**O que muda em código, fora desta proposta:** `plot.tsx` passa a ler
`fill` do ponto (quando presente) para escolher entre preenchimento sólido e
o padrão de `ChartHatchPattern`, sem nenhuma referência a "não resolvido" ou
a qualquer outro nome de estado — o campo é só visual.

### D4 — `NumericValue` dissolvido; formatação em hook; figura tabular como variante de texto

**Decisão do dono.** `NumericValue` deixa de ser componente próprio. A
formatação de número vira um hook (recebe o valor e a função de formatação
opcional de D1, devolve a string formatada); o que sobra da exibição de
número tabular — o alinhamento de dígito por coluna que "Número alinha em
coluna" exige — vira uma variante do átomo de texto genérico. Nenhuma outra
variante nova entra nesta mudança: não é o momento de `variant`/`size` em
`Button`, nem de qualquer outro eixo que não seja este.

**O que medi:** `atoms/numeric-value/numeric-value.tsx` hoje é
essencialmente `Intl.NumberFormat` mais `<span>` com classe de
peso/destaque — a mesma forma de `Text`, com formatação de número embutida em
vez de `children` livre. A única garantia que `Text` não cobre hoje é o
alinhamento tabular (dígito de largura fixa), que é propriedade de fonte
(`font-variant-numeric: tabular-nums` ou token equivalente), não de lógica de
componente.

**O que concluo:** um segundo componente só para "Text, mas com um hook de
formatação e uma classe CSS a mais" duplica `Text` sem ganhar isolamento —
mesma razão que `docs/decisao-biblioteca-de-componentes.md` já usou para
preferir variante a componente novo quando a diferença é raso.

### D5 — "Uma escala por gráfico" deixa de ter o que provar

**Não é decisão do dono — é consequência da forma de série que ele decidiu.**
Medido: a forma nova é `{ name, points: [{ category, value }] }`, "e nada
mais" — sem `measure` por série. Hoje, `SingleMeasureRule` existe porque cada
série podia declarar sua própria `measure`, e o tipo recusava duas séries com
`measure` diferente no mesmo gráfico. Sem `measure` por série, não há campo
onde uma segunda escala pudesse ser declarada — a escala é só do gráfico
(`ChartMeasure` no nível do componente), uma vez, por construção da forma de
entrada, não por checagem de tipo sobre uma união.

**O que concluo:** o requisito descrevia um erro que a própria forma nova não
admite mais expressar. Isso fecha o ponto aberto 7 de
`docs/pontos-abertos.md` como constatação, não como decisão — a pergunta
original ("escala abrange o canal de tamanho?") continua sem resposta; o que
deixa de existir é o requisito em que ela se apoiava. Se um dia uma forma
"bolha" (ponto 7) precisar de uma segunda magnitude codificada em tamanho, a
pergunta volta, presa a um requisito novo, específico daquela forma — não a
este.

**O que me faria mudar de ideia:** encontrar, no que está construído hoje, um
caso em que duas séries do mesmo gráfico já usam escalas diferentes — não é o
caso; `ChartMeasure` sempre foi singular no nível do componente, e `measure`
por série nunca teve mais de um valor distinto usado dentro do mesmo gráfico
em nenhuma história existente.

### D6 — `DeclaredAbsence` sai; `EvidenceAnchor` vira `Link`

**Decisão do dono, tomada depois da primeira versão desta proposta** —
registrada com a razão completa em
`docs/decisao-biblioteca-de-componentes.md` ("Decisão de 2026-09-28...") e em
`proposal.md`; aqui só a diferença que o teste de componente (D3) faz entre
os dois átomos, porque à primeira vista os dois pareciam estar na mesma
situação de `Hatch` — sem consumidor construído depois que
`BlockedProjection`, `StatusPanel` e a coluna de evidência de
`ChartValueTable` saem.

**O que concluo:** o teste de componente (D3) não é "sem consumidor, então
fica" incondicional — é "genérico, então fica". `Hatch` é textura pura, sem
vocabulário nenhum: qualquer consumidor futuro, de qualquer domínio, pode
usá-la sem mudar o átomo. `DeclaredAbsence` e `EvidenceAnchor` não estavam na
mesma forma:

- `DeclaredAbsence.kind` vale `"blocked"` ou `"unknown"` — os dois nomes são
  vocabulário de domínio (`projection_status = blocked`,
  `date_precision = unknown`), não uma variante genérica que sobra depois de
  tirar o domínio. Sai.
- `EvidenceAnchor` já era, na prática, um link com nome acessível
  obrigatório — nada na sua forma (`href`, nome acessível, sem depender só de
  ícone ou posição) nomeia evidência. O nome e o vocabulário ao redor dele é
  que eram de domínio. Generaliza para `Link` (`href` + conteúdo), sem perder
  garantia nenhuma.

## Risks / Trade-offs

- **[Risco] Remover `molecules/domain/` e `organisms/domain/` inteiras é diff
  grande em arquivos que a verificação já cobre (barris, guardião de
  perímetro).** → Mitigação: ordem de construção em `tasks.md` remove por
  camada (componente → barril → guardião → mapa de exportações), com
  `pnpm verify` passando a cada etapa, não um commit só.
- **[Risco] `tools/checks/component-vocabulary.test.ts` reprova perímetro
  nomeado sem componente — remover o componente antes da entrada do guardião
  quebra `pnpm verify` no meio da mudança.** → Mitigação: `tasks.md` remove a
  entrada do guardião na mesma tarefa que esvazia a pasta correspondente,
  nunca em tarefas separadas.
- **[Risco] `fill: "textured"` no ponto do gráfico divergir da definição de
  `Hatch` se as duas formas do SVG forem mantidas por implementações
  separadas.** → Mitigação: o requisito "A hachura é uma só", migrado para
  `interface-charts`, prova isso diretamente — `ChartHatchPattern` deriva da
  mesma definição de `Hatch` (mesmo período, mesmo ângulo,
  `@chargebr/tokens`), não duas constantes copiadas.

## Migration Plan

Sem rollback formal — mesma razão de `interface-atomic-structure`: reestrutura
arquivo-fonte dentro de um pacote não publicado (`private: true`), sem
consumidor fora do monorepo. Cada etapa de `tasks.md` é revertível por commit
único, com `pnpm verify` validando antes da próxima. A ordem geral: (1) forma
de dado do gráfico primeiro (`series.ts`, `palette.ts` consumido direto), (2)
componentes de gráfico que dependiam da forma antiga, (3) átomos e moléculas
de domínio, (4) barris e guardião, (5) mapa de exportações do pacote.
