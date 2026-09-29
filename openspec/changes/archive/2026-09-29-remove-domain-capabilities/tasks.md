# Tasks

## 1. Forma de dado do gráfico

- [x] 1.1 Reescrever `ChartPoint`/`ChartSeries` em `organisms/charts/series.ts` para `{ name, points: readonly { category: string; value: number | null; fill?: "solid" | "textured" }[] }`, removendo `PointKind`, `hasValue`, `evidence`, `measure` por série, `SeriesLimitRule`, `SingleMeasureRule` e `ExceedsSeriesLimit` — verificado em `cb29087`: `pnpm exec tsc --noEmit` limpo em toda a árvore; sem campo `measure` por série, o plantio do teste de tipos original deixou de fazer sentido (a segunda escala não compila por propriedade inexistente, não por regra de tipo) — registrado em D5 de `design.md`
- [x] 1.2 Fazer o núcleo de desenho (`chart.tsx`) lançar, ao montar as séries, o erro de limite hoje só lançado por `seriesColor` (nomeando a forma e o limite) antes de desenhar qualquer marca — verificado em `cb29087`: `chart.tsx` lança antes de `ChartPlot`; sem história dedicada de excesso de séries (nenhuma história do pacote excede o limite), a garantia repousa na leitura do código e em `seriesColor` já lançar pelo mesmo motivo
- [x] 1.3 Unificar a hachura numa definição só — feito em duas etapas: `cb29087` generalizou `fill` no ponto (`"solid"` padrão, `"textured"` usa hachura), mantendo `ChartHatchPattern` como segunda definição em `organisms/charts/hatch-pattern/`; `5458ca4` corrigiu isso — as duas definições desenhavam o mesmo `<pattern>`, atributo por atributo, sem razão para divergir. O `<pattern>` virou `atoms/hatch/hatch-pattern.tsx` (`HatchPattern`, `hatchFill`), consumido por `Hatch` em seus próprios `defs`; `geometry.ts` (`readDrawnHatch`) foi junto para `atoms/hatch/`; `organisms/charts/hatch-pattern/` saiu inteiro; `plot.tsx` importa o padrão de `atoms/hatch/` — organismo consumindo átomo. Verificado: história `atoms/hatch/hatch-pattern.stories.tsx` afirma que o `<pattern>` desenhado carrega os valores de `HATCH`, nos dois temas; histórias de gráfico com `fill: "textured"` e `fill` omitido passando

## 2. Componentes de gráfico consumindo a forma nova

- [x] 2.1 Atualizar `chart.tsx` (`DomainChart`): remover o ramo `blocked`, o import de `BlockedProjection`, e o banner de ausências que usava `DeclaredAbsence` — `value: null` passa a não desenhar marca nenhuma, sem banner textual — verificado em `cb29087`: histórias de bloqueio removidas das cinco formas, história de ponto sem valor (`expectNoMarkForMissingValue`) passando nos dois temas
- [x] 2.2 Reescrever `value-table.tsx` sem coluna de evidência, sem `StatusMarker`, sem `DeclaredAbsence` — série, categoria e valor, com travessão (`—`) via átomo de texto genérico para `value: null` — verificado em `cb29087`: prova de "Valores alcançáveis sem a visão" (`specs/interface-charts/spec.md`) passando via `expectTextEquivalent`
- [x] 2.3 Remover `blocked`/`BlockReason` das cinco formas (`bar`, `dot`, `line`, `small-multiples`, `stacked-bar`) e das respectivas histórias — verificado em `cb29087`: `pnpm exec tsc --noEmit` limpo, histórias de cada forma passando nos dois temas
- [x] 2.4 Remover a fixture derivada do contrato de leitura (`organisms/charts/fixtures/abve-eletrificados-janeiro-2025.ts`); manter só fixture sintética — verificado em `cb29087`: `tools/checks/fixture-origin.test.ts` teve o self-check corrigido (esperava o arquivo removido) e passa; nenhuma fixture da biblioteca declara origem "contrato de leitura"

## 3. Átomos e moléculas de domínio

- [x] 3.1 Remover o átomo `StatusMarker` (componente, história, export em `atoms/index.ts`) — verificado em `6a70b82`: `pnpm exec tsc --noEmit` limpo, nenhum import restante de `status-marker` fora do histórico
- [x] 3.2 Dissolver `NumericValue`: mover a formatação para um hook (`value: number`, `format?: (value: number) => string`, padrão `String(value)`) e a variante tabular para o átomo de texto genérico — verificado em `6a70b82`: prova de "Número alinha em coluna" (`specs/interface-atoms/spec.md`) passando contra a variante `tabular` de `Text`, via `useFormattedNumber`
- [x] 3.3 Remover `ValueWithProvenance`, `BlockedProjection` e `StatusPanel` (`molecules/domain/`, `organisms/domain/`) — verificado em `6a70b82`: as duas pastas deixaram de existir, `pnpm exec tsc --noEmit` limpo
- [x] 3.4 Remover o átomo `DeclaredAbsence` (componente, história, export); renomear e generalizar `EvidenceAnchor` para `Link` (`href` + conteúdo, sem vocabulário de evidência) — decisão do dono, `docs/decisao-biblioteca-de-componentes.md` — verificado em `6a70b82` (remoção/generalização) e `5458ca4` (três menções residuais ao nome antigo, em comentário, corrigidas): prova de "Link tem nome acessível" (`specs/interface-atoms/spec.md`) passando, nenhum import restante de `declared-absence` ou `evidence-anchor`
- [x] 3.5 Remover `domain/` (`contract.ts` remanescente, `index.ts`, `block-reason.ts`) e `vocabulary/` inteira — verificado em `6a70b82`: `packages/ui/src/index.ts` não reexporta nenhum dos dois, `pnpm exec tsc --noEmit` limpo

## 4. Guardião e perímetro

- [x] 4.1 Remover as entradas "moléculas de domínio" e "organismos de domínio" de `tools/checks/component-vocabulary.test.ts` — verificado em `1b629ba`: o guardião passa com "moldura" como único perímetro
- [x] 4.2 Remover os subpaths `./domain` (e qualquer exportação de vocabulário) do mapa `exports` de `packages/ui/package.json` — verificado em `1b629ba`: `pnpm --filter @chargebr/ui exec tsc --noEmit` limpo, sem referência ao subpath removido

## 5. Specs vivas e ponto aberto

- [x] 5.1 No arquivamento desta mudança (`Sync now`), aplicar as quatro spec deltas (`interface-atoms`, `domain-primitives` removida, `domain-charts` removida, `interface-charts` nova) às specs vivas — verificado: `openspec archive remove-domain-capabilities --yes` (2026-09-29) sincronizou 6 requisitos adicionados, 1 modificado, 21 removidos; `domain-primitives` e `domain-charts` retirados por inteiro (`retire_capabilities: true` em `.openspec.yaml`, único jeito de arquivar um delta só-de-remoção sem capacidade destino); `openspec validate --all --strict` limpo depois, incluindo `interface-atomic-structure` (ver nota de 2026-09-29 em seu `tasks.md` sobre o delta que ficou sem alvo)
- [x] 5.2 Fechar o ponto aberto 7 de `docs/pontos-abertos.md`, citando esta mudança, com a nota de que o requisito em que o ponto se apoiava deixou de existir (não que a pergunta do canal de tamanho foi respondida) — verificado: entrada movida para "Fechados", cabeçalho do arquivo atualizado (6 capacidades vivas, 56 requisitos, 12 ciclos arquivados, 3 pontos abertos)

## 6. Fechamento

- [x] 6.1 `pnpm verify` passando sobre a árvore inteira, com as quatro spec deltas desta mudança — verificado repetidamente ao longo de `cb29087`, `6a70b82`, `1b629ba` e `5458ca4`; último registro: 48 arquivos de teste, 175 testes, árvore limpa
- [x] 6.2 Confirmar e registrar a contagem de histórias do Storybook antes e depois da mudança — verificado: 21 histórias antes, 15 depois (72 → 40 entradas de história no índice do Storybook, contando variação de tema); `pnpm --filter @chargebr/ui storybook` abrindo sem erro de console, registrado no corpo do PR #181
