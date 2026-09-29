-- Carga canônica 0011: índice de Pautas e Atas da ANEEL.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_request_config constant jsonb := $json$
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
  $json$::jsonb;
  canonical_pagination_config constant jsonb := $json$
    {
      "page_parameter": "page",
      "first_page": 1,
      "observed_page_size": 15,
      "max_pages": 10,
      "next_link_text": "Próximas 15 >>",
      "allowed_path": "/aplicacoes_liferay/noticias_area/dsp_listarNoticias.cfm"
    }
  $json$::jsonb;
  canonical_identity_rule constant jsonb := $json$
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
  $json$::jsonb;
  canonical_notes constant text := $notes$Índice oficial de Pautas e Atas apontado pela página institucional da ANEEL. A revisão confirmou GET sem autenticação, HTML ISO-8859-1, paginação por link e identidade nativa por idNoticia. A v1 relê até dez páginas, aceita somente o hostname e os paths aprovados, trata PDFs como referências externas e não infere remoção por ausência. Mudança de charset, HTML incompatível, desafio, repetição, duplicidade ou salto observável bloqueia a coleta sem fallback. Execução inicial manual, semanal e sequencial; não há SLA ou rate limit publicado identificado.$notes$;
  aneel_source_count bigint;
  aneel_source_id bigint;
  target_endpoint_count bigint;
  other_endpoints_signature_before text;
  other_endpoints_signature_after text;
begin
  select count(*), min(s.id)
    into aneel_source_count, aneel_source_id
    from public.sources s
   where s.slug = 'aneel';

  if aneel_source_count <> 1 then
    raise exception
      'Carga 0011: sources.slug = ''aneel'' deve resolver exatamente uma source; encontrou %.',
      aneel_source_count;
  end if;

  select md5(coalesce(
    jsonb_agg(to_jsonb(se) order by se.id),
    '[]'::jsonb
  )::text)
    into other_endpoints_signature_before
    from public.source_endpoints se
   where not (
     se.source_id = aneel_source_id
     and se.endpoint_key = 'aneel-board-meetings-index'
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
    aneel_source_id,
    'aneel-board-meetings-index',
    'ANEEL — Índice de Pautas e Atas das Reuniões Públicas',
    'https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425',
    'document_index',
    'http_get',
    'html',
    'active',
    canonical_request_config,
    'page',
    canonical_pagination_config,
    'none',
    '{}'::jsonb,
    canonical_identity_rule,
    'aneel-board-meeting-html-v1',
    'none',
    interval '7 days',
    'external_reference',
    'https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas',
    'https://www2.aneel.gov.br/robots.txt',
    timestamptz '2026-09-25T05:11:10Z',
    canonical_notes
  where not exists (
    select 1
      from public.source_endpoints
     where source_id = aneel_source_id
       and endpoint_key = 'aneel-board-meetings-index'
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
     se.source_id = aneel_source_id
     and se.endpoint_key = 'aneel-board-meetings-index'
   );

  if other_endpoints_signature_after is distinct from
    other_endpoints_signature_before
  then
    raise exception 'Carga 0011: outros source_endpoints foram alterados.';
  end if;

  select count(*)
    into target_endpoint_count
    from public.source_endpoints
   where source_id = aneel_source_id
     and endpoint_key = 'aneel-board-meetings-index';

  if target_endpoint_count <> 1 then
    raise exception
      'Carga 0011: o endpoint ANEEL não possui exatamente um registro; encontrou %.',
      target_endpoint_count;
  end if;

  if exists (
    select 1
      from public.source_endpoints se
     where se.source_id = aneel_source_id
       and se.endpoint_key = 'aneel-board-meetings-index'
       and (
         se.name is distinct from
           'ANEEL — Índice de Pautas e Atas das Reuniões Públicas'
         or se.endpoint_url is distinct from
           'https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425'
         or se.endpoint_type is distinct from 'document_index'
         or se.access_method is distinct from 'http_get'
         or se.response_format is distinct from 'html'
         or se.status is distinct from 'active'
         or se.request_config is distinct from canonical_request_config
         or se.pagination_strategy is distinct from 'page'
         or se.pagination_config is distinct from canonical_pagination_config
         or se.cursor_strategy is distinct from 'none'
         or se.cursor_config is distinct from '{}'::jsonb
         or se.identity_rule is distinct from canonical_identity_rule
         or se.normalization_profile is distinct from
           'aneel-board-meeting-html-v1'
         or se.removal_policy is distinct from 'none'
         or se.suggested_interval is distinct from interval '7 days'
         or se.default_retention_class is distinct from
           'external_reference'
         or se.terms_url is distinct from
           'https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas'
         or se.robots_url is distinct from
           'https://www2.aneel.gov.br/robots.txt'
         or se.access_reviewed_at is distinct from
           timestamptz '2026-09-25T05:11:10Z'
         or se.notes is distinct from canonical_notes
       )
  ) then
    raise exception
      'Carga 0011: o endpoint ANEEL já existe com conteúdo divergente.';
  end if;
end
$$;
