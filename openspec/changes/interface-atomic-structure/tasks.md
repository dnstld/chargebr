# Tasks

## 1. Reestruturação de pastas e migração de valueRole

- [ ] 1.1 Criar `atoms/`, `molecules/domain/`, `organisms/domain/` conforme D1 de `design.md`; mover `declared-absence`, `evidence-anchor`, `hatch`, `numeric-value`, `status-marker`, `text` para `atoms/`, `value-with-provenance` e `blocked-projection` para `molecules/domain/`, `status-panel` para `organisms/domain/` — verificar com `pnpm verify` passando e nenhum import quebrado
- [ ] 1.2 Mover `value-role.ts` e `value-role.assert.ts` de `atoms/` para `molecules/domain/` — verificar que nenhum arquivo em `atoms/` importa de `molecules/domain/` (checagem manual até R4 de `docs/decisao-biblioteca-de-componentes.md` ganhar guardião)
- [ ] 1.3 Migrar `TextProps.valueRole` e `NumericValueProps.valueRole` para `weight`/`emphasis`, consumindo `font.weight.*` e `font.style.*` — verificar com o teste de tipos que planta uso do prop antigo e confere que `verify:types` falha
- [ ] 1.4 Atualizar `value-with-provenance.tsx` para escolher a combinação `weight`/`emphasis` por papel, e `charts/value-table.tsx` para declarar a combinação diretamente, sem `valueRole` — verificar com as histórias existentes de ambos continuando verdes
- [ ] 1.5 Aplicar a spec delta de `interface-atoms` (remoção) e `domain-primitives` (fusão do requisito) desta mudança — verificar com `openspec validate --strict` sobre a mudança arquivada

## 2. Token de breakpoint

- [ ] 2.1 Resolver a Open Question de `design.md` (D6): Opção A (exceção + teste de contrato) ou Opção B (`postcss-custom-media`) — decisão do dono, registrada antes de prosseguir
- [ ] 2.2 Criar `packages/tokens/tokens/primitive/screen.json` com `screen.md = 768px` — verificar com `pnpm --filter @chargebr/tokens build` gerando `screen-md` em `tokens.css` e `tokens.ts`
- [ ] 2.3 Implementar o mecanismo escolhido em 2.1 — verificar com o teste de contrato correspondente (delta em `specs/workspace-verification/spec.md` para a Opção A) passando

## 3. lucide-react

- [ ] 3.1 Acrescentar `lucide-react` a `dependencies` de `packages/ui/package.json` — verificar com `pnpm install` sem erro e o lockfile atualizado
- [ ] 3.2 Acrescentar `"lucide-react"` a `BENCH_OPTIMIZE_DEPS.include` em `packages/ui/.storybook/optimize-deps.ts` — verificar com `src/bench/optimize-deps.test.ts` passando depois do primeiro componente que importa `lucide-react`

## 4. Átomos novos sem dependência de outros novos

- [ ] 4.1 Construir `Icon` (recebe o componente do ícone por propriedade, cor por `currentColor`) — verificar com as histórias do requisito "Ícone recebe o componente por propriedade" de `specs/shell-components/spec.md`
- [ ] 4.2 Construir `Logo` (referencia `src/images/logo-charge-br-{vertical,horizontal}.svg` como recurso externo, sem literal de cor no `.tsx`) — verificar com `tools/checks/style-literals.test.ts` não reportando o arquivo e com a história nos dois temas
- [ ] 4.3 Construir `Button` (ícone opcional via `Icon`) — verificar com história cobrindo cada variante declarada e checagem de acessibilidade nos dois temas
- [ ] 4.4 Resolver a Open Question de `design.md` (D3): forma do "subtítulo" de `Heading` — decisão do dono, registrada antes de construir
- [ ] 4.5 Construir `Heading` conforme a decisão de 4.4 — verificar com história por nível e checagem de acessibilidade nos dois temas

## 5. Navegação

- [ ] 5.1 Construir `PathLabel` (texto, sem papel de navegação, sem foco) — verificar com o teste do requisito "Rótulo de caminho não é região de navegação" de `specs/shell-components/spec.md`
- [ ] 5.2 Construir `NavItem` (estado corrente com superfície preenchida além do peso) — verificar com o teste do requisito "Item de navegação corrente é marcado por mais de um sinal"
- [ ] 5.3 Construir `NavSection` (rótulo não clicável, exige ao menos uma folha) — verificar com o teste de tipos que planta seção sem folha e confere `verify:types` falhando
- [ ] 5.4 Resolver a Open Question de `design.md` (D5): posição (a) ou (b) sobre a tensão com o requisito de navegação de `backoffice-shell` — decisão do dono, registrada antes de construir `NavPanel`
- [ ] 5.5 Construir `NavPanel` (organismo, modo persistente e modo sobreposto, foco preso só no modo sobreposto) só na bancada, com fixture de folhas de exemplo com origem declarada — verificar com os dois cenários do requisito "Foco preso só no modo sobreposto"

## 6. AppFrame

- [ ] 6.1 Compor `Logo` e `PathLabel` no cabeçalho de `AppFrame`, no lugar do texto puro do nome do produto — verificar com o cenário atualizado "A moldura renderizada expõe as duas regiões" de `specs/backoffice-shell/spec.md`
- [ ] 6.2 Acrescentar o slot `nav?: ReactNode` a `AppFrameProps`, sem popular com `NavPanel` real em `apps/backoffice` (conforme a decisão de 5.4) — verificar com o teste de tipos que confere que `AppFrame` compila sem o slot preenchido, e com `pnpm verify` cobrindo `apps/backoffice` sem região de navegação no documento emitido
- [ ] 6.3 Acrescentar o gatilho do hambúrguer (variante ícone-only de `Button` com `Icon`), condicionado ao breakpoint de 2.2, visível só abaixo dele — verificar com história que confere presença/ausência do hambúrguer nos dois lados do breakpoint

## 7. Fechamento

- [ ] 7.1 `pnpm verify` passando sobre a árvore inteira, com as cinco spec deltas desta mudança — verificar com a execução completa registrada
- [ ] 7.2 Registrar em `docs/pontos-abertos.md` o ponto novo, se D5 resolver como posição (a): "NavPanel construído, sem rota de negócio para religar" — verificar com a entrada citando o número e o gatilho (primeira rota de negócio real)
