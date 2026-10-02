# Tasks

A obrigação de `rules.tasks` — toda tarefa com critério de pronto verificável por
execução — é cumprida de dois modos neste ciclo. O grupo 1 muda
`openspec/config.yaml` e é conferido lendo as regras **pela própria ferramenta**
que as consome, não pelo arquivo; o grupo 2 existe para que essa conferência seja
**vista reprovar** antes de ser aceita. O grupo 3 escreve o guardião, que é o
único código do ciclo, com teste e plantio próprios.

**Medido antes de escrever estas tarefas, e é por isso que a conferência é pelo
conteúdo e nunca pelo código de saída:** com `openspec/config.yaml` ilegível, os
comandos de autoria (`openspec instructions`, `openspec context`) emitem
`Warning: could not parse ... ignoring it`, **saem com código 0** e devolvem
`rules: []`; os comandos `openspec validate --specs --strict` e `openspec list`
passam **sem nenhum aviso**, também com código 0. Um comando que sai zero não
prova nada aqui.

**Ordem obrigatória:** o grupo 3 vem depois do grupo 1, porque a contagem que o
guardião declara para `specs` é 8 — o número de depois das duas entradas novas.

## 1. As duas entradas em `rules.specs`

- [ ] 1.1 Acrescentar a entrada do plantio em `openspec/config.yaml`, em
  `rules.specs`, **imediatamente depois** de "Todo critério de aceite nomeia o
  teste que o prova", com o texto literal de `design.md`, seção "Texto proposto,
  literal". Verificar com
  `npx openspec instructions specs --change proof-falsifiability --json`
  devolvendo `rules` com **sete** entradas e a entrada nova na **posição 3**,
  logo após a de nomear o teste, com o texto idêntico caractere a caractere ao do
  design.
- [ ] 1.2 Acrescentar a entrada da lista declarada à mão imediatamente depois da
  do plantio, com o texto literal do design. Verificar com o mesmo comando
  devolvendo `rules` com **oito** entradas, a da lista na **posição 4**, e as
  seis entradas originais inalteradas — conferidas uma a uma contra
  `git show main:openspec/config.yaml`.
- [ ] 1.3 Confirmar que nada fora de `rules.specs` mudou: `context`,
  `rules.proposal`, `rules.design`, `rules.tasks` e `operations` ficam idênticos.
  Verificar com `git diff main -- openspec/config.yaml` mostrando **duas linhas
  acrescentadas e nenhuma linha alterada ou removida**.
- [ ] 1.4 Confirmar que a mudança continua válida com o delta de
  `workspace-verification` e sem `skip_specs`. Verificar com
  `npx openspec validate proof-falsifiability --strict` passando.

## 2. A conferência do grupo 1 é vista reprovar

Este grupo prova que a conferência do grupo 1 funciona, e **só isso**: ele é um
ato do ciclo e morre no arquivamento. O que fica vigente sobre o arquivo é o
guardião do grupo 3 — plantio prova que a conferência roda, não deixa nada de pé
(design, D4).

- [ ] 2.1 Plantar uma aspa não fechada no fim de `rules.specs` e confirmar que a
  conferência de 1.2 reprova: o comando devolve `rules` com **zero** entradas e
  imprime o aviso de parse nomeando `openspec/config.yaml`. Reverter o plantio e
  confirmar as oito entradas de volta.
- [ ] 2.2 Plantar a entrada do plantio **antes** da de nomear o teste e confirmar
  que a conferência de posição de 1.1 reprova, nomeando a posição encontrada.
  Reverter o plantio e confirmar a ordem de D6 do design.
- [ ] 2.3 Registrar as duas reprovações e as duas reversões no corpo do pull
  request, na seção `## Verificação`, com a saída de cada comando. Verificar pela
  presença das quatro execuções no texto do PR antes de pedir o merge.

## 3. O guardião do arquivo de regras

- [ ] 3.1 Acrescentar `yaml` a `devDependencies` do `package.json` da raiz, sem
  tocar nenhum script. Verificar com `pnpm install` concluindo,
  `node --input-type=module -e "import('yaml').then(()=>console.log('ok'))"`
  imprimindo `ok` da raiz, e `git diff package.json` mostrando apenas a linha da
  dependência.
- [ ] 3.2 Escrever `tools/checks/config-rules.test.ts` com as quatro afirmações de
  D7: o arquivo parseia; o conjunto de seções declarado (`proposal`, `specs`,
  `design`, `tasks`) é igual ao descoberto sob `rules:`; nenhuma dessas seções
  está vazia; a contagem de cada uma bate com a declarada (`proposal` 2,
  `specs` 8, `design` 11, `tasks` 2). A mensagem de falha de cada uma nomeia o que
  D7 manda nomear. Verificar com o arquivo passando dentro de `pnpm verify` e a
  contagem lida de cada seção impressa na execução.
- [ ] 3.3 Plantar uma aspa não fechada em `openspec/config.yaml` e confirmar que o
  guardião reprova nomeando o arquivo e o erro do parser. Transcrever a mensagem,
  reverter o plantio e confirmar o guardião verde de novo.
- [ ] 3.4 Esvaziar uma seção de `rules` por plantio e confirmar que o guardião
  reprova nomeando a seção vazia. Transcrever a mensagem, reverter o plantio e
  confirmar o guardião verde de novo.
- [ ] 3.5 Plantar uma seção nova sob `rules:` sem declará-la no guardião e
  confirmar que ele reprova nomeando a seção descoberta e não coberta — a prova de
  cobertura da regra 2 aplicada à lista do próprio guardião. Transcrever a
  mensagem, reverter o plantio e confirmar o guardião verde de novo.
- [ ] 3.6 Remover uma entrada de uma seção por plantio e confirmar que o guardião
  reprova nomeando a seção, a contagem esperada e a lida. Transcrever a mensagem,
  reverter o plantio e confirmar o guardião verde de novo.
- [ ] 3.7 Acrescentar a linha do guardião novo ao inventário de `CLAUDE.md`, seção
  "Perímetros", no formato das outras seis, e atualizar a frase que diz "seis
  guardiões" para sete. Verificar lendo a seção e conferindo que as seis linhas
  existentes não mudaram, com `git diff CLAUDE.md`.
- [ ] 3.8 Confirmar que o guardião não lê conteúdo de regra nenhuma. Verificar por
  leitura do arquivo: nenhuma comparação contra texto de regra, só contra nome de
  seção e contagem.

## 4. Portão e perímetro

- [ ] 4.1 Executar `pnpm verify` e confirmar os quatro estágios verdes, com o
  guardião novo entre os testes coletados. **Antes deste ciclo esta tarefa não
  provaria a mudança** — nenhum estágio lia `openspec/config.yaml`; com o guardião
  do grupo 3 ela passa a provar a integridade do arquivo, e nada além disso. Verificar pela saída do comando, código
  de saída zero, e a contagem de arquivos de teste subindo de 72 para 73.
- [ ] 4.2 Confirmar que os arquivos alterados são exatamente estes quatro:
  `openspec/config.yaml`, `tools/checks/config-rules.test.ts`, `CLAUDE.md` e
  `package.json` (mais `pnpm-lock.yaml`, pela dependência). Verificar com
  `git diff --name-only main`.
- [ ] 4.3 Confirmar que o inventário de guardiões bate com o disco. Verificar com
  `ls tools/checks/*.test.ts | wc -l` devolvendo 7 e os sete nomes iguais aos sete
  do inventário de `CLAUDE.md`.
- [ ] 4.4 Confirmar que `docs/pontos-abertos.md` não muda neste PR e que o ponto
  21 segue listado como aberto, intocado. Verificar com `git diff main -- docs/`
  vazio.
- [ ] 4.5 Confirmar que nenhum arquivo sob `openspec/specs/` muda neste PR — o
  delta só é aplicado no arquivamento. Verificar com
  `git diff main -- openspec/specs` vazio.
- [ ] 4.6 Confirmar que nada sob `apps/` ou `packages/` muda. Verificar com
  `git diff --stat main -- apps packages` vazio.

## 5. Arquivamento

As tarefas deste grupo rodam no terceiro PR do ciclo:
`tools/checks/change-lifecycle.test.ts` reprova uma mudança ativa com todas as
tarefas marcadas, e é essa reprovação que obriga o arquivamento a acontecer.

- [ ] 5.1 Arquivar a mudança **com sincronização da spec viva**: mover
  `openspec/changes/proof-falsifiability/` para
  `openspec/changes/archive/<data>-proof-falsifiability/` e aplicar o delta de
  `workspace-verification` em `openspec/specs/`. Verificar com
  `npx openspec validate --specs --strict` passando nas sete capacidades e o
  requisito novo presente em `openspec/specs/workspace-verification/spec.md` com
  os cinco cenários.
- [ ] 5.2 Atualizar o cabeçalho de `docs/pontos-abertos.md` — data, estado do
  repositório e contagem de ciclos arquivados, de 17 para 18 — no **mesmo commit**
  do movimento para `archive/`, registrando que este ciclo não fecha nem abre
  ponto nenhum e que o 21 segue aberto sem alteração. Verificar com
  `tools/checks/change-lifecycle.test.ts` passando.
- [ ] 5.3 Executar `pnpm verify` sobre a árvore arquivada e confirmar os quatro
  estágios verdes, com o guardião novo passando contra o arquivo de regras já na
  forma final. Verificar pela saída do comando, código de saída zero.
