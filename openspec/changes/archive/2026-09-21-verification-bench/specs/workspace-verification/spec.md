# workspace-verification

## MODIFIED Requirements

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
