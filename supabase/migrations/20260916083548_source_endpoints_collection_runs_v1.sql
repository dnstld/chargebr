create table public.source_endpoints (
  id bigint generated always as identity primary key,
  source_id bigint not null,
  endpoint_key text not null,
  name text not null,
  endpoint_url text not null,
  endpoint_type text not null,
  access_method text not null default 'http_get',
  response_format text not null,
  status text not null default 'candidate',
  request_config jsonb not null,
  pagination_strategy text not null default 'none',
  pagination_config jsonb not null default '{}'::jsonb,
  cursor_strategy text not null default 'none',
  cursor_config jsonb not null default '{}'::jsonb,
  identity_rule jsonb not null,
  normalization_profile text not null,
  removal_policy text not null default 'none',
  suggested_interval interval,
  default_retention_class text not null default 'metadata_only',
  terms_url text,
  robots_url text,
  access_reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint source_endpoints_source_id_fkey
    foreign key (source_id)
    references public.sources (id)
    on delete restrict,
  constraint source_endpoints_source_id_endpoint_key_unique
    unique (source_id, endpoint_key),
  constraint source_endpoints_endpoint_key_format
    check (endpoint_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint source_endpoints_name_not_blank
    check (btrim(name) <> ''),
  constraint source_endpoints_endpoint_url_valid
    check (endpoint_url ~ '^https://[^[:space:]]+$'),
  constraint source_endpoints_endpoint_url_without_userinfo
    check (endpoint_url !~ '^https://[^/]*@'),
  constraint source_endpoints_endpoint_type_valid
    check (
      endpoint_type in (
        'listing',
        'feed',
        'api',
        'snapshot',
        'document_index'
      )
    ),
  constraint source_endpoints_access_method_valid
    check (access_method = 'http_get'),
  constraint source_endpoints_response_format_valid
    check (response_format in ('html', 'json', 'xml', 'csv', 'pdf', 'other')),
  constraint source_endpoints_status_valid
    check (status in ('candidate', 'active', 'paused', 'unavailable', 'retired')),
  constraint source_endpoints_request_config_object
    check (jsonb_typeof(request_config) = 'object'),
  constraint source_endpoints_request_config_required_keys
    check (request_config ?& array['timeout_ms', 'max_response_bytes']),
  constraint source_endpoints_request_config_allowed_keys
    check (
      case
        when jsonb_typeof(request_config) = 'object'
          then request_config - array[
            'timeout_ms',
            'max_response_bytes',
            'query_params',
            'headers'
          ] = '{}'::jsonb
        else false
      end
    ),
  constraint source_endpoints_request_timeout_positive_integer
    check (
      jsonb_typeof(request_config -> 'timeout_ms') = 'number'
      and request_config ->> 'timeout_ms' ~ '^[1-9][0-9]*$'
    ),
  constraint source_endpoints_request_max_bytes_positive_integer
    check (
      jsonb_typeof(request_config -> 'max_response_bytes') = 'number'
      and request_config ->> 'max_response_bytes' ~ '^[1-9][0-9]*$'
    ),
  constraint source_endpoints_request_query_params_object
    check (
      not (request_config ? 'query_params')
      or jsonb_typeof(request_config -> 'query_params') = 'object'
    ),
  constraint source_endpoints_request_headers_object
    check (
      not (request_config ? 'headers')
      or jsonb_typeof(request_config -> 'headers') = 'object'
    ),
  constraint source_endpoints_pagination_strategy_valid
    check (pagination_strategy in ('none', 'page', 'offset', 'cursor', 'link')),
  constraint source_endpoints_pagination_config_object
    check (jsonb_typeof(pagination_config) = 'object'),
  constraint source_endpoints_pagination_config_matches_strategy
    check ((pagination_strategy = 'none') = (pagination_config = '{}'::jsonb)),
  constraint source_endpoints_cursor_strategy_valid
    check (cursor_strategy in ('none', 'time_window', 'opaque_token', 'offset_checkpoint')),
  constraint source_endpoints_cursor_config_object
    check (jsonb_typeof(cursor_config) = 'object'),
  constraint source_endpoints_cursor_config_matches_strategy
    check ((cursor_strategy = 'none') = (cursor_config = '{}'::jsonb)),
  constraint source_endpoints_identity_rule_structure
    check (
      jsonb_typeof(identity_rule) = 'object'
      and identity_rule ?& array['version', 'primary']
    ),
  constraint source_endpoints_normalization_profile_not_blank
    check (btrim(normalization_profile) <> ''),
  constraint source_endpoints_removal_policy_valid
    check (removal_policy = 'none'),
  constraint source_endpoints_suggested_interval_positive
    check (
      suggested_interval is null
      or suggested_interval > interval '0 seconds'
    ),
  constraint source_endpoints_default_retention_class_valid
    check (
      default_retention_class in (
        'metadata_only',
        'minimum_excerpt',
        'full_document',
        'external_reference'
      )
    ),
  constraint source_endpoints_terms_url_valid
    check (terms_url is null or terms_url ~ '^https://[^[:space:]]+$'),
  constraint source_endpoints_terms_url_without_userinfo
    check (terms_url is null or terms_url !~ '^https://[^/]*@'),
  constraint source_endpoints_robots_url_valid
    check (robots_url is null or robots_url ~ '^https://[^[:space:]]+$'),
  constraint source_endpoints_robots_url_without_userinfo
    check (robots_url is null or robots_url !~ '^https://[^/]*@'),
  constraint source_endpoints_active_access_reviewed
    check (status <> 'active' or access_reviewed_at is not null),
  constraint source_endpoints_notes_not_blank
    check (notes is null or btrim(notes) <> ''),
  constraint source_endpoints_timestamps_valid
    check (updated_at >= created_at)
);

comment on table public.source_endpoints is
  'Locais lógicos e configurações públicas de coleta pertencentes a fontes do ChargeBR.';

comment on column public.source_endpoints.source_id is
  'Fonte canônica à qual o endpoint de coleta pertence.';

comment on column public.source_endpoints.endpoint_key is
  'Identificador lógico estável e imutável do endpoint dentro da fonte.';

comment on column public.source_endpoints.endpoint_url is
  'URL HTTPS pública do local coletável, sem credenciais ou userinfo.';

comment on column public.source_endpoints.request_config is
  'Limites e opções HTTP públicas permitidas para a coleta.';

comment on column public.source_endpoints.identity_rule is
  'Regra declarativa versionada para identificar itens nativos da fonte.';

comment on column public.source_endpoints.access_reviewed_at is
  'Instante da revisão da configuração sensível de acesso atualmente registrada.';

create function public.enforce_source_endpoints_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  access_configuration_changed boolean;
begin
  if old.status = 'retired' then
    raise exception using
      errcode = '23514',
      message = 'source_endpoints retired rows are immutable';
  end if;

  if new.source_id is distinct from old.source_id
    or new.endpoint_key is distinct from old.endpoint_key
  then
    raise exception using
      errcode = '23514',
      message = 'source_endpoints source_id and endpoint_key are immutable';
  end if;

  if new.status is null
    or (
      new.status is distinct from old.status
      and not coalesce(
        (old.status = 'candidate' and new.status in ('active', 'retired'))
        or (old.status = 'active' and new.status in ('paused', 'unavailable', 'retired'))
        or (old.status = 'paused' and new.status in ('active', 'retired'))
        or (old.status = 'unavailable' and new.status in ('active', 'retired')),
        false
      )
    )
  then
    raise exception using
      errcode = '23514',
      message = 'invalid source_endpoints status transition';
  end if;

  access_configuration_changed :=
    new.endpoint_url is distinct from old.endpoint_url
    or new.request_config is distinct from old.request_config
    or new.pagination_strategy is distinct from old.pagination_strategy
    or new.pagination_config is distinct from old.pagination_config
    or new.cursor_strategy is distinct from old.cursor_strategy
    or new.cursor_config is distinct from old.cursor_config
    or new.terms_url is distinct from old.terms_url
    or new.robots_url is distinct from old.robots_url;

  if access_configuration_changed and new.status = 'active' then
    if new.access_reviewed_at is null
      or (
        old.access_reviewed_at is not null
        and new.access_reviewed_at <= old.access_reviewed_at
      )
    then
      raise exception using
        errcode = '23514',
        message = 'active source_endpoints access changes require a strictly newer review';
    end if;
  elsif access_configuration_changed and new.status <> 'active' then
    if new.access_reviewed_at is not null then
      raise exception using
        errcode = '23514',
        message = 'non-active source_endpoints access changes must clear the access review';
    end if;
  end if;

  return new;
end;
$function$;

comment on function public.enforce_source_endpoints_update() is
  'Protege a identidade, as transições, a revisão de acesso e a aposentadoria de endpoints.';

create trigger source_endpoints_enforce_update
before update on public.source_endpoints
for each row
execute function public.enforce_source_endpoints_update();

create table public.collection_runs (
  id bigint generated always as identity primary key,
  source_endpoint_id bigint not null,
  run_key uuid not null,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  last_heartbeat_at timestamptz not null default now(),
  stale_after_at timestamptz not null,
  trigger_kind text not null default 'manual_local',
  initiated_by text not null,
  collector_name text not null,
  collector_version text not null,
  contract_version text not null,
  config_fingerprint text not null,
  window_start timestamptz,
  window_end timestamptz,
  cursor_in jsonb,
  cursor_out jsonb,
  request_attempt_count integer not null default 0,
  response_manifest_hash text,
  response_manifest_reference text,
  http_status smallint,
  response_content_type text,
  etag text,
  last_modified text,
  response_bytes bigint,
  items_found bigint not null default 0,
  items_new bigint not null default 0,
  items_unchanged bigint not null default 0,
  items_changed bigint not null default 0,
  items_removal_candidates bigint not null default 0,
  items_inaccessible bigint not null default 0,
  items_rejected bigint not null default 0,
  error_kind text,
  error_code text,
  error_message text,
  handoff_status text not null default 'not_produced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint collection_runs_source_endpoint_id_fkey
    foreign key (source_endpoint_id)
    references public.source_endpoints (id)
    on delete restrict,
  constraint collection_runs_run_key_unique
    unique (run_key),
  constraint collection_runs_status_valid
    check (
      status in (
        'running',
        'succeeded',
        'no_change',
        'partial',
        'failed',
        'blocked',
        'interrupted'
      )
    ),
  constraint collection_runs_finished_at_matches_status
    check ((status = 'running') = (finished_at is null)),
  constraint collection_runs_finished_at_not_before_started
    check (finished_at is null or finished_at >= started_at),
  constraint collection_runs_heartbeat_not_before_started
    check (last_heartbeat_at >= started_at),
  constraint collection_runs_stale_after_heartbeat
    check (stale_after_at > last_heartbeat_at),
  constraint collection_runs_heartbeat_not_after_finished
    check (finished_at is null or last_heartbeat_at <= finished_at),
  constraint collection_runs_interrupted_after_stale
    check (status <> 'interrupted' or finished_at >= stale_after_at),
  constraint collection_runs_trigger_kind_valid
    check (trigger_kind = 'manual_local'),
  constraint collection_runs_initiated_by_not_blank
    check (btrim(initiated_by) <> ''),
  constraint collection_runs_collector_name_not_blank
    check (btrim(collector_name) <> ''),
  constraint collection_runs_collector_version_not_blank
    check (btrim(collector_version) <> ''),
  constraint collection_runs_contract_version_not_blank
    check (btrim(contract_version) <> ''),
  constraint collection_runs_config_fingerprint_format
    check (config_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint collection_runs_window_order_valid
    check (
      window_start is null
      or window_end is null
      or window_start <= window_end
    ),
  constraint collection_runs_cursor_in_object
    check (cursor_in is null or jsonb_typeof(cursor_in) = 'object'),
  constraint collection_runs_cursor_out_object
    check (cursor_out is null or jsonb_typeof(cursor_out) = 'object'),
  constraint collection_runs_cursor_out_complete_only
    check (cursor_out is null or status in ('succeeded', 'no_change')),
  constraint collection_runs_request_attempt_count_nonnegative
    check (request_attempt_count >= 0),
  constraint collection_runs_manifest_hash_format
    check (
      response_manifest_hash is null
      or response_manifest_hash ~ '^[0-9a-f]{64}$'
    ),
  constraint collection_runs_manifest_pair
    check (
      (response_manifest_hash is null)
      = (response_manifest_reference is null)
    ),
  constraint collection_runs_manifest_reference_not_blank
    check (
      response_manifest_reference is null
      or btrim(response_manifest_reference) <> ''
    ),
  constraint collection_runs_http_status_valid
    check (http_status is null or http_status between 100 and 599),
  constraint collection_runs_response_content_type_not_blank
    check (
      response_content_type is null
      or btrim(response_content_type) <> ''
    ),
  constraint collection_runs_etag_not_blank
    check (etag is null or btrim(etag) <> ''),
  constraint collection_runs_last_modified_not_blank
    check (last_modified is null or btrim(last_modified) <> ''),
  constraint collection_runs_response_bytes_nonnegative
    check (response_bytes is null or response_bytes >= 0),
  constraint collection_runs_item_counts_nonnegative
    check (
      items_found >= 0
      and items_new >= 0
      and items_unchanged >= 0
      and items_changed >= 0
      and items_removal_candidates >= 0
      and items_inaccessible >= 0
      and items_rejected >= 0
    ),
  constraint collection_runs_items_found_consistent
    check (
      items_found = items_new + items_unchanged + items_changed
        + items_inaccessible + items_rejected
    ),
  constraint collection_runs_no_removal_candidates
    check (items_removal_candidates = 0),
  constraint collection_runs_no_change_counts_valid
    check (
      status <> 'no_change'
      or (
        items_new = 0
        and items_changed = 0
        and items_removal_candidates = 0
        and items_inaccessible = 0
        and items_rejected = 0
      )
    ),
  constraint collection_runs_succeeded_counts_valid
    check (
      status <> 'succeeded'
      or (
        items_inaccessible = 0
        and items_rejected = 0
        and items_new + items_changed + items_removal_candidates > 0
      )
    ),
  constraint collection_runs_incomplete_without_removals
    check (
      status not in ('partial', 'interrupted')
      or items_removal_candidates = 0
    ),
  constraint collection_runs_endpoint_failure_without_items
    check (
      status not in ('failed', 'blocked')
      or (
        items_found = 0
        and items_new = 0
        and items_unchanged = 0
        and items_changed = 0
        and items_removal_candidates = 0
        and items_inaccessible = 0
        and items_rejected = 0
      )
    ),
  constraint collection_runs_error_fields_match_status
    check (
      (status in ('running', 'succeeded', 'no_change'))
      = (error_kind is null and error_code is null and error_message is null)
    ),
  constraint collection_runs_error_fields_all_or_none
    check (num_nonnulls(error_kind, error_code, error_message) in (0, 3)),
  constraint collection_runs_error_kind_valid
    check (
      error_kind is null
      or error_kind in (
        'transport',
        'http',
        'rate_limit',
        'access_policy',
        'contract',
        'format',
        'size_limit',
        'internal',
        'interrupted'
      )
    ),
  constraint collection_runs_error_code_valid
    check (
      error_code is null
      or (btrim(error_code) <> '' and length(error_code) <= 128)
    ),
  constraint collection_runs_error_message_valid
    check (
      error_message is null
      or (btrim(error_message) <> '' and length(error_message) <= 2000)
    ),
  constraint collection_runs_interrupted_error_kind
    check (status <> 'interrupted' or error_kind = 'interrupted'),
  constraint collection_runs_complete_manifest_required
    check (
      status not in ('succeeded', 'no_change')
      or response_manifest_hash is not null
    ),
  constraint collection_runs_handoff_matches_status
    check (
      (status = 'running' and handoff_status = 'not_produced')
      or (status = 'succeeded' and handoff_status = 'ready_for_extraction')
      or (status = 'no_change' and handoff_status = 'not_produced')
      or (
        status in ('partial', 'failed', 'blocked', 'interrupted')
        and handoff_status = 'withheld'
      )
    ),
  constraint collection_runs_ready_handoff_has_manifest
    check (
      handoff_status <> 'ready_for_extraction'
      or response_manifest_hash is not null
    ),
  constraint collection_runs_timestamps_valid
    check (updated_at >= created_at)
);

comment on table public.collection_runs is
  'Invocações completas e auditáveis de coletores para endpoints de fontes.';

comment on column public.collection_runs.source_endpoint_id is
  'Endpoint cuja configuração efetiva foi usada pela invocação.';

comment on column public.collection_runs.run_key is
  'Chave global de idempotência fornecida pelo processo iniciador.';

comment on column public.collection_runs.stale_after_at is
  'Deadline de staleness vigente no último heartbeat, preservado após o término.';

comment on column public.collection_runs.config_fingerprint is
  'SHA-256 da configuração pública efetivamente usada na invocação.';

comment on column public.collection_runs.cursor_out is
  'Checkpoint comprometido exclusivamente por uma execução completa.';

comment on column public.collection_runs.response_manifest_hash is
  'SHA-256 do manifest determinístico e ordenado produzido pela execução.';

comment on column public.collection_runs.items_found is
  'Total de itens descobertos, igual à soma das cinco classes exclusivas de resultado.';

create function public.enforce_collection_runs_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'running' then
      raise exception using
        errcode = '23514',
        message = 'collection_runs must be inserted with running status';
    end if;

    return new;
  end if;

  if old.status is distinct from 'running' then
    raise exception using
      errcode = '23514',
      message = 'terminal collection_runs rows are immutable';
  end if;

  if new.id is distinct from old.id
    or new.source_endpoint_id is distinct from old.source_endpoint_id
    or new.run_key is distinct from old.run_key
    or new.started_at is distinct from old.started_at
    or new.trigger_kind is distinct from old.trigger_kind
    or new.initiated_by is distinct from old.initiated_by
    or new.collector_name is distinct from old.collector_name
    or new.collector_version is distinct from old.collector_version
    or new.contract_version is distinct from old.contract_version
    or new.config_fingerprint is distinct from old.config_fingerprint
    or new.window_start is distinct from old.window_start
    or new.window_end is distinct from old.window_end
    or new.cursor_in is distinct from old.cursor_in
  then
    raise exception using
      errcode = '23514',
      message = 'collection_runs invocation identity fields are immutable';
  end if;

  if new.status is null
    or new.status not in (
      'running',
      'succeeded',
      'no_change',
      'partial',
      'failed',
      'blocked',
      'interrupted'
    )
  then
    raise exception using
      errcode = '23514',
      message = 'invalid collection_runs status transition';
  end if;

  return new;
end;
$function$;

comment on function public.enforce_collection_runs_lifecycle() is
  'Exige início em running, protege a identidade da invocação e torna estados terminais imutáveis.';

create trigger collection_runs_enforce_lifecycle
before insert or update on public.collection_runs
for each row
execute function public.enforce_collection_runs_lifecycle();

create index collection_runs_endpoint_started_idx
  on public.collection_runs (source_endpoint_id, started_at desc, id desc);

create index collection_runs_endpoint_completed_idx
  on public.collection_runs (source_endpoint_id, finished_at desc, id desc)
  where status in ('succeeded', 'no_change');

create unique index collection_runs_one_running_per_endpoint_idx
  on public.collection_runs (source_endpoint_id)
  where status = 'running';

alter table public.source_endpoints enable row level security;
alter table public.collection_runs enable row level security;

revoke all on table public.source_endpoints, public.collection_runs
  from public, anon, authenticated, service_role;

revoke all on sequence
  public.source_endpoints_id_seq,
  public.collection_runs_id_seq
  from public, anon, authenticated, service_role;

revoke all on function
  public.enforce_source_endpoints_update(),
  public.enforce_collection_runs_lifecycle()
  from public, anon, authenticated, service_role;
