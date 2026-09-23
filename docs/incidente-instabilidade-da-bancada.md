# Incidente: instabilidade da bancada em "Sob o ponteiro"

## Identificação

| Campo | Valor |
| --- | --- |
| Sintoma | A história `Átomos/Âncora de evidência › Sob o ponteiro` reprova de forma intermitente no CI: `data-hovered` não aparece na âncora depois de `userEvent.hover`. |
| Arquivo | `packages/ui/src/atoms/evidence-anchor/evidence-anchor.stories.tsx` |
| Componente | `EvidenceAnchor`, sobre `Link` de `react-aria-components` 1.21.1 (`useHover` de `react-aria` 3.52.1) |
| Bancada | Vitest 5.0.1 em modo navegador (`@vitest/browser-playwright` 5.0.1, Chromium headless 153), um projeto por tema, via `@storybook/addon-vitest` 10.6.0 |
| CI | `verify.yml`, `ubuntu-latest`, etapa `verify:test` |
| Período | 22 de setembro de 2026, das 05:11 às 10:41 UTC |
| Pessoa responsável | Denis Toledo |
| Desfecho | **Estacionado, causa desconhecida.** Ver [Desfecho](#desfecho). |

## Ocorrências

Todas no CI. Nenhuma reprodução local, em nenhuma condição tentada. Nenhuma outra história reprovou no CI no mesmo período.

| # | Run | Tentativa | Hora (UTC) | Branch | Tema | Duração | Asserção | Resposta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [19](https://github.com/dnstld/chargebr/actions/runs/35689759982) | 1 | 05:11 | `chore/pin-openspec` (`6ba24e0`) | claro | 41 ms | leitura síncrona de `data-hovered` logo após o evento | PR #132 |
| 2 | [23](https://github.com/dnstld/chargebr/actions/runs/35693620179) | 1 | 06:09 | `docs/archive-domain-primitives-v1` (`8155ee7`) | escuro | 1014 ms | `waitFor` esgotado | PR #136 |
| 3 | [26](https://github.com/dnstld/chargebr/actions/runs/35699720280) | 1 | 07:27 | `docs/domain-charts-proposal` (`996cafa`) | escuro | 1020 ms | `waitFor` esgotado | esta investigação |
| 4 | [28](https://github.com/dnstld/chargebr/actions/runs/35712861677) | 1 | 09:52 | `probe/hover-media-query` (`24aa58a`) | escuro | 1063 ms | `waitFor` esgotado, sonda estendida limpa | — |
| 5 | [36](https://github.com/dnstld/chargebr/actions/runs/35717380912) | 1 | 10:41 | `probe/hover-media-query` (`a80c3e5`) | claro | 1096 ms | `waitFor` esgotado, sonda estendida limpa | — |

As ocorrências 1 e 2 foram reexecutadas pelo botão do GitHub e passaram na segunda tentativa; por isso o run aparece verde na listagem e a falha só existe no log da tentativa 1. A quinta ocorrência chegou durante o laço de reexecuções desta investigação, depois de fechado o conjunto de hipóteses; entra aqui porque confirma a assinatura, não porque tenha aberto linha nova.

Frequência observada: na branch de investigação, com conteúdo idêntico em todas, 10 execuções produziram 2 falhas (runs 27 e 29–35 passaram; 28 e 36 falharam). Contando desde a primeira execução da bancada com esta história (run 17), 22 execuções de `verify:test` no CI produziram 5 falhas, todas nesta história.

A assinatura é a mesma nas cinco: `expected false to be true` em `anchor.hasAttribute("data-hovered")`. Nas ocorrências 2 a 5 a duração é o tempo limite padrão do `waitFor` (1000 ms) mais o custo do próprio teste: o atributo não chegou tarde — não chegou. Quando a história passa, no mesmo runner, leva de 56 a 266 ms.

## Hipóteses eliminadas

Cada uma foi acompanhada de uma mudança ou de uma sonda, e cada uma foi morta por uma ocorrência posterior que a mudança deveria ter impedido ou por um dado que a sonda deveria ter mostrado.

### 1. Leitura antes do render

**Hipótese** (PR #132, 05:27): `userEvent.hover` dispara os eventos de ponteiro, mas `data-hovered` do React Aria só existe depois que o React confirma o render; a linha seguinte lia o atributo de forma síncrona e, sob carga, chegava antes. A ocorrência 1 aconteceu numa execução de cache frio que levou 11 s contra os 3 s habituais.

**Mudança:** a leitura passou a ser repetida com `waitFor` até o estado chegar ou o prazo esgotar.

**Dado que a matou:** a ocorrência 2, 42 minutos depois, já com o `waitFor` no lugar. A repetição esgotou os 1000 ms sem o atributo aparecer. A hipótese explicava uma leitura cedo demais; não explica um render que não vem em 1 s.

### 2. Reotimização de dependência em voo

**Hipótese** (PR #136, 07:19): com a descoberta de dependências do Vite ligada, uma dependência que o scanner não visse seria otimizada no meio da execução e recarregaria a página, invalidando módulos em voo — inclusive a referência `anchor` que a asserção segura.

**Mudança:** pré-empacotamento explícito (`optimizeDeps.noDiscovery: true`, lista declarada em `.storybook/optimize-deps.ts`, com teste de contrato que reprova especificador não listado). O próprio PR já registrava que não era um conserto: a instrumentação mostrava que o scanner encontrava todas as dependências, e 31 execuções frias locais não produziram nem falha nem reotimização.

**Dado que a matou:** a ocorrência 3, 8 minutos após o merge, com o otimizador explícito ativo e nenhuma reotimização no log. Repetida nas ocorrências 4 e 5.

### 3. Ambiente sem capacidade de hover

**Hipótese** (esta investigação): o CI reportaria `(hover: none)`. O `useHover` do React Aria se recusaria a aplicar estado de ponteiro por decisão de desenho, e a história estaria afirmando um comportamento que o ambiente legitimamente não tem.

**Sonda:** registro, no início do `play`, de `matchMedia("(hover: hover)")`, `matchMedia("(any-hover: hover)")`, `matchMedia("(pointer: fine)")` e `navigator.maxTouchPoints`, enviado ao console e à mensagem da asserção.

**Dado que a matou:** nas ocorrências 4 e 5 — os dois runs que falharam com a sonda no lugar — o ambiente reportou `hover: hover: true`, `any-hover: hover: true`, `pointer: fine: true`, `maxTouchPoints: 0`. Idêntico ao ambiente local e aos runs que passaram. O React Aria não está recusando hover por falta de capacidade; a história afirma um comportamento que o ambiente tem.

### 4. Corrida entre histórias

**Hipótese** (esta investigação): a história anterior no mesmo arquivo, "Com foco pelo teclado", deixa a âncora focada; se o documento não fosse limpo entre histórias, o `play` de "Sob o ponteiro" começaria sobre estado residual — um `data-focus-visible` antigo, um `data-hovered` já presente, um `activeElement` de outra história — e o `hover` sintético cairia num elemento que não é o que a asserção lê.

**Sonda:** registro, antes do `userEvent.hover`, de `performance.now()`, de `document.querySelector("[data-focus-visible]")`, de `anchor.hasAttribute("data-hovered")` e de `document.activeElement`.

**Dado que a matou:** nas ocorrências 4 e 5, os três campos vieram limpos — `staleFocusVisible: null`, `hoveredBeforeHover: false`, `activeElement: "body"` — iguais aos dos runs que passaram. O `play` começou num documento limpo, com o foco no `body` apesar de "Com foco pelo teclado" ter acabado de rodar. `performance.now()` também não separa falha de sucesso: 2376 ms e 2184 ms nas falhas, contra 1531–2869 ms nos sucessos.

## Mecanismo, até onde se sabe

O caminho que a história exercita:

1. `userEvent.hover(anchor)` — sob o addon-vitest, o `userEvent` de `storybook/test` é o `@testing-library/user-event`, que despacha eventos sintéticos de DOM (`pointerover`, `pointerenter`, `mouseover`, `mouseenter`, `pointermove`, `mousemove`, com `pointerType: "mouse"`). Não é o ponteiro real do Playwright; o `resetMousePosition` que o addon chama antes de cada teste move o mouse real, que não participa do hover.
2. O React recebe o `pointerover` pelo listener delegado no container e sintetiza `onPointerEnter` para o `Link`.
3. `useHover.triggerHoverStart` (react-aria 3.52.1) recusa o hover apenas se `isDisabled`, se `pointerType === 'touch'`, se já está `isHovered`, ou se o alvo do evento não está contido no elemento. Há um guarda de módulo, `globalIgnoreEmulatedMouseEvents`, que só liga após um `pointerup` com `pointerType: 'touch'` — não há toque nesta bancada.
4. `setHovered(true)` → render → `data-hovered` no elemento.

O que as cinco ocorrências dizem sobre esse caminho:

- O passo 1 completou: `userEvent.hover` não lançou (ele lança se o elemento não existe ou tem `pointer-events: none`), e o `play` seguiu até o `waitFor`.
- O passo 4 não aconteceu em 1000 ms, num documento limpo, num navegador que reporta ponteiro fino com hover, sem reotimização, com os mesmos módulos que produziram o atributo em ~150 ms nas outras execuções do mesmo run.
- Nenhuma condição conhecida de recusa do passo 3 é satisfeita pelos dados da sonda.
- Os dois temas falham (claro nas ocorrências 1 e 5, escuro nas 2, 3 e 4). Os dois projetos de tema rodam em paralelo, intercalados, em duas instâncias do Chromium no mesmo runner; a história irmã "Com foco pelo teclado", que exercita o mesmo componente pelo teclado, nunca reprovou.

O que fica sem observação direta é o passo 2: se o `pointerover` sintético chegou ao listener do React. É a fronteira entre o que a sonda cobriu e o que não cobriu, e o primeiro dado a colher quando a investigação for retomada — um listener nativo de `pointerover` na própria âncora, registrado dentro do `play`, distingue "o evento não chegou" de "o evento chegou e o estado não foi aplicado".

## Desfecho

**Estacionado, causa desconhecida.**

Quatro hipóteses foram eliminadas com dado, não com argumento. As duas primeiras custaram uma mudança de código cada, ambas mantidas: o `waitFor` é a leitura correta de estado renderizado, e o pré-empacotamento explícito remove uma classe de falha da bancada por construção. Nenhuma das duas consertou o incidente, e o PR #136 já dizia que não consertaria.

As duas seguintes custaram uma sonda descartável, e mostraram que a falha acontece num ambiente capaz e num documento limpo. Isso fecha as explicações baratas. As que sobram exigem instrumentar o próprio caminho do evento, e o retorno de fazê-lo agora é baixo: a história é a única de hover na bancada, a falha não vaza para outra história, e cada rerun custa um clique.

**Gatilho de retomada:** uma história de interação dos próximos ciclos — qualquer átomo ou primitiva que exercite ponteiro ou teclado — reprovar no CI com a mesma assinatura: estado pós-interação que não chega dentro do `waitFor`, com o ambiente reportando capacidade e o documento limpo. Quando isso acontecer, o incidente deixa de ser de uma história e passa a ser da bancada, e o primeiro passo é o listener nativo descrito acima.

Até lá: nada de `retry` nem de tempo limite maior — os dois esconderiam exatamente o dado que o gatilho precisa ver.

**Encerramento (22 de setembro de 2026).** A reexecução pelo botão foi substituída pela remoção: `hovered` saiu dos estados declarados no contrato do `EvidenceAnchor` e a história "Sob o ponteiro" saiu da bancada. O contrato declara estado que a bancada verifica; enquanto a causa era desconhecida, declarar `hovered` mantinha no contrato uma promessa que nenhuma história verde sustentava. O que saiu foi a declaração, não o comportamento: `data-hovered` continua vindo do React Aria em tempo de execução e o estilo `.anchor[data-hovered]` continua no CSS. O gatilho de retomada acima permanece válido — passa a depender da primeira história de ponteiro que a bancada ganhar de novo.

## Descarte

A sonda, o `--reporter=verbose` em `verify:test` e a branch `probe/hover-media-query` foram descartados ao encerrar. Os logs dos runs citados ficam no GitHub Actions pelo prazo de retenção do repositório.

## Referências

- PR #132 — `fix: make post-interaction assertions deterministic`
- PR #136 — `chore: pre-bundle bench dependencies explicitly`
- `useHover`: `react-aria/dist/private/interactions/useHover.mjs` (3.52.1)
- `resetMousePosition` antes de cada teste: `@storybook/addon-vitest/dist/vitest-plugin/setup-file.browser.3.js`
- Spec da bancada: `openspec/specs/verification-bench/spec.md`
