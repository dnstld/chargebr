# Primitivas de domínio v1

## Why

Os seis átomos do ciclo 4 sabem exibir estado, número, ausência e evidência, mas
nenhum deles sabe que um número sem proveniência não pode ser exibido, que os três
eixos não podem ser colapsados, ou que uma projeção bloqueada não mostra número
nem parcial. Essas são as regras que separam o ChargeBR de uma biblioteca
genérica, e hoje elas existem como texto em `openspec/config.yaml` e em nenhum
lugar executável.

Este ciclo transforma três dessas regras em componentes que as impõem.

## What Changes

- Entrega três primitivas de domínio, com forma de entrada própria da biblioteca.
- Cria um módulo de vocabulário: um dicionário único onde os termos da metodologia
  viram texto de tela, usado por padrão e sobrescrevível por quem consome.
- Estende a checagem de cobertura de estados, hoje restrita aos átomos, para
  cobrir também as primitivas.

## Capabilities

### New Capabilities

- `domain-primitives` — o comportamento observável da camada de domínio: o que
  cada primitiva recusa exibir, como os eixos permanecem independentes, e de onde
  vem o texto que aparece na tela.

### Modified Capabilities

Nenhuma. A convenção de contrato e a checagem de cobertura do ciclo 4 são
estendidas na implementação, sem alteração dos requisitos de `interface-atoms`.

## As três primitivas e de onde vêm

| Primitiva | Restrição que a exige |
| --- | --- |
| Valor com proveniência | todo número exibido carrega caminho até sua evidência; principal, contrafactual e contexto são visualmente distintos |
| Projeção bloqueada | `projection_status = blocked` não exibe número algum, nem parcial |
| Painel de estados | `verification_level`, `workflow_status` e `normalization_status` são eixos independentes e nenhum componente os colapsa |

São as três que a carga canônica `0007` e o contrato `chargebr-methodology-reading-v1`
já produzem. Conflito entre fontes e o par redação original/normalizada ficam
para quando houver dado real que os exercite — construí-los agora exigiria
inventar fixtures, e inventar evidência é exatamente o que a metodologia recusa.

## Impact

- **Pacote:** `packages/ui` passa a publicar uma camada de domínio e um módulo de
  vocabulário.
- **Dependências novas:** nenhuma prevista.
- **Verificação:** a checagem de cobertura de estados passa a incluir primitivas.
- **Intocados:** `packages/tokens`, `apps/`, `src/`, `tests/`, `data/`, `queries/`,
  `supabase/`.

## O que esta mudança não faz

Não cria tela, rota, layout de página ou aplicação. Não busca dado e não conhece
o formato do contrato de leitura: a tradução entre o contrato e a forma da
biblioteca é responsabilidade de quem consome. Nenhum adaptador é publicado neste
ciclo — decisão adiada, com o motivo e o ponto de revisão no desenho.

Não entrega gráfico, que é o ciclo 6.
