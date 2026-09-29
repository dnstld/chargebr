# interface-charts Specification

## Purpose
Define o comportamento observável de desenho de gráfico que não depende de
vocabulário de negócio: paleta, legenda, ponto sem valor, e acesso não visual
aos valores. Sucede `domain-charts` nas garantias que sobrevivem sem
metodologia; bloqueio de projeção, proveniência e o estado "não resolvido"
não migram para cá.

## Requirements

### Requirement: Paleta validada na forma de pares da própria forma

A camada SHALL aplicar as seis checagens de paleta com a lista de pares
correspondente à forma: pares adjacentes para formas em que só vizinhos se
tocam, e todos os pares para formas em que qualquer marca pode encostar em
qualquer outra.

#### Scenario: Forma de todos os pares usa a checagem mais dura

- **WHEN** uma forma em que qualquer marca pode encostar em qualquer outra é verificada
- **THEN** a checagem de paleta é executada sobre todos os pares, e não apenas sobre os adjacentes
- **Prova:** execução registrada por forma, com a lista de pares usada em cada uma

### Requirement: Limite de séries decorre da paleta

A camada SHALL recusar mais séries do que a paleta sustenta para aquela
forma, em execução, e SHALL NOT gerar cor nova para acomodar uma série
adicional.

**Por quê:** decisão do dono — o limite deixa de reprovar em `verify:types` e
passa a reprovar em execução. `seriesColor` já lança ao pedir uma cor além do
que a paleta declara; deixa de existir a checagem de tipo redundante sobre a
mesma garantia.

#### Scenario: Série acima do limite reprova em execução

- **WHEN** uma forma de todos os pares recebe mais séries do que a paleta sustenta
- **THEN** a camada lança um erro em execução, nomeando a forma e o limite
- **Prova:** teste que renderiza com excesso de séries e confere o erro lançado, nomeando forma e limite

### Requirement: Identidade nunca depende só de cor

Com duas ou mais séries, a camada SHALL apresentar legenda, e SHALL NOT usar
a cor como único meio de distinguir séries.

#### Scenario: Duas séries exigem legenda

- **WHEN** um gráfico com duas ou mais séries é renderizado
- **THEN** existe legenda que nomeia cada série, alcançável na leitura assistida
- **Prova:** teste que renderiza e localiza os nomes das séries no conteúdo acessível

### Requirement: Ponto sem valor não é desenhado

Um ponto declarado com `value: null` SHALL NOT receber marca, interpolação ou
valor zero; numa forma que liga pontos, o segmento entre um ponto com valor e
um ponto sem valor SHALL ser interrompido.

**Por quê:** funde o conteúdo normativo de "Não resolvido nunca é ligado a
resolvido" e "Ausência nunca é zero", de `domain-charts` — os dois nomeavam o
mesmo mecanismo sob dois nomes de estado que a nova forma de ponto (`{
category, value }`, decisão do dono) não distingue mais. Os dois estados
possíveis do ponto são `value: number` (com marca) e `value: null` (sem
marca); não há um terceiro estado a declarar.

#### Scenario: Ponto sem valor não vira marca nem zero

- **WHEN** uma série contém um ponto com `value: null`
- **THEN** nenhuma marca é desenhada na posição, e nenhum valor numérico aparece nela
- **Prova:** teste que renderiza a série com um ponto de valor nulo e inspeciona a posição

#### Scenario: Segmento interrompido no ponto sem valor

- **WHEN** uma forma que liga pontos contém um ponto sem valor entre dois pontos com valor
- **THEN** não existe segmento ligando o ponto sem valor aos vizinhos
- **Prova:** teste que renderiza a série e inspeciona os segmentos desenhados

### Requirement: Valores alcançáveis sem a visão

Todo gráfico SHALL oferecer acesso aos seus valores por meio não visual.

**Por quê:** herdado de "Valores alcançáveis sem a visão", de
`domain-charts`, sem a cláusula de proveniência — a nova forma de ponto não
carrega caminho até evidência.

#### Scenario: Valores alcançáveis por leitura assistida

- **WHEN** um gráfico é renderizado
- **THEN** existe uma representação equivalente em texto, com a categoria e o valor de cada ponto
- **Prova:** teste que localiza a representação equivalente e confere os valores
