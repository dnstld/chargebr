-- Carga canônica 0009: endpoint de notícias da ABVE via WordPress REST API.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_request_config constant jsonb := $json$
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
  $json$::jsonb;
  canonical_pagination_config constant jsonb := $json$
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
  $json$::jsonb;
  canonical_cursor_config constant jsonb := $json$
    {
      "request_parameter": "before",
      "value_format": "rfc3339",
      "freeze_from": "run_started_at"
    }
  $json$::jsonb;
  canonical_identity_rule constant jsonb := $json$
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
  $json$::jsonb;
  canonical_notes constant text := $notes$Endpoint publico do WordPress para posts da categoria Noticias (13). A revisao confirmou GET sem autenticacao, paginacao e campos projetados. `before` e um teto exclusivo sobre a data de publicacao e nao cria snapshot: edicoes, retrodatacao, despublicacao ou exclusao durante o run podem alterar conteudo ou deslocar paginas. Deduplicar por id, registrar headers por pagina e nao comprometer cursor quando a cobertura planejada nao terminar. A pagina https://abve.org.br/politica-de-privacidade/ foi revisada como evidencia oficial de privacidade, cookies, uso geral e reserva de direitos, mas nao constitui termos especificos da API nem licenca de republicacao; por isso terms_url permanece nulo. Nao ha SLA ou rate limit publicado identificado. Coleta inicial manual, conservadora e sem inferencia de remocao.$notes$;
  abve_source_count bigint;
  abve_source_id bigint;
  target_endpoint_count bigint;
  other_endpoints_signature_before text;
  other_endpoints_signature_after text;
begin
  select count(*), min(s.id)
    into abve_source_count, abve_source_id
    from public.sources s
   where s.slug = 'abve';

  if abve_source_count <> 1 then
    raise exception
      'Carga 0009: sources.slug = ''abve'' deve resolver exatamente uma source; encontrou %.',
      abve_source_count;
  end if;

  select md5(coalesce(
    jsonb_agg(to_jsonb(se) order by se.id),
    '[]'::jsonb
  )::text)
    into other_endpoints_signature_before
    from public.source_endpoints se
   where not (
     se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts'
   );

  insert into public.source_endpoints (
    source_id,
    endpoint_key,
    name,
    endpoint_url,
    endpoint_type,
    access_method,
    response_format,
    status,
    request_config,
    pagination_strategy,
    pagination_config,
    cursor_strategy,
    cursor_config,
    identity_rule,
    normalization_profile,
    removal_policy,
    suggested_interval,
    default_retention_class,
    terms_url,
    robots_url,
    access_reviewed_at,
    notes
  )
  select
    abve_source_id,
    'abve-news-wordpress-posts',
    'ABVE — Noticias via WordPress REST API',
    'https://abve.org.br/wp-json/wp/v2/posts',
    'api',
    'http_get',
    'json',
    'active',
    canonical_request_config,
    'page',
    canonical_pagination_config,
    'time_window',
    canonical_cursor_config,
    canonical_identity_rule,
    'abve-wordpress-post-v1',
    'none',
    interval '7 days',
    'minimum_excerpt',
    null,
    'https://abve.org.br/robots.txt',
    timestamptz '2026-09-16T09:12:35Z',
    canonical_notes
  where not exists (
    select 1
      from public.source_endpoints
     where source_id = abve_source_id
       and endpoint_key = 'abve-news-wordpress-posts'
  )
  on conflict on constraint source_endpoints_source_id_endpoint_key_unique
  do nothing;

  select md5(coalesce(
    jsonb_agg(to_jsonb(se) order by se.id),
    '[]'::jsonb
  )::text)
    into other_endpoints_signature_after
    from public.source_endpoints se
   where not (
     se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts'
   );

  if other_endpoints_signature_after is distinct from
    other_endpoints_signature_before
  then
    raise exception 'Carga 0009: outros source_endpoints foram alterados.';
  end if;

  select count(*)
    into target_endpoint_count
    from public.source_endpoints
   where source_id = abve_source_id
     and endpoint_key = 'abve-news-wordpress-posts';

  if target_endpoint_count <> 1 then
    raise exception
      'Carga 0009: o endpoint ABVE não possui exatamente um registro; encontrou %.',
      target_endpoint_count;
  end if;

  if exists (
    select 1
      from public.source_endpoints se
     where se.source_id = abve_source_id
       and se.endpoint_key = 'abve-news-wordpress-posts'
       and (
         se.name is distinct from 'ABVE — Noticias via WordPress REST API'
         or se.endpoint_url is distinct from 'https://abve.org.br/wp-json/wp/v2/posts'
         or se.endpoint_type is distinct from 'api'
         or se.access_method is distinct from 'http_get'
         or se.response_format is distinct from 'json'
         or se.status is distinct from 'active'
         or se.request_config is distinct from canonical_request_config
         or se.pagination_strategy is distinct from 'page'
         or se.pagination_config is distinct from canonical_pagination_config
         or se.cursor_strategy is distinct from 'time_window'
         or se.cursor_config is distinct from canonical_cursor_config
         or se.identity_rule is distinct from canonical_identity_rule
         or se.normalization_profile is distinct from 'abve-wordpress-post-v1'
         or se.removal_policy is distinct from 'none'
         or se.suggested_interval is distinct from interval '7 days'
         or se.default_retention_class is distinct from 'minimum_excerpt'
         or se.terms_url is not null
         or se.robots_url is distinct from 'https://abve.org.br/robots.txt'
         or se.access_reviewed_at is distinct from
           timestamptz '2026-09-16T09:12:35Z'
         or se.notes is distinct from canonical_notes
       )
  ) then
    raise exception
      'Carga 0009: o endpoint ABVE já existe com conteúdo divergente.';
  end if;
end
$$;
