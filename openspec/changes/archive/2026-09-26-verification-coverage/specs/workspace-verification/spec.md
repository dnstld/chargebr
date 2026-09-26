## MODIFIED Requirements

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

## ADDED Requirements

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
