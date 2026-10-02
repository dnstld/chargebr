# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Tema sem script`
- TO: `### Requirement: Tema com escolha explícita, aplicada antes da primeira pintura`

## MODIFIED Requirements

### Requirement: Tema com escolha explícita, aplicada antes da primeira pintura

A construção SHALL NOT fixar tema: o elemento raiz do documento emitido SHALL NOT
declarar tema.

Exatamente um script emitido pela construção SHALL mencionar o atributo de tema. A
verificação SHALL reprovar quando nenhum script emitido o mencionar, e quando mais
de um o mencionar, nomeando em cada caso os artefatos lidos que o mencionam.

Esse script SHALL ser entregue dentro do `<head>` do documento emitido, e SHALL
trazer a própria fonte no corpo do elemento, sem carregá-la por `src`. A
verificação SHALL reprovar quando nenhum script de dentro do `<head>` mencionar o
atributo, nomeando onde o script que o menciona foi encontrado.

A folha de estilo publicada pela camada de tokens SHALL ficar fora dessa
varredura, e a varredura SHALL NOT alcançá-la.

A moldura SHALL ser exercitada nos temas claro e escuro. A moldura SHALL NOT
guardar nem declarar estado de escolha de tema.

**Por quê:** o shell passa a oferecer escolha explícita de tema, e é esta a
mudança que o bloco anterior deste requisito previu — "o dia em que o shell a
oferecer, este requisito muda e o script que a implemente passa a precisar de
exigência própria sobre a posição dele no documento entregue".

A posição é a obrigação central, e não um detalhe de implementação: a camada de
tokens resolve claro e escuro pela preferência do sistema, em CSS, antes de
qualquer script. Quem escolheu claro contra uma preferência escura só vê o tema
escolhido depois de o atributo ser declarado — e um script que declara o atributo
depois da primeira pintura entrega a essa pessoa um flash do tema que ela recusou.
Dentro do `<head>`, com a fonte no próprio elemento, o script é executado antes de
o corpo do documento ser lido, e portanto antes da primeira pintura; no corpo do
documento, ou carregado por `src`, não é. **Medido nesta mudança:** a aplicação
não escolhe a posição do script dentro do `<head>` — o elemento emitido cai depois
da referência de estilo que o framework injeta, e não há como pô-lo antes dela;
estar dentro do `<head>` é a garantia que a aplicação controla e que o documento
emitido torna observável.

A construção continua proibida de fixar tema porque fixá-lo é decidir pela pessoa
que lê, e o documento pré-renderizado é servido a todas elas. O atributo passa a
existir no documento vivo, declarado pelo script quando a escolha for de quem lê —
nunca no documento que a construção emite.

"Exatamente um" é a obrigação de haver **um dono só do atributo**. Dois scripts
que escrevem o mesmo atributo são duas decisões sobre o mesmo estado, e a segunda
nunca é revisada contra a primeira. **Medido nesta mudança:** com o controle
escrevendo o atributo por conta própria, três artefatos de script emitidos passam
a mencioná-lo — dois de servidor e um de navegador; com o controle chamando o
aplicador que o script do documento instala, exatamente um o menciona. O limite
inferior — nenhum — é a outra metade da prova: uma varredura que aceitasse zero
passaria verde depois de o script desaparecer, e é assim que a garantia morreria
sem ninguém saber.

A folha de estilo segue fora da varredura pela razão que já valia: as regras que
ela entrega — a que responde à preferência do sistema e a que responde ao atributo
— **são** o mecanismo do tema, e o requisito "As regras dos dois temas chegam ao
documento entregue" exige que elas cheguem. O que esta varredura persegue é código
que decide tema.

A moldura segue sem estado de tema porque o estado é de quem compõe: o controle
entra pelo slot de ação, como conteúdo opaco, e `AppFrame` continua sem script
próprio. Escolha de tema deixa de ser estado não aplicável da moldura e passa a ser
estado do controle — que não é a moldura.

O cenário "Nenhum script emitido conhece o atributo de tema" é mantido com o nome
que tinha e com o veredito oposto: até esta mudança, nenhum script conhecer o
atributo era o estado exigido; a partir dela é o estado que reprova. O nome fica
de propósito, para que a inversão seja legível no histórico da capacidade em vez
de aparecer como um cenário que desapareceu e outro que nasceu.

#### Scenario: O documento entregue não fixa tema

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** seu elemento raiz não declara atributo de tema
- **Prova:** teste do documento emitido que procura o atributo de tema no elemento raiz

#### Scenario: Atributo de tema plantado reprova

- **WHEN** o elemento raiz do documento emitido passa a declarar um tema
- **THEN** a verificação falha nomeando o tema encontrado
- **Prova:** atributo plantado no elemento raiz, verificação falhando com o tema nomeado, plantio revertido

#### Scenario: Exatamente um script emitido conhece o atributo de tema

- **WHEN** os artefatos de script emitidos pela construção são lidos
- **THEN** exatamente um deles menciona o atributo de tema
- **Prova:** teste que varre os scripts emitidos procurando o atributo, sobre a construção corrente

#### Scenario: Um segundo script que conhece o atributo reprova

- **WHEN** um segundo script emitido passa a mencionar o atributo de tema
- **THEN** a verificação falha nomeando os artefatos que o mencionam
- **Prova:** escrita do atributo plantada no controle de tema, varredura falhando com os artefatos nomeados, plantio revertido

#### Scenario: Nenhum script emitido conhece o atributo de tema

- **WHEN** os artefatos de script emitidos pela construção são lidos e nenhum deles menciona o atributo de tema
- **THEN** a verificação falha dizendo que nenhum script menciona o atributo
- **Prova:** script de tema removido do documento por plantio, varredura falhando, plantio revertido

#### Scenario: O script de tema é entregue dentro do `<head>`

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** o script que menciona o atributo de tema está dentro do `<head>`, com a fonte no corpo do elemento e sem `src`
- **Prova:** teste do documento emitido que localiza o script pelo atributo mencionado e confere onde ele está

#### Scenario: Script de tema fora do `<head>` reprova

- **WHEN** o script que menciona o atributo de tema é entregue fora do `<head>`
- **THEN** a verificação falha nomeando onde o script foi encontrado
- **Prova:** script movido para o corpo do documento por plantio, teste do documento emitido falhando com o lugar nomeado, plantio revertido

#### Scenario: Script de tema carregado por `src` reprova

- **WHEN** o script de tema passa a carregar a fonte por `src` em vez de trazê-la no corpo do elemento
- **THEN** a verificação falha dizendo que não achou, dentro do `<head>`, script que mencione o atributo
- **Prova:** `src` plantado em lugar da fonte no corpo do elemento, teste do documento emitido falhando, plantio revertido

## ADDED Requirements

### Requirement: Moldura expõe um slot de ação no cabeçalho, opaco e sem estado

`AppFrame` SHALL aceitar uma propriedade opcional `action`, de conteúdo opaco,
apresentada na região de cabeçalho. `action` SHALL NOT exigir nenhuma outra
propriedade.

`AppFrame` SHALL NOT declarar `"use client"`, e SHALL NOT guardar estado por causa
de `action`.

`action` SHALL NOT alterar a forma da moldura: o atributo de forma do elemento
raiz da moldura continua condicionado à presença de `rail` ou de `nav`, e
`action` SHALL NOT entrar nessa condição.

Quando `action` está ausente, nada SHALL ser renderizado no lugar dela.

Quando `action` está presente, o salto SHALL continuar sendo o primeiro
focalizável do documento emitido, e as regiões do documento emitido SHALL
permanecer as mesmas.

**Por quê:** o cabeçalho da moldura tem hoje a marca e o gatilho condicional de
navegação, e o controle de tema é o primeiro conteúdo de cabeçalho que a aplicação
decide por conta própria. O slot é opaco pela mesma razão que o de navegação é: a
moldura não conhece a forma de dentro, e conhecê-la a obrigaria a saber o que o
controle faz. Sem estado e sem `"use client"` pela mesma razão também — quem passa
o slot entrega um componente de cliente já pronto, e a moldura continua sem script
próprio.

A forma não pode mudar porque `apps/backoffice` **passa** `action` e não passa
`rail` nem `nav`: se `action` entrasse na condição da forma, a aplicação receberia
a grade da maquete sem ter trilha nem painel, e o documento emitido mudaria de
regiões e de ordem de foco sem ninguém pedir. **Medido nesta mudança, por
protótipo descartável:** com `action` acrescentado a `AppFrame`, fora da condição
da forma, e o controle passado por `apps/backoffice`, as onze outras afirmações de
`apps/backoffice/tests/emitted-document.test.ts` continuaram passando — regiões,
ausência de navegação e salto como primeiro focalizável incluídos.

A proibição de `"use client"` ganha prova própria aqui porque não tinha nenhuma: o
requisito do slot de navegação já a obrigava, e nada a media.

#### Scenario: Sem `action`, nada é renderizado no cabeçalho além da marca

- **WHEN** `AppFrame` é renderizado sem `action`
- **THEN** o cabeçalho não contém controle nenhum além do que as outras propriedades pedem
- **Prova:** história da moldura sem `action` conferindo a ausência

#### Scenario: Conteúdo do slot aparece dentro do cabeçalho

- **WHEN** `AppFrame` é renderizado com `action` preenchido
- **THEN** o conteúdo passado está dentro da região de cabeçalho
- **Prova:** história da moldura com `action` preenchido conferindo que o conteúdo está dentro da região de cabeçalho

#### Scenario: `action` sozinho compila

- **WHEN** `AppFrame` é usado só com `action`, sem nenhuma propriedade de navegação e sem `rail`
- **THEN** a verificação de tipos passa
- **Prova:** uso só com `action` em arquivo de checagem de tipos da moldura, compilando

#### Scenario: `action` entrando na condição da forma reprova

- **WHEN** `action` passa a condicionar o atributo de forma do elemento raiz da moldura
- **THEN** a verificação falha nomeando o atributo de forma encontrado
- **Prova:** `action` acrescentado por plantio à condição da forma, história da moldura só com `action` falhando com o atributo nomeado, plantio revertido

#### Scenario: `"use client"` na moldura reprova

- **WHEN** o arquivo da moldura declara `"use client"`
- **THEN** a verificação falha nomeando o arquivo e a diretiva
- **Prova:** diretiva plantada no arquivo da moldura, teste de contrato da moldura falhando com o arquivo nomeado, plantio revertido

### Requirement: Escolha de tema no cabeçalho, com três estados e texto por propriedade

O documento emitido SHALL conter, na região de cabeçalho, um controle de
alternância de tema com nome acessível.

O controle SHALL ter três estados: **sem escolha**, em que o atributo de tema não
é declarado e o tema segue a preferência do sistema; **escolha clara**; e **escolha
escura**. O estado inicial SHALL ser sem escolha.

Acionar o controle SHALL declarar, no elemento raiz do documento vivo, o tema
oposto ao tema corrente, e a escolha SHALL ser guardada e aplicada numa visita
posterior.

Escolha guardada que não seja um dos dois temas SHALL ser ignorada, e o tema SHALL
seguir a preferência do sistema.

Armazenamento indisponível SHALL NOT impedir o documento de carregar nem o
controle de alternar o tema da visita corrente.

O controle SHALL receber por propriedade individual o rótulo para ir ao tema
claro, o rótulo para ir ao tema escuro e o seu nome acessível, e SHALL NOT exibir
nem anunciar texto que não tenha chegado por propriedade.

Enquanto o tema corrente não for conhecido — no documento emitido, antes de o
script ser executado no navegador —, o controle SHALL anunciar o nome acessível
declarado para ele; depois disso, SHALL anunciar o rótulo da direção que a
ativação produz.

O controle SHALL NOT escrever o atributo de tema: ele pede a escolha ao único
script que conhece o atributo.

**Por quê:** o shell oferece a escolha porque o alvo visual
(`docs/maquete-navegacao.html`) tem o controle no cabeçalho do conteúdo, e porque
a preferência do sistema não é a única preferência que existe — quem lê num
sistema escuro pode querer esta tela clara.

Três estados com um botão, e não com um grupo de três: a ausência de escolha é o
estado inicial e a camada de tokens já a entrega em CSS, sem nada declarado.
Expor "seguir o sistema" como terceira posição exigiria um grupo de controle, e a
maquete tem um botão.

Escolha guardada inválida é ignorada em vez de corrigida porque o valor guardado é
dado de fora do documento — qualquer coisa pode ter escrito lá —, e tratar valor
desconhecido como um dos dois temas é escolher pela pessoa com base em lixo.
Armazenamento indisponível é o mesmo caso visto de outro lado: navegação privada e
armazenamento bloqueado existem, e uma exceção ao ler a escolha não pode derrubar
o documento.

O nome acessível muda de forma porque a direção da ação depende do tema corrente, e
o tema corrente não é conhecido no documento emitido: anunciar uma direção que
pode estar errada é pior do que anunciar a ação genérica, e é por isso que os três
textos existem. Nenhum deles vive dentro do controle: quem decide o texto é a
aplicação, como já acontece com o nome do produto e o texto do salto.

O controle não escreve o atributo porque o atributo tem um dono só — o requisito de
tema, acima, mede isso sobre os scripts emitidos.

#### Scenario: Sem escolha guardada, nada é declarado

- **WHEN** a fonte do script de tema é executada sobre um documento sem escolha guardada
- **THEN** o elemento raiz não declara atributo de tema
- **Prova:** teste que executa a fonte do script emitido num documento de teste, sem escolha guardada

#### Scenario: Escolha guardada é aplicada antes de qualquer conteúdo

- **WHEN** a fonte do script de tema é executada com uma das duas escolhas guardada
- **THEN** o elemento raiz declara o tema guardado
- **Prova:** teste que executa a fonte do script para cada uma das duas escolhas, conferindo o atributo

#### Scenario: Escolha guardada inválida é ignorada

- **WHEN** a fonte do script de tema é executada com um valor guardado que não é um dos dois temas
- **THEN** o elemento raiz não declara atributo de tema
- **Prova:** teste que executa a fonte do script com valor inválido guardado, conferindo a ausência do atributo

#### Scenario: Armazenamento que lança não derruba o documento

- **WHEN** a fonte do script de tema é executada num documento cujo acesso ao armazenamento lança erro
- **THEN** a execução conclui sem erro e o elemento raiz não declara atributo de tema
- **Prova:** teste que executa a fonte do script com o acesso ao armazenamento lançando, conferindo a conclusão e a ausência do atributo

#### Scenario: Acionar o controle alterna o tema e guarda a escolha

- **WHEN** o controle é montado e acionado, a partir de cada um dos dois temas correntes
- **THEN** o elemento raiz passa a declarar o tema oposto, e esse tema fica guardado
- **Prova:** teste que monta o controle, dispara a ativação nos dois sentidos e confere o atributo e o valor guardado

#### Scenario: O controle está no cabeçalho do documento emitido

- **WHEN** o documento emitido da rota raiz é lido
- **THEN** a região de cabeçalho contém um controle cujo nome acessível é o declarado pela aplicação para ele
- **Prova:** teste do documento emitido que procura o controle dentro da região de cabeçalho e lê o nome acessível

#### Scenario: O nome acessível passa a anunciar a direção da ação

- **WHEN** o controle é montado e o tema corrente é resolvido
- **THEN** o nome acessível do controle passa a ser o rótulo da direção que a ativação produz, e era o nome acessível declarado antes disso
- **Prova:** teste que monta o controle e confere o nome acessível antes e depois da resolução, para cada um dos dois temas correntes

#### Scenario: Controle sem o texto exigido não compila

- **WHEN** o controle é usado sem um dos três textos
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso incompleto plantado em arquivo de checagem de tipos do controle, `verify:types` falhando, plantio revertido
