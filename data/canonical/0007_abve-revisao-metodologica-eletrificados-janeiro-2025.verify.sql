-- Consulta reutilizável da carga canônica 0007.
-- Retorna absent antes da carga e complete após a execução integral.

with prior_records_snapshot as (
  select jsonb_build_object(
    'sources', (
      select jsonb_agg(to_jsonb(s) order by s.id)
        from public.sources s
    ),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where coalesce(ci.content_fingerprint, '') !~ '^canonical-0007-'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
       where coalesce(ev.lineage_key, '') !~ '^canonical-0007-'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'metric_definitions', (
      select jsonb_agg(to_jsonb(md) order by md.id)
        from public.metric_definitions md
       where md.metric_key <>
         'monthly-light-electrified-vehicle-registrations-brazil-abve-classification'
    ),
    'metric_values', (
      select jsonb_agg(to_jsonb(mv) order by mv.id)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-'
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
    ),
    'event_organizations', (
      select jsonb_agg(
        to_jsonb(eo)
        order by eo.event_id, eo.organization_id, eo.event_role
      )
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'content_item_relations', (
      select jsonb_agg(
        to_jsonb(cir)
        order by
          cir.earlier_content_item_id,
          cir.later_content_item_id,
          cir.relationship_type
      )
        from public.content_item_relations cir
    ),
    'metric_value_resolutions', (
      select jsonb_agg(to_jsonb(mvr) order by mvr.id)
        from public.metric_value_resolutions mvr
    ),
    'metric_value_status_transitions', (
      select jsonb_agg(to_jsonb(mvst) order by mvst.id)
        from public.metric_value_status_transitions mvst
    ),
    'regulatory_instruments', (
      select jsonb_agg(to_jsonb(ri) order by ri.id)
        from public.regulatory_instruments ri
    ),
    'event_regulatory_instruments', (
      select jsonb_agg(
        to_jsonb(eri)
        order by eri.event_id, eri.regulatory_instrument_id, eri.instrument_role
      )
        from public.event_regulatory_instruments eri
    ),
    'regulatory_instrument_relations', (
      select jsonb_agg(
        to_jsonb(rir)
        order by
          rir.source_instrument_id,
          rir.target_instrument_id,
          rir.relationship_type
      )
        from public.regulatory_instrument_relations rir
    ),
    'metric_methodology_versions', (
      select jsonb_agg(to_jsonb(mmv) order by mmv.id)
        from public.metric_methodology_versions mmv
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_components', (
      select jsonb_agg(
        to_jsonb(mmc)
        order by mmc.methodology_version_id, mmc.component_key
      )
        from public.metric_methodology_components mmc
        join public.metric_methodology_versions mmv
          on mmv.id = mmc.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_evidence', (
      select jsonb_agg(
        to_jsonb(mme)
        order by
          mme.methodology_version_id,
          mme.evidence_id,
          mme.relationship_type
      )
        from public.metric_methodology_evidence mme
        join public.metric_methodology_versions mmv
          on mmv.id = mme.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_relations', (
      select jsonb_agg(
        to_jsonb(mmr)
        order by
          mmr.earlier_methodology_version_id,
          mmr.later_methodology_version_id,
          mmr.relationship_type
      )
        from public.metric_methodology_relations mmr
        join public.metric_methodology_versions earlier
          on earlier.id = mmr.earlier_methodology_version_id
        join public.metric_methodology_versions later
          on later.id = mmr.later_methodology_version_id
       where earlier.methodology_key !~ '^canonical-0007-'
         and later.methodology_key !~ '^canonical-0007-'
    ),
    'metric_value_methodology_assignments', (
      select jsonb_agg(to_jsonb(mvma) order by mvma.metric_value_id)
        from public.metric_value_methodology_assignments mvma
        join public.metric_methodology_versions mmv
          on mmv.id = mvma.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    )
  ) as snapshot
),
load_counts as (
  select
    (select count(*) from public.sources where slug = 'abve')
      as reused_sources,
    (select count(*) from public.organizations where slug = 'abve')
      as reused_organizations,
    (select count(*) from public.content_items
      where content_fingerprint =
        'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida')
      as reused_announcement_content,
    (select count(*) from public.content_items
      where content_fingerprint like 'canonical-0007-%')
      as content_items,
    (select count(*) from public.observations
      where observation_fingerprint like 'canonical-0007-%')
      as observations,
    (select count(*) from public.evidence
      where lineage_key like 'canonical-0007-%')
      as evidence,
    (select count(*) from public.events
      where event_fingerprint like 'canonical-0007-%')
      as events,
    (select count(*) from public.metric_definitions
      where metric_key =
        'monthly-light-electrified-vehicle-registrations-brazil-abve-classification')
      as metric_definitions,
    (select count(*)
       from public.metric_values mv
       join public.observations o on o.id = mv.observation_id
      where o.observation_fingerprint like 'canonical-0007-%')
      as metric_values,
    (select count(*)
       from public.event_evidence ee
       join public.events e on e.id = ee.event_id
      where e.event_fingerprint like 'canonical-0007-%')
      as event_evidence,
    (select count(*)
       from public.event_organizations eo
       join public.events e on e.id = eo.event_id
      where e.event_fingerprint like 'canonical-0007-%')
      as event_organizations,
    (select count(*) from public.metric_methodology_versions
      where methodology_key like 'canonical-0007-%')
      as methodology_versions,
    (select count(*)
       from public.metric_methodology_components mmc
       join public.metric_methodology_versions mmv
         on mmv.id = mmc.methodology_version_id
      where mmv.methodology_key like 'canonical-0007-%')
      as methodology_components,
    (select count(*)
       from public.metric_methodology_evidence mme
       join public.metric_methodology_versions mmv
         on mmv.id = mme.methodology_version_id
      where mmv.methodology_key like 'canonical-0007-%')
      as methodology_evidence,
    (select count(*)
       from public.metric_methodology_relations mmr
       join public.metric_methodology_versions earlier
         on earlier.id = mmr.earlier_methodology_version_id
       join public.metric_methodology_versions later
         on later.id = mmr.later_methodology_version_id
      where earlier.methodology_key like 'canonical-0007-%'
        and later.methodology_key like 'canonical-0007-%')
      as methodology_relations,
    (select count(*)
       from public.metric_value_methodology_assignments mvma
       join public.metric_methodology_versions mmv
         on mmv.id = mvma.methodology_version_id
      where mmv.methodology_key like 'canonical-0007-%')
      as methodology_assignments
),
value_chain as (
  select
    count(*) as value_rows,
    count(*) filter (
      where mv.numeric_value = 12556
        and mv.period_start = date '2025-01-01'
        and mv.period_end = date '2025-01-31'
        and mv.geography = 'Brasil'
        and mv.value_status = 'validated'
        and mvma.value_origin = 'source_published'
        and mvma.value_role = 'primary'
        and mmv.methodology_key =
          'canonical-0007-abve-classificacao-vigente-sem-mhev'
        and mmv.applies_from = date '2025-01-01'
    ) as exact_primary_rows,
    count(*) filter (
      where mv.numeric_value = 16502
        and mv.period_start = date '2025-01-01'
        and mv.period_end = date '2025-01-31'
        and mv.geography = 'Brasil'
        and mv.value_status = 'validated'
        and mvma.value_origin = 'source_published'
        and mvma.value_role = 'counterfactual'
        and mmv.methodology_key =
          'canonical-0007-abve-classificacao-anterior-com-mhev'
        and mmv.applies_from is null
    ) as exact_counterfactual_rows,
    array_agg(mv.numeric_value order by mvma.value_role desc)
      as numeric_values,
    array_agg(mvma.value_role order by mvma.value_role desc)
      as value_roles,
    count(distinct mv.observation_id) as distinct_observations,
    count(distinct mv.metric_definition_id) as distinct_definitions
  from public.metric_values mv
  join public.observations o on o.id = mv.observation_id
  join public.metric_value_methodology_assignments mvma
    on mvma.metric_value_id = mv.id
  join public.metric_methodology_versions mmv
    on mmv.id = mvma.methodology_version_id
  where o.observation_fingerprint in (
    'canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente',
    'canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior'
  )
),
component_comparison as (
  select
    count(*) as component_rows,
    count(*) filter (
      where mmv.methodology_key =
        'canonical-0007-abve-classificacao-anterior-com-mhev'
        and mmc.component_role = 'included'
    ) as prior_included,
    count(*) filter (
      where mmv.methodology_key =
        'canonical-0007-abve-classificacao-vigente-sem-mhev'
        and mmc.component_role = 'included'
    ) as current_included,
    count(*) filter (
      where mmv.methodology_key =
        'canonical-0007-abve-classificacao-vigente-sem-mhev'
        and mmc.component_key = 'mhev'
        and mmc.component_role = 'reported_separately'
    ) as current_mhev_separate
  from public.metric_methodology_components mmc
  join public.metric_methodology_versions mmv
    on mmv.id = mmc.methodology_version_id
  where mmv.methodology_key like 'canonical-0007-%'
),
methodology_chain as (
  select
    count(*) as relation_rows,
    count(*) filter (
      where earlier.methodology_key =
        'canonical-0007-abve-classificacao-anterior-com-mhev'
        and later.methodology_key =
          'canonical-0007-abve-classificacao-vigente-sem-mhev'
        and mmr.relationship_type = 'supersedes'
        and mmr.effective_on = date '2025-01-01'
        and later.applies_from = mmr.effective_on
        and earlier.metric_definition_id = later.metric_definition_id
    ) as exact_relation_rows
  from public.metric_methodology_relations mmr
  join public.metric_methodology_versions earlier
    on earlier.id = mmr.earlier_methodology_version_id
  join public.metric_methodology_versions later
    on later.id = mmr.later_methodology_version_id
  where earlier.methodology_key like 'canonical-0007-%'
     or later.methodology_key like 'canonical-0007-%'
),
methodology_evidence_roles as (
  select
    count(*) filter (where relationship_type = 'defines') as defines_rows,
    count(*) filter (where relationship_type = 'announces') as announces_rows,
    count(*) filter (where relationship_type = 'confirms') as confirms_rows,
    count(*) filter (where relationship_type = 'contextualizes')
      as contextualizes_rows
  from public.metric_methodology_evidence mme
  join public.metric_methodology_versions mmv
    on mmv.id = mme.methodology_version_id
  where mmv.methodology_key like 'canonical-0007-%'
),
current_methodology as (
  select count(*) as rows
  from public.metric_methodology_versions candidate
  where candidate.methodology_key =
      'canonical-0007-abve-classificacao-vigente-sem-mhev'
    and candidate.applies_from <= date '2025-01-01'
    and not exists (
      select 1
      from public.metric_methodology_relations next_relation
      where next_relation.earlier_methodology_version_id = candidate.id
        and next_relation.relationship_type = 'supersedes'
        and next_relation.effective_on <= date '2025-01-01'
    )
),
mhev_context as (
  select
    count(*) as observation_rows,
    count(*) filter (
      where o.normalized_claim =
        'Brasil: 3.946 emplacamentos de MHEV em janeiro de 2025, publicados separadamente do total principal da nova classificação.'
        and not exists (
          select 1
          from public.metric_values mv
          where mv.observation_id = o.id
        )
    ) as exact_context_only_rows
  from public.observations o
  where o.observation_fingerprint =
    'canonical-0007-abve-mhev-janeiro-2025'
),
event_chain as (
  select
    count(*) as event_rows,
    count(*) filter (
      where e.event_phase = 'announcement'
        and e.event_date = date '2025-01-06'
    ) as announcement_rows,
    count(*) filter (
      where e.event_phase = 'publication'
        and e.event_date = date '2025-02-10'
    ) as publication_rows,
    count(*) filter (
      where e.event_phase = 'update'
        and e.event_date = date '2026-02-09'
    ) as continuity_rows,
    count(*) filter (
      where e.verification_level = 'confirmed'
        and e.workflow_status = 'accepted'
    ) as accepted_confirmed_rows
  from public.events e
  where e.event_fingerprint like 'canonical-0007-%'
),
relation_cycles as (
  with recursive paths as (
    select
      earlier_methodology_version_id as origin_id,
      later_methodology_version_id as current_id,
      array[
        earlier_methodology_version_id,
        later_methodology_version_id
      ]::bigint[] as visited,
      later_methodology_version_id =
        earlier_methodology_version_id as has_cycle
    from public.metric_methodology_relations
    union all
    select
      p.origin_id,
      r.later_methodology_version_id,
      p.visited || r.later_methodology_version_id,
      r.later_methodology_version_id = any(p.visited)
    from paths p
    join public.metric_methodology_relations r
      on r.earlier_methodology_version_id = p.current_id
    where not p.has_cycle
  )
  select count(*) from paths where has_cycle
),
unwanted_records as (
  select
    (select count(*) from public.metric_value_resolutions
      where resolution_key like 'canonical-0007-%')
    + (select count(*) from public.metric_value_status_transitions
        where transition_key like 'canonical-0007-%')
    + (select count(*)
         from public.content_item_relations cir
         join public.content_items earlier
           on earlier.id = cir.earlier_content_item_id
         join public.content_items later
           on later.id = cir.later_content_item_id
        where earlier.content_fingerprint like 'canonical-0007-%'
           or later.content_fingerprint like 'canonical-0007-%')
    + (select count(*)
         from public.metric_value_methodology_assignments
        where value_origin <> 'source_published')
      as count
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
        where event_fingerprint like 'pilot-%')
      as count
)
select
  md5(p.snapshot::text) as prior_records_signature,
  case
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.reused_announcement_content = 1
     and c.content_items = 0
     and c.observations = 0
     and c.evidence = 0
     and c.events = 0
     and c.metric_definitions = 0
     and c.metric_values = 0
     and c.event_evidence = 0
     and c.event_organizations = 0
     and c.methodology_versions = 0
     and c.methodology_components = 0
     and c.methodology_evidence = 0
     and c.methodology_relations = 0
     and c.methodology_assignments = 0
     and u.count = 0
      then 'absent'
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.reused_announcement_content = 1
     and c.content_items = 2
     and c.observations = 5
     and c.evidence = 5
     and c.events = 3
     and c.metric_definitions = 1
     and c.metric_values = 2
     and c.event_evidence = 5
     and c.event_organizations = 3
     and c.methodology_versions = 2
     and c.methodology_components = 10
     and c.methodology_evidence = 6
     and c.methodology_relations = 1
     and c.methodology_assignments = 2
     and v.value_rows = 2
     and v.exact_primary_rows = 1
     and v.exact_counterfactual_rows = 1
     and v.numeric_values = array[12556::numeric, 16502::numeric]
     and v.value_roles = array['primary', 'counterfactual']::text[]
     and v.distinct_observations = 2
     and v.distinct_definitions = 1
     and cc.component_rows = 10
     and cc.prior_included = 5
     and cc.current_included = 4
     and cc.current_mhev_separate = 1
     and mc.relation_rows = 1
     and mc.exact_relation_rows = 1
     and mer.defines_rows = 2
     and mer.announces_rows = 1
     and mer.confirms_rows = 1
     and mer.contextualizes_rows = 2
     and cm.rows = 1
     and mh.observation_rows = 1
     and mh.exact_context_only_rows = 1
     and ec.event_rows = 3
     and ec.announcement_rows = 1
     and ec.publication_rows = 1
     and ec.continuity_rows = 1
     and ec.accepted_confirmed_rows = 3
     and rc.count = 0
     and u.count = 0
      then 'complete'
    else 'unexpected'
  end as load_0007_state,
  c.*,
  v.value_rows,
  v.exact_primary_rows,
  v.exact_counterfactual_rows,
  v.numeric_values,
  v.value_roles,
  v.distinct_observations,
  v.distinct_definitions,
  cc.component_rows,
  cc.prior_included,
  cc.current_included,
  cc.current_mhev_separate,
  mc.relation_rows,
  mc.exact_relation_rows,
  mer.defines_rows,
  mer.announces_rows,
  mer.confirms_rows,
  mer.contextualizes_rows,
  cm.rows as current_methodology_rows,
  mh.observation_rows as mhev_observation_rows,
  mh.exact_context_only_rows,
  ec.event_rows,
  ec.announcement_rows,
  ec.publication_rows,
  ec.continuity_rows,
  ec.accepted_confirmed_rows,
  rc.count as relation_cycles,
  u.count as unwanted_records,
  pr.count as pilot_records
from prior_records_snapshot p
cross join load_counts c
cross join value_chain v
cross join component_comparison cc
cross join methodology_chain mc
cross join methodology_evidence_roles mer
cross join current_methodology cm
cross join mhev_context mh
cross join event_chain ec
cross join relation_cycles rc
cross join unwanted_records u
cross join pilot_records pr;
