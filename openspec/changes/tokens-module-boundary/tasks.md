# Tasks

**Ordem obrigatória.** O grupo 1 vem antes do 2: a asserção do grupo 2 reprova o
estado atual da árvore, e escrevê-la antes do conserto deixaria o portão vermelho
entre dois commits. O grupo 3 vem depois dos dois, porque os plantios precisam da
asserção escrita e da árvore verde para serem vistos reprovando. O grupo 4 — o
conserto da checagem do ciclo de vida — é independente dos três e pode rodar a
qualquer momento antes do portão.

**O que conta como verificação aqui.** Toda tarefa é conferida por execução, e toda
tarefa cujo teste existe para **recusar** algo traz o plantio registrado: o que foi
plantado, a reprovação observada com o que ela nomeou, e a reversão
(`openspec/config.yaml`, `rules.specs`). As execuções vão para o corpo do pull
request, na seção `## Verificação`.

**Medido na proposta, e é o que a asserção do grupo 2 tem de reproduzir:** hoje
exatamente um arquivo alcançável importa módulo de ambiente —
`packages/tokens/src/source.ts`, com `node:fs` na linha 1, `node:path` na 2 e
`node:url` na 3 —, alcançado por um caminho só,
`@chargebr/tokens/palette → palette.ts → source.ts`.

**A disciplina do plantio vale aqui** (`CLAUDE.md`, "O que nunca fazer"): a árvore é
commitada antes de qualquer plantio, porque a reversão é destrutiva.

## 1. A fronteira de módulo do `@chargebr/tokens`

- [ ] 1.1 Criar o módulo do vocabulário de tema em `packages/tokens/src/`, com
  `THEMES` e `Theme` e **nenhuma importação**, e o comentário dizendo por que ele
  existe separado — a aresta medida que levava o leitor de disco ao grafo publicado.
  Verificar com `pnpm -r exec tsc --noEmit` passando e com o arquivo não tendo
  nenhuma linha de `import`.
- [ ] 1.2 Fazer `packages/tokens/src/source.ts` consumir o módulo novo e reexportar
  `THEMES`/`Theme`, para que `contrast.ts` e os outros consumidores internos não
  mudem. Verificar com `pnpm -r exec tsc --noEmit` passando e com
  `git diff --stat packages/tokens/src` mostrando só os arquivos deste grupo.
- [ ] 1.3 Fazer `packages/tokens/src/palette.ts` apontar para o módulo novo nas duas
  linhas — a de tipo e a de valor —, com a extensão do arquivo que existe
  (`design.md`, D5). Verificar com `pnpm -r exec tsc --noEmit` passando e
  `grep -n "source" packages/tokens/src/palette.ts` não devolvendo nada.
- [ ] 1.4 Confirmar que o leitor de disco saiu do grafo publicado. Verificar com a
  sonda de alcance: `packages/tokens/src/source.ts` sem nenhum caminho que o alcance,
  e zero arquivos alcançáveis importando módulo de ambiente — antes do grupo era um,
  com a cadeia nomeada.
- [ ] 1.5 Confirmar que o aviso da construção desapareceu. Verificar com
  `pnpm --filter @chargebr/backoffice build` e `grep` por "leads to all source files"
  na saída voltando vazio — antes do grupo a mesma construção avisa.
- [ ] 1.6 Confirmar que nada do que a camada de tokens gera mudou. Verificar com
  `git diff --stat packages/tokens/generated` vazio e `pnpm verify` verde no estágio
  de testes do pacote.

## 2. A asserção do portão

- [ ] 2.1 Acrescentar a `apps/backoffice/tests/published-subpaths.test.ts` a
  terceira asserção sobre a travessia que já existe: nenhum arquivo alcançável
  importa módulo de ambiente, com a falha nomeando arquivo, especificador e **cadeia
  de alcance**. Verificar com o teste passando sobre a árvore corrente e a contagem
  de arquivos alcançáveis impressa na saída.
- [ ] 2.2 Reconhecer o especificador de ambiente pelas duas condições descobertas
  (`design.md`, D3): prefixo `node:` e pertinência ao conjunto de módulos embutidos
  lido do ambiente. Verificar imprimindo na execução o tamanho do conjunto lido —
  medido em 72 — e conferindo que ele contém `fs` e não contém `node:fs`.
- [ ] 2.3 Fazer o conjunto de isenções ser declarado e vazio, com a conferência de
  correspondência de cada item que existir. Verificar com a execução imprimindo
  **zero** isenções, e não a ausência de linha.
- [ ] 2.4 Confirmar que a asserção reusa a travessia e não cria uma segunda.
  Verificar por leitura do arquivo: uma função de travessia, três asserções sobre
  ela, nenhuma lista de diretório escrita à mão.

## 3. Os plantios

- [ ] 3.1 **Plantio da reexportação de valor:** devolver a `palette.ts` a
  reexportação de valor do vocabulário a partir do módulo que lê disco, e confirmar
  que 2.1 reprova nomeando `packages/tokens/src/source.ts`, o especificador e a
  cadeia `@chargebr/tokens/palette → palette.ts → source.ts`. Transcrever a
  mensagem, reverter o plantio e confirmar o teste verde de novo.
- [ ] 3.2 **Plantio do conjunto de módulos embutidos vazio:** substituir por lista
  vazia a leitura do conjunto e confirmar que a verificação reprova dizendo que o
  conjunto ficou vazio, em vez de passar com a cobertura reduzida ao prefixo.
  Transcrever a mensagem, reverter o plantio e confirmar verde.
- [ ] 3.3 **Plantio da isenção sem correspondência:** declarar isenção para um
  arquivo que não importa o especificado e confirmar que a verificação reprova
  nomeando a isenção. Transcrever a mensagem, reverter o plantio e confirmar verde.
- [ ] 3.4 **Plantio da forma sem prefixo:** plantar `import { readFileSync } from
  "fs"` num arquivo alcançável e confirmar as duas reprovações — a da etapa de lint
  (`lint/style/useNodejsImportProtocol`) e a da asserção, pela segunda condição.
  Transcrever as duas mensagens, reverter o plantio e confirmar verde.
- [ ] 3.5 Confirmar que o conjunto alcançável vazio continua reprovando, pela
  asserção que já existe desde `package-consumption`. Verificar com o plantio de
  pacote descartável sob `packages/` com alvo de exportação inexistente, a
  reprovação nomeando o pacote, e a remoção do plantio.

## 4. O conserto da checagem do ciclo de vida

**Entra por autorização do dono depois da proposta** (`design.md`, D7): a checagem
que deveria verificar o fechamento do ponto 23 que este ciclo declara está morta, e
entregável sem verificação não é escopo alheio. **Duas obrigações, não uma** — o
padrão corrente e a contagem declarada (D8).

- [ ] 4.1 Fazer a leitura dos pontos abertos de `docs/pontos-abertos.md`, em
  `tools/checks/change-lifecycle.test.ts`, casar o formato corrente da **seção de
  pontos abertos**, e só dela. Verificar com a leitura devolvendo exatamente
  `[21, 22, 23]` — e **não** 4 números: a seção de reclassificados usa o mesmo
  formato de item e tem um item numerado, que não é ponto aberto.
- [ ] 4.2 Declarar na própria checagem a contagem de pontos abertos esperada — **3**
  nesta árvore —, e afirmar a contagem lida contra ela, com a falha nomeando a
  declarada e a lida. A contagem é declarada na checagem e **não** extraída do
  cabeçalho do arquivo (D8). Verificar com a checagem passando e a contagem lida
  impressa na execução.
- [ ] 4.3 **Plantio do formato:** alterar o formato de um item da seção de abertos e
  confirmar que a checagem reprova nomeando a contagem declarada e a lida — a
  reprovação que a versão original nunca teve. Transcrever a mensagem, reverter o
  plantio e confirmar verde.
- [ ] 4.4 **Plantio da comparação original:** plantar uma mudança arquivada que
  declare fechar um ponto que o registro ainda lista como aberto, e confirmar que a
  checagem reprova nomeando o ponto e a mudança — a comparação que estava morta e
  volta a funcionar. Transcrever a mensagem, reverter os dois plantios e confirmar
  verde.
- [ ] 4.5 Confirmar que nenhum perímetro mudou e que nenhum guardião novo nasceu.
  Verificar com `ls tools/checks/*.test.ts | wc -l` devolvendo 7, o inventário de
  `CLAUDE.md` intocado, e `git diff main -- tools/` mostrando só
  `change-lifecycle.test.ts`.

## 5. Portão e perímetro

- [ ] 5.1 Executar `pnpm verify` e confirmar os quatro estágios verdes, com a
  contagem de arquivos de teste registrada antes e depois — 74 antes. Verificar pela
  saída e pelo código de saída zero.
- [ ] 5.2 Confirmar que nenhum perímetro de guardião mudou e que `tools/` mudou
  **em um arquivo só**. Verificar com `git diff --name-only main -- tools/`
  devolvendo apenas `tools/checks/change-lifecycle.test.ts`, nenhuma lista de
  perímetro alterada dentro dele, e `ls tools/checks/*.test.ts | wc -l` devolvendo 7.
- [ ] 5.3 Confirmar que nada de tema mudou e que `openspec/changes/theme-choice/`
  está intocado. Verificar com `git diff --stat main -- openspec/changes/theme-choice`
  vazio e `grep` por `data-theme` em `git diff main -- apps packages` voltando vazio.
- [ ] 5.4 Confirmar que a geração de tokens não mudou. Verificar com
  `git diff --stat main -- packages/tokens/generated packages/tokens/tokens` vazio.
- [ ] 5.5 Confirmar que nenhum script da raiz mudou e que `openspec/config.yaml`
  está intocado — este ciclo não acrescenta nem remove regra, então a contagem
  declarada em `config-rules` não muda. Verificar com `git diff main -- package.json
  openspec/config.yaml` vazio.
- [ ] 5.6 Confirmar que nenhum arquivo sob `openspec/specs/` muda neste PR — o delta
  só é aplicado no arquivamento. Verificar com `git diff main -- openspec/specs`
  vazio.

## 6. Arquivamento

As tarefas deste grupo rodam no terceiro PR do ciclo:
`tools/checks/change-lifecycle.test.ts` reprova mudança ativa com todas as tarefas
marcadas, e é essa reprovação que obriga o arquivamento a acontecer.

- [ ] 6.1 Arquivar a mudança **com sincronização da spec viva**: mover
  `openspec/changes/tokens-module-boundary/` para
  `openspec/changes/archive/<data>-tokens-module-boundary/` e aplicar o delta de
  `workspace-verification` em `openspec/specs/`. Verificar com
  `npx openspec validate --specs --strict` passando nas sete capacidades e o
  requisito novo presente com os quatro cenários.
- [ ] 6.2 Conferir, um a um contra `git show main:openspec/specs/workspace-verification/spec.md`,
  que nenhum dos requisitos anteriores foi reescrito — o delta é só ADDED, e a
  conferência é o que distingue as duas coisas. Verificar pela comparação de cada
  bloco, aceitando como diferença apenas linha em branco de separação.
- [ ] 6.3 Mover o **ponto 23** de "Abertos" para "Fechados" em
  `docs/pontos-abertos.md`, **no mesmo commit** do movimento para `archive/`, com a
  medição do fechamento: o leitor de disco fora do grafo publicado, zero arquivos
  alcançáveis importando módulo de ambiente, e a asserção que passa a guardar a
  linha. Atualizar o cabeçalho: 20 ciclos arquivados, **2 pontos abertos** (21 e 22),
  e o change ativo que continua (`theme-choice`).
- [ ] 6.4 Descer para **2** a contagem declarada de pontos abertos em
  `tools/checks/change-lifecycle.test.ts`, **no mesmo commit** que fecha o ponto 23.
  A confirmação do fechamento deixa de ser humana e passa a ser mecânica: se o
  arquivamento esquecer de tirar o 23 da seção de abertos, a leitura acha 3 contra 2
  declarados e reprova; e a comparação original — ponto declarado fechado que o
  registro ainda lista como aberto — volta a funcionar pelo conserto do grupo 4.
  Verificar com o guardião passando e, por plantio, com o 23 deixado na seção de
  abertos fazendo as duas afirmações reprovarem.
- [ ] 6.5 Executar `pnpm verify` sobre a árvore arquivada e confirmar os quatro
  estágios verdes. Verificar pela saída do comando, código de saída zero.
