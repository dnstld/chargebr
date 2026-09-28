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
  `NavPanel` precisa — e a forma de ele ser consumido em `@media`, já que
  `var()` não funciona dentro de condição de media query e o pipeline não tem
  `postcss-custom-media`.
- Registra, sem decidir sozinha, a tensão entre o inventário de navegação
  pedido e o requisito vivo de `backoffice-shell` que proíbe região de
  navegação no documento entregue enquanto não existir rota de negócio.

## Capabilities

### New Capabilities

- `shell-components`: comportamento observável, no nível de componente de
  biblioteca (bancada, não documento emitido pela aplicação), do inventário de
  cabeçalho, navegação e tipografia — `Heading`, `Button`, `Icon`, `Logo`,
  `PathLabel`, `NavItem`, `NavSection`, `NavPanel`: o que cada um garante sobre
  token, estado "corrente", foco preso só no modo sobreposto, e cobertura de
  história.

### Modified Capabilities

- `interface-atoms`: o requisito "Distinção não depende só de cor" nomeia
  papel de domínio (principal/contrafactual/contexto) numa spec que passa a
  descrever só a camada genérica; o requisito sai daqui e o conteúdo normativo
  se funde a "Papéis não são intercambiáveis", em `domain-primitives`.
- `domain-primitives`: "Papéis não são intercambiáveis" absorve o conteúdo
  normativo do requisito removido de `interface-atoms` — a garantia observável
  não muda (os três papéis continuam distintos por propriedade não cromática),
  mas ela passa a viver inteira aqui.
- `backoffice-shell`: o requisito "Regiões da moldura no documento entregue"
  tem uma cena que hoje prova "o nome do produto aparece no cabeçalho" lendo
  texto visível; com `Logo` (imagem vetorial) substituindo o texto puro do
  nome do produto no cabeçalho, a prova muda de leitura de texto visível para
  leitura de nome acessível. O requisito "SHALL NOT conter região de
  navegação" **não muda** nesta proposta — ver Impact, e a lacuna registrada em
  design.md.
- `workspace-verification`: o requisito que reprova valor literal de cor,
  espaço, raio, sombra ou tipografia fora da camada primitiva de tokens ganha
  uma exceção nomeada para o valor de `min-width`/`max-width` dentro de
  `@media`, porque breakpoint não pode ser consumido por `var()` na condição
  de uma media query — a exceção é condicionada a um teste de contrato que
  compara o literal ao token primitivo de origem.

## Impact

- **Código:** todo `packages/ui/src/` muda de posição de arquivo (reestrutura
  de pastas); `packages/ui/src/atoms/text/text.tsx`,
  `.../numeric-value/numeric-value.tsx`,
  `.../domain/value-with-provenance/value-with-provenance.tsx`,
  `.../charts/value-table.tsx`, `.../vocabulary/vocabulary.ts` mudam de prop
  ou de import. Dez arquivos de componente novos ou alterados no inventário do
  shell.
- **Dependências:** `lucide-react` entra como dependência de execução de
  `@chargebr/ui`; nenhuma dependência de build nova é decidida aqui — a escolha
  entre exceção no guardião e `postcss-custom-media` fica registrada como
  aberta em design.md.
- **Tokens:** novo arquivo `packages/tokens/tokens/primitive/screen.json`.
- **Verificação:** `tools/checks/style-literals.test.ts` ganha a exceção
  nomeada acima; `packages/ui/.storybook/optimize-deps.ts` ganha a linha
  `"lucide-react"`.
- **Aplicação:** nenhuma. `apps/backoffice/app/layout.tsx` **não** é tocado por
  esta proposta — o slot `nav` de `AppFrame` fica sem consumidor real até o
  ciclo que trouxer a primeira rota de negócio (ver design.md, tensão com
  `backoffice-shell`).
- **O que esta mudança explicitamente não faz:** não constrói nenhum
  componente (é proposta, não aplicação); não cria rota; não liga `NavPanel`
  ao `apps/backoffice` real; não decide a forma final do prop de "subtítulo"
  de `Heading` entre as duas leituras registradas (fica lacuna em design.md);
  não decide entre as duas opções de mecanismo de breakpoint em `@media`
  (fica lacuna em design.md, com recomendação registrada e não fechada); não
  toca `charts/` além de movê-la para dentro da nova hierarquia de tier —
  reclassificação fina de cada gráfico fica para o ciclo que tocar `charts/`
  por razões próprias.
