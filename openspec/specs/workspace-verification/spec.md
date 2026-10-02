# workspace-verification

## Purpose

Define o comportamento observável da verificação do repositório: o que ela
executa, quando reprova, o que ela garante sobre a fronteira entre biblioteca e
aplicação, e o que ela deliberadamente não alcança fora do seu perímetro.

## Requirements

### Requirement: Instalação reprodutível

A instalação de dependências SHALL partir de um arquivo de lock versionado e
concluir sem erro num clone limpo.

#### Scenario: Clone limpo instala a partir do lock

- **WHEN** alguém clona o repositório e executa o comando documentado de instalação
- **THEN** todas as dependências são instaladas a partir do lock versionado e o comando termina com código de saída zero
- **Prova:** execução registrada em máquina limpa e na integração contínua

### Requirement: Runtime declarado

O workspace SHALL recusar instalação sob versão de runtime diferente da
declarada, com mensagem que nomeia a versão exigida.

#### Scenario: Runtime divergente é recusado

- **WHEN** a instalação ocorre sob uma versão de Node diferente da declarada em `engines`
- **THEN** a instalação falha e a mensagem nomeia a versão exigida
- **Prova:** execução sob runtime divergente, com captura da mensagem

### Requirement: Comando único de verificação

Um único comando na raiz SHALL executar checagem de tipos, formatação, lint e
testes sobre todos os pacotes do perímetro, e retornar código de saída diferente
de zero quando qualquer etapa falhar.

#### Scenario: Uma etapa falhando reprova o comando inteiro

- **WHEN** qualquer uma das quatro etapas falha
- **THEN** o comando retorna código de saída diferente de zero e identifica a etapa que falhou
- **Prova:** caso negativo plantado por commit para cada etapa, verificação falhando, commit revertido

### Requirement: Resultado determinístico

A verificação SHALL produzir resultado idêntico em execuções consecutivas sobre
a mesma árvore, sem alteração.

#### Scenario: Duas execuções seguidas coincidem

- **WHEN** a verificação é executada duas vezes sobre a mesma árvore, sem alteração entre elas
- **THEN** o resultado de cada etapa é idêntico nas duas execuções
- **Prova:** execução dupla registrada, com comparação das saídas

### Requirement: Formatação verificada sem reescrita

A verificação SHALL reprovar arquivo fora do formato canônico sem modificar o
arquivo.

#### Scenario: Arquivo desformatado reprova e permanece intacto

- **WHEN** um arquivo versionado dentro do perímetro está fora do formato canônico
- **THEN** a verificação falha e o arquivo permanece byte a byte como estava
- **Prova:** arquivo desformatado plantado, verificação falhando, `git diff` vazio depois da execução

### Requirement: Supressão de tipo com justificativa

A verificação SHALL reprovar uso de `any` explícito e supressão de erro de tipo
sem justificativa anexa na mesma supressão.

#### Scenario: Supressão sem justificativa reprova

- **WHEN** um arquivo usa `any` explícito ou suprime um erro de tipo sem justificativa na mesma linha
- **THEN** a verificação falha e aponta o arquivo e a linha
- **Prova:** caso negativo plantado por commit, verificação falhando, commit revertido

### Requirement: Descoberta automática de pacotes

Um pacote acrescentado ao workspace SHALL entrar na verificação sem alteração na
configuração da raiz.

#### Scenario: Pacote novo é verificado sem editar a raiz

- **WHEN** um pacote é acrescentado sob `packages/`
- **THEN** a verificação passa a cobri-lo sem que nenhum arquivo de configuração da raiz seja alterado
- **Prova:** pacote-fixture descartável acrescentado, verificação cobrindo-o, fixture removido

### Requirement: Perímetro isolado

A verificação SHALL NOT alcançar, alterar ou reprovar conteúdo sob `src/`,
`tests/`, `data/`, `queries/` ou `supabase/` — a árvore da frente de coleta.

**Por quê:** o texto anterior ("cobre exclusivamente `apps/*` e
`packages/*`") descrevia uma inclusão que nenhum mecanismo aplica — cada
guardião de `tools/checks/` monta seu próprio caminho a partir da raiz do
repositório (`ROOT = fileURLToPath(new URL("../../", import.meta.url))`) e
escolhe seu próprio perímetro; nada estrutural impede um guardião de ler
outra coisa. O que a verificação de fato garante, e o único cenário deste
requisito sempre provou, é que ela não toca a árvore de outra frente —
`src/`, `tests/`, `data/`, `queries/`, `supabase/`, mantidas por processo
próprio, fora de `apps/`, `packages/`, `openspec/` e `tools/`. Nomear essa
exclusão, pequena e estável, é mais preciso do que listar tudo que a
verificação alcança — essa segunda lista cresce a cada guardião novo (o
guardião do ciclo de vida de mudanças, abaixo, é o caso mais recente) e
precisaria ser reescrita a cada vez, o mesmo risco que motivou o próprio
requisito. Ler `openspec/changes/` deixa de ser assunto deste requisito:
não é uma inclusão nova, é a ausência de proibição.

#### Scenario: Conteúdo herdado não é verificado nem alterado

- **WHEN** a verificação é executada com o repositório contendo `src/`, `tests/`, `data/`, `queries/` e `supabase/`
- **THEN** nenhum arquivo desses diretórios é lido pela verificação, alterado ou reportado
- **Prova:** execução com árvore herdada presente, `git status` limpo ao final

#### Scenario: Os scripts herdados continuam funcionando

- **WHEN** os scripts `collect` e `test` da raiz são executados depois da conversão em workspace
- **THEN** ambos se comportam exatamente como antes da conversão
- **Prova:** execução dos dois scripts antes e depois, com comparação de saída e código de saída

### Requirement: Fronteira entre biblioteca e aplicação

A verificação SHALL reprovar pacote da biblioteca que declare dependência sobre
uma aplicação do repositório, ou que importe um framework de aplicação — aquele
que possui rotas, servidor ou convenção de páginas.

Um renderizador, uma biblioteca de teste ou uma ferramenta de documentação
SHALL NOT ser tratada como framework de aplicação: são o que permite a um pacote
da biblioteca ser verificado por execução, e proibi-los tornaria a verificação de
componente impossível.

#### Scenario: Dependência invertida reprova

- **WHEN** um pacote sob `packages/` declara dependência sobre um pacote sob `apps/` ou importa dele
- **THEN** a verificação falha e nomeia o pacote e a dependência proibida
- **Prova:** dependência invertida plantada por commit, verificação falhando, commit revertido

#### Scenario: Framework de aplicação reprova

- **WHEN** um pacote sob `packages/` importa um framework de aplicação
- **THEN** a verificação falha e nomeia o pacote e a importação proibida
- **Prova:** importação plantada por commit, verificação falhando, commit revertido

#### Scenario: Renderizador não é framework de aplicação

- **WHEN** um pacote sob `packages/` importa o renderizador usado pela bancada
- **THEN** a verificação passa
- **Prova:** execução da verificação sobre a bancada, que depende do renderizador

### Requirement: Integração contínua sobre pull request

A integração contínua SHALL executar a mesma verificação da raiz em todo pull
request, publicar resultado por etapa, e impedir merge enquanto houver etapa
falhando.

#### Scenario: Pull request com etapa falhando não pode ser mergeado

- **WHEN** um pull request é aberto com uma etapa da verificação falhando
- **THEN** a integração contínua reporta a etapa que falhou e o merge permanece bloqueado
- **Prova:** pull request de teste com falha plantada, com captura do bloqueio

### Requirement: Branch principal protegida

O repositório SHALL recusar commit enviado diretamente para a branch principal,
sem reescrever histórico anterior.

#### Scenario: Push direto na branch principal é recusado

- **WHEN** alguém tenta enviar commit diretamente para a branch principal
- **THEN** o push é recusado e o histórico anterior permanece inalterado
- **Prova:** tentativa registrada, com captura da recusa

### Requirement: Estilo sem literal em todo o perímetro

A verificação SHALL reprovar arquivo em qualquer área do perímetro — `apps/*` e
`packages/*` — que declare valor literal de cor, espaço, raio, sombra ou
tipografia, nomeando o arquivo e a linha.

A única isenção SHALL ser a camada primitiva da fonte de tokens.

Área do perímetro acrescentada SHALL entrar nessa varredura sem alteração no
guardião.

**Por quê:** a varredura cobria `packages/` e mais nada. No instante em que a
primeira aplicação existe, código novo passa a nascer fora do lugar varrido, e a
proibição de literal deixa de valer exatamente onde há mais chance de ser
violada — folha de estilo global, moldura, página. A isenção da camada primitiva
existe porque ela é a fonte dos literais, por definição.

#### Scenario: Literal plantado numa aplicação reprova

- **WHEN** um arquivo sob `apps/` declara valor literal de cor, espaço, raio, sombra ou tipografia
- **THEN** a verificação falha, nomeando o arquivo e a linha
- **Prova:** literal plantado em `apps/backoffice`, `tools/checks/style-literals.test.ts` falhando com arquivo e linha nomeados, plantio revertido

#### Scenario: Aplicação nova entra na varredura sem editar o guardião

- **WHEN** uma aplicação é acrescentada sob `apps/` com um literal de estilo
- **THEN** a verificação falha nomeando o arquivo da aplicação recém-acrescentada, sem que nenhum arquivo de checagem seja alterado
- **Prova:** aplicação-fixture descartável com literal plantado, verificação falhando, fixture removido

#### Scenario: A camada primitiva de tokens continua isenta

- **WHEN** a verificação é executada com a fonte de tokens contendo literais na camada primitiva
- **THEN** a verificação passa, e nenhum arquivo da camada primitiva é reportado
- **Prova:** execução do guardião sobre a árvore corrente, com a camada primitiva presente

### Requirement: Fronteira da aplicação

Uma aplicação SHALL poder importar o framework de aplicação.

A verificação SHALL reprovar aplicação que importe qualquer um destes,
nomeando o arquivo e a importação proibida:

- outra aplicação do repositório;
- caminho interno de um pacote da biblioteca, fora do que o pacote publica;
- conteúdo fora do perímetro — a árvore herdada de coleta, o contrato de
  leitura e o banco;
- cliente de dado ou de rede, e chamada de rede por variável global.

**Por quê:** a lista da biblioteca não serve à aplicação, e copiá-la proibiria
`next` justamente em quem deve importá-lo. Cada item existe por uma razão
própria, registrada em `design.md`; a proibição de cliente de dado e de rede é a
que torna verificável, e não apenas combinada, a exclusão "nenhuma busca de
dado" — e é a única da lista que tem data para ser reaberta: o ciclo que trouxer
o contrato de leitura.

#### Scenario: A aplicação importa o framework e a verificação passa

- **WHEN** uma aplicação sob `apps/` importa o framework de aplicação
- **THEN** a verificação passa
- **Prova:** execução da verificação sobre `apps/backoffice`, que importa o framework no layout e na página

#### Scenario: Importação de outra aplicação reprova

- **WHEN** uma aplicação importa um arquivo de outra aplicação do repositório
- **THEN** a verificação falha, nomeando o arquivo e a importação proibida
- **Prova:** importação plantada, `verify:lint` falhando com a mensagem, plantio revertido

#### Scenario: Caminho interno de pacote reprova

- **WHEN** uma aplicação importa um caminho interno de um pacote da biblioteca, em vez de um subpath publicado por ele
- **THEN** a verificação falha, nomeando o arquivo e a importação proibida
- **Prova:** importação de caminho interno plantada, `verify:lint` falhando, plantio revertido

#### Scenario: Importação de conteúdo fora do perímetro reprova

- **WHEN** uma aplicação importa da árvore herdada de coleta, do contrato de leitura ou do banco
- **THEN** a verificação falha, nomeando o arquivo e a importação proibida
- **Prova:** importação plantada para cada um dos três, `verify:lint` falhando em cada caso, plantios revertidos

#### Scenario: Busca de dado na aplicação reprova

- **WHEN** uma aplicação importa cliente de dado ou de rede, ou executa chamada de rede por variável global
- **THEN** a verificação falha, nomeando o arquivo e o que foi importado ou chamado
- **Prova:** importação de cliente de dado e chamada de rede global plantadas, `verify:lint` falhando em cada caso, plantios revertidos

### Requirement: Artefato de construção não é conteúdo verificado

O diretório de artefatos produzido pela construção de uma aplicação SHALL ficar
fora do versionamento.

As etapas de checagem de tipos, de formatação e de lint SHALL NOT ler arquivo
que o versionamento ignora, esteja ele dentro ou fora do diretório de
artefatos. As dependências instaladas SHALL ser a única exceção.

A verificação SHALL deixar a árvore versionada inalterada, mesmo executando uma
construção.

**Por quê:** a construção roda dentro do estágio de testes, e o que ela emite é
saída, não conteúdo. Se a saída entrasse na checagem de tipos, na formatação, no
lint ou no versionamento, a verificação passaria a reprovar arquivo que ela
mesma gerou. O resultado passaria a depender de ter havido construção antes:
numa árvore limpa o arquivo não existe, e numa árvore já construída existe.

A obrigação não pode se limitar ao diretório, porque a construção também gera
fora dele. `next-env.d.ts` fica na raiz da aplicação e importa
`./.next/types/*.d.ts`. A linha entre conteúdo e saída é a que o versionamento
já traça. Uma lista de nomes de arquivo deixaria de fora o próximo arquivo
gerado.

A checagem de tipos precisa de prova sobre o que ela **lê**, e não sobre o
veredito dela. Medido com a configuração do repositório: a etapa passa lendo
artefato de construção, esteja o artefato presente ou ausente. Dois fatores
escondem a dependência. O TypeScript não reporta especificador não resolvido
em importação de efeito colateral, e `skipLibCheck` pula o `.d.ts`.

As dependências instaladas são exceção porque a checagem de tipos precisa ler
as declarações das bibliotecas.

#### Scenario: Construção não suja a árvore versionada

- **WHEN** a verificação é executada por inteiro, incluindo a construção da aplicação
- **THEN** nenhum arquivo versionado é criado ou alterado
- **Prova:** execução completa de `pnpm verify` seguida de `git status`, com a saída registrada

#### Scenario: Artefato de construção não é formatado nem lintado

- **WHEN** as etapas de formatação e de lint são executadas com os artefatos de construção presentes na árvore, inclusive um arquivo gerado fora do diretório de artefatos
- **THEN** nenhum desses arquivos é lido, reportado ou alterado
- **Prova:** com a construção já feita, `apps/backoffice/next-env.d.ts` é plantado fora do formato canônico e com `any` explícito; `verify:format` e `verify:lint` passam sem nomeá-lo, a saída é registrada e o plantio é revertido

#### Scenario: A checagem de tipos não lê artefato de construção

- **WHEN** a checagem de tipos de cada pacote do workspace é resolvida com a construção já feita
- **THEN** nenhum arquivo que ela lê, fora das dependências instaladas, é ignorado pelo versionamento
- **Prova:** `apps/backoffice/tests/type-stage-inputs.test.ts` passando na árvore corrente, depois da construção que o projeto de teste faz

#### Scenario: Checagem de tipos que passa a ler artefato de construção reprova

- **WHEN** a configuração de tipos de uma aplicação passa a incluir um arquivo gerado pela construção
- **THEN** a verificação falha, nomeando cada arquivo ignorado pelo versionamento que a checagem de tipos lê
- **Prova:** o `exclude` de `apps/backoffice/tsconfig.json` é removido; `apps/backoffice/tests/type-stage-inputs.test.ts` falha nomeando `next-env.d.ts`, `.next/types/routes.d.ts` e `.next/types/root-params.d.ts`, enquanto `verify:types` continua passando, o que também fica registrado; o plantio é revertido

#### Scenario: Sem artefato de construção presente, a prova reprova e não pula

- **WHEN** a prova da checagem de tipos é executada sem os artefatos que a construção gera
- **THEN** ela falha nomeando cada artefato ausente, sem nenhuma afirmação reportada como pulada
- **Prova:** a construção é desligada no preparo do projeto de teste de `apps/backoffice`, e os artefatos são removidos, dentro e fora do diretório de artefatos; `apps/backoffice/tests/type-stage-inputs.test.ts` falha nomeando os caminhos ausentes; o plantio é revertido

### Requirement: Fixture com origem declarada em todo o perímetro

Todo arquivo sob um diretório chamado `fixtures`, em qualquer área do
perímetro — `apps/*` e `packages/*` —, SHALL ser tratado como fixture.

Toda fixture SHALL declarar no próprio arquivo a sua origem, que é derivada do
contrato de leitura ou sintética, e SHALL trazer uma nota não vazia sobre essa
origem. A verificação SHALL reprovar, nomeando o arquivo, a fixture que não
declara origem, que declara uma origem fora dessas duas ou que não tem nota.

Área do perímetro acrescentada SHALL entrar nessa varredura sem alteração no
guardião.

O diretório de artefatos de construção e as dependências instaladas SHALL
ficar fora da varredura.

**Por quê:** uma fixture derivada do contrato afirma um estado do domínio que
existe. Uma fixture sintética afirma apenas que o componente consegue
renderizar. Sem a declaração no próprio arquivo, essa distinção dura até alguém
copiar um arquivo. Ela foi estabelecida na proposta de `domain-charts-v1`, mas
nenhum requisito a obrigava.

A varredura cobria só `packages/ui/src`. A próxima fixture tende a nascer numa
aplicação, alimentando uma tela, e o trabalho de um guardião é pegar a primeira.

O reconhecimento pelo nome do diretório é o critério que o guardião aplica, e o
requisito o declara para que ele fique visível: uma fixture guardada fora de um
diretório `fixtures` não é reconhecida.

A saída de construção e as dependências ficam fora da varredura por dois
motivos. A construção pode reproduzir nomes da árvore de origem. E dependências
publicadas trazem diretórios `fixtures` que não são do repositório.

#### Scenario: Fixture sem origem declarada numa aplicação reprova

- **WHEN** um arquivo sob um diretório `fixtures` em `apps/` não declara origem, declara origem fora das duas conhecidas ou não traz nota
- **THEN** a verificação falha, nomeando o arquivo e o que falta
- **Prova:** três fixtures plantadas sob `apps/backoffice/fixtures/`, uma sem origem, uma com origem desconhecida e uma sem nota; `tools/checks/fixture-origin.test.ts` falha nomeando cada uma; os plantios são revertidos

#### Scenario: Aplicação nova entra na varredura sem editar o guardião

- **WHEN** uma aplicação é acrescentada sob `apps/` com uma fixture sem origem declarada
- **THEN** a verificação falha nomeando o arquivo da aplicação recém-acrescentada, sem que nenhum arquivo de checagem seja alterado
- **Prova:** aplicação descartável com a fixture plantada; `tools/checks/fixture-origin.test.ts` falha nomeando o arquivo e `git diff tools/` sai vazio; a aplicação descartável é removida

#### Scenario: As fixtures existentes continuam encontradas e aprovadas

- **WHEN** o guardião é executado sobre a árvore corrente
- **THEN** ele encontra as fixtures de `packages/ui`, e todas declaram origem e nota
- **Prova:** `tools/checks/fixture-origin.test.ts` passando, e a afirmação dele de que o perímetro encontra `abve-janeiro-2025.ts` e `synthetic-series.ts` também passando

#### Scenario: Saída de construção e dependências não são varridas

- **WHEN** existe um arquivo sem origem declarada sob um diretório `fixtures` dentro do diretório de artefatos de construção ou das dependências instaladas
- **THEN** o guardião não o reporta
- **Prova:** com a construção já feita, uma fixture sem origem é plantada em `apps/backoffice/.next/fixtures/` e outra em `apps/backoffice/node_modules/.probe/fixtures/`; `tools/checks/fixture-origin.test.ts` passa; os plantios são revertidos

### Requirement: Mudança OpenSpec ativa tem os três artefatos de planejamento

Toda mudança sob `openspec/changes/`, fora de `archive/`, SHALL conter
`proposal.md`, `design.md` e `tasks.md`. Ausência de qualquer um dos três
SHALL reprovar a verificação, nomeando a mudança e o artefato que falta.

**Por quê:** `openspec validate --strict` aprova uma mudança sem `design.md`
nem `tasks.md` — medido em `docs/pontos-abertos.md`, ponto 17. A ferramenta
que gera esse veredito é de terceiro; este requisito é o substituto que este
repositório controla.

#### Scenario: Mudança ativa sem um artefato reprova

- **WHEN** uma mudança sob `openspec/changes/` não tem `design.md` ou `tasks.md`
- **THEN** a verificação falha, nomeando a mudança e o artefato ausente
- **Prova:** mudança plantada sem um dos três artefatos, verificação falhando, plantio revertido

### Requirement: Mudança com tarefas concluídas não permanece em `changes/`

Uma mudança sob `openspec/changes/`, fora de `archive/`, cujo `tasks.md`
declare pelo menos uma tarefa e todas marcadas concluídas, SHALL reprovar a
verificação, nomeando a mudança.

**Por quê:** medido em `button-variants` — 22/22 tarefas concluídas e código
mergeado, e a mudança permaneceu em `changes/`, sem síntese entre "tarefas
completas" e "specs vivas desatualizadas", até alguém ir procurar
(`docs/pontos-abertos.md`, ponto 20). Uma mudança sem nenhuma tarefa
marcável (`tasks.md` sem checkbox) não é julgada por este requisito — não
há o que significar "concluída" nela.

#### Scenario: Mudança com todas as tarefas concluídas reprova

- **WHEN** uma mudança sob `openspec/changes/` tem `tasks.md` com todas as tarefas marcadas `[x]`
- **THEN** a verificação falha, nomeando a mudança
- **Prova:** mudança plantada com `tasks.md` inteiramente marcado, verificação falhando, plantio revertido

#### Scenario: Mudança sem tarefa marcável não reprova

- **WHEN** uma mudança sob `openspec/changes/` tem `tasks.md` sem nenhuma linha de checkbox
- **THEN** a verificação passa para essa mudança, quanto a este requisito
- **Prova:** mudança plantada com `tasks.md` sem checkbox, verificação passando, plantio revertido

### Requirement: Ponto declarado fechado por mudança arquivada não continua aberto no registro

Se o `proposal.md` de uma mudança sob `openspec/changes/archive/` declarar
fechar um ponto de `docs/pontos-abertos.md`, nomeado por número, esse
número SHALL NOT constar entre os pontos abertos do arquivo. Encontrar os
dois SHALL reprovar a verificação, nomeando o ponto e a mudança arquivada
que declarou fechá-lo.

**Por quê:** medido nesta própria proposta — o ciclo `tokens-obligation-form`
arquivou declarando "Fecha o ponto 5 de `docs/pontos-abertos.md`", e o
registro nunca foi atualizado; o ponto continuou aberto até esta mudança
encontrar a divergência por leitura manual. Ao contrário do ponto 16 (que
depende de saber a intenção de um teste, não mecanizável), esta é
comparação entre duas listas que já existem por escrito — o número que uma
mudança arquivada declara fechar, e os números que `docs/pontos-abertos.md`
ainda lista como abertos —, mecanicamente detectável.

#### Scenario: Ponto declarado fechado mas ainda aberto reprova

- **WHEN** uma mudança arquivada declara, no `proposal.md`, fechar um ponto, e esse número de ponto ainda consta como aberto em `docs/pontos-abertos.md`
- **THEN** a verificação falha, nomeando o ponto e a mudança arquivada
- **Prova:** mudança arquivada plantada com essa declaração, ponto correspondente plantado como aberto em `docs/pontos-abertos.md`, verificação falhando, os dois plantios revertidos

### Requirement: Arquivo de regras do projeto tem integridade verificada

A verificação SHALL ler `openspec/config.yaml` com um parser de YAML e SHALL
reprovar quando o arquivo não parsear, nomeando o arquivo e o erro do parser.

A verificação SHALL conferir que cada seção de `rules` declarada na checagem
existe no arquivo e contém ao menos uma entrada, e SHALL reprovar nomeando a
seção ausente ou vazia.

O conjunto de seções declarado na checagem SHALL ser comparado com o conjunto de
seções descoberto sob `rules:` no arquivo, e divergência em qualquer direção
SHALL reprovar, nomeando a seção que está num conjunto e não no outro.

A checagem SHALL declarar a contagem esperada de entradas por seção, e
divergência entre a contagem declarada e a contagem lida SHALL reprovar,
nomeando a seção, o esperado e o lido.

**Por quê:** `openspec/config.yaml` carrega as regras que governam proposta,
spec, design e tarefa deste repositório, e nada o verificava. **Medido:** com uma
aspa não fechada no arquivo — YAML inválido, parser levanta erro —
`openspec validate --specs --strict` responde `Totals: 7 passed, 0 failed` e
`openspec list` responde `No active changes found`, os dois com código de saída
0 e **sem nenhum aviso**; e nenhum dos quatro estágios de `pnpm verify` lê o
arquivo (`tsc`, `biome format`, `biome lint`, `vitest`; `grep` por `config.yaml`
em `tools/`, `package.json` e `biome.json` volta vazio). As regras do projeto
podiam desaparecer inteiras com o portão verde.

A comparação contra as seções descobertas existe porque a lista de seções da
checagem é ela mesma uma lista de entrada declarada à mão, e lista declarada à
mão prova a própria cobertura (`openspec/config.yaml`, `rules.specs`). O defeito
que ela evita já foi medido neste repositório: a primeira checagem de contraste
do conjunto fixo da navegação declarou a lista de superfícies vazia e quatro
cores ficaram sem nenhum par medido, com a checagem verde.

A contagem por seção é declarada, e não derivada, porque derivá-la do próprio
arquivo tornaria a checagem incapaz de reprovar: uma regra apagada mudaria o
esperado junto com o lido e a comparação passaria sempre. Declarada, ela obriga
quem acrescenta ou remove uma regra a dizer isso na mesma mudança.

Esta checagem SHALL NOT julgar o conteúdo de nenhuma regra. Presença e contagem
não são qualidade de redação, e a verificação não afirma que são.

#### Scenario: Arquivo de regras ilegível reprova

- **WHEN** `openspec/config.yaml` contém YAML inválido
- **THEN** a verificação falha, nomeando o arquivo e o erro do parser
- **Prova:** aspa não fechada plantada no arquivo, verificação falhando com o erro do parser na mensagem, plantio revertido e verificação de volta ao verde

#### Scenario: Seção de regras vazia reprova

- **WHEN** uma das seções de `rules` declaradas na checagem existe no arquivo sem nenhuma entrada
- **THEN** a verificação falha, nomeando a seção vazia
- **Prova:** seção esvaziada por plantio, verificação falhando com o nome da seção, plantio revertido e verificação de volta ao verde

#### Scenario: Seção de regras não coberta pela checagem reprova

- **WHEN** o arquivo tem sob `rules:` uma seção que a checagem não declara, ou a checagem declara uma seção que o arquivo não tem
- **THEN** a verificação falha, nomeando a seção que está num conjunto e não no outro
- **Prova:** seção nova plantada sob `rules:` sem ser declarada na checagem, verificação falhando com o nome dela, plantio revertido

#### Scenario: Contagem divergente da declarada reprova

- **WHEN** uma seção de `rules` tem número de entradas diferente do declarado na checagem
- **THEN** a verificação falha, nomeando a seção, a contagem esperada e a lida
- **Prova:** uma entrada removida por plantio de uma seção, verificação falhando com os dois números, plantio revertido

#### Scenario: Arquivo íntegro passa com as contagens correntes

- **WHEN** a checagem é executada sobre o arquivo corrente
- **THEN** ela passa, com as quatro seções presentes e cada contagem igual à declarada
- **Prova:** execução registrada, com a contagem lida de cada uma das quatro seções

### Requirement: Subpath publicado é provado sob a construção da aplicação

O conjunto de subpaths publicados SHALL ser descoberto do mapa de exportações de
cada pacote sob `packages/`, e SHALL NOT ser escrito à mão em lugar nenhum da
verificação.

Todo subpath descoberto SHALL ser importado por um arquivo da aplicação que a
construção alcança, e a construção da aplicação SHALL ser executada sobre a
árvore que contém essas importações. A verificação SHALL reprovar quando a
construção falhar, com o especificador que não resolveu.

A verificação SHALL comparar o conjunto descoberto com o conjunto de subpaths
importados pelo arquivo de consumo declarado, **nos dois sentidos**, e SHALL
reprovar nomeando o subpath que está num conjunto e não no outro.

A verificação SHALL reprovar quando o conjunto descoberto for vazio, e SHALL NOT
tratar ausência de mapa de exportações como pacote sem subpath a provar — pacote
sob `packages/` sem mapa de exportações reprova, nomeando o pacote.

**Por quê:** subpath publicado é o contrato do pacote, e até esta mudança nada
provava que ele **resolve e compila** para quem o consome. Dos oito subpaths
publicados hoje, a aplicação consumia dois; os outros seis eram verificados só
pela bancada, que é um consumidor de outro empacotador. Os dois defeitos deste
ciclo moravam exatamente nesse vão: a marca que não carrega e o barril de átomos
que não resolve. **Medido:** com o defeito presente, `pnpm verify` ficava verde
porque nenhum arquivo da aplicação importava o subpath quebrado, e
`pnpm --filter @chargebr/backoffice build` reprovava com três especificadores —
`../generated/tokens.js`, `./hatch.js` e `./source.js`.

**Por que a prova é a construção, e não uma verificação de resolução.** Resolver
não é compilar. Medido sobre a mesma árvore, com o defeito presente:

| Verificação | Veredito |
| --- | --- |
| Resolução pelo mapa de exportações, a partir da aplicação | **8 de 8 resolvidos** |
| Importação em Node sob `tsx` | 2 de 8 importados — os 6 que falharam, por extensão `.css`, e os 2 que passaram são exatamente os que a construção reprova |
| `pnpm -r exec tsc --noEmit` | **passa** |
| `next build` da aplicação | **reprova**, nomeando os três especificadores |

Só a construção é oráculo: a resolução pelo mapa não segue o grafo, a importação
em Node erra nos dois sentidos — não carrega folha de estilo nem módulo de
estilo, e resolve `.js` para `.ts`, que o empacotador da aplicação não resolve —,
e a checagem de tipos resolve pelas regras de TypeScript, não pelas do
empacotador.

**Por que a lista é descoberta e não declarada.** Lista de entrada escrita à mão
é afirmação sobre o código e tem duas provas próprias
(`openspec/config.yaml`, `rules.specs`). Aqui a fonte existe e é única — o mapa de
exportações —, então a cobertura é obtida por construção: subpath novo entra no
conjunto descoberto sem ninguém editar a verificação, e a comparação nos dois
sentidos nomeia o que ficou sem importação. O conjunto vazio reprova porque lista
vazia passa calada, que é o defeito medido no ciclo `nav-frame-contrast` e
registrado em `proof-falsifiability`.

**O que esta obrigação não exige:** que a aplicação **use** o que importa. Importar
é o que a construção precisa para resolver e compilar; usar é decisão de produto.
O custo dessa importação sobre o documento entregue é escolha de desenho, medida e
registrada no design do ciclo que criou o arquivo de consumo, não obrigação deste
requisito.

#### Scenario: Subpath publicado que não resolve reprova

- **WHEN** um subpath publicado não resolve sob a construção da aplicação
- **THEN** a verificação falha com o especificador que não resolveu
- **Prova:** especificador de módulo inexistente plantado num arquivo alcançável por subpath publicado, a construção dentro do preparo da verificação falhando com o especificador nomeado, plantio revertido

#### Scenario: Subpath publicado sem importação reprova

- **WHEN** o mapa de exportações de um pacote publica um subpath que o arquivo de consumo declarado não importa
- **THEN** a verificação falha nomeando o subpath descoberto e não importado
- **Prova:** subpath novo plantado no mapa de exportações de um pacote, teste de cobertura falhando com o subpath nomeado, plantio revertido

#### Scenario: Importação de subpath que o pacote não publica reprova

- **WHEN** o arquivo de consumo declarado importa um especificador de pacote do repositório que nenhum mapa de exportações publica
- **THEN** a verificação falha nomeando o subpath importado e não publicado
- **Prova:** importação de subpath inexistente plantada no arquivo de consumo, teste de cobertura falhando com o subpath nomeado, plantio revertido

#### Scenario: Conjunto descoberto vazio reprova

- **WHEN** a descoberta não encontra nenhum subpath publicado, ou um pacote sob `packages/` não tem mapa de exportações
- **THEN** a verificação falha, nomeando o pacote sem mapa ou dizendo que o conjunto ficou vazio
- **Prova:** mapa de exportações removido por plantio de um dos pacotes, teste de cobertura falhando com o pacote nomeado, plantio revertido

#### Scenario: Todos os subpaths publicados da árvore corrente estão provados

- **WHEN** a verificação é executada sobre a árvore corrente
- **THEN** o conjunto descoberto coincide com o importado, e a construção da aplicação conclui
- **Prova:** execução do teste de cobertura e da construção no preparo, com a contagem de subpaths descobertos registrada na saída

### Requirement: Pacote não declara diretiva de referência no grafo publicado

Nenhum arquivo alcançável a partir do mapa de exportações de um pacote sob
`packages/` SHALL declarar diretiva de referência de tipos, de biblioteca ou de
caminho. A verificação SHALL reprovar nomeando o arquivo e a linha.

O conjunto de arquivos alcançáveis SHALL ser descoberto a partir do mapa de
exportações, seguindo as importações relativas, e SHALL NOT ser escrito à mão.

A verificação SHALL reprovar quando o conjunto alcançável for vazio.

**Por quê:** diretiva de referência num arquivo do grafo publicado entra no
**programa de tipos de todo consumidor**. **Medido:** com
`/// <reference types="vite/client" />` em
`packages/ui/src/atoms/logo/logo.tsx`, a listagem dos arquivos do programa de
tipos de `apps/backoffice` contém `vite/client.d.ts` — e aquele arquivo declara
`declare module '*.svg' { const src: string; export default src }`. A checagem de
tipos da aplicação não foi enganada: foi **informada**, pelo pacote, de uma coisa
falsa sobre o empacotador dela. Foi essa declaração que certificou a atribuição de
um objeto de imagem a uma referência de imagem, e foi essa certificação que
entregou a marca quebrada em três documentos emitidos. Consertar o sintoma e
deixar a declaração de pé manteria a certificação valendo para todo consumidor
futuro.

**E a obrigação não é higiene: ela sustenta a construção de quem consome.**
Medido na aplicação deste ciclo, com a diretiva devolvida por plantio ao arquivo de
`Logo` depois de a aplicação passar a declarar os tipos de imagem dela: a
declaração do Vite — `*.svg` é cadeia — **sobrepõe** a do framework, que é `any`, e
a construção da aplicação **reprova**, com
`app/layout.tsx(29,43): error TS2339: Property 'src' does not exist on type
'string'`. Antes desta mudança a mesma diretiva passava calada e certificava a
atribuição errada; depois dela, a mesma diretiva derruba a construção de quem
consome o pacote. Nos dois estados ela é defeito, e em nenhum dos dois o pacote
tem como saber qual é o empacotador do consumidor — é esta a razão pela qual a
proibição é do pacote, e não um conselho de estilo.

**Medido também:** hoje exatamente um arquivo alcançável declara diretiva de
referência, o de `Logo`. As outras três ocorrências do perímetro —
`packages/ui/src/bench/optimize-deps.test.ts`,
`packages/tokens/src/theme.test.ts` e `apps/backoffice/next-env.d.ts` — não são
alcançáveis a partir de exportação nenhuma: as duas primeiras são arquivos de
prova da bancada, que **é** um consumidor do empacotador que elas declaram, e a
terceira é da aplicação. O escopo alcançável é o que separa a afirmação verdadeira
da afirmação que atravessa.

A proibição é de qualquer diretiva de referência, e não só de tipos de
empacotador: `lib` e `path` chegam ao programa do consumidor pelo mesmo caminho.
Pacote que precise de declaração ambiente declara-a para si, em arquivo de
declaração próprio — como `packages/ui/src/css-modules.d.ts` faz —, nunca por
diretiva que atravesse para quem consome. **Medido:** removendo a diretiva de
`Logo`, a checagem de tipos da aplicação reprova em exatamente dois lugares, os
dois imports de arquivo de marca dentro do próprio `Logo`, e em nenhum import de
módulo de estilo.

#### Scenario: Diretiva de referência no grafo publicado reprova

- **WHEN** um arquivo alcançável a partir do mapa de exportações declara diretiva de referência
- **THEN** a verificação falha nomeando o arquivo e a linha
- **Prova:** a diretiva de tipos do empacotador da bancada devolvida por plantio ao arquivo de `Logo`, a verificação falhando com o arquivo e a linha nomeados, plantio revertido

#### Scenario: Diretiva em arquivo fora do grafo publicado não reprova

- **WHEN** a verificação é executada sobre a árvore corrente, em que arquivos de prova da bancada declaram diretiva de referência
- **THEN** ela passa, porque nenhum deles é alcançável a partir do mapa de exportações
- **Prova:** execução sobre a árvore corrente, com a contagem de arquivos alcançáveis registrada e as ocorrências de prova nomeadas como fora do conjunto

#### Scenario: Conjunto alcançável vazio reprova

- **WHEN** a descoberta não alcança nenhum arquivo a partir dos mapas de exportações
- **THEN** a verificação falha dizendo que o conjunto ficou vazio
- **Prova:** alvos de exportação apontados por plantio para arquivo inexistente, verificação falhando, plantio revertido
