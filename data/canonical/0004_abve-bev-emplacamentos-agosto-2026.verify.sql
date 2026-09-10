-- Verificação reutilizável da carga canônica 0004.
-- Execute antes e depois da validação ou persistência. O resultado deve ser
-- absent antes da carga, complete dentro da transação e absent após ROLLBACK.

with prior_records_snapshot as (
  select jsonb_build_object(
    'sources', (select jsonb_agg(to_jsonb(s) order by s.id) from public.sources s),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where coalesce(ci.content_fingerprint, '') !~ '^canonical-0004-'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0004-'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
       where coalesce(ev.lineage_key, '') !~ '^canonical-0004-'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0004-'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0004-'
    ),
    'metric_definitions', (
      select jsonb_agg(to_jsonb(md) order by md.id)
        from public.metric_definitions md
    ),
    'metric_values', (
      select jsonb_agg(to_jsonb(mv) order by mv.id)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0004-'
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
    ),
    'event_organizations', (
      select jsonb_agg(to_jsonb(eo) order by eo.event_id, eo.organization_id, eo.event_role)
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0004-'
    ),
    'content_item_relations', (
      select jsonb_agg(to_jsonb(cir) order by cir.earlier_content_item_id, cir.later_content_item_id, cir.relationship_type)
        from public.content_item_relations cir
    ),
    'metric_value_resolutions', (
      select jsonb_agg(to_jsonb(mvr) order by mvr.id)
        from public.metric_value_resolutions mvr
    ),
    'metric_value_status_transitions', (
      select jsonb_agg(to_jsonb(mvst) order by mvst.id)
        from public.metric_value_status_transitions mvst
    )
  ) as snapshot
),
load_0004_counts as (
  select
    (select count(*) from public.sources where slug = 'abve') as reused_sources,
    (select count(*) from public.organizations where slug = 'abve') as reused_organizations,
    (select count(*) from public.metric_definitions
      where metric_key = 'monthly-light-bev-registrations-brazil') as reused_metric_definitions,
    (select count(*) from public.content_items
      where content_fingerprint = 'canonical-0004-abve-data-bev-agosto-2026-2026-09-09') as content_items,
    (select count(*) from public.observations
      where observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026') as observations,
    (select count(*) from public.evidence
      where lineage_key = 'canonical-0004-abve-data-bev-agosto-2026') as evidence,
    (select count(*) from public.events
      where event_fingerprint = 'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09') as events,
    (select count(*)
       from public.metric_values mv
       join public.observations o on o.id = mv.observation_id
      where o.observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026') as metric_values,
    (select count(*)
       from public.event_evidence ee
       join public.events e on e.id = ee.event_id
      where e.event_fingerprint = 'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09') as event_evidence,
    (select count(*)
       from public.event_organizations eo
       join public.events e on e.id = eo.event_id
      where e.event_fingerprint = 'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09') as event_organizations
),
load_0004_chain as (
  select
    count(*) as chain_rows,
    count(*) filter (
      where s.slug = 'abve'
        and s.status = 'approved'
        and ci.url = 'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/'
        and ci.title = 'Com 57 mil emplacamentos em agosto, eletrificados abrem a corrida para o milhão em setembro'
        and ci.content_type = 'dataset_release'
        and ci.published_on = date '2026-09-09'
        and ci.published_at is null
        and ci.section_name = 'ABVE Data'
        and ci.publication_nature = 'original'
        and ci.retention_class = 'external_reference'
        and o.observation_type = 'quantity'
        and o.normalized_claim = 'Brasil: 27.166 emplacamentos de veículos leves BEV em agosto de 2026.'
        and o.normalization_status = 'normalized'
        and o.observation_date is null
        and o.geography = 'Brasil'
        and o.extraction_method = 'manual'
        and ev.origin_content_item_id = ci.id
        and ev.origin_source_id is null
        and ev.lineage_status = 'established'
        and ee.relationship_type = 'supports'
        and e.event_type = 'market_data'
        and e.event_phase = 'publication'
        and e.event_date = date '2026-09-09'
        and e.date_precision = 'day'
        and e.geography = 'Brasil'
        and e.verification_level = 'confirmed'
        and e.workflow_status = 'accepted'
        and eo.organization_id = org.id
        and eo.event_role = 'subject'
        and org.slug = 'abve'
        and md.metric_key = 'monthly-light-bev-registrations-brazil'
        and md.status = 'approved'
        and mv.numeric_value = 27166
        and mv.period_start = date '2026-08-01'
        and mv.period_end = date '2026-08-31'
        and mv.geography = 'Brasil'
        and mv.value_status = 'validated'
    ) as exact_chain_rows
  from public.events e
  join public.event_evidence ee on ee.event_id = e.id
  join public.evidence ev on ev.id = ee.evidence_id
  join public.observations o on o.id = ev.observation_id
  join public.content_items ci on ci.id = o.content_item_id
  join public.sources s on s.id = ci.source_id
  join public.metric_values mv on mv.observation_id = o.id
  join public.metric_definitions md on md.id = mv.metric_definition_id
  join public.event_organizations eo on eo.event_id = e.id
  join public.organizations org on org.id = eo.organization_id
  where e.event_fingerprint = 'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09'
    and o.observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026'
    and ev.lineage_key = 'canonical-0004-abve-data-bev-agosto-2026'
),
bev_series as (
  select
    count(*) as value_rows,
    count(*) filter (
      where mv.numeric_value = 25782
        and mv.period_start = date '2026-07-01'
        and mv.period_end = date '2026-07-31'
        and mv.geography = 'Brasil'
        and mv.value_status = 'validated'
        and o.observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026'
    ) as exact_july_rows,
    count(*) filter (
      where mv.numeric_value = 27166
        and mv.period_start = date '2026-08-01'
        and mv.period_end = date '2026-08-31'
        and mv.geography = 'Brasil'
        and mv.value_status = 'validated'
        and o.observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026'
    ) as exact_august_rows,
    array_agg(mv.numeric_value order by mv.period_start) as numeric_values,
    array_agg(mv.period_start order by mv.period_start) as period_starts,
    count(distinct mv.observation_id) as distinct_observations
  from public.metric_values mv
  join public.metric_definitions md on md.id = mv.metric_definition_id
  join public.observations o on o.id = mv.observation_id
  where md.metric_key = 'monthly-light-bev-registrations-brazil'
),
unwanted_0004_records as (
  select
    (select count(*)
       from public.content_item_relations cir
       join public.content_items earlier on earlier.id = cir.earlier_content_item_id
       join public.content_items later on later.id = cir.later_content_item_id
      where earlier.content_fingerprint like 'canonical-0004-%'
         or later.content_fingerprint like 'canonical-0004-%')
    + (select count(*) from public.metric_value_resolutions
        where resolution_key like 'canonical-0004-%')
    + (select count(*) from public.metric_value_status_transitions
        where transition_key like 'canonical-0004-%') as count
),
pilot_records as (
  select
    (select count(*) from public.content_items where content_fingerprint like 'pilot-%')
    + (select count(*) from public.observations where observation_fingerprint like 'pilot-%')
    + (select count(*) from public.evidence where lineage_key like 'pilot-%')
    + (select count(*) from public.events where event_fingerprint like 'pilot-%') as count
)
select
  md5(p.snapshot::text) as prior_records_signature,
  case
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.reused_metric_definitions = 1
     and c.content_items = 0
     and c.observations = 0
     and c.evidence = 0
     and c.events = 0
     and c.metric_values = 0
     and c.event_evidence = 0
     and c.event_organizations = 0
     and ch.chain_rows = 0
     and s.value_rows = 1
     and s.exact_july_rows = 1
     and s.exact_august_rows = 0
     and u.count = 0
      then 'absent'
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.reused_metric_definitions = 1
     and c.content_items = 1
     and c.observations = 1
     and c.evidence = 1
     and c.events = 1
     and c.metric_values = 1
     and c.event_evidence = 1
     and c.event_organizations = 1
     and ch.chain_rows = 1
     and ch.exact_chain_rows = 1
     and s.value_rows = 2
     and s.exact_july_rows = 1
     and s.exact_august_rows = 1
     and s.numeric_values = array[25782::numeric, 27166::numeric]
     and s.period_starts = array[date '2026-07-01', date '2026-08-01']
     and s.distinct_observations = 2
     and u.count = 0
      then 'complete'
    else 'unexpected'
  end as load_0004_state,
  c.*,
  ch.chain_rows,
  ch.exact_chain_rows,
  s.value_rows as series_value_rows,
  s.exact_july_rows,
  s.exact_august_rows,
  s.numeric_values,
  s.period_starts,
  s.distinct_observations,
  u.count as unwanted_0004_records,
  pr.count as pilot_records
from prior_records_snapshot p
cross join load_0004_counts c
cross join load_0004_chain ch
cross join bev_series s
cross join unwanted_0004_records u
cross join pilot_records pr;
