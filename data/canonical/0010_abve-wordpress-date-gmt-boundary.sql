-- Carga canônica 0010: corrige o campo temporal de controle do endpoint ABVE.
-- Este arquivo não controla a transação.

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
      "headers": {"Accept": "application/json"}
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
      "headers": {"Accept": "application/json"}
    }
  $json$::jsonb;
  abve_source_count bigint;
  abve_source_id bigint;
  target_endpoint_count bigint;
  target_request_config jsonb;
  endpoint_signature_before text;
  endpoint_signature_after text;
  updated_rows bigint;
begin
  select count(*), min(s.id)
    into abve_source_count, abve_source_id
    from public.sources s
   where s.slug = 'abve';

  if abve_source_count <> 1 then
    raise exception
      'Carga 0010: sources.slug = ''abve'' deve resolver exatamente uma source; encontrou %.',
      abve_source_count;
  end if;

  select count(*)
    into target_endpoint_count
    from public.source_endpoints se
   where se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts';

  if target_endpoint_count <> 1 then
    raise exception
      'Carga 0010: o endpoint ABVE deve resolver exatamente um registro; encontrou %.',
      target_endpoint_count;
  end if;

  select se.request_config
    into strict target_request_config
    from public.source_endpoints se
   where se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts'
   for update;

  if target_request_config is distinct from old_request_config
     and target_request_config is distinct from new_request_config
  then
    raise exception
      'Carga 0010: request_config do endpoint ABVE está em estado divergente.';
  end if;

  select md5((to_jsonb(se) - 'request_config' - 'updated_at')::text)
    into endpoint_signature_before
    from public.source_endpoints se
   where se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts';

  if target_request_config = old_request_config then
    update public.source_endpoints se
       set request_config = jsonb_set(
         se.request_config,
         '{query_params,_fields}',
         to_jsonb('id,date,date_gmt,modified,slug,link,title,excerpt,content'::text),
         false
       )
     where se.source_id = abve_source_id
       and se.endpoint_key = 'abve-news-wordpress-posts'
       and se.request_config = old_request_config;

    get diagnostics updated_rows = row_count;

    if updated_rows <> 1 then
      raise exception
        'Carga 0010: atualização esperava exatamente um endpoint; atualizou %.',
        updated_rows;
    end if;
  end if;

  select md5((to_jsonb(se) - 'request_config' - 'updated_at')::text)
    into endpoint_signature_after
    from public.source_endpoints se
   where se.source_id = abve_source_id
     and se.endpoint_key = 'abve-news-wordpress-posts';

  if endpoint_signature_after is distinct from endpoint_signature_before then
    raise exception
      'Carga 0010: coluna material além de request_config foi alterada.';
  end if;

  if exists (
    select 1
      from public.source_endpoints se
     where se.source_id = abve_source_id
       and se.endpoint_key = 'abve-news-wordpress-posts'
       and se.request_config is distinct from new_request_config
  ) then
    raise exception
      'Carga 0010: request_config final do endpoint ABVE diverge do contrato.';
  end if;
end
$$;
