# Proposal

## Why

**Fecha o ponto 23 de `docs/pontos-abertos.md`**, e fecha pelo portão, não pelo
conserto.

O ponto 23 registra que `@chargebr/tokens/palette` arrasta o leitor de disco da
fonte dos tokens para o grafo de servidor da aplicação. O conserto é pequeno e já
estava medido quando o ponto foi aberto; a medição foi refeita nesta proposta e
continua valendo:

- `packages/tokens/src/palette.ts:15` reexporta `THEMES` **como valor** de
  `./source.ts`. A linha 11, que importa só o tipo `Theme`, é apagada na
  compilação e é inofensiva.
- `packages/tokens/src/source.ts` importa `node:fs` na linha 1, `node:path` na 2 e
  `node:url` na 3; chama `readdirSync` na 64 e `readFileSync` na 93.
- `THEMES` e `Theme` são as linhas 20 e 21 de `source.ts`, e não têm dependência
  nenhuma.

**Mas o conserto não é o entregável; o portão é.** Hoje a construção da aplicação
**avisa e passa**: "This is usually unintentional and leads to all source files
(including the public folder) to be deployed as part of the server code. This can
slow down deployments or lead to failures when size limits are exceeded", com o
rastro `source.ts ← palette.ts ← app/prova/subpaths/route.ts`. Aviso não é portão.
Um ciclo que entregasse só a separação de módulo deixaria a próxima reexportação de
valor que arrastasse `node:fs` para o grafo do servidor passar do mesmo jeito,
calada, e o defeito reapareceria quando alguém reclamasse do peso da implantação.

**Medido nesta proposta, e é o que decide a forma do requisito:** entre os 68
arquivos alcançáveis a partir dos dez subpaths publicados, **exatamente um** importa
módulo de ambiente de execução — `source.ts`, alcançado por um caminho só:
`@chargebr/tokens/palette → palette.ts → source.ts`. Nenhum outro arquivo
alcançável importa `node:*`, em nenhum dos dois pacotes.

## What Changes

- **A obrigação central: nenhum arquivo alcançável a partir de um subpath publicado
  importa módulo de ambiente de execução.** É a **terceira asserção sobre a mesma
  travessia** escrita no ciclo `package-consumption` — a que descobre os subpaths do
  `exports` e segue as importações relativas —, não máquina nova. A falha nomeia o
  arquivo e a cadeia que o alcança.

- **O conjunto de módulos de ambiente é descoberto, não declarado à mão.** Um
  especificador é de ambiente quando começa com `node:` ou quando é um dos nomes que
  o próprio Node publica em `builtinModules`. **Medido:** `builtinModules` tem 72
  entradas e inclui as formas sem prefixo (`fs`, `path`, `url`, `crypto`); as formas
  com prefixo não estão lá, e por isso as duas condições são necessárias. Não há
  lista para manter: subir de versão do Node amplia a cobertura sozinho.

- **A fronteira de módulo do `@chargebr/tokens`.** `THEMES` e `Theme` saem para um
  módulo próprio, sem dependência nenhuma; `palette.ts` passa a apontar para ele, e
  `source.ts` o consome e o reexporta para quem já dependia dele.

- **Nenhuma isenção é necessária, e isto foi medido em vez de suposto.** A pergunta
  que a instrução desta proposta mandou medir era se a asserção larga reprovaria o
  estado atual mesmo depois do conserto do `palette` — isto é, se o leitor de disco
  continuaria alcançável por algum outro subpath. **Não continua.** Medido com
  protótipo descartável: depois da separação de módulo, `source.ts` **sai do grafo
  publicado** (nenhum subpath o alcança) e o conjunto de arquivos alcançáveis que
  importam `node:*` passa de **um para zero**. O leitor sai do grafo como
  consequência do conserto, porque a reexportação de valor em `palette.ts:15` era a
  única porta de entrada dele. `./palette` **continua publicado**; o que deixa de
  ser alcançável é o leitor, não o subpath.

- **E se um dia uma isenção for necessária, ela é nomeada com a razão.** A figura é
  a de `color.nav.edge` em `design-tokens`: isenção declarada, com o motivo escrito,
  nunca ausência de medição. Hoje não existe nenhuma, e o requisito diz isso — uma
  isenção vazia é o estado correto, e tem de ser vista como zero, não como lista que
  ninguém olhou.

- **O conserto da checagem morta do ciclo de vida entra neste ciclo**, por
  autorização do dono depois da proposta, e por dependência concreta: este ciclo
  declara que fecha o ponto 23, e quem deveria verificar essa declaração é
  exatamente a checagem que está morta. É o entregável deste ciclo sem verificação,
  não escopo alheio — e é a mesma tese do ciclo: aviso não é portão, e checagem
  incapaz de reprovar é a mesma coisa.

- **Duas obrigações para esse conserto, não uma.** A leitura passa a casar o formato
  corrente da seção de pontos abertos, **e** a contagem de pontos lida passa a ser
  comparada contra uma contagem declarada na própria checagem. Só o padrão não
  resolve: a prova morreu porque lê um formato, e formato deriva — a contagem
  declarada é o que reprova na próxima deriva. É a figura do guardião do arquivo de
  regras, já provada neste repositório. Declarada na checagem, **nunca** extraída do
  cabeçalho: cabeçalho é prosa, e tirar número de prosa troca uma fragilidade de
  formato por outra. **Medido:** hoje a seção de abertos tem 3 pontos (21, 22 e 23) e
  a de reclassificados usa o mesmo formato de item, com um item numerado — ler o
  arquivo em vez da seção daria 4.

- **As provas, com plantio.** A reexportação de valor devolvida a `palette.ts:15`
  faz a asserção reprovar nomeando `packages/tokens/src/source.ts` e a cadeia
  `@chargebr/tokens/palette → palette.ts → source.ts`. O conjunto alcançável vazio
  continua reprovando, pela asserção que já existe desde `package-consumption`. E o
  formato de um item do registro alterado por plantio faz a checagem do ciclo de vida
  reprovar nomeando a contagem declarada e a lida — a reprovação que a versão
  original dela nunca teve.

## What This Does Not Do

- **Não toca tema.** Nada sobre `data-theme`, nem sobre escolha de tema, e nada em
  `openspec/changes/theme-choice/`, que segue parado no estágio de proposta.
- **Não amplia perímetro de guardião nenhum.** Nenhuma lista de perímetro de
  `tools/checks/` ganha ou perde entrada, nenhum guardião novo nasce, e o inventário
  de sete em `CLAUDE.md` fica como está. O ciclo **muda um guardião existente** —
  `tools/checks/change-lifecycle.test.ts`, na leitura do registro de pontos —, e isso
  é conserto de prova morta, não ampliação de alcance. A asserção da obrigação
  central mora no arquivo de prova que já existe em `apps/backoffice/tests/`, sobre a
  lista descoberta do `exports`.
- **Não mexe na geração de tokens.** A fonte DTCG, a construção da camada e os
  artefatos gerados ficam idênticos: o que muda é onde duas declarações moram.
  `design-tokens` não recebe delta — nada do que aquela capacidade garante depende
  de `THEMES` estar neste ou naquele arquivo, e inventar requisito para registrar
  movimentação de módulo reprovaria a primeira regra de `rules.specs`.
- **Não tira `./palette` do `exports`.** Foi uma das duas saídas que a instrução
  mandou medir, e a medição a dispensou.
- **Não move `LAYERS`/`Layer` nem o resto do vocabulário de `source.ts`.** Só o que
  a cadeia medida exige. `LAYERS` não é alcançável por subpath publicado nenhum, e
  mover o que nenhuma medição pede é mudança sem defeito que a sustente.
- **Não proíbe módulo de ambiente onde ele é legítimo.** A obrigação vale para
  arquivo **alcançável a partir do `exports`**. O construtor de tokens, a validação,
  os relatórios e todo arquivo de prova continuam lendo disco à vontade — nenhum
  deles é alcançável, e isso foi medido.

## O achado que mudou o escopo, e como foi resolvido

A instrução original desta proposta dizia para declarar o fechamento do ponto 23
"porque o guardião do ciclo de vida confere". **Medido: ele não conferia.**

`tools/checks/change-lifecycle.test.ts` lia os pontos abertos pelo padrão
`/^## (\d+)\./gm` — cabeçalhos de nível 2. O registro usa itens de lista
(`- **23. …**`) desde o arquivamento de `close-open-points`. Contagem do dia da
medição: **0** cabeçalhos no formato procurado, **19** itens no formato usado, em três
seções. A terceira checagem — "ponto declarado fechado por mudança arquivada não
continua aberto no registro" — comparava contra conjunto vazio e **não tinha como
reprovar**.

A medição do histórico mostra quando morreu: em `7568a6b`, o commit que escreveu o
guardião, o arquivo tinha **7** cabeçalhos e o padrão casava; em `0942af1`, o
arquivamento do mesmo ciclo, passou a ter **0**. A prova foi vista reprovando quando
nasceu — está registrada nas tarefas daquele arquivamento — e morreu em seguida, pela
mudança de formato do arquivo que ela lê.

**A primeira versão desta proposta deixou o conserto fora de escopo**, com as duas
posições registradas, porque a instrução do ciclo dizia para não mexer em guardião.
**O dono reverteu a própria instrução depois de ler a medição**, e o conserto entra:
a instrução era do tipo cobertor, e a dependência é concreta — este ciclo declara que
fecha o ponto 23, e a checagem morta é justamente quem deveria verificar essa
declaração. Entregável sem verificação não é escopo alheio.

Com o conserto dentro, a confirmação do fechamento do ponto 23 no arquivamento deixa
de ser humana e passa a ser mecânica.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workspace-verification`: um requisito novo e um modificado.
  - **Novo:** nenhum arquivo alcançável a partir de um subpath publicado importa
    módulo de ambiente de execução, com o conjunto de módulos descoberto do Node e a
    isenção, se algum dia existir, declarada com a razão.
  - **Modificado:** "Ponto declarado fechado por mudança arquivada não continua
    aberto no registro" passa a obrigar que a leitura seja da seção de pontos
    abertos, no formato corrente dela, e que a contagem lida seja comparada contra
    uma contagem declarada na própria checagem.

Nenhuma outra capacidade recebe delta. `design-tokens` não muda porque a
movimentação de duas declarações entre módulos não altera o que a camada de tokens
garante sobre fonte, camadas, acesso tipado ou geração determinística.

## Impact

- `packages/tokens/src/`: um módulo novo com `THEMES` e `Theme`; `palette.ts` e
  `source.ts` passam a apontar para ele.
- `apps/backoffice/tests/published-subpaths.test.ts`: a terceira asserção sobre a
  travessia que já existe, e o conjunto de módulos de ambiente descoberto de
  `builtinModules`.
- `tools/checks/change-lifecycle.test.ts`: a leitura do registro de pontos passa a
  casar o formato corrente e a afirmar a contagem contra a declarada. Nenhum
  perímetro muda, e nenhum guardião novo nasce — continuam sete.
- `openspec/specs/workspace-verification/spec.md`: um requisito novo e um modificado,
  aplicados no arquivamento (PR 3).
- `docs/pontos-abertos.md`: no arquivamento, o ponto 23 sai de "Abertos" e entra em
  "Fechados" com a medição; o cabeçalho passa a 20 ciclos arquivados e 2 pontos
  abertos.
- Nenhum script da raiz. Nenhum arquivo gerado da camada de tokens. Nenhuma lista de
  perímetro de guardião.
