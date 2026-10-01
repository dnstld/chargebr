-- Carga canônica 0012: marca o endpoint ANEEL como indisponível.
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
  canonical_access_reviewed_at constant timestamptz :=
    timestamptz '2026-09-25T05:11:10Z';
  transition_recorded_at constant timestamptz :=
    timestamptz '2026-09-30T16:58:59Z';
  aneel_source_count bigint;
  aneel_source_id bigint;
  target_endpoint_count bigint;
  target_endpoint_id bigint;
  target_contract_matches boolean;
  target_status text;
  target_created_at timestamptz;
  target_updated_at timestamptz;
  target_state text;
  updated_rows bigint;
  endpoint_count_before bigint;
  endpoint_count_after bigint;
  sources_signature_before text;
  sources_signature_after text;
  runs_signature_before text;
  runs_signature_after text;
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

  select md5(coalesce(
    jsonb_agg(to_jsonb(cr) order by cr.id),
    '[]'::jsonb
  )::text)
    into runs_signature_before
    from public.collection_runs cr;

  select count(*)
    into endpoint_count_before
    from public.source_endpoints;

  select count(*), min(s.id)
    into aneel_source_count, aneel_source_id
    from public.sources s
   where s.slug = 'aneel';

  if aneel_source_count <> 1 then
    raise exception
      'Carga 0012: sources.slug = ''aneel'' deve resolver exatamente uma source; encontrou %.',
      aneel_source_count;
  end if;

  select count(*), min(se.id)
    into target_endpoint_count, target_endpoint_id
    from public.source_endpoints se
   where se.source_id = aneel_source_id
     and se.endpoint_key = 'aneel-board-meetings-index';

  if target_endpoint_count <> 1 then
    raise exception
      'Carga 0012: o endpoint ANEEL deve resolver exatamente um registro; encontrou %.',
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
    md5((to_jsonb(se) - 'status' - 'updated_at')::text),
    (
      se.name is not distinct from
        'ANEEL — Índice de Pautas e Atas das Reuniões Públicas'
      and se.endpoint_url is not distinct from
        'https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425'
      and se.endpoint_type is not distinct from 'document_index'
      and se.access_method is not distinct from 'http_get'
      and se.response_format is not distinct from 'html'
      and se.request_config is not distinct from canonical_request_config
      and se.pagination_strategy is not distinct from 'page'
      and se.pagination_config is not distinct from
        canonical_pagination_config
      and se.cursor_strategy is not distinct from 'none'
      and se.cursor_config is not distinct from '{}'::jsonb
      and se.identity_rule is not distinct from canonical_identity_rule
      and se.normalization_profile is not distinct from
        'aneel-board-meeting-html-v1'
      and se.removal_policy is not distinct from 'none'
      and se.suggested_interval is not distinct from interval '7 days'
      and se.default_retention_class is not distinct from
        'external_reference'
      and se.terms_url is not distinct from
        'https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas'
      and se.robots_url is not distinct from
        'https://www2.aneel.gov.br/robots.txt'
      and se.access_reviewed_at is not distinct from
        canonical_access_reviewed_at
      and se.notes is not distinct from canonical_notes
    ),
    se.status,
    se.created_at,
    se.updated_at
    into
      target_identity_signature_before,
      target_preserved_signature_before,
      target_contract_matches,
      target_status,
      target_created_at,
      target_updated_at
    from public.source_endpoints se
   where se.id = target_endpoint_id;

  if target_contract_matches and target_status = 'active' then
    target_state := 'old';
  elsif target_contract_matches
    and target_status = 'unavailable'
    and target_updated_at >= greatest(target_created_at, transition_recorded_at)
  then
    target_state := 'new';
  else
    target_state := 'divergent';
  end if;

  if target_state = 'old' then
    update public.source_endpoints
       set status = 'unavailable',
           updated_at = greatest(created_at, updated_at, transition_recorded_at)
     where id = target_endpoint_id
       and status = 'active';

    get diagnostics updated_rows = row_count;

    if updated_rows <> 1 then
      raise exception
        'Carga 0012: transição OLD -> NEW não alterou exatamente um endpoint; alterou %.',
        updated_rows;
    end if;
  elsif target_state = 'new' then
    null;
  else
    raise exception
      'Carga 0012: o endpoint ANEEL não está em estado OLD nem NEW; recusando alteração parcial.';
  end if;

  if not exists (
    select 1
      from public.source_endpoints se
     where se.id = target_endpoint_id
       and se.status = 'unavailable'
       and se.updated_at >= greatest(se.created_at, transition_recorded_at)
  ) then
    raise exception 'Carga 0012: o endpoint ANEEL não terminou no estado NEW.';
  end if;

  select md5(coalesce(
    jsonb_agg(to_jsonb(s) order by s.id),
    '[]'::jsonb
  )::text)
    into sources_signature_after
    from public.sources s;

  select md5(coalesce(
    jsonb_agg(to_jsonb(cr) order by cr.id),
    '[]'::jsonb
  )::text)
    into runs_signature_after
    from public.collection_runs cr;

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
    md5((to_jsonb(se) - 'status' - 'updated_at')::text)
    into
      target_identity_signature_after,
      target_preserved_signature_after
    from public.source_endpoints se
   where se.id = target_endpoint_id;

  if sources_signature_after is distinct from sources_signature_before then
    raise exception 'Carga 0012: sources foi alterada.';
  end if;

  if runs_signature_after is distinct from runs_signature_before then
    raise exception 'Carga 0012: collection_runs foi alterada.';
  end if;

  if endpoint_count_after is distinct from endpoint_count_before then
    raise exception 'Carga 0012: a quantidade de source_endpoints foi alterada.';
  end if;

  if other_endpoints_signature_after is distinct from
    other_endpoints_signature_before
  then
    raise exception 'Carga 0012: outros source_endpoints foram alterados.';
  end if;

  if target_identity_signature_after is distinct from
    target_identity_signature_before
  then
    raise exception 'Carga 0012: a identidade do endpoint ANEEL foi alterada.';
  end if;

  if target_preserved_signature_after is distinct from
    target_preserved_signature_before
  then
    raise exception
      'Carga 0012: campo não autorizado do endpoint ANEEL foi alterado.';
  end if;
end
$$;
