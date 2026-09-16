# Collector local runtime v1

## Escopo

Este documento define a arquitetura operacional mínima do collector local v1 do ChargeBR. A única invocação funcional desta versão é:

```text
pnpm collect abve
```

O único adapter executável é `abve`, resolvido por `sources.slug = 'abve'` e `source_endpoints.endpoint_key = 'abve-news-wordpress-posts'`. ANEEL permanece `candidate` e não faz parte da implementação.

O collector é manual/local, determinístico e collection-first. Ele persiste apenas `collection_runs` e uma referência ao manifest local. Não promove conteúdo, não escreve fatos canônicos e não usa AI durante coleta, validação, classificação ou hashing.

Ficam mantidas as decisões anteriores: `removal_policy = none`; retries HTTP pertencem ao mesmo run; uma nova invocação deliberada cria outro run; `partial`, `failed`, `blocked` e `interrupted` não produzem `cursor_out`; somente `succeeded` e `no_change` podem avançar o cursor.

## Estado atual

No commit base `348994684d27dd477b4b4427622a6ce904a4f5eb`, o repositório não possui `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig`, diretório de runtime ou código JavaScript/TypeScript. O scaffold futuro será mínimo: Node.js com TypeScript, ESM e pnpm, sem workspace ou framework genérico de comandos. O PR de implementação deverá fixar versões exatas do Node LTS suportado e do pnpm no momento da implementação, além de versionar o lockfile.

O baseline remoto confirmado é:

- um endpoint ABVE `active` com a chave `abve-news-wordpress-posts`;
- nenhum endpoint ANEEL;
- zero `collection_runs`;
- RLS habilitado em `sources`, `source_endpoints` e `collection_runs`;
- zero policies em `source_endpoints` e `collection_runs`;
- a policy existente de `sources` atende somente a role metodológica e não concede acesso ao collector;
- nenhuma ACL não proprietária nas sequences de `source_endpoints` ou `collection_runs`;
- trigger de lifecycle, FK do endpoint, unicidade de `run_key` e índice único parcial de um `running` por endpoint presentes.

Não existe role `chargebr_collector_0001`, portanto esse nome está disponível e não conflita com as convenções atuais `chargebr_backend_methodology_0001` e `chargebr_methodology_contract_0001_*`.

## CLI

### Comandos aceitos

| Invocação | Resultado |
| --- | --- |
| `pnpm collect abve` | executa o adapter ABVE |
| `pnpm collect --help` ou `pnpm collect -h` | imprime uso curto em `stdout`, não conecta ao banco e sai `0` |
| `pnpm collect aneell` ou qualquer nome desconhecido | erro de uso; nenhum run |
| `pnpm collect aneel` | informa que a source é conhecida, mas indisponível enquanto não houver endpoint `active`; nenhum run |
| `pnpm collect` | imprime uso curto em `stderr`; nenhum run |
| argumentos extras ou qualquer outra flag | erro de uso; nenhum run |

Não são aceitos URL, endpoint ID, credencial, paginação, cursor, limite, arquivo de configuração ou override pela linha de comando. A configuração pública vem do endpoint ativo no banco; secrets vêm exclusivamente do ambiente local.

### Saídas

Durante uma execução, `stdout` recebe somente um resumo JSON compacto ao chegar a um resultado conhecido. O objeto contém `run_key` quando houver, `endpoint_key`, `status`, contagens, bytes, `manifest_reference`, `manifest_hash` e `exit_code`. `--help` é a única saída textual normal em `stdout`.

`stderr` recebe progresso humano e diagnósticos sanitizados: fase atual, página/tentativa, retry, concorrência e erro. Nenhuma saída inclui corpo editorial, senha, token, cookie, connection string ou headers de autenticação.

### Códigos de saída

| Código | Significado |
| --- | --- |
| `0` | `succeeded`, `no_change` ou ajuda |
| `2` | run terminal `partial` |
| `3` | run terminal `failed` |
| `4` | run terminal `blocked` |
| `5` | já existe run `running` não vencido; nenhuma segunda coleta foi criada |
| `64` | uso inválido, sem argumento, source desconhecida, flag ou argumento proibido |
| `69` | source conhecida indisponível ou resolução ABVE não encontra exatamente um endpoint `active`; nenhum run |
| `70` | falha interna ou de banco antes de existir um run auditável |
| `130` | processo recebeu `SIGINT` |
| `143` | processo recebeu `SIGTERM` |

Sinais não forçam uma transição inválida. Se o processo terminar antes de conseguir finalizar o run, a linha permanece `running` e uma invocação posterior a reconcilia como `interrupted` somente depois de `stale_after_at`.

## Resolução do endpoint

O collector nunca fixa `source_endpoint.id = 1`. Depois de validar a CLI e abrir uma conexão com a role dedicada, ele executa uma resolução única e parametrizada por:

```text
source slug = abve
endpoint_key = abve-news-wordpress-posts
```

A consulta deve resultar em exatamente uma source e exatamente um endpoint ligado a ela. O endpoint precisa estar `active`. A linha completa é lida para obter URL, acesso, formato, request, paginação, cursor, identidade, normalização, retenção, termos, robots e revisão de acesso.

Source inexistente ou duplicada, endpoint inexistente ou duplicado e `status != active` encerram a invocação antes de qualquer request HTTP e antes de inserir `collection_runs`. Não existe endpoint confiável para auditar uma coleta nesses casos; o erro é de configuração/resolução, sai com código `69` e não inventa uma FK ou um run artificial.

`aneel` pode aparecer apenas na tabela estática da CLI como source conhecida e indisponível. Ele sai `69` antes de conectar ou criar run; não existe adapter ANEEL na v1.

## Identidade e acesso ao banco

### Role dedicada

A migration futura cria `chargebr_collector_0001` como `LOGIN`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`, `NOBYPASSRLS`, sem participação em roles existentes e com `CONNECTION LIMIT 2`. A role não é proprietária de tabelas, sequences, functions ou schema.

A migration não contém senha. Uma pessoa administradora provisiona e rotaciona a credencial fora do Git, depois da criação da role. O processo local recebe uma única connection string por `CHARGEBR_COLLECTOR_DATABASE_URL`, em secret storage local ou variável de ambiente não versionada, com TLS e verificação de certificado habilitados. A variável nunca aparece em CLI, logs, manifest ou `collection_runs`.

`CHARGEBR_COLLECTOR_INITIATED_BY` é obrigatório, não secreto e identifica a pessoa/processo na coluna `initiated_by`. O valor deve ser curto e não pode conter credencial.

São proibidos `postgres`, `service_role`, `chargebr_backend_methodology_0001`, superuser, `BYPASSRLS` e reutilização de qualquer login privado existente.

### Grants mínimos futuros

Além de `CONNECT` no banco e `USAGE` no schema `public`, a role recebe somente:

| Objeto | Privilégio | Finalidade |
| --- | --- | --- |
| `public.sources` | `SELECT (id, slug)` | resolver a source ABVE |
| `public.source_endpoints` | `SELECT` | resolver e carregar o contrato público completo do endpoint |
| `public.collection_runs` | `SELECT` | concorrência, stale reconciliation, cursor e manifest anterior |
| `public.collection_runs` | `INSERT` apenas nas colunas de identidade/início do run | criar uma linha `running` |
| `public.collection_runs` | `UPDATE` apenas nas colunas mutáveis abaixo | heartbeat, fotografia terminal e stale reconciliation |
| `public.collection_runs_id_seq` | `USAGE` | gerar o identity de `collection_runs` |

As colunas permitidas no `INSERT` são: `source_endpoint_id`, `run_key`, `started_at`, `last_heartbeat_at`, `stale_after_at`, `initiated_by`, `collector_name`, `collector_version`, `contract_version`, `config_fingerprint`, `window_start`, `window_end` e `cursor_in`. `status = running` e `trigger_kind = manual_local` usam os defaults protegidos pela trigger.

As colunas permitidas no `UPDATE` são: `status`, `finished_at`, `last_heartbeat_at`, `stale_after_at`, `cursor_out`, `request_attempt_count`, `response_manifest_hash`, `response_manifest_reference`, `http_status`, `response_content_type`, `etag`, `last_modified`, `response_bytes`, todas as contagens `items_*`, `error_kind`, `error_code`, `error_message`, `handoff_status` e `updated_at`.

Não há `DELETE`, `TRUNCATE`, `REFERENCES`, `TRIGGER`, `MAINTAIN`, ownership, `CREATE` no schema, privilégio em `source_endpoints_id_seq` nem privilégio em outras sequences. `INSERT ... RETURNING id` usa o privilégio da tabela; `USAGE` é suficiente para a identity sequence. As trigger functions são executadas automaticamente e não exigem `EXECUTE` concedido ao collector.

O collector não recebe escrita em `sources`, `source_endpoints`, `content_items`, `observations`, `evidence`, `events`, `organizations`, tabelas de métricas ou instrumentos regulatórios. Ele não recebe leitura dessas tabelas canônicas além das colunas declaradas de `sources`.

### Policies RLS futuras

As policies são específicas para `TO chargebr_collector_0001`; não usam `PUBLIC`, `anon`, `authenticated` ou `service_role`.

1. `sources`, `FOR SELECT`: `USING (slug = 'abve')`.
2. `source_endpoints`, `FOR SELECT`: permite somente a linha cuja `endpoint_key = 'abve-news-wordpress-posts'` e cujo `source_id` resolve para a source `abve`. A policy não filtra `status`, para que o processo consiga distinguir endpoint ausente de endpoint não ativo; a aplicação exige `active` antes do run.
3. `collection_runs`, `FOR SELECT`: permite apenas runs cujo `source_endpoint_id` corresponde ao endpoint ABVE permitido.
4. `collection_runs`, `FOR INSERT`: `WITH CHECK` restringe ao endpoint ABVE permitido e exige `status = 'running'` e `trigger_kind = 'manual_local'`.
5. `collection_runs`, `FOR UPDATE`: `USING` e `WITH CHECK` repetem a restrição ao endpoint ABVE. Grants por coluna, constraints e a trigger continuam protegendo identidade, transições e imutabilidade terminal.

Os predicados relacionais usam `EXISTS` sobre as duas tabelas já liberadas para leitura da mesma role e não hardcodeiam IDs. Não é necessária function `SECURITY DEFINER`, portanto não há novo `EXECUTE`. Policies existentes de outras roles permanecem inalteradas.

## Lifecycle de collection_runs

Uma execução normal segue exatamente esta ordem:

1. validar CLI e variáveis locais obrigatórias;
2. conectar como `chargebr_collector_0001`;
3. resolver exatamente uma source `abve` e um endpoint `abve-news-wordpress-posts` ativo;
4. capturar um único `reconciliation_at` UTC e tratar eventual run `running` do endpoint;
5. ler o run completo mais recente, limitado a `succeeded`/`no_change`, para obter `cursor_in` e o manifest anterior;
6. capturar uma única vez `run_started_at` UTC e derivar `window_start`, `window_end` e o freeze `before`;
7. construir a configuração pública efetiva e calcular `config_fingerprint`;
8. gerar `run_key` UUID v4;
9. inserir `collection_runs` em `running` numa transação curta e confirmar o commit;
10. criar o diretório local do run e executar as páginas HTTP, retries, validação, normalização, classificação e heartbeat sem manter transação aberta;
11. escrever e renomear atomicamente o manifest, calcular seu hash e só então preparar a fotografia terminal;
12. fazer uma única transição terminal em transação curta, respeitando todas as constraints;
13. emitir o resumo JSON e sair com o código correspondente.

As queries de heartbeat e a transição terminal são updates condicionais com `WHERE id = $run_id AND status = 'running'`. Zero linhas atualizadas significa corrida ou estado inesperado e deve interromper o processo; nunca se faz update cego ou reabertura de terminal.

### Heartbeat

O lease v1 é de cinco minutos. Cada heartbeat usa um instante UTC capturado pelo processo e grava:

```text
last_heartbeat_at = heartbeat_at
stale_after_at = heartbeat_at + 5 minutes
updated_at = heartbeat_at
```

Há heartbeat antes e depois de cada tentativa HTTP, antes e depois de uma espera de retry, antes e depois da escrita final do manifest e antes da transição terminal. Cada update é uma transação curta; nenhuma transação permanece aberta durante rede, backoff, parsing ou escrita de arquivo.

### Estados terminais ABVE

| Estado | Situações concretas |
| --- | --- |
| `succeeded` | cobertura planejada completa, manifest válido, zero inacessíveis/rejeitados e pelo menos um item `new` ou `changed` |
| `no_change` | cobertura planejada completa, manifest válido e todos os itens válidos `unchanged`, inclusive conjunto vazio |
| `partial` | páginas válidas seguidas de falha; `max_pages` antes da fronteira anterior; mudança incompatível de totais; identidade repetida entre páginas; lacuna observável; ou rejeição/inacessibilidade por item após saída válida |
| `failed` | nenhuma saída utilizável após esgotar retry de timeout, desconexão, `408`, `425`, `429` ou `5xx`; ou falha operacional transitória sem itens válidos |
| `blocked` | autenticação inesperada, `400`, `401`, `403`, `404`, `410`, violação de acesso, formato/schema global inesperado, JSON inválido, resposta acima do limite ou configuração incompatível |
| `interrupted` | um processo anterior parou de emitir heartbeat, venceu `stale_after_at` e foi encerrado condicionalmente por uma invocação posterior |

`failed` e `blocked` armazenam contagens zero, como exigem as constraints. `partial` preserva somente resultados comprovados e nunca produz candidato de remoção. `items_removal_candidates` é sempre zero.

`handoff_status` é `ready_for_extraction` somente em `succeeded`; é `not_produced` em `running`/`no_change` e `withheld` nos demais terminais. Manifest e hash são obrigatórios em `succeeded`/`no_change`; para outros estados são persistidos juntos apenas quando existe um artefato sanitizado e verificável.

## Concorrência e stale runs

Antes de inserir, o collector procura o único `running` permitido pelo índice parcial:

- se `stale_after_at > reconciliation_at`, relê e reporta o run existente, não cria outro run, não faz HTTP e sai `5`;
- se `stale_after_at <= reconciliation_at`, faz um update condicional por `id`, `status = running` e prazo vencido;
- se outra sessão alterar a linha primeiro, relê o estado e decide novamente sem update cego;
- depois da reconciliação, tenta criar um novo run com novo `run_key`.

O update de reconciliação define `status = interrupted`, `finished_at = reconciliation_at`, `updated_at = reconciliation_at`, `error_kind = interrupted`, `error_code = stale_run_reconciled`, mensagem sanitizada, `cursor_out = null` e `handoff_status = withheld`. Ele preserva `last_heartbeat_at`, `stale_after_at`, inputs imutáveis, contagens, hashes e referências que já possam ser comprovados.

Uma violação de unicidade de `collection_runs_one_running_per_endpoint_idx` durante o insert é concorrência normal: o perdedor relê o run vencedor e sai `5`. Não há Redis, advisory lock, lock de arquivo ou transação mantida durante HTTP.

## HTTP/retry

Cada página usa a URL e os parâmetros públicos do endpoint, com `before` congelado, `per_page = 50`, no máximo duas páginas e limite de 2.000.000 bytes por resposta. O timeout de cada tentativa é 30.000 ms. Cada página admite no máximo três tentativas dentro do mesmo `collection_run`.

Recebem retry: timeout, desconexão, `408`, `425`, `429` e `5xx`. O backoff local usa 1 segundo antes da segunda tentativa e 2 segundos antes da terceira, com full jitter uniforme entre zero e o valor-base. `Retry-After`, em segundos ou data HTTP válida, substitui o backoff quando resultar em espera de até 240 segundos. Valor maior encerra o run como `failed`/`rate_limit`; o lease de cinco minutos não pode ser ultrapassado por uma única espera mais a tentativa seguinte.

Não recebem retry cego: `400`, `401`, `403`, `404`, `410`, violação de policy/robots/termos, content type ou JSON inesperado, resposta acima do limite, schema inválido e falha de validação. O runtime registra tentativa, heartbeat e erro sanitizado e aplica o estado terminal definido acima.

Todos os retries da página incrementam `request_attempt_count`. Um retry bem-sucedido substitui somente o resultado final daquela página no payload determinístico; o histórico de tentativas permanece no envelope operacional do manifest.

## Manifest v1

O arquivo `manifest.v1.json` possui duas partes:

1. `envelope`: auditoria operacional variável;
2. `payload`: evidência determinística ordenada usada em `response_manifest_hash`.

O manifest contém, no mínimo:

```text
manifest_version = chargebr-collection-manifest-v1
run_key
endpoint_key
collector_name
collector_version
contract_version
config_fingerprint
started_at
window = {start, end, freeze_before}
requests[]
items[]
aggregate_counts
```

Cada request registra página, URL sanitizada com query pública em ordem canônica, `attempt_count`, status HTTP final, content type, bytes, headers relevantes permitidos e SHA-256 dos bytes brutos da resposta válida. O envelope também pode guardar durations e os resultados sanitizados das tentativas.

Cada item registra identidade nativa (`id`), URL canônica, content fingerprint e exatamente uma classificação: `new`, `unchanged`, `changed`, `inaccessible` ou `rejected`. Itens são ordenados pela representação canônica da identidade; requests são ordenados por página. Contagens agregadas derivam dessas listas, nunca de acumuladores independentes.

No bootstrap, sem manifest completo anterior, todo item válido é `new` no sentido operacional de candidato. Nos runs seguintes, a classificação compara identidade e fingerprint com o manifest do último `succeeded`/`no_change`. Ausência desse artefato, hash divergente ou versão incompatível bloqueia a classificação; não se relabela tudo como novo. Essas classes não afirmam persistência canônica porque `content_items` ainda não é lido ou escrito.

O bootstrap declara uma amostra completa de até 100 posts anteriores ao freeze; ele não afirma cobertura do arquivo histórico. Runs posteriores precisam cruzar a fronteira anterior antes de `max_pages`, conforme definido em Cursor ABVE.

Nenhum manifest contém secrets, headers `Authorization`, `Cookie` ou `Set-Cookie`, connection string, stack sensível ou corpo integral de notícia. `title`, `excerpt` e `content` integrais não são copiados para o manifest.

## Artefatos locais

Todos os artefatos ficam em:

```text
.chargebr/collection-runs/<run_key>/
```

Essa convenção não conflita com paths versionados existentes. O futuro scaffold adiciona `.chargebr/` ao `.gitignore`; o diretório nunca é versionado, não contém secrets e pode ser apagado deliberadamente pela pessoa operadora.

O artefato permanente do run é `manifest.v1.json`. Durante cada request, body e headers brutos usam nomes `.part` dentro do mesmo diretório. O body é limitado enquanto chega, hasheado antes do parsing, processado localmente e apagado depois que a evidência mínima foi incorporada ao manifest. O HTML editorial integral não permanece como artefato padrão.

O manifest é escrito em `manifest.v1.json.part`, sincronizado e renomeado atomicamente para `manifest.v1.json`. Somente depois do rename o banco recebe `response_manifest_hash` e:

```text
local:.chargebr/collection-runs/<run_key>/manifest.v1.json
```

como `response_manifest_reference`. Em erro, arquivos `.part` são apagados em best effort; um manifest sanitizado de falha pode ser preservado e referenciado se completar escrita e hash. A limpeza nunca apaga automaticamente manifests concluídos. Se a pessoa apagar `.chargebr`, os `collection_runs` continuam auditáveis, mas a referência local deixa de ser recuperável e um run futuro dependente daquele baseline deve bloquear, não inferir conteúdo.

## Determinismo e hashes

Todos os hashes usam SHA-256 e hexadecimal minúsculo sobre bytes UTF-8.

`chargebr-canonical-json-v1` serializa objetos com chaves em ordem lexicográfica, arrays na ordem declarada, sem whitespace extra e com valores primitivos JSON. Instantes entram em RFC 3339 UTC com `Z`. Essa regra vale para todos os adapters; nenhuma implementação pode trocar algoritmo silenciosamente.

### `config_fingerprint`

É o SHA-256 do JSON canônico contendo: `contract_version`, source slug, endpoint key, URL, tipo, método, formato, status, `request_config`, estratégias/configurações de paginação e cursor, `identity_rule`, `normalization_profile`, `removal_policy`, classe de retenção, `terms_url` e `robots_url`.

Ficam de fora IDs internos, timestamps de auditoria, `access_reviewed_at`, notes, `suggested_interval`, credenciais e qualquer valor do run. `collector_version` possui coluna própria.

### Raw response hash

É o SHA-256 dos bytes exatos do body HTTP completo de uma resposta válida, antes de parsing, normalização ou conversão de newline. Resposta incompleta não recebe raw hash de sucesso.

### Normalized content fingerprint

O perfil `abve-wordpress-post-v1` produz um objeto de chaves fixas com `date`, `modified`, `slug`, URL canônica, `title.rendered`, `excerpt.rendered`, `excerpt.protected`, `content.rendered` e `content.protected`. A identidade `id` permanece separada.

Strings normalizam CRLF/CR para LF e Unicode para NFC. O HTML é preservado como string: não se removem tags, scripts, atributos, entidades ou whitespace interno nesta versão. O objeto é serializado por `chargebr-canonical-json-v1` e então hasheado. Mudança de regra exige novo `normalization_profile`.

`canonical-url-v1` exige HTTPS, põe scheme e host em minúsculas, remove porta padrão e fragmento, normaliza path vazio para `/`, remove barra final fora da raiz e descarta somente `utm_*`, `fbclid` e `gclid`. Demais query params são preservados e ordenados por nome/valor, inclusive repetições.

### `response_manifest_hash`

É o SHA-256 de uma projeção canônica do `payload` contendo versões/contrato/configuração, endpoint, window/freeze, resultado final de cada página, raw hashes, itens ordenados e contagens derivadas.

Não participam: `run_key`, horários de request/manifest, duração, path local, número de tentativas, backoff/jitter, mensagens de log e headers voláteis como `Date`, `Server`, `Set-Cookie`, IDs de request ou CDN. Participam apenas headers de evidência estável quando presentes: `Content-Type`, `Content-Length`, `ETag`, `Last-Modified`, `X-WP-Total`, `X-WP-TotalPages` e `Link` sanitizado.

Assim, o arquivo conserva auditoria variável, mas o hash comparável cobre apenas evidência determinística. Mesma fixture, configuração, window e versão produzem os mesmos fingerprints e `response_manifest_hash`.

## Cursor ABVE

O cursor versionado é:

```json
{"version":"abve-time-window-v1","before":"<RFC3339 UTC>"}
```

No bootstrap, `cursor_in = null`, `window_start = null` e `window_end = run_started_at`. O freeze enviado em todas as páginas é `before = run_started_at`. Processar as duas páginas de 50 itens conclui a amostra bootstrap declarada, mesmo que exista arquivo histórico mais antigo; isso não é alegação de cobertura retroativa.

Em run posterior, `cursor_in` é o `cursor_out` do run completo mais recente, `window_start = cursor_in.before` e `window_end = run_started_at`. O collector processa em `date desc` e considera cruzada a fronteira anterior apenas quando encontra item com `date` estritamente anterior a `cursor_in.before`. Item exatamente na fronteira não é descartado, pois o `before` do run anterior era exclusivo.

Quando a cobertura planejada é completa, `cursor_out` copia a estrutura acima com `before = run_started_at`. `cursor_out` só é gravado na mesma transição terminal para `succeeded` ou `no_change`.

Mudança de `X-WP-Total`/`X-WP-TotalPages` entre páginas, identidade duplicada entre páginas, lacuna observável, resposta mutante incompatível ou `max_pages = 2` antes de cruzar a fronteira torna o run `partial`, preserva `cursor_in` e deixa `cursor_out = null`. `before` reduz deslocamento por novas publicações, mas não cria snapshot, não cobre sozinho edições antigas e não autoriza inferência de remoção.

## Erros e sanitização

`error_kind` usa somente o vocabulário do banco:

| Kind | Exemplos de code |
| --- | --- |
| `transport` | `connect_timeout`, `read_timeout`, `dns_error`, `tls_error`, `connection_reset` |
| `http` | `http_400`, `http_404`, `http_410`, `http_5xx_exhausted` |
| `rate_limit` | `http_429_exhausted`, `retry_after_too_long` |
| `access_policy` | `authentication_required`, `robots_restricted`, `terms_changed` |
| `contract` | `endpoint_not_active`, `schema_mismatch`, `pagination_inconsistent`, `prior_manifest_unavailable` |
| `format` | `content_type_unexpected`, `json_invalid` |
| `size_limit` | `response_too_large` |
| `internal` | `database_error`, `filesystem_error`, `manifest_write_error`, `unexpected_error` |
| `interrupted` | `stale_run_reconciled` |

`error_code` é estável, minúsculo, sem dados externos e menor que 128 caracteres. `error_message` é uma frase operacional de até 2.000 caracteres depois de remover control characters, userinfo, query não aprovada, connection strings, valores de ambiente, tokens, cookies, corpos e headers sensíveis.

Status, host, path público, página, tentativa, byte count e nome da validação podem aparecer. Response body, stack e erro cru do driver não entram no banco; detalhes locais só aparecem em `stderr` depois da mesma sanitização.

## Segurança

- uma role dedicada com RLS é a única identidade do collector;
- conexão administrativa nunca é fallback;
- toda query usa parâmetros; URL resulta somente do contrato público validado;
- redirects são limitados e cada destino precisa permanecer HTTPS, sem userinfo ou credencial;
- timeout, limite de bytes, `max_pages` e retry são obrigatórios;
- arquivos locais usam permissões restritas ao usuário e nomes derivados somente de UUID validado;
- bodies temporários são apagados e não são promovidos a retenção integral;
- nenhum segredo entra em config fingerprint, hash, manifest, stdout, stderr ou banco;
- nenhuma transação de banco permanece aberta durante I/O externo;
- nenhuma tabela canônica recebe escrita, e `DELETE` nunca é concedido;
- mudança de configuração sensível ou acesso bloqueado exige nova revisão, não workaround.

## Critérios de aceite

A implementação futura só está pronta quando testes locais e de integração provarem:

1. `pnpm collect abve` é a única coleta funcional e a CLI rejeita todos os demais argumentos definidos;
2. a conexão usa `chargebr_collector_0001` e falha fechada se a credencial dedicada não estiver disponível;
3. a resolução usa slug/chave, exige exatamente um endpoint `active` e nunca fixa ID;
4. erros de resolução não criam run nem fazem HTTP;
5. todo run é inserido `running`, recebe heartbeat e faz no máximo uma transição terminal;
6. endpoint concorrente não cria segunda coleta e corrida de insert é resolvida por releitura;
7. stale run é interrompido por update condicional no instante explícito, preservando heartbeat e anulando cursor;
8. retries permanecem no mesmo run e seguem a matriz e os limites deste documento;
9. manifest, canonical JSON e quatro tipos de hash/fingerprint produzem resultados determinísticos em fixtures repetidas;
10. bodies integrais são transitórios, `.chargebr/` está ignorado e nenhum secret aparece nos artefatos;
11. `succeeded`, `no_change`, `partial`, `failed`, `blocked` e `interrupted` satisfazem constraints, contagens, erro e handoff;
12. somente run completo grava `cursor_out`, e as condições de instabilidade ABVE produzem `partial`;
13. a role consegue somente os reads/writes declarados, RLS limita tudo ao endpoint ABVE e tentativas de `DELETE` ou acesso canônico falham;
14. a única persistência remota é `collection_runs`; `content_items`, `observations` e `evidence` permanecem intocados;
15. nenhum teste ou ensaio chama ANEEL enquanto não houver decisão separada de promoção.

## Plano de implementação

Os próximos trabalhos são PRs separados e não fazem parte desta decisão:

### A. Identidade, grants e RLS do collector

Migration isolada que cria `chargebr_collector_0001` sem senha versionada, aplica grants por objeto/coluna, policies específicas do ABVE e testes negativos de least privilege. O provisionamento da senha ocorre fora do Git.

### B. Scaffold CLI/runtime e manifest

Cria o scaffold Node.js/TypeScript ESM com pnpm e lockfile, fixa versões, adiciona `.chargebr/` ao `.gitignore`, implementa parser mínimo, config pública, canonical JSON, hashes, escrita atômica e fixtures offline. Não faz HTTP real nem grava banco.

### C. Adapter HTTP ABVE e classificação determinística

Implementa URL/paginação/freeze, limites, retry, validação dos oito campos, identidade/fallback, normalização, fingerprints, comparação de manifests e estados agregados usando fixtures. Não escreve tabelas canônicas.

### D. Integração com collection_runs

Implementa resolução slug/chave, insert, heartbeat, transição terminal, concorrência, stale reconciliation, cursor e persistência de hash/referência sob a role dedicada. Testa todas as constraints e RLS.

### E. Ensaio manual ABVE controlado

Executa uma única coleta manual revisada com `pnpm collect abve`, comprova manifest, contagens, cursor e least privilege e entrega relatório. Não cria `content_items`, `observations`, `evidence` nem adapter ANEEL.

## Fora de escopo

- implementação, pacote, dependência, migration, role, grant ou policy nesta tarefa;
- scheduler, cloud, fila, API, frontend ou backend;
- collector ANEEL enquanto o endpoint for `candidate`;
- AI na coleta determinística;
- criação ou alteração de source/endpoint;
- escrita em `content_items`, `observations`, `evidence`, eventos, métricas, organizações ou instrumentos regulatórios;
- extração, relevância, confirmação factual, revisão humana ou promoção canônica;
- remoção automática, arquivo histórico completo da ABVE ou garantia de snapshot;
- coleta HTTP ou criação de `collection_runs` durante esta decisão.
