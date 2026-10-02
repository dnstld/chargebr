# Spec Delta

## ADDED Requirements

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
