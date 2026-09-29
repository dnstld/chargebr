# Desenho — fechamento dos pontos abertos

## Context

`docs/pontos-abertos.md` tem oito pontos abertos hoje. Cada um foi medido
separadamente antes desta proposta; este design registra o que a medição
encontrou e a decisão que ela sustenta, ponto por ponto. Não há uma causa
comum entre eles — a única coisa que os une é que todos têm, agora, o que
precisam para sair do registro, por trabalho ou por reclassificação.

## Goals / Non-Goals

**Goals:**
- Fechar os pontos 5, 16, 17, 19 e 20 por trabalho, cada um com prova
  própria.
- Mover os pontos 1, 10 e 18 para `docs/forma-do-produto.md`, sem alterar
  texto nem gatilho.
- Deixar `docs/pontos-abertos.md` sem ponto aberto, arquivo íntegro.

**Non-Goals:**
- Corrigir o comportamento de `openspec validate --strict` (ponto 17 é
  sobre isso; a correção é de terceiro, fora do nosso alcance).
- Reescrever as ocorrências 3, 4 e 5 do ponto 16.
- Decidir qualquer pergunta de `docs/forma-do-produto.md` — mover os três
  pontos para lá não os resolve.

## Decisions

### Ponto 5 fecha por registro, não por reescrita

**O que foi medido:** `openspec/changes/archive/2026-09-26-tokens-obligation-form/proposal.md`
termina com a frase "Fecha o ponto 5 de `docs/pontos-abertos.md`", e o
delta de `design-tokens` daquele ciclo reescreve os três requisitos —
corpo só com obrigação, razão em `**Por quê:**`, as quatro frases que
decidiam piso sem `SHALL` viradas em obrigação explícita, duas frases que
usavam `SHALL` para instruir leitura (não para obrigar comportamento)
perdendo o `SHALL`. A spec viva de `design-tokens`, lida agora, contém
exatamente esse texto nos três requisitos — nenhuma divergência frase a
frase. `git log -- docs/pontos-abertos.md` não tem nenhum commit do
arquivamento de `tokens-obligation-form` (2026-09-26): o único commit
daquele dia tocando o arquivo é `3a1aec7`, do arquivamento de
`verification-coverage`. A conclusão é que o trabalho foi feito e o
registro nunca foi atualizado — um ponto aberto no arquivo que já estava
fechado no código.

**O que muda:** nada em `openspec/specs/design-tokens/spec.md`. No
arquivamento deste ciclo, o ponto 5 sai de "Pontos abertos" para
"Fechados" em `docs/pontos-abertos.md`, citando `tokens-obligation-form`
como o ciclo que fez o trabalho e este ciclo como o que corrigiu o
registro.

**O que faria mudar de ideia:** uma frase nos três requisitos vivos que
divergisse do delta de `tokens-obligation-form`, ou uma frase no corpo
(antes do primeiro `#### Scenario`) que decidisse algo sem `SHALL` e que
aquela proposta não tivesse revisado. Não encontrei nenhuma das duas. A
única lead-in sem `SHALL` que sobra é "Não há mecanismo de isenção:", em
"Superfícies de gráfico declaradas por tema" — mas ela não decide nada
sozinha: a obrigação que ela anuncia está na frase seguinte, no mesmo
parágrafo ("uma superfície neutra futura... SHALL ser varrida"), e
`tokens-obligation-form` já tratou desse requisito frase a frase sem
reescrevê-la. Reabrir essa frase agora seria reescrever conteúdo normativo
que ninguém pediu para reabrir — o próprio risco que o ponto 5 original
registrava.

### Ponto 19: o erro nunca foi o "browser pool" — foi o especificador de importação

**O que foi medido:** três tentativas anteriores (registradas no ponto 19
hoje) rodaram todas dentro do projeto de bancada existente
(`benchProject`, em `packages/ui/vitest.config.ts`), que usa
`storybookTest({ configDir })` — o complemento do Storybook, que executa
histórias no que o próprio addon chama de "browser pool" interno, por
cima do Vitest. Esta proposta isolou a variável: um projeto novo, **sem**
`storybookTest`, com só `browser: { enabled: true, provider: playwright(),
instances: [{ browser: "chromium" }] }` — modo nativo do Vitest, do jeito
que a própria documentação do Vitest descreve. Rodado assim, importar
`@vitest/browser/context` **ainda lança o mesmo erro**:

```
Error: vitest/browser can be imported only inside the Browser Mode.
Your test is running in browser pool. Make sure your regular tests are
excluded from the "test.include" glob pattern.
```

A mensagem diz "browser pool" mesmo fora do complemento do Storybook — o
`pool` relatado é literalmente a string `"browser"`
(`globalThis.__vitest_worker__.ctx.pool`), não o pool do addon. Isso já
descarta a causa registrada no ponto 19 (o complemento rodar num pool
próprio) como explicação suficiente. O arquivo que lança o erro é o
próprio pacote publicado:

```js
// node_modules/@vitest/browser/context.js
// Vitest resolves "vitest/browser" as a virtual module instead
// fake exports for static analysis
...
throw new Error('vitest/browser can be imported only inside the Browser Mode. ...')
```

O comentário nomeia a saída: `"vitest/browser"` é o especificador que o
Vitest substitui por um módulo virtual de verdade, só sob
`test.browser.enabled`; `@vitest/browser/context` é o pacote instalável,
que só existe para tipos, e cujo JS em tempo de execução é este stub que
sempre lança. Trocando a importação — `import { page } from
"vitest/browser"` —, no mesmo projeto isolado, sem o complemento:

```
largura 600  — offsetParent do gatilho: true
largura 1024 — offsetParent do gatilho: false
```

768px é o breakpoint declarado (`tokens.media.css`,
`@custom-media --screen-md (min-width: 768px)`). A sonda montou `AppFrame`
direto — `createRoot` de `react-dom/client`, sem Storybook, sem
`storybookTest` — com o slot `nav` preenchido (mesma composição de
`ComGatilhoDeNavegacao` em `app-frame.stories.tsx`), chamou
`page.viewport(600, 800)` e depois `page.viewport(1024, 800)`, e leu
`offsetParent` do botão do gatilho — `null` quando um ancestral está
`display: none`, o efeito observável de `@media (--screen-md) { .hamburger
{ display: none; } }`. A sonda foi revertida por inteiro (arquivo de
teste, projeto de config, dependência em `package.json`, lockfile); nada
dela está neste PR.

**Simplificação da sonda, e por que ela não altera o que está sendo
decidido:** a sonda não passou pelo Storybook nem pelos dois projetos de
tema (`vitest.setup.light.ts`/`.dark.ts`) — só montou o componente e leu
CSS computado. O que está sendo decidido é se a largura real da janela
tem efeito dentro de um projeto do Vitest deste workspace, não se a
história de tema passa; a montagem direta reproduz exatamente a forma que
decide isso — mesmo `AppFrame`, mesmo CSS Module, mesmo pipeline do
PostCSS raiz (a sonda não declarou `postcss.config` próprio, e a resolução
de `--screen-md` funcionou, confirmando que o mesmo mecanismo de D6 de
`interface-atomic-structure/design.md` alcança um projeto novo sem
configuração extra).

**O que muda:** um projeto novo em `packages/ui/vitest.config.ts` — nome
`viewport`, sem `storybookTest`, com `browser.enabled: true` do jeito
medido acima —, um arquivo de teste
(`packages/ui/src/organisms/app-frame/app-frame.viewport.test.tsx`) que
monta `AppFrame` com `nav` preenchido e prova o gatilho alcançável abaixo
de 768px e inalcançável a partir de 768px, e `@vitest/browser@5.0.1` como
dependência explícita de `packages/ui` (pnpm estrito não expõe pacote
transitivo; `vitest/browser` precisa dele resolvido a partir do próprio
pacote que o importa). `backoffice-shell` ganha um cenário novo no
requisito do gatilho, citando esta prova.

**Risco registrado, não eliminado:** a sonda rodou uma vez, localmente,
fora de CI. `verification-coverage` já mediu que Chromium sob CI se
comporta diferente de Chromium local sob carga (tempo, não resultado,
mas ainda uma diferença real). A tarefa de aplicação roda a prova nova
isolada e depois dentro de `pnpm verify` inteiro, e registra os dois
tempos no corpo do PR — se o CI divergir do que esta sonda mediu, a tarefa
para e o design é corrigido antes de seguir, não contornado com repetição
ou tempo limite maior (incidente já registrado em
`docs/incidente-instabilidade-da-bancada.md`).

**O que faria mudar de ideia:** a prova nova reprovando em CI por razão
diferente de tempo, ou `offsetParent` não distinguindo os dois lados do
breakpoint na execução real da tarefa (a sonda usou um clone da mesma
medição; um resultado diferente na aplicação é sinal de que algo no
ambiente de CI diverge do que a sonda mediu localmente, e a tarefa
correspondente registra a divergência em vez de insistir).

### Ponto 16: requisito de revisão, forma final

**O que foi medido:** as cinco ocorrências já estão nomeadas em
`docs/pontos-abertos.md` — cada uma é um caso em que a asserção passa
independentemente de o comportamento que ela alega provar existir. Não há
propriedade sintática comum às cinco: uma é sobre argumento de prop
(`aria-label` independente de `children`), uma é sobre estado de ambiente
(Chromium headless sem `prefers-reduced-motion` — removida do código
depois, quando o ponto 15 fechou por recusa), uma é sobre fixture sem o
caso plantado, uma é sobre garantia nativa do navegador independente da
lógica do componente, uma é sobre cobertura parcial de um booleano. Um
guardião estático teria que saber **o que o teste alega provar** para
julgar se o argumento escolhido torna isso vazio — essa informação não
está no código, está na intenção de quem escreveu o teste. Não é uma
lacuna de implementação; é o tipo de propriedade que este mecanismo de
verificação não alcança.

**Decisão:** o requisito novo, "Asserção prova o comportamento, não o
ambiente", em `verification-bench`, é provado por revisão nomeada, não
por execução. O critério de revisão em si precisa ser verificável, para
não repetir o próprio defeito que o requisito nomeia — um cenário cujo
"Prova" não prova nada seria um requisito tautológico sobre asserção
tautológica. O critério: para a garantia que uma asserção alega provar,
existe uma mutação mínima do comportamento — remover o efeito, inverter
a condição, trocar o valor — sob a qual a asserção, como está escrita,
continuaria passando? Se sim, ela é tautológica, e a revisão nomeia a
mutação que a descobriu — exatamente como as cinco ocorrências do ponto
16 foram encontradas. "Prova: revisão nomeada" no cenário aponta para essa
mutação, não para uma afirmação vaga de "parece certo".

**Desvio registrado de `rules.specs`:** a regra "Todo critério de aceite
nomeia o teste que o prova" pressupõe execução automatizável. Este
requisito não tem isso — é uma propriedade do desenho do teste contra a
intenção de quem o escreveu, não do comportamento renderizado. O desvio é
a forma final deste requisito, não uma lacuna a mecanizar depois; escrever
como se fosse mecanizável, sem sê-lo, seria o mesmo erro de outra forma.

### Guardião do ciclo de vida de mudanças (pontos 17 e 20)

**O que muda:** `tools/checks/change-lifecycle.test.ts`, no formato dos
quatro guardiões existentes — TypeScript lido pela árvore sintática
onde há árvore para ler; aqui, listagem de diretório e leitura de texto,
porque o que se verifica é presença de arquivo e estado de checkbox em
Markdown, não estrutura de código.

```
PERIMETER = openspec/changes/*  (exclui archive/)
ARTIFACTS = ["proposal.md", "design.md", "tasks.md"]

activeChanges(): lista os diretórios de primeiro nível sob
  openspec/changes/, exceto "archive"

missingArtifacts(change): para cada nome em ARTIFACTS, confere
  existsSync(change/<nome>); retorna os que faltam

tasksAllChecked(change): lê tasks.md linha a linha, coleta o que casa
  com /^\s*-\s\[([ xX])\]/; se não houver nenhuma linha assim, retorna
  false (nada para julgar como "concluído"); senão, retorna se todas
  casaram com "x" ou "X"

test("mudança ativa tem os três artefatos de planejamento")
  — violations = activeChanges().flatMap(c => missingArtifacts(c) tem
    algo ? [`${c} — falta ${…}`] : [])
  — expect(violations).toEqual([])

test("mudança ativa não tem todas as tarefas concluídas")
  — violations = activeChanges().filter(c => existsSync(c/tasks.md) &&
    tasksAllChecked(c)).map(c => `${c} — tarefas concluídas, não
    arquivada`)
  — expect(violations).toEqual([])
```

Hoje `openspec/changes/` não tem mudança ativa — as duas afirmações
passam por vacuidade, não por falta de alcance. A prova de que o guardião
alcança o que devia é uma tarefa de aplicação que planta os dois casos —
uma pasta com `tasks.md` faltando, uma pasta com todas as tarefas
marcadas — sob `openspec/changes/`, roda o guardião, confere que cada um
reprova nomeando a pasta e o que falta, e reverte o plantio. O mesmo
formato de prova que os quatro guardiões existentes já usam para o
próprio perímetro (fixture-origin, tarefa 2.2 de `verification-coverage`,
por exemplo) — plantio real, revertido, não fixture sintética dentro do
próprio arquivo de teste.

`.openspec.yaml` fica fora dos "três artefatos": a proposta que originou
este ciclo nomeou `proposal.md`, `design.md` e `tasks.md`, e
`.openspec.yaml` é metadado da ferramenta (`schema`, marcadores como
`skip_specs`), não um artefato de planejamento que alguém escreve e
revisa.

### Perímetro isolado passa a nomear o território, não `apps/*`/`packages/*`

**O que foi medido:** o requisito "Perímetro isolado", em
`workspace-verification`, diz hoje "A verificação SHALL cobrir
exclusivamente `apps/*` e `packages/*`, e SHALL NOT alcançar, alterar ou
reprovar conteúdo fora desse perímetro." O guardião novo lê
`openspec/changes/`, fora dos dois. Lido ao pé da letra, o requisito
reprovaria o próprio guardião que este ciclo escreve. O cenário existente
do requisito só prova o lado que importava até aqui — `src/`, `tests/`,
`data/`, `queries/`, `supabase/` (a frente de coleta) inalcançados —, e
CLAUDE.md já declara o território real por nome, no primeiro parágrafo:
"Este arquivo governa a frente de interface: `apps/`, `packages/`,
`openspec/`, `tools/` e a seção Interface de `docs/`." O requisito vivo
nunca foi atualizado para dizer isso — ele nasceu (ciclo
`fundacao-do-workspace`) quando `openspec/` e `tools/checks/` ainda não
existiam como território verificado por guardião próprio.

**Decisão:** o requisito passa a nomear `apps/*`, `packages/*`,
`openspec/` e `tools/` — os quatro, com a mesma razão que CLAUDE.md já
registra: território é o que é nosso, não uma lista do que não é. A seção
Interface de `docs/` fica fora da lista, porque nenhum estágio de
`pnpm verify` lê `docs/` hoje, nem este ciclo passa a ler — incluir um
diretório que nada alcança seria declarar mais do que a mudança prova.
Ganha um cenário novo provando que o guardião novo alcança
`openspec/changes/` legitimamente, ao lado do cenário existente que prova
`src/`/`tests/`/`data/`/`queries/`/`supabase/` fora de alcance — as duas
metades do mesmo requisito, positiva e negativa.

**Achado a registrar para quem revisar:** isto é uma leitura, não uma
descoberta de bug — nenhum guardião existente hoje sai de `apps/*`/
`packages/*`, então nada estava quebrado antes deste ciclo. O que mudaria
minha conclusão: se o dono do repositório preferir que o guardião novo
viva fora de `verify:test` (outro estágio, outro comando), o requisito
não precisa mudar — mas isso contradiz "quatro guardiões rodam dentro de
`verify:test`" de CLAUDE.md, que trata o formato como já decidido para
qualquer guardião novo.

## Risks / Trade-offs

- **A sonda do ponto 19 é local, não CI.** Registrado na decisão acima; a
  tarefa de aplicação mede em CI antes de fechar o ponto.
- **O requisito do ponto 16 é o primeiro, neste repositório, com prova só
  por revisão.** Se isso se mostrar difícil de aplicar em revisões
  futuras — critério ambíguo, revisor em dúvida sobre qual mutação testar
  —, é sinal para revisar o critério, não para forçar automação que a
  medição já descartou.
- **Mover os pontos 1, 10, 18 para `forma-do-produto.md` não é reversível
  sem custo:** um ciclo que precisar deles de volta em
  `pontos-abertos.md` teria que reescrever a passagem — mas o mesmo já
  vale ao contrário, e `forma-do-produto.md` é onde o dono do repositório
  decidiu que perguntas de forma do produto vivem.
