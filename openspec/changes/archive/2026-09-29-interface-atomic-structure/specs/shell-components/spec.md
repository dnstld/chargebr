# Spec Delta

## Purpose

Define o comportamento observável, no nível de componente de `@chargebr/ui`,
do inventário de cabeçalho, navegação e tipografia do shell do back office —
o que `Icon`, `Logo`, `NavItem`, `NavSection` e `NavPanel` garantem sobre
token, sinal não-cor de estado corrente, anúncio a tecnologia assistiva e
foco em modo sobreposto. Não descreve o documento emitido pela aplicação —
isso continua em `backoffice-shell` — nem liga nenhum destes componentes a
uma rota real.

## ADDED Requirements

### Requirement: Ícone recebe o componente por propriedade

`Icon` SHALL receber o componente do ícone a renderizar por propriedade, e
SHALL NOT importar ou declarar um ícone específico no próprio arquivo.

`Icon` SHALL resolver sua cor por herança de `currentColor`, e SHALL NOT
declarar cor própria.

#### Scenario: Icon renderiza o componente recebido

- **WHEN** `Icon` é usado com um componente de ícone por propriedade
- **THEN** o SVG desse componente é o que aparece no resultado renderizado
- **Prova:** história que passa dois componentes de ícone diferentes e confere qual SVG aparece em cada uma

#### Scenario: Icon sem componente não compila

- **WHEN** `Icon` é usado sem a propriedade do componente de ícone
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem a propriedade plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: A cor do ícone segue o texto ao redor

- **WHEN** `Icon` é renderizado dentro de um elemento com uma cor de texto declarada por token
- **THEN** o traço do ícone resolve para a mesma cor computada do elemento ao redor
- **Prova:** história que envolve `Icon` num elemento com cor de token diferente do padrão e compara a cor computada do ícone com a do elemento

### Requirement: Logo não declara cor de marca no próprio código

`Logo` SHALL apresentar um dos SVGs de marca existentes, e SHALL NOT declarar
valor de cor no próprio arquivo `.tsx` — nem literal, nem token.

**Por quê:** `docs/decisao-identidade-visual.md` já fixa que nenhum componente
referencia cor de marca diretamente, e que a marca não tem variante
monocromática nesta fase. A cor do logo é fixa nos arquivos SVG existentes
(`packages/ui/src/atoms/logo/logo-charge-br-vertical.svg`,
`packages/ui/src/atoms/logo/logo-charge-br-horizontal.svg` — dentro do
pacote, ao lado do componente que os usa, não em `src/images/` na raiz do
monorepo; ver `tasks.md`, tarefa 5.2, para a correção medida);
`Logo` referencia esses arquivos como recurso externo, em vez de reescrever o
desenho como marcação dentro do componente — é o que mantém o componente sem
nenhum literal de cor no próprio código, sem precisar de isenção no guardião
de estilo.

#### Scenario: Logo renderiza sem literal de cor no componente

- **WHEN** o guardião de literal de estilo varre o arquivo de `Logo`
- **THEN** nenhuma ocorrência de literal de cor é reportada nesse arquivo
- **Prova:** `tools/checks/style-literals.test.ts` executado sobre o arquivo de `Logo`

#### Scenario: Logo exibe a marca vigente

- **WHEN** `Logo` é renderizado
- **THEN** o SVG de marca aparece, nas cores fixas da marca, sobre o fundo do tema corrente
- **Prova:** história de `Logo` na bancada, executada nos dois temas

### Requirement: Item de navegação corrente é marcado por mais de um sinal

Um `NavItem` no estado corrente SHALL diferir de um `NavItem` em repouso por
superfície preenchida, além de peso, e SHALL NOT depender só de cor para
marcar o estado corrente. Um `NavItem` no estado corrente SHALL anunciar esse
estado a tecnologia assistiva.

**Por quê:** um sinal só de cor não sustenta a distinção para quem não a
percebe. O anúncio a tecnologia assistiva é um terceiro canal, não uma
variação dos outros dois: superfície preenchida e peso são sinais visuais —
não alcançam quem não vê a tela —, e sem `aria-current` o estado corrente
existiria só visualmente, o mesmo defeito de fundo (um canal só) atrás de
outro canal.

#### Scenario: Item corrente difere do item em repouso em mais de uma propriedade

- **WHEN** um `NavItem` corrente e um `NavItem` em repouso são renderizados lado a lado
- **THEN** eles diferem em superfície preenchida e em peso, não só em cor
- **Prova:** teste que renderiza os dois e compara as propriedades computadas não cromáticas

#### Scenario: Item corrente é anunciado a tecnologia assistiva

- **WHEN** um `NavItem` é renderizado com o estado corrente
- **THEN** o elemento expõe `aria-current="page"`
- **Prova:** história do estado corrente localiza o item por papel e nome acessível e afirma o atributo

### Requirement: Seção de navegação não é clicável e tem ao menos uma folha

`NavSection` SHALL apresentar seu rótulo como texto não interativo, e SHALL
exigir ao menos um `NavItem` como folha — uma seção sem folha SHALL NOT
compilar.

#### Scenario: Seção sem folha não compila

- **WHEN** `NavSection` é usado sem nenhum `NavItem`
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem folha plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: O rótulo da seção não é focalizável

- **WHEN** `NavSection` é renderizado e o documento é navegado por teclado
- **THEN** o rótulo da seção nunca recebe foco, e cada `NavItem` recebe
- **Prova:** história que tabula pela seção e confere quais elementos recebem foco

### Requirement: Foco preso só no modo sobreposto

`NavPanel` SHALL prender o foco dentro de si somente quando apresentado em
modo sobreposto, e SHALL NOT prender foco quando apresentado em modo
persistente.

**Por quê:** prender foco numa barra lateral permanentemente visível tranca
quem navega por teclado fora do conteúdo — o mesmo risco que motivou o
requisito de salto de `backoffice-shell`, agora do lado da navegação.

#### Scenario: Foco não escapa do painel sobreposto

- **WHEN** `NavPanel` é aberto em modo sobreposto e o foco é tabulado até o último elemento focalizável dentro dele
- **THEN** a próxima tabulação permanece dentro do painel
- **Prova:** história do modo sobreposto que tabula até o fim e confere que o foco não sai do painel

#### Scenario: Foco atravessa o painel persistente livremente

- **WHEN** `NavPanel` é apresentado em modo persistente e o foco é tabulado até o último elemento focalizável dentro dele
- **THEN** a próxima tabulação sai do painel para o próximo elemento focalizável do documento
- **Prova:** história do modo persistente que tabula até o fim e confere que o foco sai do painel

### Requirement: Todo estado declarado tem história

Todo estado declarado no contrato de um componente deste inventário SHALL
possuir história correspondente, e estado sem história SHALL reprovar a
verificação.

**Por quê:** um componente novo não fica fora da cobertura de história que
todo componente do pacote já tem.

#### Scenario: Estado sem história reprova

- **WHEN** um componente deste inventário declara um estado que nenhuma história exercita
- **THEN** a verificação falha, nomeando o componente e o estado sem história
- **Prova:** estado sem história plantado, verificação de cobertura de histórias falhando, plantio revertido
