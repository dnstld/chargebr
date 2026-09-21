---
description: Portão 2 — cria a branch do desenho e produz desenho.md a partir de uma spec aceita.
argument-hint: [pasta da spec, ex 0001-fundacao-do-workspace]
allowed-tools: Bash(git *) Read Grep Glob Agent
---

## Estado

```!
git status --short
git branch --show-current
```

## Spec de entrada

@specs/$1/spec.md

## O que fazer

1. **Confira que o portão 1 fechou.** A spec acima precisa estar em
   `ACEITA — AGUARDANDO MERGE` com a tabela de resultado preenchida e
   `` `ACCEPTED` ``, e precisa estar na `main`. Se não estiver, **pare** e diga
   o que falta. Não produza desenho sobre spec não aceita.
2. Árvore suja: pare e diga o que está pendente.
3. `git checkout main && git pull`
4. Crie a branch do portão 2: `docs/<slug-em-ingles>-design`, derivando o slug
   do nome da spec. Uma branch por portão — o desenho nunca compartilha branch
   com a implementação.
5. Escolha o subagente dono do desenho pelo objeto da spec:
   - tokens, contrato de componente, camada atômica → `arquiteto-de-design-system`
   - ferramenta, build, workspace, lint, teste, pipeline → `engenheiro-de-plataforma`
   - forma de gráfico, encoding, escala, paleta → `especialista-em-visualizacao`
6. Peça a ele `specs/$1/desenho.md`, com contrato, tokens consumidos, estados,
   composição permitida e impacto sobre o que já existe.
7. Devolva para revisão humana: o caminho do arquivo, a branch e o rastreio de
   cada critério de aceite da spec até o ponto do desenho que o atende.

Não implemente. Não instale dependência. Não escreva configuração. A condição
de parada é `desenho.md` entregue.
