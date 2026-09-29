# Proposal

## Why

`@chargebr/ui` não tem backend, não tem dado e um único consumidor real
(`AppFrame`, numa página de 12 linhas). Ainda assim, boa parte do pacote
carrega a metodologia da frente de coleta — três eixos de estado com nomes
de coluna (`verification_level`, `workflow_status`, `normalization_status`),
razões de bloqueio de projeção, proveniência obrigatória por número — como se
fosse regra de interface. `bdde87e` já revogou a origem dessa instrução em
`openspec/config.yaml` e acrescentou o teste que decide o resto: um requisito
só existe se nomear o que quebra sem ele, hoje, no que está construído; regra
sobre dado que nenhuma tela exibe é anotação, não requisito. Esta mudança
aplica esse teste aos dois capítulos que ainda carregam a metodologia —
`domain-primitives` inteiro e a metade de `domain-charts` que não é garantia
de desenho — e retira o que não sobrevive.

## What Changes

- Retira a capacidade `domain-primitives` inteira: os sete requisitos vivos
  descreviam `ValueWithProvenance`, `BlockedProjection`, `StatusPanel` e o
  módulo de vocabulário — nenhum dos três componentes continua existindo, e
  sem eles o vocabulário (que só os alimentava) não tem mais consumidor.
  **BREAKING** para quem importa `@chargebr/ui/domain` — hoje ninguém importa
  fora do próprio pacote.
- Em `interface-atoms`, retira `StatusMarker` (os três eixos de estado são a
  própria metodologia, cravados no tipo do átomo — `StatusAxis` é
  `verification_level | workflow_status | normalization_status`) e os dois
  requisitos que o provam; retira "Distinção não depende só de cor" (mesmo
  trio de papéis de `ValueWithProvenance`, que deixa de existir). Modifica
  "Número alinha em coluna": o átomo de número é dissolvido (decisão do dono,
  abaixo) e a garantia de alinhamento passa a ser da variante tabular do
  átomo de texto genérico.
- Retira a capacidade `domain-charts` inteira e a substitui por
  `interface-charts`, mais estreita: o que sobra de `domain-charts` depois de
  tirar bloqueio de projeção, proveniência e o estado "não resolvido" é
  garantia de desenho — paleta, legenda, uma escala, ponto sem valor —, não
  garantia de domínio. `ChartPoint` deixa de ter
  três estados (`resolved`/`unresolved`/`missing`, cada um com proveniência
  obrigatória) e passa a ter um só formato, `{ category, value, fill? }`, em
  que `value: null` é a única lacuna e `fill` (`"solid"` | `"textured"`,
  padrão `"solid"`) é escolha visual genérica de quem compõe, sem
  significado de estado. **BREAKING** para a forma de entrada de todo
  gráfico.
- Acrescenta a `rules.specs` de `openspec/config.yaml` a distinção entre
  requisito e componente: o teste de sobrevivência de `bdde87e` ("nomear o
  que quebra sem ele, hoje, no que está construído") vale para requisito, não
  para componente — biblioteca de UI é inventário, e componente genérico sem
  consumidor construído é catálogo, não lacuna. Sem essa distinção, a regra
  vira licença para esvaziar a biblioteca componente por componente. Decisão
  do dono, registrada com data e razão em
  `docs/decisao-biblioteca-de-componentes.md`.
- Cinco decisões do dono, registradas aqui como decisão e não como escolha
  desta proposta (ver design.md para a medição por trás de cada uma, e
  `docs/decisao-biblioteca-de-componentes.md` para o registro no repositório):
  1. Formatação de valor numérico é função recebida por propriedade, padrão
     `String(value)`. Nenhum locale cravado no componente.
  2. O limite de séries da paleta deixa de reprovar em `verify:types` e passa
     a reprovar em execução.
  3. `Hatch` fica — passa no teste de componente acima —, e o gráfico ganha a
     opção genérica de preenchimento texturizado descrita no bullet anterior,
     consumindo o mesmo `<pattern>` que `Hatch` desenha em seus próprios
     `defs`: uma implementação só, em `atoms/hatch/`, não duas que
     poderiam divergir. Correção de 2026-09-29 sobre a versão anterior desta
     proposta, que mantinha `ChartHatchPattern` como segunda definição em
     `organisms/charts/hatch-pattern/` — ver "Removed Capabilities", abaixo,
     sobre o que isso muda em `domain-charts`.
  4. `NumericValue` é dissolvido; a exibição de número tabular vira variante
     do átomo de texto genérico. Formatação de número vira hook. Nenhuma
     outra variante nova entra nesta mudança.
  5. `DeclaredAbsence` sai — não por falta de consumidor, por não ser
     primitiva: `kind` vale `"blocked"` ou `"unknown"`, vocabulário de
     domínio. `EvidenceAnchor` vira `Link`, genérico (`href` e conteúdo) —
     passa no teste de componente mesmo sem consumidor imediato, e ganha um
     em breve: `NavItem`, do grupo 6 de `interface-atomic-structure`, é um
     link.
- Fecha o ponto aberto 7 de `docs/pontos-abertos.md` ("'Uma escala por
  gráfico' abrange o canal de tamanho?") — não por decisão sobre o canal de
  tamanho, mas porque o requisito em que o ponto se apoiava deixa de existir:
  sem `measure` por série (a nova forma de série é só `{ name, points }`),
  não há como uma série declarar uma segunda escala, e sem essa forma de erro
  não há o que a pergunta do ponto 7 esteja perguntando sobre. Ver design.md.

## O que esta mudança não faz

Não toca variante de átomo (`variant`, `size`, `disabled`, `loading` em
`Button` e afins) — mudança já adiada pelo dono em
`docs/decisao-biblioteca-de-componentes.md`. Não cria pacote novo. Não toca
`apps/backoffice`. Não decide o canal de tamanho de uma futura forma "bolha"
— só fecha o ponto aberto que dependia do requisito retirado, sem responder
a pergunta original. Não aplica código nenhum: esta é só a proposta.

## Decisão de 2026-09-28: `DeclaredAbsence` e `EvidenceAnchor`

**Decidido pelo dono**, depois desta proposta ter sido escrita com este ponto
em aberto — o registro completo, com a razão de cada átomo, está em
`docs/decisao-biblioteca-de-componentes.md` ("Decisão de 2026-09-28: teste de
componente, e o destino de Hatch, DeclaredAbsence e EvidenceAnchor"); aqui só
o resultado, para a tarefa 3.4 de `tasks.md`.

`DeclaredAbsence` sai do pacote: não por falta de consumidor construído — o
teste de componente de biblioteca (`docs/decisao-biblioteca-de-componentes.md`,
mesma data) não reprova componente sem consumidor —, mas por não ser
primitiva genérica. `kind` vale `"blocked"` ou `"unknown"`, vocabulário de
domínio; sem esse vocabulário, o que sobra é texto sem propriedade própria
que o distinga de `Text`.

`EvidenceAnchor` vira `Link`, genérico: `href` e conteúdo, nome acessível
obrigatório, sem depender só de ícone ou posição — a mesma garantia de hoje,
sem o nome "evidência" e o vocabulário que vinha junto. Passa o teste de
componente mesmo sem consumidor imediato, e ganha um em breve — `NavItem`,
do grupo 6 de `interface-atomic-structure`, é um link.

Isto desbloqueia a tarefa 3.4 de `tasks.md`.

## Capabilities

### New Capabilities

- `interface-charts`: comportamento observável de desenho de gráfico que não
  depende de vocabulário de negócio — paleta e sua validação por forma,
  limite de séries em execução, legenda a partir de duas séries, ponto sem
  valor, e acesso aos valores por meio não visual.

### Modified Capabilities

- `interface-atoms`: retira `StatusMarker` e os requisitos "Marcador de
  estado nomeia seu eixo" e "Estado não resolvido é hachurado"; retira
  "Distinção não depende só de cor"; retira "Ausência nunca é zero"
  (`DeclaredAbsence` sai — decisão de 2026-09-28, acima); modifica "Número
  alinha em coluna" para descrever a variante tabular do átomo de texto, não
  um átomo de número próprio; modifica "Âncora de evidência tem nome
  acessível" para descrever o átomo `Link`, genérico, no lugar da âncora de
  evidência.

### Removed Capabilities

- `domain-primitives`: os sete requisitos vivos descreviam `ValueWithProvenance`,
  `BlockedProjection`, `StatusPanel` e o módulo de vocabulário; nenhum dos
  três componentes continua existindo.
- `domain-charts`: os requisitos que dependiam de bloqueio de projeção,
  proveniência ou do estado "não resolvido" saem sem substituto; os que
  descreviam garantia de desenho pura — paleta, limite de séries, legenda,
  ponto sem valor, acesso não visual — migram para `interface-charts`. "A
  hachura é uma só" sai sem migrar: com uma implementação só do `<pattern>`
  (correção de 2026-09-29, ver "What Changes"), não há duas definições para
  divergir, e o requisito deixa de ter o que provar em qualquer capacidade.

## Impact

- **Código (apply, fora desta proposta):** `packages/ui/src/molecules/domain/`
  e `packages/ui/src/organisms/domain/` ficam vazias e saem; `domain/`
  (contrato, índice, `block-reason.ts`, fixture derivada do contrato) sai
  inteira; `vocabulary/` sai inteira (seu único consumidor era o que está
  saindo); `atoms/status-marker/` sai; `atoms/declared-absence/` sai;
  `atoms/evidence-anchor/` vira `atoms/link/`, genérico. `organisms/charts/`
  perde `blocked`/`BlockReason`, os três `PointKind`, a coluna de evidência e
  a marca de "não resolvido" de `ChartValueTable`; `organisms/charts/hatch-pattern/`
  sai inteiro, e o `<pattern>` que ele desenhava passa a viver em
  `atoms/hatch/` — um componente só, que `Hatch` consome em seus próprios
  `defs` e que `plot.tsx` importa de `atoms/` para o preenchimento genérico
  do ponto (`fill?: "solid" | "textured"`), organismo consumindo átomo. A
  fixture
  derivada do contrato de leitura
  (`organisms/charts/fixtures/abve-eletrificados-janeiro-2025.ts`) sai; a
  varredura de `packages/ui/src` fica só com fixture sintética, fechando a
  mitigação de risco R2 já registrada em
  `docs/decisao-configuracao-inicial-do-workspace.md`.
- **Guardião:** `tools/checks/component-vocabulary.test.ts` perde as entradas
  "moléculas de domínio" e "organismos de domínio" — perímetro nomeado sem
  componente reprova o próprio guardião se ficarem.
- **Pacote:** `packages/ui/package.json` perde os subpaths `./domain` e
  qualquer exportação de vocabulário do mapa `exports`.
- **`docs/pontos-abertos.md`:** ponto 7 fecha, citando esta mudança — ver
  "What Changes".
- **`openspec/changes/interface-atomic-structure`** (mudança aberta, não
  arquivada): groups 6–8 de `tasks.md` (Navegação, `AppFrame`, Fechamento)
  não tocam domínio e continuam em paralelo, sem alteração. Os grupos 1–5,
  já executados, criaram `molecules/domain/`/`organisms/domain/` e o
  raciocínio de D1 de `design.md` para `domain/` continuar pasta de primeiro
  nível — esta mudança esvazia e remove exatamente essas pastas quando
  aplicada; D1 documentou por que `domain/` ficava, e essa razão deixa de
  valer quando não existe mais nenhuma primitiva de domínio para o barril
  agregar. A spec delta ainda não sincronizada de `interface-atomic-structure`
  (`REMOVED "Distinção não depende só de cor"` em `interface-atoms`,
  `MODIFIED "Papéis não são intercambiáveis"` em `domain-primitives`) chega
  à mesma remoção que esta proposta por conta própria, mas com destino de
  migração diferente: lá, o conteúdo migra para `domain-primitives`; aqui,
  `domain-primitives` deixa de existir, então não há para onde migrar. Uma
  nota, sem reescrever o log de tarefas já executado, foi acrescentada ao
  fim de `tasks.md` daquela mudança, apontando para esta proposta. Quem
  arquivar as duas decide a ordem: se `interface-atomic-structure` arquivar
  primeiro, seu `MODIFIED` em `domain-primitives` deve ser retirado antes,
  porque não há capacidade para modificar; se esta mudança arquivar primeiro,
  o `REMOVED`/`MODIFIED` de `interface-atomic-structure` fica sem alvo e deve
  ser reduzido a nada (a remoção de `interface-atoms` já aconteceu aqui). Em
  sentido contrário, esta mudança entrega um consumidor a `Link` antes do
  esperado: o grupo 6 daquela mudança constrói `NavItem`, que é um link, e
  pode compor `Link` direto em vez de duplicar a garantia de nome acessível.
- **O que esta proposta não aplica:** nenhum arquivo de código muda nesta
  etapa — só os artefatos de proposta, especificação e plano.
