# Spec Delta

## MODIFIED Requirements

### Requirement: Perímetro isolado

A verificação SHALL NOT alcançar, alterar ou reprovar conteúdo sob `src/`,
`tests/`, `data/`, `queries/` ou `supabase/` — a árvore da frente de coleta.

**Por quê:** o texto anterior ("cobre exclusivamente `apps/*` e
`packages/*`") descrevia uma inclusão que nenhum mecanismo aplica — cada
guardião de `tools/checks/` monta seu próprio caminho a partir da raiz do
repositório (`ROOT = fileURLToPath(new URL("../../", import.meta.url))`) e
escolhe seu próprio perímetro; nada estrutural impede um guardião de ler
outra coisa. O que a verificação de fato garante, e o único cenário deste
requisito sempre provou, é que ela não toca a árvore de outra frente —
`src/`, `tests/`, `data/`, `queries/`, `supabase/`, mantidas por processo
próprio, fora de `apps/`, `packages/`, `openspec/` e `tools/`. Nomear essa
exclusão, pequena e estável, é mais preciso do que listar tudo que a
verificação alcança — essa segunda lista cresce a cada guardião novo (o
guardião do ciclo de vida de mudanças, abaixo, é o caso mais recente) e
precisaria ser reescrita a cada vez, o mesmo risco que motivou o próprio
requisito. Ler `openspec/changes/` deixa de ser assunto deste requisito:
não é uma inclusão nova, é a ausência de proibição.

#### Scenario: Conteúdo herdado não é verificado nem alterado

- **WHEN** a verificação é executada com o repositório contendo `src/`, `tests/`, `data/`, `queries/` e `supabase/`
- **THEN** nenhum arquivo desses diretórios é lido pela verificação, alterado ou reportado
- **Prova:** execução com árvore herdada presente, `git status` limpo ao final

#### Scenario: Os scripts herdados continuam funcionando

- **WHEN** os scripts `collect` e `test` da raiz são executados depois da conversão em workspace
- **THEN** ambos se comportam exatamente como antes da conversão
- **Prova:** execução dos dois scripts antes e depois, com comparação de saída e código de saída

## ADDED Requirements

### Requirement: Mudança OpenSpec ativa tem os três artefatos de planejamento

Toda mudança sob `openspec/changes/`, fora de `archive/`, SHALL conter
`proposal.md`, `design.md` e `tasks.md`. Ausência de qualquer um dos três
SHALL reprovar a verificação, nomeando a mudança e o artefato que falta.

**Por quê:** `openspec validate --strict` aprova uma mudança sem `design.md`
nem `tasks.md` — medido em `docs/pontos-abertos.md`, ponto 17. A ferramenta
que gera esse veredito é de terceiro; este requisito é o substituto que este
repositório controla.

#### Scenario: Mudança ativa sem um artefato reprova

- **WHEN** uma mudança sob `openspec/changes/` não tem `design.md` ou `tasks.md`
- **THEN** a verificação falha, nomeando a mudança e o artefato ausente
- **Prova:** mudança plantada sem um dos três artefatos, verificação falhando, plantio revertido

### Requirement: Mudança com tarefas concluídas não permanece em `changes/`

Uma mudança sob `openspec/changes/`, fora de `archive/`, cujo `tasks.md`
declare pelo menos uma tarefa e todas marcadas concluídas, SHALL reprovar a
verificação, nomeando a mudança.

**Por quê:** medido em `button-variants` — 22/22 tarefas concluídas e código
mergeado, e a mudança permaneceu em `changes/`, sem síntese entre "tarefas
completas" e "specs vivas desatualizadas", até alguém ir procurar
(`docs/pontos-abertos.md`, ponto 20). Uma mudança sem nenhuma tarefa
marcável (`tasks.md` sem checkbox) não é julgada por este requisito — não
há o que significar "concluída" nela.

#### Scenario: Mudança com todas as tarefas concluídas reprova

- **WHEN** uma mudança sob `openspec/changes/` tem `tasks.md` com todas as tarefas marcadas `[x]`
- **THEN** a verificação falha, nomeando a mudança
- **Prova:** mudança plantada com `tasks.md` inteiramente marcado, verificação falhando, plantio revertido

#### Scenario: Mudança sem tarefa marcável não reprova

- **WHEN** uma mudança sob `openspec/changes/` tem `tasks.md` sem nenhuma linha de checkbox
- **THEN** a verificação passa para essa mudança, quanto a este requisito
- **Prova:** mudança plantada com `tasks.md` sem checkbox, verificação passando, plantio revertido

### Requirement: Ponto declarado fechado por mudança arquivada não continua aberto no registro

Se o `proposal.md` de uma mudança sob `openspec/changes/archive/` declarar
fechar um ponto de `docs/pontos-abertos.md`, nomeado por número, esse
número SHALL NOT constar entre os pontos abertos do arquivo. Encontrar os
dois SHALL reprovar a verificação, nomeando o ponto e a mudança arquivada
que declarou fechá-lo.

**Por quê:** medido nesta própria proposta — o ciclo `tokens-obligation-form`
arquivou declarando "Fecha o ponto 5 de `docs/pontos-abertos.md`", e o
registro nunca foi atualizado; o ponto continuou aberto até esta mudança
encontrar a divergência por leitura manual. Ao contrário do ponto 16 (que
depende de saber a intenção de um teste, não mecanizável), esta é
comparação entre duas listas que já existem por escrito — o número que uma
mudança arquivada declara fechar, e os números que `docs/pontos-abertos.md`
ainda lista como abertos —, mecanicamente detectável.

#### Scenario: Ponto declarado fechado mas ainda aberto reprova

- **WHEN** uma mudança arquivada declara, no `proposal.md`, fechar um ponto, e esse número de ponto ainda consta como aberto em `docs/pontos-abertos.md`
- **THEN** a verificação falha, nomeando o ponto e a mudança arquivada
- **Prova:** mudança arquivada plantada com essa declaração, ponto correspondente plantado como aberto em `docs/pontos-abertos.md`, verificação falhando, os dois plantios revertidos
