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
- Trocar o registro de pontos por fonte estruturada — o conserto de verdade que o
  design de `close-open-points` já registrou. Este ciclo conserta a leitura e afirma
  a contagem (D8).

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

### D7. A checagem morta do registro de pontos entra no escopo

**Decisão, revista:** o conserto entra neste ciclo. A primeira versão deste design o
deixava fora, com as duas posições registradas, porque a instrução do ciclo dizia para
não mexer em guardião. **O dono reverteu a própria instrução depois de ler a
medição**, e a razão dele é a que vale: a instrução era do tipo cobertor, e a
dependência é concreta — este ciclo declara que fecha o ponto 23, e a checagem morta é
quem deveria verificar essa declaração. Entregável sem verificação não é escopo
alheio, e a tese do ciclo é exatamente essa: aviso não é portão, e checagem incapaz de
reprovar é a mesma coisa.

**Medido, e é o que sustenta tudo acima:** a leitura procurava pontos abertos por
cabeçalho de nível 2 (`## 23.`); o registro usa item de lista (`- **23. …**`) desde o
arquivamento de `close-open-points`. Contagem do dia: **0** cabeçalhos no formato
procurado, **19** itens no formato usado, distribuídos em três seções. No commit que
escreveu a checagem o arquivo tinha **7** cabeçalhos e o padrão casava; no
arquivamento do mesmo ciclo, **0**. A prova nasceu viva, foi vista reprovando, e
morreu em seguida pela mudança de formato do arquivo que ela lê.

**Consequência operacional invertida:** a tarefa do arquivamento deixa de pedir
confirmação humana do fechamento do ponto 23 e passa a ser mecânica.

### D8. A forma do conserto: casar o formato e afirmar a contagem

**Decisão:** duas obrigações. A leitura passa a casar o formato corrente da **seção de
pontos abertos**, e a contagem de pontos lida passa a ser comparada contra uma
**contagem declarada na própria checagem**.

**Por que o padrão sozinho não resolve:** a prova morreu porque lê um formato, e
formato deriva. Trocar o padrão conserta a ocorrência e deixa a classe de pé — a
próxima deriva mata a prova do mesmo jeito, calada, e o repositório descobre quando
alguém for ler à mão. A contagem declarada é a **prova da prova**: ela é o que reprova
quando a leitura passa a achar nada.

**É a figura do guardião do arquivo de regras**, pela mesma razão medida lá: derivada
do arquivo lido, esperado e lido mudariam juntos e a comparação nunca reprovaria.
Declarada, ela custa uma linha a quem abre ou fecha um ponto, no mesmo commit que abre
ou fecha — e esse custo é o ponto.

**Por que a contagem não sai do cabeçalho do arquivo.** O cabeçalho diz hoje "**3
pontos abertos**", e seria tentador lê-lo em vez de declarar. Descartado: cabeçalho é
prosa, muda de redação a cada ciclo, e tirar número de prosa troca uma fragilidade de
formato por outra — pior, porque a segunda não tem nem convenção escrita. O número fica
na checagem, onde é código.

**Por que a leitura é da seção de abertos, e não do arquivo até a seção de fechados.
Medido:** a seção de reclassificados usa o **mesmo** formato de item e tem um item
numerado (o que agrupa os pontos 1, 10 e 18). Lida junto, ela entraria no conjunto de
abertos e a contagem sairia 4 em vez de 3. Ponto reclassificado não é dívida de
interface — foi tirado do registro por decisão de ciclo anterior, e contá-lo como
aberto seria ressuscitá-lo por acidente de parser.

**O estado medido hoje, que o PR 2 declara:** 3 pontos abertos — 21, 22 e 23. O PR 3
fecha o 23 e desce a declaração para 2, no mesmo commit. Se o arquivamento esquecer de
tirar o 23 da seção de abertos, a leitura acha 3 contra 2 declarados e reprova — é
assim que a confirmação deixa de ser humana.

**O que faria mudar de ideia:** uma fonte estruturada para o registro, em vez de
prosa — o campo `closes_points` em `.openspec.yaml` que o design de
`close-open-points` já registrou como o conserto de verdade. Enquanto o registro for
um documento para ler, o par formato-corrente mais contagem-declarada é o que há.

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
- **A contagem declarada de pontos abertos vira atrito em todo ciclo que abrir ou
  fechar ponto** → aceito, e é o objetivo: uma linha por ponto, no mesmo commit. É o
  que faz a mudança ser vista (D8).
- **O conserto toca um guardião existente, contra a instrução original do ciclo** →
  autorizado pelo dono depois da medição, registrado em D7, e sem ampliar perímetro
  nenhum: nenhuma lista ganha entrada, nenhum guardião novo nasce, o inventário
  continua em sete.
- **A segunda condição de reconhecimento depende de uma interface do ambiente** →
  conjunto vazio reprova (D3), de modo que a dependência falha alto em vez de
  silenciosamente.
