---
description: Roda a verificação tripla — pareceres de código, acessibilidade e qualidade sobre o que está na branch.
argument-hint: [spec opcional, ex 01-workspace-foundation]
allowed-tools: Bash(git *) Read Grep Glob Agent
---

## Mudanças em revisão

```!
git diff main...HEAD --stat
git log --oneline main..HEAD
```

## O que fazer

Dispare os três pareceres da verificação tripla sobre as mudanças acima,
**em paralelo**, contra a spec e o desenho de `specs/$1` quando informado:

- subagente `revisor-de-codigo` — correção, legibilidade, manutenibilidade,
  aderência ao contrato do desenho;
- subagente `especialista-em-acessibilidade` — teclado, foco, nome acessível,
  papel, estado, contraste;
- subagente `engenheiro-de-qualidade` — cobertura dos estados declarados,
  determinismo, regressão.

Depois, apresente uma tabela única com agente, veredito e o resumo de cada
achado.

Regras que você não pode afrouxar:

- `não demonstrado` conta como reprovação e bloqueia.
- Nenhum dos três corrige o que aponta. Se houver reprovação, o retorno é para
  quem implementou.
- Só declare pronto para PR quando os três aprovarem.
