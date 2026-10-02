# Spec Delta

## ADDED Requirements

### Requirement: Arquivo alcançável pelo exports não importa módulo de ambiente de execução

Nenhum arquivo alcançável a partir do mapa de exportações de um pacote sob
`packages/` SHALL importar módulo de ambiente de execução. A verificação SHALL
reprovar nomeando o arquivo, o especificador e a cadeia de alcance que parte do
subpath publicado.

Especificador de módulo de ambiente SHALL ser reconhecido por duas condições, as
duas descobertas e nenhuma escrita à mão: o prefixo `node:`, e a pertinência ao
conjunto de módulos embutidos que o próprio ambiente publica.

A verificação SHALL reprovar quando o conjunto de módulos embutidos lido do
ambiente for vazio.

Isenção SHALL ser declarada com o arquivo, o especificador e a razão, e a
verificação SHALL reprovar quando um arquivo isento deixar de importar o
especificado — isenção que não corresponde a nada é afirmação sobre o código que o
código não sustenta. O conjunto de isenções SHALL ser vazio enquanto nenhuma for
necessária, e vazio SHALL ser o estado declarado, nunca a ausência de medição.

**Por quê:** módulo de ambiente num arquivo que um `exports` alcança entra no grafo
de quem consome o pacote. **Medido antes desta mudança:** entre os 68 arquivos
alcançáveis a partir dos dez subpaths publicados, exatamente um importa módulo de
ambiente — `packages/tokens/src/source.ts`, que importa `node:fs` na linha 1,
`node:path` na 2 e `node:url` na 3, e é alcançado por um caminho só,
`@chargebr/tokens/palette → palette.ts → source.ts`. A construção da aplicação
**passa e avisa**: "leads to all source files (including the public folder) to be
deployed as part of the server code… can lead to failures when size limits are
exceeded". **Aviso não é portão:** a próxima reexportação de valor que arrastasse um
leitor de disco para o grafo do servidor passaria do mesmo jeito, e o defeito
reapareceria como peso de implantação, sem nada a nomear a causa.

A obrigação é sobre **alcance**, e não sobre diretório ou nome de pacote, pela mesma
razão que a proibição de diretiva de referência: é o alcance que separa o arquivo que
atravessa para o consumidor do arquivo que só o repositório executa. **Medido:** o
construtor de tokens, a validação, os relatórios e os arquivos de prova continuam
lendo disco, e nenhum deles é alcançável a partir de `exports` — o requisito não os
toca.

As duas condições de reconhecimento existem porque nenhuma basta. **Medido:** o
conjunto de módulos embutidos publicado pelo ambiente tem 72 entradas e contém as
formas sem prefixo — `fs`, `path`, `url`, `crypto` —, e **não** contém as formas com
prefixo. A forma sem prefixo já é recusada antes, pela etapa de lint, e entra aqui
como segunda guarda; a forma com prefixo é a que o repositório escreve. Ler o
conjunto do ambiente, em vez de declará-lo, é o que faz a cobertura acompanhar a
versão do ambiente sem ninguém editar a verificação — e é por isso que conjunto
vazio reprova: lido vazio, a condição passaria calada para toda forma sem prefixo.

A isenção é declarada com razão, e nunca por omissão, pela figura que
`design-tokens` já usa para o token isento da varredura por tema: o que é isento
aparece, com o motivo, e a correspondência do item é conferida contra o código.
Hoje nenhuma isenção é necessária — **medido:** depois de o vocabulário de tema sair
para módulo próprio, `source.ts` deixa de ser alcançável por subpath nenhum e o
conjunto de arquivos alcançáveis que importam módulo de ambiente passa de um para
zero.

#### Scenario: Importação de módulo de ambiente em arquivo alcançável reprova

- **WHEN** um arquivo alcançável a partir do mapa de exportações importa módulo de ambiente de execução
- **THEN** a verificação falha nomeando o arquivo, o especificador e a cadeia de alcance
- **Prova:** reexportação de valor do vocabulário de tema devolvida por plantio ao módulo que lê disco, a verificação falhando com o arquivo e a cadeia nomeados, plantio revertido

#### Scenario: Nenhum arquivo alcançável importa módulo de ambiente na árvore corrente

- **WHEN** a verificação é executada sobre a árvore corrente
- **THEN** nenhum arquivo alcançável importa módulo de ambiente, e o conjunto de isenções está vazio
- **Prova:** execução do teste de consumo dos subpaths publicados, com a contagem de arquivos alcançáveis e a de isenções registradas na saída

#### Scenario: Conjunto de módulos embutidos vazio reprova

- **WHEN** o conjunto de módulos embutidos lido do ambiente é vazio
- **THEN** a verificação falha dizendo que o conjunto ficou vazio
- **Prova:** leitura do conjunto substituída por lista vazia em plantio, verificação falhando, plantio revertido

#### Scenario: Isenção que não corresponde a nada reprova

- **WHEN** uma isenção declara arquivo e especificador que aquele arquivo não importa
- **THEN** a verificação falha nomeando a isenção sem correspondência
- **Prova:** isenção plantada para arquivo que não importa o especificado, verificação falhando com a isenção nomeada, plantio revertido

## MODIFIED Requirements

### Requirement: Ponto declarado fechado por mudança arquivada não continua aberto no registro

Se o `proposal.md` de uma mudança sob `openspec/changes/archive/` declarar
fechar um ponto de `docs/pontos-abertos.md`, nomeado por número, esse
número SHALL NOT constar entre os pontos abertos do arquivo. Encontrar os
dois SHALL reprovar a verificação, nomeando o ponto e a mudança arquivada
que declarou fechá-lo.

O conjunto de pontos abertos SHALL ser lido **da seção de pontos abertos** do
arquivo, no formato que essa seção usa, e SHALL NOT incluir ponto de nenhuma outra
seção.

A contagem de pontos abertos lida SHALL ser comparada com uma contagem declarada na
própria checagem, e divergência SHALL reprovar nomeando a contagem declarada e a
lida. A contagem SHALL ser declarada na checagem, e SHALL NOT ser extraída do
cabeçalho do arquivo nem de qualquer prosa dele.

**Por quê:** medido no ciclo `tokens-obligation-form` — ele arquivou declarando
"Fecha o ponto 5 de `docs/pontos-abertos.md`", e o registro nunca foi atualizado; o
ponto continuou aberto até uma leitura manual encontrar a divergência. Ao contrário
do ponto 16 (que depende de saber a intenção de um teste, não mecanizável), esta é
comparação entre duas listas que já existem por escrito — o número que uma mudança
arquivada declara fechar, e os números que `docs/pontos-abertos.md` ainda lista como
abertos —, mecanicamente detectável.

**E a comparação estava morta. Medido nesta mudança:** a leitura procurava os pontos
abertos por cabeçalho de nível 2 (`## 23.`), e o registro passou a usar item de lista
(`- **23. …**`). Contagem do dia desta medição: **0** cabeçalhos no formato
procurado, **19** itens no formato usado, em três seções. A comparação rodava contra
conjunto vazio e **não tinha como reprovar**. O histórico mostra quando morreu: no
commit que escreveu a checagem o arquivo tinha 7 cabeçalhos e o padrão casava; no
arquivamento do **mesmo ciclo**, passou a ter 0. A prova foi vista reprovando quando
nasceu e morreu em seguida, pela mudança de formato do arquivo que ela lê.

**São duas obrigações, e não uma, porque o padrão sozinho não resolve.** Casar o
formato corrente conserta a ocorrência; não impede a próxima deriva de formato de
matar a prova do mesmo jeito, calada. A contagem declarada é a prova da prova: ela é
o que reprova quando a leitura passa a achar nada. É a figura da contagem declarada
do guardião do arquivo de regras, pela mesma razão — **derivada do arquivo lido,
esperado e lido mudariam juntos e a comparação nunca reprovaria**.

A contagem é declarada na checagem e **nunca extraída do cabeçalho** porque o
cabeçalho é prosa: tirar número de prosa troca uma fragilidade de formato por outra,
e a segunda é pior, porque a prosa muda de redação a cada ciclo sem avisar ninguém.
O preço é uma linha por ponto aberto ou fechado, no mesmo commit que abre ou fecha —
e esse preço é o ponto.

**A leitura é da seção de abertos, e não do arquivo até a seção de fechados, por um
caso medido:** a seção de reclassificados usa o **mesmo** formato de item, e tem um
item numerado. Lida junto, ela entraria no conjunto de abertos e a contagem sairia
uma unidade maior. Ponto reclassificado não é ponto aberto — está fora do registro de
dívida por decisão de ciclo anterior.

**A classe apareceu duas vezes, e é a segunda que justifica obrigação em vez de
conserto pontual.** A primeira foi o ponto 5: declaração de fechamento sem o registro
atualizado, achada por leitura humana. A segunda é esta: a própria checagem que
nasceu para pegar a primeira morreu sem ninguém ver. Consertar só o padrão seria
tratar a segunda ocorrência como a primeira foi tratada — pontualmente — e deixar a
terceira passar.

#### Scenario: Ponto declarado fechado mas ainda aberto reprova

- **WHEN** uma mudança arquivada declara, no `proposal.md`, fechar um ponto, e esse número de ponto ainda consta como aberto em `docs/pontos-abertos.md`
- **THEN** a verificação falha, nomeando o ponto e a mudança arquivada
- **Prova:** mudança arquivada plantada com essa declaração, ponto correspondente plantado como aberto em `docs/pontos-abertos.md`, verificação falhando, os dois plantios revertidos

#### Scenario: Formato do registro alterado reprova

- **WHEN** um item da seção de pontos abertos deixa de estar no formato que a leitura reconhece
- **THEN** a verificação falha nomeando a contagem declarada e a lida
- **Prova:** formato de um item da seção de abertos alterado por plantio, verificação falhando com os dois números, plantio revertido

#### Scenario: A contagem de pontos abertos é a declarada na árvore corrente

- **WHEN** a verificação é executada sobre a árvore corrente
- **THEN** a contagem de pontos abertos lida da seção de abertos é igual à declarada na checagem, e nenhum ponto de outra seção entra na contagem
- **Prova:** execução da checagem com a contagem lida registrada na saída, sobre um registro que tem item numerado também na seção de reclassificados
