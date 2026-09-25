# backoffice-shell

## Purpose

Define o comportamento observável do shell do back office: o que o documento
entregue por uma rota estática carrega e recusa carregar, quais regiões a
moldura declara, como tema e tipografia chegam sem script nenhum, e quais
estados a moldura tem — e quais ela recusa ter enquanto não exibir dado.

## Requirements

### Requirement: Documento emitido por rota estática

A construção da aplicação SHALL emitir um documento HTML para a rota raiz.

Toda afirmação sobre o documento emitido SHALL reprovar quando o artefato
correspondente não existir, e SHALL NOT ser reportada como pulada em nenhuma
circunstância.

**Por quê:** o caminho do artefato é interno ao framework e uma rota que deixe
de ser estaticamente pré-renderizada para de emitir documento — os riscos R1 e
R2 de `docs/decisao-prova-de-comportamento-de-aplicacao.md`. Afirmação que pula
quando não acha o arquivo transforma quebra em silêncio, e é assim que uma
prova morre sem ninguém saber.

#### Scenario: A rota raiz emite documento

- **WHEN** a construção da aplicação é executada
- **THEN** existe, entre os artefatos emitidos, um documento HTML correspondente à rota raiz
- **Prova:** teste do documento emitido em `apps/backoffice`, que executa a construção e lê o artefato

#### Scenario: Artefato ausente reprova e não pula

- **WHEN** as afirmações sobre o documento emitido são executadas sem o artefato correspondente
- **THEN** a verificação falha nomeando o caminho procurado, e a saída não reporta nenhuma afirmação pulada
- **Prova:** artefato emitido removido antes da execução, verificação falhando com o caminho nomeado, remoção revertida

#### Scenario: Rota que deixa de ser estática reprova

- **WHEN** a rota raiz passa a ser resolvida por requisição e deixa de emitir documento
- **THEN** a verificação falha nomeando a rota que deixou de emitir
- **Prova:** rota tornada dinâmica por plantio, verificação falhando, plantio revertido

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

### Requirement: Idioma declarado no documento entregue

O elemento raiz do documento emitido SHALL declarar o idioma pt-BR.

**Por quê:** leitura assistida escolhe a fonética pelo idioma declarado no
documento. Rótulo em português lido com a fonética de outro idioma é
ininteligível, e nenhum componente pode corrigir isso por conta própria.

#### Scenario: O documento entregue declara pt-BR

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** seu elemento raiz declara o idioma pt-BR
- **Prova:** teste do documento emitido que lê o idioma do elemento raiz

#### Scenario: Idioma divergente reprova

- **WHEN** o elemento raiz do documento emitido declara outro idioma
- **THEN** a verificação falha nomeando o idioma encontrado e o exigido
- **Prova:** idioma divergente plantado, verificação falhando, plantio revertido

### Requirement: Tema sem script

O documento emitido SHALL NOT mencionar o atributo de tema, e seu elemento raiz
SHALL NOT declarar tema.

Nenhum script emitido pela construção SHALL mencionar o atributo de tema.

A folha de estilo publicada pela camada de tokens SHALL ficar fora dessa
proibição, e a varredura SHALL NOT alcançá-la.

A moldura SHALL ser exercitada nos temas claro e escuro. A moldura SHALL NOT
declarar estado de escolha de tema.

**Por quê:** o shell não oferece escolha explícita de tema; a camada de tokens
resolve claro e escuro pela preferência do sistema, em CSS puro, desde o ciclo 2.
Declarar o atributo no documento fixaria um tema contra a preferência de quem
lê, e um script capaz de alterá-lo só seria provável na camada 3, que não
existe. A folha de estilo fica de fora porque as regras que ela entrega — a que
responde à preferência do sistema e a que responde ao atributo — **são** o
mecanismo do tema: o requisito "As regras dos dois temas chegam ao documento
entregue" exige que elas cheguem, e uma varredura que as alcançasse reprovaria
exatamente o que o outro requisito obriga a entregar. O que esta proibição
persegue é código que decide tema, e código emitido é documento e script.
Escolha explícita de tema é estado não aplicável pela mesma razão: o dia em que
o shell a oferecer, este requisito muda e o script que a implemente passa a
precisar de exigência própria sobre a posição dele no documento entregue.

#### Scenario: O documento entregue não fixa tema

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** seu elemento raiz não declara atributo de tema
- **Prova:** teste do documento emitido que procura o atributo de tema no elemento raiz

#### Scenario: Nenhum script emitido conhece o atributo de tema

- **WHEN** os artefatos de script emitidos pela construção são lidos
- **THEN** nenhum deles menciona o atributo de tema
- **Prova:** teste que varre os scripts emitidos pela construção procurando o atributo

#### Scenario: Atributo de tema plantado reprova

- **WHEN** o elemento raiz do documento emitido passa a declarar um tema
- **THEN** a verificação falha nomeando o tema encontrado
- **Prova:** atributo plantado, verificação falhando, plantio revertido

### Requirement: As regras dos dois temas chegam ao documento entregue

O estilo que o documento emitido entrega SHALL conter as regras do tema claro e
as do tema escuro publicadas pela camada de tokens.

**Por quê:** sem as regras no que é entregue, o documento não tem tema nenhum, e
as exigências de cor e de tipografia da moldura passariam a valer apenas dentro
da bancada — que monta a página por conta própria e não prova nada sobre o
documento que uma pessoa recebe.

#### Scenario: As duas preferências estão no estilo entregue

- **WHEN** o estilo entregue pelo documento emitido é lido
- **THEN** ele contém as declarações de tema para a preferência clara e para a preferência escura
- **Prova:** teste do documento emitido que segue a referência de estilo e procura as duas declarações

#### Scenario: Estilo não entregue reprova

- **WHEN** o documento emitido não entrega estilo que contenha as regras de tema
- **THEN** a verificação falha nomeando o que procurou e não achou
- **Prova:** referência de estilo removida por plantio, verificação falhando, plantio revertido

### Requirement: Regiões da moldura no documento entregue

O documento emitido SHALL conter uma região de cabeçalho identificável pelo seu
papel, que nomeia o produto, e uma região de conteúdo principal identificável
pelo seu papel.

O documento emitido SHALL NOT conter região de navegação.

**Por quê:** região identificável pelo papel é o que permite saltar direto ao
conteúdo em leitura assistida. A navegação fica de fora porque não existe rota
de negócio para listar, e região de navegação vazia anuncia um destino que não
existe.

#### Scenario: As duas regiões estão no documento entregue

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** existe nele uma região de cabeçalho que contém o nome do produto e uma região de conteúdo principal
- **Prova:** teste do documento emitido que procura as duas regiões pelo papel

#### Scenario: Região de navegação reprova

- **WHEN** o documento emitido contém uma região de navegação
- **THEN** a verificação falha nomeando a região encontrada
- **Prova:** região de navegação plantada, verificação falhando, plantio revertido

#### Scenario: A moldura renderizada expõe as duas regiões

- **WHEN** a moldura é renderizada com um nome de produto
- **THEN** a região de cabeçalho e a região de conteúdo principal são alcançáveis pelo papel, e o nome do produto aparece no cabeçalho
- **Prova:** história da moldura na bancada, executada nos dois temas

### Requirement: Salto para o conteúdo

O primeiro elemento focalizável do documento emitido SHALL ser um link cujo
destino é a região de conteúdo principal, e essa região SHALL existir no mesmo
documento.

Acionar esse link SHALL mover o foco para a região de conteúdo principal.

**Por quê:** quem navega por teclado atravessa o cabeçalho inteiro a cada rota
sem ele. O salto que não move o foco é pior que a ausência dele: anuncia um
atalho e devolve a pessoa ao mesmo lugar.

#### Scenario: O salto é o primeiro focalizável do documento entregue

- **WHEN** os elementos focalizáveis do documento emitido são enumerados na ordem do documento
- **THEN** o primeiro deles é o link de salto, e seu destino corresponde à região de conteúdo principal presente no mesmo documento
- **Prova:** teste do documento emitido que enumera os elementos focalizáveis e confere o destino

#### Scenario: Elemento focalizável antes do salto reprova

- **WHEN** um elemento focalizável passa a preceder o link de salto no documento emitido
- **THEN** a verificação falha nomeando o elemento que passou à frente
- **Prova:** elemento focalizável plantado antes do salto, verificação falhando, plantio revertido

#### Scenario: Acionar o salto move o foco

- **WHEN** a moldura é navegada por teclado e o link de salto é acionado
- **THEN** o elemento focado passa a ser a região de conteúdo principal
- **Prova:** história da moldura na bancada que tabula até o salto, confere o
  destino dele e navega até esse fragmento, lendo o elemento focado, nos dois
  temas. A navegação é feita pelo fragmento, e não acionando a âncora: acionar
  uma âncora dentro da bancada derruba a conexão do executor com a página, por
  teclado, por clique e por clique programático. O que a âncora acrescentaria à
  afirmação é que ela navega para o próprio href, e o href é conferido na mesma
  história; o resto — o alvo do fragmento receber o foco — é o que a moldura
  decide, e é o que a afirmação mede

### Requirement: Moldura recebe por propriedade todo texto que exibe

Componente da moldura SHALL receber por propriedade todo texto que exibe, e
SHALL NOT declarar rótulo em português no próprio arquivo.

**Por quê:** nome do produto e texto do salto são decisão da aplicação, não da
biblioteca — a mesma fronteira que as primitivas de domínio já respeitam. Rótulo
embutido no componente vira valor padrão que ninguém revisa e que reaparece em
qualquer aplicação que consuma o pacote.

#### Scenario: Moldura sem o texto exigido não compila

- **WHEN** a moldura é usada sem o nome do produto ou sem o texto do salto
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso incompleto plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: Rótulo declarado no componente reprova

- **WHEN** um componente da moldura declara texto em português no próprio arquivo
- **THEN** a verificação falha, nomeando o arquivo e o texto
- **Prova:** rótulo plantado no componente, guardião de vocabulário falhando, plantio revertido

### Requirement: Tipografia declarada aplicada à moldura

O texto da moldura SHALL ser apresentado na família tipográfica declarada pela
camada de tokens, nos dois temas.

**Por quê:** a família é decisão da camada de tokens, registrada em
`docs/decisao-identidade-visual.md`, e a moldura aplica o que foi declarado, sem
escolher. Sem a exigência, a moldura herda a família do navegador e o documento
sai com duas tipografias, uma delas escolhida por ninguém.

#### Scenario: A família resolvida é a declarada

- **WHEN** a moldura é renderizada e a família tipográfica do seu texto é medida
- **THEN** ela coincide com a família declarada pela camada de tokens
- **Prova:** história da moldura na bancada que compara o estilo computado com o valor resolvido do token, nos dois temas

#### Scenario: Família própria na moldura reprova

- **WHEN** um arquivo da moldura declara família tipográfica em vez de consumir o token
- **THEN** a verificação falha nomeando o arquivo e a linha
- **Prova:** família plantada no arquivo da moldura, verificação falhando, plantio revertido

### Requirement: Moldura sobre a superfície do tema

A moldura SHALL apresentar-se sobre a superfície base do tema corrente, com o
texto na cor de texto primária do mesmo tema.

A moldura SHALL sustentar, nos dois temas, a checagem de acessibilidade
executada sobre o resultado renderizado.

**Por quê:** a moldura é o fundo de tudo que vier depois; se ela não assume a
superfície do tema, cada tela posterior precisa assumir por conta própria, e a
primeira que esquecer fica branca no tema escuro.

#### Scenario: Superfície e texto são os do tema corrente

- **WHEN** a moldura é renderizada em cada um dos dois temas
- **THEN** a superfície e a cor do texto resolvem para os valores do tema corrente
- **Prova:** história da moldura na bancada que compara as cores computadas com os valores resolvidos dos tokens, tema a tema

#### Scenario: Violação de acessibilidade reprova nomeando o tema

- **WHEN** a moldura viola uma regra de acessibilidade em um dos temas
- **THEN** a verificação falha, nomeando a regra, o elemento e o tema
- **Prova:** violação plantada na moldura, verificação falhando com o tema nomeado, plantio revertido

### Requirement: Estados da moldura declarados e exercitados

A moldura SHALL declarar seus estados, e cada estado declarado SHALL possuir
história que o exercite.

Os estados declarados SHALL ser **repouso**, com o salto presente e sem foco, e
**salto focado**, com o link de salto em foco visível.

A moldura SHALL NOT declarar estado de carregamento, de vazio ou de erro.

**Por quê:** a moldura não busca dado e não exibe valor, então carregamento,
vazio e erro não têm como existir nela — declará-los seria prometer estado que
nenhuma história consegue exercitar. Eles passam a ser exigíveis no ciclo em que
a moldura hospedar conteúdo que dependa de dado, e esse ciclo reabre este
requisito.

#### Scenario: Estado sem história reprova

- **WHEN** a moldura declara um estado que nenhuma história exercita
- **THEN** a verificação falha, nomeando a moldura e o estado sem história
- **Prova:** estado sem história plantado, verificação de cobertura de histórias falhando, plantio revertido

#### Scenario: O salto focado é visível

- **WHEN** a história do estado de salto focado é executada
- **THEN** o link de salto está em foco e o indicador de foco é discernível nos dois temas
- **Prova:** história do estado focado na bancada, com a checagem de acessibilidade executada nos dois temas
