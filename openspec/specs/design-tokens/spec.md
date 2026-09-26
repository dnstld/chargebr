# design-tokens

## Purpose

Define o comportamento observável da camada de tokens do ChargeBR: o que ela
emite e a partir de qual fonte, quais referências entre camadas são legítimas, o
que ela garante sobre os temas claro e escuro, e sob quais condições a
verificação reprova.

## Requirements

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
NOT conferir **pressionado** nem **desabilitado** enquanto não existir token
para nenhum dos dois.

**Por quê:** o conjunto de superfícies é lido da fonte, e não de uma lista
escrita à parte, exatamente para que uma superfície nova entre na checagem sem
que alguém precise lembrar de editar o teste. Nenhuma superfície é isenta —
nem a de gráfico, nem uma sem consumidor de ação hoje — porque uma superfície
fora da varredura é o lugar onde o defeito que motivou este requisito pode
voltar sem ser medido, e o custo de mantê-la dentro é nenhum: ela já é uma das
superfícies neutras do tema. O requisito "Superfícies de gráfico declaradas
por tema" detalha essa recusa de isenção para o caso do gráfico. O anel de
foco repete o valor primitivo da cor de ação porque o anel de foco é a cor de
ação, e não um segundo valor parecido com ela. Pressionado e desabilitado,
quando existirem, entram nesta mesma checagem, e o teste que a executa não é
o lugar onde essa decisão se toma.

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

### Requirement: Estado de interação com legibilidade provada

Em cada tema, `color.action.primary-hover` SHALL sustentar no mínimo 4,5:1
contra `color.text.on-action`, como o estado de repouso.

O hover SHALL ser mais claro que o repouso na luminosidade OKLCH, nos dois
temas, e a diferença entre o passo de um tema e o passo do outro SHALL ser no
máximo 0,02.

A verificação SHALL varrer os tokens de ação em busca de valor primitivo
repetido entre os dois temas e, ao encontrar um, SHALL nomeá-lo como token não
invertido. Nenhum diagnóstico SHALL reprovar sozinho.

**Por quê:** o que é comum aos dois temas é o passo, não a razão de contraste
— no tema claro o texto sobre a ação é claro e a razão cai com o passo; no
escuro o texto é escuro e a razão sobe, e em nenhum dos dois ela cai abaixo do
piso, porque o piso de 4,5:1 já obriga isso independentemente do passo. A
varredura de valor repetido é diagnóstico, não piso: a autoridade são os
pisos medidos acima, e é por eles que a verificação reprova; a varredura
existe para que a mensagem diga "não foi invertido" em vez de apenas "abaixo
do piso" — a diferença entre apontar a causa e apontar o sintoma. Para os dois
tokens de ação que existem hoje, um valor repetido entre os temas já é
impossível pelos pisos diretos: as faixas de luminância que satisfazem 4,5:1
contra as superfícies claras e contra as escuras não se sobrepõem. Para
`color.action.primary`, o teto do tema claro é 0,168 — imposto por
`surface.sunken`, não por `surface.base` — e o piso do tema escuro é 0,217,
imposto por `surface.raised`. Para `color.action.primary-hover` contra
`color.text.on-action`, o teto do claro é 0,183 e o piso do escuro é 0,199. É
assim que a cláusula do diagnóstico se lê hoje: ela não acrescenta obrigação,
acrescenta mensagem. Se um token de ação futuro tiver faixas que se
sobreponham, a repetição passa a ser legítima para ele, e é o "nenhum
diagnóstico reprova sozinho" acima — não uma cláusula própria — que garante
que a varredura continua sem reprovar.

#### Scenario: Hover abaixo do piso reprova nomeando o estado e o tema

- **WHEN** `color.action.primary-hover` de um tema fica abaixo de 4,5:1 contra `color.text.on-action`
- **THEN** a verificação falha nomeando o estado de hover, o tema, a razão medida e o piso
- **Prova:** valor plantado, verificação falhando, plantio revertido

#### Scenario: Valor repetido entre temas é nomeado como não invertido

- **WHEN** um token de ação resolve para o mesmo valor primitivo no tema claro e no escuro
- **THEN** a verificação falha pelo piso que aquele valor não sustenta, e a mensagem nomeia o token como não invertido, em vez de apenas relatar a razão medida
- **Prova:** teste que planta o valor do tema claro no escuro — `indigo.600` nos dois, o defeito exato deste ciclo — e confere que a mensagem carrega as duas coisas: a razão medida e a causa nomeada

#### Scenario: O diagnóstico não reprova sozinho

- **WHEN** a checagem recebe um par de temas em que um valor repetido entre eles sustenta os pisos dos dois
- **THEN** ela passa, e o valor repetido aparece apenas como registro, nunca como violação
- **Prova:** teste que alimenta a checagem com um par de temas sintético — superfícies escuras nos dois — em que a repetição é legítima, e confere que a lista de violações sai vazia

#### Scenario: Hover mais escuro que o repouso reprova

- **WHEN** o hover de um tema tem luminosidade OKLCH menor ou igual à do repouso do mesmo tema
- **THEN** a verificação falha nomeando o tema e as duas luminosidades
- **Prova:** valor plantado invertendo o sentido do passo, verificação falhando, plantio revertido

#### Scenario: Passos que divergem entre temas reprovam

- **WHEN** o passo de hover de um tema difere do passo do outro tema em mais de 0,02 de luminosidade OKLCH
- **THEN** a verificação falha nomeando os dois passos
- **Prova:** valor plantado alargando o passo de um tema, verificação falhando, plantio revertido

#### Scenario: Execução aprovada registra os dois estados nos dois temas

- **WHEN** a checagem é executada sobre os tokens correntes
- **THEN** ela passa e registra, por tema, a razão em repouso, a razão em hover e o passo entre eles
- **Prova:** execução registrada, com os valores por tema

### Requirement: Superfícies de gráfico declaradas por tema

A camada semântica SHALL declarar uma superfície de gráfico para cada tema, e
é contra ela que a checagem de contraste da paleta SHALL ser executada.

A superfície de gráfico de um tema SHALL ser uma das superfícies neutras já
declaradas daquele tema, e SHALL NOT ser um valor próprio.

A superfície de gráfico SHALL hospedar apenas o desenho — marca, eixo e
grade — e SHALL NOT hospedar texto interativo. O piso que vale contra ela
**para as séries da paleta** SHALL ser o de objeto gráfico, 3:1, e não o de
texto. Nome do gráfico, legenda, ausências declaradas e representação em
texto SHALL ficar na superfície da página, e não na superfície de gráfico.

Não há mecanismo de isenção: uma superfície neutra futura que não hospede
ação nenhuma SHALL ser varrida assim mesmo, ao piso de 4,5:1. Enquanto uma
superfície neutra e uma cor de ação existirem no mesmo tema, elas SHALL ser
legíveis juntas, tenham ou não sido postas juntas hoje.

Estados declarados: o gráfico **desenhado** e o gráfico **bloqueado** — que
substitui o desenho inteiro — SHALL ambos satisfazer a proibição de texto
interativo. A superfície de gráfico SHALL NOT declarar estado de hover nem de
foco.

**Por quê:** uma superfície de gráfico que fosse um quarto valor escaparia da
checagem da cor de ação, que percorre as superfícies neutras — por isso ela
precisa ser uma das superfícies já declaradas, e não um valor próprio. Isso
não a tira da varredura de 4,5:1 da cor de ação, e mantê-la lá é intencional:
a varredura fecha o conjunto de superfícies, não descreve o que cada uma
hospeda; uma superfície fora dela é exatamente o lugar onde o defeito que
motivou este requisito pode voltar sem ser medido, e o custo de mantê-la
dentro é nenhum, porque ela já é uma das superfícies neutras do tema. Os dois
pisos — 3:1 para a marca desenhada na superfície de gráfico, 4,5:1 para a cor
de ação que poderia vir a cair sobre ela — convivem sobre a mesma superfície
porque medem coisas diferentes. Nome do gráfico, legenda, ausências
declaradas e representação em texto ficam fora da superfície de gráfico
porque o piso que vale ali é o de texto, e ele já é conferido na superfície da
página. A ausência de mecanismo de isenção é escolha: um token que
declarasse "esta superfície não recebe ação" seria uma afirmação sobre um
futuro que ninguém pode conferir, e um piso que vale sempre é conferível
agora; se um dia uma superfície neutra não puder sustentar 4,5:1 contra a cor
de ação do seu tema, isso volta à mesa como decisão, não como isenção
concedida em silêncio. Não há estado de hover ou de foco na superfície de
gráfico porque não há nada interativo nela; é isso que a proibição de texto
interativo fixa.

#### Scenario: Superfície ausente impede a checagem

- **WHEN** a superfície de gráfico de um tema não está declarada
- **THEN** a checagem de paleta falha nomeando o tema, em vez de usar um valor implícito
- **Prova:** superfície removida por plantio, checagem falhando, plantio revertido

#### Scenario: Superfície de gráfico fora do conjunto neutro reprova

- **WHEN** a superfície de gráfico de um tema recebe um valor que não é o de nenhuma superfície neutra declarada daquele tema
- **THEN** a verificação falha nomeando o tema e o valor
- **Prova:** valor próprio plantado na superfície de gráfico, verificação falhando, plantio revertido

#### Scenario: Série da paleta abaixo do piso de objeto gráfico reprova nomeando a série e o tema

- **WHEN** uma série da paleta categórica fica abaixo de 3:1 contra a superfície de gráfico do seu tema
- **THEN** a verificação falha nomeando a série, a razão medida e o tema, e não o piso de texto
- **Prova:** teste que planta uma série abaixo de 3:1 contra a superfície de gráfico do tema e confere a mensagem nomeando a série, a razão e o tema

#### Scenario: Elemento interativo na superfície de gráfico reprova

- **WHEN** uma história de gráfico renderiza, dentro da superfície de gráfico, um elemento alcançável por foco ou que responda a ponteiro
- **THEN** a verificação falha nomeando a história e o elemento
- **Prova:** elemento focalizável plantado dentro da superfície de gráfico, verificação falhando nos dois temas, plantio revertido

#### Scenario: Texto do gráfico movido para a superfície de gráfico reprova

- **WHEN** o nome do gráfico, a legenda, uma ausência declarada ou a representação em texto passa a ser pintado pela cor computada da superfície de gráfico do tema
- **THEN** a verificação falha nomeando o elemento e o tema
- **Prova:** elemento plantado dentro da superfície de gráfico, verificação falhando nos dois temas, plantio revertido

#### Scenario: Superfície neutra que não hospeda ação é varrida assim mesmo

- **WHEN** uma superfície neutra é declarada num tema e nenhum componente coloca ação sobre ela
- **THEN** ela entra na varredura de 4,5:1 da cor de ação como qualquer outra, e reprova se não sustentar o piso
- **Prova:** superfície neutra plantada com valor que reprova, sem nenhum consumidor, verificação falhando nomeando a superfície, plantio revertido

#### Scenario: Gráfico bloqueado também não hospeda interativo

- **WHEN** a projeção está bloqueada e o desenho é substituído pela primitiva de projeção bloqueada
- **THEN** a superfície de gráfico segue sem elemento interativo
- **Prova:** afirmação executada na história de projeção bloqueada, nos dois temas

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
