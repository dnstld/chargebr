# interface-atoms

## Purpose

Define o comportamento observável da camada atômica do ChargeBR: o que cada peça
elementar garante sobre número, estado, ausência e evidência, o que ela recusa
exibir, e o que a verificação cobra de todos os átomos.

## Requirements

### Requirement: Número alinha em coluna

A variante tabular do átomo de texto genérico SHALL consumir os tokens de
dado numérico, de modo que números de quantidades diferentes de dígitos
alinhem pela mesma posição quando empilhados.

**Por quê:** o átomo de número próprio é dissolvido nesta mudança — decisão
do dono, ver design.md. A garantia observável não muda: números continuam
alinhando em coluna quando empilhados. O que muda é o componente que a
sustenta.

#### Scenario: Números de larguras diferentes alinham

- **WHEN** dois números com quantidades diferentes de dígitos são renderizados um sobre o outro, pela variante tabular do átomo de texto
- **THEN** seus dígitos ocupam a mesma largura e a coluna alinha
- **Prova:** teste que renderiza os dois e compara a largura medida de cada dígito

### Requirement: Átomo recebe tudo por propriedade

Um átomo SHALL receber todo dado por propriedade, e SHALL NOT buscar dado,
acessar rede ou declarar valor de estilo literal.

#### Scenario: Átomo que busca dado reprova

- **WHEN** um átomo importa cliente de dados ou executa chamada de rede
- **THEN** a verificação falha, nomeando o arquivo
- **Prova:** importação plantada, verificação falhando, plantio revertido

### Requirement: Link tem nome acessível

O átomo de link SHALL possuir nome acessível, e SHALL NOT depender apenas de
ícone ou posição.

**Por quê:** sucede "Âncora de evidência tem nome acessível", generalizado —
`href` e nome acessível obrigatório já eram a forma inteira do átomo; só o
nome "evidência" e o vocabulário ao redor eram de domínio. Decisão do dono,
registrada em `docs/decisao-biblioteca-de-componentes.md` ("Decisão de
2026-09-28..."). `NavItem`, do grupo 6 de `interface-atomic-structure`, é o
primeiro consumidor esperado.

#### Scenario: Link sem nome acessível reprova

- **WHEN** um link é renderizado sem nome acessível
- **THEN** a checagem de acessibilidade reprova, nomeando a regra e o elemento
- **Prova:** link sem nome plantado, verificação falhando, plantio revertido

### Requirement: Botão aceita estado desabilitado

O átomo de botão SHALL aceitar um estado desabilitado. Nesse estado, o botão
SHALL NOT disparar `onPress`, SHALL comunicar a condição a tecnologia
assistiva, e SHALL resolver sua aparência inteiramente por token de
componente — nenhum literal.

**Por quê:** convergência medida em Material UI, gluestack e
react-aria-components (`disabled`/`isDisabled` nas três, cada uma
independente das outras) — ação indisponível é o estado que qualquer botão de
formulário ou confirmação precisa expressar, não caso hipotético.

#### Scenario: Botão desabilitado não dispara a ação

- **WHEN** um botão desabilitado recebe um clique ou ativação por teclado
- **THEN** `onPress` não é chamado
- **Prova:** história com botão desabilitado, `play` que tenta ativar e confere ausência de chamada

#### Scenario: Botão desabilitado é comunicado a tecnologia assistiva

- **WHEN** um botão desabilitado é renderizado
- **THEN** a checagem de acessibilidade da bancada confirma que o estado é exposto (atributo nativo de desabilitado)
- **Prova:** história com botão desabilitado, nos dois temas, sob `addon-a11y`

### Requirement: Botão aceita estado de pendência

O átomo de botão SHALL aceitar um estado de pendência. Nesse estado, o botão
SHALL permanecer alcançável por foco e SHALL NOT disparar `onPress` em
resposta a ponteiro ou teclado, e SHALL exibir o átomo `Spinner` como
indicador visual ao lado do conteúdo normal, que SHALL permanecer renderizado.
O `Spinner` exibido SHALL resolver sua cor para a mesma cor do rótulo do
botão, não para a cor de ação padrão que o átomo `Spinner` declara sozinho.

**Por quê:** convergência medida em Material UI (`loading`), gluestack
(`ButtonSpinner`) e react-aria-components (`isPending`) — ação assíncrona
precisa impedir duplo disparo sem tirar o botão do fluxo de foco. O
indicador visual é um átomo à parte porque visual próprio implica token
próprio (`rules.design`).

#### Scenario: Botão pendente não dispara a ação

- **WHEN** um botão em pendência recebe um clique ou ativação por teclado
- **THEN** `onPress` não é chamado
- **Prova:** história com botão pendente, `play` que tenta ativar e confere ausência de chamada

#### Scenario: Botão pendente permanece alcançável por foco

- **WHEN** o foco por teclado percorre a página até um botão em pendência
- **THEN** o botão recebe foco normalmente
- **Prova:** história com botão pendente, `play` que tabula até o botão e confere `document.activeElement`

#### Scenario: Botão pendente exibe o indicador visual ao lado do conteúdo normal

- **WHEN** um botão entra em pendência
- **THEN** o átomo `Spinner` aparece ao lado do conteúdo normal do botão, que permanece renderizado — nunca no lugar dele, para que o nome acessível de um botão rotulado por texto não se perca
- **Prova:** história com botão pendente rotulado por texto, `play` que confere o texto do rótulo ainda presente e o `Spinner` renderizado

#### Scenario: Spinner segue a cor do rótulo do botão, não a cor padrão do átomo

- **WHEN** um botão rotulado por texto entra em pendência
- **THEN** a cor computada do `Spinner` é igual à cor de texto do botão, não a cor de ação que `Spinner` declara como padrão para o caso solto
- **Prova:** história do botão pendente que compara a cor computada do `Spinner` com o token de texto do botão

### Requirement: Botão aceita variante de tamanho

O átomo de botão SHALL aceitar uma variante de tamanho com três valores —
pequeno, médio e grande —, cada um resolvido inteiro por token de
componente, sem literal.

**Por quê:** convergência medida em Material UI (`small`/`medium`/`large`) e
gluestack (`xs`…`xl`); react-aria-components não decide tamanho. É a
primeira primitiva do pacote com variante de tamanho em uso real — o gatilho
que R3 de `docs/decisao-biblioteca-de-componentes.md` registrou para decidir
entre índice literal e escala nomeada nova.

#### Scenario: Cada tamanho resolve para o token correspondente

- **WHEN** o botão é renderizado com cada um dos três valores de tamanho
- **THEN** o tamanho de fonte computado corresponde ao token de tipografia daquele degrau, no tema corrente
- **Prova:** três histórias, uma por tamanho, cada uma conferindo `font-size` computado contra o token

#### Scenario: Tamanho não especificado usa o valor médio

- **WHEN** o botão é renderizado sem a propriedade de tamanho
- **THEN** ele resolve para o mesmo tamanho de fonte que a variante média
- **Prova:** história padrão comparando `font-size` computado ao token do degrau médio

### Requirement: Botão repassa atributos ARIA de controle e o evento de ativação completo

O átomo de botão SHALL aceitar `aria-expanded`, `aria-controls` e
`aria-describedby`, repassando-os ao elemento nativo. O manipulador de
ativação (`onPress`) SHALL receber o evento de ativação completo emitido
pela primitiva de comportamento, não uma função sem argumento.

**Por quê:** a primitiva de baixo nível (`react-aria-components`) já expõe os
três atributos e o evento completo; o wrapper anterior fechava essa porta
sem nenhum ganho. Tem consumidor nomeado: o gatilho do hambúrguer de
`AppFrame` (`interface-atomic-structure`) precisa de
`aria-expanded`/`aria-controls` para anunciar o estado de um painel de
navegação que ele abre e fecha — não é especulativo.

#### Scenario: Atributos de controle aparecem no elemento renderizado

- **WHEN** o botão é renderizado com `aria-expanded`, `aria-controls` e `aria-describedby`
- **THEN** os três atributos aparecem no elemento nativo com os valores passados
- **Prova:** história que passa os três atributos e confere cada um no elemento renderizado

#### Scenario: onPress recebe o evento de ativação

- **WHEN** o botão é ativado por ponteiro ou por teclado
- **THEN** o manipulador de `onPress` recebe um objeto de evento com o tipo de ativação
- **Prova:** história com `play` que ativa o botão e confere as propriedades do evento recebido pelo manipulador

### Requirement: Spinner é decorativo para tecnologia assistiva

O átomo `Spinner` SHALL comunicar visualmente um estado de progresso
indeterminado e SHALL ser decorativo para tecnologia assistiva
(`aria-hidden`), nunca uma região viva própria.

**Por quê:** `Button.isPending` já anuncia a própria transição de pendência a
tecnologia assistiva (um anúncio ao vivo que repete o nome do botão quando
ele está focado no momento da mudança); uma região viva sem texto não
anuncia nada. `Spinner` comunica o estado só visualmente; comunicá-lo a
tecnologia assistiva é responsabilidade de quem o compõe — hoje, só
`Button`, que a primitiva já cumpre.

#### Scenario: Spinner não é exposto na árvore de acessibilidade

- **WHEN** o `Spinner` é renderizado
- **THEN** ele está marcado como decorativo (`aria-hidden`) e não aparece na árvore de acessibilidade
- **Prova:** história do `Spinner`, nos dois temas, sob `addon-a11y`, conferindo `aria-hidden` presente

#### Scenario: Spinner dentro de um botão rotulado por texto não apaga o nome acessível

- **WHEN** o `Spinner` é renderizado dentro do `Button` em pendência, rotulado por texto (sem `aria-label`)
- **THEN** o nome acessível do botão continua vindo do texto, sem nome duplicado nem ausente na árvore
- **Prova:** história de `Button` pendente com rótulo de texto, sob `addon-a11y`, nos dois temas, conferindo o nome acessível presente
