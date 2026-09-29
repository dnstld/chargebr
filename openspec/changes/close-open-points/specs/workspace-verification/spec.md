# Spec Delta

## MODIFIED Requirements

### Requirement: Perímetro isolado

A verificação SHALL cobrir `apps/*`, `packages/*`, `openspec/` e `tools/` —
o território da frente de interface declarado em CLAUDE.md — e SHALL NOT
alcançar, alterar ou reprovar conteúdo fora dele.

#### Scenario: Conteúdo herdado não é verificado nem alterado

- **WHEN** a verificação é executada com o repositório contendo `src/`, `tests/`, `data/`, `queries/` e `supabase/`
- **THEN** nenhum arquivo desses diretórios é lido pela verificação, alterado ou reportado
- **Prova:** execução com árvore herdada presente, `git status` limpo ao final

#### Scenario: Os scripts herdados continuam funcionando

- **WHEN** os scripts `collect` e `test` da raiz são executados depois da conversão em workspace
- **THEN** ambos se comportam exatamente como antes da conversão
- **Prova:** execução dos dois scripts antes e depois, com comparação de saída e código de saída

#### Scenario: Um guardião pode alcançar `openspec/changes/` legitimamente

- **WHEN** um guardião sob `tools/checks/` lê `openspec/changes/` para verificar o estado de uma mudança
- **THEN** essa leitura não é uma violação do perímetro — `openspec/` está dentro do território declarado
- **Prova:** `tools/checks/change-lifecycle.test.ts` executado sobre a árvore corrente, sem reprovar por alcance

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
