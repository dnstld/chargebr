-- Verificação reutilizável da carga canônica 0012.
-- Retorna old antes da transição, complete depois da aplicação integral e
-- unexpected para resolução ou conteúdo divergente.

with canonical as (
  select
    'aneel-board-meetings-index'::text as endpoint_key,
    'ANEEL — Índice de Pautas e Atas das Reuniões Públicas'::text as name,
    'https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425'::text as endpoint_url,
    'document_index'::text as endpoint_type,
    'http_get'::text as access_method,
    'html'::text as response_format,
    $json$
      {
        "timeout_ms": 20000,
        "max_response_bytes": 1000000,
        "query_params": {
          "idAreaNoticia": "425"
        },
        "headers": {
          "Accept": "text/html"
        }
      }
    $json$::jsonb as request_config,
    'page'::text as pagination_strategy,
    $json$
      {
        "page_parameter": "page",
        "first_page": 1,
        "observed_page_size": 15,
        "max_pages": 10,
        "next_link_text": "Próximas 15 >>",
        "allowed_path": "/aplicacoes_liferay/noticias_area/dsp_listarNoticias.cfm"
      }
    $json$::jsonb as pagination_config,
    'none'::text as cursor_strategy,
    '{}'::jsonb as cursor_config,
    $json$
      {
        "version": "aneel-board-meeting-index-identity-v1",
        "primary": {
          "query_parameter": "idNoticia"
        },
        "required_scope": {
          "idAreaNoticia": "425"
        },
        "detail_path": "/aplicacoes_liferay/noticias_area/dsp_detalheNoticia.cfm"
      }
    $json$::jsonb as identity_rule,
    'aneel-board-meeting-html-v1'::text as normalization_profile,
    'none'::text as removal_policy,
    interval '7 days' as suggested_interval,
    'external_reference'::text as default_retention_class,
    'https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas'::text as terms_url,
    'https://www2.aneel.gov.br/robots.txt'::text as robots_url,
    timestamptz '2026-09-25T05:11:10Z' as access_reviewed_at,
    timestamptz '2026-09-30T16:58:59Z' as transition_recorded_at,
    $notes$Índice oficial de Pautas e Atas apontado pela página institucional da ANEEL. A revisão confirmou GET sem autenticação, HTML ISO-8859-1, paginação por link e identidade nativa por idNoticia. A v1 relê até dez páginas, aceita somente o hostname e os paths aprovados, trata PDFs como referências externas e não infere remoção por ausência. Mudança de charset, HTML incompatível, desafio, repetição, duplicidade ou salto observável bloqueia a coleta sem fallback. Execução inicial manual, semanal e sequencial; não há SLA ou rate limit publicado identificado.$notes$::text as notes
),
aneel_source_resolution as (
  select
    count(*) as source_count,
    case when count(*) = 1 then min(s.id) end as source_id
  from public.sources s
  where s.slug = 'aneel'
),
target_candidates as (
  select
    se.*,
    (
      se.name is not distinct from c.name
      and se.endpoint_url is not distinct from c.endpoint_url
      and se.endpoint_type is not distinct from c.endpoint_type
      and se.access_method is not distinct from c.access_method
      and se.response_format is not distinct from c.response_format
      and se.request_config is not distinct from c.request_config
      and se.pagination_strategy is not distinct from c.pagination_strategy
      and se.pagination_config is not distinct from c.pagination_config
      and se.cursor_strategy is not distinct from c.cursor_strategy
      and se.cursor_config is not distinct from c.cursor_config
      and se.identity_rule is not distinct from c.identity_rule
      and se.normalization_profile is not distinct from
        c.normalization_profile
      and se.removal_policy is not distinct from c.removal_policy
      and se.suggested_interval is not distinct from c.suggested_interval
      and se.default_retention_class is not distinct from
        c.default_retention_class
      and se.terms_url is not distinct from c.terms_url
      and se.robots_url is not distinct from c.robots_url
      and se.access_reviewed_at is not distinct from c.access_reviewed_at
      and se.notes is not distinct from c.notes
    ) as contract_matches,
    c.transition_recorded_at
  from public.source_endpoints se
  cross join aneel_source_resolution sr
  cross join canonical c
  where sr.source_count = 1
    and se.source_id = sr.source_id
    and se.endpoint_key = c.endpoint_key
),
target_endpoint as (
  select
    count(*) as count,
    count(*) filter (
      where tc.contract_matches
        and tc.status = 'active'
    ) as old_rows,
    count(*) filter (
      where tc.contract_matches
        and tc.status = 'unavailable'
        and tc.updated_at >= greatest(
          tc.created_at,
          tc.transition_recorded_at
        )
    ) as exact_rows,
    jsonb_agg(jsonb_build_object(
      'source_id', tc.source_id,
      'endpoint_key', tc.endpoint_key,
      'status', tc.status,
      'access_reviewed_at', tc.access_reviewed_at,
      'created_at', tc.created_at,
      'updated_at', tc.updated_at
    ) order by tc.id) as records
  from target_candidates tc
),
other_endpoints_snapshot as (
  select
    count(*) as count,
    md5(coalesce(
      jsonb_agg(to_jsonb(se) order by se.id),
      '[]'::jsonb
    )::text) as signature
  from public.source_endpoints se
  cross join aneel_source_resolution sr
  cross join canonical c
  where (se.source_id, se.endpoint_key) is distinct from
    (sr.source_id, c.endpoint_key)
),
runs_snapshot as (
  select
    count(*) as count,
    md5(coalesce(
      jsonb_agg(to_jsonb(cr) order by cr.id),
      '[]'::jsonb
    )::text) as signature
  from public.collection_runs cr
)
select
  case
    when sr.source_count = 1 and t.count = 1 and t.old_rows = 1
      then 'old'
    when sr.source_count = 1 and t.count = 1 and t.exact_rows = 1
      then 'complete'
    else 'unexpected'
  end as load_0012_state,
  sr.source_count as aneel_sources,
  sr.source_id,
  t.count as target_endpoints,
  t.old_rows,
  t.exact_rows,
  coalesce(t.records, '[]'::jsonb) as endpoint_records,
  o.count as other_source_endpoints,
  o.signature as other_source_endpoints_signature,
  r.count as collection_runs,
  r.signature as collection_runs_signature
from aneel_source_resolution sr
cross join target_endpoint t
cross join other_endpoints_snapshot o
cross join runs_snapshot r;
