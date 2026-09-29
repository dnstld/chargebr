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
