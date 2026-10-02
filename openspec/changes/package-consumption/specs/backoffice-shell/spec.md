# Spec Delta

## MODIFIED Requirements

### Requirement: Regiões da moldura no documento entregue

O documento emitido SHALL conter uma região de cabeçalho identificável pelo seu
papel, que nomeia o produto, e uma região de conteúdo principal identificável
pelo seu papel.

O documento emitido SHALL NOT conter região de navegação.

A imagem de marca do cabeçalho, no documento emitido, SHALL referenciar um
arquivo que a construção emitiu: a referência SHALL corresponder a um artefato
existente entre os emitidos, e a verificação SHALL reprovar nomeando a referência
encontrada quando não corresponder.

A moldura SHALL receber por propriedade a URL do arquivo de marca, e SHALL NOT
escolher esse arquivo por conta própria.

**Por quê:** região identificável pelo papel é o que permite saltar direto ao
conteúdo em leitura assistida. A navegação fica de fora porque não existe rota
de negócio para listar, e região de navegação vazia anuncia um destino que não
existe. `NavPanel` e o slot `nav` de `AppFrame` existem como componentes de
biblioteca, verificados na bancada (`shell-components`) — nenhum dos dois é
ligado ao documento emitido por `apps/backoffice` enquanto não existir rota de
negócio real, pela mesma razão registrada aqui. A mesma disciplina vale para
`NavRail` e para o slot `rail` de `AppFrame`, acrescentados numa mudança
posterior: nenhum dos dois é ligado a `apps/backoffice` enquanto não existir
rota de negócio real. O gatilho já previsto — "a
moldura hospedar conteúdo que dependa de dado" — segue sendo o que reabre este
requisito. O cabeçalho compõe `Logo` — uma imagem vetorial de marca — em vez
de exibir o nome do produto como texto puro.

**O nome acessível continua sendo a prova de que o cabeçalho se anuncia pelo nome
do produto, e deixa de ser a única prova sobre a marca.** A redação anterior
deste bloco dizia que "nome acessível" cobria "as duas formas que o nome do
produto pode assumir no cabeçalho — texto visível ou `alt`/rótulo do `Logo` —
sem prescrever qual delas a implementação escolhe", e por isso a afirmação
conferia só o nome acessível. Afrouxar a afirmação para não prescrever
implementação foi o que deixou passar uma referência de arquivo quebrada:
**medido** na `main`, três documentos emitidos
(`server/app/index.html`, `server/app/_not-found.html` e
`server/pages/404.html`) entregaram `src="[object Object]"` com o nome acessível
correto, e nenhuma afirmação reprovou. Não prescrever a forma do nome acessível
continua certo; não afirmar nada sobre a referência do arquivo não era
contenção, era omissão. A obrigação nova não prescreve forma nenhuma: ela exige
que a referência, qualquer que seja, aponte para um arquivo que a construção
emitiu.

A moldura receber a URL por propriedade é a outra metade do mesmo defeito, do
lado do pacote: `Logo` deixou de resolver o arquivo de marca
(`shell-components`), e a moldura não pode resolver no lugar dele — resolveria
pelo empacotador errado uma camada acima. A URL atravessa por propriedade até a
aplicação, que é quem sabe como o próprio empacotador produz URL.

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
- **THEN** a região de cabeçalho e a região de conteúdo principal são alcançáveis pelo papel, e o cabeçalho tem nome acessível igual ao nome do produto
- **Prova:** história da moldura na bancada, executada nos dois temas

#### Scenario: A referência da marca aponta para um arquivo emitido

- **WHEN** o documento emitido da rota raiz é lido e a referência da imagem de marca do cabeçalho é seguida
- **THEN** existe, entre os artefatos emitidos pela construção, o arquivo correspondente a essa referência
- **Prova:** teste do documento emitido que lê a referência e procura o artefato correspondente entre os emitidos

#### Scenario: Referência de marca que não aponta para arquivo emitido reprova

- **WHEN** a referência da imagem de marca não corresponde a nenhum artefato emitido
- **THEN** a verificação falha nomeando a referência encontrada e o caminho procurado
- **Prova:** a forma anterior desta mudança plantada de volta — a marca resolvida dentro do pacote, que emite `src="[object Object]"` —, teste do documento emitido falhando com a referência nomeada, plantio revertido

#### Scenario: Moldura sem a URL da marca não compila

- **WHEN** a moldura é usada sem a propriedade da URL do arquivo de marca
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso incompleto plantado em arquivo de checagem de tipos da moldura, `verify:types` falhando, plantio revertido
