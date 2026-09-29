# Tasks

## 1. Escala de tamanho: token e variante juntos

- [x] 1.1 Acrescentar `text.control.sm/md/lg` a `semantic/shared.json`, referenciando `font.size.1/2/3` — verificar com teste que lê os três tokens gerados e confere o `px` de cada um contra o primitivo
- [x] 1.2 Estender `component/button.json` com os três conjuntos de tamanho (`sm`/`md`/`lg`: `font-size` → `text.control.<size>`, `padding-inline` → `space.inset.<size>`, `padding-block` conforme D1, `gap` → `space.gap.<size>`) — verificar com `verify:test` (checagem de camadas e de literal de `design-tokens` passa sem edição, por já ser genérica) e com leitura visual dos três valores gerados
- [x] 1.3 `Button` aceita `size?: "sm" | "md" | "lg"` (padrão `"md"`), aplicando a classe correspondente do CSS Module — verificar com `contracts.typecheck.tsx` (plantio confere que `size` aceita só os três valores)
- [x] 1.4 Três histórias novas, uma por tamanho, cada uma conferindo `font-size` computado contra o token do degrau, nos dois temas — mais uma história padrão (sem `size`) conferindo que ela resolve para o mesmo `font-size` do degrau médio — verificar com `pnpm --filter @chargebr/ui exec vitest run --project claro|escuro src/atoms/button`

## 2. Estado desabilitado: token e estado juntos

- [x] 2.1 Acrescentar `color.action.disabled` a `semantic/light.json` e `semantic/dark.json` (`{color.gray.300}` claro / `{color.gray.700}` escuro) — verificar com `checkThemeCompleteness` (os dois temas têm o token) e com a leitura visual dos dois valores
- [x] 2.2 Estender `component/button.json` com `disabled.background` (→ `color.action.disabled`) e `disabled.text` (→ `color.text.muted`) — verificar com `checkReferences` (referência só à camada semântica) passando sem edição
- [x] 2.3 `Button` aceita `isDisabled?: boolean`, repassado a `AriaButton`, com `[data-disabled]` no CSS Module resolvendo os dois tokens novos — verificar com história que confere `onPress` não disparado e `[data-disabled]` presente, nos dois temas, sob `addon-a11y`
- [x] 2.4 `contrast.ts`: generalizar `ContrastInput` para enumerar pares de ação/estado a partir da fonte (D5 de design.md), com `disabled` isento do piso de 4,5:1 e nomeado como tal no relatório — verificar com os cenários "Par de ação novo entra sem editar o arquivo de checagem", "Remover um par de ação o remove da checagem" e "Par desabilitado é relatado, não reprovado" de `specs/design-tokens/spec.md`, todos como testes novos em `contrast.test.ts`

## 3. Estado de pendência: o átomo Spinner e o token dele

- [x] 3.1 Criar `component/spinner.json` (novo): `color` → `color.action.primary`, tamanho por degrau referenciando `text.control.<size>` — verificar com `checkReferences`/`checkLiterals` passando sem edição, e com leitura visual dos valores gerados
- [x] 3.2 Construir `atoms/spinner/spinner.tsx` (SVG com anel parcial em rotação, `stroke` do token de cor, sem nome acessível próprio) + `spinner.module.css` (toda dimensão e cor por token, nenhum literal) — verificar com `style-literals.test.ts` sem ocorrência no arquivo
- [x] 3.3 História do `Spinner`, nos dois temas, sob `addon-a11y`, conferindo que ele é identificável como indicador de progresso — verificar com `pnpm --filter @chargebr/ui exec vitest run --project claro|escuro src/atoms/spinner`
- [x] 3.4 `Button` aceita `isPending?: boolean`, repassado a `AriaButton`; quando pendente, `children` (função de render-prop) retorna `<Spinner>` no lugar do conteúdo normal — verificar com história que confere `onPress` não disparado, `Spinner` presente, e o botão ainda alcançável por `Tab`, nos dois temas
- [x] 3.5 História de `Button` pendente com `Spinner` composto, sob `addon-a11y`, conferindo ausência de nome acessível duplicado ou faltante — verificar com a mesma execução de `addon-a11y` da tarefa 3.4
- [x] 3.6 `spinner.module.css` aplica `@media (prefers-reduced-motion: reduce)` removendo a animação de rotação, com a duração e a curva da animação normal como literal no CSS Module (D7 de design.md — sem token de movimento, eixo não medido, consumidor único) — verificar com leitura do arquivo confirmando ausência de literal em propriedade guardada por `style-literals.test.ts` (motion não está na lista, mas a regra geral de "só token" para as cinco categorias listadas em `rules.design` segue cumprida)
- [x] 3.7 Parcial, por decisão do dono — **medido:** `@vitest/browser/context` (`commands`), necessário para emular `prefers-reduced-motion` via Playwright a partir de uma história, lança em runtime nesta bancada (`@storybook/addon-vitest@10.6.0` declara peer `vitest@^3||^4`; o repositório fixa `vitest@5.0.1`). A história "Sem movimento reduzido" prova o caso sem a preferência (padrão do Chromium headless). O caso "com a preferência" fica sem história automatizada — registrado como ponto 15 de `docs/pontos-abertos.md`, com o gatilho que o reabre — em vez de teste falso ou pulado

## 4. ARIA de controle e PressEvent

- [ ] 4.1 `ButtonProps` ganha `aria-expanded?`, `aria-controls?`, `aria-describedby?`, repassados ao elemento nativo — verificar com história que passa os três e confere cada um no elemento renderizado
- [ ] 4.2 `onPress` muda de `() => void` para `(e: PressEvent) => void` — verificar com história que ativa o botão por ponteiro e por teclado e confere as propriedades do `PressEvent` recebido
- [ ] 4.3 Criar `atoms/button/button.typecheck.tsx` — arquivo de plantio só deste componente, sem `defineAtom`, lista de contratos ou cobertura de estado (D6 de design.md) — replantando a prova perdida em `793d8e2`: `<Button icon={Menu} />` sem `children` nem `aria-label`, com `@ts-expect-error` e a mesma justificativa de uma linha do arquivo original — verificar removendo o comentário e confirmando que `pnpm exec tsc --noEmit` reprova nomeando o arquivo; com o comentário presente, a checagem passa
- [ ] 4.4 `grep` por todo consumidor existente de `Button.onPress` fora das próprias histórias do átomo; ajustar cada um encontrado à nova assinatura, nomeando o achado no corpo do PR — verificar com `pnpm exec tsc --noEmit` sobre a árvore inteira

## 5. Fechamento

- [ ] 5.1 `pnpm verify` verde na árvore inteira (tipos, formatação, lint, teste) — verificar pela execução do comando
- [ ] 5.2 Conferir que nenhuma supressão nova foi introduzida em `style-literals`, `component-vocabulary`, `fixture-origin` ou `type-suppression` — verificar com `tools/checks/*.test.ts` verdes sem novo `// eslint-disable`-equivalente no diff
- [ ] 5.3 Story coverage: todo estado declarado (`sm`/`md`/`lg`, `isDisabled`, `isPending`, foco) tem história própria, nunca uma história combinando dois eixos — verificar com `stories-coverage.test.ts`
