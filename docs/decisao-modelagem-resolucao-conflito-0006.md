# Decisão de modelagem: resolução de conflito `0006`

## Estado

`ACEITA — AGUARDANDO MERGE`

Este documento propõe a menor mudança estrutural necessária para representar o [caso selecionado para a resolução `0006`](selecao-resolucao-conflito-0006.md). Ele não cria migration, não altera o schema e não modifica dados no Supabase.

## Resultado da análise

O schema atual preserva publicações, observações, evidências, acontecimentos e valores métricos. Ele também admite os estados `provisional`, `validated`, `superseded` e `rejected` em `metric_values.value_status`.

Entretanto, não representa três relações indispensáveis ao caso aceito:

1. que duas linhas de conteúdo são versões da mesma página e que a posterior corrige a anterior;
2. que um acontecimento documentado resolveu um conflito quantitativo;
3. que cada valor passou de um estado anterior para outro, com motivo e revisão reconstruíveis.

A proposta cria três tabelas aditivas:

```text
content_item_relations
metric_value_resolutions
metric_value_status_transitions
```

Nenhuma tabela existente será substituída. Nenhum dado será migrado ou atualizado durante a criação da estrutura.

## Princípio central

`metric_values.value_status` continuará representando a **situação atual** do valor. A nova tabela de transições explicará como essa situação foi alcançada.

As duas representações terão funções diferentes:

| Elemento | Pergunta respondida |
| --- | --- |
| `metric_values.value_status` | Qual é a situação atual deste valor? |
| `metric_value_status_transitions` | De qual situação ele veio, para qual passou e por qual resolução? |

Uma atualização futura de `value_status` só será válida quando ocorrer na mesma transação que a inserção da transição correspondente e quando a verificação confirmar a igualdade entre o estado atual e a transição mais recente.

O histórico é semântico, não um log de comandos SQL. Ao carregar retroativamente um caso já resolvido, o banco poderá inserir o valor com sua situação atual e inserir a transição histórica que explica a passagem anterior.

## Por que reutilizar `content_items`

A restrição atual de `content_items` permite duas linhas com a mesma fonte e URL quando `content_fingerprint` é diferente. Isso já oferece identidade separada para duas versões de uma página.

No caso `0006`, poderão existir:

- uma linha para a primeira edição de 6 de janeiro de 2025;
- uma linha para a versão corrigida de 7 de janeiro de 2025;
- a mesma fonte, URL e título;
- identificadores de conteúdo distintos;
- observações e evidências próprias para cada versão.

Não é necessário criar uma segunda tabela que duplique título, URL, fonte, data, retenção e captura. A lacuna está na ausência de uma relação explícita entre as duas linhas.

A primeira edição será registrada como versão histórica reconstruída pela nota oficial de correção. Sua evidência deverá declarar essa limitação; ela não poderá fingir que existe uma captura primária integral do corpo anterior.

## Tabela `content_item_relations`

### Finalidade

Relacionar duas linhas de `content_items` e declarar como a versão posterior afeta a anterior.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `earlier_content_item_id` | `bigint` | Obrigatório; FK para `content_items`; versão anterior |
| `later_content_item_id` | `bigint` | Obrigatório; FK para `content_items`; versão posterior |
| `relationship_type` | `text` | Obrigatório; vocabulário controlado |
| `relationship_date` | `date` | Obrigatório; data declarada da relação |
| `evidence_id` | `bigint` | Obrigatório; FK para a evidência que sustenta a relação |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

A chave primária será composta por:

```text
(earlier_content_item_id, later_content_item_id, relationship_type)
```

### Vocabulário inicial

| Relação | Significado da versão posterior |
| --- | --- |
| `corrects` | Corrige erro material da versão anterior |
| `revises` | Reapresenta conteúdo após mudança de método, cobertura ou interpretação |
| `replaces` | Substitui formalmente o documento anterior |

O caso `0006` usará `corrects`.

### Restrições

- as duas versões não podem possuir o mesmo identificador;
- as FKs usarão `on delete restrict`;
- `relationship_type` aceitará somente o vocabulário aprovado;
- `notes` não poderá conter apenas espaços;
- a mesma relação não poderá ser duplicada;
- a carga e a verificação deverão confirmar que as duas versões possuem a mesma fonte e URL;
- a carga deverá rejeitar ciclos ou cronologia invertida.

A igualdade de fonte e URL e a ausência de ciclos dependem de outras linhas. Elas serão verificadas pela carga e pela consulta reutilizável, não escondidas em texto livre nem simuladas por uma restrição incapaz de consultar outras tabelas.

### Índices

A chave primária cobre buscas pela versão anterior. Também serão criados índices para:

- `later_content_item_id`;
- `evidence_id`.

Todas as FKs usadas no sentido inverso permanecerão indexadas.

## Tabela `metric_value_resolutions`

### Finalidade

Representar uma decisão canônica de resolução e ligá-la ao acontecimento que documenta a correção, revisão ou substituição publicada pela fonte.

Uma resolução pode produzir transições em mais de um valor pertencente ao mesmo conflito. No caso `0006`, a correção da ABVE explicará tanto a rejeição do valor estadual incorreto quanto a validação do valor estadual correto.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `bigint generated always as identity` | Chave primária |
| `resolution_key` | `text` | Obrigatório, único e estável |
| `resolution_type` | `text` | Obrigatório; vocabulário controlado |
| `resolution_event_id` | `bigint` | Obrigatório; FK para `events` |
| `reviewer_name` | `text` | Obrigatório; pessoa que aceitou a representação canônica |
| `reviewed_on` | `date` | Obrigatório; data do aceite canônico |
| `decision_reference` | `text` | Obrigatório; referência ao documento ou revisão aceita |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

### Vocabulário inicial

| Tipo | Uso |
| --- | --- |
| `material_correction` | Corrige erro material mantendo o mesmo objeto e escopo |
| `methodology_revision` | Recalcula ou reclassifica o resultado com método diferente |
| `coverage_update` | Atualiza o mesmo período após mudança de cobertura ou chegada de registros |
| `formal_replacement` | Declara um valor ou publicação como substituto formal |

O caso `0006` usará `material_correction`.

### Separação entre fonte e ChargeBR

`resolution_event_id` apontará para o acontecimento da fonte — a correção publicada pela ABVE em 7 de janeiro de 2025.

`reviewer_name`, `reviewed_on` e `decision_reference` registrarão a decisão posterior do ChargeBR de aceitar aquela representação. Esses momentos não serão fundidos:

```text
fonte corrige o conteúdo → ChargeBR revisa a representação → resolução canônica é persistida
```

A data da correção continuará no acontecimento e na relação entre conteúdos. A data do aceite ficará em `reviewed_on`.

### Restrições e índices

- `resolution_key` será único e não vazio;
- `resolution_type` aceitará somente o vocabulário aprovado;
- `resolution_event_id` usará `on delete restrict`;
- nomes, referências e notas não poderão conter apenas espaços;
- haverá índice em `resolution_event_id`.

Um mesmo acontecimento poderá sustentar mais de uma resolução em ciclos futuros. Por isso, `resolution_event_id` não será único.

## Tabela `metric_value_status_transitions`

### Finalidade

Registrar cada mudança semântica de situação de um valor e ligá-la à resolução que a autorizou.

### Campos propostos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `bigint generated always as identity` | Chave primária |
| `transition_key` | `text` | Obrigatório, único e estável |
| `resolution_id` | `bigint` | Obrigatório; FK para `metric_value_resolutions` |
| `metric_value_id` | `bigint` | Obrigatório; FK para o valor afetado |
| `transition_order` | `integer` | Obrigatório; ordem semântica positiva e contínua das mudanças daquele valor |
| `from_status` | `text` | Obrigatório; situação anterior |
| `to_status` | `text` | Obrigatório; situação posterior |
| `replacement_metric_value_id` | `bigint` | Opcional; FK para o valor que substitui ou corrige o anterior |
| `notes` | `text` | Opcional, não vazio quando presente |
| `created_at` | `timestamptz` | Obrigatório, padrão `now()` |

### Regras de estado

`from_status` e `to_status` usarão o mesmo vocabulário já permitido em `metric_values`:

```text
provisional
validated
superseded
rejected
```

As regras mínimas serão:

- origem e destino não podem ser iguais;
- cada resolução pode alterar um valor no máximo uma vez;
- a primeira mudança de cada valor terá ordem `1`;
- as mudanças seguintes terão ordem contínua, sem repetição nem lacunas;
- em cada mudança posterior, `from_status` deverá coincidir com o `to_status` da ordem anterior;
- `replacement_metric_value_id`, quando presente, deve apontar para outro valor;
- uma transição para `validated` não terá substituto;
- uma transição para `superseded` exigirá substituto;
- uma transição para `rejected` poderá indicar substituto quando a correção o declarar;
- todas as FKs usarão `on delete restrict`;
- o `to_status` da maior ordem deverá coincidir com `metric_values.value_status`.

No caso `0006`:

| Valor estadual | Ordem | De | Para | Substituto |
| ---: | ---: | --- | --- | ---: |
| `24435` | `1` | `provisional` | `rejected` | `56819` |
| `56819` | `1` | `provisional` | `validated` | Nenhum |

O vínculo com `56819` não declara que `24435` seja falso em toda geografia. Ambos os `metric_values` desta tabela usarão o escopo estadual. O número municipal correto não será persistido neste ciclo.

### Restrições e índices

- `transition_key` será único e não vazio;
- haverá unicidade em `(resolution_id, metric_value_id)`;
- haverá unicidade em `(metric_value_id, transition_order)`;
- haverá índice parcial em `replacement_metric_value_id` quando não for nulo;
- `resolution_id` estará coberto pela unicidade composta;
- `metric_value_id` estará coberto pela unicidade composta com `transition_order`;
- estados e notas terão restrições de domínio e conteúdo.

A continuidade da cadeia, a ausência de lacunas e a coincidência com a situação atual dependem de outras linhas. Assim como a relação entre versões de conteúdo, elas serão verificadas pela carga transacional e pela consulta reutilizável. A ordem explícita não será inferida de `created_at` ou do identificador da linha, pois uma decisão histórica pode ser registrada no banco depois de acontecimentos posteriores.

## Consistência entre fotografia e histórico

O modelo manterá `metric_values.value_status` para consultas simples e compatibilidade com as cargas anteriores. Essa coluna não será renomeada, removida nem reinterpretada como situação inicial.

Para valores que nunca mudaram, a situação atual continuará suficiente e nenhuma transição retroativa será inventada.

Para valores que mudarem depois desta migration:

1. a carga verificará a situação atual esperada;
2. inserirá a resolução e as transições;
3. definirá `value_status` como o destino correspondente;
4. executará todas essas operações na mesma transação;
5. interromperá se já existir transição incompatível;
6. verificará que a cadeia permanece contínua e sem lacunas;
7. verificará que o destino da maior ordem e a fotografia atual coincidem.

A migration estrutural não criará gatilho, função privilegiada ou view. O primeiro ciclo continuará manual e protegido pela carga idempotente, pela transação e pela consulta de verificação. Uma função obrigatória para toda mudança futura só será considerada se a execução manual demonstrar que esses controles são insuficientes.

## Por que não criar uma view agora

Uma view para calcular a situação corrente duplicaria uma consulta que o campo `value_status` já responde. Também introduziria decisões de exposição e segurança sem necessidade para o teste.

O ChargeBR continuará consultando a coluna atual para o estado corrente e juntará as transições apenas quando precisar explicar o histórico. Se uma interface futura exigir uma projeção pronta, ela terá decisão própria e, no PostgreSQL 15 ou posterior, deverá respeitar RLS com `security_invoker` ou permanecer fora dos schemas expostos.

## Imutabilidade do histórico

As três tabelas novas representam relações e decisões históricas. Para os papéis usados pelo aplicativo:

- RLS será habilitada;
- `public`, `anon` e `authenticated` não receberão acesso;
- `service_role` receberá somente `select` e `insert`;
- `update` e `delete` não serão concedidos;
- as sequências das tabelas com identidade receberão apenas `usage` e `select` para `service_role`.

Uma correção futura de uma resolução canônica deverá acrescentar nova resolução e novas transições; não editar a história anterior silenciosamente.

O proprietário do banco mantém poderes administrativos inerentes ao PostgreSQL. A proteção operacional continuará exigindo arquivos aceitos, execução transacional e verificação posterior.

## RLS e exposição

As tabelas ficarão no schema `public` por coerência com a fundação atual, mas permanecerão fechadas à API pública:

- RLS habilitada em cada tabela;
- nenhuma policy para `anon` ou `authenticated`;
- revogação explícita de privilégios de `public`, `anon` e `authenticated`;
- acesso administrativo limitado a `service_role` conforme a necessidade de inserção e leitura.

A mudança anunciada pelo Supabase para não expor automaticamente novas tabelas à Data API não substitui esses controles explícitos. A migration deverá continuar segura mesmo se a configuração de exposição do projeto mudar.

## O que a migration futura deverá fazer

Depois do aceite e do merge desta decisão, a etapa seguinte poderá criar uma única migration contendo:

1. `content_item_relations`;
2. `metric_value_resolutions`;
3. `metric_value_status_transitions`;
4. chaves primárias e estrangeiras com `on delete restrict`;
5. restrições de vocabulário e conteúdo;
6. índices para todas as FKs não cobertas;
7. comentários de tabela e coluna;
8. RLS e privilégios restritos;
9. comentário atualizado de `metric_values.value_status`, esclarecendo que é a situação atual;
10. nenhuma inserção, atualização ou remoção de dados canônicos.

O arquivo será criado pelo comando oficial da CLI para nova migration. O nome e o timestamp serão produzidos pela ferramenta, não inventados manualmente.

## Validação obrigatória da migration

A migration deverá ser testada antes de ser proposta para aplicação. A revisão técnica deverá demonstrar:

- criação das três tabelas e somente delas;
- tipos, nulabilidade, valores padrão e comentários corretos;
- todas as FKs com índices apropriados;
- impossibilidade de autorrelação direta em conteúdo e substituição de valor;
- rejeição de vocabulário inválido;
- rejeição de estados de origem e destino iguais;
- rejeição de ordem nula, zero, negativa ou repetida para o mesmo valor;
- exigência de substituto para `superseded`;
- ausência de substituto em transição para `validated`;
- unicidade de chaves estáveis e de uma transição por valor em cada resolução;
- verificação de cadeia contínua, sem lacunas, e de coincidência entre o destino da maior ordem e `value_status`;
- RLS habilitada;
- ausência de privilégios para `public`, `anon` e `authenticated`;
- somente `select` e `insert` para `service_role` nas tabelas históricas;
- ausência de alterações nos dados, contagens e assinaturas canônicas existentes;
- execução dos advisors de segurança e desempenho depois da aplicação descartável.

Os testes do caso `0006` ainda não serão inseridos nessa migration. Eles pertencerão ao pacote canônico posterior.

## Decisões deliberadamente adiadas

- função obrigatória para efetuar transições;
- trigger de auditoria genérico;
- view de situação corrente;
- política de leitura pública;
- regra global de “um único valor validado por escopo”;
- transições automáticas;
- resolução de conflitos em lote;
- versionamento integral de todo conteúdo histórico;
- captura automática de páginas alteradas;
- identidade de revisores por conta de usuário;
- assinatura criptográfica dos registros de revisão;
- precisão horária genérica para acontecimentos.

No caso selecionado, a hora `18h12` será preservada na afirmação e na evidência da correção. A estrutura usará `2025-01-07` como data da relação e do acontecimento, porque a fonte não declara explicitamente um fuso horário e o schema atual de acontecimentos possui precisão diária.

## O que permanece fora desta etapa

- preparar ou executar a carga `0006`;
- criar os valores `24435` e `56819`;
- atualizar qualquer `value_status` existente;
- modificar os conflitos da carga `0005`;
- aplicar tolerância ou escolher valores por consistência interna;
- importar o valor municipal;
- retomar a carga `0004`;
- criar interface, API pública ou automação;
- aplicar a migration no Supabase antes de revisão e merge;
- alterar dados para testar a migration no projeto permanente.

## Próxima etapa condicionada

Depois de `ACCEPTED` e do merge desta decisão, criar a migration por meio da CLI, validar sua estrutura e preparar um pacote técnico em PR separado.

O Supabase só receberá a migration exata depois que o arquivo e seus testes forem aceitos e incorporados à `main`. A aplicação e o resultado também serão documentados antes da preparação da carga canônica `0006`.

## Perguntas para revisão

### Modelo

1. Está correto manter `metric_values.value_status` como situação atual e usar uma tabela separada para explicar as transições?
2. Está correto reutilizar duas linhas de `content_items` para as versões da mesma URL e criar apenas a relação que falta entre elas?
3. As três tabelas propostas separam adequadamente versão de conteúdo, resolução canônica e transição de valor?
4. Está correto ligar a relação entre versões à evidência e a resolução ao acontecimento publicado pela fonte?
5. A separação entre a correção da ABVE e o aceite posterior do ChargeBR está clara?
6. Os campos de pessoa revisora, data e referência da decisão são suficientes para reconstruir o aceite canônico nesta etapa?

### Estados e escopo

7. Está correto registrar `24435` como `provisional → rejected`, ligado a `56819`, somente para o escopo estadual?
8. Está correto registrar `56819` como `provisional → validated`, sem substituto?
9. As regras distinguem adequadamente `rejected`, `superseded` e `validated` sem tornar `24435` globalmente inválido?
10. Está correto não criar uma regra global de unicidade para valores `validated` antes de existir necessidade demonstrada?

### Operação e segurança

11. Está correto manter a primeira migration aditiva, sem backfill, trigger, função ou view?
12. A ordem semântica explícita, a cadeia contínua e a transação única protegem adequadamente a consistência entre o histórico e `value_status` no primeiro ciclo manual?
13. Está correto tornar as tabelas históricas insert-only para `service_role`, com RLS e sem acesso de `public`, `anon` ou `authenticated`?
14. A decisão de preservar `18h12` na evidência, mas estruturar apenas a data por falta de fuso explícito, evita inventar precisão?
15. A validação proposta é suficiente para a migration avançar em PR separado sem inserir dados do caso `0006`?

Se todas as respostas forem `sim`, registre `ACCEPTED`. Se alguma resposta for `não`, indique o número e a correção necessária. A decisão não deve ser incorporada antes do aceite.

## Resultado da revisão

| Campo | Resultado |
| --- | --- |
| Pessoa revisora | Denis Toledo |
| Data da revisão | 8 de setembro de 2026 |
| Resultado | `ACCEPTED` |

A pessoa revisora aceitou integralmente a decisão e não solicitou correções. O PR está liberado para merge. A migration estrutural só poderá ser criada depois que esta versão aceita estiver incorporada à `main`.
