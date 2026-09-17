# Preflight do source endpoint ABVE WordPress Noticias

## Estado e escopo

`DECISAO DE ACESSO — APROVADO COMO ACTIVE`

Este documento registra o preflight feito em 16 de setembro de 2026 para o primeiro `source_endpoint` real do ChargeBR. A verificacao foi somente de leitura, com uma amostra pequena da API publica da ABVE. Nenhum endpoint, `collection_run`, item canonico, credencial, grant ou policy foi criado ou alterado.

Foram respeitadas as decisoes de `docs/fundacao-pipeline-coleta-v1.md`, `docs/modelagem-source-endpoints-collection-runs-v1.md` e da migration `20260916083548_source_endpoints_collection_runs_v1.sql`. A source existente tambem foi conferida: `sources.slug = 'abve'` identifica uma fonte `approved`, primaria, brasileira, em `pt-BR`, com homepage `https://abve.org.br`. O futuro cadastro deve resolver essa linha pelo slug, nunca fixar o `id` observado em um ambiente.

O instante de congelamento usado nas consultas originais de posts foi `2026-09-16T09:09:35Z`. A revisao original de acesso foi concluida em `2026-09-16T09:12:35Z`; a projecao corrigida de nove campos foi revalidada em `2026-09-17T21:05:11Z`.

## Contrato observado

| Aspecto | Resultado do preflight |
| --- | --- |
| URL base | `https://abve.org.br/wp-json/wp/v2/posts` |
| Categoria | `13`, nome `Noticias`, slug `noticias`, arquivo `https://abve.org.br/category/noticias/` |
| Metodo e autenticacao | `GET` publico, sem autenticacao; o servidor anunciou `Allow: GET` |
| Status e tipo | `200`; `application/json; charset=UTF-8` nas consultas validas |
| Pagina | `page`, primeira pagina `1`; `page=2` retornou o item seguinte e links `prev`/`next` |
| Tamanho de pagina | `per_page`; faixa aceita de `1` a `100` |
| Maximo confirmado | `100`; `101` retornou `400 rest_invalid_param` e informou o limite inclusivo `1..100` |
| Headers de paginacao | `X-WP-Total`, `X-WP-TotalPages` e `Link`; tambem foram anunciados em `Access-Control-Expose-Headers` |
| Ordenacao | padrao WordPress: `date desc`; o registro proposto a torna explicita com `orderby=date&order=desc` |
| `before` | filtra pela data de publicacao, com limite superior exclusivo |
| Formato de `before` | data ISO 8601; o coletor deve serializar `run_started_at` em RFC 3339 com fuso explicito, preferencialmente UTC `Z` |
| `_fields` | contrato corrigido: `id,date,date_gmt,modified,slug,link,title,excerpt,content` |
| Identidade | `id` inteiro, nativo e somente leitura no contrato WordPress; 100 IDs distintos em 100 itens |
| Campos requeridos | os nove campos projetados são obrigatórios; `date_gmt` é necessário para cobertura temporal |
| Forma do texto | `title`, `excerpt` e `content` sao objetos; o texto/HTML fica em `rendered`, e `excerpt`/`content` tambem expuseram `protected` |
| Volume observado | evidencia historica pre-`date_gmt`: 674.245 bytes para 100 posts com os oito campos; `283` posts e `3` paginas nessa consulta |
| Rate limit | nenhum header de quota, `Retry-After` ou limite publicado foi identificado; isso nao equivale a ausencia garantida de rate limit |
| Validators HTTP | `ETag` e `Last-Modified` nao foram observados nas respostas JSON amostradas |

A consulta temporal observada usou o wall-clock `date` do post mais recente, `2026-09-15T10:08:37`, com o offset conhecido do site `-03:00`. O contrato corrigido não deriva esse offset nem acrescenta `Z` a `date`: `date` permanece o wall-clock de publicação no timezone configurado do site, enquanto `date_gmt` é o instante de publicação em UTC e o único campo comparado à fronteira do cursor. O total caiu de `283` para `282`, o post `id = 19701` saiu da resposta e `id = 19690` passou a ser o primeiro resultado. Esse mesmo `id`, slug e link ja haviam aparecido na segunda pagina de uma consulta independente, o que fornece evidencia pratica de estabilidade da identidade entre combinacoes diferentes de `page`, `per_page` e `before`. O preflight nao transforma essa observacao curta em garantia perpetua; por isso `link` normalizado permanece como fallback.

As referencias de comportamento do CMS sao o [contrato de posts do WordPress](https://developer.wordpress.org/rest-api/reference/posts/), a [documentacao de paginacao](https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/) e o [parametro global `_fields`](https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_fields). A evidencia decisiva para este cadastro, contudo, foi a resposta atual do dominio da ABVE.

## Janela congelada

`before = run_started_at` e paginacao por `page` formam uma janela superior coerente, mas nao um snapshot transacional.

O comportamento confirmado e importante e:

- `before` e exclusivo e atua sobre `date`, nao sobre `modified`;
- novos posts publicados normalmente depois de `run_started_at` ficam fora da listagem e, portanto, deixam de empurrar as paginas da janela corrente;
- todas as paginas de um run precisam reutilizar exatamente o mesmo valor de `before`, a mesma ordenacao e o mesmo tamanho de pagina;
- o valor de `before` deve ter fuso explicito e representa um instante RFC 3339 UTC;
- `date` e o wall-clock de publicacao no timezone configurado do site; ele nao deve receber `Z` nem ser reinterpretado como UTC;
- `date_gmt` e o instante de publicacao em UTC e o campo obrigatorio usado para cobertura. Quando vier sem sufixo, `2026-09-17T13:00:00` significa `2026-09-17T13:00:00Z` somente pela semantica de `date_gmt`; essa regra nao se aplica a `date` ou `modified`;
- edicao de um post ja publicado pode mudar `modified`, `title`, `excerpt` ou `content` durante o run sem mudar sua posicao por `date`;
- insercao retrodatada, despublicacao ou exclusao durante o run ainda pode deslocar paginas; empates em `date` tambem nao oferecem um desempate composto declarado pela API.

Assim, a janela e deterministica apenas sob a condicao operacional de que a colecao nao sofra essas mutacoes durante as poucas requisicoes do run. O coletor futuro deve deduplicar por `id`, comparar `X-WP-Total`/`X-WP-TotalPages` entre paginas e reter os metadados de cada resposta no manifest. Mudanca de totais, identidade repetida em paginas diferentes, lacuna observavel ou alcance de `max_pages` antes da fronteira planejada torna o run `partial`, preserva `cursor_in` e deixa `cursor_out` nulo.

Ha ainda uma limitacao do cursor aprovado que nao deve ser escondida: `before` congela somente o teto por data de publicacao. Ele nao descobre sozinho edicoes antigas ordenadas por `date` e nao fornece isolamento contra mutacao. O `cursor_strategy = time_window` permanece o decidido pela arquitetura, mas o futuro coletor nao podera alegar cobertura incremental integral de alteracoes fora da amostra paginada. Resolver isso exigiria outra decisao; este preflight nao muda o modelo.

O bootstrap manual deve declarar sua amostra: no maximo os 100 posts mais recentes anteriores ao instante congelado. Ele nao representa varredura do arquivo nem autoriza inferencia de remocao. Nos runs seguintes, a fronteira anterior pode ser usada para encerrar a amostra somente se for alcancada antes do limite de paginas; a comparacao e `date_gmt < cursor_in.before`. Igualdade nao cruza a fronteira e nao descarta o item. Caso contrario, o run e incompleto e nao avanca o checkpoint.

Exemplo de regressao: `date = 2026-09-17T10:00:00`, `date_gmt = 2026-09-17T13:00:00` e `cursor_in.before = 2026-09-17T12:00:00Z`. O resultado correto e `13:00Z < 12:00Z = false`, portanto a fronteira nao foi cruzada. A interpretacao antiga `date + "Z"` produziria incorretamente `10:00Z < 12:00Z = true`.

## Retencao

`minimum_excerpt` continua correto. A API entrega o corpo editorial integral em `content.rendered`, mas a politica do ChargeBR nao arquiva integralmente conteudo editorial por padrao. O corpo pode ser processado transitoriamente para normalizacao, fingerprint e extracao; a persistencia padrao deve se limitar a metadados, referencia externa e excerto minimo necessario a revisao e proveniencia.

A pagina oficial da ABVE declara “Todos os direitos reservados” e nao foi identificada licenca aberta para as noticias. A politica de privacidade/uso nao concede licenca de republicacao nem constitui termos formais do endpoint ou do conteudo; por isso ela permanece como evidencia revisada, mas nao preenche `terms_url`. Isso reforca `minimum_excerpt`, sem transformar este preflight em parecer juridico.

## Registro completo proposto

O futuro insert deve resolver `source_id` de forma unica por:

```sql
select id
from public.sources
where slug = 'abve';
```

Registro proposto, sem incluir `id`, `created_at` e `updated_at`, que permanecem gerados pelo banco:

```yaml
source_id: "resolver por public.sources.slug = 'abve'"
endpoint_key: abve-news-wordpress-posts
name: "ABVE — Noticias via WordPress REST API"
endpoint_url: https://abve.org.br/wp-json/wp/v2/posts
endpoint_type: api
access_method: http_get
response_format: json
status: active
request_config:
  timeout_ms: 30000
  max_response_bytes: 2000000
  query_params:
    categories: 13
    context: view
    orderby: date
    order: desc
    _fields: id,date,date_gmt,modified,slug,link,title,excerpt,content
  headers:
    Accept: application/json
pagination_strategy: page
pagination_config:
  page_parameter: page
  first_page: 1
  page_size_parameter: per_page
  page_size: 50
  max_pages: 2
  total_pages_header: X-WP-TotalPages
  freeze_parameter: before
  freeze_from: run_started_at
cursor_strategy: time_window
cursor_config:
  request_parameter: before
  value_format: rfc3339
  freeze_from: run_started_at
  boundary_field: date_gmt
identity_rule:
  version: abve-post-identity-v1
  primary:
    fields: [id]
  fallback:
    fields: [link]
    normalization: canonical-url-v1
  diagnostic_fields: [modified, slug]
normalization_profile: abve-wordpress-post-v1
removal_policy: none
suggested_interval: "7 days"
default_retention_class: minimum_excerpt
terms_url: null
robots_url: https://abve.org.br/robots.txt
access_reviewed_at: 2026-09-17T21:05:11Z
notes: >-
  Endpoint publico do WordPress para posts da categoria Noticias (13).
  A revisao confirmou GET sem autenticacao, paginacao e campos projetados.
  `before` e um teto exclusivo sobre a data de publicacao e nao cria snapshot:
  edicoes, retrodatacao, despublicacao ou exclusao durante o run podem alterar
  conteudo ou deslocar paginas. Deduplicar por id, registrar headers por pagina
  e nao comprometer cursor quando a cobertura planejada nao terminar.
  A pagina https://abve.org.br/politica-de-privacidade/ foi revisada como
  evidencia oficial de privacidade, cookies, uso geral e reserva de direitos,
  mas nao constitui termos especificos da API nem licenca de republicacao;
  por isso terms_url permanece nulo.
  Nao ha SLA ou rate limit publicado identificado. Coleta inicial manual,
  conservadora e sem inferencia de remocao.
```

Os limites sao operacionais, nao copias do exemplo de modelagem:

- `timeout_ms = 30000`: as respostas observadas terminaram em aproximadamente 3,4 a 8 segundos no ambiente do preflight; 30 segundos oferece margem para variacao sem permitir espera longa por request;
- `max_response_bytes = 2000000`: a resposta mais larga, com 100 posts e corpo, teve 674.245 bytes. O limite e quase tres vezes esse pior caso observado e deve bloquear crescimento anormal; nao e permissao para reter o corpo;
- `page_size = 50`: fica abaixo do maximo de 100 e reduz o impacto e o tamanho de cada resposta;
- `max_pages = 2`: limita cada run a 100 posts e duas requisicoes de dados. A amostra de 100 observada cobria de 18 de fevereiro de 2025 a 15 de setembro de 2026, folga muito superior ao intervalo semanal. Se duas paginas nao alcancarem a fronteira logica do run, o resultado e parcial;
- `suggested_interval = 7 days`: e uma orientacao conservadora para execucao manual. A amostra recente mostrou 100 posts em cerca de 19 meses, muito abaixo da capacidade de 100 itens por run; o valor nao cria agenda nem autoriza polling automatico.

## Evidencias verificadas

### Evidencia historica pre-`date_gmt`

As dez evidencias abaixo pertencem ao preflight de `2026-09-16T09:12:35Z` e validam somente a projecao anterior de oito campos. Elas nao validam, isoladamente, o contrato corrigido de nove campos.

1. `GET /wp-json/wp/v2/categories/13` retornou `200`, JSON e `{id: 13, name: "Noticias", slug: "noticias", count: 283}`.
2. A pagina de 100 posts congelada retornou `200`, JSON, `X-WP-Total: 283`, `X-WP-TotalPages: 3` e `Link` para a pagina 2.
3. Os 100 itens tinham IDs inteiros e distintos; nenhum omitiu `id`, `date`, `modified`, `slug`, `link`, `title`, `excerpt` ou `content`.
4. `page=2&per_page=1` retornou `200`, um item e links `prev` e `next`, comprovando paginacao efetiva pelo parametro `page`.
5. `per_page=101` retornou `400` e a propria resposta declarou a faixa inclusiva de 1 a 100.
6. `before=2026-09-15T10:08:37-03:00` reduziu o total em exatamente um e excluiu o post cuja data era igual ao limite, comprovando exclusividade e aceite de RFC 3339 com offset.
7. `id = 19690`, com o mesmo slug e link, apareceu tanto na segunda pagina quanto na consulta temporal de fronteira.
8. `https://abve.org.br/robots.txt` retornou `200`, `text/plain` e `User-agent: *` com `Disallow:` vazio.
9. `https://abve.org.br/politica-de-privacidade/` retornou `200` e continha politica de privacidade, compromisso de uso adequado e reserva de direitos; nao continha termos especificos da API nem licenca aberta para noticias.
10. Nenhuma resposta exigiu cookie, token ou credencial, e nao foi observado bloqueio, captcha, `429`, header de quota ou `Retry-After`.

### Revalidacao da projecao de nove campos

Em `2026-09-17T21:05:11Z`, um unico `GET` publico, sem autenticacao, consultou um item com `_fields=id,date,date_gmt,modified,slug,link,title,excerpt,content`. O resultado compacto foi: HTTP `200`; `application/json; charset=UTF-8`; exatamente os nove campos presentes; `date_gmt` presente no formato WordPress `YYYY-MM-DDTHH:MM:SS`. Nenhum body editorial foi arquivado ou incluido nesta evidencia.

## Requests historicos usados no preflight

No preflight historico, anterior a `date_gmt`, foram feitos sete requests HTTP diretos ao dominio da ABVE. Somente um trouxe 100 posts; os demais retornaram metadados, erro controlado ou um item. Essa lista documenta a evidencia anterior e nao representa a revalidacao da projecao de nove campos.

```text
GET https://abve.org.br/wp-json/wp/v2/categories/13?_fields=id,name,slug,link,count

GET https://abve.org.br/wp-json/wp/v2/posts
  ?categories=13
  &per_page=100
  &page=1
  &before=2026-09-16T09:09:35Z
  &_fields=id,date,modified,slug,link,title,excerpt,content

GET https://abve.org.br/wp-json/wp/v2/posts
  ?categories=13&per_page=101&page=1
  &before=2026-09-16T09:09:35Z&_fields=id

GET https://abve.org.br/wp-json/wp/v2/posts
  ?categories=13&per_page=1&page=2
  &before=2026-09-16T09:09:35Z
  &_fields=id,date,modified,slug,link

GET https://abve.org.br/wp-json/wp/v2/posts
  ?categories=13&per_page=1&page=1
  &before=2026-09-15T10:08:37-03:00
  &_fields=id,date,modified,slug,link

GET https://abve.org.br/robots.txt

GET https://abve.org.br/politica-de-privacidade/
```

Tambem foram consultadas as tres paginas oficiais do WordPress ligadas acima para interpretar o contrato padrao. Elas nao aumentaram a carga sobre a ABVE.

## Riscos/limitacoes

1. A API e uma interface publica do CMS, nao um SLA ou contrato de dados publicado pela ABVE; categoria, plugins, schema, disponibilidade e limites podem mudar.
2. `before` usa publicacao, nao modificacao. A cobertura compara o instante UTC `date_gmt`; `date` preserva o wall-clock e a ordenacao da fonte. O cursor aprovado nao garante descoberta completa de edicoes antigas fora da amostra.
3. Paginacao por numero de pagina nao oferece snapshot. Retrodatacao, despublicacao, exclusao, edicao durante o run e empate de datas podem produzir deslocamento, duplicidade ou conteudo misto.
4. Os headers de total ajudam a detectar mudanca, mas nao provam sozinhos consistencia entre requests.
5. Nao ha rate limit ou SLA publicado identificado. Ausencia de header de quota nao autoriza frequencia agressiva.
6. `max_pages = 2` e uma amostra deliberada, nao cobertura do arquivo. Alcancar o limite antes da fronteira planejada impede sucesso completo e avancar cursor.
7. O `id` mostrou estabilidade pratica e e o identificador nativo documentado pelo WordPress, mas `link` normalizado permanece necessario como verificacao/fallback.
8. `content.rendered` e HTML editorial mutavel. Scripts, markup nao semantico e URLs incorporadas exigirao o perfil versionado de normalizacao ja decidido. `date_gmt` nao entra no normalized content fingerprint porque e metadata operacional de cursor/cobertura; o perfil permanece `abve-wordpress-post-v1`.
9. Robots sem bloqueio nao e licenca. A pagina oficial encontrada reserva direitos e nao concede republicacao integral.
10. `removal_policy = none` continua obrigatorio: ausencia na amostra, em pagina deslocada ou em run parcial nao prova remocao.

## Criterios de aceite

1. O cadastro resolve exatamente uma source por `sources.slug = 'abve'` e nao altera a source.
2. O registro futuro corresponde integralmente ao YAML acima e satisfaz as constraints da migration atual.
3. O coletor fixa uma unica vez `before = run_started_at` em RFC 3339 UTC e reutiliza o valor em todas as paginas.
4. O coletor envia explicitamente `categories=13`, `context=view`, `orderby=date`, `order=desc` e o `_fields` aprovado.
5. Cada pagina valida status `200`, content type JSON, estrutura dos nove campos, IDs inteiros e headers de paginacao.
6. IDs sao deduplicados no run; alteracao de totais, duplicidade entre paginas, schema inesperado ou pagina limite antes da fronteira produz `partial` ou `blocked`, nunca sucesso silencioso.
7. `cursor_out` so e comprometido quando a amostra planejada termina; falha, mutacao detectada ou limite insuficiente preserva `cursor_in`.
8. A primeira execucao permanece manual/local, limitada a duas paginas de 50 itens, sem varrer o arquivo completo.
9. Nenhuma ausencia gera candidato a remocao e nenhum conteudo vira dado canonico automaticamente.
10. A retencao padrao e `minimum_excerpt`; corpo integral nao e arquivado por padrao.
11. Mudanca futura de URL, request, paginacao, cursor, termos ou robots invalida esta revisao conforme a trigger existente.
12. Restricao posterior de robots/termos, autenticacao inesperada, `403`/`429` persistente ou mudanca de contrato pausa a coleta e exige nova revisao.

## Decisao explicita

**`active`.** O endpoint pode ser cadastrado como ativo para execucao manual porque a URL oficial respondeu, o contrato minimo foi comprovado, o acesso nao exigiu autenticacao, a paginacao e os limites foram verificados, robots e a pagina oficial de uso foram revisados e foram definidos limites conservadores. `access_reviewed_at` deve ser `2026-09-17T21:05:11Z` para exatamente a configuracao proposta.

`active` nao afirma SLA, licenca de republicacao nem snapshot perfeito. Afirma que o acesso manual dentro dos limites acima passou pelo preflight e que as ressalvas conhecidas podem ser tratadas pelo manifest, pela retencao minima e pelas regras de falha/cursor ja aprovadas.

## Proximo passo

Se esta decisao for aprovada, outro agente deve criar exclusivamente a carga canonica deste `source_endpoint`, resolvendo `source_id` por `sources.slug = 'abve'` e copiando o registro proposto sem ampliar escopo. Esse passo nao deve criar collector, `collection_run`, credencial, observation, migration, grant ou policy, e nao deve alterar a source ABVE.
