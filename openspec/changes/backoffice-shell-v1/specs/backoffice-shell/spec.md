# Spec Delta

## Purpose

Define o comportamento observável do shell do back office: o que o documento
entregue por uma rota estática carrega e recusa carregar, quais regiões a
moldura declara, como tema e tipografia chegam sem script nenhum, e quais
estados a moldura tem — e quais ela recusa ter enquanto não exibir dado.

## ADDED Requirements

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

### Requirement: Rotas emitidas são as declaradas

O conjunto de rotas para as quais a construção emite documento SHALL ser
declarado, e a verificação SHALL reprovar quando o conjunto emitido divergir do
declarado, em qualquer dos dois sentidos.

**Por quê:** a exclusão "nenhuma rota de negócio" só é verificável se acrescentar
rota for ato deliberado e visível. Sem a declaração, uma rota nova entra sem que
nada reprove, e o limite do ciclo passa a depender de quem lembra dele.

#### Scenario: Rota acrescentada sem declaração reprova

- **WHEN** a construção emite documento para uma rota que não está declarada
- **THEN** a verificação falha nomeando a rota emitida e não declarada
- **Prova:** rota plantada, verificação falhando com a rota nomeada, plantio revertido

#### Scenario: Rota declarada que não é emitida reprova

- **WHEN** uma rota está declarada e a construção não emite documento para ela
- **THEN** a verificação falha nomeando a rota declarada e ausente
- **Prova:** rota declarada sem página correspondente, verificação falhando, plantio revertido

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
- **Prova:** história da moldura na bancada que tabula, aciona e lê o elemento focado, nos dois temas

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
