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
  garantia de domínio. `ChartPoint` deixa de ter três estados
  (`resolved`/`unresolved`/`missing`, cada um com proveniência obrigatória)
  e passa a ter um só formato, `{ category, value }`, em que `value: null` é
  a única lacuna. **BREAKING** para a forma de entrada de todo gráfico.
- Quatro decisões do dono, registradas aqui como decisão e não como escolha
  desta proposta (ver design.md para a medição por trás de cada uma):
  1. Formatação de valor numérico é função recebida por propriedade, padrão
     `String(value)`. Nenhum locale cravado no componente.
  2. O limite de séries da paleta deixa de reprovar em `verify:types` e passa
     a reprovar em execução.
  3. A hachura continua exportada, com história — os gráficos deixam de
     desenhá-la. Capacidade desligada de propósito; reativa no primeiro
     consumidor real.
  4. `NumericValue` é dissolvido; a exibição de número tabular vira variante
     do átomo de texto genérico. Formatação de número vira hook. Nenhuma
     outra variante nova entra nesta mudança.
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
a pergunta original. Não resolve sozinha o que fazer com `DeclaredAbsence` e
`EvidenceAnchor` (ver "Decisões em aberto"). Não aplica código nenhum: esta é
só a proposta.

## Decisões em aberto

**`DeclaredAbsence` e `EvidenceAnchor` ficam sem consumidor construído, e o
dono não se pronunciou sobre os dois.** Medido: depois de `BlockedProjection`,
`StatusPanel` e a coluna de evidência de `ChartValueTable` saírem,
`DeclaredAbsence` (usada só por esses três) e `EvidenceAnchor` (usada só por
`ValueWithProvenance` e pela mesma coluna) não têm mais nenhum lugar
construído que as renderize. `Hatch` está na mesma situação — sem consumidor
depois da decisão 3 — mas para `Hatch` o dono já decidiu: fica exportada, com
história, capacidade desligada de propósito. Para estes dois átomos, não há
decisão equivalente registrada. Duas posições, sem escolher entre elas:

- **(a) Mesmo tratamento de `Hatch`.** Ficam exportadas, com história,
  desligadas de propósito, com o mesmo gatilho de reativação — o primeiro
  consumidor real. Consistente por analogia direta.
- **(b) Saem agora.** Diferente de `Hatch` — que é textura pura, sem
  vocabulário nenhum —, um "átomo de ausência" e uma "âncora de evidência"
  só fazem sentido nomeados assim porque existia algo para declarar ausente
  ou para dar evidência de. Sem esse algo, manter os dois exportados é manter
  nome que promete um conceito que não existe mais no pacote.

**O que me faria decidir uma posição:** nenhuma das duas — é escolha do dono,
não fato que uma medição resolve. Registrado aqui, não escolhido; a
implementação para no primeiro destes dois átomos até a decisão existir.

## Capabilities

### New Capabilities

- `interface-charts`: comportamento observável de desenho de gráfico que não
  depende de vocabulário de negócio — paleta e sua validação por forma,
  limite de séries em execução, legenda a partir de duas séries, ponto sem
  valor, e acesso aos valores por meio não visual.

### Modified Capabilities

- `interface-atoms`: retira `StatusMarker` e os requisitos "Marcador de
  estado nomeia seu eixo" e "Estado não resolvido é hachurado"; retira
  "Distinção não depende só de cor"; modifica "Número alinha em coluna" para
  descrever a variante tabular do átomo de texto, não um átomo de número
  próprio.

### Removed Capabilities

- `domain-primitives`: os sete requisitos vivos descreviam `ValueWithProvenance`,
  `BlockedProjection`, `StatusPanel` e o módulo de vocabulário; nenhum dos
  três componentes continua existindo.
- `domain-charts`: os requisitos que dependiam de bloqueio de projeção,
  proveniência ou do estado "não resolvido" saem sem substituto; os que
  descreviam garantia de desenho pura migram para `interface-charts`.

## Impact

- **Código (apply, fora desta proposta):** `packages/ui/src/molecules/domain/`
  e `packages/ui/src/organisms/domain/` ficam vazias e saem; `domain/`
  (contrato, índice, `block-reason.ts`, fixture derivada do contrato) sai
  inteira; `vocabulary/` sai inteira (seu único consumidor era o que está
  saindo); `atoms/status-marker/` sai; `organisms/charts/` perde
  `blocked`/`BlockReason`, os três `PointKind`, a coluna de evidência e a
  marca de "não resolvido" de `ChartValueTable`, e o uso de `Hatch` em
  `hatch-pattern.tsx`/`plot.tsx`. A fixture derivada do contrato de leitura
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
  ser reduzido a nada (a remoção de `interface-atoms` já aconteceu aqui).
- **O que esta proposta não aplica:** nenhum arquivo de código muda nesta
  etapa — só os artefatos de proposta, especificação e plano.
