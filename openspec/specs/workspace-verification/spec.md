# workspace-verification

## Purpose

Define o comportamento observável da verificação do repositório: o que ela
executa, quando reprova, o que ela garante sobre a fronteira entre biblioteca e
aplicação, e o que ela deliberadamente não alcança fora do seu perímetro.

## Requirements

### Requirement: Instalação reprodutível

A instalação de dependências SHALL partir de um arquivo de lock versionado e
concluir sem erro num clone limpo.

#### Scenario: Clone limpo instala a partir do lock

- **WHEN** alguém clona o repositório e executa o comando documentado de instalação
- **THEN** todas as dependências são instaladas a partir do lock versionado e o comando termina com código de saída zero
- **Prova:** execução registrada em máquina limpa e na integração contínua

### Requirement: Runtime declarado

O workspace SHALL recusar instalação sob versão de runtime diferente da
declarada, com mensagem que nomeia a versão exigida.

#### Scenario: Runtime divergente é recusado

- **WHEN** a instalação ocorre sob uma versão de Node diferente da declarada em `engines`
- **THEN** a instalação falha e a mensagem nomeia a versão exigida
- **Prova:** execução sob runtime divergente, com captura da mensagem

### Requirement: Comando único de verificação

Um único comando na raiz SHALL executar checagem de tipos, formatação, lint e
testes sobre todos os pacotes do perímetro, e retornar código de saída diferente
de zero quando qualquer etapa falhar.

#### Scenario: Uma etapa falhando reprova o comando inteiro

- **WHEN** qualquer uma das quatro etapas falha
- **THEN** o comando retorna código de saída diferente de zero e identifica a etapa que falhou
- **Prova:** caso negativo plantado por commit para cada etapa, verificação falhando, commit revertido

### Requirement: Resultado determinístico

A verificação SHALL produzir resultado idêntico em execuções consecutivas sobre
a mesma árvore, sem alteração.

#### Scenario: Duas execuções seguidas coincidem

- **WHEN** a verificação é executada duas vezes sobre a mesma árvore, sem alteração entre elas
- **THEN** o resultado de cada etapa é idêntico nas duas execuções
- **Prova:** execução dupla registrada, com comparação das saídas

### Requirement: Formatação verificada sem reescrita

A verificação SHALL reprovar arquivo fora do formato canônico sem modificar o
arquivo.

#### Scenario: Arquivo desformatado reprova e permanece intacto

- **WHEN** um arquivo versionado dentro do perímetro está fora do formato canônico
- **THEN** a verificação falha e o arquivo permanece byte a byte como estava
- **Prova:** arquivo desformatado plantado, verificação falhando, `git diff` vazio depois da execução

### Requirement: Supressão de tipo com justificativa

A verificação SHALL reprovar uso de `any` explícito e supressão de erro de tipo
sem justificativa anexa na mesma supressão.

#### Scenario: Supressão sem justificativa reprova

- **WHEN** um arquivo usa `any` explícito ou suprime um erro de tipo sem justificativa na mesma linha
- **THEN** a verificação falha e aponta o arquivo e a linha
- **Prova:** caso negativo plantado por commit, verificação falhando, commit revertido

### Requirement: Descoberta automática de pacotes

Um pacote acrescentado ao workspace SHALL entrar na verificação sem alteração na
configuração da raiz.

#### Scenario: Pacote novo é verificado sem editar a raiz

- **WHEN** um pacote é acrescentado sob `packages/`
- **THEN** a verificação passa a cobri-lo sem que nenhum arquivo de configuração da raiz seja alterado
- **Prova:** pacote-fixture descartável acrescentado, verificação cobrindo-o, fixture removido

### Requirement: Perímetro isolado

A verificação SHALL cobrir exclusivamente `apps/*` e `packages/*`, e SHALL NOT
alcançar, alterar ou reprovar conteúdo fora desse perímetro.

#### Scenario: Conteúdo herdado não é verificado nem alterado

- **WHEN** a verificação é executada com o repositório contendo `src/`, `tests/`, `data/`, `queries/` e `supabase/`
- **THEN** nenhum arquivo desses diretórios é lido pela verificação, alterado ou reportado
- **Prova:** execução com árvore herdada presente, `git status` limpo ao final

#### Scenario: Os scripts herdados continuam funcionando

- **WHEN** os scripts `collect` e `test` da raiz são executados depois da conversão em workspace
- **THEN** ambos se comportam exatamente como antes da conversão
- **Prova:** execução dos dois scripts antes e depois, com comparação de saída e código de saída

### Requirement: Fronteira entre biblioteca e aplicação

A verificação SHALL reprovar pacote da biblioteca que declare dependência sobre
uma aplicação do repositório, ou que importe um framework de aplicação — aquele
que possui rotas, servidor ou convenção de páginas.

Um renderizador, uma biblioteca de teste ou uma ferramenta de documentação
SHALL NOT ser tratada como framework de aplicação: são o que permite a um pacote
da biblioteca ser verificado por execução, e proibi-los tornaria a verificação de
componente impossível.

#### Scenario: Dependência invertida reprova

- **WHEN** um pacote sob `packages/` declara dependência sobre um pacote sob `apps/` ou importa dele
- **THEN** a verificação falha e nomeia o pacote e a dependência proibida
- **Prova:** dependência invertida plantada por commit, verificação falhando, commit revertido

#### Scenario: Framework de aplicação reprova

- **WHEN** um pacote sob `packages/` importa um framework de aplicação
- **THEN** a verificação falha e nomeia o pacote e a importação proibida
- **Prova:** importação plantada por commit, verificação falhando, commit revertido

#### Scenario: Renderizador não é framework de aplicação

- **WHEN** um pacote sob `packages/` importa o renderizador usado pela bancada
- **THEN** a verificação passa
- **Prova:** execução da verificação sobre a bancada, que depende do renderizador

### Requirement: Integração contínua sobre pull request

A integração contínua SHALL executar a mesma verificação da raiz em todo pull
request, publicar resultado por etapa, e impedir merge enquanto houver etapa
falhando.

#### Scenario: Pull request com etapa falhando não pode ser mergeado

- **WHEN** um pull request é aberto com uma etapa da verificação falhando
- **THEN** a integração contínua reporta a etapa que falhou e o merge permanece bloqueado
- **Prova:** pull request de teste com falha plantada, com captura do bloqueio

### Requirement: Branch principal protegida

O repositório SHALL recusar commit enviado diretamente para a branch principal,
sem reescrever histórico anterior.

#### Scenario: Push direto na branch principal é recusado

- **WHEN** alguém tenta enviar commit diretamente para a branch principal
- **THEN** o push é recusado e o histórico anterior permanece inalterado
- **Prova:** tentativa registrada, com captura da recusa

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
