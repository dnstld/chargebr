# Spec Delta

## ADDED Requirements

### Requirement: Trilha apresenta destinos como botões de ativação, não links

`NavRail` SHALL apresentar seus destinos como botões, cada um com ícone e nome
acessível por propriedade individual, e SHALL marcar o destino ativo com
`aria-current`.

A marca no topo da trilha SHALL ser apresentada por `Logo` na variante `mark`.

**Por quê:** a maquete implementa os destinos da trilha como botões — não
âncoras — porque, nesta fase, cada um troca qual árvore de navegação aparece
no painel ao lado, sem recarregar nem navegar para uma rota própria. `NavRail`
não tem como saber se um destino real vai ser rota ou alternância local; ela
expõe o botão e quem compõe decide o que `onPress` faz. Isso evita declarar um
link para um destino que, hoje, nenhuma rota de negócio sustenta —
`docs/forma-do-produto.md`, ponto reclassificado "`NavPanel` construído, sem
rota de negócio para religar".

#### Scenario: Destino ativo é anunciado

- **WHEN** `NavRail` é renderizada com um destino marcado como corrente
- **THEN** esse botão expõe `aria-current="true"`, e nenhum outro expõe
- **Prova:** história da trilha que localiza o botão corrente por papel e nome acessível e afirma o atributo nos demais

#### Scenario: Trilha sem destino não compila

- **WHEN** `NavRail` é usada sem nenhum destino
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem destino plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: Marca é a variante isolada do selo

- **WHEN** a trilha é renderizada
- **THEN** a marca no topo usa `Logo` com `variant="mark"`, e não a variante `horizontal`
- **Prova:** história da trilha que confere a variante renderizada

### Requirement: Árvore de navegação usa divulgação, nunca papel de árvore

`NavTree` SHALL apresentar pasta como botão com `aria-expanded` e
`aria-controls` apontando para a lista de filhos, e folha como link. Nenhum
elemento do componente SHALL declarar `role="tree"`, `role="treeitem"` nem
qualquer papel da família de árvore do ARIA.

Todo elemento interativo de `NavTree` — pasta e folha, em qualquer
profundidade — SHALL ser alcançável por `Tab`, na ordem do documento.

**Por quê:** `role="tree"` troca a navegação por `Tab` por navegação por
setas, com um único ponto de entrada tabulável na árvore inteira — pior para
uma barra lateral, onde cada folha é um destino que se quer alcançar
diretamente. A escolha é deliberada, registrada aqui para que não seja
revertida para o papel de árvore por quem encontrar a ausência dele depois.

#### Scenario: Nenhum papel de árvore é declarado

- **WHEN** o resultado renderizado de `NavTree` é varrido por papel ARIA
- **THEN** nenhum elemento expõe `tree`, `treeitem`, `group` de árvore ou qualquer papel da mesma família
- **Prova:** história da árvore com pastas e folhas aninhadas, varredura de papéis conferindo a ausência

#### Scenario: Toda folha e toda pasta são alcançáveis por Tab

- **WHEN** a árvore é navegada por teclado do primeiro ao último elemento interativo
- **THEN** cada pasta e cada folha declaradas, em qualquer profundidade, recebem foco em algum ponto da sequência
- **Prova:** história da árvore com aninhamento de ao menos dois níveis, que tabula do início ao fim e confere a lista de elementos focados

#### Scenario: Pasta alterna estado e visibilidade dos filhos

- **WHEN** uma pasta fechada é ativada
- **THEN** ela passa a expor `aria-expanded="true"`, e a lista de filhos que `aria-controls` nomeia deixa de estar oculta
- **Prova:** história da árvore que ativa uma pasta fechada e confere os dois efeitos; ativar de novo reverte ambos

### Requirement: Entrada de árvore é página ou pasta, e o estado corrente trata as duas igual

`NavTree` SHALL aceitar dois tipos de entrada: **página** (folha, sem filhos)
e **pasta** (com filhos). Uma entrada corrente — de qualquer um dos dois tipos
— SHALL receber o mesmo tratamento visual de pílula preenchida que uma folha
corrente já recebe.

**Por quê:** a maquete só mostra o estado corrente numa folha, mas o
tratamento é do estado, não do tipo de entrada — uma pasta correntemente
ativa (por exemplo, por URL correspondente a ela mesma) não pode ficar sem
sinal só porque a maquete não exercitou esse caso.

#### Scenario: Pasta corrente recebe a mesma pílula preenchida que a folha corrente

- **WHEN** uma entrada do tipo pasta é renderizada com o estado corrente
- **THEN** ela expõe a mesma superfície preenchida e o mesmo peso que uma folha corrente, e `aria-current="page"`
- **Prova:** história da árvore com uma pasta marcada como corrente, comparando as propriedades computadas com as da folha corrente já provada em `shell-components` ("Item de navegação corrente é marcado por mais de um sinal")

### Requirement: Dado da árvore é hierárquico e opaco a estrutura própria

`NavTree` SHALL receber sua estrutura inteira por propriedade, como dado
hierárquico simples (rótulo, tipo página-ou-pasta, destino quando página,
filhos quando pasta) — nenhuma hierarquia SHALL nascer dentro do componente.

**Por quê:** a forma final de onde esse dado vem — hoje uma fixture
sintética de bancada — é uma pergunta em aberto de
`docs/forma-do-produto.md` (como a aplicação lê dado). Um formato
simples e hierárquico, sem nada do componente embutido na forma, é o que um
resolvedor futuro consegue popular sem exigir que `NavTree` mude de forma
depois.

#### Scenario: Duas árvores diferentes produzem duas estruturas diferentes

- **WHEN** `NavTree` é renderizada duas vezes com dados de entrada diferentes
- **THEN** a estrutura de pastas e folhas renderizada corresponde exatamente à de cada entrada, sem nó que não esteja nos dados
- **Prova:** história com dado de entrada trocado por controle, conferindo a estrutura renderizada nos dois casos

### Requirement: Trilha e painel recebem por propriedade todo texto que exibem ou anunciam

Todo componente do inventário desta capacidade — `Icon`, `Logo`, `NavItem`,
`NavSection`, `NavPanel`, `NavRail`, `NavTree` e `NavFolderTrigger` — SHALL
receber por propriedade individual todo texto que exibe ou anuncia a
tecnologia assistiva, nome acessível de ícone e rótulo de controle incluídos.
Nenhum destes componentes SHALL declarar rótulo em português no próprio
arquivo. Nenhuma propriedade de texto SHALL ser um campo de um objeto que
agrupe mais de um texto — cada texto exigido é sua própria propriedade.

**Por quê:** generaliza, para todo o inventário desta capacidade, o que já
valia só para `AppFrame` (`backoffice-shell`, "Moldura recebe por propriedade
todo texto que exibe"). Propriedades individuais, e não um objeto de textos,
porque só assim o tipo consegue exigir cada texto necessário separadamente —
um objeto opcional com campos opcionais não obriga nada no uso.

#### Scenario: Uso sem o texto exigido não compila

- **WHEN** um componente deste inventário é usado sem uma propriedade de texto que ele declara
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso incompleto plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: Rótulo declarado no componente reprova

- **WHEN** um arquivo de componente deste inventário declara texto em português no próprio arquivo
- **THEN** a verificação falha, nomeando o arquivo e o texto
- **Prova:** `tools/checks/component-vocabulary.test.ts` executado com o perímetro do arquivo plantado, reprovando, plantio revertido

## MODIFIED Requirements

### Requirement: Seção de navegação não é clicável e tem ao menos uma folha

`NavSection` SHALL apresentar seu rótulo como texto não interativo, e SHALL
exigir ao menos um `NavItem` como folha — uma seção sem folha SHALL NOT
compilar.

**Por quê:** `NavPanel` deixa de consumir `NavSection` nesta mudança — o
painel passa a renderizar `NavTree` — mas `NavSection` continua existindo
como componente genérico do inventário, sem consumidor construído hoje. O
teste de um componente de biblioteca é ser genérico, nunca ter consumidor:
biblioteca de UI é inventário, e um componente sem consumidor é catálogo, não
lacuna.

#### Scenario: Seção sem folha não compila

- **WHEN** `NavSection` é usado sem nenhum `NavItem`
- **THEN** a verificação de tipos falha, nomeando o uso
- **Prova:** uso sem folha plantado em arquivo de checagem de tipos, `verify:types` falhando, plantio revertido

#### Scenario: O rótulo da seção não é focalizável

- **WHEN** `NavSection` é renderizado e o documento é navegado por teclado
- **THEN** o rótulo da seção nunca recebe foco, e cada `NavItem` recebe
- **Prova:** história que tabula pela seção e confere quais elementos recebem foco

### Requirement: Foco preso só no modo sobreposto

`NavPanel` SHALL aceitar um rótulo visível de cabeçalho e uma árvore de
destinos (ver "Dado da árvore é hierárquico e opaco a estrutura própria"),
em vez de uma lista de seções planas. `NavPanel` SHALL prender o foco dentro
de si somente quando apresentado em modo sobreposto, e SHALL NOT prender foco
quando apresentado em modo persistente.

**Por quê:** a maquete substitui a lista plana de seções por uma árvore
aninhada (pasta/folha) com um único rótulo de cabeçalho estático acima dela —
o nome da seção corrente da trilha, não um rótulo por grupo. Prender foco
numa barra lateral permanentemente visível tranca quem navega por teclado
fora do conteúdo — o mesmo risco que motivou o requisito de salto de
`backoffice-shell`, agora do lado da navegação; essa parte da garantia não
muda com a troca de forma do conteúdo.

#### Scenario: Foco não escapa do painel sobreposto

- **WHEN** `NavPanel` é aberto em modo sobreposto e o foco é tabulado até o último elemento focalizável dentro dele
- **THEN** a próxima tabulação permanece dentro do painel
- **Prova:** história do modo sobreposto que tabula até o fim e confere que o foco não sai do painel

#### Scenario: Foco atravessa o painel persistente livremente

- **WHEN** `NavPanel` é apresentado em modo persistente e o foco é tabulado até o último elemento focalizável dentro dele
- **THEN** a próxima tabulação sai do painel para o próximo elemento focalizável do documento
- **Prova:** história do modo persistente que tabula até o fim e confere que o foco sai do painel

#### Scenario: O painel renderiza a árvore recebida, não uma lista de seções

- **WHEN** `NavPanel` é renderizado com uma árvore de destinos
- **THEN** o resultado renderizado contém `NavTree` com exatamente essa árvore, e nenhuma lista de `NavSection`
- **Prova:** história do painel que passa uma árvore e confere a ausência de `NavSection` no resultado

### Requirement: Logo não declara cor de marca no próprio código

`Logo` SHALL apresentar um dos SVGs de marca existentes, de acordo com a
propriedade `variant` (`"horizontal"`, padrão, ou `"mark"`), e SHALL NOT
declarar valor de cor no próprio arquivo `.tsx` — nem literal, nem token.

**Por quê:** `docs/decisao-identidade-visual.md` já fixa que nenhum componente
referencia cor de marca diretamente, e que a marca não tem variante
monocromática nesta fase — isso continua valendo: as duas variantes têm cor
própria, fixada no arquivo SVG, nunca no componente. A variante `mark` nasce
porque a trilha da maquete usa o selo isolado, sem o nome por extenso, ao lado
do SVG horizontal que já existia sem propriedade que o selecionasse — este é
o primeiro ciclo com um segundo consumidor de verdade. `Logo` referencia os
SVGs como recurso externo, em vez de reescrever o desenho como marcação
dentro do componente — é o que mantém o componente sem nenhum literal de cor
no próprio código, sem precisar de isenção no guardião de estilo.

#### Scenario: Logo renderiza sem literal de cor no componente

- **WHEN** o guardião de literal de estilo varre o arquivo de `Logo`
- **THEN** nenhuma ocorrência de literal de cor é reportada nesse arquivo
- **Prova:** `tools/checks/style-literals.test.ts` executado sobre o arquivo de `Logo`

#### Scenario: Logo exibe a marca vigente

- **WHEN** `Logo` é renderizado com cada variante
- **THEN** o SVG correspondente aparece, nas cores fixas da marca, sobre o fundo do tema corrente
- **Prova:** história de `Logo` na bancada com as duas variantes, executada nos dois temas

#### Scenario: Variante padrão continua horizontal

- **WHEN** `Logo` é renderizado sem a propriedade `variant`
- **THEN** o SVG horizontal aparece, como antes desta mudança
- **Prova:** história de `Logo` sem `variant`, conferindo o SVG renderizado
