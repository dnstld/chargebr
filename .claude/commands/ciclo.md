---
description: Abre um ciclo — cria a branch na convenção e pede a especificação ao gerente de produto.
argument-hint: [numero] [slug-em-ingles] [tipo opcional: feat|fix|docs|db|data|chore]
allowed-tools: Bash(git *) Read Grep Glob Agent
---

## Estado do repositório

```!
git status --short
git branch --show-current
git log --oneline -1
```

## O que fazer

Abra o ciclo `$1`, de nome `$2`, com o tipo `$3` (use `feat` se `$3` não vier).

1. Se a árvore não estiver limpa, **pare** e diga o que está pendente. Não
   descarte nada.
2. `git checkout main && git pull`
3. Crie a branch `<tipo>/$2` — nome em inglês, kebab-case, sem número, como
   manda a constituição. Se já existir, pare e diga.
4. Use o subagente `gerente-de-produto` para escrever
   `specs/$1-$2/spec.md`, a partir do backlog em
   `docs/decisao-criacao-da-interface.md`, no modelo de
   `docs/processo-de-desenvolvimento-sdd.md`.
5. Devolva para revisão humana: o número do ciclo, a branch criada, e os
   critérios de aceite em lista, para refino.

Não escreva código. Não avance para o desenho sem aceite explícito da spec.
