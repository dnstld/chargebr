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
