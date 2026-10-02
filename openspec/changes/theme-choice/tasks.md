# Tasks

**Ordem obrigatória.** O grupo 1 vem antes de todos: sem o conserto de resolução,
nenhum arquivo da aplicação consegue importar `@chargebr/ui/atoms`, e a construção
reprova antes de qualquer outra tarefa poder ser verificada (`design.md`, D8). O
grupo 5 vem depois do 3 e do 4, porque as afirmações sobre o documento emitido
precisam do script e do controle já ligados.

**O que conta como verificação aqui.** Toda tarefa é conferida por execução, e
toda tarefa cujo teste existe para **recusar** algo traz o plantio registrado: o
que foi plantado, a reprovação observada com o que ela nomeou, e a reversão
(`openspec/config.yaml`, `rules.specs`). As execuções dos plantios vão para o corpo
do pull request, na seção `## Verificação`.

## 1. Resolução de importação e dependência do ícone

- [ ] 1.1 Trocar os três especificadores relativos de `packages/tokens/src/index.ts`
  pelos nomes dos arquivos que existem (`../generated/tokens.ts`, duas vezes, e
  `./hatch.ts`), e acrescentar `allowImportingTsExtensions` às opções de compilação
  de `packages/tokens/tsconfig.json`. Verificar com `pnpm -r exec tsc --noEmit`
  passando e `git diff packages/tokens` mostrando só essas quatro linhas.
- [ ] 1.2 Acrescentar `allowImportingTsExtensions` a
  `apps/backoffice/tsconfig.json`. Verificar com `pnpm -r exec tsc --noEmit`
  passando — sem a bandeira aqui, a checagem da aplicação reprova com
  `TS5097` ao seguir para dentro de `packages/tokens/src/index.ts`, e é essa
  reprovação que justifica a linha.
- [ ] 1.3 Acrescentar `lucide-react` a `dependencies` de
  `apps/backoffice/package.json`, na mesma versão que `packages/ui` fixa.
  Verificar com `pnpm install` concluindo e `git diff apps/backoffice/package.json`
  mostrando apenas a linha da dependência.
- [ ] 1.4 Confirmar que a aplicação passa a resolver o subpath publicado. Verificar
  com um arquivo da aplicação importando `@chargebr/ui/atoms` e
  `pnpm --filter @chargebr/backoffice build` concluindo — antes desta tarefa a
  mesma construção reprova com `Module not found: Can't resolve
  '../generated/tokens.js'`. Transcrever as duas saídas.
- [ ] 1.5 Confirmar que a árvore de rotas não mudou: `/` pré-renderizada,
  `/prova/[id]` resolvida por requisição, cinco documentos emitidos. Verificar com
  `apps/backoffice/tests/emitted-document.test.ts` passando nos 12 testes sobre a
  construção deste grupo, antes de qualquer mudança de tema.

## 2. O slot de ação no cabeçalho da moldura

- [ ] 2.1 Acrescentar a propriedade opcional `action` a `AppFrame`, renderizada
  dentro da região de cabeçalho, **fora** da condição que decide o atributo de
  forma. Verificar com `pnpm -r exec tsc --noEmit` passando e com a história do
  grupo 2.3 conferindo que o conteúdo está dentro do cabeçalho.
- [ ] 2.2 Ajustar `app-frame.module.css` só no que o slot exigir para o cabeçalho
  continuar com a marca à esquerda e a ação à direita, **sem valor literal**: só
  token. Verificar com o guardião `style-literals` passando e com a história do
  grupo 2.3 exercitando os dois temas.
- [ ] 2.3 Escrever a história da moldura com `action` preenchido e conferir, na
  própria história, que o conteúdo passado está dentro da região de cabeçalho e que
  o elemento raiz da moldura **não** tem atributo de forma. Verificar com a história
  passando nos dois projetos de tema e com a checagem de acessibilidade executada
  sobre ela.
- [ ] 2.4 Conferir, na história da moldura **sem** `action`, que o cabeçalho não
  ganha controle nenhum. Verificar com a história passando nos dois temas.
- [ ] 2.5 Acrescentar a `app-frame.typecheck.tsx` o uso só com `action`, sem `rail`
  e sem nenhuma das quatro propriedades de navegação. Verificar com
  `pnpm -r exec tsc --noEmit` passando.
- [ ] 2.6 **Plantio da forma:** acrescentar `action` à condição do atributo de forma
  e confirmar que a história do grupo 2.3 reprova nomeando o atributo de forma
  encontrado. Transcrever a mensagem, reverter o plantio e confirmar a história
  verde de novo.
- [ ] 2.7 Escrever o teste de contrato da moldura, no projeto `contratos` de
  `packages/ui`, afirmando que o arquivo da moldura não declara `"use client"`.
  Verificar com o teste passando dentro de `pnpm verify`.
- [ ] 2.8 **Plantio da diretiva:** declarar `"use client"` no arquivo da moldura e
  confirmar que o teste de 2.7 reprova nomeando o arquivo e a diretiva.
  Transcrever a mensagem, reverter o plantio e confirmar o teste verde de novo.

## 3. O script de tema e a posição dele no documento

- [ ] 3.1 Escrever o módulo da aplicação que carrega a fonte do script de tema e o
  tipo do aplicador instalado por ela: aplicar uma escolha e dizer qual é o tema
  resolvido, com a chave de armazenamento e o nome do atributo **só aqui**.
  Registrar no comentário do módulo que a fonte não pode conter a sequência que
  fecha o elemento de script, porque o conteúdo é emitido cru (`design.md`, D2).
  Verificar com o teste do grupo 3.3 passando.
- [ ] 3.2 Ligar o script no `<head>` de `apps/backoffice/app/layout.tsx`, com a
  fonte como conteúdo de texto do elemento — nunca por `dangerouslySetInnerHTML`.
  Verificar com `biome lint` e `biome format` passando (com
  `dangerouslySetInnerHTML`, `biome lint` reprova com
  `lint/security/noDangerouslySetInnerHtml`) e com a construção concluindo.
- [ ] 3.3 Escrever o teste que **executa a fonte do script** num documento de
  teste, cobrindo os quatro casos do requisito: sem escolha guardada (nenhum
  atributo), com cada uma das duas escolhas (atributo igual à escolha), com valor
  guardado inválido (nenhum atributo), e com o acesso ao armazenamento lançando
  erro (execução concluindo, nenhum atributo). Verificar com o teste passando
  dentro de `pnpm verify`.
- [ ] 3.4 **Plantio do caso inválido:** fazer a fonte aceitar qualquer valor
  guardado e confirmar que o caso do valor inválido de 3.3 reprova nomeando o tema
  declarado. Transcrever a mensagem, reverter o plantio e confirmar o teste verde.
- [ ] 3.5 Acrescentar a `emitted-document.test.ts` a afirmação de posição: o script
  que menciona o atributo de tema está dentro do `<head>`, com a fonte no corpo do
  elemento e sem `src`; a falha nomeia onde o script foi encontrado. Verificar com
  o teste passando sobre a construção corrente.
- [ ] 3.6 **Plantio da posição, primeira metade:** mover o script para o corpo do
  documento e confirmar que 3.5 reprova nomeando o lugar encontrado. Transcrever a
  mensagem, reverter o plantio e confirmar o teste verde de novo.
- [ ] 3.7 **Plantio da posição, segunda metade:** trocar a fonte no corpo do
  elemento por `src` e confirmar que 3.5 reprova dizendo que não achou, dentro do
  `<head>`, script que mencione o atributo. Transcrever a mensagem, reverter o
  plantio e confirmar o teste verde de novo.

## 4. O controle de tema

- [ ] 4.1 Escrever o controle em `apps/backoffice/app/_components/`, com
  `"use client"`, compondo o `Button` que já existe e um ícone estável de
  `lucide-react` — ícone que **não** muda por tema (`design.md`, D4). O controle
  recebe os três textos por propriedade individual e chama o aplicador; **nunca**
  escreve o atributo. Verificar com o teste do grupo 4.3 passando.
- [ ] 4.2 Passar o controle pelo slot `action` em `app/layout.tsx`, com os três
  textos declarados ali, ao lado de `PRODUCT_NAME` e `SKIP_LABEL`. Verificar com a
  construção concluindo e com a afirmação do grupo 5.1 passando.
- [ ] 4.3 Escrever o teste que monta o controle e dispara a ativação, conferindo:
  o atributo no elemento raiz passa a declarar o tema oposto, nos dois sentidos; a
  escolha fica guardada; e o nome acessível é o declarado antes da resolução do
  tema corrente e o rótulo da direção depois dela, para cada um dos dois temas.
  Verificar com o teste passando dentro de `pnpm verify`.
- [ ] 4.4 Ajustar `apps/backoffice/vitest.config.ts` e
  `apps/backoffice/tsconfig.json` para alcançarem arquivo de teste `.tsx`, **as
  duas na mesma tarefa** (`design.md`, D10). Verificar com o teste de 4.3 aparecendo
  entre os coletados por `vitest run` e com
  `pnpm -r exec tsc --noEmit --listFilesOnly` incluindo o arquivo dele.
- [ ] 4.5 **Plantio do texto por propriedade:** escrever o arquivo de checagem de
  tipos do controle com um uso sem um dos três textos e confirmar que
  `pnpm verify:types` reprova nomeando o uso. Transcrever a mensagem, deixar no
  arquivo apenas o uso completo e confirmar `verify:types` verde.
- [ ] 4.6 **Plantio do dono do atributo:** fazer o controle escrever o atributo por
  conta própria e confirmar que a varredura do grupo 5.2 reprova nomeando os
  artefatos que mencionam o atributo. Transcrever a mensagem e os artefatos
  nomeados, reverter o plantio e confirmar a varredura verde de novo.

## 5. O documento emitido

- [ ] 5.1 Acrescentar a `emitted-document.test.ts` a afirmação de que a região de
  cabeçalho contém o controle de tema com o nome acessível declarado pela
  aplicação. Verificar com o teste passando sobre a construção corrente.
- [ ] 5.2 Mudar a asserção da varredura de scripts emitidos de "nenhum menciona o
  atributo" para "exatamente um menciona", mantendo a afirmação de que algum script
  foi encontrado e fazendo a falha nomear os artefatos que mencionam. Verificar com
  o teste passando sobre a construção corrente, com o artefato nomeado na saída.
- [ ] 5.3 **Plantio do limite inferior:** remover o script do `<head>` e confirmar
  que 5.2 reprova dizendo que nenhum script menciona o atributo. Transcrever a
  mensagem, reverter o plantio e confirmar o teste verde de novo.
- [ ] 5.4 Confirmar que as afirmações que já existiam continuam valendo sem
  alteração: o elemento raiz do documento emitido não declara tema, as regiões são
  as duas e não há navegação, e o salto continua sendo o primeiro focalizável.
  Verificar pelos 12 testes de `emitted-document.test.ts` passando, com a contagem
  de asserções registrada na saída.

## 6. A revogação da instrução antiga, nos dois lugares

- [ ] 6.1 Substituir o comentário de `apps/backoffice/app/layout.tsx` que diz
  "Nenhum atributo de tema, e nenhum script de tema" pelo que passa a valer: a
  construção não fixa tema, o script do `<head>` é o único dono do atributo, e a
  posição dele é obrigação com prova. Verificar por leitura do arquivo e por
  `grep` não achando mais a frase antiga em `apps/`.
- [ ] 6.2 Confirmar que a frase antiga não sobreviveu em nenhum outro lugar do
  perímetro. Verificar com `grep -rn "nenhum script de tema"` em `apps/`,
  `packages/`, `tools/` e `openspec/` voltando vazio fora de
  `openspec/changes/archive/`.
- [ ] 6.3 Confirmar que `openspec/specs/` **não** muda neste PR — o delta só é
  aplicado no arquivamento. Verificar com `git diff main -- openspec/specs` vazio.

## 7. Portão e perímetro

- [ ] 7.1 Executar `pnpm verify` e confirmar os quatro estágios verdes, com os
  testes novos entre os coletados. Verificar pela saída do comando, código de saída
  zero, e a contagem de arquivos de teste registrada antes e depois.
- [ ] 7.2 Confirmar que a acessibilidade do cabeçalho com o controle foi executada,
  não afirmada: a checagem do axe roda sobre a história da moldura com `action`
  preenchido, nos dois temas. Verificar pela saída dos dois projetos de tema.
- [ ] 7.3 Confirmar que nada fora de `apps/`, `packages/` e `openspec/` mudou neste
  PR. Verificar com `git diff --name-only main` e a lista conferida arquivo a
  arquivo.
- [ ] 7.4 Confirmar que nenhum script da raiz foi alterado — em particular
  `collect`, `extract` e `test`, que não são nossos. Verificar com
  `git diff main -- package.json` mostrando nenhuma mudança em `scripts`.
- [ ] 7.5 Confirmar que o inventário de guardiões de `CLAUDE.md` continua batendo
  com o disco, e que a contagem declarada em `config-rules` não precisou mudar —
  este ciclo não acrescenta nem remove regra de `openspec/config.yaml`. Verificar
  com `ls tools/checks/*.test.ts | wc -l` devolvendo 7 e o guardião passando.

## 8. Arquivamento

As tarefas deste grupo rodam no terceiro PR do ciclo:
`tools/checks/change-lifecycle.test.ts` reprova mudança ativa com todas as tarefas
marcadas, e é essa reprovação que obriga o arquivamento a acontecer.

- [ ] 8.1 Arquivar a mudança **com sincronização da spec viva**: mover
  `openspec/changes/theme-choice/` para
  `openspec/changes/archive/<data>-theme-choice/` e aplicar o delta de
  `backoffice-shell` em `openspec/specs/`. Verificar com
  `npx openspec validate --specs --strict` passando nas sete capacidades, o
  requisito renomeado presente com os oito cenários dele, e os dois requisitos novos
  presentes — o do slot com cinco cenários e o da escolha de tema com oito.
- [ ] 8.2 Confirmar que o requisito antigo não sobreviveu com o nome antigo nem com
  a obrigação antiga. Verificar com `grep -n "Tema sem script"` em
  `openspec/specs/` voltando vazio, e com `grep -n "Nenhum script emitido pela
  construção SHALL mencionar"` voltando vazio.
- [ ] 8.3 Registrar em `docs/pontos-abertos.md`, **no mesmo commit** do movimento
  para `archive/`, o ponto aberto novo de `design.md`, D12 — subpath publicado sem
  prova de resolver antes de alguém importá-lo —, com o gatilho, e atualizar o
  cabeçalho do arquivo: data, estado do repositório e contagem de ciclos
  arquivados, de 18 para 19. Verificar com `tools/checks/change-lifecycle.test.ts`
  passando.
- [ ] 8.4 Executar `pnpm verify` sobre a árvore arquivada e confirmar os quatro
  estágios verdes. Verificar pela saída do comando, código de saída zero.
