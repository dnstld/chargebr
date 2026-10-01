# Proposal

## Why

`docs/maquete-navegacao.html` é o alvo de aceite aprovado pelo dono para a tela
de navegação do back office: trilha de ícones + painel com árvore aninhada, em
altura total, ao lado de um conteúdo com barra própria. O que existe hoje em
`organisms/nav/` (`NavPanel` com seções planas, sem aninhamento) e
`organisms/app-frame/` (cabeçalho no topo, sem trilha) não tem essa forma. A
unidade deste ciclo é a tela inteira, não um componente isolado.

## What Changes

- **BREAKING**: `NavPanel` troca `sections: NavSectionProps[]` (lista plana)
  por uma árvore de dados hierárquica (pasta/folha, aninhamento livre),
  compatível com o que um resolvedor GraphQL futuro pudesse popular sem
  redesenho. `NavSection`/`NavItem` continuam existindo como catálogo — sem
  consumidor depois desta mudança, o que as regras do projeto tratam como
  inventário, não como lacuna.
- Dois organismos novos, bancada apenas: `NavRail` (trilha de ícones, altura
  total) e `NavTree` (a árvore de divulgação — botões com
  `aria-expanded`/`aria-controls` para pastas, links para folhas, nunca
  `role="tree"`). Nenhum dos dois é ligado a `apps/backoffice`.
- **`AppFrame` ganha uma propriedade nova, `rail`** (conteúdo opaco,
  independente do slot de navegação `nav` que já existe), e uma forma de
  grade condicionada à presença de `rail`/`nav` — é a mesma moldura que
  compõe a tela inteira da maquete, não uma segunda. Medido por protótipo
  (`design.md`, D1): com `rail`/`nav` ausentes, como continuam em
  `apps/backoffice/app/layout.tsx`, o documento emitido fica byte a byte
  idêntico ao de hoje.
- Um átomo novo, `NavFolderTrigger` (disclosure de pasta).
- Um átomo novo, `NavLeaf`, apresenta a folha aninhada com as propriedades
  opcionais `dot` e `meta`, usando tokens fixos de navegação. `NavItem`
  continua inalterado e nenhum consumidor existente é quebrado.
- `Logo` ganha a propriedade `variant` (`"horizontal" | "mark"`, padrão
  `"horizontal"`), com um SVG de marca novo (`logo-charge-br-mark.svg`) para o
  selo isolado da trilha. Nenhum consumidor existente muda de variante.
- Um átomo genérico novo, `Avatar` (iniciais + nome acessível), para o gatilho
  de conta no rodapé da trilha.
- Primeiro conjunto de token de componente que não varia por tema: trilha,
  painel e barra de conteúdo são escuros nos dois temas do leitor. Nasce como
  um grupo semântico novo em `semantic/shared.json` (mecanismo já existente —
  arquivo fora de `light.json`/`dark.json` vale nos dois temas, hoje usado só
  para espaço/raio/tipografia) e um arquivo de componente que o referencia,
  preservando a regra de três camadas. Tem contraste medido uma vez, fora da
  varredura por tema de `contrast.test.ts` — nome fora dos prefixos
  `color.surface.*`/`color.action.*` para não entrar nela por acidente.
- `semantic/light.json`: `color.surface.base` passa de branco para
  `{color.gray.50}`; `color.surface.raised` continua branco. `sunken`
  reavaliado na mesma mudança para não colidir com o novo `base`. Atravessa
  os consumidores hoje declarados: `bench.module.css`, `app-frame.module.css`
  (`.frame`, `.skip`) e o comentário de `chart.assert.ts` que documenta
  `color.chart.surface` e `color.surface.base` resolvendo para o mesmo valor
  — deixa de ser verdade; o valor que passa a coincidir é `color.surface.raised`.
- Regra nova em `rules.design` (`openspec/config.yaml`): todo componente de
  `@chargebr/ui` recebe por propriedade individual todo texto que exibe ou
  anuncia, nome acessível de ícone incluído — generaliza o que hoje vale só
  para a moldura. O guardião de vocabulário (`component-vocabulary.test.ts`)
  ganha os perímetros novos que este ciclo cria/toca em `organisms/nav/`,
  `molecules/nav/` e `atoms/nav/`.
- Defeito de dado corrigido nas fixtures sintéticas existentes: "ABEV" vira
  "ABVE — Associação Brasileira do Veículo Elétrico", nos quatro arquivos que
  hoje citam o nome errado.

## What This Does Not Do

- Não liga `NavPanel`, `NavRail`, `NavTree`, nem a propriedade `rail` de
  `AppFrame`, a nenhuma rota de `apps/backoffice`. `app/layout.tsx` continua
  sem passar `rail` nem nenhuma das quatro propriedades de `nav`. O requisito
  "Regiões da moldura no documento entregue" (`backoffice-shell`) continua
  proibindo região de navegação no documento emitido, e continua certo
  depois desta mudança: nenhuma rota de negócio nasce aqui. O ponto
  reclassificado "`NavPanel` construído, sem rota de negócio para religar"
  (`docs/forma-do-produto.md`) não fecha — o gatilho dele é a primeira rota
  de negócio real, que este ciclo não traz.
- Não altera `apps/backoffice/app/layout.tsx`. `AppFrame` ganha a propriedade
  `rail`, mas o único consumidor real dela nesta mudança é a bancada —
  medido, não suposto: um protótipo da propriedade nova, sem tocar
  `layout.tsx`, manteve as doze afirmações de
  `apps/backoffice/tests/emitted-document.test.ts` passando e o documento
  emitido byte a byte idêntico (`design.md`, D1).
- Não decide o eixo de separação de aplicações nem como a interface lê dado
  (`docs/forma-do-produto.md`, perguntas em aberto 2–4). A forma de dado de
  `NavTree` é hierárquica e genérica o bastante para um resolvedor GraphQL
  futuro, mas nenhum GraphQL real entra aqui, e `biome.json` não muda.
- Não estende o guardião de vocabulário a `interface-atoms` nem a
  `interface-charts`. A varredura por literal encontrou dois casos hoje fora
  do perímetro desta mudança (`organisms/charts/value-table.tsx`, texto de
  cabeçalho de coluna e de legenda textual, embutidos no componente) que a
  regra nova, lida ao pé da letra, também alcançaria. Corrigi-los é trabalho
  de `interface-charts`, uma capacidade que este ciclo não abre; fica
  registrado como ponto aberto novo em `docs/pontos-abertos.md`, com gatilho
  "o próximo ciclo que tocar `interface-charts`" — não como exceção
  silenciosa do guardião.
- Não introduz alternância de tema explícita, nem no documento real nem como
  propriedade nova de `AppFrame`. O botão de tema que a maquete mostra na
  barra de conteúdo não é reproduzido como componente — é convite visual do
  arquivo estático; a bancada já alterna tema pelo controle do próprio
  Storybook. Acrescentar uma propriedade só para herdar aquele visual
  inventaria superfície de API para uma decisão que o requisito "Tema sem
  script" (`backoffice-shell`) reserva para um ciclo futuro.
- Não resolve o canal de tamanho de gráfico nem qualquer outro ponto aberto
  de `docs/pontos-abertos.md` fora dos citados acima; o registro de pontos
  abertos lá segue "nenhum ponto aberto" antes deste ciclo, e o único ponto
  tocado (a reclassificação do `NavPanel`) não fecha, pelas razões acima.

## Capabilities

### Modified Capabilities

- `shell-components`: novos requisitos para `NavRail`, `NavTree` e
  `NavFolderTrigger` (disclosure sem `role="tree"`, duas espécies de entrada
  com o mesmo tratamento de estado corrente, texto por propriedade individual
  em todo o inventário, dado hierárquico sem estrutura embutida); requisito
  modificado de `NavPanel` (árvore no lugar de seções planas); requisito
  modificado de `Logo` (variante de marca).
- `design-tokens`: requisito novo para conjunto de token de componente que não
  varia por tema, com contraste medido uma vez fora da varredura por tema.
- `backoffice-shell`: requisito modificado de `AppFrame` (propriedade `rail`
  nova, independente do slot de navegação); requisito modificado de
  "Regiões da moldura no documento entregue" (nomeia `NavRail`/`rail` na
  mesma disciplina de bancada que já vale para `NavPanel`/`nav`).

## Impact

- `packages/ui/src/organisms/app-frame/` (propriedade `rail` e grade
  condicional, medido sem mudar o documento real — `design.md`, D1),
  `organisms/nav/panel/` (reescrito), `organisms/nav/rail/` (novo),
  `organisms/nav/tree/` (novo), `atoms/nav/folder-trigger/` (novo),
  `atoms/nav/rail-item/` (novo), `atoms/nav/leaf/` (novo),
  `atoms/avatar/` (novo),
  `atoms/logo/` (propriedade nova + SVG novo).
- `packages/tokens/tokens/semantic/shared.json` (grupo novo),
  `packages/tokens/tokens/semantic/light.json` (base/raised),
  `packages/tokens/tokens/component/` (quatro arquivos novos),
  `packages/tokens/src/`
  (novo teste de contraste do conjunto fixo).
- `packages/ui/src/bench/bench.module.css`, `organisms/app-frame/app-frame.module.css`,
  `organisms/charts/chart.assert.ts` (comentário) — consumidores de
  `color.surface.*` ajustados à troca de base/raised.
- `tools/checks/component-vocabulary.test.ts` (perímetros novos).
- `openspec/config.yaml` (`rules.design`, regra nova de texto por propriedade).
- `docs/pontos-abertos.md` (ponto novo registrado: vocabulário fora de
  `interface-charts`).
- Fixtures sintéticas existentes: `molecules/nav/section/nav-section.stories.tsx`,
  `organisms/nav/panel/fixtures/example-sections.ts`,
  `organisms/nav/panel/nav-panel.stories.tsx`,
  `organisms/app-frame/app-frame.stories.tsx` (ABEV → ABVE).
- Nenhum arquivo de `apps/backoffice/` muda.
