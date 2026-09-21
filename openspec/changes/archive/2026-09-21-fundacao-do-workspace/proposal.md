# Fundação do workspace

## Why

Não existe hoje lugar onde código da biblioteca de interface possa ser escrito e
verificado com resultado reprodutível. O repositório hospeda documentação, dados
canônicos e migrations, mas nenhuma estrutura de pacotes, nenhuma verificação
executável e nenhuma integração contínua. Sem isso, nenhum ciclo seguinte —
tokens, bancada, átomos, primitivas de domínio, gráficos — tem onde nascer nem
como ser conferido.

## What Changes

- Converte o repositório em workspace pnpm que declara exclusivamente `apps/*` e
  `packages/*`.
- Cria os dois pacotes da biblioteca como cascas vazias: `@chargebr/tokens` e
  `@chargebr/ui`, sem token e sem componente.
- Introduz Biome 2 para formatação e lint, e Vitest 5 para testes.
- Introduz `pnpm verify` na raiz, que executa tipos, formatação, lint e testes
  sobre o perímetro do workspace e retorna código de saída diferente de zero
  quando qualquer etapa falha.
- Introduz integração contínua sobre pull request executando a mesma verificação.
- Declara o perímetro: o que está fora do workspace não é verificado e não é
  alterado.

## Capabilities

### New Capabilities

- `workspace-verification` — o comportamento observável da verificação do
  repositório: o que ela cobre, quando falha, e o que ela garante sobre o que
  está fora do seu perímetro.

### Modified Capabilities

Nenhuma. Não existe spec anterior neste projeto.

## Impact

- **Arquivos novos:** `pnpm-workspace.yaml`, `biome.json`, `vitest.config.ts`,
  `packages/tokens/`, `packages/ui/`, `.github/workflows/`.
- **Arquivos alterados:** `package.json` da raiz, para acrescentar o script
  `verify` e as dependências de desenvolvimento; `tsconfig.json`, para passar a
  servir de base aos pacotes.
- **Intocados:** `src/`, `tests/`, `data/`, `queries/`, `supabase/`, `docs/` e os
  scripts `collect` e `test` da raiz.
- **Fora do repositório:** a proteção da branch principal é configuração do
  GitHub, não arquivo versionado.

## O que esta mudança não faz

Não cria token, componente, história, gráfico ou aplicação. Não instala
Storybook, React, Next.js, React Aria, Style Dictionary ou visx. Não publica
pacote, não versiona semanticamente, não faz deploy e não move nem remove nada
do conteúdo herdado.
