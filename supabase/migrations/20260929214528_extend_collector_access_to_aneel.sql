create policy sources_collector_aneel_select
on public.sources
for select
to chargebr_collector_0001
using (slug = 'aneel');

create policy source_endpoints_collector_aneel_select
on public.source_endpoints
for select
to chargebr_collector_0001
using (
  endpoint_key = 'aneel-board-meetings-index'
  and exists (
    select 1
    from public.sources
    where sources.id = source_endpoints.source_id
      and sources.slug = 'aneel'
  )
);

create policy collection_runs_collector_aneel_select
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
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
);

create policy collection_runs_collector_aneel_insert
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
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
  and status = 'running'
  and trigger_kind = 'manual_local'
);

create policy collection_runs_collector_aneel_update
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
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
)
with check (
  exists (
    select 1
    from public.source_endpoints
    join public.sources
      on sources.id = source_endpoints.source_id
    where source_endpoints.id = collection_runs.source_endpoint_id
      and source_endpoints.endpoint_key = 'aneel-board-meetings-index'
      and sources.slug = 'aneel'
  )
);
