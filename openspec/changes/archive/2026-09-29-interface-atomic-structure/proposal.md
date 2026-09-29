# Proposal

## Why

`@chargebr/ui` decidiu, em `docs/decisao-biblioteca-de-componentes.md` (aceita e
mergeada), ser uma biblioteca de primitivas genéricas com variantes — mas a
estrutura de pastas de hoje (`atoms/`, `domain/`, `charts/`, `shell/`) não
reflete design atômico: mistura tier de composição, semântica de domínio, tipo
de conteúdo e papel estrutural na mesma hierarquia de primeiro nível, e a
migração de `valueRole` para `weight`/`emphasis` que aquela decisão já fixou
ainda não foi aplicada. Ao mesmo tempo, o shell do back office precisa de
cabeçalho, navegação, layout responsivo e uma escala tipográfica, e nenhum
desses componentes existe. Reorganizar a estrutura antes de construir tela
evita que o primeiro componente novo já nasça no lugar errado.

## What Changes

- Reestrutura `packages/ui/src/` por tier de composição (`atoms/`,
  `molecules/`, `organisms/`), com o eixo genérico/domínio virando subpasta
  (`molecules/domain/`, `organisms/domain/`) só onde o componente de fato lê
  vocabulário de negócio ChargeBR. `charts/` e `shell/` deixam de ser pastas de
  primeiro nível.
- Migra `Text` e `NumericValue` de `valueRole` (obrigatório) para `weight` e
  `emphasis` (variantes genéricas), movendo `value-role.ts` e
  `value-role.assert.ts` para a subpasta de domínio. **BREAKING** para quem já
  consome `TextProps.valueRole`/`NumericValueProps.valueRole` — não há
  consumidor hoje fora do próprio pacote (`apps/backoffice` não importa
  `Text`/`NumericValue` ainda).
- Inventaria e classifica dez componentes de cabeçalho/navegação/layout/
  tipografia: `Text` (muda), `Heading`, `Button`, `Icon`, `Logo`, `AppFrame`
  (muda), `NavPanel`, `NavSection`, `NavItem`, `PathLabel` — cada um com tier,
  status (existe / existe-e-muda / novo) e onde é usado.
- Acrescenta `lucide-react` como dependência de execução de `@chargebr/ui` e a
  linha correspondente em `BENCH_OPTIMIZE_DEPS`.
- Propõe um token de breakpoint (`screen.md`, 768px) — a única largura que
  `NavPanel` precisa — consumido em `@media` via `postcss-custom-media`,
  decisão do dono do repositório registrada em design.md (D6), com medição
  real confirmando que a bancada (Vite/Storybook) e `apps/backoffice`
  (Next/Turbopack) compartilham uma única configuração de PostCSS.
- Registra a tensão entre o inventário de navegação pedido e o requisito
  vivo de `backoffice-shell` que proíbe região de navegação no documento
  entregue enquanto não existir rota de negócio; o dono decidiu manter o
  requisito como está e construir a navegação só na bancada (design.md, D5).

## Capabilities

### New Capabilities

- `shell-components`: comportamento observável, no nível de componente de
  biblioteca (bancada, não documento emitido pela aplicação), do inventário de
  cabeçalho, navegação e tipografia — `Heading`, `Button`, `Icon`, `Logo`,
  `PathLabel`, `NavItem`, `NavSection`, `NavPanel`: o que cada um garante sobre
  token, estado "corrente", foco preso só no modo sobreposto, e cobertura de
  história.

### Modified Capabilities

- `backoffice-shell`: o requisito "Regiões da moldura no documento entregue"
  tem uma cena que hoje prova "o nome do produto aparece no cabeçalho" lendo
  texto visível; com `Logo` (imagem vetorial) substituindo o texto puro do
  nome do produto no cabeçalho, a prova muda de leitura de texto visível para
  leitura de nome acessível. O requisito "SHALL NOT conter região de
  navegação" **não muda** nesta proposta — decisão do dono, design.md (D5).
- `verification-bench`: acrescenta "Localizador independente do que se
  afirma" — achado da migração de `valueRole` (design.md, D8) e da varredura
  que o seguiu: uma afirmação não pode ser a única prova de um comportamento
  quando localiza o elemento pelo mesmo atributo `data-*` (ou pelo efeito de
  estilo dele) que está verificando. Não é específico de `Text`/`NumericValue`
  — a varredura encontrou mais dois casos sem relação com esta proposta
  (`status-marker`, ciclo 4; legenda de gráfico, ciclo 6), corrigidos junto.

`workspace-verification` **não é** capacidade modificada: a decisão do dono
em D6 (Opção B, `postcss-custom-media`) resolve o breakpoint sem literal
nenhum em CSS Module, então o guardião de literal de estilo não precisa de
exceção — versão anterior desta proposta chegou a escrever essa exceção como
delta (Opção A) antes da decisão; foi removida.

**Correção de 2026-09-29.** `interface-atoms` e `domain-primitives` saíram
das capacidades modificadas acima — nesta mesma data, `domain-primitives`
foi arquivada e retirada por `remove-domain-capabilities`
(`openspec/changes/archive/2026-09-29-remove-domain-capabilities`), que
chegou por conta própria à mesma remoção de "Distinção não depende só de
cor" em `interface-atoms`, mas sem destino de migração: como
`domain-primitives` deixa de existir, não há para onde o conteúdo
normativo migrar. Os dois deltas desta mudança que dependiam desse destino
(`specs/interface-atoms/spec.md`, REMOVED; `specs/domain-primitives/spec.md`,
MODIFIED) foram removidos — a remoção já aconteceu pela outra mudança, e
modificar uma capacidade que não existe mais não é uma operação válida de
sincronização. Nenhuma tarefa executada (grupo 2, `tasks.md`) foi reescrita;
a correção é só nestes dois artefatos de planejamento, ainda não
sincronizados.

## Impact

- **Código:** todo `packages/ui/src/` muda de posição de arquivo (reestrutura
  de pastas); `packages/ui/src/atoms/text/text.tsx`,
  `.../numeric-value/numeric-value.tsx`,
  `.../domain/value-with-provenance/value-with-provenance.tsx`,
  `.../charts/value-table.tsx`, `.../vocabulary/vocabulary.ts` mudam de prop
  ou de import. Dez arquivos de componente novos ou alterados no inventário do
  shell.
- **Dependências:** `lucide-react` entra como dependência de execução de
  `@chargebr/ui`; `postcss-custom-media` entra como dependência de
  desenvolvimento, com um `postcss.config.mjs` novo na raiz do monorepo,
  compartilhado pela bancada (`packages/ui`) e por `apps/backoffice` — medido
  com uma tentativa real (design.md, D6).
- **Tokens:** novo arquivo `packages/tokens/tokens/primitive/screen.json`,
  emitindo `@custom-media --screen-md (min-width: 768px)` junto das custom
  properties já geradas.
- **Verificação:** `packages/ui/.storybook/optimize-deps.ts` ganha a linha
  `"lucide-react"`. Nenhuma mudança em `tools/checks/style-literals.test.ts`
  — ver `workspace-verification` acima. A varredura de D8 corrige, fora do
  inventário desta proposta,
  `atoms/status-marker/status-marker.stories.tsx` (duas afirmações sem poder
  de reprovar, removidas) e `organisms/charts/chart.assert.ts` (a prova de
  forma da legenda, trocada de rótulo para elemento desenhado) — ver
  `verification-bench` acima.
- **Aplicação:** nenhuma. `apps/backoffice/app/layout.tsx` **não** é tocado por
  esta proposta — o slot `nav` de `AppFrame` fica sem consumidor real até o
  ciclo que trouxer a primeira rota de negócio (decisão do dono, design.md,
  D5).
- **O que esta mudança explicitamente não faz:** não constrói nenhum
  componente (é proposta, não aplicação); não cria rota; não liga `NavPanel`
  ao `apps/backoffice` real; não toca `charts/` além de movê-la para dentro
  da nova hierarquia de tier — reclassificação fina de cada gráfico fica
  para o ciclo que tocar `charts/` por razões próprias. As três perguntas
  em aberto da versão anterior desta proposta — forma do "subtítulo" de
  `Heading`, posição sobre a tensão com `backoffice-shell`, mecanismo de
  consumo do breakpoint — foram decididas pelo dono e registradas em
  design.md.
