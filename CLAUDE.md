# ChargeBR — constituição do projeto

Este arquivo é carregado automaticamente em toda sessão e em todo agente. É o
único contexto garantidamente compartilhado por todo o time. Leia inteiro antes
de agir.

## O que é o ChargeBR

Plataforma de inteligência sobre mobilidade elétrica no Brasil. Transforma
informação dispersa em conhecimento estruturado, verificável e rastreável.

**Visão:** ser a fonte mais completa, rastreável e confiável sobre mobilidade
elétrica no Brasil.

**Princípios:** rastreabilidade, confiabilidade, profundidade, histórico,
clareza. Eles não são preâmbulo — são critério de aceite de todo trabalho.

## Fase atual: Criação da interface

A fase de coleta foi concluída. A fase atual constrói a biblioteca de interface
interna: tokens, componentes e documentação viva. O back office vem depois; o
produto público depois dele. Ambos consomem esta biblioteca.

**Dentro desta fase:** `@chargebr/tokens`, `@chargebr/ui`, `@chargebr/charts`,
Storybook, testes de componente e acessibilidade.

**Fora desta fase:** rotas, telas, autenticação, chamadas de API, estado de
servidor, schema, migrations, deploy, regra de negócio. Um componente recebe
dados por propriedade. Um organismo nunca busca dados.

## Idioma

PT-BR é o idioma canônico de documentação, comentário e rótulo de interface.

Mensagem de commit, nome de branch e título de pull request seguem a convenção
já estabelecida no repositório: **inglês, uma linha, sem corpo e sem assinatura**,
no formato `<tipo>: <ação em imperativo>`, com os tipos `feat`, `fix`, `docs`,
`db`, `data` e `chore`. Branch em `<tipo>/<nome-em-ingles-kebab>`. Corpo de
commit apenas quando a mudança for incompreensível sem ele.
Identificadores técnicos permanecem em inglês: nomes de tabela e coluna,
`Confirmed`, `Corroborated`, `Reported`, `Analysis`, `verification_state`,
`realization_status`, `workflow_status`, `unresolved`, `CPO`, `eMSP`, `OCPP`,
`OCPI`, `EVSE`, `BEV`, `PHEV`. Nomes de componente, prop e token em inglês, por
interoperabilidade. Rótulo visível ao usuário sempre em PT-BR.

## Regras de domínio que a interface deve preservar

Estas regras vêm da metodologia já aceita e não são negociáveis por conveniência
de interface.

- Todo número exibido carrega caminho até sua evidência. Um valor sem
  proveniência não tem componente que o exiba.
- `unresolved` é estado legítimo. Permanece visível, nunca é escondido, nunca é
  agregado com valores resolvidos e nunca recebe preenchimento sólido — recebe
  hachura.
- `verification_state`, `realization_status` e `workflow_status` são eixos
  independentes. Nenhum componente pode colapsá-los num único selo.
- Conflito entre fontes é exibido e preservado, nunca resolvido pela interface.
- `projection_status: blocked` significa não exibir número algum, nem parcial.
  Existe componente próprio para esse estado.
- Valor principal, contrafactual e contexto são visualmente distintos e nunca
  intercambiáveis.
- A redação original da fonte é preservada; a normalização aparece ao lado dela,
  nunca no lugar dela.
- A ausência de informação nunca é exibida como zero.

## Como este time funciona

**Um agente é um escopo, não uma pessoa.** Cada artefato tem exatamente um dono.
Nenhum agente age fora do seu escopo, mesmo sabendo fazer, mesmo sendo rápido.

**Direito e dever de objeção.** Qualquer agente pode *parar* um trabalho que
fira um princípio, ainda que o problema esteja fora do seu escopo. Pode parar;
nunca pode agir fora do escopo. Essa é a única travessia de fronteira permitida,
e ela é sempre freio, nunca acelerador.

**Agentes não se invocam.** Ao identificar trabalho de outro agente, emita um
handoff no formato de `docs/processo-de-desenvolvimento-sdd.md` e pare. Quem
roteia é a pessoa supervisora.

**Quem julga não corrige.** Revisão de código, acessibilidade e qualidade não
possuem ferramenta de escrita. Elas reprovam e explicam; quem escreveu corrige.

**Toda tarefa tem condição de parada.** Ao atingi-la, pare e devolva, mesmo sem
ter terminado. Registrar uma lacuna é resultado válido; ampliar escopo em
silêncio não é.

## Rito de trabalho

PRs pequenos e revisáveis, com aceite humano registrado. O rito documental é
decisão → seleção → revisão independente → resultado → conclusão, em `docs/`,
no formato já estabelecido ali. Uma decisão nunca implementa. Implementação é PR
próprio. Nada é incorporado antes do aceite explícito da pessoa revisora.

O ciclo de desenvolvimento é spec-driven e está definido em
`docs/processo-de-desenvolvimento-sdd.md`. Nenhum código é escrito antes de uma
especificação aceita.

## Stack proposta — ratificada no ciclo 02

A lista abaixo é a hipótese de trabalho. O ciclo 02 a ratifica ou reverte com
ensaios reproduzíveis. Até lá, trate-a como decidida para fins de planejamento,
não como provada.

- Monorepo pnpm workspaces · Node 24 · ESM · TypeScript strict
- Primitivas de comportamento: React Aria Components
- Estilo: CSS Modules com custom properties; sem utilitários dentro da biblioteca
- Tokens: formato DTCG (W3C) processado por Style Dictionary
- Gráficos: visx, encapsulado em `@chargebr/charts`
- Documentação e teste: Storybook com addon de Vitest e addon de a11y

## Identidade

- Logo: `src/images/logo-charge-br-horizontal.svg` (padrão) e `-vertical.svg`
- Cores de marca: `#302681` · `#009440` · `#FFCB00`
- Contraste medido sobre branco: `#302681` 12,21:1 · `#009440` 3,95:1 ·
  `#FFCB00` 1,52:1. `#FFCB00` sobre `#302681` 8,02:1
- Consequência: `#009440` não serve a texto de corpo; `#FFCB00` só funciona
  sobre o índigo ou como forma
- Paleta categórica de gráfico, validada nos seis testes em ambos os modos:
  claro `#4640A7 #036429 #B28D04` · escuro `#706FE2 #067833 #B28D04`
- Cor primária: `brand.primary = #302681`, ainda que ausente do logo
- Tipografia: **Inter é a família única do sistema**, variável, com os eixos
  `wght` e `opsz`. Tokens de dado numérico ativam `tnum` e `zero`
- Área de proteção do logo: um terço da sua altura
- Sem variante monocromática ou de fundo escuro nesta fase

## Decisões em aberto — nunca presuma

1. Framework da aplicação. Adiado deliberadamente. `@chargebr/ui` não importa
   framework algum. TanStack Start é hipótese para o back office, não decisão.

As decisões de identidade visual foram fechadas em
`docs/decisao-identidade-visual.md`.

Se uma tarefa exigir uma dessas decisões, pare e registre a lacuna.

## Proibições

- Nenhum valor literal de cor, espaçamento, raio, sombra ou tipografia em código
  de componente. Só token.
- Nenhum `any`, nenhum `@ts-expect-error` sem justificativa no mesmo commit.
- Nenhum segredo versionado.
- Nenhuma dependência nova sem decisão registrada.
- Nenhuma afirmação de acessibilidade sem verificação executada.
- Nenhum componente sem história no Storybook.
