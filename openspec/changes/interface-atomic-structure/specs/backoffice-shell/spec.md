# Spec Delta

## MODIFIED Requirements

### Requirement: Regiões da moldura no documento entregue

O documento emitido SHALL conter uma região de cabeçalho identificável pelo seu
papel, que nomeia o produto, e uma região de conteúdo principal identificável
pelo seu papel.

O documento emitido SHALL NOT conter região de navegação.

**Por quê:** região identificável pelo papel é o que permite saltar direto ao
conteúdo em leitura assistida. A navegação fica de fora porque não existe rota
de negócio para listar, e região de navegação vazia anuncia um destino que não
existe. Esta proibição permanece inalterada por esta mudança: o inventário de
`shell-components`, introduzido junto, constrói `NavPanel` e o slot `nav` de
`AppFrame` como componentes de biblioteca, verificados na bancada — nenhum dos
dois é ligado ao documento emitido por `apps/backoffice` enquanto não existir
rota de negócio real, pela mesma razão registrada aqui. O gatilho já previsto —
"a moldura hospedar conteúdo que dependa de dado" — segue sendo o que reabre
este requisito.

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

**Por quê (mudança desta cena):** o cabeçalho passa a compor `Logo` — uma
imagem vetorial de marca — em vez de exibir o nome do produto como texto
puro. "Nome acessível" é a prova correta porque cobre as duas formas que o
nome do produto pode assumir no cabeçalho — texto visível ou `alt`/rótulo do
`Logo` — sem prescrever qual delas a implementação escolhe; a garantia que
importa para quem navega por leitura assistida é que o cabeçalho se anuncia
pelo nome do produto, não a forma visual exata.

### Requirement: Moldura recebe por propriedade todo texto que exibe

Componente da moldura SHALL receber por propriedade todo texto que exibe, e
SHALL NOT declarar rótulo em português no próprio arquivo.

**Por quê:** nome do produto e texto do salto são decisão da aplicação, não da
biblioteca. Rótulo embutido no componente vira valor padrão que ninguém
revisa e que reaparece em qualquer aplicação que consuma o pacote.

#### Scenario: Moldura sem o texto exigido não compila

- **WHEN** a moldura é usada sem o nome do produto ou sem o texto do salto
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso incompleto plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: Rótulo declarado no componente reprova

- **WHEN** um componente da moldura declara texto em português no próprio arquivo
- **THEN** a verificação falha, nomeando o arquivo e o texto
- **Prova:** rótulo plantado no componente, guardião de vocabulário falhando, plantio revertido

**Por quê (mudança desta cena):** a razão original comparava esta fronteira
"à mesma fronteira que as primitivas de domínio já respeitam" — primitivas
que não existem mais (`remove-domain-capabilities`). A comparação sai; a
fronteira que basta continua a mesma e não precisa de outra camada para se
justificar: texto de rótulo é decisão da aplicação, não da biblioteca. Nada
mais no requisito muda — mesma obrigação, mesmos dois cenários.
