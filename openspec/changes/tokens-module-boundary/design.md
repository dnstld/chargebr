# Design

## Context

Ver `proposal.md`, seção Why, para o ponto 23 e a cadeia medida. Aqui ficam as
medições desta proposta e o que cada uma decide.

As medições foram feitas nesta branch, por protótipo descartável, com
`apps/backoffice` construído de verdade e com `pnpm verify` executado por inteiro.
A travessia foi medida por uma sonda que replica a de
`apps/backoffice/tests/published-subpaths.test.ts` — mesma descoberta do `exports`,
mesma resolução de especificador relativo —, acrescentando duas saídas que o teste
não imprime: por qual subpath cada arquivo é alcançado, e quais arquivos alcançáveis
importam módulo de ambiente. Nenhum protótipo ficou na árvore: ao fim,
`git status` limpo e nenhuma linha de código neste PR.

O que já existe e este ciclo reusa:

- A travessia do grafo publicado, escrita em `package-consumption`: descobre os
  subpaths do `exports` de cada pacote sob `packages/`, segue as importações
  relativas resolvendo `.js`, `.ts` e extensão ausente, e para nas folhas que não
  são módulo. Ela já sustenta duas asserções — cobertura dos subpaths e proibição de
  diretiva de referência. Esta é a terceira.
- A figura da isenção declarada com razão, de `design-tokens`: o token isento da
  varredura por tema aparece com o motivo, e a correspondência de cada item é
  conferida contra o código.

## Goals / Non-Goals

**Goals:**

- Fechar o ponto 23 pelo portão, e não só pelo conserto.
- Decidir por medição, e não por suposição, se o leitor de disco sai do grafo
  publicado ou se a asserção precisa de isenção declarada.
- Manter o conjunto de módulos de ambiente descoberto, sem lista a manter.

**Non-Goals:**

- Mover vocabulário de `source.ts` que nenhuma medição pede.
- Tirar `./palette` do `exports`.
- Consertar a checagem morta do registro de pontos (D7).

## Decisions

### D1. O entregável é o portão; o conserto é consequência

**Decisão:** o ciclo entrega a obrigação — nenhum arquivo alcançável pelo `exports`
importa módulo de ambiente — e a separação de módulo entra como o que faz a árvore
cumprir essa obrigação.

**Por quê:** hoje a construção **avisa e passa**. Aviso é informação para quem
estiver olhando a saída naquele instante; portão é o que reprova sozinho depois. Um
ciclo que entregasse só a separação de módulo deixaria a próxima reexportação de
valor arrastar `node:fs` para o grafo do servidor pelo mesmo caminho, e o defeito
voltaria como peso de implantação, sem nada que nomeasse a causa. É a mesma forma
do ciclo anterior: lá, "resolver não é compilar"; aqui, "avisar não é reprovar".

**O que faria mudar de ideia:** a construção passar a **reprovar** por conta própria
nesse caso. Hoje não reprova — medido: a construção conclui com código de saída
zero, com o aviso na saída.

### D2. O leitor sai do grafo publicado; nenhuma isenção é necessária

**Decisão:** nenhuma isenção é declarada. `./palette` continua publicado, e o leitor
de disco deixa de ser alcançável.

**Esta é a decisão que a instrução mandou medir em vez de assumir**, e a medição
responde sem ambiguidade.

**Antes do conserto:**

| O que | Medido |
| --- | --- |
| Arquivos alcançáveis a partir dos dez subpaths | 68 |
| Arquivos alcançáveis que importam módulo de ambiente | **1** — `packages/tokens/src/source.ts` (`node:fs` linha 1, `node:path` linha 2, `node:url` linha 3) |
| Caminhos que alcançam `source.ts` | **um só** — `@chargebr/tokens/palette → palette.ts → source.ts` |

**Depois do conserto, com protótipo descartável:**

| O que | Medido |
| --- | --- |
| Arquivos alcançáveis | 68 (o leitor sai, o módulo de vocabulário entra) |
| Arquivos alcançáveis que importam módulo de ambiente | **0** |
| Caminhos que alcançam `source.ts` | **nenhum** |
| `pnpm -r exec tsc --noEmit` | passa |
| `pnpm verify` | quatro estágios verdes, 74 arquivos, 296 testes |
| Aviso da construção | **desaparece** — zero linhas do aviso na saída |

O leitor sai do grafo **como consequência**, porque a reexportação de valor em
`palette.ts:15` era a única porta de entrada dele. Não foi preciso escolher entre as
duas saídas que a instrução desenhou: a primeira — "o leitor deixa de ser subpath,
vira ferramenta de construção" — já é o estado resultante, sem mexer no `exports`;
e a segunda — isenção declarada — fica sem ocasião.

**O que faria mudar de ideia:** um segundo caminho alcançando `source.ts`, ou um
arquivo alcançável novo importando módulo de ambiente. A asserção é quem passa a
responder isso a cada execução, em vez de depender desta medição.

### D3. O conjunto de módulos de ambiente é descoberto, com duas condições

**Decisão:** um especificador é de ambiente quando começa com `node:` **ou** quando
pertence ao conjunto de módulos embutidos que o ambiente publica. Conjunto lido do
ambiente, não declarado. Conjunto vazio reprova.

**Medido:** o conjunto publicado tem **72** entradas e contém `fs`, `path`, `url` e
`crypto`; **não** contém `node:fs` nem as outras formas com prefixo. Nenhuma das duas
condições basta sozinha: só o prefixo deixaria passar `import { readFileSync } from
"fs"`, e só o conjunto deixaria passar tudo que o repositório de fato escreve.

**A forma sem prefixo já tem uma guarda antes, e isso está registrado em vez de
ignorado. Medido:** com `import { readFileSync } from "fs"` plantado num arquivo do
pacote, a etapa de lint reprova com `lint/style/useNodejsImportProtocol`. A segunda
condição entra como guarda de trás — se a regra de lint for desligada ou o arquivo
for isentado dela, a asserção continua pegando.

**Por que conjunto vazio reprova:** lido vazio — ambiente diferente, versão que mude
a interface —, a segunda condição passaria calada e a cobertura cairia para o
prefixo, sem ninguém ver. É o mesmo defeito de lista vazia que
`proof-falsifiability` registrou, aqui na forma de conjunto lido.

**Alternativa considerada:** declarar à mão a lista de módulos proibidos (`node:fs`,
`node:path`, `node:url`, …). Descartada: é lista de entrada escrita à mão, e
pediria as duas provas próprias que `rules.specs` exige — enquanto a fonte
autoritativa já existe e vem do ambiente. Declará-la também congelaria a cobertura
na versão do dia em que foi escrita.

### D4. A fronteira é o vocabulário de tema, e só ele

**Decisão:** `THEMES` e `Theme` saem para um módulo próprio, sem dependência
nenhuma. `source.ts` passa a consumi-lo e a reexportá-lo, para que `contrast.ts` e
os demais consumidores internos não mudem. `palette.ts` passa a apontar para o
módulo novo.

**Por quê:** é o que a cadeia medida exige, e nada além. **Medido, sobre o que
`source.ts` exporta:** o arquivo mistura vocabulário puro (`LAYERS`, `Layer`,
`THEMES`, `Theme`, `isLayer`), caminhos de diretório que avaliam `node:url` no
carregamento do módulo (`TOKENS_DIR`, `GENERATED_DIR`) e o leitor de disco
(`listSourceFiles`, `readJson`, `loadSource`). Mover só `THEMES`/`Theme` é o
suficiente para cortar a única aresta alcançável.

**Por que `LAYERS` e `Layer` não vão junto:** não são alcançáveis por subpath
publicado nenhum — quem os usa é `dtcg.ts`, `rules.ts`, `validate.ts` e `build.ts`,
todos fora do grafo. Movê-los seria mudança sem defeito que a sustente, e a
obrigação nova é quem passa a avisar se um dia eles entrarem no grafo.

**Alternativa considerada:** quebrar `source.ts` em dois — vocabulário e leitor — de
uma vez. Descartada pelo mesmo argumento, e com um custo a mais: `TOKENS_DIR` e
`GENERATED_DIR` avaliam `node:url` no carregamento, então o corte "puro contra
impuro" não cai onde o nome sugere, e decidir onde ele cai é trabalho sem medição
que o peça.

### D5. A extensão do especificador do módulo novo

**Decisão:** as importações do módulo novo nomeiam o arquivo com a extensão real
(`.ts`), nas duas pontas.

**Por quê:** é a linha de princípio que `package-consumption` estabeleceu —
especificador alcançável a partir de um subpath publicado nomeia o arquivo que
existe, porque o empacotador da aplicação não resolve a extensão de módulo para
`.ts`. `palette.ts` é alcançável, então a ponta dele é obrigada. A outra ponta é
`source.ts`, que **não** é alcançável; usar a mesma forma nas duas evita que a mesma
aresta tenha dois estilos, o que seria confusão sem ganho.

### D6. A isenção, se um dia existir

**Decisão:** a isenção é declarada com arquivo, especificador e razão, e a
verificação reprova quando a isenção não corresponde ao que o arquivo importa.
Hoje o conjunto é vazio, e o vazio é declarado.

**Por quê:** é a figura de `color.nav.edge` em `design-tokens`, e ela existe por um
defeito medido naquele ciclo: um item declarado numa lista pode descrever papel que
o código não cumpre, e o número sai certo pela razão errada. Isenção sem
correspondência é a mesma coisa: sobrevive a quem removeu o import e passa a
autorizar um arquivo que não precisa mais dela.

**Por que o vazio é declarado:** conjunto de isenções ausente e conjunto vazio se
leem igual na saída, e só um dos dois foi medido. Declarado, a execução imprime
zero, e zero é afirmação.

### D7. A checagem morta do registro de pontos — levada ao dono, não consertada

**Medido:** `tools/checks/change-lifecycle.test.ts` lê os pontos ainda abertos por
`/^## (\d+)\./gm`, e o registro usa itens de lista (`- **23. …**`) desde o
arquivamento de `close-open-points`. Hoje: **0** cabeçalhos no formato que o
guardião procura, **19** itens no formato que o arquivo usa. A terceira checagem
dele compara contra conjunto vazio e **não pode reprovar**. O histórico mostra
quando morreu: em `7568a6b`, o commit que escreveu o guardião, o arquivo tinha 7
cabeçalhos; em `0942af1`, o arquivamento do mesmo ciclo, passou a ter 0.

**Decisão:** fora do escopo deste ciclo, com as duas posições e o risco registrados
em `proposal.md`. A posição "dentro de escopo" é defensável — a tese do ciclo é que
aviso não é portão, e checagem que não pode reprovar não é portão pela mesma razão —,
mas exige autorização que esta proposta não tem: a instrução do ciclo diz para não
mexer em guardião.

**Consequência operacional, escrita para não virar esquecimento:** o fechamento do
ponto 23 que este ciclo declara **não será verificado por máquina**. O PR 3 confirma
à mão a saída do ponto do registro e registra que a confirmação foi humana.

**O que faria mudar de ideia:** autorização do dono para incluir o conserto, que é
da ordem de duas linhas no padrão de leitura e não toca perímetro nenhum.

## Risks / Trade-offs

- **A obrigação larga pode reprovar um caso legítimo no futuro** → a saída é a
  isenção declarada com razão (D6), e não afrouxar a asserção. Hoje o conjunto de
  isenções é vazio e medido.
- **A separação de módulo acrescenta um arquivo de três linhas ao pacote** →
  aceito; é o preço de a aresta medida deixar de existir, e o arquivo é o que
  qualquer consumidor pode alcançar sem arrastar nada.
- **`source.ts` continua misturando vocabulário, caminhos e leitor de disco** →
  aceito e registrado em D4: o que a medição pede é cortar a aresta alcançável, não
  reorganizar o arquivo.
- **O fechamento do ponto 23 não tem verificação mecânica** → D7, com as duas
  posições e a confirmação manual no PR 3.
- **A segunda condição de reconhecimento depende de uma interface do ambiente** →
  conjunto vazio reprova (D3), de modo que a dependência falha alto em vez de
  silenciosamente.
