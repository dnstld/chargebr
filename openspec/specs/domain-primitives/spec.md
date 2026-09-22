# domain-primitives

## Purpose

Define o comportamento observável da camada de domínio do ChargeBR: o que cada
primitiva recusa exibir, como os eixos de estado permanecem independentes na tela
e na leitura assistida, e de onde vem o texto em português que o produto mostra.

## Requirements

### Requirement: Número sem proveniência não é renderizável

A primitiva de valor SHALL exigir o caminho até a evidência, e SHALL NOT ser
utilizável sem ele.

#### Scenario: Valor sem proveniência reprova

- **WHEN** a primitiva de valor é usada sem caminho até a evidência
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem proveniência plantado, `verify:types` falhando, plantio revertido

#### Scenario: Proveniência é alcançável por teclado

- **WHEN** a primitiva de valor é renderizada e navegada por teclado
- **THEN** o caminho até a evidência recebe foco e possui nome acessível que o identifica
- **Prova:** teste que navega por teclado e lê o nome acessível do elemento focado

### Requirement: Papéis não são intercambiáveis

A primitiva de valor SHALL declarar qual papel cada item ocupa — principal,
contrafactual ou contexto — e SHALL renderizá-los em posições distintas, de modo
que um contrafactual nunca ocupe o lugar do principal.

#### Scenario: Contrafactual não ocupa a posição do principal

- **WHEN** um valor principal e um contrafactual são renderizados juntos
- **THEN** eles ocupam posições distintas e diferem em ao menos uma propriedade não cromática
- **Prova:** teste que renderiza ambos e compara posição e propriedades computadas

### Requirement: Projeção bloqueada não exibe número

A primitiva de projeção bloqueada SHALL exibir a razão do bloqueio, e SHALL NOT
exibir número, valor parcial, zero, traço ou qualquer marca que possa ser lida
como valor.

#### Scenario: Bloqueio exibe razão e nenhum número

- **WHEN** a primitiva de projeção bloqueada é renderizada
- **THEN** a razão aparece e nenhum caractere numérico existe no conteúdo acessível
- **Prova:** teste que renderiza e verifica a ausência de dígitos no conteúdo acessível

#### Scenario: Bloqueio sem razão reprova

- **WHEN** a primitiva de projeção bloqueada é usada sem razão
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem razão plantado, `verify:types` falhando, plantio revertido

### Requirement: Os três eixos permanecem independentes

O painel de estados SHALL exibir os três eixos como itens distintos, cada um
identificável por seu eixo, e SHALL NOT combinar dois ou mais eixos num único
marcador.

#### Scenario: Cada eixo é identificável na leitura assistida

- **WHEN** o painel de estados é renderizado
- **THEN** existem três itens distintos, e o nome acessível de cada um contém o eixo a que pertence
- **Prova:** teste que localiza os três pelo nome acessível e confere o eixo em cada um

### Requirement: Eixo sem valor é declarado, nunca omitido

Quando um eixo não possui valor, o painel SHALL declarar a ausência para aquele
eixo, e SHALL NOT omitir o item.

#### Scenario: Eixo sem valor continua visível

- **WHEN** o painel é renderizado com um dos três eixos sem valor
- **THEN** o painel continua exibindo três itens, e o item sem valor declara a ausência
- **Prova:** teste que renderiza com um eixo vazio e conta os itens

### Requirement: Vocabulário vem de um módulo único

O texto em português exibido pelas primitivas SHALL vir do módulo de vocabulário
do pacote, SHALL ser sobrescrevível por quem consome, e SHALL NOT ser declarado
dentro de uma primitiva.

#### Scenario: Texto declarado dentro da primitiva reprova

- **WHEN** uma primitiva declara um rótulo em português no próprio arquivo
- **THEN** a verificação falha, nomeando o arquivo e o termo
- **Prova:** rótulo plantado, verificação falhando, plantio revertido

#### Scenario: Consumidor sobrescreve um termo

- **WHEN** quem consome fornece um termo alternativo para um estado
- **THEN** a primitiva exibe o termo fornecido, e não o padrão
- **Prova:** teste que renderiza com termo sobrescrito e lê o conteúdo

### Requirement: Forma de entrada é da biblioteca

As primitivas SHALL definir sua própria forma de entrada, e SHALL NOT importar
tipo, esquema ou nome de coluna do contrato de leitura ou do banco.

#### Scenario: Importação do contrato reprova

- **WHEN** uma primitiva importa tipo ou esquema do contrato de leitura
- **THEN** a verificação falha, nomeando o arquivo e a importação
- **Prova:** importação plantada, verificação falhando, plantio revertido

### Requirement: Cobertura de estados alcança as primitivas

A checagem que reprova estado sem história SHALL cobrir também as primitivas de
domínio.

#### Scenario: Estado de primitiva sem história reprova

- **WHEN** uma primitiva declara um estado que nenhuma história exercita
- **THEN** a verificação falha, nomeando a primitiva e o estado
- **Prova:** estado sem história plantado, verificação falhando, plantio revertido
