# Proposal

## Why

O ponto 5 de `docs/pontos-abertos.md` registra que três requisitos de
`design-tokens` — "Superfícies de gráfico declaradas por tema", "Cor de ação
legível contra toda superfície neutra do tema" e "Estado de interação com
legibilidade provada" — misturam obrigação e razão no mesmo parágrafo, contra
a regra `rules.specs` de `openspec/config.yaml` desde o ciclo 7. A mediana do
corpo dos requisitos vivos é de 4 linhas; `docs/pontos-abertos.md` registra
estes três com 22, 30 e 38 — contando a partir da própria linha `### Requirement:`
até a última linha de corpo, antes do primeiro `#### Scenario:`. Dentro deles
há frases que decidem — qual piso vale, onde vive cada texto, se um estado
existe — sem `SHALL`, e por isso escapam de serem lidas como obrigação.

O dono do repositório decidiu fechar o ponto 5 diretamente, sem esperar o
ciclo que o gatilho registrado pedia — "o próximo ciclo que tocar
`design-tokens` pelas suas próprias razões". A razão própria deste ciclo, que
o gatilho exigia, é o próprio ponto 5 somado à obrigação sem teste que esta
proposta descobriu ao ler os três requisitos frase a frase: nome do gráfico,
legenda, ausências declaradas e representação em texto na superfície da
página não tinham afirmação executada que as provasse (ver abaixo). O risco
que o gatilho do ponto 5 codificava — "reescrever conteúdo normativo é
mudança, com proposta e revisão; fazê-lo sob o rótulo de 'arrumar a redação'
é como conteúdo normativo passa sem ser olhado" — foi endereçado por revisão
independente do dono do repositório, que comparou o delta com a spec
corrente frase por frase, e não por confiança no relato desta proposta; essa
revisão já encontrou, em rodadas anteriores, uma contagem errada de frases
explicitadas e uma divergência de linhas com o registro, e nesta rodada
encontrou duas frases do corpo que ainda decidiam sem `SHALL`.

## What Changes

- **MODIFIED** — nos três requisitos, o corpo passa a conter só o que obriga;
  a razão sai para um bloco `**Por quê:**`, no formato já usado no restante do
  arquivo (ver `openspec/specs/backoffice-shell/spec.md`).
- Quatro frases que hoje decidem sem `SHALL` passam a ser obrigação explícita:
  1. Superfície neutra nova entra na varredura de cor de ação sem editar o
     teste (requisito "Cor de ação legível...").
  2. O piso contra a superfície de gráfico, para as séries da paleta, é o de
     objeto gráfico, 3:1, e não o de texto (requisito "Superfícies de
     gráfico...").
  3. Nome do gráfico, legenda, ausências declaradas e representação em texto
     ficam na superfície da página, e não na de gráfico (idem).
  4. A superfície de gráfico não declara estado de hover nem de foco (idem).
- Duas frases que hoje usam `SHALL` para instruir a leitura de uma cláusula —
  não para obrigar comportamento do sistema — perdem o `SHALL` e vão para
  `**Por quê:**`, porque não são critério de aceite (requisito "Estado de
  interação..."):
  - "é assim que esta cláusula SHALL ser lida" (a varredura de valor repetido
    é diagnóstico, não piso — a explicação de por que isso é seguro).
  - "a varredura SHALL continuar sem reprovar" para um token futuro com
    faixas sobrepostas — já coberto pela obrigação existente "Nenhum
    diagnóstico SHALL reprovar sozinho", que este trabalho preserva.
- Duas novas `#### Scenario` entram no requisito "Superfícies de gráfico...":
  - Uma nomeia o teste que já prova o item 2
    (`packages/tokens/src/palette.test.ts`), que hoje prova a obrigação sem
    que nenhum critério de aceite a cite.
  - A outra prova o item 3 (nome do gráfico, legenda, ausências declaradas e
    representação em texto na superfície da página) com um teste novo — ver
    abaixo.
- **Nenhuma obrigação nova** é criada — as quatro frases acima já decidiam o
  que passam a dizer explicitamente — e **nenhum comportamento muda**: nenhum
  componente e nenhum token é alterado, e nenhum gráfico passa a se comportar
  diferente. O que muda é que uma obrigação que não tinha teste passa a ter.
- **A lacuna encontrada não fica registrada — o dono do repositório decidiu
  fechá-la nesta mudança.** O item 3 não tinha teste que o provasse; a
  prática do código já o cumpria — `chart.tsx` e `chart.module.css` colocam
  esses elementos fora do nó que pinta `--color-chart-surface` — mas nenhuma
  afirmação executada conferia isso. Um teste novo em
  `packages/ui/src/charts/chart.assert.ts` passa a conferir, identificando a
  superfície de gráfico pela cor computada que ela pinta, e não pelo atributo
  que a marca hoje — para que uma mudança na forma de marcar a superfície,
  sem mover nenhum elemento, não faça o teste reprovar por acidente. Ver
  `design.md` — Decisions.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `design-tokens`: os requisitos "Cor de ação legível contra toda superfície
  neutra do tema", "Estado de interação com legibilidade provada" e
  "Superfícies de gráfico declaradas por tema" mudam de forma — corpo só com
  obrigação, razão em `**Por quê:**`, decisões antes implícitas tornadas
  `SHALL` — sem mudar o piso, a superfície ou o token de nenhum deles. Uma das
  quatro obrigações explicitadas ganha teste novo; as outras três já tinham.

## Impact

- `openspec/specs/design-tokens/spec.md` muda via sincronização no
  arquivamento.
- `packages/ui/src/charts/chart.assert.ts` ganha uma afirmação nova, chamada
  pelas histórias de gráfico existentes (`bar`, `dot`, `line`, `stacked-bar`,
  `small-multiples`); nenhum componente de produção muda. `packages/tokens`
  não é afetado. Os demais testes citados no design já existem e já passam,
  sem alteração.
- Nenhuma rota ou dado é afetado. Não há mudança em `src/`, `queries/`,
  `supabase/`, `data/` ou `tests/`.
- Fecha o ponto 5 de `docs/pontos-abertos.md`.
