-- Verificação reutilizável da carga canônica 0005.
-- Execute antes e depois da validação ou persistência. A assinatura conjunta
-- das cargas 0001, 0002 e 0003 deve permanecer idêntica. A carga 0004 deve
-- permanecer ausente neste pacote.

with prior_loads_snapshot as (
  select jsonb_build_object(
    'sources', (
      select jsonb_agg(to_jsonb(s) order by s.id)
        from public.sources s
       where s.slug in (
         'jeep-stellantis-media',
         'bmw-group-pressclub-brasil',
         'diario-do-grande-abc',
         'abve'
       )
    ),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where ci.content_fingerprint ~ '^canonical-000[1-3]-'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where o.observation_fingerprint ~ '^canonical-000[1-3]-'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
        join public.observations o on o.id = ev.observation_id
       where o.observation_fingerprint ~ '^canonical-000[1-3]-'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where e.event_fingerprint ~ '^canonical-000[1-3]-'
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
       where org.slug in ('jeep', 'bmw', 'abve')
    ),
    'metric_definitions', (
      select jsonb_agg(to_jsonb(md) order by md.id)
        from public.metric_definitions md
       where md.metric_key = 'monthly-light-bev-registrations-brazil'
    ),
    'metric_values', (
      select jsonb_agg(to_jsonb(mv) order by mv.id)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where o.observation_fingerprint ~ '^canonical-000[1-3]-'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where e.event_fingerprint ~ '^canonical-000[1-3]-'
    ),
    'event_organizations', (
      select jsonb_agg(to_jsonb(eo) order by eo.event_id, eo.organization_id, eo.event_role)
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where e.event_fingerprint ~ '^canonical-000[1-3]-'
    )
  ) as snapshot
),
load_0005_counts as (
  select
    (select count(*) from public.sources where slug = 'abve') as reused_sources,
    (select count(*) from public.organizations where slug = 'abve') as reused_organizations,
    (select count(*) from public.content_items
      where content_fingerprint ~ '^canonical-0005-') as content_items,
    (select count(*) from public.observations
      where observation_fingerprint ~ '^canonical-0005-') as observations,
    (select count(*) from public.evidence
      where lineage_key = 'canonical-0005-abve-tupi-base-nacional-fevereiro-2026') as evidence,
    (select count(*) from public.events
      where event_fingerprint ~ '^canonical-0005-') as events,
    (select count(*) from public.organizations
      where slug = 'tupi-mobilidade') as organizations,
    (select count(*) from public.metric_definitions
      where metric_key = 'public-semi-public-charging-points-brazil') as metric_definitions,
    (select count(*)
       from public.metric_values mv
       join public.observations o on o.id = mv.observation_id
      where o.observation_fingerprint ~ '^canonical-0005-') as metric_values,
    (select count(*)
       from public.event_evidence ee
       join public.events e on e.id = ee.event_id
      where e.event_fingerprint ~ '^canonical-0005-') as event_evidence,
    (select count(*)
       from public.event_organizations eo
       join public.events e on e.id = eo.event_id
      where e.event_fingerprint ~ '^canonical-0005-') as event_organizations
),
load_0005_chain as (
  select
    count(*) as chain_rows,
    count(*) filter (
      where ee.relationship_type = 'supports'
        and ev.lineage_status = 'likely_shared'
        and ev.origin_content_item_id = ci.id
    ) as likely_shared_supports,
    count(*) filter (
      where md.metric_key = 'public-semi-public-charging-points-brazil'
        and md.status = 'approved'
        and mv.period_start = date '2026-02-01'
        and mv.period_end = date '2026-02-28'
        and mv.geography = 'Brasil'
        and mv.value_status = 'provisional'
    ) as provisional_same_scope,
    count(*) filter (
      where e.event_type = 'market_data'
        and e.event_phase = 'publication'
        and e.date_precision = 'day'
        and e.geography = 'Brasil'
        and e.workflow_status = 'accepted'
        and e.verification_level = 'confirmed'
    ) as accepted_confirmed_events,
    array_agg(mv.numeric_value order by mv.numeric_value)
      filter (where mv.numeric_value is not null) as numeric_values
  from public.events e
  left join public.event_evidence ee on ee.event_id = e.id
  left join public.evidence ev on ev.id = ee.evidence_id
  left join public.observations o on o.id = ev.observation_id
  left join public.content_items ci on ci.id = o.content_item_id
  left join public.sources s on s.id = ci.source_id
  left join public.metric_values mv on mv.observation_id = o.id
  left join public.metric_definitions md on md.id = mv.metric_definition_id
  where e.event_fingerprint ~ '^canonical-0005-'
),
load_0005_subjects as (
  select count(*) as count
    from public.event_organizations eo
    join public.events e on e.id = eo.event_id
    join public.organizations org on org.id = eo.organization_id
   where e.event_fingerprint ~ '^canonical-0005-'
     and org.slug in ('abve', 'tupi-mobilidade')
     and eo.event_role = 'subject'
),
load_0004_records as (
  select
    (select count(*) from public.content_items
      where content_fingerprint like 'canonical-0004-%')
    + (select count(*) from public.observations
        where observation_fingerprint like 'canonical-0004-%')
    + (select count(*) from public.evidence
        where lineage_key like 'canonical-0004-%')
    + (select count(*) from public.events
        where event_fingerprint like 'canonical-0004-%') as count
),
pilot_records as (
  select
    (select count(*) from public.content_items
      where content_fingerprint like 'pilot-%')
    + (select count(*) from public.observations
        where observation_fingerprint like 'pilot-%')
    + (select count(*) from public.evidence
        where lineage_key like 'pilot-%')
    + (select count(*) from public.events
        where event_fingerprint like 'pilot-%') as count
)
select
  md5(p.snapshot::text) as prior_loads_signature,
  case
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.content_items = 0
     and c.observations = 0
     and c.evidence = 0
     and c.events = 0
     and c.organizations = 0
     and c.metric_definitions = 0
     and c.metric_values = 0
     and c.event_evidence = 0
     and c.event_organizations = 0
      then 'absent'
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.content_items = 2
     and c.observations = 2
     and c.evidence = 2
     and c.events = 2
     and c.organizations = 1
     and c.metric_definitions = 1
     and c.metric_values = 2
     and c.event_evidence = 2
     and c.event_organizations = 4
     and ch.chain_rows = 2
     and ch.likely_shared_supports = 2
     and ch.provisional_same_scope = 2
     and ch.accepted_confirmed_events = 2
     and ch.numeric_values = array[21060::numeric, 21061::numeric]
     and sub.count = 4
      then 'complete'
    else 'unexpected'
  end as load_0005_state,
  c.reused_sources,
  c.reused_organizations,
  c.content_items,
  c.observations,
  c.evidence,
  c.events,
  c.organizations,
  c.metric_definitions,
  c.metric_values,
  c.event_evidence,
  c.event_organizations,
  ch.chain_rows,
  ch.likely_shared_supports,
  ch.provisional_same_scope,
  ch.accepted_confirmed_events,
  ch.numeric_values,
  sub.count as subject_links,
  l4.count as load_0004_records,
  pr.count as pilot_records
from prior_loads_snapshot p
cross join load_0005_counts c
cross join load_0005_chain ch
cross join load_0005_subjects sub
cross join load_0004_records l4
cross join pilot_records pr;
