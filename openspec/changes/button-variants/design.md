# Design

## Context

`packages/ui/src/atoms/button/button.tsx` compõe `Button` de
`react-aria-components` (`AriaButton`) — mesma primitiva já usada por
`EvidenceAnchor`/`Link`. Hoje `ButtonProps` só expõe `icon?`, `onPress?: ()
=> void` (sem argumento), e `children` xor `aria-label` (união discriminada);
`type` é fixo em `"button"`. `component/button.json` declara um único par de
cor ("primary"), `radius`, `padding-inline` (`space.inset.md`),
`padding-block` (`space.inset.sm`), `font-size` (`text.label.size` =
`font.size.2` = 13px) e `font-weight` — o próprio arquivo se descreve como
"mínimo da camada de componente: prova a regra de referência antes de
existir componente" (`component/button.json:3`), nascido antes de `Button`
existir. Ver proposal.md para a motivação completa; este documento cobre só
o como.

`space.inset.sm/md/lg` e `space.gap.sm/md/lg` (`semantic/shared.json`) já
existem e já são consumidos pelo botão — a parte de R3
(`docs/decisao-biblioteca-de-componentes.md`) que dizia "não existe hoje, em
nenhuma camada, uma escala nomeada de tamanho genérico" estava incompleta: a
medição que a sustentava não tinha olhado `semantic/shared.json`. O que
falta é uma escala nomeada de **tamanho de fonte**: a camada semântica nomeia
texto por papel (`text.body/label/heading/data`), nunca por degrau, e
`font.size.1-7` (primitivo) não é referenciado direto por nenhum token de
componente — fazê-lo violaria "Três camadas com referência dirigida"
(`design-tokens`).

`packages/tokens/src/contrast.ts` (`ContrastInput`) lê hoje um único par fixo
por nome de chave (`color-action-primary`, `color-action-primary-hover`,
`color-text-on-action`, `color-focus-ring`, `color-chart-surface`).
`packages/tokens/src/palette.ts` (`paletteInput`) já enumera
`color-chart-series-\d+` por regex a partir dos tokens resolvidos, e a
própria `contrastInput` já enumera `color-surface-*` (constante `SURFACE`) —
o par ação/hover/onAction é o único campo ainda hardcoded nesse arquivo.

## Goals / Non-Goals

**Goals:**

- `Button` aceita `isDisabled`, `isPending`, `size` (`sm | md | lg`),
  `aria-expanded`/`aria-controls`/`aria-describedby`, e `onPress` recebe o
  `PressEvent` completo da primitiva.
- `Spinner` nasce como átomo novo, com `component/spinner.json` próprio, e
  respeita `prefers-reduced-motion` — primeiro componente animado do pacote.
- Tokens novos nascem no mesmo commit revisável que o componente que os
  consome, nunca antes: `color.action.disabled` + papel de texto,
  `text.control.sm/md/lg`, `component/spinner.json`.
- `contrast.ts` enumera pares de ação/estado a partir da fonte, no mesmo
  padrão que `SURFACE` e `paletteInput` já usam.
- A prova de tipo do pacote, perdida com a remoção da máquina de contratos
  de estado (`793d8e2`), volta para `Button` — arquivo de plantio por
  componente, sem o mecanismo removido (D6).

**Non-Goals:**

- Eixo de tom (`variant`/`color` com `primary`/`secondary`/`danger`) — R6,
  fora de escopo; nada pede um segundo tom hoje.
- Ligar o gatilho do hambúrguer em `AppFrame` — continua sendo a tarefa 7.3
  de `interface-atomic-structure`; este change só remove o bloqueio de tipo.
- `Icon`, `Text`, `Heading` — próximos ciclos, mesmo molde.
- `pressed` como estado coberto por história — trava de R1
  (`docs/decisao-biblioteca-de-componentes.md`) e do incidente aberto em
  `docs/incidente-instabilidade-da-bancada.md` continua valendo; nada aqui a
  levanta.
- Reposição da prova de tipo de qualquer outro átomo que também a perdeu em
  `793d8e2` e continua existindo hoje (`Icon`, `Heading`, `Text` — medido em
  `packages/ui/src/atoms/`; `NumericValue`, `StatusMarker` e
  `DeclaredAbsence` foram dissolvidos em `6a70b82`, não há ciclo futuro que
  os toque) — cada um repõe a sua quando o próprio ciclo dele tocar o
  componente, mesma disciplina de "token nasce com o componente" aplicada
  à prova de tipo.

## Decisions

### D1 — Tamanho: escala nova de tipografia nomeada (Opção B de R3), não índice literal

R3 registrava a escolha entre índice literal (Opção A) e escala nomeada nova
(Opção B) como decisão em aberto, com gatilho "a primeira primitiva migrada
que precisar variar tamanho ou espaço". `Button.size` é esse gatilho — é a
primeira variante de tamanho em uso real no pacote.

Decisão: uma família semântica nova, `text.control.sm/md/lg`
(`semantic/shared.json`), de três degraus — o mesmo número que
`space.inset`/`space.gap` já usam, para que `size="md"` alinhe às duas
escalas no mesmo passo —, mapeada a `font.size.1/2/3` (12/13/14px). `md` =
`font.size.2` = o valor que o botão já usa hoje sem variante, para que
`Button` sem `size` explícito continue com a mesma aparência.
`component/button.json` ganha três conjuntos (`sm`/`md`/`lg`), cada um
referenciando `text.control.<size>` para `font-size`, `space.inset.<size>`
para `padding-inline` e `space.gap.<size>` para o espaço entre ícone e
rótulo. `padding-block` mantém a assimetria já existente (um degrau abaixo de
`padding-inline`): `sm`/`md` usam `space.inset.sm`, `lg` usa
`space.inset.md` — mesma proporção que o botão de hoje (`inset.sm` de
`padding-block` contra `inset.md` de `padding-inline`) estendida ao terceiro
degrau.

**Alternativa considerada:** índice literal (`size="2"`/`"3"`/`"4"`,
Opção A). Descartada porque nenhuma das duas referências com variante de
tamanho (Material UI, gluestack) nomeia por índice — as duas nomeiam por
grandeza —, e exigir que quem compõe saiba que `font.size.3` é 14px é o
mesmo custo ergonômico que a própria Opção A já registrava contra si.

**Registrado, não escondido:** `text.control.md` e `text.label.size`
resolvem para o mesmo degrau primitivo hoje — os dois são `font.size.2`
(13px). É deliberado, não duplicação por descuido: `text.label` nomeia um
**papel** (rótulo de UI, qualquer que seja o elemento) e `text.control`
nomeia um **degrau de uma escala de tamanho** (pequeno/médio/grande, para
qualquer controle que declare `size`). As duas famílias existem por motivos
diferentes e coincidem hoje só porque o valor médio de `Button` sempre foi
o mesmo tamanho de rótulo — nada garante que continuem iguais: o dia em que
um botão `md` precisar de um tamanho diferente do rótulo padrão do sistema
(ou vice-versa), os nomes já estão separados para divergir sem migração.
Colapsá-los num só token hoje pouparia uma referência, mas prenderia as duas
famílias ao mesmo valor por acidente de implementação, não por decisão.

### D2 — Desabilitado: tokens próprios, isentos de piso de contraste por WCAG 1.4.3

`color.action.disabled` novo (`{color.gray.300}` claro / `{color.gray.700}`
escuro — mais claro que os textos do tema, mais escuro que as superfícies,
lendo como "desligado" nos dois temas). Para o texto sobre esse fundo, a
medição comparou criar um quinto papel (`color.text.disabled`) contra
reaproveitar `color.text.muted`: `muted` já é "texto que não é o principal"
nos dois temas, e sobre um fundo neutro claramente mais discreto que a ação
em repouso a leitura de "presente, mas não primário" já é o que `disabled`
precisa comunicar — decisão: reaproveitar `color.text.muted`, sem papel
novo sem consumidor fora deste par. `component/button.json` ganha
`disabled.background` (→ `color.action.disabled`) e `disabled.text` (→
`color.text.muted`).

Isenção de contraste: WCAG 1.4.3 (Contrast Minimum) isenta explicitamente
"texto ou imagens de texto que fazem parte de um componente de interface
inativo" do piso de 4,5:1. Botão desabilitado é esse caso. A checagem
(`contrast.ts`) passa a relatar o par mas não reprová-lo por esse piso,
nomeando a isenção na mensagem — nunca como ausência silenciosa.

**Alternativa considerada:** forçar 4,5:1 no par `disabled` como nos demais
estados. Descartada: a referência normativa (WCAG) não exige, e forçar mais
contraste do que o necessário empurraria o cinza de fundo desabilitado para
mais escuro/claro do que o resto do sistema usa para "neutro discreto", sem
ganho de acessibilidade real — o piso estrito existe para estado que
comunica informação por cor; desabilitado comunica por semântica (atributo
nativo), não por contraste.

### D3 — Pendência: `Button` repassa `isPending` à primitiva; `Spinner` entra ao lado do conteúdo, nunca no lugar dele

`AriaButton` já implementa `isPending` nativamente — desliga press/hover,
mantém o elemento focalizável, e expõe `isPending` como render-prop de
`children`. `Button` só aceita e repassa a prop.

**Correção medida durante a aplicação:** a primeira versão desta decisão
trocava o conteúdo normal por `<Spinner>` via a função de `children`. Medido
contra a fonte de `react-aria-components`
(`dist/private/Button.mjs`): a primitiva **nunca troca `children` sozinha** —
ela sempre renderiza o que o consumidor passa, e `isPending` chega como
render-prop para o consumidor decidir o que fazer, nada mais. Trocar o
conteúdo era decisão só do wrapper, e ela apagava o nome acessível de um botão
rotulado por texto (sem `aria-label`) assim que a pendência começava — a
checagem de acessibilidade não pegou porque as duas histórias de pendência
originais só cobriam o caso `aria-label` (ícone só), onde o nome sobrevive por
vir de um atributo, não do conteúdo. Decisão corrigida: `children` (e o ícone,
quando houver) permanecem renderizados o tempo todo; `<Spinner>` aparece **ao
lado**, quando `isPending`. O nome acessível de um botão de texto continua
vindo do próprio texto, pendente ou não.

`Spinner`: SVG com anel parcial em rotação, `stroke` = `color.action.primary`
(mesma cor de marca da ação — para que o spinner dentro de um `Button`
`primary` leia como "a mesma ação, ainda em curso", não uma cor nova), e
tamanho referenciando o degrau de `text.control` correspondente ao `size` do
`Button` que o compõe. `component/spinner.json` nasce com esse componente,
na mesma mudança — é o segundo caso da regra nova (`rules.design`),
depois do próprio `component/button.json` estendido.

**Alternativa considerada:** prop de estilo dentro de `Button` (padrão
`loadingIndicator` do Material UI). Descartada pela regra já registrada em
`rules.design`: "tokens de componente não são compartilhados... precisar de
tokens próprios é o que faz algo ser componente, e não propriedade" — o
indicador tem visual próprio (o anel), logo tokens próprios, logo é
componente próprio.

### D4 — ARIA/PressEvent: alargar o tipo pelo nome, não abrir para todo `AriaButtonProps`

`ButtonProps` ganha três props tipadas explícitas —
`aria-expanded?: boolean`, `aria-controls?: string`,
`aria-describedby?: string` — repassadas ao `AriaButton`. `onPress` muda de
`() => void` para `(e: PressEvent) => void`, alinhado à assinatura que
`react-aria-components` já usa.

**Alternativa considerada:** estender `ButtonProps` com
`ComponentProps<typeof AriaButton>` inteiro. Descartada: abriria de uma vez
props que nenhum consumidor pede hoje (`type="submit"`, `form*`, `href`) e
que nenhuma decisão deste pacote cobre ainda (nenhuma rota de negócio, nenhum
formulário) — é a mesma lacuna de enumeração sem controle que o resto deste
ciclo está fechando do lado dos tokens; abrir a porta inteira do lado do
tipo por conveniência reintroduziria o problema do outro lado.

### D5 — Enumeração de pares de ação/estado em `contrast.ts`

`ContrastInput` (hoje: campos fixos `action`/`hover`/`onAction`) passa a
descobrir, a partir da fonte resolvida, todo token que casa com
`color-action-<estado>` e o papel de texto correspondente, no mesmo padrão
de `SURFACE` (regex) e de `paletteInput` (`color-chart-series-\d+`). Os dois
nomes especiais que o requisito de hover já nomeia — `primary` (repouso) e
`primary-hover` — continuam conferidos ao piso de 4,5:1. Qualquer estado
adicional (`disabled`, e o que vier depois) entra como "estado extra",
sempre relatado; só é isento do piso quando nomeadamente listado como tal
(hoje, só `disabled`, por WCAG 1.4.3) — um estado extra não listado reprova
ao piso padrão, para que a isenção não vire porta aberta para um par futuro
escapar da checagem sem justificativa registrada.

### D6 — Prova de tipo: repor o plantio, não a máquina que o carregava

`793d8e2` ("remove a máquina de contratos de estado das três camadas")
removeu três coisas de uma vez, no mesmo commit: (1) `contract.ts`
(`AtomContract`/`defineAtom`/`defineContract`, um contrato enumerável em
tempo de execução — nome, componente, lista de estados), (2)
`stories-coverage.test.ts`, que cruzava essa lista contra as tags
`state:<valor>` das histórias do Storybook para provar "todo estado
declarado tem história" em átomos, primitivas de domínio, formas de gráfico
e a moldura, e (3) `contracts.typecheck.tsx`, um arquivo único e
compartilhado de plantios `@ts-expect-error` provando que a checagem de
tipos recusa uso ilegal — entre eles, o que este change repõe: `Button` sem
`children` nem `aria-label` não compila.

**O que meço:** `contracts.typecheck.tsx`, na íntegra do que o commit
apagou, importava só os componentes (`Button`, `DeclaredAbsence`, `Heading`,
`Icon`, `NumericValue`, `StatusMarker`, `Text`) — nenhuma linha dele
importava `defineAtom`, `AtomContract` ou qualquer coisa de `contract.ts`.
As duas coisas removidas junto com ele — o contrato enumerável e a
cobertura de histórias por estado — dependiam uma da outra; o plantio de
tipo não dependia de nenhuma das duas.

**O que concluo:** a razão de remover (1)+(2) não está registrada em commit
nem em documento — não afirmo o motivo do dono, só o que dá para medir.
`docs/decisao-biblioteca-de-componentes.md` ("Cobertura: quando combinação
ganha história", escrita dois dias antes) já vinha revisando a regra de
"todo estado declarado tem história" para "todo valor de toda variante tem
história — não toda combinação", exatamente o formato que a máquina de
contrato/cobertura (um estado, uma string, uma tag) não foi desenhada para
expressar à medida que as primitivas ganharam variantes compostas (peso ×
destaque, e agora tamanho × desabilitado × pendência). É a explicação mais
sustentada pelo que dá para ler; registro como leitura, não como fato
confirmado. O plantio de tipo (3), por não ter essa dependência estrutural,
saiu como efeito colateral da limpeza — não porque a prova em si tenha
deixado de valer: a garantia que ele provava (`Button` sem nome acessível
não compila) continua *verdadeira no tipo* hoje, só sem nada em
`pnpm verify` que reprove se ela regredir.

**O que este change repõe, e o que deixa de fora:** um arquivo de plantio
por componente (`atoms/button/button.typecheck.tsx`, o primeiro), cada um
importando só o componente que prova, com `@ts-expect-error` e uma
justificativa de uma linha por uso ilegal — sem `defineAtom`, sem lista de
contratos, sem cruzamento contra cobertura de história. É deliberadamente
menos máquina do que existia antes: prova de tipo e cobertura de história
por estado são duas garantias diferentes, e só a primeira volta aqui. A
segunda — se um dia voltar — é decisão própria, com a mesma pergunta que
R5 já registra (quando combinação merece história) resolvida primeiro.

### D7 — Spinner e `prefers-reduced-motion`: sem token de movimento, decisão registrada

O toggle em si é estrutural, não um valor: `spinner.module.css` aplica
`@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }`
— uma media query, não um literal de design.

**Correção do dono, na aplicação:** o requisito "Spinner respeita
preferência de movimento reduzido" (`specs/interface-atoms/spec.md`) foi
removido do delta — decisão do dono, recusada, não adiada, sem gatilho de
reabertura (ver `docs/pontos-abertos.md`, ponto 15 fechado como recusado). A
regra CSS acima **permanece** em `spinner.module.css`: é comportamento
correto, é a leitura padrão de `prefers-reduced-motion` que qualquer
elemento animado deveria ter, e não depende de requisito nenhum para
justificar sua existência. **A ausência de requisito não é indício de código
órfão** — não a apague por achar que sobrou de uma tarefa desfeita; ela nunca
teve uma tarefa que a desfizesse, só deixou de ter uma prova formal cobrindo
o caso "com a preferência".

A duração e a curva da animação, quando ela roda, são outra história:
`packages/tokens` não declara hoje nenhum eixo de movimento — nenhum
arquivo em `primitive/`, `semantic/` ou `component/` tem `$type` de
duração, easing ou equivalente. `Spinner` é o primeiro consumidor. Decisão:
usar um valor literal (`animation-duration`, `animation-timing-function`)
direto no CSS Module do componente, sem token. Justificativa, medida contra
as regras existentes, não suposta: `animation-duration` e
`animation-timing-function` não estão em `GUARDED_PROPERTIES`
(`tools/checks/style-literals.test.ts`), e "movimento" não está na lista de
`rules.design` ("cor, espaçamento, raio, sombra ou tipografia") — o eixo
nunca foi medido, o mesmo formato de lacuna que R3 e R6 registram para
tamanho e tom.

**Onde este caso difere de R3/R6, e por que não escala igual:** R3 e R6 são
escalas de N valores com um consumidor escolhendo entre eles — é aí que
inventar um nome de escala seria suposição. Aqui há um consumidor só
(`Spinner`) e nenhuma variação a nomear: não é uma escala se inventando, é
uma constante de implementação de um efeito visual único. Registro a
ausência do eixo — não invento token para uma constante sem segundo
consumidor.

**Gatilho:** um segundo componente animado que precise da mesma duração
(candidato a token compartilhado), ou que precise de uma duração diferente
por contexto (candidato a variante), é o que forçaria medir um eixo de
movimento — como R3/R6, hoje nenhum precisa.

### D8 — Spinner é decorativo (`aria-hidden`), não uma região viva própria

**Correção medida durante a aplicação.** A versão original desta decisão
dava a `Spinner` `role="status"` — uma região viva do ARIA —, supondo que
precisava anunciar o próprio progresso a tecnologia assistiva. Medido contra
a fonte de `react-aria-components` (`dist/private/Button.mjs`, versão
1.21.1): `Button` com `isPending` já observa a própria transição de
pendência com um `useEffect` que chama o anunciador ao vivo da biblioteca
(`announce(message, 'assertive')`) quando o botão está focado no momento da
mudança — a mensagem é `aria-labelledby` apontando para o próprio nome do
botão (mais um `id` reservado para um indicador de progresso composto, via
`ProgressBarContext`, que `Spinner` não consome). O anúncio já existe, vem
da primitiva, e não depende de nada em `Spinner`.

Uma região viva sem conteúdo de texto, por outro lado, não anuncia nada —
`role="status"` sem filho textual é um live region vazio: não há o que ler
quando ele aparece, e a inserção inicial de um live region normalmente nem é
lida pela maioria dos leitores de tela. O `role="status"` anterior não
preenchia a lacuna que motivou D3 original; só parecia preenchê-la.

**Decisão:** `Spinner` é puramente decorativo — `aria-hidden="true"`, sem
papel ARIA. O anúncio da pendência é responsabilidade inteira de
`Button`/`react-aria-components`, que já o faz. `data-spinner` substitui
`role="status"` como gancho de consulta em teste, no mesmo padrão de
`data-hatch` em `Hatch`.

**O que isso muda no requisito de `Spinner`:** a versão original do
requisito "Spinner comunica progresso indeterminado" (`specs/interface-
atoms/spec.md`) afirmava que `Spinner` "SHALL expor esse estado a tecnologia
assistiva" por conta própria — falso, pela medição acima. O requisito foi
corrigido para descrever o que de fato acontece: `Spinner` é decorativo, e a
comunicação do estado de pendência a tecnologia assistiva é responsabilidade
de `Button`, que a primitiva já cumpre.

**Alternativa considerada:** dar a `Spinner` um texto visualmente oculto
("Carregando", ou semelhante) dentro do `role="status"`, para que a região
viva tivesse algo a anunciar por conta própria, redundante com o anúncio que
`Button` já faz. Descartada: duplicaria o anúncio para quem usa `Spinner`
só dentro de `Button` — o único consumidor real hoje — sem medir um caso em
que o anúncio da primitiva não bastasse.

**Gatilho:** um consumidor de `Spinner` fora de um `Button` com `isPending`
— algo que precise de progresso indeterminado sem o anúncio que a primitiva
já dá — é o que reabriria esta decisão.

## Risks / Trade-offs

- [Risco] A isenção de contraste do par `disabled`, lida rápido, pode passar
  como "a checagem não olhou esse par" → [Mitigação] a mensagem nomeia a
  isenção e a razão (WCAG 1.4.3) explicitamente; nunca omite o par (D2,
  cenário "Par desabilitado é relatado, não reprovado").
- [Risco] `ButtonProps` ganha `aria-expanded`/`aria-controls`/
  `aria-describedby` sem consumidor construído ainda — a tarefa 7.3 só é
  feita depois deste ciclo → [Mitigação] `react-aria-components` já suporta
  os três nativamente; o risco é só de tipo, não de comportamento não
  testado, e fica coberto por história e por `contracts.typecheck.tsx`.
- [Risco] **BREAKING** em `onPress` muda a assinatura para todo consumidor
  existente → [Mitigação] hoje só as histórias do próprio `Button` chamam
  `onPress`; tarefa de fechamento confere por `grep` se algum outro arquivo
  do pacote passa `onPress` como `() => void` e ajusta, nomeando o achado no
  PR de aplicação.
- [Risco] a escala `text.control` de três degraus pode não bastar quando
  `Icon`/`Text`/`Heading` chegarem com necessidades próprias de tamanho →
  [Mitigação] nomeada como decisão do primeiro consumidor (`Button`); o
  ciclo de cada um mede de novo se três degraus bastam, sem obrigação de
  reaproveitar os mesmos nomes.
- [Risco] repor a prova de tipo só de `Button` deixa `Icon`, `Heading` e
  `Text` sem a garantia que também perderam em `793d8e2` e ainda existem
  hoje, por tempo indefinido → [Mitigação] escopo nomeado em Non-Goals; cada
  um repõe quando o próprio ciclo tocar o componente — o risco real é alguém
  tratar o silêncio como "resolvido para o pacote todo", por isso fica
  registrado aqui e não só implícito no código.
- [Conflito, resolvido na aplicação] `tasks.md` (tarefa 5.3) pede verificação
  de cobertura de história por `stories-coverage.test.ts`, que D6 decide não
  repor → [Resolução] apresentado ao dono do repositório; decisão: manter D6
  (mais recente e mais específica) e não criar o mecanismo — confirmado à mão
  que todo estado declarado tem história própria, sem combinar eixos, sem
  prova automatizada de que isso continua valendo depois desta mudança.
- [Risco, medido na aplicação, recusado pelo dono] a bancada não emula
  `prefers-reduced-motion` no navegador: `@vitest/browser/context`
  (`commands`), a ponte que permitiria acionar `page.emulateMedia` do
  Playwright a partir de uma história, lança em runtime sob a combinação de
  versões que este repositório fixa (`@storybook/addon-vitest@10.6.0`
  declara peer `vitest@^3||^4`; o repositório fixa `vitest@5.0.1`) →
  [Decisão do dono] o requisito "Spinner respeita preferência de movimento
  reduzido" foi removido do delta — recusado, não adiado, sem gatilho (ponto
  15 de `docs/pontos-abertos.md`, fechado como recusado). A regra CSS
  permanece em `spinner.module.css` (D7) como comportamento correto sem
  requisito que a cubra; a história "Sem movimento reduzido" continua
  existindo como documentação viva, sem pretender provar a preferência
  ativa.

## Migration Plan

Não há dado em produção a migrar. A ordem de aplicação é a de `tasks.md`:
dentro de cada grupo de tarefa, o token nasce no mesmo commit revisável que
o componente que o consome — nunca token isolado sem o componente que o usa,
pela regra registrada em `rules.design`.
