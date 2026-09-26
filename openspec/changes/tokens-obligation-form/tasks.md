# Tasks

Nenhum piso, token, superfície ou componente de produção muda. Há uma tarefa
de código: uma das quatro obrigações antes implícitas — nome do gráfico,
legenda, ausências declaradas e representação em texto na superfície da
página — não tinha teste, e ganha um nesta mudança. As demais tarefas
verificam a redação do delta contra `openspec/config.yaml` — `rules.specs` —
e os testes que já existiam.

## 1. Forma do delta

- [ ] 1.1 Ler o corpo dos três requisitos MODIFIED em `specs/design-tokens/spec.md` deste change frase a frase e confirmar que nenhuma delas mistura obrigação e razão — toda razão está em `**Por quê:**`, e verificar rodando `npx openspec validate tokens-obligation-form --strict` sem erro de estrutura.
- [ ] 1.2 Comparar o delta com `openspec/specs/design-tokens/spec.md` corrente e confirmar que nenhum piso, token ou superfície nomeado mudou de valor — só a forma da frase e os dois cenários novos.

## 2. Obrigação explicitada → teste existente

- [ ] 2.1 Para as três obrigações antes implícitas que já tinham teste, confirmar que cada uma aparece na tabela de `design.md` — Decisions com o teste que a prova, e rodar `npx vitest run packages/tokens/src/contrast.test.ts packages/tokens/src/palette.test.ts` na raiz confirmando que os testes citados passam.
- [ ] 2.2 Confirmar que o cenário "Série da paleta abaixo do piso de objeto gráfico reprova nomeando a série e o tema" nomeia um teste que já existe — `packages/tokens/src/palette.test.ts`, teste "contraste insuficiente contra a superfície reprova nomeando a série e o tema" — e não um teste inventado para este ciclo.

## 3. Código: texto do gráfico fora da superfície de gráfico

- [ ] 3.1 Implementar `expectTextOutsideChartSurface` em `packages/ui/src/charts/chart.assert.ts`: resolve a cor computada de `--color-chart-surface` por um elemento de sondagem inserido dentro do gráfico — não pelo atributo `[data-plot]` — e, para `figcaption`, `[data-legend]`, `[data-absences]` e `[data-value-table]`, sobe a árvore de ancestrais sem sair de `<figure data-chart>` até achar o primeiro fundo não transparente; pronto quando `pnpm --filter @chargebr/ui exec tsc --noEmit` passa, a função ignora elemento ausente sem reprovar, e não referencia `[data-plot]` em nenhuma linha.
- [ ] 3.2 Chamar `expectTextOutsideChartSurface` ao lado de `expectNoInteractiveInPlot` em toda história de gráfico existente — `bar-chart.stories.tsx`, `dot-chart.stories.tsx`, `line-chart.stories.tsx`, `stacked-bar-chart.stories.tsx`, `small-multiples-chart.stories.tsx`, incluindo a história de projeção bloqueada; pronto quando `npx vitest run --project claro --project escuro` (bancada de `packages/ui`) passa com a nova chamada em todas.
- [ ] 3.3 Plantar manualmente, numa história de gráfico, um dos quatro elementos dentro do nó que hoje pinta `--color-chart-surface`, rodar `pnpm verify` e confirmar que a nova afirmação reprova nomeando o elemento nos dois temas; reverter o plantio e confirmar que `pnpm verify` volta a passar. Pronto quando o resultado — reprovação e reversão — está registrado no corpo do pull request, no mesmo formato da tarefa 5.4 de `openspec/changes/archive/2026-09-22-dark-action-color/tasks.md`.

## 4. Portão

- [ ] 4.1 Rodar `pnpm verify` inteiro na raiz e confirmar que os quatro estágios passam, incluindo a afirmação nova nas histórias de gráfico, nos dois temas.
