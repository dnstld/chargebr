# Proposal

## Why

`Button` hoje não expressa desabilitar, pendência, tamanho nem os atributos
ARIA que a própria primitiva de baixo nível (`react-aria-components`) já
suporta — quatro lacunas medidas contra Material UI, gluestack e
react-aria-components, uma delas com consumidor já nomeado (tarefa 7.3 de
`interface-atomic-structure`, o gatilho do hambúrguer, que precisa de
`aria-expanded`/`aria-controls`). Sob a regra nova do dono — token nasce na
mesma mudança que o componente que o consome — este é o primeiro ciclo a
fechar as quatro lacunas com os tokens que cada uma exige, no mesmo passe, e a
passar `Button` a molde para os ciclos seguintes de `Icon`, `Text` e
`Heading`.

## What Changes

- `Button` aceita estado desabilitado (`isDisabled`), repassado à primitiva
  `react-aria-components` por baixo, com token de componente próprio
  (`color.action.disabled` e um papel de texto sobre ele) e história nos dois
  temas.
- `Button` aceita estado de pendência (`isPending`), repassado à mesma
  primitiva (que já desliga press/hover mantendo o elemento focalizável); o
  indicador visual é um átomo novo, `Spinner`, com conjunto de token próprio
  — visual próprio é o que faz algo ser componente, não propriedade de
  `Button` (`rules.design`, `openspec/config.yaml`).
- `Button` aceita variante de tamanho (`size: sm | md | lg`), resolvida por
  uma escala nova de tipografia nomeada (`text.control.sm/md/lg`, semântica,
  referenciando `font.size` primitivo) combinada com a escala de espaço já
  nomeada (`space.inset`/`space.gap`, já existente e já consumida pelo
  botão).
- `Button` aceita o subconjunto de atributos ARIA que a primitiva já suporta
  e que o wrapper hoje bloqueia — `aria-expanded`, `aria-controls`,
  `aria-describedby`.
- **BREAKING:** `onPress` passa a repassar o `PressEvent` completo da
  primitiva (`(e: PressEvent) => void`) em vez de descartá-lo
  (`() => void`).
- A checagem de contraste de `design-tokens`
  (`packages/tokens/src/contrast.ts`) passa a enumerar os pares de
  ação/estado a partir da fonte de tokens — mesmo padrão que já enumera
  superfícies e séries de paleta —, em vez de ler um único par fixo por nome
  de chave.
- O par de token do estado desabilitado é isento, nomeadamente, do piso de
  contraste de texto que os demais pares de ação cumprem (WCAG 1.4.3,
  componente de interface inativo) — isenção registrada na checagem, não
  ausência de medição.
- `Spinner` respeita `prefers-reduced-motion`, com história que prova o
  comportamento nos dois casos (com e sem a preferência) — é o primeiro
  componente animado do pacote, e a checagem de acessibilidade por execução
  (`addon-a11y`/axe) não cobre preferência de movimento.
- A prova de tipo do pacote, perdida com a remoção da máquina de contratos
  de estado (`793d8e2`), volta para `Button` — um arquivo de plantio por
  componente (`button.typecheck.tsx`), sem o mecanismo de contrato/cobertura
  removido, replantando a prova de que um botão sem `children` nem
  `aria-label` não compila.

**O que esta mudança não faz:** não introduz eixo de tom (`variant`/`color`
com `primary`/`secondary`/`danger`) — é R6 de
`docs/decisao-biblioteca-de-componentes.md`, nada pede um segundo tom hoje, e
desabilitado é estado, não tom. Não toca `Icon`, `Text` nem `Heading` — cada
um segue depois, no mesmo molde, como ciclo próprio. Não liga o gatilho do
hambúrguer em `AppFrame` (tarefa 7.3 de `interface-atomic-structure`) — só
remove o bloqueio de tipo que impedia essa tarefa de ser feita; ligá-la
continua sendo trabalho daquele change, não deste.

## Capabilities

### New Capabilities

Nenhuma. O átomo `Spinner` é novo, mas seu comportamento observável — visual
próprio exige token próprio, é o teste de "quando algo vira componente" —
já é o que `interface-atoms` descreve para qualquer átomo da camada; não é
um eixo de comportamento novo que justifique um caminho de capacidade
próprio.

### Modified Capabilities

- `interface-atoms`: `Button` ganha requisitos de estado desabilitado, estado
  de pendência (com o átomo `Spinner` novo), variante de tamanho e passagem
  tipada de atributos ARIA/`PressEvent`; `Spinner` entra como requisito novo
  da mesma capacidade.
- `design-tokens`: o requisito "Cor de ação legível contra toda superfície
  neutra do tema" é revisto para o par desabilitado, que passa a existir (a
  cláusula atual — "SHALL NOT conferir... desabilitado enquanto não existir
  token" — deixa de se aplicar, e o texto novo nomeia a isenção por WCAG
  1.4.3 em vez de reprovar ou de ficar em silêncio); um requisito novo
  obriga a checagem a enumerar os pares de ação/estado a partir da fonte, em
  vez de uma lista escrita à parte.

## Impact

- `packages/ui/src/atoms/button/button.tsx`, `button.module.css`,
  `button.stories.tsx`, `button.typecheck.tsx` (novo — repõe a prova de tipo
  perdida em `793d8e2`)
- `packages/ui/src/atoms/spinner/` (novo átomo: `spinner.tsx`,
  `spinner.module.css`, `spinner.stories.tsx`)
- `packages/tokens/tokens/component/button.json`,
  `packages/tokens/tokens/component/spinner.json` (novo)
- `packages/tokens/tokens/semantic/shared.json` (`text.control.sm/md/lg`),
  `semantic/light.json` e `semantic/dark.json` (`color.action.disabled` e o
  papel de texto desabilitado)
- `packages/tokens/src/contrast.ts`, `packages/tokens/src/contrast.test.ts`
- `openspec/specs/interface-atoms/spec.md`,
  `openspec/specs/design-tokens/spec.md` (via arquivamento deste change)
- `openspec/changes/interface-atomic-structure/tasks.md`: a tarefa 7.3 passa
  a poder ser feita depois deste ciclo — este change não a executa, só
  remove o que a bloqueava no tipo de `Button`
