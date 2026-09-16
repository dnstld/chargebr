create role chargebr_collector_0001 with
  login
  nosuperuser
  nocreatedb
  nocreaterole
  noreplication
  nobypassrls
  connection limit 2;

do $block$
begin
  execute format(
    'grant connect on database %I to chargebr_collector_0001',
    current_database()
  );
end;
$block$;

grant usage on schema public to chargebr_collector_0001;

grant select (id, slug)
  on table public.sources
  to chargebr_collector_0001;

grant select
  on table public.source_endpoints
  to chargebr_collector_0001;

grant select
  on table public.collection_runs
  to chargebr_collector_0001;

grant insert (
  source_endpoint_id,
  run_key,
  started_at,
  last_heartbeat_at,
  stale_after_at,
  initiated_by,
  collector_name,
  collector_version,
  contract_version,
  config_fingerprint,
  window_start,
  window_end,
  cursor_in
)
  on table public.collection_runs
  to chargebr_collector_0001;

grant update (
  status,
  finished_at,
  last_heartbeat_at,
  stale_after_at,
  cursor_out,
  request_attempt_count,
  response_manifest_hash,
  response_manifest_reference,
  http_status,
  response_content_type,
  etag,
  last_modified,
  response_bytes,
  items_found,
  items_new,
  items_unchanged,
  items_changed,
  items_removal_candidates,
  items_inaccessible,
  items_rejected,
  error_kind,
  error_code,
  error_message,
  handoff_status,
  updated_at
)
  on table public.collection_runs
  to chargebr_collector_0001;

grant usage
  on sequence public.collection_runs_id_seq
  to chargebr_collector_0001;

create policy sources_collector_abve_select
on public.sources
for select
to chargebr_collector_0001
using (slug = 'abve');

create policy source_endpoints_collector_abve_select
on public.source_endpoints
for select
to chargebr_collector_0001
using (
  endpoint_key = 'abve-news-wordpress-posts'
  and exists (
    select 1
    from public.sources
    where sources.id = source_endpoints.source_id
      and sources.slug = 'abve'
  )
);

create policy collection_runs_collector_abve_select
on public.collection_runs
for select
to chargebr_collector_0001
using (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'abve-news-wordpress-posts'
      and sources.slug = 'abve'
  )
);

create policy collection_runs_collector_abve_insert
on public.collection_runs
for insert
to chargebr_collector_0001
with check (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'abve-news-wordpress-posts'
      and sources.slug = 'abve'
  )
  and status = 'running'
  and trigger_kind = 'manual_local'
);

create policy collection_runs_collector_abve_update
on public.collection_runs
for update
to chargebr_collector_0001
using (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'abve-news-wordpress-posts'
      and sources.slug = 'abve'
  )
)
with check (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'abve-news-wordpress-posts'
      and sources.slug = 'abve'
  )
);
