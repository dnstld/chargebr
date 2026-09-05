-- Verificação reutilizável da carga canônica 0002.
-- Execute antes e depois da validação ou persistência. A assinatura da carga
-- 0001 deve permanecer idêntica e o estado da 0002 deve mudar somente de
-- absent para complete quando a persistência for autorizada.

with load_0001_snapshot as (
  select jsonb_build_object(
    'sources', (
      select jsonb_agg(to_jsonb(s) order by s.id)
        from public.sources s
       where s.slug = 'jeep-stellantis-media'
    ),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where ci.content_fingerprint = 'canonical-0001-jeep-avenger-2026-08-13'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where o.observation_fingerprint = 'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
       where ev.lineage_key = 'canonical-0001-jeep-avenger-lancamento-2026-08-13'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where e.event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13'
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
       where org.slug = 'jeep'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where e.event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13'
    ),
    'event_organizations', (
      select jsonb_agg(to_jsonb(eo) order by eo.event_id, eo.organization_id, eo.event_role)
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where e.event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13'
    )
  ) as snapshot
),
load_0002_counts as (
  select
    (select count(*) from public.sources
      where slug in ('bmw-group-pressclub-brasil', 'diario-do-grande-abc')) as sources,
    (select count(*) from public.content_items
      where content_fingerprint in (
        'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
        'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
      )) as content_items,
    (select count(*) from public.observations
      where observation_fingerprint in (
        'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27',
        'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27'
      )) as observations,
    (select count(*) from public.evidence
      where lineage_key in (
        'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
        'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
      )) as evidence,
    (select count(*) from public.events
      where event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27') as events,
    (select count(*) from public.organizations
      where slug = 'bmw') as organizations,
    (select count(*)
       from public.event_evidence ee
       join public.events e on e.id = ee.event_id
      where e.event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27') as event_evidence,
    (select count(*)
       from public.event_organizations eo
       join public.events e on e.id = eo.event_id
      where e.event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27') as event_organizations
),
load_0002_chain as (
  select
    count(*) as chain_rows,
    count(distinct s.id) as distinct_sources,
    count(distinct o.id) as distinct_observations,
    count(distinct ev.id) as distinct_evidence,
    count(*) filter (
      where ee.relationship_type = 'supports'
        and ev.lineage_status = 'established'
        and ev.origin_content_item_id = ci.id
    ) as established_supports
  from public.events e
  left join public.event_evidence ee on ee.event_id = e.id
  left join public.evidence ev on ev.id = ee.evidence_id
  left join public.observations o on o.id = ev.observation_id
  left join public.content_items ci on ci.id = o.content_item_id
  left join public.sources s on s.id = ci.source_id
  where e.event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
)
select
  md5(load_0001_snapshot.snapshot::text) as load_0001_signature,
  case
    when c.sources = 0
     and c.content_items = 0
     and c.observations = 0
     and c.evidence = 0
     and c.events = 0
     and c.organizations = 0
     and c.event_evidence = 0
     and c.event_organizations = 0
      then 'absent'
    when c.sources = 2
     and c.content_items = 2
     and c.observations = 2
     and c.evidence = 2
     and c.events = 1
     and c.organizations = 1
     and c.event_evidence = 2
     and c.event_organizations = 1
     and ch.chain_rows = 2
     and ch.distinct_sources = 2
     and ch.distinct_observations = 2
     and ch.distinct_evidence = 2
     and ch.established_supports = 2
     and exists (
       select 1
         from public.events e
        where e.event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
          and e.workflow_status = 'accepted'
          and e.verification_level = 'corroborated'
     )
      then 'complete'
    else 'unexpected'
  end as load_0002_state,
  c.sources,
  c.content_items,
  c.observations,
  c.evidence,
  c.events,
  c.organizations,
  c.event_evidence,
  c.event_organizations,
  ch.chain_rows,
  ch.distinct_sources,
  ch.distinct_observations,
  ch.distinct_evidence,
  ch.established_supports
from load_0001_snapshot
cross join load_0002_counts c
cross join load_0002_chain ch;
