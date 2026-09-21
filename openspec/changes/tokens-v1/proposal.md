# Tokens v1

## Why

A biblioteca de interface não pode começar sem a camada que define cor, espaço,
raio, sombra e tipografia. Sem ela, todo componente dos ciclos seguintes nasceria
com valor literal no código — o que a verificação do ciclo 1 não impede, porque
não existe nada contra o que comparar.

Há também uma lacuna a fechar: a decisão de configuração afirma que a paleta
categórica de gráfico foi "validada nos seis testes". Uma varredura do histórico
inteiro mostrou que esses testes nunca foram definidos em documento algum. Este
ciclo substitui a afirmação por um critério nomeado e executável.

## What Changes

- Cria `@chargebr/tokens` com a fonte em formato DTCG e geração de CSS custom
  properties e constantes TypeScript a partir dela.
- Estabelece três camadas com referência dirigida: primitiva, semântica e de
  componente.
- Define tema claro e escuro completos, incluindo as superfícies de gráfico.
- Adota **seis checagens** de paleta categórica, executadas por script nos dois
  modos e ligadas ao `pnpm verify`.
- Define a tipografia do sistema como família única, com algarismos tabulares e
  zero cortado nos tokens de dado numérico.

## Capabilities

### New Capabilities

- `design-tokens` — o comportamento observável da camada de tokens: o que ela
  emite, que referências aceita entre camadas, o que ela garante sobre os dois
  temas, e quando reprova.

### Modified Capabilities

Nenhuma. `workspace-verification` continua como está; este ciclo acrescenta
etapas ao que ela já executa, sem alterar nenhum dos seus requisitos.

## Impact

- **Pacote:** `packages/tokens` deixa de ser casca vazia.
- **Dependências novas:** um gerador de tokens e uma biblioteca de cor com
  conversão OKLCH e simulação de daltonismo. Justificadas no desenho.
- **Verificação:** `pnpm verify` ganha a checagem de paleta e as checagens de
  camada.
- **Intocados:** `packages/ui`, `apps/`, `src/`, `tests/`, `data/`, `queries/`,
  `supabase/`.

## O que esta mudança não faz

Não cria componente, história ou gráfico. Não instala Storybook, React, React
Aria ou visx. Não decide a forma de nenhum gráfico. Não altera a paleta de marca
nem as medições de contraste já registradas em
`docs/decisao-identidade-visual.md`.

## Sobre "os seis testes"

As seis checagens adotadas aqui são **padrão novo**, com definição escrita e
validador executável. Elas não recuperam nem reconstituem os "seis testes"
citados no material revertido, que nunca existiram como documento. Os valores da
paleta são mantidos como candidatos e passam ou reprovam pelo critério novo, como
qualquer outro valor.
