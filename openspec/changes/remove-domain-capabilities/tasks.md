# Tasks

## 1. Forma de dado do gráfico

- [ ] 1.1 Reescrever `ChartPoint`/`ChartSeries` em `organisms/charts/series.ts` para `{ name, points: readonly { category: string; value: number | null }[] }`, removendo `PointKind`, `hasValue`, `evidence`, `measure` por série, `SeriesLimitRule`, `SingleMeasureRule` e `ExceedsSeriesLimit` — verificar com `pnpm exec tsc --noEmit` e um teste de tipos que planta uma segunda `measure` por série e confere que não há mais campo para declará-la (o plantio deixa de compilar por propriedade inexistente, não por regra de tipo)
- [ ] 1.2 Fazer o núcleo de desenho (`chart.tsx`) lançar, ao montar as séries, o erro de limite hoje só lançado por `seriesColor` (nomeando a forma e o limite) antes de desenhar qualquer marca — verificar com teste que renderiza com séries acima de `CHART_SERIES_LIMIT` e confere o erro lançado
- [ ] 1.3 Remover o uso de `hatch-pattern` do plote (`plot.tsx`) para ponto sem valor — verificar com história renderizando um ponto com `value: null` e conferindo ausência de padrão de hachura no SVG

## 2. Componentes de gráfico consumindo a forma nova

- [ ] 2.1 Atualizar `chart.tsx` (`DomainChart`): remover o ramo `blocked`, o import de `BlockedProjection`, o banner de ausências com `DeclaredAbsence`, e desenhar `value: null` sem marca — verificar com as histórias existentes de bloqueio removidas e uma história nova de ponto sem valor passando nos dois temas
- [ ] 2.2 Reescrever `value-table.tsx` sem coluna de evidência, sem `StatusMarker`, sem `DeclaredAbsence` — só série, categoria e valor (ou travessão para `value: null`) — verificar com a prova do requisito "Valores alcançáveis sem a visão" de `specs/interface-charts/spec.md`
- [ ] 2.3 Remover `blocked`/`BlockReason` das cinco formas (`bar`, `dot`, `line`, `small-multiples`, `stacked-bar`) e das respectivas histórias — verificar com `pnpm exec tsc --noEmit` e as histórias de cada forma passando nos dois temas
- [ ] 2.4 Remover a fixture derivada do contrato de leitura (`organisms/charts/fixtures/abve-eletrificados-janeiro-2025.ts`); manter só fixture sintética — verificar com `tools/checks/fixture-origin.test.ts` passando e nenhuma fixture da biblioteca declarando origem "contrato de leitura"

## 3. Átomos e moléculas de domínio

- [ ] 3.1 Remover o átomo `StatusMarker` (componente, história, export em `atoms/index.ts`) — verificar com `pnpm exec tsc --noEmit` e nenhum import restante de `status-marker` fora deste diretório
- [ ] 3.2 Dissolver `NumericValue`: mover a formatação para um hook (`value: number`, `format?: (value: number) => string`, padrão `String(value)`) e a variante tabular para o átomo de texto genérico — verificar com a prova de "Número alinha em coluna" (`specs/interface-atoms/spec.md`) passando contra a nova variante
- [ ] 3.3 Remover `ValueWithProvenance`, `BlockedProjection` e `StatusPanel` (`molecules/domain/`, `organisms/domain/`) — verificar que as duas pastas deixam de existir e `pnpm exec tsc --noEmit` passa
- [ ] 3.4 **Bloqueada até o dono decidir** (`proposal.md`, "Decisões em aberto"): aplicar a decisão sobre `DeclaredAbsence` e `EvidenceAnchor` — (a) manter exportados, com história, desligados de propósito, ou (b) remover — verificar com a spec atualizada refletindo a escolha antes desta tarefa ser dada como pronta
- [ ] 3.5 Remover `domain/` (`contract.ts` remanescente, `index.ts`, `block-reason.ts`) e `vocabulary/` inteira — verificar que `packages/ui/src/index.ts` não reexporta nenhum dos dois e `pnpm exec tsc --noEmit` passa

## 4. Guardião e perímetro

- [ ] 4.1 Remover as entradas "moléculas de domínio" e "organismos de domínio" de `tools/checks/component-vocabulary.test.ts` — verificar com o próprio guardião passando (perímetro nomeado sem componente reprovaria se a entrada ficasse)
- [ ] 4.2 Remover os subpaths `./domain` (e qualquer exportação de vocabulário) do mapa `exports` de `packages/ui/package.json` — verificar com `pnpm --filter @chargebr/ui build` (ou equivalente) sem referência ao subpath removido

## 5. Specs vivas e ponto aberto

- [ ] 5.1 No arquivamento desta mudança (`Sync now`), aplicar as quatro spec deltas (`interface-atoms`, `domain-primitives` removida, `domain-charts` removida, `interface-charts` nova) às specs vivas — verificar com `openspec validate --strict` sobre a mudança arquivada
- [ ] 5.2 Fechar o ponto aberto 7 de `docs/pontos-abertos.md`, citando esta mudança, com a nota de que o requisito em que o ponto se apoiava deixou de existir (não que a pergunta do canal de tamanho foi respondida) — verificar com a entrada movida para "Fechados"

## 6. Fechamento

- [ ] 6.1 `pnpm verify` passando sobre a árvore inteira, com as quatro spec deltas desta mudança — verificar com a execução completa registrada
- [ ] 6.2 Confirmar e registrar a contagem de histórias do Storybook antes e depois da mudança — verificar com `pnpm --filter @chargebr/ui storybook` abrindo sem erro de console e a contagem citada no corpo do PR
