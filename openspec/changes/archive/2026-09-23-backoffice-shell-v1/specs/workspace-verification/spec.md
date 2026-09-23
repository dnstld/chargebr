# Spec Delta

## ADDED Requirements

### Requirement: Estilo sem literal em todo o perímetro

A verificação SHALL reprovar arquivo em qualquer área do perímetro — `apps/*` e
`packages/*` — que declare valor literal de cor, espaço, raio, sombra ou
tipografia, nomeando o arquivo e a linha.

A única isenção SHALL ser a camada primitiva da fonte de tokens.

Área do perímetro acrescentada SHALL entrar nessa varredura sem alteração no
guardião.

**Por quê:** a varredura cobria `packages/` e mais nada. No instante em que a
primeira aplicação existe, código novo passa a nascer fora do lugar varrido, e a
proibição de literal deixa de valer exatamente onde há mais chance de ser
violada — folha de estilo global, moldura, página. A isenção da camada primitiva
existe porque ela é a fonte dos literais, por definição.

#### Scenario: Literal plantado numa aplicação reprova

- **WHEN** um arquivo sob `apps/` declara valor literal de cor, espaço, raio, sombra ou tipografia
- **THEN** a verificação falha, nomeando o arquivo e a linha
- **Prova:** literal plantado em `apps/backoffice`, `tools/checks/style-literals.test.ts` falhando com arquivo e linha nomeados, plantio revertido

#### Scenario: Aplicação nova entra na varredura sem editar o guardião

- **WHEN** uma aplicação é acrescentada sob `apps/` com um literal de estilo
- **THEN** a verificação falha nomeando o arquivo da aplicação recém-acrescentada, sem que nenhum arquivo de checagem seja alterado
- **Prova:** aplicação-fixture descartável com literal plantado, verificação falhando, fixture removido

#### Scenario: A camada primitiva de tokens continua isenta

- **WHEN** a verificação é executada com a fonte de tokens contendo literais na camada primitiva
- **THEN** a verificação passa, e nenhum arquivo da camada primitiva é reportado
- **Prova:** execução do guardião sobre a árvore corrente, com a camada primitiva presente

### Requirement: Fronteira da aplicação

Uma aplicação SHALL poder importar o framework de aplicação.

A verificação SHALL reprovar aplicação que importe qualquer um destes,
nomeando o arquivo e a importação proibida:

- outra aplicação do repositório;
- caminho interno de um pacote da biblioteca, fora do que o pacote publica;
- conteúdo fora do perímetro — a árvore herdada de coleta, o contrato de
  leitura e o banco;
- cliente de dado ou de rede, e chamada de rede por variável global.

**Por quê:** a lista da biblioteca não serve à aplicação, e copiá-la proibiria
`next` justamente em quem deve importá-lo. Cada item existe por uma razão
própria, registrada em `design.md`; a proibição de cliente de dado e de rede é a
que torna verificável, e não apenas combinada, a exclusão "nenhuma busca de
dado" — e é a única da lista que tem data para ser reaberta: o ciclo que trouxer
o contrato de leitura.

#### Scenario: A aplicação importa o framework e a verificação passa

- **WHEN** uma aplicação sob `apps/` importa o framework de aplicação
- **THEN** a verificação passa
- **Prova:** execução da verificação sobre `apps/backoffice`, que importa o framework no layout e na página

#### Scenario: Importação de outra aplicação reprova

- **WHEN** uma aplicação importa um arquivo de outra aplicação do repositório
- **THEN** a verificação falha, nomeando o arquivo e a importação proibida
- **Prova:** importação plantada, `verify:lint` falhando com a mensagem, plantio revertido

#### Scenario: Caminho interno de pacote reprova

- **WHEN** uma aplicação importa um caminho interno de um pacote da biblioteca, em vez de um subpath publicado por ele
- **THEN** a verificação falha, nomeando o arquivo e a importação proibida
- **Prova:** importação de caminho interno plantada, `verify:lint` falhando, plantio revertido

#### Scenario: Importação de conteúdo fora do perímetro reprova

- **WHEN** uma aplicação importa da árvore herdada de coleta, do contrato de leitura ou do banco
- **THEN** a verificação falha, nomeando o arquivo e a importação proibida
- **Prova:** importação plantada para cada um dos três, `verify:lint` falhando em cada caso, plantios revertidos

#### Scenario: Busca de dado na aplicação reprova

- **WHEN** uma aplicação importa cliente de dado ou de rede, ou executa chamada de rede por variável global
- **THEN** a verificação falha, nomeando o arquivo e o que foi importado ou chamado
- **Prova:** importação de cliente de dado e chamada de rede global plantadas, `verify:lint` falhando em cada caso, plantios revertidos

### Requirement: Artefato de construção não é conteúdo verificado

O diretório de artefatos produzido pela construção de uma aplicação SHALL ficar
fora do versionamento e fora das etapas de formatação e de lint.

A verificação SHALL deixar a árvore versionada inalterada, mesmo executando uma
construção.

**Por quê:** a construção passa a rodar dentro do estágio de testes, e o que ela
emite é saída, não conteúdo. Se esses artefatos entrassem na formatação, no lint
ou no versionamento, a verificação passaria a reprovar arquivo que ela mesma
acabou de gerar, e o resultado deixaria de ser determinístico entre execuções.

#### Scenario: Construção não suja a árvore versionada

- **WHEN** a verificação é executada por inteiro, incluindo a construção da aplicação
- **THEN** nenhum arquivo versionado é criado ou alterado
- **Prova:** execução completa de `pnpm verify` seguida de `git status`, com a saída registrada

#### Scenario: Artefato de construção não é formatado nem lintado

- **WHEN** as etapas de formatação e de lint são executadas com os artefatos de construção presentes na árvore
- **THEN** nenhum arquivo desses artefatos é lido, reportado ou alterado
- **Prova:** execução de `verify:format` e `verify:lint` com a construção já feita, com a saída registrada
