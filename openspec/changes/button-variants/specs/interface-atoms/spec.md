# Spec Delta

## ADDED Requirements

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

### Requirement: Botão aceita variante de tamanho

O átomo de botão SHALL aceitar uma variante de tamanho com três valores —
pequeno, médio e grande —, cada um resolvido inteiro por token de
componente, sem literal.

**Por quê:** convergência medida em Material UI (`small`/`medium`/`large`) e
gluestack (`xs`…`xl`); react-aria-components não decide tamanho. É a
primeira primitiva do pacote com variante de tamanho em uso real — o gatilho
que R3 de `docs/decisao-biblioteca-de-componentes.md` registrou para decidir
entre índice literal e escala nomeada nova (ver design.md).

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
sem nenhum ganho. Tem consumidor nomeado: a tarefa 7.3 de
`interface-atomic-structure` (o gatilho do hambúrguer) precisa de
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

**Por quê:** correção medida durante a aplicação deste ciclo, contra a fonte
de `react-aria-components` (design.md, D8) — `Button.isPending` já anuncia a
própria transição de pendência a tecnologia assistiva (um anúncio ao vivo
que repete o nome do botão quando ele está focado no momento da mudança);
uma região viva sem texto não anuncia nada, e uma versão anterior deste
requisito, que dava a `Spinner` `role="status"`, dava a falsa impressão de
que o estado estava coberto quando não estava. `Spinner` comunica o estado
só visualmente; comunicá-lo a tecnologia assistiva é responsabilidade de
quem o compõe — hoje, só `Button`, que a primitiva já cumpre.

#### Scenario: Spinner não é exposto na árvore de acessibilidade

- **WHEN** o `Spinner` é renderizado
- **THEN** ele está marcado como decorativo (`aria-hidden`) e não aparece na árvore de acessibilidade
- **Prova:** história do `Spinner`, nos dois temas, sob `addon-a11y`, conferindo `aria-hidden` presente

#### Scenario: Spinner dentro de um botão rotulado por texto não apaga o nome acessível

- **WHEN** o `Spinner` é renderizado dentro do `Button` em pendência, rotulado por texto (sem `aria-label`)
- **THEN** o nome acessível do botão continua vindo do texto, sem nome duplicado nem ausente na árvore
- **Prova:** história de `Button` pendente com rótulo de texto, sob `addon-a11y`, nos dois temas, conferindo o nome acessível presente

### Requirement: Spinner respeita preferência de movimento reduzido

O átomo `Spinner` SHALL permanecer visível sem depender de animação de
rotação contínua quando o sistema declarar preferência por movimento
reduzido, e SHALL animar continuamente quando não declarar.

**Por quê:** `Spinner` é o primeiro componente do pacote cujo estado depende
de movimento contínuo — nenhum outro átomo até aqui usava animação para
comunicar algo. A checagem de acessibilidade por execução (`addon-a11y`,
baseada em axe) não cobre preferência de movimento: axe não tem regra que
detecte animação forçada contra `prefers-reduced-motion`. Sem prova própria,
por história, essa garantia nasceria sem verificação nenhuma.

#### Scenario: Movimento reduzido remove a rotação, não o indicador

- **WHEN** o `Spinner` é renderizado com `prefers-reduced-motion: reduce` declarado
- **THEN** ele permanece visível, sem animação de rotação computada
- **Prova:** história com a preferência simulada, conferindo ausência de animação computada e presença do elemento

#### Scenario: Sem a preferência, a rotação contínua está presente

- **WHEN** o `Spinner` é renderizado sem `prefers-reduced-motion` declarado
- **THEN** a animação de rotação contínua está presente
- **Prova:** história padrão conferindo a animação computada presente
