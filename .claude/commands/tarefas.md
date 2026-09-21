---
description: Portão 3 — quebra um desenho aceito em tarefas pequenas com dono único.
argument-hint: [pasta da spec, ex 0001-fundacao-do-workspace]
allowed-tools: Bash(git *) Read Grep Glob Agent
---

## Entradas

@specs/$1/spec.md
@specs/$1/desenho.md

## O que fazer

1. **Confira que o portão 2 fechou.** O desenho precisa estar aceito. Se não
   estiver, pare e diga.
2. Use o subagente `gerente-de-produto` para escrever `specs/$1/tarefas.md`.
3. Cada tarefa precisa de: identificador, **um dono único**, entradas, saída
   esperada e critério de pronto verificável. Tarefa que precisa de dois donos
   está mal quebrada — quebre de novo.
4. Marque com `[P]` as tarefas que podem rodar em paralelo, isto é, as que
   tocam arquivos disjuntos.
5. Amarre cada tarefa aos critérios de aceite que ela fecha, por identificador.
6. Devolva a lista para revisão humana, indicando quais tarefas são `[P]` e em
   que ordem as demais precisam acontecer.

Não implemente nenhuma tarefa. A condição de parada é `tarefas.md` entregue.
