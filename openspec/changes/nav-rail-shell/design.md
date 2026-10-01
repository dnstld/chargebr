# Design

## Context

`docs/maquete-navegacao.html` é o alvo de aceite: trilha de ícones (56px,
altura total) + painel com árvore aninhada (248px) + conteúdo com barra
própria. Ver `proposal.md` para o porquê e o que fica de fora.

Hoje, `organisms/nav/panel/nav-panel.tsx` recebe `sections:
NavSectionProps[]` (lista plana, sem aninhamento) e `organisms/app-frame/`
é o único componente realmente ligado a `apps/backoffice/app/layout.tsx`
(sem `nav` preenchido). `shell-components` já declara, na própria
`Purpose`, que seu inventário "não liga nenhum destes componentes a uma rota
real" — é o mesmo regime sob o qual este ciclo trabalha, só que para mais
componentes.

A fonte de tokens tem três camadas (primitiva → semântica → componente), cada
uma só referenciando a anterior (`design-tokens`, "Três camadas com
referência dirigida"). Hoje, todo token semântico de cor é definido em
`semantic/light.json`/`semantic/dark.json` — um valor por tema. O único
precedente de token que **não** varia por tema é `semantic/shared.json`, hoje
usado só para espaço, raio, sombra e tipografia: qualquer arquivo de uma
camada que não se chame `light.json`/`dark.json` vale nos dois temas
(`packages/tokens/src/source.ts`, `themeOfFile`) — mecanismo já testado
(`rules.test.ts`), nunca usado para cor.

A checagem de contraste (`packages/tokens/src/contrast.ts`) descobre
superfícies e ações automaticamente pelos prefixos `color-surface-*` e
`color-action-*` do nome gerado, por tema. Qualquer token novo sob esses
prefixos entra na varredura por tema sem edição do arquivo de checagem — e
entraria errado para um conjunto que não varia por tema, porque a varredura
mede a ação do tema **ativo** contra a superfície **daquele tema**.

## Goals / Non-Goals

**Goals:**
- Compor, só na bancada (nenhuma rota de `apps/backoffice` passa os slots
  novos), a forma exata da maquete: `AppFrame` com `rail` (`NavRail`) e `nav`
  (`NavPanel` com `NavTree`) preenchidos.
- Dar à árvore uma forma de dado hierárquica e opaca, pronta para um
  resolvedor GraphQL futuro popular sem redesenho (`docs/forma-do-produto.md`).
- Declarar o primeiro conjunto de token que não varia por tema sem violar a
  regra de três camadas nem a varredura de contraste por tema existente.
- Generalizar "todo texto por propriedade" para o inventário de
  `shell-components`, com o guardião mecânico cobrindo os perímetros que este
  ciclo cria ou toca.
- Corrigir ABEV → ABVE nas fixtures sintéticas existentes.

**Non-Goals:**
- Mudar `AppFrame` ou `apps/backoffice/app/layout.tsx` — ver `proposal.md`,
  "O que esta mudança não faz".
- Resolver o eixo de separação de aplicações, a leitura de dado via GraphQL,
  ou qualquer pergunta em aberto de `docs/forma-do-produto.md` além de moldar
  o dado da árvore para não colidir com uma resposta futura.
- Estender o guardião de vocabulário a `interface-atoms`/`interface-charts`.
- Decidir que o shell real oferece escolha explícita de tema.

## Decisions

### D1 — `AppFrame` ganha o slot `rail`; nada de moldura paralela

**Medido, não suposto.** A primeira versão deste design propunha uma
composição nova e paralela (`NavShell`), por receio de que mudar `AppFrame`
arriscasse o contrato de `backoffice-shell`. Esse receio foi contrariado e
teve que ser medido antes de ser defendido: um protótipo descartável
acrescentou `rail?: ReactNode` a `AppFrame` (renderizado como irmão
condicional do salto, igual ao padrão que `nav` já usa) e uma regra CSS
`.frame[data-shape="shell"]` (grade de três colunas), sem tocar
`apps/backoffice/app/layout.tsx` — que continua sem passar `rail` nem `nav`.
Com a construção real executada e as doze afirmações de
`apps/backoffice/tests/emitted-document.test.ts` rodadas sobre ela: as doze
passaram, e o `<body>` emitido ficou **byte a byte idêntico** ao de antes do
protótipo. As duas únicas diferenças, nenhuma delas num marco ou numa
região: o hash do arquivo CSS gerado (efeito inevitável de qualquer edição em
`app-frame.module.css`, não desta em particular) e um `null` a mais no
payload de hidratação — o filho condicional de `rail` quando ausente —, que
não produz nó de DOM nenhum. O protótipo foi revertido depois da medição
(`git checkout --`); nada dele entra nesta mudança como está — o que entra é
a propriedade `rail` e a regra CSS, desenhadas para já nascerem como código
revisável, não como protótipo.

Isso derruba a premissa da duplicação: duas molduras no mesmo pacote seria
exatamente o tipo de duplicação que as regras vigentes já recusam em outro
plano (tokens de componente não compartilhados, componente genérico sem
consumidor é catálogo) — manter uma moldura só, com uma propriedade a mais,
é a forma que essas regras já favorecem, e a medição confirma que o custo
temido (arriscar `backoffice-shell`) não existe. `AppFrame` ganha `rail`
como propriedade independente — não
um quinto campo do slot de `nav`, porque não compartilha a razão de ser de um
slot controlado (sem gatilho, sem estado aberto/fechado) — e a forma de três
colunas da maquete passa a ser **a mesma `AppFrame`**, condicionada por CSS à
presença de `rail`/`nav`, nunca por um segundo componente de moldura.
Delta completo em `specs/backoffice-shell/spec.md` deste ciclo.

**Consequência para a composição da tela:** não há mais `NavShell` nem
`NavTopbar`. O que a maquete chama de "barra do conteúdo" é o `.header` que
`AppFrame` já tem — Logo mais o gatilho de hambúrguer que já existe —,
reposicionado por CSS para a coluna de conteúdo quando `rail`/`nav` estão
presentes; nenhum componente novo precisa existir só para isso. O botão de
alternância de tema que a maquete mostra ali **não é reproduzido**: é
convite visual do arquivo estático, não uma propriedade nova de `AppFrame` —
acrescentar um slot só para herdar aquele visual seria inventar superfície de
API para um recurso que `backoffice-shell` ("Tema sem script") explicitamente
reserva como decisão futura, e a bancada já tem alternância de tema própria
(o controle do Storybook), tornando um botão dentro do componente redundante
para o propósito de exercitar os dois temas.

**O que continua precisando de prova, e onde:** o gatilho de `nav` (estado,
breakpoint, foco) não muda — seus cenários em `backoffice-shell` continuam
intactos. `rail` ganha os cenários próprios do delta: renderiza sem exigir
nada do slot de navegação, e — o que a medição provou — o documento emitido
por `apps/backoffice` não muda quando os dois seguem ausentes, citando o
teste real como prova, não um teste novo que o duplicasse.

### D2 — Árvore reaproveita a forma controlada de `AppFrame`, mas o estado de cada pasta é interno

Cada pasta da árvore guarda seu próprio `aria-expanded` com `useState`
dentro de `NavTree` (`"use client"`), não por propriedade controlada de
fora. **Por quê diferente de `AppFrame`:** o estado de aberto/fechado de
`AppFrame` é controlado de fora porque **quem compõe** precisa decidir o
breakpoint e a sobreposição — é estado de layout. O estado de cada pasta é
puramente de apresentação da própria árvore, do mesmo tipo que `NavPanel` já
guarda via `FocusScope` internamente. Controlá-lo de fora exigiria que quem
compõe a árvore conhecesse a identidade de cada pasta — o oposto de receber a
árvore como dado opaco (D4).

### D3 — Token de conjunto fixo: grupo semântico novo em `shared.json`, nunca sob `color.surface.*`/`color.action.*`

Grupo novo `color.nav.*` em `semantic/shared.json` (cor, pela primeira vez,
num arquivo que até aqui só tinha espaço/raio/tipografia — o mecanismo de
"vale nos dois temas" já existe e já é testado; não é extensão de
infraestrutura, é primeiro uso para cor):

| Token | Primitivo | Papel |
| --- | --- | --- |
| `color.nav.rail` | `{color.gray.950}` | fundo da trilha |
| `color.nav.panel` | `{color.gray.900}` | fundo do painel e da barra de conteúdo |
| `color.nav.edge` | `{color.gray.800}` | borda/divisor |
| `color.nav.hover` | `{color.gray.800}` | fundo de item em repouso sobre hover |
| `color.nav.text` | `{color.gray.300}` | texto em repouso |
| `color.nav.text-strong` | `{color.gray.100}` | texto enfatizado/hover |
| `color.nav.text-muted` | `{color.gray.500}` | texto apagado, rótulo de seção |
| `color.nav.current` | `{color.indigo.700}` | fundo da pílula corrente |
| `color.nav.current-text` | `{color.white}` | texto sobre a pílula corrente |
| `color.nav.accent` | `{color.indigo.300}` | barra de corrente da trilha, ponto da folha corrente, anel de foco dentro da moldura |

Nenhum literal novo: todo valor já existe como primitivo, porque a maquete
reaproveita exatamente os tons que o tema escuro já usa para superfície e
texto (`color.gray.950/900/800/300/100/500`) — e dois tons de índigo já
existentes para dois papéis diferentes: `indigo.700` (hoje a ação do tema
claro) para o preenchimento da pílula corrente, `indigo.300` (hoje a ação do
tema escuro) para os acentos menores. A maquete escolhe essa dupla porque o
preenchimento sólido precisa do contraste alto de texto branco por cima —
exatamente o par já medido em `design-tokens` para o tema claro, 12,21:1 —
enquanto o acento (barra de 2px, ponto de 5px, anel de foco) é objeto
gráfico, ao piso de 3:1, e usa o tom pensado para se destacar sobre fundo
escuro. Nenhum dos dois tokens muda de valor por tema: a trilha nunca segue o
tema do leitor (decisão do dono).

Nomes fora dos prefixos `color.surface.*`/`color.action.*` de propósito — são
os dois prefixos que `contrast.ts` varre automaticamente por tema
(`SURFACE`/`ACTION`, em `contrast.ts`). `color.nav.*` nunca entra nessa
varredura, e é isso que o requisito novo de `design-tokens` exige e testa.

### D4 — Medição de contraste do conjunto fixo: reaproveita `measureTheme`, não `checkContrast`

`checkContrast`/`themeViolations` embutem invariantes específicas do par
tema-que-rotaciona — em especial, "o anel de foco é sempre o mesmo valor que
a ação" (`themeViolations`, checagem `focus`). Essa invariante não vale para
o conjunto fixo: `color.nav.current` (pílula, `indigo.700`) e
`color.nav.accent` (acento/foco, `indigo.300`) são, de propósito, dois
valores diferentes — a maquete os distingue para dois papéis diferentes
(preenchimento de texto vs. objeto gráfico). Reusar `checkContrast` sem
alteração reprovaria um par que não deveria reprovar.

A checagem nova (`packages/tokens/src/nav-contrast.test.ts`) chama só
`measureTheme` (que apenas mede pares — ação × superfícies ao piso de texto,
anel × superfícies ao piso de objeto gráfico — sem a invariante de
igualdade) com um único `ContrastInput` sintético: `surfaces` = `[nav.rail,
nav.panel, nav.edge]`, `action` = `nav.current`, `onAction` =
`nav.current-text`, `focusRing` = `nav.accent`, sem `hover` (o conjunto fixo
não declara estado de hover de ação — só os componentes que o consomem
declaram hover de interação, D6). Sem `hover`, os diagnósticos de passo
entre temas de `measureTheme` já saem `null` por conta própria — nenhum
código precisa suprimi-los. As próprias asserções do teste (margem ≥ 0 por
par, piso nomeado na mensagem de falha) reproduzem o formato de
`themeViolations` manualmente, sem importar a função: são ~10 linhas, e
importar uma função pensada para invariantes que não valem aqui seria mais
confuso do que reescrevê-las.

**Alternativa descartada:** adicionar um terceiro "tema" fixo a
`THEMES`. Rejeitada porque `THEMES` tipa `Theme` como `"light" | "dark"` em
todo o resto do pacote (geração, DTCG, varredura por tema) — um terceiro
elemento mudaria a superfície de muito mais código do que este ciclo precisa
tocar, para resolver um problema que uma função já exportada resolve sozinha.

### D5 — Base/raised trocam; sunken absorve a colisão, espelhando o escuro

`semantic/light.json`: `color.surface.base` passa de `{color.white}` para
`{color.gray.50}`; `color.surface.raised` continua `{color.white}`.
`color.surface.sunken` passa de `{color.gray.50}` para `{color.gray.50}` —
ou seja, **sunken e base passam a coincidir no claro**. Não é acidente:
`semantic/dark.json` já declara `surface.base` e `surface.sunken` iguais
(`{color.gray.950}` os dois) desde antes deste ciclo — o claro passa a seguir
o mesmo padrão que o escuro já tinha, em vez de inventar um quarto tom de
cinza sem consumidor que o justifique hoje. `color.chart.surface` continua
`{color.white}` — deixa de coincidir com `base` e passa a coincidir só com
`raised`, que é o que a checagem "Superfícies de gráfico declaradas por tema"
já exige (ser uma das superfícies neutras declaradas, não necessariamente
`base`).

Consumidores ajustados, sem mudança de comportamento pretendida:
- `packages/ui/src/bench/bench.module.css` (`--color-surface-base`) — a
  superfície de fundo da bancada fica cinza-claro em vez de branca; é o
  efeito pretendido da troca, não um ajuste.
- `packages/ui/src/organisms/app-frame/app-frame.module.css` — `.frame` usa
  `--color-surface-base` (passa a cinza-50) e `.skip` usa
  `--color-surface-raised` (continua branco); nenhuma edição de valor, só
  confirmação de que o par `color.focus.ring` × `surface.raised` dentro do
  salto continua medido (já está na matriz de `design-tokens`).
- `packages/ui/src/organisms/charts/chart.assert.ts` — o comentário que
  documenta `color.chart.surface`/`color.surface.base` resolvendo para o
  mesmo valor deixa de ser verdade; reescrito para nomear `surface.raised`.

### D6 — Folha da árvore é um componente novo (`NavLeaf`), não uma extensão de `NavItem`

`NavItem` já tem componente de token próprio (`component/nav-item.json`) que
fixa o estado corrente em `{color.action.primary}` — a cor de ação do **tema
ativo**. Dentro da árvore, a pílula corrente precisa de `{color.nav.current}`
— fixo, nunca a cor de ação do tema. Dar a `NavItem` duas fontes de token
possíveis, dependendo de onde é renderizado, violaria "tokens de componente
não são compartilhados entre componentes" ao contrário: um componente com
dois conjuntos de token é o sintoma de que são dois componentes. `NavLeaf`
(`atoms/nav/leaf/`) nasce como família de `Link`, igual a `NavItem`, com
`component/nav-leaf.json` próprio referenciando `color.nav.*`, mais as duas
propriedades que a maquete acrescenta à folha — `dot` (booleano, o marcador
antes do rótulo, ausente na folha de primeiro nível) e `meta` (conteúdo à
direita, a contagem). `NavItem` continua como está, sem as propriedades
novas: nenhum consumidor dele precisa delas.

Pela mesma razão, a pasta da árvore (`NavFolderTrigger`, `atoms/nav/`) e o
botão da trilha (`NavRailItem`, `atoms/nav/`) são componentes novos, cada um
com seu próprio arquivo de token referenciando `color.nav.*` — nenhum dos
dois reaproveita o token de `Button` (que seguiria a cor de ação do tema).
`NavRailItem` compõe `Button` como primitiva base (acrescentando a `Button` a
propriedade opcional `aria-current`, que a maquete usa no botão da trilha, e
que não existe hoje no contrato de `Button`) e redefine os tokens dela;
`NavFolderTrigger` também compõe `Button`, redefinindo para o chevron e o
estado expandido.

### D7 — `Avatar` nasce com o token do único consumidor real

`Avatar` (`atoms/avatar/`, genérico — iniciais e nome acessível, sem nada de
navegação no nome ou no tipo) ganha `component/avatar.json` referenciando
`color.nav.hover` (fundo) e `color.nav.text-strong` (iniciais) — o estilo do
único consumidor construído nesta mudança, o rodapé de `NavRail`. Não é
promessa de que todo avatar futuro será escuro: é a mesma regra que já
governa o resto do pacote (componente genérico sem consumidor construído é
catálogo, não lacuna) aplicada ao caminho inverso — um componente **com**
consumidor estiliza para esse consumidor, e um segundo consumidor com
necessidade diferente é o gatilho para uma variante, exatamente como
`Logo` ganhou `variant` só quando um segundo consumidor real apareceu (D8).

### D8 — `Logo` ganha `variant`; SVG de marca isolada é recurso novo, sem cor no componente

`variant?: "horizontal" | "mark"`, padrão `"horizontal"` — nenhum consumidor
existente muda de comportamento. O SVG novo
(`packages/ui/src/atoms/logo/logo-charge-br-mark.svg`) contém só o raio
amarelo que já existe, idêntico, dentro do SVG horizontal — mesmo
path, extraído como arquivo próprio, mesma cor fixa no arquivo (nunca no
componente), mesma disciplina que already rege os dois SVGs existentes
(`docs/decisao-identidade-visual.md`). Variante `vertical` continua sem prop
que a selecione — este ciclo não é o gatilho dela.

### D9 — Dado da árvore: tipo discriminado, recursivo, sem nada do componente nele

```ts
type NavTreeNode =
  | { kind: "page"; id: string; label: string; href: string; meta?: ReactNode; isCurrent?: boolean }
  | { kind: "folder"; id: string; label: string; children: readonly [NavTreeNode, ...NavTreeNode[]]; isCurrent?: boolean };
```

`id` é a única concessão a identidade estável (chave de lista e de estado de
`aria-expanded` por pasta, D2) — não é rota, não é href de pasta (pasta não
navega, só expande). `dot` não é campo do dado: é decisão de apresentação de
`NavTree` (acende para todo `page` que não esteja no primeiro nível,
apagado para o de primeiro nível) — a maquete amarra o ponto à profundidade,
não ao conteúdo, e o dado não precisa carregar o que a posição já diz.

## Risks / Trade-offs

- **[Risco]** Nove tokens novos em `color.nav.*`, quatro componentes novos
  com arquivo de token próprio, mais um teste de contraste novo — superfície
  grande para uma mudança de bancada. **Mitigação:** nenhum valor é
  primitivo novo (todos já existem e já são medidos em outro papel); a
  checagem nova reaproveita `measureTheme` sem duplicar lógica de limiar.
- **[Risco]** `color.nav.hover` e `color.nav.edge` compartilham o mesmo
  primitivo (`gray.800`) por papéis diferentes — uma mudança futura em um
  pode, por engano, parecer que deveria mudar o outro também.
  **Mitigação:** nomes e `$description` próprios em `shared.json` deixam os
  dois papéis explícitos; nenhum dos dois é alias do outro.
- **[Risco]** `interface-charts` fica com uma regra nova que ela já viola
  (`value-table.tsx`) e que este ciclo não corrige. **Mitigação:** registrado
  como ponto aberto novo em `docs/pontos-abertos.md` (tarefa 8 de
  `tasks.md`), com gatilho nomeado — não fica esquecido, fica adiado por
  escrito.
- **[Risco]** `AppFrame` passa a ter duas formas de CSS (bloco vertical sem
  `rail`/`nav`; grade de três colunas com algum dos dois) dentro do mesmo
  componente, em vez de uma só. **Mitigação:** a forma de bloco é a regra
  `.frame` sem seletor de atributo, byte a byte a que já existe; a grade
  inteira vive atrás de `.frame[data-shape="shell"]`, que só casa quando
  `rail`/`nav` está presente — medido (D1) que a ausência dos dois não muda o
  CSS computado nem o DOM do documento real.

## Migration Plan

Sem produção envolvida — tudo nasce ou muda na bancada, e `AppFrame` ganha
uma propriedade que `apps/backoffice/app/layout.tsx` continua sem passar.
Ordem dentro do PR de aplicação, cada passo com seu teste antes do próximo
depender dele:

1. Tokens: grupo `color.nav.*` em `shared.json`; `base`/`raised`/`sunken` em
   `light.json`; arquivos de componente novos. Geração e checagem de
   contraste (existente e nova) passando antes de qualquer componente.
2. Átomos: `NavLeaf`, `NavFolderTrigger`, `NavRailItem` (com a propriedade
   nova de `Button`), `Avatar`, `Logo` com `variant` e o SVG novo.
3. `NavTree` (recursivo, `"use client"`), depois `NavPanel` reescrito para
   consumi-la, depois `NavRail`.
4. `AppFrame`: propriedade `rail` e a grade condicional (D1) — com
   `apps/backoffice/tests/emitted-document.test.ts` confirmando, na
   construção real, que nada mudou. Depois, a história de bancada que compõe
   `AppFrame` com `rail`/`nav` preenchidos, reproduzindo a maquete inteira.
5. Guardião de vocabulário: perímetros novos. Guardião de fixture: automático
   (varre `fixtures/` por desenho), só a fixture nova precisa das duas
   declarações.
6. Correção ABEV → ABVE nos quatro arquivos existentes.
7. `rules.design` em `openspec/config.yaml`: regra de texto por propriedade
   individual.
8. `docs/pontos-abertos.md`: ponto novo sobre o vocabulário fora de
   `interface-charts`.

Nenhum passo altera `apps/backoffice/`; não há rollback de produção a
planejar.
