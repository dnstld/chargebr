# domain-charts

## Purpose

Define o comportamento observável da camada de gráficos do ChargeBR: o que ela
recusa desenhar, como estado não resolvido aparece em formas que não têm
preenchimento, e o que garante que a cor nunca seja o único canal de identidade.

## Requirements

### Requirement: Projeção bloqueada substitui o gráfico

Quando a projeção está bloqueada, a camada SHALL renderizar a primitiva de
projeção bloqueada no lugar do gráfico, e SHALL NOT renderizar eixo, grade,
escala ou intervalo.

#### Scenario: Bloqueio não deixa escala visível

- **WHEN** um gráfico recebe uma projeção bloqueada
- **THEN** nenhum eixo, grade ou rótulo de escala é renderizado, e a razão do bloqueio aparece
- **Prova:** teste que renderiza com projeção bloqueada e verifica a ausência de elementos de eixo e de escala

### Requirement: Não resolvido nunca é ligado a resolvido

Numa forma que liga pontos, a camada SHALL interromper a ligação entre um ponto
resolvido e um não resolvido, e SHALL marcar o ponto não resolvido com hachura.

#### Scenario: Segmento interrompido no ponto não resolvido

- **WHEN** uma série contém um ponto não resolvido entre dois resolvidos
- **THEN** não existe segmento ligando o ponto não resolvido aos vizinhos, e sua marca usa hachura
- **Prova:** teste que renderiza a série e inspeciona os segmentos desenhados e o preenchimento da marca

### Requirement: A hachura é uma só

A hachura usada em gráfico SHALL derivar da mesma definição da hachura usada fora
do gráfico, e divergência entre as duas SHALL reprovar a verificação.

#### Scenario: Hachuras divergentes reprovam

- **WHEN** a definição da hachura do gráfico difere da definição compartilhada
- **THEN** a verificação falha, nomeando as duas definições
- **Prova:** divergência plantada, verificação falhando, plantio revertido

### Requirement: Paleta validada na forma de pares da própria forma

A camada SHALL aplicar as seis checagens de paleta com a lista de pares
correspondente à forma: pares adjacentes para formas em que só vizinhos se tocam,
e todos os pares para formas em que qualquer marca pode encostar em qualquer
outra.

#### Scenario: Forma de todos os pares usa a checagem mais dura

- **WHEN** uma forma em que qualquer marca pode encostar em qualquer outra é verificada
- **THEN** a checagem de paleta é executada sobre todos os pares, e não apenas sobre os adjacentes
- **Prova:** execução registrada por forma, com a lista de pares usada em cada uma

### Requirement: Limite de séries decorre da paleta

A camada SHALL recusar mais séries do que a paleta sustenta para aquela forma, e
SHALL NOT gerar cor nova para acomodar uma série adicional.

#### Scenario: Série acima do limite reprova

- **WHEN** uma forma de todos os pares recebe mais séries do que a paleta sustenta
- **THEN** a verificação de tipos falha, nomeando a forma e o limite
- **Prova:** excesso de séries plantado, `verify:types` falhando, plantio revertido

### Requirement: Identidade nunca depende só de cor

Com duas ou mais séries, a camada SHALL apresentar legenda, e SHALL NOT usar a
cor como único meio de distinguir séries.

#### Scenario: Duas séries exigem legenda

- **WHEN** um gráfico com duas ou mais séries é renderizado
- **THEN** existe legenda que nomeia cada série, alcançável na leitura assistida
- **Prova:** teste que renderiza e localiza os nomes das séries no conteúdo acessível

### Requirement: Uma escala por gráfico

A camada SHALL NOT renderizar duas escalas de valor no mesmo gráfico.

#### Scenario: Segunda escala reprova

- **WHEN** um gráfico é declarado com duas medidas de escalas diferentes
- **THEN** a verificação de tipos falha, nomeando o gráfico
- **Prova:** segunda escala plantada, `verify:types` falhando, plantio revertido

### Requirement: Ausência nunca é zero

Um ponto ausente SHALL NOT ser desenhado como zero, interpolado ou omitido em
silêncio; a ausência SHALL ser declarada.

#### Scenario: Ponto ausente não vira zero nem interpolação

- **WHEN** uma série contém um ponto ausente
- **THEN** nenhuma marca é desenhada na posição, nenhum segmento a atravessa, e a ausência é declarada
- **Prova:** teste que renderiza a série com ponto ausente e inspeciona marcas e segmentos

### Requirement: Valores alcançáveis sem a visão

Todo gráfico SHALL oferecer acesso aos seus valores por meio não visual, e esse
acesso SHALL conduzir à proveniência de cada valor.

#### Scenario: Valores e proveniência alcançáveis por leitura assistida

- **WHEN** um gráfico é renderizado
- **THEN** existe uma representação equivalente em texto, com os valores e o caminho até a evidência de cada um
- **Prova:** teste que localiza a representação equivalente e confere valores e caminhos
