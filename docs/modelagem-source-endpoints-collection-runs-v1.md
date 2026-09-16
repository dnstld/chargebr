# Modelagem de `source_endpoints` e `collection_runs` v1

## Estado e escopo

`DECISÃO PARA REVISÃO`

Este documento transforma a fundação aceita do pipeline collection-first em uma especificação de banco de dados. Ele decide integralmente a modelagem de `public.source_endpoints` e `public.collection_runs` para que uma migration posterior possa ser escrita sem novas decisões arquiteturais relevantes.

Este PR é somente documental. Não cria migration, tabela, role, policy, endpoint, coletor, credencial ou dado e não altera o Supabase. Runtime, backend e hospedagem continuam fora de escopo.

## Estado atual confirmado

A verificação foi feita sobre a `main` no commit `943c7b73401199321e86b8ed05548bf208b5a673`, depois do merge da carga canônica da ANEEL.

- `public.sources`, `public.content_items`, `public.observations` e `public.evidence` existem e usam `bigint generated always as identity` nas chaves internas, `text` com `CHECK` para vocabulários, FKs com `ON DELETE RESTRICT`, timestamps em `timestamptz`, RLS habilitada e grants explícitos;
- as migrations mais recentes continuam usando `text + CHECK`, não tipos PostgreSQL `enum`, e revogam privilégios antes de conceder somente o necessário;
- `chargebr_private` existe exclusivamente como fronteira da função de leitura `0001`; o login `chargebr_backend_methodology_0001` permanece sem senha e não é uma identidade de coleta;
- `public.sources.slug = 'aneel'` já possui carga canônica em `data/canonical/0008_aneel-source.sql`; a premissa anterior de ausência da ANEEL em `docs/fundacao-pipeline-coleta-v1.md` foi superada por essa carga, sem mudar a decisão de que ANEEL é a source e o portal de dados é um endpoint;
- busca em todas as migrations e cargas SQL confirma que `source_endpoints` e `collection_runs` ainda não existem;
- nenhuma estrutura atual registra configuração pública de um local coletável ou cada tentativa operacional de coleta.

## Decisões executivas

1. As duas tabelas ficam em `public`. Elas são dados relacionais internos ligados a `public.sources`; `chargebr_private` permanece uma fronteira de execução específica do contrato `0001`, não um schema genérico de armazenamento. Estar em `public` não concede acesso: RLS e grants continuam fechados.
2. As PKs são `bigint generated always as identity`, seguindo todas as entidades internas comparáveis do projeto. UUID não substitui a PK.
3. `collection_runs.run_key` é `uuid`, sem default no banco, fornecido pelo processo iniciador e globalmente único. Ele é a chave de idempotência da invocação, não a identidade relacional da linha.
4. Todos os vocabulários são `text + CHECK`, como no schema atual. Não será criado PostgreSQL `enum`.
5. `request_config`, `pagination_config`, `cursor_config`, `identity_rule`, `cursor_in` e `cursor_out` são `jsonb`. URL, estratégia, formato, método, status, perfil de normalização, retenção e política de remoção permanecem em colunas próprias.
6. `last_heartbeat_at` e `stale_after_at` pertencem à v1. Toda execução nasce `running` com ambos preenchidos e preserva os dois valores depois de terminar para auditoria.
7. Haverá um índice geral por `(source_endpoint_id, started_at desc, id desc)` e um índice parcial para a última execução completa por `(source_endpoint_id, finished_at desc, id desc) where status in ('succeeded', 'no_change')`.
8. Haverá no máximo um `running` por endpoint, garantido por índice único parcial. Uma execução vencida precisa ser reconciliada como `interrupted` antes de outra começar.
9. Estados terminais de `collection_runs` são imutáveis por trigger. A mesma trigger exige inserção inicial como `running`, permite somente atualizações de um `running` e protege os campos que identificam e delimitam a invocação.
10. A trigger de `source_endpoints` invalida a revisão de acesso quando URL, request, termos ou robots mudam, exige uma revisão estritamente mais nova para o endpoint continuar `active` e torna toda linha `retired` imutável.
11. A política inicial de remoção é literalmente `none`, com `CHECK (removal_policy = 'none')`. Não há `removal_config` nem vocabulário de políticas futuras. Na v1, `items_removal_candidates` também é sempre zero; uma política futura exigirá decisão e migration que alterem ambas as constraints.
12. RLS será habilitada sem policies. Todos os privilégios serão revogados de `public`, `anon`, `authenticated` e `service_role`, inclusive nas sequences; nenhum grant será concedido. Somente o proprietário/administração de migration terá acesso até uma decisão criar uma identidade de collector.

## `public.source_endpoints`

### Responsabilidade

Uma linha representa um local lógico e uma configuração pública de coleta pertencente a uma source. Mudança de URL ou ajuste de limites não cria automaticamente outro endpoint; `(source_id, endpoint_key)` é a identidade lógica estável. O endpoint não representa publicação, execução, segredo nem agenda.

### Colunas normativas

| Coluna | Tipo PostgreSQL | Nulo | Default | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint generated always as identity` | não | identity | PK interna |
| `source_id` | `bigint` | não | — | FK para `public.sources(id) ON DELETE RESTRICT` |
| `endpoint_key` | `text` | não | — | chave estável em kebab-case, única dentro da source e imutável após insert |
| `name` | `text` | não | — | rótulo humano curto, não vazio |
| `endpoint_url` | `text` | não | — | URL HTTPS pública, sem userinfo/credencial |
| `endpoint_type` | `text` | não | — | `listing`, `feed`, `api`, `snapshot` ou `document_index` |
| `access_method` | `text` | não | `'http_get'` | na v1, somente `http_get` |
| `response_format` | `text` | não | — | `html`, `json`, `xml`, `csv`, `pdf` ou `other` |
| `status` | `text` | não | `'candidate'` | `candidate`, `active`, `paused`, `unavailable` ou `retired` |
| `request_config` | `jsonb` | não | — | objeto público com limites e opções HTTP permitidas |
| `pagination_strategy` | `text` | não | `'none'` | `none`, `page`, `offset`, `cursor` ou `link` |
| `pagination_config` | `jsonb` | não | `'{}'::jsonb` | objeto específico da estratégia; vazio quando `none` |
| `cursor_strategy` | `text` | não | `'none'` | `none`, `time_window`, `opaque_token` ou `offset_checkpoint` |
| `cursor_config` | `jsonb` | não | `'{}'::jsonb` | contrato do checkpoint; vazio quando `none` |
| `identity_rule` | `jsonb` | não | — | regra versionada de identidade nativa, fallback e campos auxiliares |
| `normalization_profile` | `text` | não | — | chave versionada do perfil que produz fingerprints comparáveis |
| `removal_policy` | `text` | não | `'none'` | na v1, somente `none` |
| `suggested_interval` | `interval` | sim | — | orientação positiva, sem criar agenda |
| `default_retention_class` | `text` | não | `'metadata_only'` | mesmo vocabulário de `content_items`: `metadata_only`, `minimum_excerpt`, `full_document`, `external_reference` |
| `terms_url` | `text` | sim | — | URL HTTPS pública de termos/licença, não vazia e sem userinfo/credencial |
| `robots_url` | `text` | sim | — | URL HTTPS pública de robots, não vazia e sem userinfo/credencial |
| `access_reviewed_at` | `timestamptz` | sim | — | instante da revisão da configuração sensível atual; obrigatório quando `active` |
| `notes` | `text` | sim | — | limitações não estruturadas, não vazio quando presente |
| `created_at` | `timestamptz` | não | `now()` | auditoria de criação |
| `updated_at` | `timestamptz` | não | `now()` | auditoria mantida explicitamente na alteração |

Não haverá colunas de “última execução”, “último sucesso”, “saúde” ou “cursor atual”. Esses valores são derivados de `collection_runs`, evitando duas fontes de verdade.

### Contratos dos objetos JSON

`request_config` aceita somente estas chaves de primeiro nível:

- `timeout_ms`: número inteiro positivo obrigatório;
- `max_response_bytes`: número inteiro positivo obrigatório;
- `query_params`: objeto opcional de parâmetros públicos;
- `headers`: objeto opcional restrito pela aplicação a headers públicos e inofensivos, como `Accept`.

Corpo de request não existe porque a v1 só permite `http_get`. Cookie, `Authorization`, API key, token, senha, assinatura, certificado, session ID e qualquer referência que resolva para um segredo são proibidos. O banco valida forma, chaves de primeiro nível e limites positivos; a aplicação e a revisão humana validam nomes e valores, porque PostgreSQL não consegue provar que um texto arbitrário não é segredo.

`pagination_config` é sempre objeto. Para `none`, precisa ser `{}`. Para as demais estratégias, a aplicação valida o seguinte contrato versionado:

| Estratégia | Chaves obrigatórias | Chaves opcionais |
| --- | --- | --- |
| `page` | `page_parameter`, `first_page`, `page_size_parameter`, `page_size`, `max_pages` | `total_pages_header`, `freeze_parameter`, `freeze_from` |
| `offset` | `offset_parameter`, `initial_offset`, `limit_parameter`, `limit`, `max_pages` | `total_count_path` |
| `cursor` | `request_parameter`, `response_path`, `max_pages` | `terminal_value` |
| `link` | `relation`, `max_pages` | `link_header` |

Nomes de parâmetros e paths são strings não vazias; números são inteiros positivos, exceto `initial_offset`, que pode ser zero; `freeze_from`, quando presente, é `run_started_at`.

`cursor_config` é sempre objeto. Para `none`, precisa ser `{}`. Para `time_window`, registra `request_parameter`, `value_format = 'rfc3339'` e `freeze_from = 'run_started_at'`; para `opaque_token`, registra `request_parameter` e `response_path`; para `offset_checkpoint`, registra `request_parameter` e `step`. A forma concreta de `cursor_in` e `cursor_out` deve corresponder a essa configuração e ser um objeto JSON.

`identity_rule` é um objeto obrigatório com:

- `version`: string não vazia;
- `primary.fields`: array não vazio de nomes de campos;
- `primary.separator`: string quando a identidade é composta;
- `fallback`: objeto opcional com `fields` e `normalization`;
- `diagnostic_fields`: array opcional que nunca participa sozinho da identidade.

O banco garante que o valor é objeto e contém `version` e `primary`; a aplicação valida a estrutura interna e executa a regra. Esses objetos guardam configuração pública declarativa, nunca código executável.

### Constraints e índices

A futura migration deverá criar, no mínimo:

```sql
primary key (id)
foreign key (source_id) references public.sources (id) on delete restrict
unique (source_id, endpoint_key)

check (endpoint_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
check (btrim(name) <> '')
check (endpoint_url ~ '^https://[^[:space:]]+$')
check (endpoint_url !~ '^https://[^/]*@')
check (endpoint_type in ('listing', 'feed', 'api', 'snapshot', 'document_index'))
check (access_method = 'http_get')
check (response_format in ('html', 'json', 'xml', 'csv', 'pdf', 'other'))
check (status in ('candidate', 'active', 'paused', 'unavailable', 'retired'))
check (jsonb_typeof(request_config) = 'object')
check (request_config ?& array['timeout_ms', 'max_response_bytes'])
check ((request_config - array['timeout_ms', 'max_response_bytes', 'query_params', 'headers']) = '{}'::jsonb)
check (jsonb_typeof(pagination_config) = 'object')
check (pagination_strategy in ('none', 'page', 'offset', 'cursor', 'link'))
check ((pagination_strategy = 'none') = (pagination_config = '{}'::jsonb))
check (jsonb_typeof(cursor_config) = 'object')
check (cursor_strategy in ('none', 'time_window', 'opaque_token', 'offset_checkpoint'))
check ((cursor_strategy = 'none') = (cursor_config = '{}'::jsonb))
check (jsonb_typeof(identity_rule) = 'object' and identity_rule ?& array['version', 'primary'])
check (btrim(normalization_profile) <> '')
check (removal_policy = 'none')
check (suggested_interval is null or suggested_interval > interval '0 seconds')
check (default_retention_class in ('metadata_only', 'minimum_excerpt', 'full_document', 'external_reference'))
check (terms_url is null or terms_url ~ '^https://[^[:space:]]+$')
check (terms_url is null or terms_url !~ '^https://[^/]*@')
check (robots_url is null or robots_url ~ '^https://[^[:space:]]+$')
check (robots_url is null or robots_url !~ '^https://[^/]*@')
check (status <> 'active' or access_reviewed_at is not null)
check (notes is null or btrim(notes) <> '')
check (updated_at >= created_at)
```

A migration deve acrescentar checks de tipo e positividade para `timeout_ms` e `max_response_bytes` e de objeto para `query_params`/`headers` quando presentes. A expressão exata pode usar operadores JSONB ou JSONPath, desde que rejeite tipo incorreto sem lançar erro de cast durante validação.

O índice da unique `(source_id, endpoint_key)` já atende buscas por source. Não é necessário índice isolado por `status` na v1.

### Revisão de acesso e imutabilidade do endpoint

Uma trigger `BEFORE UPDATE` deve impedir alteração de `source_id` e `endpoint_key` depois do insert e aplicar, nesta ordem, as regras abaixo.

1. Se `OLD.status = 'retired'`, rejeitar qualquer update, inclusive update sem mudança material ou mantendo `status = 'retired'`. Configuração, notas, `access_reviewed_at` e `updated_at` ficam imutáveis. A transição para `retired` ainda pode gravar a fotografia final; a imutabilidade começa depois que essa transição foi persistida.
2. Considerar que houve mudança sensível de acesso quando qualquer uma destas comparações for verdadeira:

   ```sql
   NEW.endpoint_url  is distinct from OLD.endpoint_url
   or NEW.request_config is distinct from OLD.request_config
   or NEW.terms_url   is distinct from OLD.terms_url
   or NEW.robots_url  is distinct from OLD.robots_url
   ```

3. Se houve mudança sensível e `NEW.status = 'active'`, aceitar a atualização somente quando `NEW.access_reviewed_at` não for nulo e representar uma revisão nova: se `OLD.access_reviewed_at` não for nulo, o novo instante deve ser estritamente maior. Reutilizar o mesmo timestamp é rejeitado. Isso permite uma alteração atômica de configuração já revisada, mas não permite que uma revisão anterior valide a configuração nova.
4. Se houve mudança sensível e `NEW.status <> 'active'`, exigir `NEW.access_reviewed_at is null`. A revisão anterior é invalidada de forma explícita. Depois que a configuração estiver estável, uma atualização separada pode registrar um novo `access_reviewed_at`; somente então o endpoint pode voltar a `active`.
5. Se não houve mudança sensível, a constraint `status <> 'active' or access_reviewed_at is not null` continua suficiente para uma transição a `active`; o timestamp existente ainda corresponde à mesma configuração sensível.

As transições válidas permanecem as já aceitas: `candidate → active|retired`, `active → paused|unavailable|retired`, `paused → active|retired` e `unavailable → active|retired`. Permanecer no mesmo status permite editar configuração ou notas somente quando o estado não é `retired` e as regras de revisão acima são satisfeitas.

## `public.collection_runs`

### Responsabilidade

Uma linha representa uma invocação completa do coletor. Retries de requests e retomada do mesmo processo ainda vivo atualizam a mesma linha. Uma repetição deliberada ou uma tentativa depois de reconciliação cria outra linha com novo `run_key`.

### Colunas normativas

| Coluna | Tipo PostgreSQL | Nulo | Default | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint generated always as identity` | não | identity | PK interna |
| `source_endpoint_id` | `bigint` | não | — | FK para `public.source_endpoints(id) ON DELETE RESTRICT` |
| `run_key` | `uuid` | não | — | idempotency key global fornecida pelo iniciador; unique |
| `status` | `text` | não | `'running'` | `running`, `succeeded`, `no_change`, `partial`, `failed`, `blocked` ou `interrupted` |
| `started_at` | `timestamptz` | não | `now()` | início da invocação |
| `finished_at` | `timestamptz` | sim | — | nulo se e somente se `running` |
| `last_heartbeat_at` | `timestamptz` | não | `now()` | último sinal real, preservado após término |
| `stale_after_at` | `timestamptz` | não | — | deadline de staleness vigente no último heartbeat, preservado após término |
| `trigger_kind` | `text` | não | `'manual_local'` | na v1, somente `manual_local` |
| `initiated_by` | `text` | não | — | pessoa/processo identificável, nunca credencial |
| `collector_name` | `text` | não | — | implementação usada |
| `collector_version` | `text` | não | — | revisão exata da implementação |
| `contract_version` | `text` | não | — | versão do contrato operacional |
| `config_fingerprint` | `text` | não | — | SHA-256 hexadecimal minúsculo da configuração pública efetiva |
| `window_start` | `timestamptz` | sim | — | limite lógico inferior, se houver |
| `window_end` | `timestamptz` | sim | — | limite lógico superior/fixado, se houver |
| `cursor_in` | `jsonb` | sim | — | checkpoint recebido, objeto coerente com o endpoint |
| `cursor_out` | `jsonb` | sim | — | checkpoint comprometido; só em `succeeded`/`no_change` |
| `request_attempt_count` | `integer` | não | `0` | requests incluindo retries, não negativo |
| `response_manifest_hash` | `text` | sim | — | SHA-256 do manifest determinístico ordenado |
| `response_manifest_reference` | `text` | sim | — | referência recuperável, não o conteúdo do manifest |
| `http_status` | `smallint` | sim | — | status final quando há uma única resposta, entre 100 e 599 |
| `response_content_type` | `text` | sim | — | valor sanitizado do metadado de resposta |
| `etag` | `text` | sim | — | valor sanitizado do header |
| `last_modified` | `text` | sim | — | valor original sanitizado do header HTTP, mantido como texto |
| `response_bytes` | `bigint` | sim | — | soma dos bytes recebidos, não negativa |
| `items_found` | `bigint` | não | `0` | cardinalidade de `F` |
| `items_new` | `bigint` | não | `0` | classe exclusiva `N` |
| `items_unchanged` | `bigint` | não | `0` | classe exclusiva `U` |
| `items_changed` | `bigint` | não | `0` | classe exclusiva `C` |
| `items_removal_candidates` | `bigint` | não | `0` | ortogonal a `F`; sempre zero na v1 |
| `items_inaccessible` | `bigint` | não | `0` | classe exclusiva `I`, apenas falha por item já descoberto |
| `items_rejected` | `bigint` | não | `0` | classe exclusiva `J` |
| `error_kind` | `text` | sim | — | `transport`, `http`, `rate_limit`, `access_policy`, `contract`, `format`, `size_limit`, `internal` ou `interrupted` |
| `error_code` | `text` | sim | — | código curto sanitizado, até 128 caracteres |
| `error_message` | `text` | sim | — | resumo sanitizado, até 2.000 caracteres |
| `handoff_status` | `text` | não | `'not_produced'` | `not_produced`, `ready_for_extraction` ou `withheld` |
| `created_at` | `timestamptz` | não | `now()` | auditoria de criação |
| `updated_at` | `timestamptz` | não | `now()` | auditoria mantida explicitamente a cada update |

`last_modified` é `text`, não `timestamptz`, porque o objetivo é preservar o metadado HTTP recebido sem transformar parsing bem-sucedido em condição de armazenamento. Datas semânticas extraídas pertencem ao manifest ou às entidades posteriores.

### Máquina de estados e imutabilidade

Toda linha é inserida em `running`. As únicas transições são:

```text
running → succeeded | no_change | partial | failed | blocked | interrupted
```

Não há transição entre estados terminais nem retorno a `running`. Depois da primeira transição terminal, nenhum campo da linha pode ser alterado, incluindo `updated_at`. A garantia exige trigger `BEFORE INSERT OR UPDATE`, pois um `CHECK` não enxerga `OLD`.

Enquanto a linha permanece `running`, a trigger também impede alteração de `id`, `source_endpoint_id`, `run_key`, `started_at`, `trigger_kind`, `initiated_by`, `collector_name`, `collector_version`, `contract_version`, `config_fingerprint`, `window_start`, `window_end` e `cursor_in`. Heartbeat, deadline, contadores provisórios, metadados de resposta e diagnóstico podem ser atualizados. A transição terminal preenche a fotografia final uma única vez.

O default de `status` não substitui a trigger: insert explícito já terminal deve ser rejeitado. A trigger não deve usar `now()` para decidir staleness; ela valida os timestamps fornecidos. Isso mantém testes determinísticos e evita `CHECK` dependente do relógio.

### Invariantes garantidas por constraints

As constraints da migration posterior devem equivaler a:

```sql
primary key (id)
foreign key (source_endpoint_id)
  references public.source_endpoints (id) on delete restrict
unique (run_key)

check (status in (
  'running', 'succeeded', 'no_change', 'partial',
  'failed', 'blocked', 'interrupted'
))
check ((status = 'running') = (finished_at is null))
check (finished_at is null or finished_at >= started_at)
check (last_heartbeat_at >= started_at)
check (stale_after_at > last_heartbeat_at)
check (finished_at is null or last_heartbeat_at <= finished_at)
check (status <> 'interrupted' or finished_at >= stale_after_at)
check (trigger_kind = 'manual_local')
check (btrim(initiated_by) <> '')
check (btrim(collector_name) <> '')
check (btrim(collector_version) <> '')
check (btrim(contract_version) <> '')
check (config_fingerprint ~ '^[0-9a-f]{64}$')
check (window_start is null or window_end is null or window_start <= window_end)
check (cursor_in is null or jsonb_typeof(cursor_in) = 'object')
check (cursor_out is null or jsonb_typeof(cursor_out) = 'object')
check (cursor_out is null or status in ('succeeded', 'no_change'))
check (request_attempt_count >= 0)
check (response_manifest_hash is null or response_manifest_hash ~ '^[0-9a-f]{64}$')
check ((response_manifest_hash is null) = (response_manifest_reference is null))
check (response_manifest_reference is null or btrim(response_manifest_reference) <> '')
check (http_status is null or http_status between 100 and 599)
check (response_content_type is null or btrim(response_content_type) <> '')
check (etag is null or btrim(etag) <> '')
check (last_modified is null or btrim(last_modified) <> '')
check (response_bytes is null or response_bytes >= 0)
check (
  items_found >= 0 and items_new >= 0 and items_unchanged >= 0
  and items_changed >= 0 and items_removal_candidates >= 0
  and items_inaccessible >= 0 and items_rejected >= 0
)
check (
  items_found = items_new + items_unchanged + items_changed
    + items_inaccessible + items_rejected
)
check (items_removal_candidates = 0)
check (
  status <> 'no_change'
  or (
    items_new = 0 and items_changed = 0
    and items_removal_candidates = 0
    and items_inaccessible = 0 and items_rejected = 0
  )
)
check (
  status <> 'succeeded'
  or (
    items_inaccessible = 0 and items_rejected = 0
    and items_new + items_changed + items_removal_candidates > 0
  )
)
check (
  status not in ('partial', 'interrupted')
  or items_removal_candidates = 0
)
check (
  status not in ('failed', 'blocked')
  or (
    items_found = 0 and items_new = 0 and items_unchanged = 0
    and items_changed = 0 and items_removal_candidates = 0
    and items_inaccessible = 0 and items_rejected = 0
  )
)
check (
  (status in ('running', 'succeeded', 'no_change'))
  = (error_kind is null and error_code is null and error_message is null)
)
check (num_nonnulls(error_kind, error_code, error_message) in (0, 3))
check (error_kind is null or error_kind in (
  'transport', 'http', 'rate_limit', 'access_policy', 'contract',
  'format', 'size_limit', 'internal', 'interrupted'
))
check (error_code is null or (btrim(error_code) <> '' and length(error_code) <= 128))
check (error_message is null or (btrim(error_message) <> '' and length(error_message) <= 2000))
check (status <> 'interrupted' or error_kind = 'interrupted')
check (status not in ('succeeded', 'no_change') or response_manifest_hash is not null)
check (
  (status = 'running' and handoff_status = 'not_produced')
  or (status = 'succeeded' and handoff_status = 'ready_for_extraction')
  or (status = 'no_change' and handoff_status = 'not_produced')
  or (
    status in ('partial', 'failed', 'blocked', 'interrupted')
    and handoff_status = 'withheld'
  )
)
check (handoff_status <> 'ready_for_extraction' or response_manifest_hash is not null)
check (updated_at >= created_at)
```

A equivalência que exige os três campos de erro nulos nos estados sem erro e os três presentes nos estados de erro é intencional. `partial`, `failed`, `blocked` e `interrupted` precisam de diagnóstico sanitizado; `running`, `succeeded` e `no_change` não guardam erro residual. Avisos pertencem ao manifest, não aos campos de erro.

`no_change` possui cobertura completa por definição do status e, pela equação, `items_found = items_unchanged`, inclusive zero. `succeeded` possui cobertura completa, nenhum inacessível/rejeitado e pelo menos uma mudança observável. O banco garante a aritmética; a aplicação comprova cobertura contra o contrato e o manifest.

### Índices e consultas operacionais

```sql
create index collection_runs_endpoint_started_idx
  on public.collection_runs (source_endpoint_id, started_at desc, id desc);

create index collection_runs_endpoint_completed_idx
  on public.collection_runs (source_endpoint_id, finished_at desc, id desc)
  where status in ('succeeded', 'no_change');

create unique index collection_runs_one_running_per_endpoint_idx
  on public.collection_runs (source_endpoint_id)
  where status = 'running';
```

O primeiro índice atende histórico recente de qualquer resultado. A execução completa mais recente e, portanto, a base para o próximo checkpoint é obtida por:

```sql
select *
from public.collection_runs
where source_endpoint_id = $1
  and status in ('succeeded', 'no_change')
order by finished_at desc, id desc
limit 1;
```

O índice parcial torna essa consulta direta e não mistura execuções parciais ou falhas. O desempate por `id` é determinístico.

O índice único parcial resolve a concorrência no próprio PostgreSQL. Se existir um `running` vencido, a operação deve primeiro fazer uma atualização condicional `running → interrupted`, usando `stale_after_at <= instante_da_reconciliação`; somente depois tenta inserir o novo run. Uma corrida entre iniciadores produz violação de unicidade para um deles, que deve reler o estado, não contornar a constraint.

## O que o banco garante e o que fica na aplicação

| Regra | Banco | Aplicação/coletor |
| --- | --- | --- |
| vocabulários, nullability, formatos básicos e FKs | `CHECK`, `NOT NULL`, FK | — |
| revisão após mudança sensível do endpoint | trigger invalida o timestamp anterior ou exige um estritamente mais novo para continuar `active` | executa a revisão real e fornece seu instante |
| histórico de endpoint `retired` | trigger rejeita qualquer update posterior | cria outro endpoint se surgir um alvo lógico diferente; não reabre nem reescreve o retirado |
| um `running` por endpoint | índice único parcial | reconcilia o vencido antes de tentar novamente |
| terminal nunca reabre nem muda | trigger | trata erro de concorrência sem recriar a mesma linha |
| `finished_at` e relações temporais | constraints | fornece relógio coerente e heartbeat nos limites definidos |
| staleness real | preserva `last_heartbeat_at`/`stale_after_at`; `interrupted` exige fim depois do deadline | decide que o processo morreu e executa a reconciliação |
| cursor só em execução completa | `CHECK` por status | calcula forma, monotonicidade e derivação correta do checkpoint |
| contagens e equação de `items_found` | constraints | deduplica identidades e classifica cada elemento de `F` exatamente uma vez |
| falha de endpoint não vira item inacessível | `failed`/`blocked` exigem todas as contagens zero | escolhe o status e distingue falha de endpoint de falha por item |
| `no_change`/`succeeded` | aritmética e ausência de erros/rejeições | prova cobertura completa pelo manifest |
| manifest verificável | hash/referência em par; hash obrigatório em sucesso completo | grava artefato imutável, verifica existência, recalcula hash e aplica retenção |
| handoff | coerência com status e manifest | só entrega o artefato apontado depois de validá-lo |
| fingerprint de configuração | formato SHA-256 e imutabilidade no run | serialização canônica e cálculo correto sem segredos |
| ausência de segredo | URL sem userinfo, forma fechada do objeto e ausência de DML público | allowlist de headers/parâmetros, inspeção de valores, sanitização de erro e manifest |
| `updated_at` | não anterior a `created_at` | atualiza explicitamente em cada mutação permitida |
| endpoint pertence a source aprovada | FK garante existência | exige status editorial adequado antes da execução |

Não se tentará usar `CHECK` com `now()` para detectar run vencido, validar existência de arquivo externo, comparar o cursor com outras linhas, inspecionar semanticamente um segredo ou provar que todas as páginas esperadas foram processadas. Essas condições dependem de tempo, estado externo ou múltiplas linhas e seriam garantias falsas em uma constraint de linha.

## Segurança, RLS e grants

As duas tabelas terão:

```sql
alter table public.source_endpoints enable row level security;
alter table public.collection_runs enable row level security;

revoke all on table public.source_endpoints, public.collection_runs
  from public, anon, authenticated, service_role;

revoke all on sequence
  public.source_endpoints_id_seq,
  public.collection_runs_id_seq
  from public, anon, authenticated, service_role;
```

Nenhuma policy e nenhum grant serão criados nesta etapa. O proprietário das tabelas e a administração de migrations preservam a capacidade administrativa normal do PostgreSQL; isso não é uma identidade operacional.

Deliberadamente:

- `service_role` não recebe `SELECT`, `INSERT`, `UPDATE`, `DELETE` nem uso de sequence;
- `anon` e `authenticated` não recebem acesso;
- `chargebr_backend_methodology_0001`, seu papel executor e o owner da função `0001` não recebem acesso, direto ou por policy;
- nenhuma role de collector é criada sem runtime e consumidor reais;
- o futuro grant terá de incluir a combinação mínima de `SELECT`/`INSERT`/`UPDATE`, uso de sequence, `REFERENCES` necessário e policies específicas para uma nova identidade de coleta; `DELETE` não é necessário para o fluxo normal.

Assim, a migration estrutural poderá existir antes do collector, mas suas permissões operacionais permanecerão deliberadamente sem consumidor. A primeira migration não deve reutilizar `service_role`, `postgres` ou o login privado `0001` para executar coleta.

## Validação com ABVE e ANEEL

Os exemplos abaixo são registros conceituais; não são inserts nem autorização para persistir dados.

### Endpoint ABVE WordPress paginado

```yaml
source: abve
endpoint_key: abve-news-wordpress-posts
endpoint_url: https://abve.org.br/wp-json/wp/v2/posts
endpoint_type: api
access_method: http_get
response_format: json
status: active
request_config:
  timeout_ms: 30000
  max_response_bytes: 10000000
  query_params:
    categories: 13
    _fields: id,date,modified,slug,link,title,excerpt,content
  headers:
    Accept: application/json
pagination_strategy: page
pagination_config:
  page_parameter: page
  first_page: 1
  page_size_parameter: per_page
  page_size: 100
  max_pages: 5
  total_pages_header: X-WP-TotalPages
  freeze_parameter: before
  freeze_from: run_started_at
cursor_strategy: time_window
cursor_config:
  request_parameter: before
  value_format: rfc3339
  freeze_from: run_started_at
identity_rule:
  version: abve-post-identity-v1
  primary: {fields: [id]}
  fallback: {fields: [link], normalization: canonical-url-v1}
  diagnostic_fields: [modified, slug]
normalization_profile: abve-wordpress-post-v1
removal_policy: none
default_retention_class: minimum_excerpt
```

### Endpoint ANEEL de snapshot integral

```yaml
source: aneel
endpoint_key: aneel-board-meetings-dump
endpoint_url: https://dadosabertos.aneel.gov.br/datastore/dump/43386a8b-4781-44ec-a082-fa7fdfe33186
endpoint_type: snapshot
access_method: http_get
response_format: json
status: active
request_config:
  timeout_ms: 120000
  max_response_bytes: 50000000
  query_params: {format: json}
  headers: {Accept: application/json}
pagination_strategy: none
pagination_config: {}
cursor_strategy: none
cursor_config: {}
identity_rule:
  version: aneel-board-meeting-row-identity-v1
  primary:
    fields: [IdeReuniao, NumOrdem, NumProcesso]
    separator: "\u001f"
  diagnostic_fields: [_id, DatGeracaoConjuntoDados]
normalization_profile: aneel-board-meeting-row-v1
removal_policy: none
default_retention_class: external_reference
```

Os valores de timeout, bytes, páginas e retenção acima demonstram que as colunas comportam os casos; antes de qualquer cadastro real, o preflight deve confirmar os limites e a revisão deve preencher `access_reviewed_at`. Eles não são defaults globais.

### Runs representáveis sem novos campos

| Caso | Estado e contagens | Cursor, manifest, erro e handoff |
| --- | --- | --- |
| ABVE sem mudanças | `no_change`; found 12, unchanged 12, demais 0 | `cursor_out` com a nova janela comprometida; manifest hash/reference; sem erro; `not_produced` |
| ABVE altera um post | `succeeded`; found 12, changed 1, unchanged 11, demais 0 | `cursor_out` comprometido; manifest hash/reference; sem erro; `ready_for_extraction` |
| ANEEL snapshot completo inicial | `succeeded`; found 4.800, new 4.800, demais 0 | `cursor_in/out = null` porque o endpoint não usa checkpoint; manifest hash/reference; `ready_for_extraction` |
| execução parcial | `partial`; found 40, por exemplo unchanged 39 e changed 1; removal 0 | `cursor_out = null`; manifest parcial opcional em par hash/reference; erro `transport`; `withheld` |
| contrato ANEEL inesperado | `blocked`; todas as contagens 0 | `cursor_out = null`; HTTP/metadados podem existir; erro `contract`; `withheld` |
| processo local morre | começa `running` com heartbeat e deadline; pode ter partição provisória comprovada | após `finished_at >= stale_after_at`, update único para `interrupted`, conserva último heartbeat, `cursor_out = null`, removal 0, erro `interrupted`, `withheld` |

Em um snapshot ANEEL completo posterior sem mudanças, `no_change` representa todos os registros como `unchanged`; ausência não produz removal candidate porque `removal_policy = none`. Uma mudança de linha produz `succeeded` com `changed > 0`, sem interpretar a relevância jurídica ou promover conteúdo.

## Riscos e limites remanescentes

1. `config_fingerprint` torna a configuração verificável, mas a reconstrução integral de uma configuração antiga depende do manifest externo; versionamento de configurações em tabela própria continua fora de escopo.
2. Referência e hash não provam no banco que o artefato externo existe. Retenção, armazenamento e verificação do manifest ainda precisam de contrato operacional.
3. JSONB é necessário para parâmetros e checkpoints heterogêneos, mas exige validação de aplicação além dos checks estruturais. Não deve virar escape para novos invariantes importantes.
4. O banco não detecta todos os segredos por conteúdo. Allowlist, revisão e sanitização continuam bloqueios obrigatórios antes de escrever.
5. O índice único impede dois `running`, mas disponibilidade depende de reconciliação correta dos runs vencidos.
6. As triggers de revisão de acesso, imutabilidade de endpoint retirado e transição de runs são parte da garantia e precisam de testes específicos na migration; grants sozinhos não bastam.
7. `public` mantém coerência com o schema atual, mas qualquer exposição futura pela Data API exige decisão e policies próprias. A ausência atual de policies/grants é intencional.
8. Ativar remoção exigirá nova decisão: vocabulário, limiar, evidência, alteração da constraint do endpoint e retirada coordenada do zero obrigatório em runs.
9. Candidatos, requests/páginas, itens por run e decisões de revisão continuam no manifest; não são modelados por estas duas tabelas.
10. O status afirma cobertura completa, mas só a aplicação pode confrontá-la com páginas, headers e contrato do endpoint.

## Critérios de aceite

Esta decisão está pronta para orientar a migration quando a revisão confirmar que:

1. `public`, RLS sem policies e ausência de grants operacionais preservam a fronteira atual sem reutilizar o login `0001`;
2. PKs `bigint identity` e `run_key uuid` possuem papéis distintos e explícitos;
3. todos os campos, tipos, nullability, defaults, FKs e `ON DELETE` estão decididos;
4. vocabulários usam `text + CHECK` e nenhuma migration precisará escolher enums;
5. os seis campos JSONB têm escopo e estrutura definidos sem esconder método, formato, status, retenção ou política de remoção;
6. mudança de `endpoint_url`, `request_config`, `terms_url` ou `robots_url` invalida a revisão anterior e não pode permanecer `active` sem revisão estritamente mais nova;
7. uma linha `retired` é integralmente imutável, inclusive configuração, notas e `updated_at`;
8. `endpoint_url`, `terms_url` e `robots_url` rejeitam userinfo/credenciais;
9. heartbeat, staleness, timestamps, cursor, erro, manifest e handoff possuem invariantes testáveis;
10. terminalidade de runs é imutável por trigger e existe no máximo um `running` por endpoint;
11. a equação de `items_found`, a ortogonalidade conceitual de remoção e as regras por status estão preservadas;
12. `removal_policy = none` e zero removal candidates são garantidos sem inventar política futura;
13. as consultas de histórico recente e último run completo possuem índices próprios;
14. ABVE paginado, ANEEL snapshot, `no_change`, alteração, parcial, bloqueio e reconciliação como `interrupted` cabem no modelo;
15. nenhuma credencial, segredo, dado canônico ou endpoint real foi criado;
16. runtime, backend, hospedagem, candidatos a observations e demais lacunas do PR #95 continuam fora de escopo.

## Próximo passo

Depois do aceite e merge deste PR, **outro agente** deverá criar uma migration separada que implemente exatamente esta decisão, incluindo constraints, índices, triggers, comentários, RLS, revokes e verificações. Esse agente não deve aplicar a migration ao Supabase. Aplicação e ativação de uma identidade de collector permanecem etapas posteriores e separadas.
