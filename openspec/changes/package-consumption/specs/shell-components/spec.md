# Spec Delta

## MODIFIED Requirements

### Requirement: Logo não declara cor de marca no próprio código

`Logo` SHALL apresentar o arquivo de marca cuja URL recebe por propriedade, e a
referência que ele renderiza SHALL ser exatamente essa URL.

`Logo` SHALL declarar a forma da marca pela propriedade `variant`
(`"horizontal"`, padrão, ou `"mark"`), e é essa forma que o atributo de forma do
elemento renderizado carrega.

`Logo` SHALL NOT declarar valor de cor no próprio arquivo `.tsx` — nem literal,
nem token.

**Por quê:** `docs/decisao-identidade-visual.md` já fixa que nenhum componente
referencia cor de marca diretamente, e que a marca não tem variante
monocromática nesta fase — isso continua valendo: as duas variantes têm cor
própria, fixada no arquivo SVG, nunca no componente. A variante `mark` nasce
porque a trilha da maquete usa o selo isolado, sem o nome por extenso, ao lado
do SVG horizontal que já existia sem propriedade que o selecionasse. A marca
continua sendo recurso externo, em vez de desenho reescrito como marcação dentro
do componente — é o que mantém o componente sem nenhum literal de cor no próprio
código, sem precisar de isenção no guardião de estilo.

**O que muda, e por quê a URL passa a chegar por propriedade:** até esta mudança
o componente importava o arquivo de marca e deixava para o empacotador de quem
consome a tarefa de transformar esse import em URL. Isso só funciona para um
empacotador: **medido** na `main`, o import devolve cadeia sob o empacotador da
bancada e objeto de imagem estática sob o da aplicação, e o documento emitido por
`apps/backoffice` entregou `src="[object Object]"` em três documentos
(`server/app/index.html`, `server/app/_not-found.html` e
`server/pages/404.html`). O componente não tem como saber qual é o consumidor;
quem compõe tem. A URL é, por isso, do mesmo tipo de entrada que todo texto que
estes componentes exibem: chega por propriedade individual.

**Medido também** — e é o que torna a suposição pior do que um detalhe de
implementação: a diretiva de referência de tipos que o componente declarava para
tipar o import entra no programa de tipos de **todo consumidor**, porque está num
arquivo alcançável por subpath publicado. Removendo-a, a checagem de tipos da
**aplicação** passa a reprovar num import de arquivo de marca. Era ela que
deixava a atribuição de um objeto a uma referência de imagem compilar.

A referência renderizada ser exatamente a URL recebida é o que impede o
componente de voltar a resolver a marca por conta própria e ignorar a
propriedade: nesse caso a referência renderizada deixaria de coincidir com a URL
dada, e a história reprova.

#### Scenario: Logo renderiza sem literal de cor no componente

- **WHEN** o guardião de literal de estilo varre o arquivo de `Logo`
- **THEN** nenhuma ocorrência de literal de cor é reportada nesse arquivo
- **Prova:** `tools/checks/style-literals.test.ts` executado sobre o arquivo de `Logo`

#### Scenario: Logo exibe a marca vigente

- **WHEN** `Logo` é renderizado com cada variante e com a URL do arquivo correspondente
- **THEN** a referência renderizada é a URL recebida, o arquivo termina de carregar com dimensão própria maior que zero, e a marca aparece nas cores fixas da marca sobre o fundo do tema corrente
- **Prova:** história de `Logo` na bancada com as duas variantes, conferindo a referência renderizada contra a URL passada, executada nos dois temas

#### Scenario: Variante padrão continua horizontal

- **WHEN** `Logo` é renderizado sem a propriedade `variant`
- **THEN** a forma declarada no elemento renderizado é a horizontal, como antes desta mudança
- **Prova:** história de `Logo` sem `variant`, conferindo a forma declarada no elemento

#### Scenario: Uso sem a URL da marca não compila

- **WHEN** `Logo` é usado sem a propriedade da URL do arquivo de marca
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem a URL plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: Referência renderizada diferente da URL recebida reprova

- **WHEN** `Logo` resolve a marca por conta própria em vez de usar a URL recebida
- **THEN** a história reprova, nomeando a referência encontrada e a esperada
- **Prova:** resolução própria plantada no componente, história de `Logo` falhando com as duas referências nomeadas, plantio revertido

## ADDED Requirements

### Requirement: Trilha e moldura repassam a URL da marca por propriedade

`NavRail` SHALL receber por propriedade a URL do arquivo de marca que exibe, e
SHALL NOT importar arquivo de marca no próprio código.

Componente desta capacidade que compõe `Logo` SHALL NOT escolher o arquivo de
marca por conta própria: a URL SHALL atravessar por propriedade até quem compõe.

**Por quê:** `Logo` deixa de resolver a marca (requisito acima), e um componente
que o compõe não pode resolver no lugar dele — resolveria pelo empacotador
errado do mesmo jeito, uma camada acima. `NavRail` é o segundo consumidor de
`Logo` nesta capacidade, com a variante do selo isolado, e é por isso que ele
aparece aqui por nome. A obrigação é a mesma que esta capacidade já aplica a todo
texto que seus componentes exibem: entra por propriedade individual de quem
compõe.

#### Scenario: Trilha sem a URL da marca não compila

- **WHEN** `NavRail` é usada sem a propriedade da URL do arquivo de marca
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem a URL plantado em arquivo de checagem de tipos de `NavRail`, `verify:types` falhando, plantio revertido

#### Scenario: A trilha exibe a marca que recebeu

- **WHEN** `NavRail` é renderizada com a URL do selo isolado
- **THEN** a referência renderizada pela marca é a URL recebida, e a forma declarada é a do selo
- **Prova:** história de `NavRail` na bancada conferindo a referência e a forma, executada nos dois temas
