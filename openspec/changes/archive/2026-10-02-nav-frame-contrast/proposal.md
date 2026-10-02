# Proposal

## Why

O conjunto fixo da moldura de navegação, entregue por `nav-rail-shell`, tem um
tom apagado (`color.nav.text-muted`, `{color.gray.500}`) que **não sustenta o
piso de 4,5:1 de texto** contra as próprias superfícies: 4,059:1 na trilha,
**3,780:1 no painel**, 3,045:1 na borda.

**Medido na main antes desta proposta, e não é falha viva ainda:** os três
únicos consumidores desse tom hoje são objeto gráfico — o chevron da pasta
(`nav-folder-trigger.muted`), o ponto da folha (`nav-leaf.dot`) e o ícone da
trilha (`nav-rail-item.color`) —, e para objeto gráfico o piso é 3:1, que os
três cumprem. O rótulo do painel e a contagem da folha usam
`color.nav.text` (10,419:1 contra o painel).

A falha é **latente, e o nome é o convite**: um token chamado `text-muted` diz
a quem compõe que serve a texto, e o primeiro texto que o adotar herda 3,780:1
sem nada reprovar. A maquete aprovada tem exatamente esses consumidores — o
rótulo de seção, as contagens e a linha da organização no rodapé do painel.

A checagem que deveria pegar isso não pega: `packages/tokens/src/nav-contrast.test.ts`
monta a entrada de texto com `surfaces: []`, de modo que o único par de texto
medido é `current-text × current`. Quatro tokens — `color.nav.text`,
`text-strong`, `text-muted` e `hover` — estão declarados e **não são medidos
contra nada**.

Mais dois pontos em que a implementação se afastou de
`docs/maquete-navegacao.html`, encontrados na bancada: a marca na barra de
conteúdo sem limite de tamanho, e a página de primeiro nível desalinhada dos
rótulos de pasta.

## What Changes

- `color.nav.text-muted` passa de `{color.gray.500}` para `{color.gray.400}` —
  6,515:1 contra o painel, acima do piso de texto. O nome passa a ser verdade.
- Token novo `color.nav.glyph` = `{color.gray.500}`, o tom da maquete, para
  objeto gráfico ao piso de 3:1. Os três consumidores atuais de `text-muted`
  — chevron, ponto e ícone da trilha — passam a referenciá-lo. **Nenhum valor
  da maquete é descartado:** o que muda é qual papel recebe qual tom.
- `nav-contrast.test.ts` passa a medir **todo** token do conjunto fixo: cada
  cor de texto contra as superfícies em que ela de fato aparece, ao piso de
  4,5:1, e cada objeto gráfico ao piso de 3:1. Acrescenta uma prova de
  cobertura — todo `color.nav.*` precisa aparecer em algum par declarado —, com
  plantio que a faz reprovar: um token novo sem par nomeado na saída.
- A marca na barra de conteúdo ganha limite de tamanho dentro da forma de
  moldura inteira, para não entrar no tamanho intrínseco do arquivo.
- A página de primeiro nível da árvore ganha um vão do tamanho do chevron, para
  alinhar com os rótulos das pastas irmãs — alinhamento por estrutura, não por
  recuo escrito à mão.

## What This Does Not Do

- Não muda `apps/backoffice/app/layout.tsx` nem qualquer arquivo da aplicação;
  a moldura continua sem `rail` e sem `nav` no documento emitido, e o requisito
  "Regiões da moldura no documento entregue" segue valendo como está.
- Não mexe nos outros oito tokens do conjunto fixo, nem na decisão de a moldura
  ser escura nos dois temas, nem na forma da árvore, da trilha ou do painel —
  tudo isso foi decidido e aplicado por `nav-rail-shell` e continua como está.
- Não estende o guardião de vocabulário a `interface-charts`: o ponto 21 de
  `docs/pontos-abertos.md` continua aberto, com o gatilho que já tem.
- Não reproduz o botão de alternância de tema da maquete nem a cortina do
  estreito — as duas ausências são de `nav-rail-shell`, registradas lá, e não
  mudam aqui.
- Não revisa os demais afastamentos da maquete que `nav-rail-shell` registrou
  (ponto da folha em 4px, preenchimento das linhas em 4px, fios de 2px): são
  consequência de "só token" sobre a escala de espaço, não defeito.

## Capabilities

### Modified Capabilities

- `design-tokens`: o requisito do conjunto que não varia por tema passa a
  exigir que **todo** token do conjunto seja medido em algum par declarado, e
  que o piso aplicado a cada um seja o do papel que ele cumpre — texto a 4,5:1,
  objeto gráfico a 3:1. Hoje o requisito exige a medição do conjunto, sem exigir
  que ela alcance cada token, e é essa folga que deixou quatro cores sem par.

## Impact

- `packages/tokens/tokens/semantic/shared.json` (valor de `text-muted`, token
  `glyph` novo).
- `packages/tokens/tokens/component/nav-folder-trigger.json`,
  `component/nav-leaf.json`, `component/nav-rail-item.json` — os três
  consumidores do tom gráfico.
- `packages/tokens/src/nav-contrast.test.ts` (pares de texto, cobertura,
  plantio).
- `packages/ui/src/organisms/app-frame/app-frame.module.css` (tamanho da marca
  na barra de conteúdo).
- `packages/ui/src/atoms/nav/leaf/nav-leaf.tsx` e `nav-leaf.module.css`
  (vão de alinhamento da página de primeiro nível).
- Nenhum arquivo de `apps/` muda.
