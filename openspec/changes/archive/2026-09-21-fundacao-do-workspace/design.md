# Desenho — fundação do workspace

## Context

Ver `proposal.md` — Why. O repositório hoje tem `package.json`, `tsconfig.json`,
`.nvmrc` e um lockfile na raiz, servindo a um único conjunto de arquivos em
`src/` e `tests/`, verificado por `node --test` e `tsc --noEmit`. A conversão em
workspace precisa acontecer sem tocar nesse conjunto, que é mantido em paralelo.

A stack está fixada em `docs/decisao-configuracao-inicial-do-workspace.md` e em
`openspec/config.yaml`; este desenho não a reabre.

## Goals / Non-Goals

**Goals**

- Perímetro de verificação declarado num lugar só, que a própria verificação respeita.
- Etapas da verificação isoláveis: cada uma roda e falha sozinha, e todas rodam por um comando.
- Fronteira biblioteca↔aplicação verificável por execução antes de existir aplicação.

**Non-Goals**

- Cache remoto de build, paralelização e otimização de tempo de CI.
- Publicação de pacote e versionamento semântico.
- Varredura de segredos.
- Qualquer decisão sobre o conteúdo dos pacotes.

## Decisions

**Perímetro declarado em `pnpm-workspace.yaml`, e não num manifesto próprio.**
A spec exige que a verificação cubra `apps/*` e `packages/*` e nada mais. O
`pnpm-workspace.yaml` já é exatamente essa declaração, e é lido pela ferramenta
em vez de por um script nosso. A alternativa considerada — um manifesto de
perímetro separado, com justificativa por entrada, como na tentativa anterior —
cria uma segunda fonte de verdade que pode divergir da primeira sem que nada
acuse.

**Biome substituindo Prettier e ESLint.** Decidido na D3. Em desenho, a
consequência é que as etapas de formatação e lint passam a ser dois subcomandos
do mesmo binário, e `biome ci` cobre as duas sem reescrever arquivo — o que a
spec exige.

**Vitest na raiz com projetos descobertos pelo workspace.** Um único
`vitest.config.ts` na raiz, com projetos resolvidos a partir dos pacotes, atende
ao requisito de descoberta automática: pacote novo entra sem editar a raiz. A
alternativa — um config por pacote — exigiria editar a raiz a cada pacote, o que
a spec proíbe.

**`pnpm verify` como sequência explícita, não como agregador implícito.** O
script encadeia as quatro etapas em ordem fixa, cada uma com seu próprio código
de saída. Ordem escolhida: tipos, formatação, lint, testes — o mais barato e o
que falha mais cedo primeiro. A alternativa, um `pnpm -r verify` recursivo,
esconderia qual etapa falhou atrás do pacote que falhou.

**Fronteira biblioteca↔aplicação por regra de lint, não por convenção.** Uma
regra que proíbe, dentro de `packages/`, importar de `apps/` ou de framework de
aplicação. Escrita antes de existir qualquer aplicação, deliberadamente: o custo
de instalá-la agora é uma regra; depois, é uma refatoração.

**`node --test` dos scripts herdados permanece intocado.** O Vitest entra
apenas para o perímetro. Não há migração de suíte nesta mudança, e os scripts
`collect` e `test` da raiz continuam apontando para onde apontam hoje.

## Risks / Trade-offs

- Converter a raiz em workspace muda como o pnpm resolve dependências para os
  scripts herdados → a spec exige prova de que `collect` e `test` se comportam
  igual antes e depois; se não se comportarem, a mudança para e a lacuna é
  registrada.
- Biome é uma ferramenta a menos, mas também uma comunidade menor que a do
  ESLint para regras específicas → a regra de fronteira precisa ser expressável
  nele; se não for, o desenho é revisto antes das tarefas, não contornado por
  script caseiro.
- Proteção de branch é configuração de plataforma, fora do repositório → não é
  reprodutível por clone; a prova é uma tentativa registrada, não um arquivo.

## Migration Plan

Nenhuma migração de dados ou de código. A conversão é aditiva: arquivos novos na
raiz e dois pacotes vazios. Reversão é o revert do commit, sem estado a desfazer.

A proteção da branch principal é ativada manualmente no GitHub e é o único passo
não versionado; ele fica por último, para não bloquear os próprios pull requests
desta mudança.

## Open Questions

Nenhuma. As decisões em aberto registradas em
`docs/decisao-configuracao-inicial-do-workspace.md` — hospedagem, produto
público como app separado, variante monocromática do logo — não são exigidas por
nenhum requisito desta spec.
