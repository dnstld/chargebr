---
description: Faz push da branch e abre o pull request com o corpo no padrão do repositório.
argument-hint: [titulo opcional; por padrão usa o commit principal]
allowed-tools: Bash(git *) Bash(gh *) Read Grep Glob
---

## Contexto da branch

```!
git branch --show-current
git log --oneline main..HEAD
git diff main...HEAD --stat
```

## O que fazer

1. Se a árvore não estiver limpa, pare e diga o que falta commitar.
2. `git push -u origin <branch-atual>`
3. Monte o corpo do PR **no padrão do repositório**, com estas seções nesta
   ordem, em PT-BR:
   - `## Resumo` — bullets em minúscula terminados em ponto e vírgula;
   - `## Estado atual confirmado` — fatos verificados, não intenções;
   - `## Decisão operacional` — só quando houver escolha que precise de
     justificativa;
   - `## Escopo` — um parágrafo dizendo o que o PR é **e o que ele não faz**,
     com as negativas explícitas;
   - `## Verificação` — bullets do que foi efetivamente conferido.
4. Título: `$1` se vier; senão, o assunto do commit principal — inglês, uma
   linha, `<tipo>: <ação em imperativo>`.
5. Abra o PR com `gh pr create`. Se o `gh` não existir ou não estiver
   autenticado, **não tente instalar nada**: imprima o título, o corpo pronto
   para colar e a URL de comparação do GitHub.
6. Devolva o link do PR.

Nunca faça merge. O merge é sempre da pessoa supervisora.
