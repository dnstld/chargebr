# Design

## Context

Ver `proposal.md` para a motivação. Este documento registra como medi e o que
concluí, com o que me faria mudar de ideia em cada ponto — cada achado seguindo
o mesmo formato: o que medi, o que concluo, o que me faria mudar de ideia.

`docs/decisao-biblioteca-de-componentes.md` já decidiu, e não está em revisão
aqui: `@chargebr/ui` é biblioteca de primitivas genéricas com variantes;
`atoms/` não sabe vocabulário de domínio, `domain/` sabe. `Text` e
`NumericValue` trocam `valueRole` por `weight`/`emphasis`. O que falta é a
estrutura de pastas que reflita design atômico, e o inventário de
cabeçalho/navegação/layout/tipografia.

## Goals / Non-Goals

**Goals:**
- Propor uma estrutura de pastas de primeiro nível organizada por tier de
  composição (design atômico), com o eixo genérico/domínio expresso como
  subpasta.
- Inventariar os dez componentes do escopo (header, navegação, layout,
  tipografia), cada um com tier, status e uso.
- Decidir, com justificativa, se a reestruturação e a migração de `valueRole`
  formam uma mudança ou duas.
- Registrar a tensão entre o inventário de navegação pedido e o requisito
  vivo de `backoffice-shell` que proíbe região de navegação sem rota de
  negócio, sem resolvê-la por suposição.
- Propor o token de breakpoint e a forma de consumi-lo em `@media`.

**Non-Goals:**
- Não constrói nenhum componente — isso é tarefa do ciclo `/opsx:apply` desta
  mudança.
- Não liga `NavPanel` nem o slot `nav` de `AppFrame` ao `apps/backoffice` real.
- Não decide a forma final do "subtítulo" de `Heading` nem o mecanismo final
  de consumo do token de breakpoint — ambos ficam em Open Questions.
- Não toca `charts/` além de movê-la para dentro da nova hierarquia de tier;
  não reclassifica cada gráfico individualmente.
- Não toca cartão de indicador, fora do escopo do inventário.

## Decisions

### D1 — Estrutura de pastas: um eixo primário, um eixo secundário

**O que medi:** a estrutura atual de `packages/ui/src/` (`atoms/`, `domain/`,
`charts/`, `shell/`) nomeia pastas de primeiro nível por quatro critérios
diferentes ao mesmo tempo — tier de composição (`atoms/`), semântica de
domínio (`domain/`), tipo de conteúdo (`charts/`) e papel estrutural
(`shell/`). Os 33 arquivos de `packages/ui/src/` foram lidos por inteiro.
`atoms/` (declared-absence, evidence-anchor, hatch, numeric-value,
status-marker, text) — todos indivisíveis, nenhum compõe outro componente do
inventário como filho estrutural. `domain/` (blocked-projection, status-panel,
value-with-provenance) — variam em complexidade de composição:
`value-with-provenance` e `blocked-projection` compõem 1-2 átomos;
`status-panel` compõe vários `status-marker`. `charts/` mistura mecânica
genérica de visualização (`Plot`, `Chart`, `HatchPattern`) com uma peça que já
sabe vocabulário de domínio (`value-table.tsx` usa `valueRole="primary"`
fixo). `shell/` tem um componente só, nomeado pelo papel estrutural.

**O que concluo:** design atômico clássico (Brad Frost) organiza por UM eixo
primário — tier de composição: átomo é indivisível (não renderiza outro
componente nomeado do inventário como filho estrutural); molécula compõe 2+
átomos num padrão localmente reutilizável; organismo é uma seção distinta e
própria da interface. A decisão de `docs/decisao-biblioteca-de-componentes.md`
— genérico versus domínio — é um eixo DIFERENTE e ortogonal: é sobre saber ou
não vocabulário de negócio ChargeBR (verification_level, valueRole,
blockReason), não sobre profundidade de composição. Um `Card` genérico
hipotético seria molécula (compõe átomos) sem domínio nenhum;
`value-with-provenance` é domínio e pequeno (molécula); `status-panel` é
domínio e organismo. Os eixos coincidem às vezes, não por necessidade — e os
componentes do inventário desta proposta (header, navegação, layout,
tipografia) não carregam vocabulário de negócio ChargeBR nenhum: `Button`,
`Heading`, `NavItem` não sabem o que é `verification_level`. O eixo
genérico/domínio só se aplica à camada de exibição de dados medidos; o eixo de
tier se aplica a qualquer componente.

**Decisão:** a estrutura de primeiro nível organiza por TIER; o eixo
genérico/domínio vira subpasta `domain/` dentro de `molecules/` e de
`organisms/`, só onde o componente lê vocabulário de negócio. Um componente
sem essa subpasta é presumidamente genérico — não existe `atoms/domain/`
porque um átomo, por definição (indivisível, recebe tudo por propriedade),
nunca sabe vocabulário de domínio: é a mesma regra que já vale hoje, só
tornada estrutural.

```
packages/ui/src/
  atoms/
    text/ numeric-value/ declared-absence/ evidence-anchor/ hatch/ status-marker/
    heading/ button/ icon/ logo/ path-label/ nav-item/
  molecules/
    domain/
      value-with-provenance/ blocked-projection/
    nav-section/
  organisms/
    domain/
      status-panel/
      charts/            # fora de escopo desta proposta — mesma hierarquia, sem reclassificação fina
    app-frame/ nav-panel/
  vocabulary/
  utilities/
```

`charts/` e `shell/` deixam de ser pastas de primeiro nível. Cada gráfico
existente entraria em `organisms/domain/charts/` ou `organisms/charts/`
dependendo de saber ou não vocabulário — essa reclassificação fina fica fora
do escopo desta proposta (ver Non-Goals) e é tarefa do ciclo que tocar
`charts/` por razões próprias, com o gatilho registrado em tasks.md.

**O que me faria mudar de ideia:** encontrar, no inventário desta proposta, um
componente que precisasse ler vocabulário de domínio ChargeBR — não encontrei
nenhum (header/nav/layout/tipografia não tocam `verification_level`,
`valueRole`, `blockReason`).

### D2 — Uma mudança, não duas, para reestruturação + migração de valueRole

**O que medi:** `grep` por `valueRole`/`ValueRole` em `packages/ui/src`
encontra 12 arquivos, cinco funcionais (já listados em
`docs/decisao-biblioteca-de-componentes.md`): `atoms/text/text.tsx`,
`atoms/numeric-value/numeric-value.tsx`, `atoms/value-role.ts`,
`atoms/value-role.assert.ts`, `charts/value-table.tsx`,
`domain/value-with-provenance/value-with-provenance.tsx`.

**O que concluo:** a migração de `valueRole` toca exatamente os arquivos que a
reestruturação de pastas já precisa mover — `text.tsx` e `numeric-value.tsx`
permanecem em `atoms/`, mas `value-role.ts` migra para a subpasta de domínio,
`value-with-provenance.tsx` e `value-table.tsx` mudam de import e de
composição. Separar em duas mudanças forçaria revisar os mesmos 5-6 arquivos
duas vezes — uma para mover de pasta, outra para trocar o prop — sem ganho de
isolamento: a separação de PRs deste repositório existe para isolar a revisão
da DECISÃO da revisão do CÓDIGO (CLAUDE.md, "O ciclo"), e a decisão de fundo
(usar `weight`/`emphasis`, mover `value-role.ts` para domínio) já foi revisada
e aceita em `docs/decisao-biblioteca-de-componentes.md` — não é uma decisão
nova sendo proposta agora.

**Decisão:** uma mudança só, cobrindo reestruturação de pastas e migração de
`valueRole` → `weight`/`emphasis`, dentro desta mesma proposta.

**O que me faria mudar de ideia:** se a migração de `valueRole` precisasse
tocar um arquivo que a reestruturação de pastas não toca — não é o caso,
todos os arquivos funcionais estão dentro do escopo de pastas já mapeado em
D1.

### D3 — Inventário: tier, status e uso, componente a componente

**O que medi:** a lista do gerente (Text, Heading, Button, Icon, Logo,
AppFrame, NavPanel, NavSection, NavItem, PathLabel) contra a estrutura atual
de `packages/ui/src/` e as regras de composição de D1.

| Componente | Tier | Status | Onde é usado |
| --- | --- | --- | --- |
| `Text` | átomo | existe, muda (`valueRole` → `weight`/`emphasis`) | usado por `PathLabel`; usado hoje em toda exibição de texto genérico |
| `Heading` | átomo | novo | cabeçalho de seção de tela (fora de rota nesta proposta) |
| `Button` | átomo | novo | gatilho do hambúrguer (variante ícone-only), ação "Deslogar" no rodapé de `NavPanel` |
| `Icon` | átomo | novo | `Button`, `NavItem`, hambúrguer, rodapé de `NavPanel` |
| `Logo` | átomo | novo | cabeçalho de `AppFrame` |
| `PathLabel` | átomo | novo | cabeçalho de `AppFrame`, ao lado de `Logo` |
| `NavItem` | átomo | novo | folha dentro de `NavSection` |
| `NavSection` | molécula | novo | seção dentro de `NavPanel` |
| `NavPanel` | organismo | novo | valor do slot `nav` de `AppFrame` — só na bancada, ver D5 |
| `AppFrame` | organismo | existe, muda | moldura raiz de `apps/backoffice` |

**Classificações que exigiram decisão, não só medição:**

- **`Heading` é átomo, não molécula.** "Subtítulo sendo nível menor" tem duas
  leituras possíveis: (a) `Heading` é `Text` especializado — adiciona tag/role
  de heading e uma variante `level` mapeada a `font.size.*` — e "subtítulo" é
  um PADRÃO DE USO (duas chamadas de `Heading`, a segunda com `level` menor),
  não um prop novo; ou (b) `Heading` aceita um children/prop de subtítulo e
  renderiza dois textos internamente, o que o tornaria molécula (compõe dois
  `Text`). Adoto (a): mantém `Heading` indivisível, não inventa um conceito de
  "subtítulo" que os tokens não nomeiam, e é a leitura mais barata de
  reverter se estiver errada — trocar de átomo para molécula é aditivo, o
  inverso não é. **Registrado como Open Question, não decidido por
  suposição**, porque muda a forma do componente: ver Open Questions.
- **`Button` com ícone continua átomo.** A molécula de Brad Frost combina
  peças independentemente endereçáveis com um papel próprio (etiqueta + campo
  + botão de busca). Um botão com um ícone de decoração não tem essa
  independência — o ícone não existe fora do botão como unidade de sentido
  própria naquele contexto. Mesma lógica para `NavItem` com ícone.
- **`NavSection` é molécula, `NavPanel` é organismo.** `NavSection` combina um
  rótulo não clicável com uma lista de `NavItem` — um padrão localmente
  reutilizável, sem ser uma seção distinta da interface por si só.
  `NavPanel` é a barra lateral inteira — Brad Frost usa navegação de site como
  exemplo canônico de organismo.
- **`AppFrame` ganha um slot `nav?: ReactNode`, não conhece a forma de
  `NavPanel`.** Mantém "componente recebe tudo por propriedade" (regra de
  `openspec/config.yaml`, `rules.design`) e não acopla a moldura à forma
  interna da navegação.

**O que me faria mudar de ideia:** o dono confirmar a leitura (b) para
`Heading` — nesse caso a classificação muda para molécula e o prop de
subtítulo precisa de forma própria, decidida em ciclo de aplicação com
proposta e revisão próprias, não aqui.

### D4 — lucide-react: currentColor confirmado, dependência e bancada

**O que medi:** `npm pack lucide-react@1.48.0` (versão mais recente publicada)
e inspeção direta do pacote. `dist/esm/shared/src/build/defaultAttributes.mjs`
declara `stroke: "currentColor"` como padrão; `dist/esm/Icon.mjs` usa
`contextColor = "currentColor"` como padrão de contexto também. `grep` por
`lucide-react` em todo `package.json` do repositório e no `pnpm-lock.yaml`:
vazio — não é dependência hoje. `packages/ui/.storybook/optimize-deps.ts`
declara `BENCH_OPTIMIZE_DEPS` com `noDiscovery: true` e lista fechada de
especificadores; `lucide-react` não está nela.

**O que concluo:** confirmado — a cor do ícone segue `currentColor` por
padrão, então `Icon` aplica cor por herança do `color` computado do elemento
ao redor, sem prop de cor própria, sem literal (requisito "Ícone recebe o
componente por propriedade" em `specs/shell-components/spec.md`).
`lucide-react` entra como `dependencies` de `@chargebr/ui` (não
`devDependencies` — é usado em runtime pelo componente `Icon`), e a linha
`"lucide-react"` entra em `BENCH_OPTIMIZE_DEPS.include`, no grupo "o que as
histórias, os átomos e as primitivas importam" — mesmo grupo de
`react-aria-components`.

**O que me faria mudar de ideia:** a bancada falhar mesmo com a linha
acrescentada — nesse caso o mecanismo de pré-empacotamento tem uma lacuna
nova, fora do que esta proposta cobre, e volta a ser investigação, não
aplicação direta.

### D5 — Tensão com regra viva: backoffice-shell proíbe região de navegação

**O que medi:** `openspec/specs/backoffice-shell/spec.md`, requisito "Regiões
da moldura no documento entregue": "O documento emitido SHALL NOT conter
região de navegação." Razão registrada no próprio requisito: "não existe rota
de negócio para listar, e região de navegação vazia anuncia um destino que
não existe." O próprio "Por quê" já prevê o gatilho de mudança: "no ciclo em
que a moldura hospedar conteúdo que dependa de dado." `docs/pontos-abertos.md`
ponto 1 ("A camada 3 não existe") e ponto 10 avisam para ler antes de propor
ciclo que crie rota de negócio — nenhum dos dois está sendo fechado aqui,
porque esta proposta não cria rota.

**O que concluo:** esta proposta PODE inventariar e construir `NavPanel`,
`NavSection`, `NavItem` como componentes de `@chargebr/ui` — com história no
Storybook, fixture de folhas de exemplo com origem declarada — sem violar a
regra, porque a regra é sobre o documento emitido por `apps/backoffice`, não
sobre o pacote de componentes. Mas NÃO posso propor que o ciclo de aplicação
já ligue `NavPanel` dentro de `apps/backoffice/app/layout.tsx` enquanto não
houver rota de negócio real para popular as folhas — isso reproduziria
exatamente o defeito que o requisito já julgou, e a verificação reprovaria de
qualquer forma.

**Isto é uma regra que atrapalha o inventário tal como pedido** — "menu de
dois níveis... toda seção com ao menos uma folha, até dez folhas" pressupõe
destinos reais, que não existem nesta fase. Cito a regra, cito a razão escrita
nela, e registro que o dono decide entre duas posições, sem escolher por
suposição:

- **(a)** — **minha recomendação** — o ciclo de aplicação constrói e testa
  `NavPanel` só na bancada, sem ligar ao `AppFrame` real do app; o requisito
  de `backoffice-shell` permanece como está até o ciclo que trouxer a
  primeira rota de negócio, que aí sim revisa esse requisito, citando esta
  proposta.
- **(b)** — o dono decide antecipar a mudança do requisito agora, com
  placeholders explícitos de destino.

**O que me faria mudar de ideia:** o dono confirmar que este ciclo também
traz a primeira rota de negócio real — não é o que a tarefa descreve
("nenhuma rota" está explicitamente fora de escopo).

### D6 — Token de breakpoint: escala nomeada, mecanismo de consumo em aberto

**O que medi:** `packages/tokens/tokens/primitive/` tem `color.json`,
`radius.json`, `shadow.json`, `space.json`, `typography.json` — nenhum
`screen.json` ou equivalente. `grep -rn "@media"` no repositório (fora de
`storybook-static`, artefato gerado) encontra só `prefers-color-scheme`, em
`packages/tokens/generated/tokens.css` e no gerador
`packages/tokens/src/build.ts`. O pipeline de geração
(`packages/tokens/src/build.ts`, `formattedVariables` do Style Dictionary)
emite custom properties (`--nome: valor`) e uma constante TS; não há
`postcss.config` no repositório, logo não há `postcss-custom-media`.

**O que concluo:** breakpoint é o único eixo de token que `@media` não pode
consumir por `var()` — CSS não aceita custom property dentro da condição de
uma media query. A regra "nunca declare valor literal fora de
`@chargebr/tokens`" (CLAUDE.md) colide com a única forma tecnicamente
possível de consumir breakpoint em `@media` hoje: o valor precisa aparecer
literal na declaração `@media` do CSS Module. Proponho a escala NOMEADA (não
numérica sem nome como `font.size`/`space` — breakpoint é sempre papel de
layout, não régua): `screen.md = 768px`, o único degrau que `NavPanel`
precisa (persistente ≥768px, sobreposta <768px) — não invento degraus extras
sem consumidor, mesma disciplina que `docs/decisao-biblioteca-de-componentes.md`
já usou para recusar nomear `size`/`space` sem caso de uso.

**Duas opções de mecanismo, nenhuma decidida aqui — ver Open Questions:**

| Opção | O que é | Custo |
| --- | --- | --- |
| **A — exceção no guardião + teste de contrato** | `style-literals` ganha exceção nomeada para `min-width`/`max-width` em `@media`, verificada por teste que compara o literal ao token na fonte DTCG (delta já escrito em `specs/workspace-verification/spec.md`) | Sem dependência nova; exceção mais uma regra para manter |
| **B — `postcss-custom-media`** | Pipeline gera `@custom-media --md (min-width: 768px)`; consumo vira `@media (--md)`, sem literal nenhum no CSS Module | Sem exceção no guardião; dependência de build nova, não verificada aqui se já é indireta do Vite/Storybook |

**Recomendação registrada, não fechada:** Opção A, custo menor, sem
dependência nova.

**O que me faria mudar de ideia:** medir que `postcss-custom-media` já é
dependência indireta do Vite/Storybook — não medi isso; fica como verificação
pendente do ciclo de aplicação.

### D7 — Logo não pode inlinear SVG com cor literal em `.tsx`

**O que medi:** `tools/checks/style-literals.test.ts`,
`scriptViolations()` — varre TODA linha de arquivo `.ts`/`.tsx` no perímetro
com `COLOR_LITERAL` (`#[0-9a-f]{3,8}` ou função de cor), sem exceção por
contexto (SVG inline incluso). `CSS_EXTENSIONS`/`SCRIPT_EXTENSIONS` cobrem só
`.css`, `.ts`, `.tsx` — `.svg` não é varrido.

**O que concluo:** se `Logo` reescrevesse o desenho dos dois SVGs de marca
como marcação JSX dentro de `logo.tsx`, os literais `#009440`/`#FFCB00`
reprovariam `verify:lint` hoje, sem exceção — a regra de literal de cor no
`.tsx` não tem isenção de marca, diferente da isenção de camada primitiva que
já existe para tokens. A saída que não pede mudança de regra nenhuma é `Logo`
referenciar os arquivos `.svg` existentes como recurso externo (import de
asset, `<img>` ou equivalente do pipeline de build), em vez de inlinear a
marcação — o componente próprio fica sem nenhum literal de cor, e o guardião
não precisa de exceção nova para marca. Registrado como requisito observável
em `specs/shell-components/spec.md` ("Logo não declara cor de marca no
próprio código").

**O que me faria mudar de ideia:** se o pipeline de build de `@chargebr/ui`
não suportar import de `.svg` como asset (não medido — Vite suporta por
padrão; Storybook usa Vite aqui) — nesse caso a alternativa seria uma exceção
de marca no guardião, e essa exceção precisaria de proposta e revisão
próprias, pela mesma razão que a exceção de breakpoint (D6) precisa.

## Risks / Trade-offs

- **[Risco] Reestruturação de pastas é um diff grande em arquivos que a
  verificação já cobre (import paths, exports).** → Mitigação: a ordem de
  construção em `tasks.md` faz a reestruturação por etapas verificáveis, cada
  uma com `pnpm verify` passando, em vez de um único commit que move tudo.
- **[Risco] `NavPanel`/hambúrguer dependem de estado de cliente (aberto/
  fechado, modo sobreposto vs. persistente) — mesma família de
  `react-aria-components` que gerou `docs/incidente-instabilidade-da-bancada.md`
  (R1 de `docs/decisao-biblioteca-de-componentes.md`).** → Mitigação: nenhuma
  história de interação desta proposta declara `hovered`/`pressed` como
  estado coberto até o incidente ser retomado pelo gatilho já registrado nele;
  foco por teclado continua sendo exigido (nunca falhou na investigação).
- **[Risco] `screen.md` fica sem consumidor real até `NavPanel` ser
  construído (D6/D3 na mesma mudança, ordem importa).** → Mitigação: ordem de
  construção em `tasks.md` cria o token antes do primeiro consumidor, não
  depois.
- **[Trade-off] Reclassificar `charts/` fica fora desta proposta.** Deixa uma
  inconsistência temporária — `charts/` não segue a hierarquia de tier que
  `atoms/`/`molecules/`/`organisms/` passam a seguir — mas reclassificar cada
  gráfico exige medição própria (D1) que o escopo desta tarefa exclui
  explicitamente (header/nav/layout/tipografia, não gráfico).

## Migration Plan

Sem rollback formal — é reestruturação de arquivo-fonte dentro de um pacote
não publicado externamente (`private: true`), sem consumidor fora do
monorepo. Cada etapa da ordem de construção (`tasks.md`) é revertível por
commit único, e `pnpm verify` valida cada etapa antes da próxima.

## Open Questions

- **Forma do "subtítulo" de `Heading`.** Duas leituras registradas em D3:
  padrão de uso (duas chamadas de `Heading`, átomo) ou prop/children interno
  (molécula). Adotei a primeira; muda a classificação de tier e a forma do
  componente se a segunda for a intenção. **Resolve antes da tarefa de
  `Heading` em `tasks.md`** — não é uma decisão que a aplicação pode tomar
  sozinha sem reabrir este design.
- **Mecanismo de consumo do token de breakpoint.** D6, Opção A (exceção +
  teste de contrato) versus Opção B (`postcss-custom-media`). Recomendação
  registrada (A), não fechada. **Resolve antes da tarefa do token
  `screen.md`** em `tasks.md`.
- **Posição (a) versus (b) da tensão com `backoffice-shell`.** D5.
  Recomendação registrada (a), não fechada. **Resolve antes da tarefa de
  `NavPanel`** em `tasks.md` — a resposta decide se `NavPanel` fica só na
  bancada ou se o requisito de `backoffice-shell` muda junto.
