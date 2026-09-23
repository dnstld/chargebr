# interface-atoms

## Purpose

Define o comportamento observável da camada atômica do ChargeBR: o que cada peça
elementar garante sobre número, estado, ausência e evidência, o que ela recusa
exibir, e o que a verificação cobra de todos os átomos.

## Requirements

### Requirement: Número alinha em coluna

O átomo de número SHALL consumir os tokens de dado numérico, de modo que números
de quantidades diferentes de dígitos alinhem pela mesma posição quando empilhados.

#### Scenario: Números de larguras diferentes alinham

- **WHEN** dois números com quantidades diferentes de dígitos são renderizados um sobre o outro
- **THEN** seus dígitos ocupam a mesma largura e a coluna alinha
- **Prova:** teste que renderiza os dois e compara a largura medida de cada dígito

### Requirement: Ausência nunca é zero

O átomo de ausência declarada SHALL exibir a razão da ausência, e SHALL NOT
exibir número, zero, traço, espaço vazio ou qualquer marca que possa ser lida
como valor.

#### Scenario: Ausência exibe razão e nenhum valor

- **WHEN** o átomo de ausência é renderizado com uma razão
- **THEN** a razão aparece e nenhum caractere numérico é renderizado
- **Prova:** teste que renderiza e verifica a ausência de dígitos no conteúdo acessível

#### Scenario: Ausência sem razão reprova

- **WHEN** o átomo de ausência é usado sem razão declarada
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem razão plantado, `verify:types` falhando, plantio revertido

### Requirement: Marcador de estado nomeia seu eixo

O átomo de marcador de estado SHALL declarar a que eixo o estado pertence, e
SHALL NOT ser renderizável sem essa declaração.

#### Scenario: Marcador sem eixo reprova

- **WHEN** um marcador de estado é usado sem declarar o eixo
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem eixo plantado, `verify:types` falhando, plantio revertido

#### Scenario: Eixo alcançável por leitor de tela

- **WHEN** um marcador de estado é renderizado
- **THEN** o eixo integra o nome acessível do marcador, e não apenas sua aparência
- **Prova:** teste que lê o nome acessível do marcador renderizado

### Requirement: Estado não resolvido é hachurado

Um marcador cujo estado seja não resolvido SHALL usar a hachura, e SHALL NOT usar
preenchimento sólido.

#### Scenario: Não resolvido não recebe preenchimento sólido

- **WHEN** um marcador é renderizado em estado não resolvido
- **THEN** seu preenchimento é a hachura, e não uma cor sólida
- **Prova:** teste que renderiza e verifica o preenchimento aplicado

#### Scenario: Preenchimento sólido em não resolvido reprova

- **WHEN** um marcador em estado não resolvido é declarado com preenchimento sólido
- **THEN** a verificação falha, nomeando o uso
- **Prova:** uso plantado, verificação falhando, plantio revertido

### Requirement: Distinção não depende só de cor

Papéis de valor distintos — principal, contrafactual e contexto — SHALL diferir
em ao menos uma propriedade que não seja cor.

#### Scenario: Papéis permanecem distinguíveis sem cor

- **WHEN** os três papéis são renderizados
- **THEN** eles diferem entre si em ao menos uma propriedade além da cor
- **Prova:** teste que lê as propriedades computadas dos três e compara as não cromáticas

### Requirement: Âncora de evidência tem nome acessível

O átomo de âncora de evidência SHALL possuir nome acessível que identifique a
que evidência ele leva, e SHALL NOT depender apenas de ícone ou posição.

#### Scenario: Âncora sem nome acessível reprova

- **WHEN** uma âncora de evidência é renderizada sem nome acessível
- **THEN** a checagem de acessibilidade reprova, nomeando a regra e o elemento
- **Prova:** âncora sem nome plantada, verificação falhando, plantio revertido

### Requirement: Todo estado declarado tem história

Todo estado declarado no contrato de um átomo SHALL possuir história
correspondente, e estado sem história SHALL reprovar a verificação.

#### Scenario: Estado sem história reprova

- **WHEN** um átomo declara um estado que nenhuma história exercita
- **THEN** a verificação falha, nomeando o átomo e o estado sem história
- **Prova:** estado sem história plantado, verificação falhando, plantio revertido

### Requirement: Átomo recebe tudo por propriedade

Um átomo SHALL receber todo dado por propriedade, e SHALL NOT buscar dado,
acessar rede ou declarar valor de estilo literal.

#### Scenario: Átomo que busca dado reprova

- **WHEN** um átomo importa cliente de dados ou executa chamada de rede
- **THEN** a verificação falha, nomeando o arquivo
- **Prova:** importação plantada, verificação falhando, plantio revertido
