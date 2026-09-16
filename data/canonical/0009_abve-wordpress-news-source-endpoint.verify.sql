-- Verificação reutilizável da carga canônica 0009.
-- Retorna absent antes da carga, complete após a execução integral e
-- unexpected para resolução inválida da source ou endpoint divergente.

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
          "_fields": "id,date,modified,slug,link,title,excerpt,content"
        },
        "headers": {
          "Accept": "application/json"
        }
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
        "primary": {
          "fields": ["id"]
        },
        "fallback": {
          "fields": ["link"],
          "normalization": "canonical-url-v1"
        },
        "diagnostic_fields": ["modified", "slug"]
      }
    $json$::jsonb as identity_rule,
    'abve-wordpress-post-v1'::text as normalization_profile,
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
other_endpoints_snapshot as (
  select
    count(*) as count,
    md5(coalesce(
      jsonb_agg(to_jsonb(se) order by se.id),
      '[]'::jsonb
    )::text) as signature
  from public.source_endpoints se
  cross join abve_source_resolution sr
  cross join canonical c
  where (se.source_id, se.endpoint_key) is distinct from
    (sr.source_id, c.endpoint_key)
),
target_endpoint as (
  select
    count(*) as count,
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
        and se.default_retention_class is not distinct from
          c.default_retention_class
        and se.terms_url is not distinct from c.terms_url
        and se.robots_url is not distinct from c.robots_url
        and se.access_reviewed_at is not distinct from c.access_reviewed_at
        and se.notes is not distinct from c.notes
    ) as exact_rows,
    jsonb_agg(jsonb_build_object(
      'source_id', se.source_id,
      'endpoint_key', se.endpoint_key,
      'name', se.name,
      'endpoint_url', se.endpoint_url,
      'endpoint_type', se.endpoint_type,
      'access_method', se.access_method,
      'response_format', se.response_format,
      'status', se.status,
      'request_config', se.request_config,
      'pagination_strategy', se.pagination_strategy,
      'pagination_config', se.pagination_config,
      'cursor_strategy', se.cursor_strategy,
      'cursor_config', se.cursor_config,
      'identity_rule', se.identity_rule,
      'normalization_profile', se.normalization_profile,
      'removal_policy', se.removal_policy,
      'suggested_interval', se.suggested_interval,
      'default_retention_class', se.default_retention_class,
      'terms_url', se.terms_url,
      'robots_url', se.robots_url,
      'access_reviewed_at', se.access_reviewed_at,
      'notes', se.notes
    ) order by se.id) as records
  from public.source_endpoints se
  cross join abve_source_resolution sr
  cross join canonical c
  where sr.source_count = 1
    and se.source_id = sr.source_id
    and se.endpoint_key = c.endpoint_key
)
select
  case
    when sr.source_count = 1 and t.count = 0 then 'absent'
    when sr.source_count = 1 and t.count = 1 and t.exact_rows = 1
      then 'complete'
    else 'unexpected'
  end as load_0009_state,
  sr.source_count as abve_sources,
  sr.source_id,
  t.count as target_endpoints,
  t.exact_rows,
  coalesce(t.records, '[]'::jsonb) as endpoint_records,
  o.count as other_source_endpoints,
  o.signature as other_source_endpoints_signature
from abve_source_resolution sr
cross join target_endpoint t
cross join other_endpoints_snapshot o;
