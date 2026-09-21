# Decisão: configuração inicial do workspace

## Estado

`PROPOSTA PARA REVISÃO`

## Escopo

Este documento define o começo da fase de interface: framework da aplicação,
formato do workspace, ferramentas de verificação, estratégia de estilo,
identidade visual e o processo de desenvolvimento que governa os ciclos até o
primeiro objetivo.

Ele não implementa. Não cria pacote, não instala dependência, não escreve
componente e não gera token.

Fora do escopo, sem exceção: `data/`, `queries/`, `supabase/`, `src/`, `tests/`
e os scripts `collect` e `test` da raiz. Nada nesta fase os altera.

## Contexto

O commit `4fa8c4b` reverteu integralmente a fase anterior de criação da
interface: constituição, time de agentes, processo de seis portões, decisão de
interface, decisão de identidade, spec 0001 e os dois SVGs de logo. O
repositório voltou ao estado anterior àquela fase.

Esta decisão recomeça a configuração a partir do que o repositório comprova.

### Objetivo desta fase

O primeiro objetivo é um repositório preparado para que a implementação do
produto comece no dia em que houver dado para exibir: workspace verificável,
design system documentado no Storybook e o shell da aplicação de pé — sem tela
de produto, sem rota de negócio, sem chamada a banco e sem dado real.

## O que já estava decidido e permanece

Nenhum destes itens é reaberto.

| Item | Valor | Onde vive |
| --- | --- | --- |
| Gerenciador de pacotes | pnpm 10.34.5 | `package.json` → `packageManager` |
| Runtime | Node 24.21.0 | `.nvmrc` e `engines` |
| Sistema de módulos | ESM | `package.json` → `type: module` |
| Linguagem | TypeScript 5.9.3, modo estrito | `tsconfig.json` |
| Rigor de tipos | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` | `tsconfig.json` |
| Idioma | PT-BR em documentação e rótulo; inglês em identificador, commit, branch e título de PR | convenção de 115 PRs |

## Decisões

### D1 — Framework da aplicação: Next.js 16, App Router

A fase anterior adiava o framework por princípio. O adiamento deixou de ser
barato: o objetivo desta fase é um projeto pronto para implementação, e uma
biblioteca desenhada sem consumidor conhecido decide fronteira de servidor,
estratégia de bundle e formato de estilo por suposição.

Next.js 16 foi escolhido sobre TanStack Start v1 por três razões verificáveis:
o estágio 3 da estratégia de produto é um produto público de informação em
PT-BR, cuja descoberta depende de renderização no servidor madura; o ecossistema
é sensivelmente maior, o que importa para um time de uma pessoa; e RSC no
TanStack Start chegou como adição posterior ao v1, enquanto no App Router é o
modelo padrão desde o início.

**Consequência:** todo componente que use React Aria ou estado do cliente
declara `"use client"` no seu próprio arquivo, nunca no arquivo do consumidor.

### D2 — Workspace: monorepo enxuto

```text
chargebr/
├── apps/
│   └── backoffice/          Next.js 16 · shell apenas
├── packages/
│   ├── tokens/              Style Dictionary → CSS custom properties + TS
│   └── ui/                  átomos, primitivas de domínio e gráficos
├── specs/                   especificações de ciclo
├── data/ docs/ queries/ src/ supabase/ tests/    fora do workspace
└── pnpm-workspace.yaml
```

`pnpm-workspace.yaml` declara exclusivamente `apps/*` e `packages/*`. `src/` e
`tests/` permanecem onde estão, fora do workspace e fora da verificação desta
fase; seu destino não é objeto desta decisão. Os scripts `collect` e `test` da
raiz continuam intactos, e a verificação desta fase entra como script novo.

Gráficos ficam dentro de `@chargebr/ui`, expostos por subpath
(`@chargebr/ui/charts`), e não em pacote próprio. A fronteira que importa —
nenhum valor literal de estilo, nenhum acesso a dado dentro de componente — é
verificável por lint e por teste; um terceiro pacote acrescentaria versionamento
e resolução interna sem acrescentar garantia. Ele se separa no dia em que tiver
ciclo de release próprio.

`@chargebr/tokens` é pacote à parte porque tem etapa de build própria: ele é
gerado, não escrito.

### D3 — Verificação: Biome 2 + Vitest 5, sob um comando único

Biome formata e faz lint num binário só, sem cadeia de plugins para manter
alinhada. Vitest porque o `addon-vitest` do Storybook 10 é o que roda as
histórias como teste.

A objeção previsível é a perda de `eslint-plugin-jsx-a11y`. Ela não se sustenta
aqui: lint de a11y checa a forma do JSX, não o comportamento renderizado — ele
não detecta foco perdido, ordem de tabulação errada nem contraste real. Quem
detecta é o axe sobre a história renderizada, que a D3 já coloca no portão.
Manter as duas redes custaria a cadeia de plugins do ESLint para cobrir um
subconjunto do que a execução já cobre.

`pnpm verify` na raiz executa, em ordem: tipos, formatação, lint, testes, sobre
`apps/*` e `packages/*`. Código de saída diferente de zero se qualquer etapa
falhar, e resultado idêntico em duas execuções sobre a mesma árvore.

### D4 — Estilo: CSS Modules com custom properties

Componentes consomem exclusivamente variáveis CSS emitidas por
`@chargebr/tokens`. É a única das opções consideradas em que a proibição de
valor literal de cor, espaçamento, raio, sombra e tipografia dentro de
componente é verificável por regra, e não apenas combinada.

Tailwind foi recusado porque utilitário é valor literal distribuído no markup: a
camada de tokens deixaria de ser fronteira e viraria sugestão. vanilla-extract
daria a garantia mais forte — token inexistente vira erro de compilação — ao
custo de plugin de bundler em cada consumidor; fica registrado como alternativa
viável caso CSS Modules se mostre insuficiente.

**Consequência:** o app declara `transpilePackages: ['@chargebr/ui']` para
consumir CSS Modules de pacote do workspace.

### D5 — Identidade visual: restaurada, não refeita

Os dois SVGs de logo e `docs/decisao-identidade-visual.md` foram recuperados do
commit `cb1ed16`. As medições de contraste e as métricas OpenType daquele
documento são evidência medida, não convenção de processo; refazê-las produziria
os mesmos números.

| Item | Valor |
| --- | --- |
| Cor primária | `brand.primary = #302681` |
| Cores de marca | `#302681` · `#009440` · `#FFCB00` |
| Contraste sobre branco | `12,21:1` · `3,95:1` · `1,52:1` |
| Paleta categórica clara | `#4640A7` `#036429` `#B28D04` |
| Paleta categórica escura | `#706FE2` `#067833` `#B28D04` |
| Tipografia | Inter, família única, eixos `wght` e `opsz` |
| Dado numérico | `tnum` e `zero` ativados |
| Área de proteção do logo | um terço da altura |

Consequências mantidas daquele documento: `#009440` não serve a texto de corpo,
`#FFCB00` só funciona sobre o índigo ou como forma, e não existe variante
monocromática nesta fase.

### D6 — Processo: spec-driven, com ferramenta em seleção

O que está decidido aqui é **onde** o spec-driven entra e **como** ele convive
com o rito documental. **Qual** ferramenta o executa está em
[seleção própria](selecao-ferramenta-spec-driven.md) e esta decisão não fecha
enquanto aquela não for aceita.

#### Onde o spec-driven entra

A partir do ciclo 1, cobrindo todo código desta fase, inclusive a fundação do
workspace. Configuração tem comportamento observável — a verificação falha
quando um arquivo está fora de formato — e comportamento observável é o que uma
spec descreve.

Este documento é o último artefato fora do rito de spec: ele decide estrutura,
não descreve comportamento.

#### Como convive com o que já existe

| Documento | Responde | Onde vive |
| --- | --- | --- |
| Decisão e seleção | qual caminho, e por que este e não os outros | `docs/` |
| Spec, desenho e tarefas | o que o entregável faz e como é construído | diretório da ferramenta escolhida |

O rito de `docs/` não é substituído. A ferramenta governa o ciclo de código; as
escolhas estruturais continuam em `docs/decisao-*.md` e `docs/selecao-*.md`.

#### Convenção de branch

Se a ferramenta escolhida impuser nome de branch, **ela vence nos ciclos de
spec**, e a convenção `<tipo>/<nome-em-ingles-kebab>` fica reservada a PRs
avulsos — `docs`, `chore`, `fix`. Nada de editar script da ferramenta para
forçar o prefixo: fork local reaparece a cada atualização.

#### O que nenhuma ferramenta decide

Registrar para que nada disso seja tratado depois como se tivesse vindo pronto:

1. **Os princípios do projeto.** Toda candidata oferece um lugar para eles —
   constituição, contexto de configuração — e todas o entregam vazio.
2. **A stack.** São as decisões D1 a D5 deste documento.
3. **O idioma dos cabeçalhos.** Nenhuma candidata traduz cabeçalho estrutural;
   no melhor caso ela instrui a escrever o conteúdo em PT-BR.
4. **Testes.** Ao menos uma candidata trata tarefa de teste como opcional,
   gerada só quando pedida. Toda spec deste projeto pede testes explicitamente.

## Stack ratificada

Versões conferidas no registro npm em 21 de setembro de 2026.

| Camada | Escolha | Versão | Por quê |
| --- | --- | --- | --- |
| Aplicação | Next.js App Router | 16.3.5 | D1 |
| Biblioteca de UI | React | 19.3.0 | exigido pelo App Router |
| Primitivas de comportamento | React Aria Components | 1.21.1 | acessibilidade por comportamento, não por atributo; Base UI ainda em `1.0.0-rc.0` e por isso descartado como fundação |
| Tokens | Style Dictionary | 5.5.5 | formato DTCG, emite CSS e TS da mesma fonte |
| Estilo | CSS Modules | nativo do Next | D4 |
| Gráficos | visx | 4.0.0 | primitivas componíveis sobre D3; publicado em jun/2026, manutenção ativa |
| Documentação viva | Storybook | 10.6.0 | builder Vite sobre `packages/ui` |
| Teste | Vitest | 5.0.1 | exigido pelo `addon-vitest` |
| Acessibilidade | `@storybook/addon-a11y` | 10.6.0 | axe executado sobre a história renderizada |
| Formatação e lint | Biome | 2.5.14 | D3 |

## Restrições de domínio que a biblioteca deve preservar

Não são preferências de interface. Vêm da metodologia já aceita e determinam
quais componentes existem. Os nomes foram conferidos contra
`supabase/migrations/`.

- `verification_level` (`confirmed`, `corroborated`, `unverified`),
  `workflow_status` (`accepted`, `under_review`, `candidate`) e
  `normalization_status` (`normalized`, `not_attempted`, `unresolved`) são eixos
  independentes. Nenhum componente pode colapsá-los num selo único.
- `unresolved` é estado legítimo: permanece visível, nunca é agregado a valores
  resolvidos e nunca recebe preenchimento sólido.
- `projection_status = blocked` significa não exibir número algum, nem parcial.
  Exige componente próprio.
- Todo número exibido carrega caminho até sua evidência. Valor sem proveniência
  não tem componente que o exiba.
- `source_claim` e `normalized_claim` aparecem lado a lado; a normalização nunca
  substitui a redação original.
- Conflito entre fontes é exibido e preservado, nunca resolvido pela interface.
- Valor principal, contrafactual e contexto são visualmente distintos.
- `date_precision = unknown` e ausência de informação nunca são exibidos como
  zero.

Essas restrições são a razão de a biblioteca não ser genérica. Elas devem ser
expressáveis antes de qualquer tela existir.

> A fase anterior nomeava `verification_state` e `realization_status` como dois
> desses eixos. Essas colunas não existem nas migrations. Os nomes acima são os
> reais.

## Riscos

| ID | Risco | Mitigação |
| --- | --- | --- |
| R1 | O workspace na raiz interfere no que já existe fora dele | `pnpm-workspace.yaml` lista apenas `apps/*` e `packages/*`; scripts `collect` e `test` intocados; `pnpm verify` é script novo |
| R2 | O design system modela estados que o modelo não produz | Fixtures derivadas de `queries/0001_abve-eletrificados-janeiro-2025.read.sql`, que já expressa as projeções do contrato de leitura |
| R3 | Fronteira `"use client"` vaza para o consumidor | `"use client"` no arquivo do componente; regra verificada no lint |
| R4 | A fase infla até virar produto | Nenhuma rota de negócio, nenhuma chamada a banco e nenhum dado real |
| R5 | Gabaritos em inglês diluem o rito em PT-BR | Conteúdo escrito em PT-BR sob cabeçalhos estruturais em inglês |
| R6 | Ferramenta de processo abandonada ou com atualização que quebra | Candidata com licença aberta e repositório público; versão registrada na seleção |
| R7 | A ferramenta não gera tarefa de teste por padrão | Toda spec pede testes explicitamente; ausência de tarefa de teste reprova o portão |

## Decisões em aberto

Nenhuma é exigida pelos ciclos 1 a 6. Registrar antes do ciclo 7.

1. Hospedagem e deploy do back office.
2. Produto público como aplicação separada ou como rotas do mesmo app.
3. Variante monocromática do logo, adiada em `decisao-identidade-visual.md`.

## Sequência até o primeiro objetivo

Antes do ciclo 1, dois passos de implantação que não são ciclos: instalar a
ferramenta escolhida em `selecao-ferramenta-spec-driven.md` e preencher o lugar
que ela reserva aos princípios do projeto. Sem isso, o passo de plano não tem
contra o que verificar.

Cada ciclo é um PR pequeno, com spec, plano, tarefas e aceite humano
registrado.

| Ciclo | Objeto | Fecha quando |
| --- | --- | --- |
| 1 | Fundação do workspace: `pnpm-workspace.yaml`, Biome, Vitest, `pnpm verify`, CI sobre PR, proteção da `main` | verificação reproduz resultado idêntico em máquina limpa e no CI |
| 2 | `@chargebr/tokens` v1: DTCG, três camadas, tema claro e escuro | paleta aprovada por script nos dois modos |
| 3 | Bancada: Storybook 10, `addon-vitest`, `addon-a11y` | história falha o build quando o axe reprova |
| 4 | Átomos v1 | todo estado declarado em spec tem história e teste |
| 5 | Primitivas de domínio v1 | as oito restrições de domínio são expressáveis |
| 6 | Gráficos v1 | `unresolved` hachurado e `blocked` sem número |
| 7 | Shell do back office: layout, tema, tipografia, sem rota de negócio | app sobe consumindo `@chargebr/ui` |

As primitivas de domínio vêm antes de moléculas genéricas: são o valor real da
biblioteca e são o que mais pressiona a camada de tokens. Descobrir no ciclo 5
que a camada não as sustenta é mais barato do que descobrir no ciclo 7.

## Perguntas para revisão

1. Next.js 16 App Router está correto como consumidor único desta fase?
2. Dois pacotes bastam, com gráficos por subpath em `@chargebr/ui`?
3. Biome substituindo Prettier e ESLint é aceitável, dado que a11y é provada por execução?
4. CSS Modules com custom properties sustenta a proibição de valor literal de estilo?
5. Está correto o spec-driven entrar já na fundação do workspace?
6. A convenção de branch da ferramenta deve mesmo vencer nos ciclos de spec?
7. Os quatro itens que nenhuma ferramenta decide estão completos?
8. As oito restrições de domínio estão completas e com os nomes corretos?
9. A sequência de ciclos está na ordem certa, com primitivas de domínio antes de gráficos?
10. O isolamento declarado em R1 é suficiente para não tocar no que está fora do workspace?

Se todas forem `sim`, registre `ACCEPTED`. Se alguma for `não`, indique o número
e a correção necessária.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 21 de setembro de 2026 |
| Resultado | `ACCEPTED` |
