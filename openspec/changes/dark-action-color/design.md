# Desenho — cor de ação do tema escuro

## Context

Ver `proposal.md` — Why, para o defeito medido. Ver `specs/design-tokens/spec.md`
para o contrato.

O que a bancada atual alcança, e que o desenho abaixo não pode ultrapassar:

- `pnpm verify` tem quatro estágios — tipos, formato, lint, testes — e a bancada
  do ciclo 3 fixou que nenhum ciclo acrescenta estágio.
- `@chargebr/tokens` já declara `culori` como dependência e já executa, no estágio
  de testes, uma checagem que lê os tokens resolvidos dos dois temas
  (`paletteInput` sobre `generated/tokens.ts`) e mede contraste WCAG. As duas
  checagens novas são da mesma natureza e entram pelo mesmo caminho.
- As histórias rodam nos dois temas, como dois projetos do Vitest, e afirmam
  sobre a árvore renderizada. `chart.assert.ts` já é o lugar onde as restrições
  comuns a toda forma de gráfico são afirmadas, e o elemento que carrega a
  superfície de gráfico já se identifica por `data-plot`.

**Lacuna registrada, não bloqueante:** nenhum estado de ponteiro é alcançável
pelo axe nem pela bancada — não há componente de botão, e mesmo que houvesse, a
checagem de acessibilidade mede o que está renderizado, não o que aconteceria sob
o ponteiro. O par de hover é, portanto, provado sobre os valores dos tokens, e
não sobre pixels. Isso não é um contorno: o hover é uma relação entre dois
valores declarados, e é aí que ela é mensurável. Fica registrado que, quando
existir componente de botão, a prova visual do estado é acréscimo, nunca
substituição desta.

## Goals / Non-Goals

**Goals**

- Um só conjunto de superfícies neutras, lido da fonte, que as duas checagens
  novas e a checagem de paleta enxerguem igual.
- Uma cor de ação por tema, legível contra toda superfície neutra daquele tema.
- Um passo de hover com o mesmo sentido e o mesmo tamanho nos dois temas.
- Preservar, no escuro, o invariante de anel de foco que o claro já tem — sem
  decidir se ele é o invariante certo. Ver Open Questions.

**Non-Goals**

- Tabela de contraste exaustiva entre todos os pares de tokens. A checagem cobre
  os pares que a interface realmente compõe — ação contra superfície, texto sobre
  ação —, não o produto cartesiano.
- Rampa índigo completa. Entram os dois degraus que a ponta clara exige, não os
  degraus 100, 500, 800 e 900 que ninguém referencia.

## Decisions

**Primitivo novo, e não valor novo em primitivo existente.** A cor de ação em
repouso precisa de no mínimo 4,5:1 contra `gray.900` (`#18181D`), que é a
superfície mais clara do tema escuro. `indigo.400` dá 4,263:1 e é o índigo mais
claro que existe. Havia dois caminhos: clarear `indigo.400` ou acrescentar
`indigo.300`.

Clarear `indigo.400` arrastaria `color.chart.series.1` do tema escuro junto, e
uma paleta categórica verificada no ciclo 2 voltaria a ser uma decisão aberta —
seis checagens para reexecutar como escolha, e não como regressão. Acrescentar
`indigo.300` custa um primitivo e não toca em nada verificado. Alternativa
recusada pelo custo, não pelo gosto.

**Os dois primitivos são passos da rampa que já existe, não cores inventadas.**
A família índigo tem matiz 280,4° e a croma cai conforme a luminosidade sobe, que
é o comportamento do sRGB nessa região:

| token | hex | L | C | H |
|---|---|---|---|---|
| `indigo.200` (novo) | `#A8AEFE` | 0,7766 | 0,1141 | 280,1° |
| `indigo.300` (novo) | `#8788FE` | 0,6804 | 0,1706 | 280,5° |
| `indigo.400` | `#706FE2` | 0,6001 | 0,1701 | 280,4° |
| `indigo.600` | `#4640A7` | 0,4400 | 0,1600 | 280,2° |
| `indigo.700` | `#302681` | 0,3441 | 0,1459 | 280,4° |

`indigo.300` conserva a croma de `indigo.400` (0,1706 contra 0,1701) e sobe
0,080 de luminosidade — o mesmo tamanho de degrau que a família já usa.
`indigo.200` sobe mais 0,0962, que é o degrau `700 → 600` do tema claro (0,0960).
Os dois hexadecimais estão dentro do sRGB.

**O hover é sempre um passo mais claro que o repouso, nos dois temas.** Era isto
que faltava: `action.primary-hover` no escuro carregava `indigo.600`, o valor do
claro, sem inversão nenhuma. O par de cada tema passa a ser dois degraus vizinhos
da ponta que aquele tema usa — claro: `700 → 600`; escuro: `300 → 200` —, e o
passo é o mesmo nos dois.

A consequência é assimétrica de propósito, e a especificação a nomeia: no tema
claro o texto sobre a ação é branco e o passo derruba a razão de 12,210 para
8,230; no escuro o texto é `gray.950` e o mesmo passo sobe a razão de 6,316 para
9,181. O que os dois temas têm em comum é o passo, não a razão; o que os dois
precisam respeitar é o piso.

Alternativa recusada: hover mais escuro que o repouso no escuro, reusando
`indigo.400`. Espelharia a geometria do claro com um primitivo só, mas deixaria o
estado de hover em 4,578:1 — margem de 0,078 sobre o piso, exatamente a margem
que este ciclo trata como defeito. Um estado de interação não pode ser a coisa
mais apertada do tema.

**A matriz medida, que é o que o ciclo entrega:**

| par | claro | escuro (hoje) | escuro (proposto) |
|---|---|---|---|
| `action.primary` × `surface.base` | 12,210 | 4,578 | **6,316** |
| `action.primary` × `surface.sunken` | 11,404 | 4,578 | **6,316** |
| `action.primary` × `surface.raised` | 12,210 | **4,263** ✗ | **5,882** |
| `action.primary` × `chart.surface` | 12,210 | **4,263** | **5,882** |
| `text.on-action` × `action.primary` | 12,210 | 4,578 | **6,316** |
| `text.on-action` × `action.primary-hover` | 8,230 | **2,308** ✗ | **9,181** |
| `focus.ring` × `surface.raised` | 12,210 | 4,263 | **5,882** |

Pior margem sobre o piso de 4,5 no tema escuro proposto: 1,382, no par
`action.primary` × `surface.raised`.

**O anel de foco acompanha a cor de ação, e a razão é negativa.** No tema claro
`focus.ring` e `action.primary` são o mesmo primitivo (`indigo.700`); no escuro
eram o mesmo (`indigo.400`) e deixariam de ser se nada fosse feito.

O que decide não é uma tese sobre anéis de foco: é que a alternativa de deixar
`focus.ring` em `indigo.400` produziria um anel `indigo.400` em volta de texto
`indigo.300`, a 1,380:1 um do outro. Essa diferença não se lê como escolha — lê-se
como erro de renderização. É a mesma classe de defeito que o ciclo 6 nomeou ao
fazer a hachura do gráfico derivar da do átomo, em vez de deixar duas parecidas
porém diferentes.

Então este ciclo preserva o invariante que já valia nos dois temas, e o torna
conferível por execução. Ele **não** decide que um anel de foco deva ser a cor de
ação — ver Open Questions.

**O conjunto de superfícies é lido da fonte, não escrito no teste.** A checagem
percorre os tokens `color.surface.*` de cada tema. Uma superfície nova entra sem
edição do teste — e é por isso que a superfície de gráfico precisa ser uma delas:
se `chart.surface` pudesse ser um quarto valor, ela ficaria fora da varredura e o
defeito de hoje poderia voltar por outra porta.

**A proibição de interativo na superfície de gráfico se prova onde ela é
observável.** O requisito é de token — é ele que diz contra o que se mede o quê —,
mas o que se observa é a árvore renderizada. A afirmação entra em
`chart.assert.ts`, junto das outras restrições comuns a toda forma, e roda em
toda história de gráfico, nos dois temas: dentro de `[data-plot]` não há elemento
alcançável por foco nem manipulador de ponteiro.

## Risks / Trade-offs

- A cor de ação do escuro clareia visivelmente, e quem viu a interface antes vai
  notar → é o efeito pretendido: a cor anterior reprovava em duas das três
  superfícies do tema. A regressão da paleta garante que os gráficos não mudam
  junto.
- Dois primitivos novos alargam a rampa índigo sem que a semântica use todos os
  degraus intermediários → aceito; a rampa não precisa ser completa para ser
  coerente, e os dois degraus novos são derivados dos que já existiam.
- O piso de 0,02 na diferença entre os passos de hover engessa a rampa se um
  tema precisar de degrau diferente no futuro → o limiar mora no critério, à
  vista, como os de `palette.ts`; mudá-lo é mudar o arquivo do critério, não
  contornar um teste.
- `indigo.200` e `indigo.300` têm componente azul em 254/255, perto da borda do
  sRGB → são hexadecimais fixos na fonte, nunca calculados em execução; não há
  arredondamento para acontecer.
- O par de hover é provado em token e não em pixel → lacuna registrada em
  Context; a prova visual entra quando existir componente de botão, somando-se a
  esta.

## Migration Plan

Aditiva no primitivo, substitutiva em três referências semânticas do tema
escuro. Reversão é o revert do commit, com regeração das saídas.

`indigo.400` tem hoje três referências, todas no tema escuro: `action.primary`,
`focus.ring` e `chart.series.1`. As duas primeiras saem; a terceira fica, e
`indigo.400` passa a ser exclusivamente o que sua própria descrição já diz — a
série 1 da paleta categórica no tema escuro. `indigo.600` tem três referências;
sai a do hover do tema escuro, ficam as duas do claro. Não há uso a procurar à
mão: a camada de componente só alcança primitivo através da semântica, e a
checagem de referências do ciclo 1 reprova qualquer outro caminho.

## Open Questions

**Um anel de foco deve ser a cor de ação?** Este ciclo não responde. Ele preserva
um invariante que já existia nos dois temas, por uma razão negativa — a
alternativa produziria dois índigos a 1,380:1 um do outro — e não por ter
concluído que o invariante é o certo.

A pergunta que fica aberta é o contrário dele: um indicador de foco no mesmo
matiz do texto que ele cerca é mais fraco que um que contrasta com esse texto. O
anel existe para dizer onde o foco está, e um anel `indigo.300` em volta de texto
`indigo.300` só se distingue do texto pela forma, nunca pela cor. Um anel de
matiz próprio — ou de dois traços, claro e escuro, como fazem indicadores que
precisam funcionar sobre qualquer fundo — seria mais forte.

Responder isso exige um componente com foco visível para medir, e este ciclo não
entrega nenhum. Adiável sem alterar a spec, a abordagem nem as tarefas: o que a
spec fixa é que os dois tokens não se descolam em silêncio, e essa trava continua
valendo qualquer que seja a resposta. Quando houver componente, a resposta pode
trocar o requisito de invariante por um requisito de contraste entre anel e
conteúdo — e aí o valor de `focus.ring` deixa de ser consequência de
`action.primary`.
