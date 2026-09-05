-- Verificação reutilizável da carga canônica 0003.
-- Execute antes e depois da validação ou persistência. A assinatura conjunta
-- das cargas 0001 e 0002 deve permanecer idêntica, e o estado da 0003 deve
-- mudar somente de absent para complete quando a persistência for autorizada.

with prior_loads_snapshot as (
  select jsonb_build_object(
    'sources', (
      select jsonb_agg(to_jsonb(s) order by s.id)
        from public.sources s
       where s.slug in (
         'jeep-stellantis-media',
         'bmw-group-pressclub-brasil',
         'diario-do-grande-abc'
       )
    ),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where ci.content_fingerprint in (
         'canonical-0001-jeep-avenger-2026-08-13',
         'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
         'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
       )
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where o.observation_fingerprint in (
         'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13',
         'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27',
         'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27'
       )
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
       where ev.lineage_key in (
         'canonical-0001-jeep-avenger-lancamento-2026-08-13',
         'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
         'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
       )
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where e.event_fingerprint in (
         'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
         'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
       )
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
       where org.slug in ('jeep', 'bmw')
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where e.event_fingerprint in (
         'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
         'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
       )
    ),
    'event_organizations', (
      select jsonb_agg(to_jsonb(eo) order by eo.event_id, eo.organization_id, eo.event_role)
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where e.event_fingerprint in (
         'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
         'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
       )
    )
  ) as snapshot
),
load_0003_counts as (
  select
    (select count(*) from public.sources
      where slug = 'abve') as sources,
    (select count(*) from public.content_items
      where content_fingerprint = 'canonical-0003-abve-data-bev-julho-2026-2026-08-11') as content_items,
    (select count(*) from public.observations
      where observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026') as observations,
    (select count(*) from public.evidence
      where lineage_key = 'canonical-0003-abve-data-bev-julho-2026') as evidence,
    (select count(*) from public.events
      where event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11') as events,
    (select count(*) from public.organizations
      where slug = 'abve') as organizations,
    (select count(*) from public.metric_definitions
      where metric_key = 'monthly-light-bev-registrations-brazil') as metric_definitions,
    (select count(*)
       from public.metric_values mv
       join public.metric_definitions md on md.id = mv.metric_definition_id
       join public.observations o on o.id = mv.observation_id
      where md.metric_key = 'monthly-light-bev-registrations-brazil'
        and o.observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026') as metric_values,
    (select count(*)
       from public.event_evidence ee
       join public.events e on e.id = ee.event_id
      where e.event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11') as event_evidence,
    (select count(*)
       from public.event_organizations eo
       join public.events e on e.id = eo.event_id
      where e.event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11') as event_organizations
),
load_0003_chain as (
  select
    count(*) as chain_rows,
    count(*) filter (
      where ee.relationship_type = 'supports'
        and ev.lineage_status = 'established'
        and ev.origin_content_item_id = ci.id
    ) as established_supports,
    count(*) filter (
      where md.metric_key = 'monthly-light-bev-registrations-brazil'
        and md.status = 'approved'
        and mv.numeric_value = 25782
        and mv.period_start = date '2026-07-01'
        and mv.period_end = date '2026-07-31'
        and mv.geography = 'Brasil'
        and mv.value_status = 'validated'
    ) as validated_metric_rows
  from public.events e
  left join public.event_evidence ee on ee.event_id = e.id
  left join public.evidence ev on ev.id = ee.evidence_id
  left join public.observations o on o.id = ev.observation_id
  left join public.content_items ci on ci.id = o.content_item_id
  left join public.sources s on s.id = ci.source_id
  left join public.metric_values mv on mv.observation_id = o.id
  left join public.metric_definitions md on md.id = mv.metric_definition_id
  where e.event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11'
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
    when c.sources = 0
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
    when c.sources = 1
     and c.content_items = 1
     and c.observations = 1
     and c.evidence = 1
     and c.events = 1
     and c.organizations = 1
     and c.metric_definitions = 1
     and c.metric_values = 1
     and c.event_evidence = 1
     and c.event_organizations = 1
     and ch.chain_rows = 1
     and ch.established_supports = 1
     and ch.validated_metric_rows = 1
     and exists (
       select 1
         from public.events e
        where e.event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11'
          and e.event_type = 'market_data'
          and e.event_phase = 'publication'
          and e.event_date = date '2026-08-11'
          and e.workflow_status = 'accepted'
          and e.verification_level = 'confirmed'
     )
      then 'complete'
    else 'unexpected'
  end as load_0003_state,
  c.sources,
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
  ch.established_supports,
  ch.validated_metric_rows,
  pr.count as pilot_records
from prior_loads_snapshot p
cross join load_0003_counts c
cross join load_0003_chain ch
cross join pilot_records pr;
