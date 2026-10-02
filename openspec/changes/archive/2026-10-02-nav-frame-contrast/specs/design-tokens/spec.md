# Spec Delta

## MODIFIED Requirements

### Requirement: Conjunto de token que não varia por tema tem contraste medido uma vez, fora da varredura por tema

Um grupo de tokens pode ser declarado com o mesmo valor nos dois temas — hoje,
só a camada semântica tem exemplo disso, em `semantic/shared.json`, para
espaço, raio e tipografia. Quando esse mecanismo é usado para um grupo de
**cor**, o grupo SHALL ter contraste medido por uma checagem própria,
executada uma única vez contra as próprias superfícies do grupo — nunca pela
checagem de contraste por tema que já existe, e SHALL NOT usar os prefixos de
nome `color.surface.*` ou `color.action.*`, que essa checagem já varre
automaticamente a partir da fonte resolvida.

A checagem própria SHALL aplicar os mesmos pisos já declarados — 4,5:1 para
par de texto, 3:1 para objeto gráfico — e SHALL reprovar nomeando o par, a
razão medida e o piso, no mesmo formato que a checagem por tema já usa.

Todo token do grupo SHALL aparecer em ao menos um par medido ou ter isenção
declarada com o motivo, e a checagem SHALL reprovar nomeando o token que não
tiver nenhum dos dois.

O piso aplicado a cada par SHALL ser o do papel que o token cumpre: 4,5:1 para
o token que pinta texto, 3:1 para o que pinta objeto gráfico. Um token SHALL
NOT ser medido por um piso mais baixo que o do papel que o seu nome anuncia.

Todo par declarado SHALL corresponder a uma adjacência que existe no código: o
token usado como **fundo** de um par SHALL ser consumido como `background` por
algum componente, e um token consumido apenas como borda SHALL NOT ser fundo de
par nenhum. A verificação SHALL reprovar nomeando o token e onde ele é
consumido.

**Por quê:** a trilha, o painel e a barra de conteúdo da navegação são a
primeira superfície do sistema que não segue o tema do leitor — decisão do
dono, registrada em `design.md` de `nav-rail-shell`. A checagem por tema
(`contrast.test.ts`) mede a cor de ação do tema **ativo** contra as
superfícies **daquele tema**; aplicá-la ao conjunto fixo mediria a cor de ação
de cada tema contra uma superfície que não é dele, uma comparação sem sentido
— a trilha nunca hospeda a cor de ação do conteúdo, tem a própria. Os
prefixos de nome que a varredura por tema já reconhece
(`color-surface-[a-z0-9-]+`, `color-action-[a-z0-9-]+`, em `contrast.ts`) são
descoberta automática por desenho — qualquer nome novo sob eles entraria na
varredura por tema sem edição do arquivo de checagem, exatamente o
comportamento que esta checagem nova precisa evitar. Nomear o grupo fora
desses prefixos é o que garante que ele não entra lá por acidente; a checagem
própria é o que garante que ele é medido assim mesmo.

A exigência de cobertura existe porque medir "o conjunto" não é medir cada
token dele, e a diferença foi medida: a primeira checagem do conjunto montava
a entrada de texto com a lista de superfícies vazia, e quatro cores
— `color.nav.text`, `color.nav.text-strong`, `color.nav.text-muted` e
`color.nav.hover` — ficaram declaradas sem nenhum par. A varredura por tema
não tem esse ponto cego porque descobre os pares sozinha pelo nome; a checagem
do conjunto fixo declara os pares à mão, e é a cobertura que a impede de
declarar de menos.

O piso é o do papel, e não o mais conveniente, porque um tom que cumpre 3:1
como objeto gráfico e reprova 4,5:1 como texto é seguro enquanto só ícone o
usar — e deixa de ser no primeiro texto que o adotar. O nome do token é o que
anuncia esse papel a quem compõe.

A adjacência precisa existir no código porque medir um par que não acontece na
tela é prova que coincide com a verdade em vez de estabelecê-la, e isso foi
medido dentro deste ciclo: `color.nav.edge` entrou na primeira lista como
superfície, e os cinco usos dele são borda — nada é pintado por cima de uma
borda. O erro passou despercebido porque `edge` e `color.nav.hover` são o mesmo
cinza: todo número que deveria vir do fundo de interação era produzido pela
borda e saía igual, a matriz ficava numericamente certa e estruturalmente
errada, e o par que de fato limita o conjunto — o objeto gráfico apagado sobre
o fundo de interação, com 0,045 de margem — não estava declarado. No dia em que
os dois tons se separassem, a checagem seguiria verde medindo a borda enquanto
a adjacência real deixava de ser medida. Exigir que o fundo de um par seja
pintado como fundo em algum componente é o que fecha isso por verificação, e
não por atenção de quem revisa.

#### Scenario: Par do conjunto fixo abaixo do piso reprova

- **WHEN** um par de texto ou de destaque do conjunto fixo fica abaixo do piso correspondente contra sua própria superfície
- **THEN** a checagem própria do conjunto falha, nomeando o par, a razão medida e o piso
- **Prova:** valor plantado no grupo fixo, checagem própria falhando, plantio revertido

#### Scenario: Token do conjunto sem par declarado reprova

- **WHEN** um token é acrescentado ao conjunto fixo e nenhum par da checagem o mede, e ele não tem isenção declarada
- **THEN** a checagem própria falha, nomeando o token sem par
- **Prova:** token plantado na fonte do conjunto fixo, checagem própria falhando com o nome dele, plantio revertido

#### Scenario: Fundo de par que nunca é pintado como fundo reprova

- **WHEN** um token consumido apenas como borda é declarado como fundo de um par
- **THEN** a verificação falha, nomeando o token e os lugares em que ele é consumido
- **Prova:** token de borda plantado na lista de fundos declarados, guardião de adjacência falhando com o nome dele e a lista das bordas, plantio revertido

#### Scenario: Isenção de divisor vale com motivo e sem uso como fundo

- **WHEN** um token do conjunto é declarado isento por ser divisor decorativo
- **THEN** a verificação confere que ele é borda em algum componente e fundo em nenhum, e falha quando alguma das duas deixa de valer
- **Prova:** execução do guardião de adjacência sobre a árvore corrente, com a isenção declarada e o motivo citando WCAG 1.4.11

#### Scenario: Conjunto fixo aprovado registra o pior par

- **WHEN** a checagem própria é executada sobre os valores correntes do conjunto fixo
- **THEN** ela passa e registra o pior par e sua margem sobre o piso
- **Prova:** execução registrada, com o valor do pior par

#### Scenario: Nome do conjunto fixo não entra na varredura por tema

- **WHEN** a checagem de contraste por tema (`contrast.test.ts`) é executada sobre a fonte corrente, com o conjunto fixo declarado
- **THEN** nenhum token do conjunto fixo aparece entre as superfícies ou ações descobertas por ela
- **Prova:** execução da checagem por tema sobre a fonte com o conjunto fixo presente, conferindo a ausência dos seus nomes nas listas descobertas

#### Scenario: Token do conjunto fixo presente nos dois temas sem arquivo duplicado

- **WHEN** a geração lê o conjunto fixo declarado uma vez, fora de `light.json`/`dark.json`
- **THEN** o valor resolvido é idêntico nos dois temas, sem exigir uma segunda declaração
- **Prova:** teste de geração que resolve o token nos dois temas e compara os valores
