# Tarefas — fechamento dos pontos abertos

Ordem: guardião do ciclo de vida primeiro (não depende de mais nada),
depois o perímetro que ele exige, depois o requisito de revisão (sem
código), depois o harness de viewport (o mais arriscado — a sonda foi
medida fora de CI), depois o fechamento, depois os registros de
arquivamento.

## 1. Guardião do ciclo de vida de mudanças OpenSpec (pontos 17 e 20, mais um terceiro cheque)

- [x] 1.1 Escrever `tools/checks/change-lifecycle.test.ts` conforme o
      design: `activeChanges()`, `missingArtifacts()`, `tasksAllChecked()`,
      duas afirmações sobre mudança ativa. Pronto quando o arquivo passa
      sobre a árvore corrente (`openspec/changes/` sem mudança ativa
      hoje), as duas afirmações verdes por vacuidade.
- [x] 1.2 Plantar `openspec/changes/probe-lifecycle/` com `proposal.md` e
      `tasks.md`, sem `design.md`; rodar o guardião. Pronto quando ele
      reprova nomeando `openspec/changes/probe-lifecycle` e `design.md`, e
      o plantio está revertido.
- [x] 1.3 Plantar `openspec/changes/probe-lifecycle/` com os três
      artefatos e `tasks.md` com todas as linhas de checkbox marcadas
      `[x]`; rodar o guardião. Pronto quando ele reprova nomeando
      `openspec/changes/probe-lifecycle`, e o plantio está revertido.
- [x] 1.4 Plantar `openspec/changes/probe-lifecycle/` com os três
      artefatos e `tasks.md` sem nenhuma linha de checkbox; rodar o
      guardião. Pronto quando ele passa para essa mudança, e o plantio
      está revertido.
- [x] 1.5 Confirmar, no corpo do PR, que `archive/` com mudanças 100%
      concluídas (as 14 hoje arquivadas) não é varrido pelas duas
      primeiras afirmações — rodar o guardião e registrar que nenhuma
      delas aparece nas violações.
- [x] 1.6 Escrever `declaredClosedPoints()` e `stillOpenPoints()`
      conforme o design, e a terceira afirmação. Pronto quando o arquivo
      passa sobre a árvore corrente — condição de passagem real, não
      vacuidade: as 14 mudanças arquivadas declaram fechar pontos, e
      `docs/pontos-abertos.md`, na árvore desta tarefa (antes do registro
      da seção 6), ainda lista os pontos 5, 16, 17, 19 e 20 como abertos.
      Isso é esperado reprovar aqui — ver 1.7.
- [x] 1.7 Rodar o guardião completo nesta árvore (antes do registro da
      seção 6) e registrar, no corpo do PR, que a terceira afirmação
      reprova nomeando o ponto 5 e `tokens-obligation-form` — a prova viva
      do achado que motivou este cheque. Depois da seção 6 mover os
      cinco pontos para "Fechados", repetir e confirmar que passa.
- [x] 1.8 Plantar uma mudança arquivada descartável
      (`openspec/changes/archive/9999-01-01-probe-registry/proposal.md`)
      com a frase "Fecha o ponto 9999 de `docs/pontos-abertos.md`.", e
      plantar um ponto 9999 aberto em `docs/pontos-abertos.md`; rodar o
      guardião. Pronto quando ele reprova nomeando o ponto 9999 e
      `probe-registry`, e os dois plantios estão revertidos.

## 2. Perímetro do `workspace-verification` (ponto 17/20, efeito colateral)

- [x] 2.1 Confirmar que os quatro guardiões existentes
      (`fixture-origin`, `component-vocabulary`, `style-literals`,
      `type-suppression`) continuam com o mesmo alcance —
      `git diff --stat` deles vazio. Pronto quando registrado no corpo do
      PR.
- [x] 2.2 Confirmar, no corpo do PR, que o requisito "Perímetro isolado"
      reescrito (exclusão nomeada de `src/`, `tests/`, `data/`, `queries/`,
      `supabase/`) continua provado pelos dois cenários existentes, sem
      cenário novo — `tools/checks/change-lifecycle.test.ts` lendo
      `openspec/changes/` não precisa de prova de permissão, porque o
      requisito corrigido nunca o proíbe.

## 3. Requisito de revisão (ponto 16) — sem código

- [x] 3.1 Reler o requisito "Asserção prova o comportamento, não o
      ambiente" contra as cinco ocorrências nomeadas em
      `docs/pontos-abertos.md`; pronto quando o corpo do PR registra, para
      cada uma das cinco, qual mutação a desqualificaria como prova — o
      mesmo exercício que o requisito pede de qualquer revisão futura,
      aplicado a ele mesmo antes de declará-lo pronto.
- [x] 3.2 Registrar no corpo do PR que este requisito não tem tarefa de
      código: a spec delta já é o artefato completo, e nenhuma correção
      das ocorrências 3, 4 e 5 está incluída (registrado como não-escopo
      na proposta).

## 4. Viewport real na bancada do `AppFrame` (ponto 19)

- [x] 4.1 Adicionar `@vitest/browser@5.0.1` como `devDependency` explícita
      de `packages/ui/package.json`. Pronto quando `pnpm install` resolve
      sem novo aviso de peer dependency além do já registrado (D4,
      `lucide-react`/`vitest` 5).
- [x] 4.2 Criar o projeto `viewport` em `packages/ui/vitest.config.ts` —
      sem `storybookTest`, `browser.enabled: true`,
      `provider: playwright()`, `instances: [{ browser: "chromium" }]` —
      e `packages/ui/src/organisms/app-frame/app-frame.viewport.test.tsx`,
      montando `AppFrame` com `nav` preenchido (mesma composição de
      `ComGatilhoDeNavegacao`), importando `page` de `"vitest/browser"` (não
      `@vitest/browser/context`), localizando o gatilho por
      `page.getByRole("button", { name: "Abrir menu" })` — não por
      `offsetParent` depois de um `querySelector`. Pronto quando
      `vitest run --project viewport` passa isolado, medindo o gatilho
      alcançável 1px abaixo do breakpoint e inalcançável 1px acima (testar
      exatamente em cima do valor do breakpoint reprovou por timeout na
      aplicação — registrado no design). Contraprova: com a regra CSS do
      breakpoint removida por plantio, o teste reprova; revertido o
      plantio, volta a passar — registrar os dois no corpo do PR.
- [x] 4.3 Rodar `pnpm verify` inteiro. Pronto quando os quatro estágios
      passam, o projeto `viewport` aparece na saída do estágio de testes,
      e o tempo desse projeto está registrado no corpo do PR.
- [ ] 4.4 Rodar a verificação em CI (push da branch, sem merge). Pronto
      quando o corpo do PR registra o resultado do estágio de testes em
      CI para o projeto `viewport` — se divergir do medido localmente
      (tarefa 4.2), esta tarefa para aqui, o design é corrigido com a
      medição nova, e as tarefas 4.2–4.3 e a spec delta de
      `backoffice-shell` são revisadas antes de continuar. Não seguir por
      suposição de que "deve funcionar igual".
- [x] 4.5 Registrar no corpo do PR que nenhum componente de produção
      (`app-frame.tsx`, `app-frame.module.css`) mudou — só o arquivo de
      teste e a configuração do Vitest são novos.
- [x] 4.6 Acrescentada depois de rodar a sonda pela primeira vez como
      teste de verdade, e não planejada: o modo nativo de navegador do
      Vitest grava capturas de tela de falha em `packages/ui/.vitest/`, e
      nada no repositório ignorava esse diretório — apareceu como
      conteúdo não versionado depois da primeira falha da tarefa 4.2
      (arredondamento do breakpoint, corrigida ali). `.vitest/` entra em
      `.gitignore` da raiz, no mesmo formato de `.next/` e
      `storybook-static/`; pronto quando `git check-ignore -v` confirma o
      caminho ignorado e `pnpm verify` continua passando.

## 5. Fechamento

- [x] 5.1 Executar `pnpm verify` inteiro seguido de `git status`; pronto
      quando os quatro estágios passam, a lista de estágios é a mesma de
      antes (mais o conteúdo dos projetos novos dentro do estágio de
      testes, sem estágio novo), e `git status` sai limpo.
- [x] 5.2 Executar a verificação duas vezes seguidas sobre a mesma árvore;
      pronto quando o resultado de cada estágio é idêntico nas duas
      execuções.
- [x] 5.3 Confirmar que nenhum arquivo sob `src/`, `tests/`, `data/`,
      `queries/`, `supabase/` foi lido, alterado ou relatado — `git diff
      --stat main` não lista nada sob esses diretórios.

## 6. Registros (no arquivamento — `docs/archive-close-open-points`)

- [ ] 6.1 Mover o ponto 5 para "Fechados" em `docs/pontos-abertos.md`,
      citando `tokens-obligation-form` como o ciclo que fez o trabalho e
      este ciclo como o que corrigiu o registro — conforme o design.
- [ ] 6.2 Mover os pontos 16, 17, 19 e 20 para "Fechados", cada um citando
      `close-open-points` e o que especificamente fechou (o requisito de
      revisão; o guardião; o cenário de viewport, condicional à tarefa
      4.4; o guardião, para a metade de 20).
- [ ] 6.3 Mover os pontos 1, 10 e 18 de `docs/pontos-abertos.md` para
      `docs/forma-do-produto.md`, texto e gatilho preservados por inteiro,
      registrando nos dois lados por que o registro mudou de arquivo.
- [ ] 6.4 Atualizar o cabeçalho de `docs/pontos-abertos.md`: contagem de
      ciclos arquivados, "nenhum ponto aberto", data. Pronto quando o
      diff mostra as oito mudanças (cinco fechamentos, três remoções por
      reclassificação) e o arquivo não lista nenhum ponto aberto
      remanescente.
- [ ] 6.5 Sincronizar as specs vivas — `workspace-verification`,
      `verification-bench`, `backoffice-shell` — a partir dos deltas
      deste change ("Sync now"). Se a tarefa 4.4 tiver parado a spec
      delta de `backoffice-shell` e o requisito de `verification-bench`
      sobre viewport, este passo sincroniza só o que não foi retirado, e
      o ponto 19 permanece registrado como aberto, com a medição nova.
