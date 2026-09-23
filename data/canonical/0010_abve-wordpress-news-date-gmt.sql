-- Carga canônica 0010: usa date_gmt como fronteira UTC do cursor ABVE.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  old_request_config constant jsonb := $json$
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
  new_request_config constant jsonb := $json$
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
      "headers": {
        "Accept": "application/json"
      }
    }
  $json$::jsonb;
  old_cursor_config constant jsonb := $json$
    {
      "request_parameter": "before",
      "value_format": "rfc3339",
      "freeze_from": "run_started_at"
    }
  $json$::jsonb;
  new_cursor_config constant jsonb := $json$
    {
      "request_parameter": "before",
      "value_format": "rfc3339",
      "freeze_from": "run_started_at",
      "boundary_field": "date_gmt"
    }
  $json$::jsonb;
  new_access_reviewed_at constant timestamptz :=
    timestamptz '2026-09-17T21:05:11Z';
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
  target_endpoint_id bigint;
  target_state text;
  updated_rows bigint;
  sources_signature_before text;
  sources_signature_after text;
  endpoint_count_before bigint;
  endpoint_count_after bigint;
  other_endpoints_signature_before text;
  other_endpoints_signature_after text;
  target_identity_signature_before text;
  target_identity_signature_after text;
  target_preserved_signature_before text;
  target_preserved_signature_after text;
begin
  select md5(coalesce(
    jsonb_agg(to_jsonb(s) order by s.id),
    '[]'::jsonb
  )::text)
    into sources_signature_before
    from public.sources s;

  select count(*)
    into endpoint_count_before
    from public.source_endpoints;

  select count(*), min(s.id)
    into abve_source_count, abve_source_id
    from public.sources s
   where s.slug = 'abve';

  if abve_source_count <> 1 then
    raise exception
      'Carga 0010: sources.slug = ''abve'' deve resolver exatamente uma source; encontrou %.',
      abve_source_count;
  end if;

  select count(*), min(se.id)
    into target_endpoint_count, target_endpoint_id
    from public.source_endpoints se
   where se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts';

  if target_endpoint_count <> 1 then
    raise exception
      'Carga 0010: o endpoint ABVE deve resolver exatamente um registro; encontrou %.',
      target_endpoint_count;
  end if;

  select md5(coalesce(
    jsonb_agg(to_jsonb(se) order by se.id),
    '[]'::jsonb
  )::text)
    into other_endpoints_signature_before
    from public.source_endpoints se
   where se.id <> target_endpoint_id;

  select
    md5(jsonb_build_object(
      'id', se.id,
      'source_id', se.source_id,
      'endpoint_key', se.endpoint_key
    )::text),
    md5((
      to_jsonb(se)
      - 'request_config'
      - 'cursor_config'
      - 'access_reviewed_at'
      - 'updated_at'
    )::text),
    case
      when (
        se.name is not distinct from 'ABVE — Noticias via WordPress REST API'
        and se.endpoint_url is not distinct from 'https://abve.org.br/wp-json/wp/v2/posts'
        and se.endpoint_type is not distinct from 'api'
        and se.access_method is not distinct from 'http_get'
        and se.response_format is not distinct from 'json'
        and se.status is not distinct from 'active'
        and se.pagination_strategy is not distinct from 'page'
        and se.pagination_config is not distinct from canonical_pagination_config
        and se.cursor_strategy is not distinct from 'time_window'
        and se.identity_rule is not distinct from canonical_identity_rule
        and se.normalization_profile is not distinct from 'abve-wordpress-post-v1'
        and se.removal_policy is not distinct from 'none'
        and se.suggested_interval is not distinct from interval '7 days'
        and se.default_retention_class is not distinct from 'minimum_excerpt'
        and se.terms_url is null
        and se.robots_url is not distinct from 'https://abve.org.br/robots.txt'
        and se.access_reviewed_at is not distinct from
          timestamptz '2026-09-16T09:12:35Z'
        and se.notes is not distinct from canonical_notes
        and se.request_config is not distinct from old_request_config
        and se.cursor_config is not distinct from old_cursor_config
      ) then 'old'
      when (
        se.name is not distinct from 'ABVE — Noticias via WordPress REST API'
        and se.endpoint_url is not distinct from 'https://abve.org.br/wp-json/wp/v2/posts'
        and se.endpoint_type is not distinct from 'api'
        and se.access_method is not distinct from 'http_get'
        and se.response_format is not distinct from 'json'
        and se.status is not distinct from 'active'
        and se.pagination_strategy is not distinct from 'page'
        and se.pagination_config is not distinct from canonical_pagination_config
        and se.cursor_strategy is not distinct from 'time_window'
        and se.identity_rule is not distinct from canonical_identity_rule
        and se.normalization_profile is not distinct from 'abve-wordpress-post-v1'
        and se.removal_policy is not distinct from 'none'
        and se.suggested_interval is not distinct from interval '7 days'
        and se.default_retention_class is not distinct from 'minimum_excerpt'
        and se.terms_url is null
        and se.robots_url is not distinct from 'https://abve.org.br/robots.txt'
        and se.access_reviewed_at is not distinct from
          new_access_reviewed_at
        and se.updated_at >= greatest(se.created_at, new_access_reviewed_at)
        and se.notes is not distinct from canonical_notes
        and se.request_config is not distinct from new_request_config
        and se.cursor_config is not distinct from new_cursor_config
      ) then 'new'
      else 'divergent'
    end
    into
      target_identity_signature_before,
      target_preserved_signature_before,
      target_state
    from public.source_endpoints se
   where se.id = target_endpoint_id;

  if target_state = 'old' then
    update public.source_endpoints
       set request_config = new_request_config,
           cursor_config = new_cursor_config,
           access_reviewed_at = new_access_reviewed_at,
           updated_at = greatest(created_at, updated_at, new_access_reviewed_at)
     where id = target_endpoint_id
       and request_config is not distinct from old_request_config
       and cursor_config is not distinct from old_cursor_config
       and access_reviewed_at is not distinct from
         timestamptz '2026-09-16T09:12:35Z';

    get diagnostics updated_rows = row_count;

    if updated_rows <> 1 then
      raise exception
        'Carga 0010: transição OLD -> NEW não alterou exatamente um endpoint; alterou %.',
        updated_rows;
    end if;
  elsif target_state = 'new' then
    null;
  else
    raise exception
      'Carga 0010: o endpoint ABVE não está em estado OLD nem NEW; recusando alteração parcial.';
  end if;

  if not exists (
    select 1
      from public.source_endpoints se
     where se.id = target_endpoint_id
       and se.request_config is not distinct from new_request_config
       and se.cursor_config is not distinct from new_cursor_config
       and se.access_reviewed_at is not distinct from
         new_access_reviewed_at
       and se.updated_at >= greatest(se.created_at, new_access_reviewed_at)
  ) then
    raise exception 'Carga 0010: o endpoint ABVE não terminou no estado NEW.';
  end if;

  select md5(coalesce(
    jsonb_agg(to_jsonb(s) order by s.id),
    '[]'::jsonb
  )::text)
    into sources_signature_after
    from public.sources s;

  select count(*)
    into endpoint_count_after
    from public.source_endpoints;

  select md5(coalesce(
    jsonb_agg(to_jsonb(se) order by se.id),
    '[]'::jsonb
  )::text)
    into other_endpoints_signature_after
    from public.source_endpoints se
   where se.id <> target_endpoint_id;

  select
    md5(jsonb_build_object(
      'id', se.id,
      'source_id', se.source_id,
      'endpoint_key', se.endpoint_key
    )::text),
    md5((
      to_jsonb(se)
      - 'request_config'
      - 'cursor_config'
      - 'access_reviewed_at'
      - 'updated_at'
    )::text)
    into
      target_identity_signature_after,
      target_preserved_signature_after
    from public.source_endpoints se
   where se.id = target_endpoint_id;

  if sources_signature_after is distinct from sources_signature_before then
    raise exception 'Carga 0010: sources foi alterada.';
  end if;

  if endpoint_count_after is distinct from endpoint_count_before then
    raise exception 'Carga 0010: a quantidade de source_endpoints foi alterada.';
  end if;

  if other_endpoints_signature_after is distinct from
    other_endpoints_signature_before
  then
    raise exception 'Carga 0010: outros source_endpoints foram alterados.';
  end if;

  if target_identity_signature_after is distinct from
    target_identity_signature_before
  then
    raise exception 'Carga 0010: a identidade do endpoint ABVE foi alterada.';
  end if;

  if target_preserved_signature_after is distinct from
    target_preserved_signature_before
  then
    raise exception
      'Carga 0010: campo não autorizado do endpoint ABVE foi alterado.';
  end if;
end
$$;
