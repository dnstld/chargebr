# Spec Delta

## MODIFIED Requirements

### Requirement: Cor de ação legível contra toda superfície neutra do tema

Em cada tema, `color.action.primary` SHALL sustentar no mínimo 4,5:1 contra
**todas** as superfícies neutras declaradas daquele tema, e `color.text.on-action`
SHALL sustentar no mínimo 4,5:1 contra `color.action.primary`. O conjunto de
superfícies neutras SHALL ser lido da própria fonte de tokens, e não de uma
lista escrita à parte. Superfície neutra nova SHALL entrar na checagem sem
edição do teste. Reprovação em qualquer par SHALL bloquear a verificação
nomeando o par, a razão medida, o piso e o tema.

Nenhuma superfície neutra SHALL ser isentada desta varredura — nem a
superfície de gráfico, nem uma superfície que nenhum componente use para
hospedar ação.

`color.focus.ring` SHALL resolver, em cada tema, para o mesmo valor primitivo
que `color.action.primary`.

A verificação SHALL conferir a cor de ação nos estados de **repouso** e de
**foco**; o estado de **hover** é conferido no requisito seguinte. Ela SHALL
NOT conferir **pressionado**, por não existir token para esse estado.

Um par de token correspondente a um estado **desabilitado** SHALL ser
enumerado e relatado pela checagem, e SHALL NOT ser exigido a sustentar o
piso de 4,5:1 — isenção nomeada pela checagem (WCAG 1.4.3, componente de
interface inativo), nunca ausência silenciosa de medição.

**Por quê:** o conjunto de superfícies é lido da fonte, e não de uma lista
escrita à parte, exatamente para que uma superfície nova entre na checagem sem
que alguém precise lembrar de editar o teste. Nenhuma superfície é isenta —
nem a de gráfico, nem uma sem consumidor de ação hoje — porque uma superfície
fora da varredura é o lugar onde o defeito que motivou este requisito pode
voltar sem ser medido, e o custo de mantê-la dentro é nenhum: ela já é uma das
superfícies neutras do tema. O requisito "Superfícies de gráfico declaradas
por tema" detalha essa recusa de isenção para o caso do gráfico. O anel de
foco repete o valor primitivo da cor de ação porque o anel de foco é a cor de
ação, e não um segundo valor parecido com ela. Este requisito previa que
pressionado e desabilitado, "quando existirem, entram nesta mesma checagem" —
o par desabilitado agora existe, e a medição mostra que essa previsão só vale
em parte: WCAG 1.4.3 isenta explicitamente componente de interface inativo do
piso de contraste de texto, então tratar o par desabilitado pelo mesmo piso de
4,5:1 dos estados ativos reprovaria um par que a própria norma de
acessibilidade não exige — a isenção é decisão desta mudança, nomeada na
checagem para que não vire ausência de medição por omissão.

#### Scenario: Par abaixo do piso reprova nomeando o par e o tema

- **WHEN** uma cor de ação é alterada para um valor que fica abaixo de 4,5:1 contra qualquer superfície neutra do seu tema
- **THEN** a verificação falha nomeando o par, a razão medida, o piso e o tema
- **Prova:** valor plantado na fonte, verificação falhando com a mensagem nomeando os quatro, plantio revertido

#### Scenario: Superfície que reprova em um tema só reprova assim mesmo

- **WHEN** a cor de ação de um tema passa contra uma superfície neutra e reprova contra outra do mesmo tema
- **THEN** a verificação falha, e a mensagem nomeia a superfície que reprovou, e não apenas o tema
- **Prova:** teste que planta a situação exata do defeito — aprovação contra `surface.base` e reprovação contra `surface.raised` — e confere a mensagem

#### Scenario: Superfície neutra nova entra na checagem sem editar o teste

- **WHEN** uma superfície neutra é acrescentada à camada semântica e não sustenta o piso contra a cor de ação do tema
- **THEN** a verificação falha nomeando a superfície recém-acrescentada
- **Prova:** superfície plantada na fonte, verificação falhando sem nenhuma alteração no arquivo de teste, plantio revertido

#### Scenario: Execução aprovada registra o pior par de cada tema

- **WHEN** a checagem é executada sobre os tokens correntes nos dois temas
- **THEN** ela passa e registra, por tema, o pior par e sua margem sobre o piso
- **Prova:** execução registrada, com os valores por tema

#### Scenario: Anel de foco que se descola da cor de ação reprova

- **WHEN** `color.focus.ring` de um tema referencia um primitivo diferente do de `color.action.primary` do mesmo tema
- **THEN** a verificação falha, nomeando o tema e os dois primitivos
- **Prova:** referência divergente plantada, verificação falhando, plantio revertido

#### Scenario: Par desabilitado é relatado, não reprovado, e a isenção é nomeada

- **WHEN** a checagem é executada sobre um tema em que `color.action.disabled` existe e fica abaixo de 4,5:1 contra alguma superfície neutra
- **THEN** a verificação passa, e o relatório nomeia o par como isento por WCAG 1.4.3, em vez de omiti-lo ou reprová-lo
- **Prova:** teste que confere o par desabilitado no relatório com a isenção nomeada, para um valor que reprovaria se fosse tratado como par ativo

## ADDED Requirements

### Requirement: Conjunto de ação e estado é enumerado, nunca fixo

A checagem de contraste SHALL descobrir todo par de token de ação e estado
(repouso, hover, desabilitado e qualquer outro que a fonte declarar) a partir
dos nomes presentes na fonte de tokens resolvida, pelo mesmo mecanismo que já
descobre superfícies neutras e séries de paleta. Um par de ação ou estado
novo SHALL entrar na checagem sem edição do arquivo de checagem.

**Por quê:** antes deste requisito, a checagem lia um único par fixo por
nome de chave (`color-action-primary`, `color-action-primary-hover`,
`color-text-on-action`) — um par novo, como o de desabilitado que este
change introduz, não seria alcançado sem editar o arquivo de checagem à mão.
`docs/decisao-biblioteca-de-componentes.md` já registrava esta lacuna
("Decisão de 2026-09-29", "Lacuna registrada, não resolvida"), com gatilho no
primeiro componente de família com cor própria; este requisito a fecha por
uma causa equivalente — o primeiro conjunto de token de ação co-nascido com
um componente, que a leitura fixa por nome não alcançaria.

#### Scenario: Par de ação novo entra na checagem sem editar o arquivo de checagem

- **WHEN** um novo par de token de ação (por exemplo, `color.action.disabled`) é acrescentado à fonte, num tema
- **THEN** a checagem passa a relatar esse par sem nenhuma alteração no arquivo `contrast.ts` ou no seu teste
- **Prova:** par plantado na fonte, execução da checagem relatando o par novo, sem alteração no arquivo de checagem, plantio revertido

#### Scenario: Remover um par de ação da fonte o remove da checagem

- **WHEN** um par de token de ação existente é removido da fonte, num tema
- **THEN** a checagem deixa de relatar esse par, sem alteração no arquivo de checagem
- **Prova:** par removido por plantio, execução da checagem sem o par removido, plantio revertido
