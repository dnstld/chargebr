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
