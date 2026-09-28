# Design

## Context

Ver `proposal.md` para a motivação. Este documento registra as quatro
decisões do dono citadas lá, a medição por trás de cada uma, e uma quinta
constatação — a dissolução de "Uma escala por gráfico" — que não é decisão do
dono, é consequência mecânica da forma de série que ele decidiu.

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
- Registrar, com a medição, as quatro decisões do dono citadas em
  `proposal.md`.
- Mostrar por que "Uma escala por gráfico" deixa de ter o que provar, sem
  decidir a pergunta do ponto aberto 7 (canal de tamanho).
- Apontar as consequências de código que a proposta não decide sozinha
  (guardião, mapa de exportações) para o `tasks.md` desta mudança.

**Non-Goals:**
- Não decide o destino de `DeclaredAbsence` e `EvidenceAnchor` — registrado
  em `proposal.md`, "Decisões em aberto", porque mudaria a lista de tarefas
  conforme a resposta, e por isso não pode ficar aqui como pergunta adiável.
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

### D3 — Hachura: desconectada dos gráficos, capacidade desligada de propósito

**Decisão do dono.** `Hatch` continua exportada, com sua própria história.
Os gráficos deixam de desenhá-la para pontos não resolvidos ou ausentes.
Gatilho de reativação: o primeiro consumidor real que precisar dela — mesma
forma de decisão já usada para a variante vertical de `Logo`
(`docs/decisao-biblioteca-de-componentes.md` não a menciona, mas o padrão é
o mesmo de "não invento sem consumidor").

**O que muda em código, fora desta proposta:** `organisms/charts/hatch-pattern/`
(o padrão SVG que `plot.tsx` usa para desenhar hachura dentro do gráfico) sai
— era usado só para o estado "não resolvido", que não existe mais na nova
forma de ponto. O átomo `Hatch` (`atoms/hatch/`), sua história e o requisito
"A hachura é uma só" (que garantia que as duas definições não divergiam) —
esse requisito sai porque não há mais duas definições para divergir, não
porque a hachura em si perdeu garantia.

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
- **[Trade-off] `DeclaredAbsence` e `EvidenceAnchor` ficam bloqueados até o
  dono decidir o destino (proposal.md).** Isso significa que a árvore, depois
  desta mudança aplicada até esse ponto, ainda referencia os dois átomos sem
  consumidor — aceitável porque nenhuma outra tarefa depende da resposta, e
  os dois continuam funcionando (só sem quem os use).

## Migration Plan

Sem rollback formal — mesma razão de `interface-atomic-structure`: reestrutura
arquivo-fonte dentro de um pacote não publicado (`private: true`), sem
consumidor fora do monorepo. Cada etapa de `tasks.md` é revertível por commit
único, com `pnpm verify` validando antes da próxima. A ordem geral: (1) forma
de dado do gráfico primeiro (`series.ts`, `palette.ts` consumido direto), (2)
componentes de gráfico que dependiam da forma antiga, (3) átomos e moléculas
de domínio, (4) barris e guardião, (5) mapa de exportações do pacote.
