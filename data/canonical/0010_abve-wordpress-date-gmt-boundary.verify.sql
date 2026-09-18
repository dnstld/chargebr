-- Verificação somente-leitura da correção canônica 0010.

with canonical as (
  select
    'abve-news-wordpress-posts'::text as endpoint_key,
    'ABVE — Noticias via WordPress REST API'::text as name,
    'https://abve.org.br/wp-json/wp/v2/posts'::text as endpoint_url,
    'api'::text as endpoint_type,
    'http_get'::text as access_method,
    'json'::text as response_format,
    'active'::text as status,
    $json$
      {
        "timeout_ms": 30000,
        "max_response_bytes": 2000000,
        "query_params": {
          "categories": 13,
          "context": "view",
          "orderby": "date",
          "order": "desc",
          "_fields": "id,date,date_gmt,modified,slug,link,title,excerpt,content"
        },
        "headers": {"Accept": "application/json"}
      }
    $json$::jsonb as request_config,
    'page'::text as pagination_strategy,
    $json$
      {
        "page_parameter": "page",
        "first_page": 1,
        "page_size_parameter": "per_page",
        "page_size": 50,
        "max_pages": 2,
        "total_pages_header": "X-WP-TotalPages",
        "freeze_parameter": "before",
        "freeze_from": "run_started_at"
      }
    $json$::jsonb as pagination_config,
    'time_window'::text as cursor_strategy,
    $json$
      {
        "request_parameter": "before",
        "value_format": "rfc3339",
        "freeze_from": "run_started_at"
      }
    $json$::jsonb as cursor_config,
    $json$
      {
        "version": "abve-post-identity-v1",
        "primary": {"fields": ["id"]},
        "fallback": {
          "fields": ["link"],
          "normalization": "canonical-url-v1"
        },
        "diagnostic_fields": ["modified", "slug"]
      }
    $json$::jsonb as identity_rule,
    'abve-wordpress-post-v1'::text as normalization_profile,
    $json$
      [
        "date",
        "modified",
        "slug",
        "canonical_url",
        "title.rendered",
        "excerpt.rendered",
        "excerpt.protected",
        "content.rendered",
        "content.protected"
      ]
    $json$::jsonb as normalized_fingerprint_fields,
    'none'::text as removal_policy,
    interval '7 days' as suggested_interval,
    'minimum_excerpt'::text as default_retention_class,
    null::text as terms_url,
    'https://abve.org.br/robots.txt'::text as robots_url,
    timestamptz '2026-09-16T09:12:35Z' as access_reviewed_at,
    $notes$Endpoint publico do WordPress para posts da categoria Noticias (13). A revisao confirmou GET sem autenticacao, paginacao e campos projetados. `before` e um teto exclusivo sobre a data de publicacao e nao cria snapshot: edicoes, retrodatacao, despublicacao ou exclusao durante o run podem alterar conteudo ou deslocar paginas. Deduplicar por id, registrar headers por pagina e nao comprometer cursor quando a cobertura planejada nao terminar. A pagina https://abve.org.br/politica-de-privacidade/ foi revisada como evidencia oficial de privacidade, cookies, uso geral e reserva de direitos, mas nao constitui termos especificos da API nem licenca de republicacao; por isso terms_url permanece nulo. Nao ha SLA ou rate limit publicado identificado. Coleta inicial manual, conservadora e sem inferencia de remocao.$notes$::text as notes
),
abve_source_resolution as (
  select
    count(*) as source_count,
    case when count(*) = 1 then min(s.id) end as source_id
  from public.sources s
  where s.slug = 'abve'
),
target_endpoint as (
  select
    count(*) as endpoint_count,
    count(*) filter (
      where se.name is not distinct from c.name
        and se.endpoint_url is not distinct from c.endpoint_url
        and se.endpoint_type is not distinct from c.endpoint_type
        and se.access_method is not distinct from c.access_method
        and se.response_format is not distinct from c.response_format
        and se.status is not distinct from c.status
        and se.request_config is not distinct from c.request_config
        and se.pagination_strategy is not distinct from c.pagination_strategy
        and se.pagination_config is not distinct from c.pagination_config
        and se.cursor_strategy is not distinct from c.cursor_strategy
        and se.cursor_config is not distinct from c.cursor_config
        and se.identity_rule is not distinct from c.identity_rule
        and se.normalization_profile is not distinct from c.normalization_profile
        and se.removal_policy is not distinct from c.removal_policy
        and se.suggested_interval is not distinct from c.suggested_interval
        and se.default_retention_class is not distinct from c.default_retention_class
        and se.terms_url is not distinct from c.terms_url
        and se.robots_url is not distinct from c.robots_url
        and se.access_reviewed_at is not distinct from c.access_reviewed_at
        and se.notes is not distinct from c.notes
    ) as exact_rows,
    bool_and(
      se.request_config #>> '{query_params,_fields}' =
        'id,date,date_gmt,modified,slug,link,title,excerpt,content'
    ) as fields_exact,
    bool_and(se.normalization_profile = 'abve-wordpress-post-v1')
      as normalization_profile_exact,
    bool_and(se.identity_rule = c.identity_rule) as identity_rule_exact,
    bool_and(
      se.pagination_strategy = c.pagination_strategy
      and se.pagination_config = c.pagination_config
      and se.cursor_strategy = c.cursor_strategy
      and se.cursor_config = c.cursor_config
    ) as pagination_cursor_exact
  from public.source_endpoints se
  cross join abve_source_resolution sr
  cross join canonical c
  where sr.source_count = 1
    and se.source_id = sr.source_id
    and se.endpoint_key = c.endpoint_key
)
select
  case
    when sr.source_count = 1
      and t.endpoint_count = 1
      and t.exact_rows = 1
      and not (c.normalized_fingerprint_fields ? 'date_gmt')
    then 'complete'
    else 'unexpected'
  end as load_0010_state,
  sr.source_count as abve_sources,
  t.endpoint_count as target_endpoints,
  coalesce(t.fields_exact, false) as fields_exact,
  coalesce(t.normalization_profile_exact, false)
    as normalization_profile_exact,
  coalesce(t.identity_rule_exact, false) as identity_rule_exact,
  coalesce(t.pagination_cursor_exact, false) as pagination_cursor_exact,
  not (c.normalized_fingerprint_fields ? 'date_gmt')
    as date_gmt_absent_from_normalized_fingerprint,
  t.exact_rows = 1 as full_endpoint_contract_exact
from abve_source_resolution sr
cross join target_endpoint t
cross join canonical c;
