# design-tokens

## Purpose

Define o comportamento observável da camada de tokens do ChargeBR: o que ela
emite e a partir de qual fonte, quais referências entre camadas são legítimas, o
que ela garante sobre os temas claro e escuro, e sob quais condições a
verificação reprova.

## ADDED Requirements

### Requirement: Fonte única em formato aberto

Os tokens SHALL ser definidos em arquivos no formato DTCG, e as saídas em CSS e
em TypeScript SHALL ser geradas a partir dessa fonte, nunca escritas à mão.

#### Scenario: Alterar a fonte altera as duas saídas

- **WHEN** o valor de um token é alterado no arquivo de origem e a geração é executada
- **THEN** a mudança aparece tanto na saída CSS quanto na saída TypeScript, com o mesmo valor
- **Prova:** teste que altera um token de fixture, gera, e compara as duas saídas

#### Scenario: Saída editada à mão é detectada

- **WHEN** um arquivo gerado é editado diretamente e a verificação é executada
- **THEN** a verificação falha, porque a saída deixa de corresponder à fonte
- **Prova:** edição plantada num arquivo gerado, verificação falhando, edição revertida

### Requirement: Três camadas com referência dirigida

Os tokens SHALL ser organizados em três camadas — primitiva, semântica e de
componente. A camada primitiva SHALL NOT referenciar nenhuma outra. A camada
semântica SHALL referenciar apenas a primitiva. A camada de componente SHALL
referenciar apenas a semântica.

#### Scenario: Referência que salta camada reprova

- **WHEN** um token de componente referencia diretamente um token primitivo
- **THEN** a verificação falha, nomeando o token e a referência proibida
- **Prova:** referência proibida plantada, verificação falhando, plantio revertido

### Requirement: Valor literal apenas na camada primitiva

Tokens das camadas semântica e de componente SHALL conter apenas referências, e
SHALL NOT conter valor literal de cor, espaço, raio, sombra ou tipografia.

#### Scenario: Literal fora da camada primitiva reprova

- **WHEN** um token semântico recebe um valor literal em vez de uma referência
- **THEN** a verificação falha, nomeando o token
- **Prova:** literal plantado, verificação falhando, plantio revertido

### Requirement: Temas claro e escuro completos

Todo token das camadas semântica e de componente SHALL ter valor definido nos
dois temas. Um token presente num tema e ausente no outro SHALL reprovar a
verificação.

#### Scenario: Token faltando num tema reprova

- **WHEN** um token semântico é definido apenas no tema claro
- **THEN** a verificação falha, nomeando o token e o tema em que falta
- **Prova:** token plantado só num tema, verificação falhando, plantio revertido

### Requirement: Troca de tema sem nova geração

A troca entre tema claro e escuro SHALL alterar os valores aplicados sem exigir
nova geração de artefato e sem recarregar a página.

#### Scenario: Alternar o tema muda os valores em uso

- **WHEN** o tema ativo é alternado de claro para escuro no documento
- **THEN** os valores resolvidos das custom properties passam a ser os do tema escuro, sem nova geração
- **Prova:** teste que alterna o tema num documento e lê os valores computados antes e depois

### Requirement: Superfícies de gráfico declaradas por tema

A camada semântica SHALL declarar uma superfície de gráfico para cada tema, e é
contra ela que a checagem de contraste da paleta SHALL ser executada.

#### Scenario: Superfície ausente impede a checagem

- **WHEN** a superfície de gráfico de um tema não está declarada
- **THEN** a checagem de paleta falha nomeando o tema, em vez de usar um valor implícito
- **Prova:** superfície removida por plantio, checagem falhando, plantio revertido

### Requirement: Paleta categórica validada nos dois temas

A paleta categórica de gráfico SHALL passar nas seis checagens documentadas —
âncoras de matiz em ordem fixa, banda de luminosidade por tema, piso de croma,
separação sob protanopia e deuteranopia, piso de separação para visão normal, e
contraste contra a superfície do tema — executadas por script, em ambos os temas.
Reprovação SHALL bloquear a verificação.

#### Scenario: Paleta reprovada bloqueia a verificação

- **WHEN** um valor da paleta é alterado para um que reprova qualquer das checagens computáveis
- **THEN** a verificação falha, nomeando a checagem, o par e o tema
- **Prova:** valor reprovado plantado, verificação falhando, plantio revertido

#### Scenario: Paleta aprovada registra o resultado

- **WHEN** a checagem é executada sobre a paleta corrente nos dois temas
- **THEN** ela passa e registra, por tema, o pior par e sua distância
- **Prova:** execução registrada, com os valores por tema

### Requirement: Tipografia declarada uma vez

A família tipográfica SHALL aparecer somente na camada primitiva, e os tokens de
dado numérico SHALL ativar algarismos tabulares e zero cortado.

#### Scenario: Família fora da camada primitiva reprova

- **WHEN** uma família tipográfica é declarada numa camada que não a primitiva
- **THEN** a verificação falha, nomeando o token
- **Prova:** declaração plantada, verificação falhando, plantio revertido

#### Scenario: Token de dado numérico carrega os recursos tipográficos

- **WHEN** um token de dado numérico é resolvido
- **THEN** ele ativa algarismos tabulares e zero cortado
- **Prova:** teste que lê o token e confere os recursos declarados

### Requirement: Acesso tipado

Referenciar um token inexistente a partir de código TypeScript SHALL falhar na
checagem de tipos, e não em tempo de execução.

#### Scenario: Token inexistente reprova na checagem de tipos

- **WHEN** código referencia um nome de token que não existe
- **THEN** `verify:types` falha, nomeando o arquivo e o identificador
- **Prova:** referência inexistente plantada, verificação falhando, plantio revertido

### Requirement: Geração determinística

Duas gerações consecutivas sobre a mesma fonte SHALL produzir saídas idênticas.

#### Scenario: Duas gerações coincidem

- **WHEN** a geração é executada duas vezes sobre a mesma fonte, sem alteração entre elas
- **THEN** os arquivos gerados são idênticos byte a byte
- **Prova:** geração dupla com comparação de hash de cada arquivo
