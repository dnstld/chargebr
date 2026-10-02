# Tasks

Este ciclo não escreve código, logo não há teste a entrar junto. A obrigação de
`rules.tasks` — toda tarefa com critério de pronto verificável por execução — é
cumprida por comando: o grupo 1 muda `openspec/config.yaml` e cada tarefa é
conferida lendo as regras **pela própria ferramenta** que as consome, não pelo
arquivo. O grupo 2 existe para que essa conferência seja **vista reprovar** antes
de ser aceita como verificação.

**Medido antes de escrever estas tarefas, e é por isso que a conferência é pelo
conteúdo e nunca pelo código de saída:** com `openspec/config.yaml` ilegível, a
CLI emite `Warning: could not parse ... ignoring it`, **sai com código 0** e
devolve `rules: []`. Um `pnpm verify` verde ou um comando que sai zero não
provariam nada aqui.

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
- [ ] 1.4 Confirmar que a mudança sem delta de spec continua válida com
  `skip_specs: true`. Verificar com
  `npx openspec validate proof-falsifiability --strict` passando.

## 2. A conferência do grupo 1 é vista reprovar

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

## 3. Portão e perímetro

- [ ] 3.1 Executar `pnpm verify` e confirmar os quatro estágios verdes.
  Verificar pela saída do comando e código de saída zero. **Esta tarefa não
  prova a mudança** — nenhum estágio de `pnpm verify` lê `rules.specs`; ela prova
  apenas que a mudança não quebrou nada.
- [ ] 3.2 Confirmar que o único arquivo alterado é `openspec/config.yaml`.
  Verificar com `git diff --name-only main` devolvendo exatamente essa linha.
- [ ] 3.3 Confirmar que nenhum guardião nasceu neste ciclo. Verificar com
  `ls tools/checks/*.test.ts | wc -l` devolvendo 6, e os nomes iguais aos de
  `main`.
- [ ] 3.4 Confirmar que `docs/pontos-abertos.md` não muda neste PR e que o ponto
  21 segue listado como aberto, intocado. Verificar com
  `git diff main -- docs/` vazio.
- [ ] 3.5 Confirmar que nenhum arquivo sob `openspec/specs/` muda. Verificar com
  `git diff main -- openspec/specs` vazio e
  `npx openspec validate --specs --strict` passando nas sete capacidades.

## 4. Arquivamento

As tarefas deste grupo rodam no terceiro PR do ciclo:
`tools/checks/change-lifecycle.test.ts` reprova uma mudança ativa com todas as
tarefas marcadas, e é essa reprovação que obriga o arquivamento a acontecer.

- [ ] 4.1 Arquivar a mudança: mover `openspec/changes/proof-falsifiability/` para
  `openspec/changes/archive/<data>-proof-falsifiability/`. **Sem sincronização de
  spec viva** — a mudança declara `skip_specs: true` e não tem delta, de modo que
  não há nada a sincronizar; o "Sync now" do fluxo de arquivamento não se aplica
  a este ciclo, e isso é a consequência direta de D1. Verificar com
  `npx openspec validate --specs --strict` passando nas sete capacidades, sem
  requisito novo, e `git diff --name-only main -- openspec/specs` vazio.
- [ ] 4.2 Atualizar o cabeçalho de `docs/pontos-abertos.md` — data, estado do
  repositório e contagem de ciclos arquivados, de 17 para 18 — no **mesmo
  commit** do movimento para `archive/`, registrando que este ciclo não fecha
  nem abre ponto nenhum e que o 21 segue aberto sem alteração. Verificar com
  `tools/checks/change-lifecycle.test.ts` passando.
- [ ] 4.3 Executar `pnpm verify` sobre a árvore arquivada e confirmar os quatro
  estágios verdes. Verificar pela saída do comando, código de saída zero.
