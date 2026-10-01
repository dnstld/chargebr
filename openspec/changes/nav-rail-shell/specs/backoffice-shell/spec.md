# Spec Delta

## MODIFIED Requirements

### Requirement: Moldura expõe um gatilho de navegação opaco, sem estado próprio

`AppFrame` SHALL aceitar um slot de navegação opcional composto por quatro
propriedades que entram juntas ou nenhuma: `nav` (o conteúdo, opaco),
`navToggleLabel` (o nome acessível do gatilho), `navOpen` (o estado
aberto/fechado) e `onNavToggle` (o que o alterna). `AppFrame` SHALL NOT
guardar esse estado internamente, e SHALL NOT declarar `"use client"`.

Quando `nav` está presente, `AppFrame` SHALL renderizar um gatilho que
expõe `aria-expanded` igual a `navOpen` e `aria-controls` apontando para o
invólucro que envolve `nav`. Quando `nav` está ausente, o gatilho SHALL NOT
renderizar.

O gatilho SHALL ser alcançável (fora de `display: none`) abaixo do
breakpoint declarado em `--screen-md`, e SHALL NOT ser alcançável a partir
dele.

`AppFrame` SHALL aceitar, de forma independente do slot de navegação, uma
propriedade opcional `rail` de conteúdo opaco, apresentada como uma região à
esquerda do cabeçalho e do conteúdo principal, em altura total. `rail` SHALL
NOT exigir nenhuma outra propriedade — ao contrário do slot de navegação,
não tem estado de aberto/fechado para refletir.

Quando `rail` e `nav` estão ambos ausentes, o documento emitido por
`apps/backoffice` SHALL permanecer exatamente como seria sem esta
propriedade existir — mesmas regiões, mesma ordem de foco, nenhum atributo
novo no elemento raiz da moldura.

**Por quê:** o gatilho precisa de `aria-expanded`, que exige estado
aberto/fechado — mas a moldura já é, pela mesma decisão que sustenta o
requisito anterior, um componente sem script próprio (salto por fragmento
de URL, tema resolvido só por CSS). O estado entra por propriedade,
controlado por quem compõe, nunca por `useState` dentro da moldura. Um
gatilho sempre renderizado, condicionado só por CSS de breakpoint,
apareceria em `apps/backoffice` de verdade — que nunca popula `nav` (ver
"Regiões da moldura no documento entregue", acima) — anunciando um destino
que não existe, o mesmo defeito que aquele requisito já recusa para a
região de navegação inteira; por isso o gatilho é condicionado à presença
de `nav`, não só à largura da janela. A visibilidade pelo breakpoint em si
era regra CSS sem prova de efeito por largura real (`docs/pontos-abertos.md`,
ponto 19) — as três primeiras tentativas de resolver o harness de viewport
importavam `@vitest/browser/context`, que só existe como stub estático fora
do modo nativo de navegador; o especificador correto,
`"vitest/browser"`, resolvido sob um projeto do Vitest com
`browser.enabled: true` fora do complemento do Storybook, prova o efeito.

`rail` nasce separado de `nav` — não um quinto campo do mesmo slot — porque
não compartilha a razão de ser de um slot controlado: não tem gatilho, não
tem estado aberto/fechado, e nada em `AppFrame` precisa saber se está
presente para decidir outra coisa. Agrupá-lo às quatro propriedades de `nav`
obrigaria quem usa só um dos dois a declarar campos que não servem a nada.
`AppFrame` continua sem um quarto estado de moldura e sem `"use client"`
por causa de `rail` pela mesma razão que já valia para `nav`: nenhum dos
dois pede estado — `rail` nunca muda de forma sozinho, e o único estado de
`nav` já é controlado de fora.

A garantia de documento inalterado quando os dois estão ausentes não é
promessa não verificada: é o estado que `apps/backoffice` já tem hoje, e
`nav`/`rail` continuam ausentes de `app/layout.tsx` depois desta mudança —
os testes de "Regiões da moldura no documento entregue", "Salto para o
conteúdo" e os demais abaixo, todos executados sobre o documento real,
continuam sendo a prova; nenhum teste novo precisa duplicá-los.

#### Scenario: Sem nav, nenhum gatilho renderiza

- **WHEN** `AppFrame` é renderizado sem o slot de navegação
- **THEN** nenhum elemento com `aria-controls` apontando para o invólucro de navegação existe no resultado
- **Prova:** história da moldura sem `nav` conferindo a ausência

#### Scenario: O gatilho reflete o estado e aponta para o invólucro

- **WHEN** `AppFrame` é renderizado com o slot de navegação preenchido
- **THEN** o gatilho expõe `aria-controls` igual ao id do invólucro de `nav`, e `aria-expanded` igual a `navOpen`; um clique alterna `aria-expanded` e a presença de `nav` na árvore de acessibilidade
- **Prova:** história com o slot preenchido conferindo os dois atributos e o efeito do clique nos dois sentidos

#### Scenario: Slot parcial não compila

- **WHEN** `nav` é passado sem `navToggleLabel`, `navOpen` ou `onNavToggle`
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso parcial plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: O gatilho aparece e desaparece nos dois lados do breakpoint

- **WHEN** `AppFrame` é renderizado com o slot de navegação preenchido, e a largura real da janela é alternada entre abaixo e a partir de `--screen-md`
- **THEN** o gatilho é alcançável abaixo do breakpoint e deixa de ser alcançável a partir dele
- **Prova:** projeto do Vitest em modo nativo de navegador (`browser.enabled`, sem `storybookTest`) que monta `AppFrame` direto, redimensiona a janela real com `page.viewport()` de `"vitest/browser"`, e confere se `page.getByRole("button", { name: "Abrir menu" })` localiza o gatilho — um botão dentro de ancestral `display: none` não é localizável por papel, o mesmo que um leitor de tela veria — 1px abaixo e 1px acima do breakpoint declarado

#### Scenario: Rail renderiza sem exigir nada além de si

- **WHEN** `AppFrame` é renderizado só com `rail`, sem nenhuma das quatro propriedades de navegação
- **THEN** o conteúdo de `rail` aparece numa região própria, e nenhuma propriedade de navegação é exigida pela verificação de tipos
- **Prova:** história da moldura só com `rail` preenchido, e uso equivalente em arquivo de checagem de tipos compilando sem as quatro propriedades de navegação

#### Scenario: Sem rail nem nav, o documento emitido não muda

- **WHEN** a construção de `apps/backoffice` é executada com `app/layout.tsx` continuando a não passar `rail` nem nenhuma das quatro propriedades de navegação
- **THEN** o documento emitido da rota raiz continua sem atributo de forma na moldura, com as mesmas duas regiões, a mesma ausência de região de navegação, e o salto continuando o primeiro focalizável
- **Prova:** `apps/backoffice/tests/emitted-document.test.ts` ("o documento emitido contém as duas regiões e nenhuma navegação", "o primeiro focalizável do documento emitido é o salto para o conteúdo") executado sobre a construção real, sem alteração de `app/layout.tsx`; medido na proposta deste ciclo por protótipo descartável — com `rail` acrescentado a `AppFrame` e nunca passado por `apps/backoffice`, as doze afirmações de `emitted-document.test.ts` continuaram passando, e o `<body>` emitido ficou byte a byte idêntico; só o hash do arquivo CSS (efeito de qualquer edição de CSS, não desta em particular) e um `null` inerte no payload de hidratação — sem efeito no DOM — divergiram

### Requirement: Regiões da moldura no documento entregue

O documento emitido SHALL conter uma região de cabeçalho identificável pelo seu
papel, que nomeia o produto, e uma região de conteúdo principal identificável
pelo seu papel.

O documento emitido SHALL NOT conter região de navegação.

**Por quê:** região identificável pelo papel é o que permite saltar direto ao
conteúdo em leitura assistida. A navegação fica de fora porque não existe rota
de negócio para listar, e região de navegação vazia anuncia um destino que não
existe. `NavPanel` e o slot `nav` de `AppFrame` existem como componentes de
biblioteca, verificados na bancada (`shell-components`) — nenhum dos dois é
ligado ao documento emitido por `apps/backoffice` enquanto não existir rota de
negócio real, pela mesma razão registrada aqui. A mesma disciplina vale para
`NavRail` e para o slot `rail` de `AppFrame`, acrescentados numa mudança
posterior: nenhum dos dois é ligado a `apps/backoffice` enquanto não existir
rota de negócio real. O gatilho já previsto — "a
moldura hospedar conteúdo que dependa de dado" — segue sendo o que reabre este
requisito. O cabeçalho compõe `Logo` — uma imagem vetorial de marca — em vez
de exibir o nome do produto como texto puro; "nome acessível" é a prova
exigida porque cobre as duas formas que o nome do produto pode assumir no
cabeçalho — texto visível ou `alt`/rótulo do `Logo` — sem prescrever qual
delas a implementação escolhe. A garantia que importa para quem navega por
leitura assistida é que o cabeçalho se anuncia pelo nome do produto, não a
forma visual exata.

#### Scenario: As duas regiões estão no documento entregue

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** existe nele uma região de cabeçalho que contém o nome do produto e uma região de conteúdo principal
- **Prova:** teste do documento emitido que procura as duas regiões pelo papel

#### Scenario: Região de navegação reprova

- **WHEN** o documento emitido contém uma região de navegação
- **THEN** a verificação falha nomeando a região encontrada
- **Prova:** região de navegação plantada, verificação falhando, plantio revertido

#### Scenario: A moldura renderizada expõe as duas regiões

- **WHEN** a moldura é renderizada com um nome de produto
- **THEN** a região de cabeçalho e a região de conteúdo principal são alcançáveis pelo papel, e o cabeçalho tem nome acessível igual ao nome do produto
- **Prova:** história da moldura na bancada, executada nos dois temas
