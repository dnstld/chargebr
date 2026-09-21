# verification-bench

## Purpose

Define o comportamento observável da bancada de verificação do ChargeBR: o que
executa uma história, quando a acessibilidade reprova, como os dois temas são
cobertos, e o que a bancada não pode alterar no contrato de verificação que já
existe.

## Requirements

### Requirement: História é teste

Toda história dentro do perímetro SHALL ser executada como teste na verificação,
sem comando próprio e sem etapa própria.

#### Scenario: História que falha ao renderizar reprova

- **WHEN** uma história lança erro ao renderizar
- **THEN** `pnpm verify` falha no estágio de testes, nomeando a história
- **Prova:** história com erro plantada, verificação falhando, plantio revertido

### Requirement: Acessibilidade verificada por execução

A checagem de acessibilidade SHALL ser executada sobre o resultado renderizado de
cada história, e violação SHALL reprovar a verificação nomeando a regra violada e
o elemento.

#### Scenario: Violação reprova e se identifica

- **WHEN** uma história renderiza conteúdo que viola uma regra de acessibilidade
- **THEN** a verificação falha, nomeando a regra e o elemento responsável
- **Prova:** violação plantada, verificação falhando com a regra nomeada, plantio revertido

### Requirement: Reprovação por padrão, exceção visível

Toda história SHALL nascer com a checagem de acessibilidade em modo de
reprovação. Uma história que rebaixe esse modo SHALL declarar isso explicitamente
e SHALL aparecer na saída da verificação como exceção.

#### Scenario: História rebaixada aparece na saída

- **WHEN** uma história declara a checagem de acessibilidade em modo que não reprova
- **THEN** a verificação passa, mas lista essa história como exceção declarada
- **Prova:** história rebaixada plantada, saída contendo a exceção, plantio revertido

#### Scenario: História sem declaração reprova ao violar

- **WHEN** uma história não declara nada sobre acessibilidade e viola uma regra
- **THEN** a verificação falha, porque o padrão é reprovar
- **Prova:** violação plantada em história sem declaração, verificação falhando

### Requirement: Os dois temas são verificados

Cada história SHALL ser verificada nos temas claro e escuro, e violação presente
em apenas um deles SHALL reprovar.

#### Scenario: Violação só no tema escuro reprova

- **WHEN** uma história satisfaz as regras no tema claro e as viola no escuro
- **THEN** a verificação falha, nomeando o tema em que a violação ocorre
- **Prova:** violação de contraste plantada apenas no tema escuro, verificação falhando com o tema nomeado

### Requirement: Bancada consome tokens, nunca os redefine

A bancada SHALL renderizar consumindo os tokens publicados por `@chargebr/tokens`,
e SHALL NOT declarar valor de estilo próprio.

#### Scenario: Valor de estilo na bancada reprova

- **WHEN** um arquivo da bancada declara valor literal de cor, espaço, raio, sombra ou tipografia
- **THEN** a verificação falha, nomeando o arquivo
- **Prova:** literal plantado na bancada, verificação falhando, plantio revertido

### Requirement: Documentação viva construível

A documentação viva SHALL ser construível a partir das histórias, e história
quebrada SHALL reprovar essa construção.

#### Scenario: História quebrada reprova a construção

- **WHEN** a construção da documentação viva é executada com uma história quebrada
- **THEN** a construção falha, nomeando a história
- **Prova:** história quebrada plantada, construção falhando, plantio revertido

### Requirement: Contrato de estágios preservado

A bancada SHALL NOT acrescentar estágio a `pnpm verify`, e SHALL NOT alterar o
comportamento dos quatro estágios já existentes.

#### Scenario: A verificação continua com quatro estágios

- **WHEN** `pnpm verify` é executado depois da bancada instalada
- **THEN** ele executa os mesmos quatro estágios, com as histórias e a acessibilidade dentro do estágio de testes
- **Prova:** execução registrada, com a lista de estágios comparada à do ciclo anterior

### Requirement: Resultado determinístico

Duas execuções consecutivas da verificação sobre a mesma árvore SHALL produzir o
mesmo resultado de acessibilidade, sem violação que apareça numa execução e não
na outra.

#### Scenario: Duas execuções coincidem

- **WHEN** a verificação é executada duas vezes sobre a mesma árvore, sem alteração entre elas
- **THEN** o conjunto de violações reportadas é idêntico nas duas
- **Prova:** execução dupla registrada, com comparação do conjunto de violações
