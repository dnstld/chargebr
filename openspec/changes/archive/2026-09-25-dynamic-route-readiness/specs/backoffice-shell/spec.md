# Spec Delta — backoffice-shell

## RENAMED Requirements

- FROM: `### Requirement: Rotas emitidas são as declaradas`
- TO: `### Requirement: Rotas construídas são as declaradas`

## MODIFIED Requirements

### Requirement: Rotas construídas são as declaradas

A verificação SHALL obter da saída da construção a lista de rotas que a
construção produz, e SHALL reprovar quando essa lista divergir da lista
declarada, em qualquer dos dois sentidos.

A lista de rotas SHALL cobrir toda rota que a construção produz, de página ou
de outra natureza — metadados, manipuladores de rota e as rotas que o framework
gera por conta própria —, sem exceção por nome ou por forma.

A convenção de rotas da aplicação SHALL ser a do App Router.

Cada rota da convenção de rotas da aplicação SHALL declarar uma de duas formas
de entrega: **pré-renderizada**, quando a construção produz a resposta da rota
durante a construção, ou **resolvida por requisição**, quando não produz. A
verificação SHALL reprovar quando a forma observada de uma rota divergir da
declarada.

A forma observada SHALL ser lida de uma única fonte: a classificação que a
própria construção atribui à rota. A presença ou a ausência de documento SHALL
NOT ser usada para observar a forma.

Rota com parâmetro que a construção pré-renderize para uma lista de valores e
resolva por requisição para valor fora dela SHALL reprovar, declarada ou não.

A construção SHALL NOT produzir rota fora da convenção de rotas da aplicação,
exceto as que o framework gera por conta própria. Cada uma destas SHALL ser
declarada pelo nome, com os documentos que emite, e SHALL NOT declarar forma de
entrega. A verificação SHALL reprovar, nomeando a rota, quando a construção
produzir fora da convenção uma rota que não esteja declarada assim.

A ausência do artefato de onde a lista de rotas ou a forma de entrega é obtida,
e um formato desse artefato que a verificação não reconheça, SHALL reprovar
nomeando o que foi procurado, e SHALL NOT ser reportados como afirmação pulada.

**Por quê:** a trava anterior comparava documentos, e uma rota resolvida por
requisição não emite documento: ela entrava sem que nenhum dos dois lados a
visse, e a verificação passava verde com a rota inteira sem prova — medido na
proposta deste ciclo, oito afirmações verdes com uma rota que ninguém declarou.
A exclusão "nenhuma rota de negócio" só é verificável se acrescentar rota for
ato deliberado e visível, e isso vale para toda forma de entrega, não só para a
que emite documento. Declarar a forma é o que torna revisável que a camada 2 não
alcança o documento de uma rota resolvida por requisição: quem declara, declara
a lacuna junto.

A forma é lida de uma fonte só porque duas fontes discordam, e foi medido: uma
rota de metadados — ícone, mapa do site — é pré-renderizada pela classificação
da construção e não emite documento nenhum, só a resposta crua. Lida pelo
documento, ela passaria por resolvida por requisição. A classificação da
construção é a fonte porque é ela que diz o que foi produzido; documento é uma
das formas que a resposta produzida pode ter, e a trava de documentos é
exigência separada.

O App Router é a convenção porque foi a escolhida: decisão D1 de
`docs/decisao-configuracao-inicial-do-workspace.md`, fixada na stack da seção
`context` de `openspec/config.yaml`. Até este requisito, a escolha era
descritiva — dizia com que a aplicação é feita —, e é aqui que ela passa a
obrigar; trocar de convenção reabre este requisito por ciclo, e não só aquela
linha. Ela é a única admitida também porque fora dela nenhuma fonte única
classifica a forma — medido no roteador de páginas: página estática sem função de dados emite documento e
não consta da classificação de pré-renderização; página com função de dados em
tempo de construção consta dela e não se distingue, na lista de rotas, de
página resolvida por requisição. As rotas que o framework gera sozinho fora da
convenção são declaradas pelo nome e não pela forma pela mesma razão: nenhuma
fonte única as classifica, e o que se exige delas é existirem como declaradas.

A forma mista é recusada porque a parte dela resolvida por requisição é o mesmo
ponto cego, e aceitá-la exigiria uma forma de declaração que nenhum ciclo
precisou. A lista não admite exceção porque exceção é onde uma rota nova se
esconde. Formato não reconhecido reprova pela mesma razão que artefato ausente:
uma lista lida errado deixa de ser prova sem deixar de passar.

#### Scenario: Rota resolvida por requisição sem declaração reprova

- **WHEN** a construção produz uma rota resolvida por requisição que não está declarada
- **THEN** a verificação falha nomeando a rota produzida e não declarada
- **Prova:** rota com segmento dinâmico plantada sem declaração, teste do documento emitido em `apps/backoffice` falhando com a rota nomeada, plantio revertido

#### Scenario: Rota acrescentada sem declaração reprova

- **WHEN** a construção produz uma rota pré-renderizada que não está declarada
- **THEN** a verificação falha nomeando a rota produzida e não declarada
- **Prova:** rota estática aninhada plantada sem declaração, teste do documento emitido falhando com a rota nomeada, plantio revertido

#### Scenario: Rota que não é página, sem declaração, reprova

- **WHEN** a construção produz uma rota que responde sem ser página e ela não está declarada
- **THEN** a verificação falha nomeando a rota produzida e não declarada
- **Prova:** rota de metadados plantada sem declaração, e manipulador de rota plantado sem declaração, cada plantio fazendo o teste do documento emitido falhar com a rota nomeada, plantios revertidos

#### Scenario: A forma de rota pré-renderizada sem documento é lida da classificação

- **WHEN** a construção classifica como pré-renderizada uma rota de metadados que não emite documento
- **THEN** declarada como pré-renderizada, sem documento, a verificação passa; declarada como resolvida por requisição, a verificação falha nomeando a rota, a forma declarada e a forma observada
- **Prova:** ícone da aplicação plantado e declarado de cada uma das duas maneiras, teste do documento emitido passando na primeira e falhando na segunda, plantio revertido

#### Scenario: Rota fora da convenção de rotas da aplicação reprova

- **WHEN** a construção produz, fora da convenção de rotas da aplicação, uma rota que não é das geradas pelo framework
- **THEN** a verificação falha nomeando a rota, mesmo que ela esteja declarada com uma forma de entrega
- **Prova:** página plantada no roteador de páginas, sem declaração e depois declarada com forma, teste do documento emitido falhando nos dois casos com a rota nomeada, plantio revertido

#### Scenario: Rota declarada que não é emitida reprova

- **WHEN** uma rota está declarada e a construção não a produz
- **THEN** a verificação falha nomeando a rota declarada e ausente
- **Prova:** rota declarada sem página correspondente, teste do documento emitido falhando com a rota nomeada, plantio revertido

#### Scenario: Forma divergente da declarada reprova

- **WHEN** uma rota declarada como resolvida por requisição passa a ser pré-renderizada, ou uma rota declarada como pré-renderizada passa a ser resolvida por requisição
- **THEN** a verificação falha nomeando a rota, a forma declarada e a forma observada
- **Prova:** rota de prova tornada pré-renderizada por uma lista fechada de valores, e rota raiz tornada resolvida por requisição, cada plantio fazendo o teste do documento emitido falhar nos termos do cenário, plantios revertidos

#### Scenario: Rota pré-renderizada com resolução por requisição fora da lista reprova

- **WHEN** a construção pré-renderiza uma rota com parâmetro para uma lista de valores e a resolve por requisição para valor fora dela
- **THEN** a verificação falha nomeando a rota, mesmo que ela esteja declarada como pré-renderizada com os documentos que emite
- **Prova:** rota com lista aberta de valores plantada e declarada como pré-renderizada, teste do documento emitido falhando com a rota nomeada, plantio revertido

#### Scenario: Rota resolvida por requisição declarada passa

- **WHEN** a construção produz uma rota resolvida por requisição e ela está declarada com essa forma
- **THEN** a verificação passa, sem afirmar nada sobre documento dessa rota
- **Prova:** execução de `pnpm verify` sobre a árvore corrente, que contém a rota de prova `/prova/[id]` declarada como resolvida por requisição

#### Scenario: Artefato da lista de rotas ausente reprova e não pula

- **WHEN** as afirmações sobre rotas são executadas sem o artefato de onde a lista de rotas ou a forma de entrega é obtida
- **THEN** a verificação falha nomeando o caminho procurado, e a saída não reporta nenhuma afirmação pulada
- **Prova:** cada artefato removido antes da execução, teste do documento emitido falhando com o caminho nomeado, remoção revertida

#### Scenario: Formato não reconhecido reprova

- **WHEN** o artefato de onde a forma de entrega é obtida declara um formato diferente do que a verificação reconhece
- **THEN** a verificação falha nomeando o formato encontrado e o reconhecido
- **Prova:** formato alterado no artefato depois da construção, teste do documento emitido falhando nos termos do cenário, alteração revertida

## ADDED Requirements

### Requirement: Documentos emitidos são os declarados

Documento é o HTML que a construção emite. Cada rota declarada como
pré-renderizada, e cada rota gerada pelo framework, SHALL declarar os documentos
que a construção emite para ela, cada um pelo caminho exato em que a construção
o emite — nenhum, quando a resposta produzida não é documento. Rota declarada
como resolvida por requisição SHALL declarar nenhum documento.

A verificação SHALL reprovar quando o conjunto de documentos emitidos divergir
da união dos documentos declarados, em qualquer dos dois sentidos, nomeando o
caminho divergente.

**Por quê:** o caminho do documento é interno ao framework, e o mapeamento de
rota aninhada para arquivo nunca foi fixado como regra (ponto 2). A proposta
deste ciclo observou três casos que seguem o mesmo desenho, e três casos não são
regra. Declarar cada caminho como observado, e travar o conjunto nos dois
sentidos, faz a própria verificação nomear o caminho emitido quando uma rota
entra ou quando uma versão do framework o move — sem que nenhuma regra de
mapeamento precise ser suposta. A lista vazia para rota pré-renderizada existe
porque a resposta produzida nem sempre é documento — uma rota de metadados
produz a resposta crua —, e a forma não é lida daqui.

#### Scenario: Documento emitido e não declarado reprova

- **WHEN** a construção emite um documento cujo caminho nenhuma rota declara
- **THEN** a verificação falha nomeando o caminho emitido e não declarado
- **Prova:** rota estática aninhada plantada e declarada como pré-renderizada sem documento, teste do documento emitido falhando com o caminho emitido nomeado, plantio revertido

#### Scenario: Documento declarado e não emitido reprova

- **WHEN** uma rota declara um documento que a construção não emite
- **THEN** a verificação falha nomeando o caminho declarado e ausente
- **Prova:** caminho de documento divergente plantado na declaração da rota raiz, teste do documento emitido falhando com o caminho nomeado, plantio revertido

#### Scenario: Rota resolvida por requisição não contribui documento

- **WHEN** a construção produz a árvore corrente, com a rota de prova resolvida por requisição
- **THEN** o conjunto de documentos emitidos coincide com a união dos declarados, e nenhum documento é declarado para a rota de prova
- **Prova:** execução do teste do documento emitido sobre a árvore corrente

### Requirement: Cada forma de entrega é exercitada pela árvore

Para cada forma de entrega que a declaração aceita — pré-renderizada e resolvida
por requisição —, SHALL existir ao menos uma rota declarada com essa forma, e a
verificação SHALL reprovar, nomeando a forma, quando nenhuma existir.

**Por quê:** a forma resolvida por requisição é a que falhava calada. Se nenhuma
rota da árvore a exercitar, o caminho positivo da declaração — uma rota
resolvida por requisição, declarada, passando — só é visto em plantio, e uma
leitura errada da forma pode voltar a passar verde sem que nada a exercite. A
rota raiz exercita a forma pré-renderizada; a rota de prova `/prova/[id]`
exercita a outra, e pode sair no ciclo em que uma rota de negócio resolvida por
requisição passar a exercitá-la. Estados de carregamento, vazio e erro não se
aplicam à rota de prova: ela não exibe dado. E nada sobre o que ela exibe é
exigido aqui — o documento dela é resolvido por requisição, e só a camada 3 o
observaria.

#### Scenario: Forma sem rota que a exercite reprova

- **WHEN** nenhuma rota declarada tem a forma resolvida por requisição
- **THEN** a verificação falha nomeando a forma que ficou sem rota
- **Prova:** rota de prova removida e retirada da declaração por plantio, teste do documento emitido falhando com a forma nomeada, plantio revertido

#### Scenario: As duas formas estão exercitadas na árvore corrente

- **WHEN** a construção produz a árvore corrente
- **THEN** existe ao menos uma rota declarada pré-renderizada e ao menos uma declarada resolvida por requisição, e a verificação passa
- **Prova:** execução do teste do documento emitido sobre a árvore corrente
