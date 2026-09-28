# Spec Delta

## MODIFIED Requirements

### Requirement: Estilo sem literal em todo o perímetro

A verificação SHALL reprovar arquivo em qualquer área do perímetro — `apps/*` e
`packages/*` — que declare valor literal de cor, espaço, raio, sombra ou
tipografia, nomeando o arquivo e a linha.

A única isenção SHALL ser a camada primitiva da fonte de tokens, e o valor de
`min-width` ou `max-width` dentro da condição de uma `@media`, quando esse
valor for idêntico ao valor do token primitivo de breakpoint correspondente.
Essa isenção SHALL ser verificada por um teste de contrato que compara o
literal declarado em cada `@media` do perímetro ao valor publicado pela fonte
de tokens; um literal que não corresponda a nenhum token de breakpoint SHALL
reprovar como qualquer outro literal de estilo.

Área do perímetro acrescentada SHALL entrar nessa varredura sem alteração no
guardião.

**Por quê:** breakpoint é o único eixo de token que `@media` não pode consumir
por `var()` — CSS não aceita custom property dentro da condição de uma media
query, e o pipeline de `@chargebr/tokens` não gera `@custom-media`. Sem
isenção, a regra vigente proibiria o único jeito tecnicamente possível de uma
folha de estilo do perímetro consumir um token de breakpoint em `@media`. A
isenção é estreita — só `min-width`/`max-width`, só quando o literal bate com
o token — porque abrir exceção geral para "qualquer literal em `@media`"
reabriria a porta que a regra original fechou. O teste de contrato é o que
torna a isenção verificável em vez de confiança: um breakpoint que mudar na
fonte de tokens sem o literal correspondente mudar junto reprova, do mesmo
jeito que os testes de contrato de `tokens.css`/`tokens.ts` já fazem para as
outras camadas.

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

#### Scenario: Breakpoint em `@media` que bate com o token passa

- **WHEN** uma folha de estilo do perímetro declara `@media (min-width: ...)` com o mesmo valor do token primitivo de breakpoint correspondente
- **THEN** a verificação passa, e o arquivo não é reportado como literal
- **Prova:** teste de contrato que lê o valor do token de breakpoint na fonte de tokens e o compara ao literal declarado em `@media` nas folhas de estilo do perímetro

#### Scenario: Breakpoint em `@media` que diverge do token reprova

- **WHEN** uma folha de estilo do perímetro declara `@media (min-width: ...)` com um valor que não corresponde a nenhum token primitivo de breakpoint
- **THEN** a verificação falha, nomeando o arquivo, a linha e o valor divergente
- **Prova:** valor plantado fora dos tokens de breakpoint declarados, teste de contrato falhando com o valor nomeado, plantio revertido
