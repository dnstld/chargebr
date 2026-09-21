# workspace-verification

## Purpose

Define o comportamento observável da verificação do repositório: o que ela
executa, quando reprova, o que ela garante sobre a fronteira entre biblioteca e
aplicação, e o que ela deliberadamente não alcança fora do seu perímetro.

## ADDED Requirements

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
uma aplicação do repositório ou importe framework de aplicação.

#### Scenario: Dependência invertida reprova

- **WHEN** um pacote sob `packages/` declara dependência sobre um pacote sob `apps/` ou importa um framework de aplicação
- **THEN** a verificação falha e nomeia o pacote e a dependência proibida
- **Prova:** dependência invertida plantada por commit, verificação falhando, commit revertido

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
