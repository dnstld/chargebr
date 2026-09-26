# Tarefas — cobertura da verificação

Ordem: primeiro, reproduzir as duas lacunas na árvore real, com a verificação
como está. Depois o guardião de fixture, depois o Biome, depois a prova da
checagem de tipos. Cada correção é provada contra o registro de antes.

## 1. Observação, antes de qualquer correção

- [x] 1.1 Com o guardião como está, plantar `apps/backoffice/fixtures/probe.ts` sem origem declarada e executar `tools/checks/fixture-origin.test.ts`; pronto quando o corpo do PR registra que o guardião passa verde com a fixture plantada — é o ponto 11 reproduzido e o antes da tarefa 2.2 —, e o plantio está revertido com `git status` limpo
- [x] 1.2 Com a construção feita, plantar `apps/backoffice/next-env.d.ts` fora do formato canônico e com `any` explícito, guardando cópia do arquivo gerado; pronto quando o corpo do PR registra `verify:format` e `verify:lint` falhando com o arquivo nomeado — o antes da tarefa 3.2 —, e o arquivo gerado está restaurado byte a byte
- [x] 1.3 Remover o `exclude` de `apps/backoffice/tsconfig.json`, executar `verify:types` e `tsc --noEmit -p apps/backoffice/tsconfig.json --listFilesOnly`; pronto quando o corpo do PR registra `verify:types` passando e a listagem contendo `next-env.d.ts`, `.next/types/routes.d.ts` e `.next/types/root-params.d.ts` — o antes da tarefa 4.2 —, e o plantio está revertido

## 2. Guardião de fixture em todo o perímetro (ponto 11)

- [x] 2.1 Em `tools/checks/fixture-origin.test.ts`, trocar o perímetro por `["packages", "apps"]`, com o mesmo tratamento de diretório inexistente de `type-suppression.test.ts`, acrescentar `.next` aos diretórios pulados e reescrever o comentário do perímetro; pronto quando o arquivo passa na árvore corrente com as duas afirmações existentes verdes e sem alteração nelas
- [x] 2.2 Plantar sob `apps/backoffice/fixtures/` uma fixture sem origem, uma com origem fora das duas conhecidas e uma sem nota; pronto quando `tools/checks/fixture-origin.test.ts` falha nomeando os três arquivos e o que falta em cada um, e os plantios estão revertidos
- [x] 2.3 Acrescentar uma aplicação descartável `apps/probe/` com `package.json` e uma fixture sem origem sob `apps/probe/fixtures/`, e guardar a saída de `git diff --stat tools/` antes do plantio; pronto quando o guardião falha nomeando `apps/probe/fixtures/…`, `git diff --stat tools/` sai igual ao guardado, e a aplicação descartável foi removida
- [x] 2.4 Com a construção feita, plantar uma fixture sem origem em `apps/backoffice/.next/fixtures/` e outra em `apps/backoffice/node_modules/.probe/fixtures/`; pronto quando `tools/checks/fixture-origin.test.ts` passa sem nomear nenhuma das duas, e os plantios estão revertidos

## 3. Formatação e lint respeitam o ignore do versionamento (ponto 4)

- [x] 3.1 Acrescentar a `biome.json` o bloco `vcs` com `enabled`, `clientKind: "git"` e `useIgnoreFile`, mantendo `!**/storybook-static` e `!**/.next` em `files.includes`; pronto quando `verify:format` e `verify:lint` passam, o corpo do PR registra a contagem de arquivos de cada etapa antes e depois, e a única diferença é `next-env.d.ts`
- [x] 3.2 Repetir o plantio de 1.2; pronto quando `verify:format` e `verify:lint` passam sem nomear `next-env.d.ts`, a saída é registrada no corpo do PR, e o arquivo gerado está restaurado byte a byte

## 4. Prova da checagem de tipos (ponto 4)

- [x] 4.1 Escrever `apps/backoffice/tests/type-stage-inputs.test.ts` com as três afirmações do design: artefatos presentes, enumeração dos pacotes do workspace, nenhum arquivo lido ignorado pelo versionamento. A listagem é feita pelo `tsc` da raiz com `--noEmit -p <pacote>/tsconfig.json --listFilesOnly`, e o ignore é decidido por `git check-ignore --stdin`, tratando `0` e `1` e reprovando em qualquer outro código; pronto quando o projeto de teste de `apps/backoffice` passa na árvore corrente, depois da construção, sem nenhuma afirmação pulada
- [x] 4.2 Remover o `exclude` de `apps/backoffice/tsconfig.json`; pronto quando `type-stage-inputs.test.ts` falha nomeando `apps/backoffice` e os três arquivos registrados em 1.3, `verify:types` continua passando e isso fica registrado no corpo do PR, e o plantio está revertido
- [x] 4.3 Desligar a construção em `apps/backoffice/tests/build.setup.ts` e remover `apps/backoffice/.next/` e `apps/backoffice/next-env.d.ts`; pronto quando `type-stage-inputs.test.ts` falha nomeando os dois caminhos ausentes, sem nenhuma afirmação reportada como pulada, e o plantio está revertido
- [x] 4.4 Plantar um pacote descartável `packages/probe/` com `package.json` e sem `tsconfig.json`; pronto quando `type-stage-inputs.test.ts` falha nomeando `packages/probe`, e o pacote descartável foi removido
- [x] 4.5 Executar `type-stage-inputs.test.ts` com `GIT_DIR` apontando para um diretório inexistente; pronto quando o teste falha exibindo a saída de erro do git, e não passa nem pula

## 5. Registros

- [x] 5.1 Atualizar `docs/pontos-abertos.md` como descrito no design. Os pontos 4 e 11 saem citando este ciclo, e o fechamento do 4 registra a correção medida sobre o `exclude`. Entram os pontos 12 e 13, cada um com gatilho. O cabeçalho ganha data e contagens; pronto quando o diff mostra as cinco mudanças e todo ponto presente tem gatilho

## 6. Fechamento

- [x] 6.1 Executar `pnpm verify` inteiro seguido de `git status`; pronto quando os quatro estágios passam, a lista de estágios é a mesma de antes, `git status` sai limpo, e o tempo do estágio de testes antes e depois está registrado no corpo do PR
- [x] 6.2 Executar a verificação duas vezes seguidas sobre a mesma árvore; pronto quando o resultado de cada estágio é idêntico nas duas execuções e `git status` sai limpo depois delas
- [x] 6.3 Registrar no corpo do PR que nenhum componente de `packages/ui` mudou, e que por isso não há história nova nem afirmação de acessibilidade a sustentar com axe; pronto quando `git diff --stat main` não lista nada sob `packages/` e o registro existe
- [x] 6.4 Registrar no corpo do PR o que continua em aberto: os pontos 12 e 13, e o reconhecimento de fixture pelo nome do diretório; pronto quando cada lacuna está no registro, com o gatilho que a reabre ou com a razão de não ter gatilho
