# Incidente: corrida no cache de otimização da bancada

## Identificação

| Campo | Valor |
| --- | --- |
| Sintoma | O projeto `escuro` reprova de forma intermitente com `SyntaxError`, num conjunto de histórias sorteado a cada execução. O projeto `claro` nunca reprovou. |
| Mensagens | `Illegal return statement`, `Unexpected token '}'`, `Invalid or unexpected token`, `Unexpected identifier 'ffscreenSubtreeIsHidden'` |
| Origem na pilha | `node_modules/.cache/storybook/10.6.0/<hash>/sb-vitest/vitest/<hash>/deps/plugins.*.js` |
| Bancada | Vitest 5.0.1 em modo navegador, dois projetos de tema via `@storybook/addon-vitest` 10.6.0 |
| Período | 26 e 27 de setembro de 2026 |
| Pessoa responsável | Denis Toledo |
| Desfecho | **Fechado.** Mecanismo identificado e evitado. Ver [Desfecho](#desfecho). |

Este incidente **não** é o de `docs/incidente-instabilidade-da-bancada.md`. Aquele
é estado pós-interação que não chega dentro do `waitFor`, numa história de
ponteiro; este é conteúdo de arquivo truncado, em histórias que não têm
interação nenhuma. O gatilho de retomada daquele **não** disparou aqui, e é
preciso dizer isso porque `evidence-anchor` reprovou numa das execuções deste —
com a assinatura deste, não com a daquele.

## Ocorrências

| # | Data | Onde | Arquivos reprovados | Testes reprovados |
| --- | --- | --- | --- | --- |
| 1 | ciclo `verification-coverage` | CI | 4 arquivos de história rodando **0 testes** | reprovou por `SyntaxError`, não por contagem |
| 2 | 27 set, local | `pnpm exec vitest run` | `numeric-value`, `status-marker`, `stacked-bar`, `small-multiples` | 15 |
| 3 | 27 set, local, cache limpo | `pnpm exec vitest run` | `declared-absence`, `app-frame`, `hatch`, `blocked-projection`, `evidence-anchor`, `text`, `status-panel`, `value-with-provenance` | 30 |
| 4 | 27 set, local | `pnpm verify` | `numeric-value`, `text`, `bar`, `line` | 17 |

Os conjuntos das ocorrências 2, 3 e 4 são **disjuntos entre si** sobre a mesma
árvore. Em nenhuma delas o projeto `claro` reprovou, e em todas os mesmos
arquivos que reprovaram no `escuro` passaram no `claro` na mesma execução.

A ocorrência 1 é a mesma falha com a outra cara: em vez de reprovar alto, quatro
arquivos coletaram zero teste e o estágio teria passado verde se um `SyntaxError`
não tivesse aparecido por acaso. É o defeito que o ponto 14 de
`docs/pontos-abertos.md` registrava, fechado pelo PR que tirou
`--passWithNoTests` de `verify:test`.

## Hipóteses eliminadas

### 1. Erro de sintaxe na fonte

Os mesmos quatro arquivos que reprovaram no `escuro` passaram no `claro`, na
mesma execução e sobre a mesma árvore. Erro de sintaxe na fonte reprovaria nos
dois projetos.

### 2. Cache velho ou corrompido em disco

`rm -rf node_modules/.cache/storybook` seguido de nova execução **piorou**: 15
testes reprovados com cache quente, 30 com cache frio. Cache podre explicaria a
falha, não a piora ao limpá-lo.

### 3. Contenção de CPU entre dois navegadores

`Unexpected identifier 'ffscreenSubtreeIsHidden'` é `offscreenSubtreeIsHidden`,
identificador interno do React DOM, **sem o `o` inicial**. Conteúdo truncado no
meio de um byte não vem de escalonamento de processador; vem de leitura de
arquivo em reescrita.

### 4. `cacheDir` por projeto no Vitest

Tentado, e não resolve: o diretório configurado (`packages/ui/node_modules/.bench/<tema>`)
nunca foi criado, e a pilha continuou apontando para o caminho próprio do
complemento. O complemento do Storybook não consome o `cacheDir` do Vitest.

**Esta hipótese foi dada como conserto com base numa única execução verde.** Ela
era sorte: a execução seguinte reprovou com a mesma assinatura. Uma execução
verde não é evidência sobre defeito intermitente, e a regra que este incidente
deixa é a do próprio repositório — a mesma do ponto 14, aplicada a quem conserta.

## Mecanismo

Os dois projetos de tema recebem o mesmo `configDir` e a mesma lista de
`optimizeDeps`, e por isso compartilham o diretório de otimização que o
complemento do Storybook mantém em `node_modules/.cache/storybook/`. Rodando em
paralelo, os dois servidores Vite escrevem e servem os mesmos arquivos: o que
perde a corrida entrega ao navegador bytes de um arquivo em reescrita, e o
analisador reprova com `SyntaxError` na história que por acaso estava carregando.
Cache frio alarga a janela de escrita, o que explica a ocorrência 3 ter o dobro
de reprovações da 2.

`optimize-deps.ts` já fechava uma porta desta mesma classe — `noDiscovery: true`
existe para que nenhuma dependência seja otimizada no meio da execução. A porta
que ficou aberta era dois projetos escrevendo o mesmo cache.

**O que não foi medido:** por que é sempre o `escuro`. A suspeita é ordem de
início, porque `THEMES` é `["light", "dark"]` e o `claro` entra primeiro, mas
isso é inferência.

## Desfecho

Os dois projetos de tema passaram a rodar em grupos diferentes:
`sequence.groupOrder` vale 1 para o `claro` e 2 para o `escuro`. Projetos do
mesmo grupo rodam juntos e os grupos rodam do menor para o maior, então os dois
temas se revezam e todo o resto da verificação — tokens, guardiões,
`apps/backoffice`, contratos — fica no grupo padrão e continua em paralelo.

**Evidência:** cinco execuções consecutivas de `pnpm exec vitest run`, 219 de 219
testes em todas. Duração de 9,98 a 11,05 segundos, contra 10,5 antes da mudança:
serializar os dois temas não custou tempo de relógio, porque a bancada nunca foi
o gargalo.

**O mecanismo foi evitado, não removido.** Nada impede dois projetos de navegador
de compartilharem aquele cache; o que existe agora é a garantia de que estes dois
não rodam ao mesmo tempo.

**Gatilho de retomada:** um terceiro projeto de navegador na bancada, ou qualquer
projeto novo que passe a compartilhar o cache do complemento do Storybook. Quem o
criar decide o grupo dele, e a decisão precisa estar escrita — grupo esquecido
traz o defeito de volta com a mesma cara sorteada.

## Referências

- `packages/ui/vitest.config.ts` — `sequence.groupOrder` por tema
- `packages/ui/.storybook/optimize-deps.ts` — `noDiscovery: true`, a outra porta da mesma classe
- `docs/incidente-instabilidade-da-bancada.md` — incidente distinto, assinatura distinta
- Ponto 14 de `docs/pontos-abertos.md`, fechado — a cara silenciosa desta mesma falha
- Tipo de `sequence.groupOrder`: `vitest/dist/chunks/plugin.d.*.d.ts` (5.0.1)
