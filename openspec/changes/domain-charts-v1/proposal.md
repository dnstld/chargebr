# Gráficos de domínio v1

## Why

A paleta categórica foi validada no ciclo 2 e nunca desenhou uma marca. A hachura
nasceu no ciclo 4 como átomo próprio, justamente para que a versão do gráfico não
fosse uma segunda hachura parecida porém diferente — e o gráfico ainda não existe.
As restrições que dizem que `unresolved` nunca é agregado e que ausência nunca é
zero valem para números em texto, e é em gráfico que elas são mais fáceis de
violar sem ninguém perceber.

## What Changes

- Entrega uma camada de gráficos sobre visx, com uma variedade de formas.
- Faz a hachura do gráfico derivar da mesma definição da hachura do marcador.
- Impõe por execução as seis checagens de paleta na forma de pares correta para
  cada tipo de gráfico, e o limite de séries que decorre delas.
- Substitui o gráfico inteiro pela primitiva de projeção bloqueada quando a
  projeção estiver bloqueada.

## Capabilities

### New Capabilities

- `domain-charts` — o comportamento observável da camada de gráficos: o que ela
  recusa desenhar, como estado não resolvido aparece numa forma sem preenchimento,
  e o que garante que a cor não seja o único canal de identidade.

### Modified Capabilities

Nenhuma.

## Impact

- **Pacote:** `packages/ui` passa a publicar gráficos.
- **Dependências novas:** visx 4.0.0, que declara compatibilidade com React 19.
- **Verificação:** ganha as checagens de paleta por forma e a checagem de hachura única.
- **Intocados:** `packages/tokens` salvo pela definição compartilhada da hachura,
  `apps/`, `src/`, `tests/`, `data/`, `queries/`, `supabase/`.

## Sobre as fixtures

Esta mudança entrega mais formas do que o contrato de leitura hoje produz dado
para exercitar. A distinção que autoriza isso: uma primitiva de domínio com dado
inventado afirma um estado do domínio que não existe; um componente de barra com
fixture sintética afirma apenas uma capacidade de renderização.

A trava: toda fixture sintética SHALL ser declarada como sintética no próprio
arquivo, e nenhuma pode ser apresentada como derivada do contrato sem sê-lo. As
fixtures derivadas seguem anotando a origem de cada campo, como no ciclo 5.

## O que esta mudança não faz

Não cria tela, painel, rota ou aplicação. Não define rampa sequencial, divergente
ou paleta de status — entram quando houver magnitude, polaridade ou estado que as
exija. Não implementa exportação de imagem nem impressão.
