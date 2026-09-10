# Decisão de modelagem: revisão metodológica `0007`

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento propõe a menor mudança estrutural necessária para representar o [caso metodológico `0007`](selecao-revisao-metodologica-0007.md). Ele não cria migration, não altera o schema, não prepara a carga `0007` e não modifica dados no Supabase.

## Resultado da análise

O schema atual consegue armazenar definições, valores, publicações, observações, evidências, acontecimentos, correções e transições de situação. Porém, não responde estruturalmente a cinco perguntas indispensáveis:

1. quais versões metodológicas existem para uma mesma métrica conceitual;
2. quais categorias cada versão inclui, exclui ou publica separadamente;
3. qual evidência define ou confirma cada versão;
4. quando uma versão metodológica substitui outra como referência da série;
5. qual metodologia e qual papel documental pertencem a cada valor.

Hoje, `metric_definitions.methodology_notes` só oferece texto livre. `metric_values.value_status` informa a validade atual de um valor, não a vigência do método usado para produzi-lo. `metric_value_status_transitions` registra mudanças de situação dos valores, mas não versões metodológicas.

Usar essas estruturas como se fossem equivalentes misturaria validade factual e vigência metodológica. A proposta cria cinco tabelas aditivas:

```text
metric_methodology_versions
metric_methodology_components
metric_methodology_evidence
metric_methodology_relations
metric_value_methodology_assignments
```

Nenhuma tabela existente será substituída. A migration estrutural não fará backfill nem criará valores, metodologias ou evidências do caso `0007`.

## Princípio central

Uma métrica conceitual, uma metodologia e um valor respondem a perguntas diferentes:

| Elemento | Pergunta respondida |
| --- | --- |
| `metric_definitions` | O que o ChargeBR pretende medir de forma conceitual? |
| `metric_methodology_versions` | Segundo quais regras uma organização produziu o resultado? |
| `metric_values` | Qual número, período, unidade, geografia e situação foram registrados? |
| `metric_value_methodology_assignments` | Qual versão produziu o valor e qual papel ele exerce na publicação? |

A vigência de uma metodologia não será codificada em `metric_values.value_status`.

No caso selecionado:

- `12.556` será `validated`, ligado à metodologia vigente e ao papel `primary`;
- `16.502` também será `validated`, ligado à metodologia anterior e ao papel `counterfactual`;
- a metodologia anterior será relacionada à nova por `supersedes`;
- nenhum dos dois valores receberá `rejected` ou `superseded`.

Assim, o ChargeBR preserva que os dois números foram publicados corretamente para seus critérios sem apresentar o contrafactual como resultado principal de janeiro de 2025.

## Por que a definição conceitual deve ser compartilhada

Criar duas definições de métrica completamente independentes esconderia que os dois valores respondem à mesma pergunta geral da ABVE: quantos emplacamentos de veículos leves pertencem ao agregado denominado “eletrificados” no Brasil durante o mês.

O que muda é a regra operacional de classificação, sobretudo o tratamento de MHEV. Por isso, a carga `0007` deverá criar uma única definição conceitual e duas versões metodológicas ligadas a ela.

A definição não poderá prometer uma composição fixa em seu nome ou descrição. A composição pertence às versões metodológicas. Ao mesmo tempo, a definição continuará delimitada à classificação da ABVE Data, evitando transformar a terminologia própria da instituição em um conceito universal do ChargeBR.

Chave candidata para a futura definição:

```text
monthly-light-electrified-vehicle-registrations-brazil-abve-classification
```

O nome definitivo, a descrição e as notas serão revisados no pacote da carga, não nesta decisão estrutural.

## Tabela `metric_methodology_versions`

### Finalidade

Identificar versões imutáveis da metodologia de uma definição de métrica.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `bigint generated always as identity` | Chave primária |
| `methodology_key` | `text` | Obrigatório, único e estável |
| `metric_definition_id` | `bigint` | Obrigatório; FK para `metric_definitions` |
| `name` | `text` | Obrigatório; rótulo humano da versão |
| `description` | `text` | Obrigatório; regra metodológica resumida |
| `applies_from` | `date` | Opcional; primeiro período de aplicação conhecido |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

`applies_from` poderá ser nulo quando a fonte não informar o início da metodologia anterior. A data final não será armazenada na versão: ela será derivada da relação `supersedes`, evitando atualizar retroativamente a linha antiga quando surgir uma metodologia nova.

### Restrições e índices

- `methodology_key` será único, não vazio e seguirá o formato de identificador estável;
- nome e descrição não poderão conter apenas espaços;
- `metric_definition_id` usará `on delete restrict`;
- haverá índice em `(metric_definition_id, applies_from)`;
- a tabela não terá `updated_at`, porque cada linha representa uma versão histórica imutável.

Uma mudança de regra produzirá nova versão e relação; não editará a versão anterior.

## Tabela `metric_methodology_components`

### Finalidade

Representar de forma consultável o tratamento das categorias que alteram o total. A distinção crítica não ficará somente em descrição livre.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `methodology_version_id` | `bigint` | Obrigatório; FK para `metric_methodology_versions` |
| `component_key` | `text` | Obrigatório; identificador estável da categoria |
| `component_name` | `text` | Obrigatório; nome exibido ao usuário |
| `component_role` | `text` | Obrigatório; vocabulário controlado |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

A chave primária será:

```text
(methodology_version_id, component_key)
```

### Vocabulário inicial

| Papel | Significado |
| --- | --- |
| `included` | A categoria integra o total principal dessa metodologia |
| `excluded` | A fonte declara que a categoria não integra o recorte |
| `reported_separately` | A categoria não integra o total principal, mas continua publicada separadamente |

No caso `0007`, BEV, PHEV, HEV e HEV Flex serão `included` nas duas versões. MHEV será `included` na metodologia anterior e `reported_separately` na metodologia vigente.

O vocabulário descreve a classificação da fonte, não uma avaliação técnica do ChargeBR sobre cada tecnologia.

## Tabela `metric_methodology_evidence`

### Finalidade

Ligar cada versão metodológica às evidências que a definem, anunciam, confirmam ou contextualizam.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `methodology_version_id` | `bigint` | Obrigatório; FK para a versão metodológica |
| `evidence_id` | `bigint` | Obrigatório; FK para `evidence` |
| `relationship_type` | `text` | Obrigatório; vocabulário controlado |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

A chave primária será:

```text
(methodology_version_id, evidence_id, relationship_type)
```

### Vocabulário inicial

| Relação | Significado |
| --- | --- |
| `defines` | A evidência descreve as regras da versão |
| `announces` | A evidência anuncia sua adoção ou vigência |
| `confirms` | A evidência posterior confirma a continuidade da versão |
| `contextualizes` | A evidência acrescenta contexto sem definir a regra |

Essa relação muitos-para-muitos evita escolher artificialmente um único documento quando anúncio, publicação inicial e continuidade posterior exercem papéis diferentes.

## Tabela `metric_methodology_relations`

### Finalidade

Registrar que uma metodologia posterior substitui outra como referência principal a partir de uma data documentada.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `earlier_methodology_version_id` | `bigint` | Obrigatório; FK para a versão anterior |
| `later_methodology_version_id` | `bigint` | Obrigatório; FK para a versão posterior |
| `relationship_type` | `text` | Obrigatório; inicialmente apenas `supersedes` |
| `effective_on` | `date` | Obrigatório; início declarado da nova vigência |
| `evidence_id` | `bigint` | Obrigatório; evidência que sustenta a relação |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

A chave primária será:

```text
(earlier_methodology_version_id, later_methodology_version_id, relationship_type)
```

### Regras

- uma versão não poderá substituir a si própria;
- todas as FKs usarão `on delete restrict`;
- inicialmente cada versão anterior poderá ter no máximo um sucessor por `supersedes`;
- a carga verificará que as duas versões pertencem à mesma definição;
- a carga e a consulta reutilizável rejeitarão ciclos;
- `effective_on` deverá coincidir com `applies_from` da versão posterior quando essa data estiver preenchida;
- a relação não afirma que qualquer valor ligado à versão anterior seja falso ou esteja `superseded`.

As regras que dependem de outras linhas serão verificadas transacionalmente. Não será criado gatilho ou função privilegiada no primeiro caso.

### Como determinar a metodologia vigente

Para uma data de referência, a metodologia principal será encontrada percorrendo as relações `supersedes` cuja `effective_on` já tenha ocorrido. A versão que ainda não foi substituída nesse encadeamento será a vigente.

Não haverá coluna booleana `is_current`. Um booleano exigiria editar a versão antiga e poderia divergir da relação histórica. A vigência será derivada de versões, relações e datas.

## Tabela `metric_value_methodology_assignments`

### Finalidade

Ligar cada valor à versão que o produziu e declarar o papel daquele valor na publicação.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `metric_value_id` | `bigint` | Chave primária e FK para `metric_values` |
| `methodology_version_id` | `bigint` | Obrigatório; FK para a versão metodológica |
| `value_origin` | `text` | Obrigatório; inicialmente `source_published` |
| `value_role` | `text` | Obrigatório; `primary` ou `counterfactual` |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

Uma chave primária em `metric_value_id` exige exatamente uma metodologia para cada valor que receber atribuição. Valores existentes não serão retroativamente obrigados a possuir linha nesta tabela.

### Significado dos papéis

| Campo | Valor | Significado |
| --- | --- | --- |
| `value_origin` | `source_published` | O número foi publicado pela fonte; não foi calculado pelo ChargeBR |
| `value_role` | `primary` | Resultado principal apresentado pela fonte para o recorte |
| `value_role` | `counterfactual` | Resultado que a fonte diz que seria obtido sob outro critério |

No caso `0007`:

| Valor | Metodologia | Origem | Papel | Situação do valor |
| ---: | --- | --- | --- | --- |
| `12556` | vigente desde janeiro de 2025 | `source_published` | `primary` | `validated` |
| `16502` | critério anterior com MHEV | `source_published` | `counterfactual` | `validated` |

A carga verificará que o valor e a metodologia pertencem à mesma definição. Para `primary`, o período do valor deverá respeitar a vigência da metodologia. `counterfactual` poderá aplicar uma versão fora de sua vigência justamente porque essa é a natureza declarada pela fonte.

## Por que não usar `superseded` em `16.502`

`superseded` em `metric_values.value_status` indica que um valor anteriormente corrente deixou de ocupar esse papel e possui substituto identificável.

No caso selecionado, `16.502` não foi o resultado corrente anterior de janeiro de 2025. A ABVE publicou os dois números na mesma página e apresentou `16.502` como o total que seria obtido pelo critério antigo. Não existe transição histórica de `16.502` para `12.556`.

O que foi substituído foi a metodologia anterior como regra principal da série. Por isso:

- `metric_methodology_relations` recebe `supersedes`;
- `metric_value_methodology_assignments` recebe `counterfactual` para `16.502`;
- `metric_values.value_status` permanece `validated` para os dois valores;
- nenhuma `metric_value_status_transition` é criada;
- nenhuma `metric_value_resolution` é necessária para fingir uma resolução entre valores.

## Como o ChargeBR poderá comunicar o caso

### Visão pela metodologia vigente

A consulta deverá selecionar o valor `primary` ligado à versão vigente para o período:

> **Metodologia vigente da ABVE:** 12.556 emplacamentos de veículos leves eletrificados no Brasil em janeiro de 2025. Inclui BEV, PHEV, HEV e HEV Flex; MHEV são publicados separadamente.

### Visão “como publicado”

A consulta deverá mostrar todos os valores `source_published`, acompanhados de método e papel:

> **Resultado principal:** 12.556 pela classificação vigente. **Comparação publicada pela ABVE:** pelo critério anterior, incluindo MHEV, o total seria 16.502.

### Comparação metodológica

A interface futura poderá colocar as versões lado a lado com seus componentes. Ela deverá identificar `16.502` como contrafactual publicado, e não como valor antigo corrigido ou cálculo do ChargeBR.

Nenhuma dessas consultas exige uma view nesta etapa. Primeiro, a carga deverá demonstrar que as relações são suficientes e reconstruíveis. Uma futura view pública exigirá decisão própria de exposição e segurança.

## Cálculos do ChargeBR ficam deliberadamente bloqueados

A seleção revelou a necessidade futura de recalcular séries pela metodologia atual. Porém, a carga `0007` não contém valor calculado pelo ChargeBR: `12.556`, `16.502` e `3.946` são publicados pela ABVE.

Permitir agora `value_origin = 'chargebr_derived'` sem estruturar fórmula e entradas criaria exatamente o risco que se pretende evitar. Por isso, o vocabulário inicial aceitará somente `source_published`.

Antes do primeiro cálculo próprio, um caso real e uma decisão separada deverão criar, no mínimo:

- identidade estável do cálculo;
- versão da metodologia aplicada;
- fórmula ou procedimento reproduzível;
- valores ou observações de entrada;
- papel de cada entrada;
- precisão e regra de arredondamento;
- resultado produzido, quando possível;
- estado `computed` ou `blocked`;
- motivo estruturado quando o cálculo for impossível ou ambíguo;
- pessoa revisora, data e referência da decisão.

Só depois dessa estrutura o vocabulário de origem poderá aceitar `chargebr_derived`. Isso impede atribuir à fonte um número calculado pelo ChargeBR e impede salvar um resultado sem linhagem.

A ambiguidade anual de 2024 permanece documentada na seleção como teste negativo. Nenhum dos valores `161.172` ou `161.173` será inserido, e não será criada uma falsa precisão para demonstrar uma tabela ainda não exercitada.

## Por que não alterar diretamente `metric_values`

Adicionar agora colunas obrigatórias de metodologia e papel em `metric_values` exigiria backfill dos seis valores canônicos existentes, mesmo que os ciclos anteriores não tenham revisado versões metodológicas para eles.

Adicionar colunas opcionais na mesma tabela produziria uma mistura silenciosa entre “não se aplica”, “ainda não modelado” e “desconhecido”. A tabela de atribuição torna a cobertura explícita: existe linha quando a metodologia foi formalmente versionada e revisada.

Os valores anteriores continuam válidos. Uma futura decisão poderá criar atribuições retroativas somente com evidência e revisão próprias.

## Outras alternativas rejeitadas

### Somente `methodology_notes`

Texto livre não permite selecionar a metodologia vigente, comparar componentes ou verificar automaticamente qual método pertence a cada valor.

### Uma definição independente para cada versão

Separaria as regras, mas perderia a identidade conceitual compartilhada e dificultaria a visão histórica entre versões.

### Usar apenas resolução e transição de valor

Representaria falsamente uma mudança de validade dos números. O caso altera a vigência do método, não a veracidade do valor contrafactual publicado.

### Coluna `is_current`

Duplicaria o estado derivável da relação de substituição e exigiria editar versões históricas.

### JSON genérico para toda a metodologia

Seria flexível, mas esconderia novamente as distinções críticas em uma estrutura sem vocabulário relacional. Os componentes que afetam o total merecem linhas verificáveis.

### Estruturas completas de cálculo nesta migration

Não existe valor derivado no recorte `0007`. Criar tabelas de cálculo sem um caso executável produziria regras não testadas. O sistema permanecerá fechado a valores derivados até uma decisão própria.

## Índices e integridade referencial

A migration futura deverá indexar todas as FKs não cobertas por chaves primárias ou unicidade:

- `metric_methodology_versions (metric_definition_id, applies_from)`;
- `metric_methodology_evidence (evidence_id)`;
- `metric_methodology_relations (later_methodology_version_id)`;
- `metric_methodology_relations (evidence_id)`;
- `metric_value_methodology_assignments (methodology_version_id, value_role)`.

As chaves estrangeiras usarão `on delete restrict`. Os índices compostos colocarão primeiro as colunas usadas por igualdade nas consultas de versão e papel.

## Imutabilidade, RLS e privilégios

As cinco tabelas representarão definições e relações históricas. Para o papel administrativo usado pela aplicação:

- RLS será habilitada em todas;
- `public`, `anon` e `authenticated` não receberão privilégios;
- `service_role` receberá somente `select` e `insert`;
- `update` e `delete` não serão concedidos;
- sequências de identidade receberão somente `usage` e `select` para `service_role`;
- não haverá policy pública, função privilegiada ou view.

As versões antigas não precisarão de atualização quando surgir uma sucessora. A nova relação preservará a transição metodológica como inserção histórica.

Grants e RLS serão definidos na mesma migration. A mudança atual do Supabase para exposição explícita na Data API não substituirá essas revogações e proteções próprias do projeto.

## O que a migration futura deverá fazer

Depois do aceite e do merge desta decisão, a etapa seguinte poderá criar uma única migration contendo:

1. `metric_methodology_versions`;
2. `metric_methodology_components`;
3. `metric_methodology_evidence`;
4. `metric_methodology_relations`;
5. `metric_value_methodology_assignments`;
6. chaves primárias e estrangeiras com `on delete restrict`;
7. restrições de vocabulário, formato e conteúdo;
8. índices para todas as FKs e consultas principais;
9. comentários de tabelas e colunas;
10. RLS e privilégios restritos;
11. nenhuma inserção, atualização ou remoção de dados canônicos.

O arquivo será criado pelo comando oficial da CLI para nova migration. O timestamp não será inventado manualmente.

## Validação obrigatória da migration

O pacote técnico deverá demonstrar:

- criação das cinco tabelas e somente delas;
- ausência de alteração nas tabelas existentes;
- tipos, nulabilidade, padrões e comentários corretos;
- todas as FKs protegidas e indexadas;
- rejeição de chaves, nomes e notas vazios;
- rejeição de vocabulários inválidos;
- rejeição de autorrelação metodológica;
- unicidade de um sucessor por versão anterior no vocabulário inicial;
- impossibilidade de duplicar componente, evidência, relação ou atribuição;
- reconstrução da versão vigente sem `is_current`;
- rejeição de ciclos e de versões pertencentes a definições diferentes;
- compatibilidade entre `effective_on` e `applies_from`;
- RLS habilitada e ausência de privilégios para `public`, `anon` e `authenticated`;
- somente `select` e `insert` para `service_role`;
- ausência de vocabulário que permita valor derivado sem linhagem;
- contagens e assinatura inalteradas de todos os dados canônicos;
- execução dos advisors de segurança e desempenho após a aplicação descartável.

Os registros do caso `0007` não serão inseridos nessa migration. Eles pertencerão ao pacote canônico posterior.

## Aplicação prevista ao caso `0007`

Depois da mudança estrutural aceita e aplicada, a carga `0007` deverá criar, no mínimo:

- uma definição conceitual da métrica;
- duas versões metodológicas;
- componentes que explicam inclusão e publicação separada de MHEV;
- evidências para definição, anúncio e continuidade;
- uma relação `supersedes` efetiva em 1º de janeiro de 2025;
- dois valores `validated` para janeiro de 2025;
- uma atribuição `primary` para `12.556`;
- uma atribuição `counterfactual` para `16.502`.

O número `3.946` permanecerá contexto publicado para explicar a diferença. Sua representação exata como observação será decidida no pacote, sem transformá-lo automaticamente em terceira métrica.

A carga não criará transição de situação, resolução entre valores, valor derivado, cálculo anual de 2024 ou relação artificial de correção.

## Decisões deliberadamente adiadas

- tabelas de cálculos e entradas derivadas;
- expansão de `value_origin` para `chargebr_derived`;
- recálculo comparável de séries históricas;
- registro persistente de cálculo bloqueado;
- metodologias paralelas sem relação de substituição;
- múltiplos sucessores para a mesma versão;
- retroatividade de uma metodologia sobre vários períodos;
- backfill das cargas `0001` a `0006`;
- view da metodologia vigente;
- view “como publicado”;
- API ou política pública;
- função ou gatilho para validar cadeias metodológicas;
- identidade de revisores por conta de usuário;
- automação de classificação ou seleção da metodologia.

Essas decisões exigirão casos próprios. O modelo não deverá fingir suporte a capacidades que ainda não foram testadas.

## O que permanece fora desta etapa

- criar ou executar a migration;
- preparar ou executar a carga `0007`;
- inserir `12.556`, `16.502` ou `3.946`;
- criar a definição ou as versões metodológicas;
- alterar qualquer valor ou carga existente;
- marcar valor como `superseded` ou `rejected`;
- recalcular 2024;
- modificar resoluções ou transições anteriores;
- criar interface, API pública, automação ou produto pago;
- modificar o Supabase antes de revisão e merge.

## Próxima etapa condicionada

Depois de `ACCEPTED` e do merge desta decisão, criar a migration por meio da CLI, validar sua estrutura e preparar um pacote técnico em PR separado.

O Supabase só receberá a migration exata depois que o arquivo e os testes forem aceitos e incorporados à `main`. A aplicação e seu resultado também serão documentados antes da preparação da carga canônica `0007`.

## Perguntas para revisão

### Modelo

1. Está correto separar definição conceitual, versão metodológica, valor e atribuição do valor em estruturas diferentes?
2. As cinco tabelas propostas representam suficientemente versões, componentes, evidências, substituição metodológica e papel de cada valor?
3. Está correto derivar a metodologia vigente das relações e datas, sem armazenar `is_current`?
4. Está correto representar categorias como componentes consultáveis, em vez de depender somente de texto livre?
5. A relação `supersedes` deve atingir a metodologia anterior, sem alterar automaticamente a situação dos valores ligados a ela?

### Caso `0007`

6. Está correto manter `12.556` e `16.502` como `validated`, distinguindo-os por metodologia e pelos papéis `primary` e `counterfactual`?
7. Está correto não criar transição `superseded`, resolução entre valores ou relação de correção neste caso?
8. A atribuição `source_published` comunica corretamente que nenhum dos dois valores foi calculado pelo ChargeBR?
9. Está correto tratar `3.946` como contexto metodológico indispensável, sem torná-lo automaticamente uma terceira métrica?
10. As três formas de apresentação propostas distinguem metodologia vigente, história publicada e comparação metodológica sem apagar nenhum valor?

### Limites, operação e segurança

11. Está correto bloquear valores derivados até existir estrutura própria para fórmula, entradas, revisão e cálculo impedido?
12. Está correto adiar a modelagem de cálculos, já que a `0007` não contém resultado calculado pelo ChargeBR?
13. Está correto não fazer backfill das cargas existentes sem evidência e revisão específicas?
14. A estratégia imutável, com novas versões e relações em vez de atualizações históricas, preserva adequadamente a auditoria?
15. Está correto manter as tabelas fechadas a `public`, `anon` e `authenticated`, concedendo apenas `select` e `insert` a `service_role`?
16. A validação proposta é suficiente para a migration avançar em PR separado sem inserir os dados do caso `0007`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 10 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O PR está liberado para merge. A migration estrutural só poderá ser criada depois que esta versão aceita estiver incorporada à `main`.
