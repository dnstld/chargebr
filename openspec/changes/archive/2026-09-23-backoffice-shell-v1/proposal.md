# Shell do back office

## Why

Sete ciclos produziram uma biblioteca verificada e nenhum consumidor. `apps/`
ainda não existe: `pnpm-workspace.yaml` declara `apps/*`, `biome.json` inclui
`apps/**` e `vitest.config.ts` procura projetos em `apps/*`, tudo apontando para
um diretório vazio. Enquanto ele continuar vazio, nada prova que `@chargebr/ui`
e `@chargebr/tokens` são consumíveis por uma aplicação Next.js 16 App Router —
a fronteira que seis ciclos protegeram nunca foi atravessada no sentido em que
deve ser atravessada.

O segundo motivo é de perímetro, e ele é o motivo de ser agora. No instante em
que `apps/` nasce, a proibição de valor literal de estilo deixa de cobrir
justamente onde código novo passa a ser escrito: `tools/checks/style-literals.test.ts`
varre `packages/` e nada mais. Criar a aplicação sem fechar isso é abrir um
buraco no mesmo commit em que se cria o lugar onde ele se manifesta.

`docs/decisao-prova-de-comportamento-de-aplicacao.md` removeu o bloqueio que
adiou este ciclo: existe agora uma forma de afirmar sobre a aplicação sem ler o
código-fonte dela.

## What Changes

- Cria `apps/backoffice`, primeira aplicação do workspace: Next.js 16 App
  Router, React 19, uma única rota estática, nenhuma rota de negócio.
- Acrescenta a `@chargebr/ui` a moldura do shell, no subpath novo
  `@chargebr/ui/shell`: região de cabeçalho que nomeia o produto, link de salto
  para o conteúdo e região de conteúdo principal. São os únicos componentes
  novos, e existem porque o shell os exige.
- Acrescenta a camada 2 de prova: testes que afirmam sobre o documento e sobre
  os scripts **emitidos** por `next build`, e que reprovam quando o artefato não
  existe. Entram no estágio de testes que já existe; nenhum estágio novo em
  `pnpm verify`.
- Estende o perímetro de `tools/checks/style-literals.test.ts` de `packages/`
  para `packages/` e `apps/`.
- Acrescenta a `biome.json` a lista de importações proibidas para `apps/**`.
  Ela **não é cópia** da lista de `packages/**`: uma aplicação importa `next`,
  e é por isso que ela existe. Cada item da lista é justificado em `design.md`.
- Declara `.next/` fora do versionamento e fora da varredura de formatação e
  lint, como `storybook-static/` já está.

## Decisões fechadas por resposta, não por suposição

**O shell não oferece escolha explícita de tema.** O tema é a preferência do
sistema, resolvida inteiramente em CSS por `@chargebr/tokens`. Em consequência,
**o shell não carrega script de tema nenhum**, o elemento raiz do documento
entregue não declara tema, e nada que a construção emite — documento ou script —
menciona o atributo de tema. O atributo `data-theme` continua existindo na
camada de tokens, como override, e continua exercitado pela bancada nos dois
temas; o que este ciclo decide é que a aplicação não o usa.

**A moldura declara três regiões:** cabeçalho, link de salto e conteúdo
principal. Não declara região de navegação, porque não existe rota de negócio
para listar e uma navegação sem destino é componente sem estado provável.

## Lacunas registradas, e não preenchidas

- **A camada 3 não existe.** Nenhuma exigência deste ciclo depende de aplicação
  em execução. Em particular, nenhuma exigência afirma o que aparece na
  primeira pintura: a camada 2 prova a condição necessária — o que o documento
  entregue carrega e o que ele não carrega —, nunca a suficiente.
- **O mapeamento de rota aninhada para arquivo emitido continua aberto**, como
  `docs/decisao-prova-de-comportamento-de-aplicacao.md` registrou. Este ciclo
  emite uma rota só, a raiz, e portanto não o fecha nem precisa dele.

## Capabilities

### New Capabilities

- `backoffice-shell`: o comportamento observável do shell — o que o documento
  entregue carrega, quais regiões a moldura declara, como o tema chega sem
  script, e o que o shell recusa conter.

### Modified Capabilities

- `workspace-verification`: ganha dois requisitos ADICIONADOS — proibição de
  valor literal de estilo em todo o perímetro, e não só em `packages/`; e
  fronteira da aplicação, que declara o que uma aplicação pode importar e o que
  não pode.

## Impact

- **Aplicação nova:** `apps/backoffice` — `package.json`, `tsconfig.json`,
  `next.config.ts`, `vitest.config.ts`, o layout e a página da rota raiz, a
  folha de estilo global e os testes do documento emitido.
- **Pacote:** `packages/ui` — subpath `./shell` novo no mapa de exportações,
  componentes da moldura com histórias nos dois temas, e o contrato de estados
  da moldura entrando na cobertura de histórias já existente.
- **Guardiões:** `tools/checks/style-literals.test.ts` muda de perímetro, de
  `packages/` para `packages/` e `apps/`.
  `tools/checks/domain-vocabulary.test.ts` é generalizado e passa a se chamar
  `tools/checks/component-vocabulary.test.ts`: o sujeito da checagem deixa de
  ser a primitiva de domínio e passa a ser o componente que exibe texto, com
  dois perímetros nomeados — as primitivas de domínio e a moldura. É essa
  checagem que prova que a moldura não declara rótulo em português no próprio
  arquivo; estendê-la sem renomeá-la deixaria o nome e o cabeçalho do arquivo
  mentindo sobre o que ele guarda.
  `tools/checks/type-suppression.test.ts` **não muda**: já declara
  `PERIMETER = ["packages", "apps"]` e já trata o diretório inexistente.
- **Configuração:** `biome.json` (bloco novo para `apps/**`, exclusão de
  `.next`), `.gitignore` (`.next/`). `pnpm-workspace.yaml` e `vitest.config.ts`
  da raiz **não mudam**: os dois já descobrem `apps/*`.
- **Dependências novas:** `next`, `react` e `react-dom` em `apps/backoffice`.
  Nenhuma dependência nova na raiz e nenhuma em `packages/`.
- **Verificação:** os mesmos quatro estágios. O custo é tempo: o estágio de
  testes passa a incluir uma construção da aplicação, medida em
  `docs/decisao-prova-de-comportamento-de-aplicacao.md` em 8,8 segundos num
  aplicativo mínimo.
- **Intocados:** `src/`, `tests/`, `data/`, `queries/`, `supabase/`, os scripts
  `collect` e `test` da raiz, `packages/tokens` inteiro, e todo átomo,
  primitiva de domínio e forma de gráfico já publicados.

## O que esta mudança não faz

- **Nenhuma rota de negócio e nenhuma tela de produto.** A construção emite um
  documento, o da rota raiz, e a verificação reprova se emitir outro.
- **Nenhuma busca de dado, de lugar nenhum.** Nem no componente, nem na
  aplicação, nem em tempo de construção. A proibição vira regra de lint sobre
  `apps/**`, e é reaberta pelo ciclo que trouxer o contrato de leitura.
- **Nenhum número na tela.** A moldura não exibe valor, e portanto não toca em
  proveniência, eixo de estado nem projeção bloqueada.
- **Nada relacionado a coleta.**
- **Nenhum componente novo em `packages/ui` além da moldura.** Nenhum botão,
  nenhum campo, nenhuma tabela, nenhum logotipo.
- **Nenhum resolvedor de tema, nenhum provedor de tema, nenhum script de tema.**
  O tema já está resolvido em CSS puro desde o ciclo 2.
- **Nenhuma escolha de tipografia.** `--font-family-sans` já existe; a moldura
  aplica a família declarada e não decide nada sobre ela.
- **Nenhum estágio novo em `pnpm verify`**, nenhum servidor, nenhum segundo
  executor de teste, nenhuma dependência nova na raiz.
- **Nenhuma afirmação sobre a primeira pintura**, sobre navegação entre rotas ou
  sobre qualquer coisa que só exista depois da hidratação. Isso é camada 3, e
  ela não existe.
- **Nenhuma decisão sobre hospedagem, deploy ou domínio.**
