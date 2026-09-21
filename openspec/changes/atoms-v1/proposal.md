# Átomos v1

## Why

A bancada existe desde o ciclo 3 e não tem o que verificar: `packages/ui` publica
uma história de superfície e nada mais. As primitivas de domínio do ciclo 5 — as
que exibem estado, número com proveniência, conflito e ausência — precisam de
peças elementares que ainda não existem.

A escolha dessas peças não é livre. Um conjunto genérico escolhido por convenção
entrega botão, campo e cartão antes de haver ação, formulário ou agrupamento que
os justifique, e é reescrito quando a primeira primitiva de domínio revela o que
de fato precisava. Os átomos desta mudança são derivados das restrições de
domínio, um a um.

## What Changes

- Entrega seis átomos, cada um derivado de uma restrição de domínio declarada.
- Estabelece que todo estado declarado no contrato de um átomo tem história, e
  que estado sem história reprova a verificação.
- Estabelece que a distinção entre papéis de valor não pode depender só de cor.

## Capabilities

### New Capabilities

- `interface-atoms` — o comportamento observável da camada atômica: o que cada
  átomo garante, o que ele recusa exibir, e o que a verificação cobra de todos.

### Modified Capabilities

Nenhuma.

## Impact

- **Pacote:** `packages/ui` passa a publicar componentes.
- **Dependências novas:** primitivas de comportamento acessível, para os átomos
  que têm interação. Justificadas no desenho.
- **Verificação:** ganha a checagem de estado sem história.
- **Intocados:** `packages/tokens`, `apps/`, `src/`, `tests/`, `data/`,
  `queries/`, `supabase/`.

## Os seis átomos e de onde vêm

| Átomo | Restrição que o exige |
| --- | --- |
| Texto | papéis de valor visualmente distintos; redação original ao lado da normalizada |
| Número | todo número exibido alinha em coluna e distingue principal, contrafactual e contexto |
| Marcador de estado | os três eixos são independentes e nenhum componente pode colapsá-los |
| Hachura | `unresolved` permanece visível e nunca recebe preenchimento sólido |
| Ausência declarada | `projection_status = blocked` não exibe número algum; ausência nunca é zero |
| Âncora de evidência | todo número exibido carrega caminho até sua evidência |

## O que esta mudança não faz

Não entrega botão, campo de formulário, cartão, modal ou menu. Nenhuma restrição
de domínio os exige, e nenhuma primitiva do ciclo 5 os consome. Eles entram
quando houver ação a executar ou dado a coletar — provavelmente no ciclo 7, com o
shell do back office.

Não compõe nenhuma primitiva de domínio: os átomos são as peças, e a composição é
o ciclo 5. Não toca em gráfico, que é o ciclo 6.
