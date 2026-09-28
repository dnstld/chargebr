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
- Não reclassifica cada gráfico de `charts/` individualmente entre
  `organisms/charts/` e `organisms/domain/charts/` — só o move em bloco
  (tasks.md, 1.2), com a exceção nomeada de `value-table.tsx` registrada em
  D1.
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
    app-frame/ nav-panel/
    charts/            # movido em bloco (tasks.md, 1.2); classificação fina entre
                        # aqui e organisms/domain/charts/ segue fora de escopo —
                        # ver a exceção nomeada de value-table.tsx, abaixo
  vocabulary/
  utilities/
```

`charts/` e `shell/` deixam de ser pastas de primeiro nível. O movimento em
bloco — `charts/` inteiro para `organisms/charts/`, e o componente de
`shell/` (`app-frame.tsx` e os dois arquivos-irmãos) para
`organisms/app-frame/`, com o contrato e o índice de `shell/` ficando no
lugar, pela mesma razão que os de `domain/` ficaram em 1.1 — é a tarefa 1.2
de `tasks.md`, desta mesma mudança: posição do gerente, registrada depois do
PR #177, de que a reestruturação não está pronta enquanto duas das quatro
pastas originais de primeiro nível seguirem fora da hierarquia de tier, e o
dono não quer isso como ponto aberto novo.

A classificação fina — cada gráfico entre `organisms/domain/charts/` e
`organisms/charts/`, dependendo de saber ou não vocabulário — continua fora
do escopo desta proposta (ver Non-Goals) e é tarefa do ciclo que tocar
`charts/` por razões próprias. Até lá, o movimento em bloco deixa uma
exceção nomeada, medida antes de aceitar a tarefa: `value-table.tsx` é o
único arquivo de `charts/` que já sabe vocabulário de domínio — usa
`valueRole="primary"` fixo, sem expor o papel como escolha — e sua posição
em `organisms/charts/`, sem a subpasta `domain/` que esta mudança usa para
sinalizar isso, diz por convenção que ele é genérico, e não é. É uma
inversão pontual, não geral: os outros nove arquivos de `charts/` ficam
corretamente classificados pela ausência da subpasta. Não é motivo para
recusar o movimento em bloco — a alternativa, deixar `charts/` inteiro fora
da hierarquia de tier, é o problema maior que esta tarefa resolve —, mas fica
registrada, e o gatilho que a fecha é o mesmo que fecha a classificação fina
inteira: o ciclo que tocar `charts/` por razões próprias.

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

- **`Heading` é átomo, não molécula — decisão do dono.** "Subtítulo sendo
  nível menor" tinha duas leituras possíveis: (a) `Heading` é `Text`
  especializado — adiciona tag/role de heading e uma variante `level`
  mapeada a `font.size.*` — e "subtítulo" é um PADRÃO DE USO (duas chamadas
  de `Heading`, a segunda com `level` menor), não um prop novo; ou (b)
  `Heading` aceita um children/prop de subtítulo e renderiza dois textos
  internamente, o que o tornaria molécula (compõe dois `Text`). **Decidido:
  (a).** A razão registrada pelo dono não é custo de reversão — é correção:
  nível de título é decisão da PÁGINA, não do componente. Na opção (b), o
  componente emitiria dois níveis de heading por conta própria e passaria a
  decidir a estrutura do documento no lugar de quem compõe, e estrutura de
  heading errada é uma das coisas que mais atrapalham leitura assistida —
  quem navega por landmark de heading confia que o nível reflete a hierarquia
  real da página, não uma hierarquia interna de um componente que ele não vê.
  `Heading` permanece indivisível, sem conceito de "subtítulo" que os tokens
  não nomeiam.
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
destinos reais, que não existem nesta fase. Citei a regra, citei a razão
escrita nela, e registrei duas posições para o dono decidir, sem escolher por
suposição.

**Decidido pelo dono: posição (a).** `NavPanel`, `NavSection` e `NavItem` são
construídos e exercitados só na bancada — com história no Storybook e
fixture de folhas de exemplo com origem declarada — e nada é ligado ao
`AppFrame` real de `apps/backoffice`. O requisito "O documento emitido SHALL
NOT conter região de navegação" permanece como está; ele é revisado pelo
ciclo que trouxer a primeira rota de negócio real, citando esta proposta. A
razão registrada pelo dono: a posição (b) exigiria destinos de mentira no
app, que é exatamente o defeito que aquele requisito foi escrito para
impedir — antecipar a mudança do requisito com placeholders reproduziria o
problema em vez de evitá-lo.

A tarefa 7.2 de `tasks.md` vale: o ponto novo entra em
`docs/pontos-abertos.md` — "`NavPanel` construído, sem rota de negócio para
religar" — com gatilho na primeira rota de negócio real.

### D6 — Token de breakpoint: escala nomeada, consumo por postcss-custom-media

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

**Duas opções de mecanismo:**

| Opção | O que é | Custo |
| --- | --- | --- |
| **A — exceção no guardião + teste de contrato** | `style-literals` ganha exceção nomeada para `min-width`/`max-width` em `@media`, verificada por teste que compara o literal ao token na fonte DTCG | Sem dependência nova; exceção mais uma regra para manter |
| **B — `postcss-custom-media`** | Pipeline gera `@custom-media --md (min-width: 768px)`; consumo vira `@media (--md)`, sem literal nenhum no CSS Module | Sem exceção no guardião; dependência de build nova |

**Decidido pelo dono: Opção B, condicionada a uma medição.** A razão
registrada para não ficar na A: exceção nomeada num guardião abre um segundo
teste para manter em sincronia com ela, e este repositório já foi mordido por
isso — o ponto 12 de `docs/pontos-abertos.md` (fechado) existiu porque
`style-literals` e `type-suppression` pulavam `.next` pelo nome e não
alcançavam `next-env.d.ts`, gerado e fora do diretório de artefatos. Exceção
nomeada em guardião é como guardião morre. A B não deixa esse buraco: o
literal não existe no CSS Module, não há nada para a exceção ter que
enxergar.

**O que já estava medido antes da decisão, sem repetir a medição:**
`postcss-custom-media` não está instalado; `postcss` está, em duas versões
(8.5.23 e 8.5.28), ambas indiretas — de `next` e de `vite` respectivamente;
não existe `postcss.config` nenhum no repositório. O custo da B, medido, é
uma dependência de desenvolvimento e um arquivo de configuração — não duas
dependências transitivas incompatíveis.

**O que faltava medir, e que decidiria entre B e voltar para A:** se o Vite
da bancada (`packages/ui`, via Storybook) e o Next de `apps/backoffice`
conseguem compartilhar UMA configuração de PostCSS só, ou se cada um
precisaria da sua — nesse segundo caso a B deixaria de ser "sem buraco" e
viraria "duas configurações para manter sincronizadas", a mesma classe de
problema da A, e a A ganharia por ser mais barata.

**Medição feita com uma tentativa real, não com leitura de documentação:**
instalado `postcss-custom-media@12.0.2` como `devDependency` na raiz do
workspace (temporário, revertido ao final) e criado um único
`postcss.config.mjs` na raiz do monorepo, fora de `apps/backoffice` e de
`packages/ui`, com `postcss-custom-media` como único plugin declarado.

- **Lado Next/Turbopack:** `@custom-media --probe-md (min-width: 768px)` e
  `@media (--probe-md) { .postcss-custom-media-probe { color: red; } }`
  plantados em `apps/backoffice/app/global.css`. `next build` (Next 16.3.6,
  Turbopack) consumiu o `postcss.config.mjs` da raiz sem nenhuma configuração
  adicional em `apps/backoffice/`, e o CSS emitido em
  `.next/static/chunks/*.css` trouxe
  `@media (min-width:768px){.postcss-custom-media-probe{color:red}}` — a
  media query customizada foi resolvida. Testado também se a construção
  continua aplicando seus próprios plugins por padrão apesar do
  `postcss.config.mjs` customizado só declarar `postcss-custom-media`:
  `.postcss-autoprefixer-probe { user-select: none; }` plantado no mesmo
  arquivo saiu como `-webkit-user-select:none;user-select:none` no CSS
  emitido — o prefixo de fornecedor continuou saindo, então o
  `postcss.config.mjs` customizado não substituiu o processamento padrão do
  Next nesta versão.
- **Lado Vite/Storybook:** a mesma sonda de `@custom-media`/`@media` plantada
  em `packages/ui/src/shell/app-frame.module.css`. `storybook build` (Vite,
  sem nenhum `postcss.config` dentro de `packages/ui/`) consumiu o MESMO
  `postcss.config.mjs` da raiz — sem configuração adicional em
  `packages/ui/` — e o CSS emitido em `storybook-static/assets/*.css` trouxe
  `@media (width>=768px){._postcssCustomMediaProbe_..._58{color:red}}`: a
  media query foi resolvida para `min-width:768px` pelo
  `postcss-custom-media` e depois reescrita para a sintaxe de intervalo pelo
  minificador do build — mesma resolução, forma equivalente.

Os dois lados leram e aplicaram o mesmo arquivo de configuração, na raiz,
sem exceção nem configuração duplicada. Todo o material da medição foi
revertido depois: os dois arquivos-fonte voltaram ao estado original por
`git checkout`, `postcss.config.mjs` foi apagado,
`postcss-custom-media` foi removido do workspace, e `pnpm-lock.yaml` foi
restaurado ao original e confirmado com `pnpm install --frozen-lockfile`.

**O que isso decide:** o resultado confirma a B — uma configuração só, sem
buraco de sincronização entre bancada e aplicação. A decisão do dono foi B
antes desta medição, condicionada a ela; a medição sustenta a condição, e a
Opção A não entra.

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
de marca no guardião de literal de estilo, e essa exceção precisaria de
proposta e revisão próprias, pela mesma razão que a Opção A recusada em D6
precisaria — exceção nomeada em guardião é o padrão que este repositório já
decidiu evitar.

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

Nenhuma. As três perguntas em aberto desta mudança — forma do "subtítulo" de
`Heading` (D3), posição sobre a tensão com `backoffice-shell` (D5) e
mecanismo de consumo do token de breakpoint (D6) — foram decididas pelo dono
do repositório e registradas nas seções correspondentes acima, cada uma com
a razão.
