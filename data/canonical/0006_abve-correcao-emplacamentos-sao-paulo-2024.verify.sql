-- Verificação reutilizável da carga canônica 0006.
-- Execute antes e depois da validação ou persistência. O resultado deve ser
-- absent antes da carga, complete dentro da transação e absent após ROLLBACK.

with prior_records_snapshot as (
  select jsonb_build_object(
    'sources', (select jsonb_agg(to_jsonb(s) order by s.id) from public.sources s),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where coalesce(ci.content_fingerprint, '') !~ '^canonical-0006-'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0006-'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
        join public.observations o on o.id = ev.observation_id
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0006-'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0006-'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0006-'
    ),
    'metric_definitions', (
      select jsonb_agg(to_jsonb(md) order by md.id)
        from public.metric_definitions md
       where md.metric_key <> 'annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification'
    ),
    'metric_values', (
      select jsonb_agg(to_jsonb(mv) order by mv.id)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0006-'
    ),
    'organizations', (select jsonb_agg(to_jsonb(org) order by org.id) from public.organizations org),
    'event_organizations', (
      select jsonb_agg(to_jsonb(eo) order by eo.event_id, eo.organization_id, eo.event_role)
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0006-'
    ),
    'content_item_relations', (
      select jsonb_agg(to_jsonb(cir) order by cir.earlier_content_item_id, cir.later_content_item_id, cir.relationship_type)
        from public.content_item_relations cir
        join public.content_items earlier on earlier.id = cir.earlier_content_item_id
        join public.content_items later on later.id = cir.later_content_item_id
       where coalesce(earlier.content_fingerprint, '') !~ '^canonical-0006-'
         and coalesce(later.content_fingerprint, '') !~ '^canonical-0006-'
    ),
    'metric_value_resolutions', (
      select jsonb_agg(to_jsonb(mvr) order by mvr.id)
        from public.metric_value_resolutions mvr
       where mvr.resolution_key <> 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024'
    ),
    'metric_value_status_transitions', (
      select jsonb_agg(to_jsonb(mvst) order by mvst.id)
        from public.metric_value_status_transitions mvst
        join public.metric_value_resolutions mvr on mvr.id = mvst.resolution_id
       where mvr.resolution_key <> 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024'
    )
  ) as snapshot
),
load_0006_counts as (
  select
    (select count(*) from public.sources where slug = 'abve') as reused_sources,
    (select count(*) from public.organizations where slug = 'abve') as reused_organizations,
    (select count(*) from public.content_items
      where content_fingerprint ~ '^canonical-0006-') as content_items,
    (select count(*) from public.observations
      where observation_fingerprint ~ '^canonical-0006-') as observations,
    (select count(*) from public.evidence
      where lineage_key = 'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024') as evidence,
    (select count(*) from public.events
      where event_fingerprint ~ '^canonical-0006-') as events,
    (select count(*) from public.metric_definitions
      where metric_key = 'annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification') as metric_definitions,
    (select count(*)
       from public.metric_values mv
       join public.observations o on o.id = mv.observation_id
      where o.observation_fingerprint ~ '^canonical-0006-') as metric_values,
    (select count(*)
       from public.event_evidence ee
       join public.events e on e.id = ee.event_id
      where e.event_fingerprint ~ '^canonical-0006-') as event_evidence,
    (select count(*)
       from public.event_organizations eo
       join public.events e on e.id = eo.event_id
      where e.event_fingerprint ~ '^canonical-0006-') as event_organizations,
    (select count(*)
       from public.content_item_relations cir
       join public.content_items earlier on earlier.id = cir.earlier_content_item_id
      where earlier.content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao') as content_item_relations,
    (select count(*) from public.metric_value_resolutions
      where resolution_key = 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024') as resolutions,
    (select count(*) from public.metric_value_status_transitions
      where transition_key like 'canonical-0006-%') as transitions
),
version_relation as (
  select
    count(*) as relation_rows,
    count(*) filter (
      where earlier.source_id = later.source_id
        and earlier.url = later.url
        and earlier.published_on = date '2025-01-06'
        and later.published_on = date '2025-01-06'
        and earlier.retention_class = 'metadata_only'
        and earlier.raw_capture_reference is null
        and later.retention_class = 'external_reference'
        and later.raw_capture_reference = later.url
        and cir.relationship_type = 'corrects'
        and cir.relationship_date = date '2025-01-07'
        and ev.origin_content_item_id = later.id
        and ev.lineage_status = 'established'
    ) as exact_relation_rows
  from public.content_item_relations cir
  join public.content_items earlier on earlier.id = cir.earlier_content_item_id
  join public.content_items later on later.id = cir.later_content_item_id
  join public.evidence ev on ev.id = cir.evidence_id
  where earlier.content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao'
    and later.content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida'
),
metric_chain as (
  select
    count(*) as value_rows,
    count(*) filter (
      where mv.period_start = date '2024-01-01'
        and mv.period_end = date '2024-12-31'
        and mv.geography = 'Estado de São Paulo, Brasil'
        and md.metric_domain = 'vehicle_market'
        and md.value_type = 'integer'
        and md.canonical_unit = 'vehicle_registration'
        and md.aggregation_type = 'count'
        and md.temporal_granularity = 'year'
        and md.geographic_granularity = 'state'
        and md.status = 'approved'
    ) as exact_scope_rows,
    array_agg(mv.numeric_value order by mv.numeric_value) as numeric_values,
    array_agg(mv.value_status order by mv.numeric_value) as current_statuses
  from public.metric_values mv
  join public.observations o on o.id = mv.observation_id
  join public.metric_definitions md on md.id = mv.metric_definition_id
  where o.observation_fingerprint ~ '^canonical-0006-'
),
transition_chain as (
  select
    count(*) as transition_rows,
    count(*) filter (
      where mv.numeric_value = 24435
        and mvst.transition_order = 1
        and mvst.from_status = 'provisional'
        and mvst.to_status = 'rejected'
        and replacement.numeric_value = 56819
        and mv.value_status = 'rejected'
    ) as rejected_with_replacement,
    count(*) filter (
      where mv.numeric_value = 56819
        and mvst.transition_order = 1
        and mvst.from_status = 'provisional'
        and mvst.to_status = 'validated'
        and mvst.replacement_metric_value_id is null
        and mv.value_status = 'validated'
    ) as validated_without_replacement,
    count(*) filter (
      where mvr.resolution_type = 'material_correction'
        and mvr.reviewer_name = 'Denis Toledo'
        and mvr.reviewed_on = date '2026-09-08'
        and mvr.decision_reference = 'docs/revisao-carga-canonica-0006.md'
        and e.event_fingerprint = 'canonical-0006-abve-corrige-56819-estado-sp-2025-01-07'
        and e.event_phase = 'update'
        and e.event_date = date '2025-01-07'
    ) as exact_resolution_rows
  from public.metric_value_status_transitions mvst
  join public.metric_value_resolutions mvr on mvr.id = mvst.resolution_id
  join public.events e on e.id = mvr.resolution_event_id
  join public.metric_values mv on mv.id = mvst.metric_value_id
  left join public.metric_values replacement on replacement.id = mvst.replacement_metric_value_id
  where mvr.resolution_key = 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024'
),
evidence_chain as (
  select
    count(*) as evidence_rows,
    count(*) filter (
      where ev.lineage_status = 'established'
        and ev.origin_content_item_id = corrected.id
        and corrected.content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida'
    ) as established_from_accessible_version,
    count(*) filter (
      where o.observation_fingerprint = 'canonical-0006-abve-sp-24435-primeira-edicao'
        and ev.notes like '%não possui captura primária integral%'
    ) as disclosed_reconstruction,
    count(*) filter (
      where o.observation_fingerprint = 'canonical-0006-abve-sp-56819-edicao-corrigida'
        and ev.notes like '%18h12%'
    ) as correction_time_preserved
  from public.evidence ev
  join public.observations o on o.id = ev.observation_id
  join public.content_items corrected on corrected.id = ev.origin_content_item_id
  where ev.lineage_key = 'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024'
),
event_chain as (
  select
    count(*) as event_rows,
    count(*) filter (
      where event_phase = 'publication'
        and event_date = date '2025-01-06'
        and verification_level = 'confirmed'
        and workflow_status = 'accepted'
    ) as publication_rows,
    count(*) filter (
      where event_phase = 'update'
        and event_date = date '2025-01-07'
        and verification_level = 'confirmed'
        and workflow_status = 'accepted'
        and summary like '%18h12%'
    ) as correction_rows
  from public.events
  where event_fingerprint ~ '^canonical-0006-'
),
relation_cycles as (
  with recursive walk(origin_id, item_id, path, cycle) as (
    select
      cir.earlier_content_item_id,
      cir.later_content_item_id,
      array[cir.earlier_content_item_id, cir.later_content_item_id]::bigint[],
      false
    from public.content_item_relations cir
    union all
    select
      w.origin_id,
      cir.later_content_item_id,
      w.path || cir.later_content_item_id,
      cir.later_content_item_id = any(w.path)
    from walk w
    join public.content_item_relations cir on cir.earlier_content_item_id = w.item_id
    where not w.cycle
  )
  select count(*) filter (where cycle) as count from walk
),
load_0004_records as (
  select
    (select count(*) from public.content_items where content_fingerprint like 'canonical-0004-%')
    + (select count(*) from public.observations where observation_fingerprint like 'canonical-0004-%')
    + (select count(*) from public.evidence where lineage_key like 'canonical-0004-%')
    + (select count(*) from public.events where event_fingerprint like 'canonical-0004-%') as count
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
     and c.content_items = 0
     and c.observations = 0
     and c.evidence = 0
     and c.events = 0
     and c.metric_definitions = 0
     and c.metric_values = 0
     and c.event_evidence = 0
     and c.event_organizations = 0
     and c.content_item_relations = 0
     and c.resolutions = 0
     and c.transitions = 0
      then 'absent'
    when c.reused_sources = 1
     and c.reused_organizations = 1
     and c.content_items = 2
     and c.observations = 2
     and c.evidence = 2
     and c.events = 2
     and c.metric_definitions = 1
     and c.metric_values = 2
     and c.event_evidence = 3
     and c.event_organizations = 2
     and c.content_item_relations = 1
     and c.resolutions = 1
     and c.transitions = 2
     and vr.relation_rows = 1
     and vr.exact_relation_rows = 1
     and mc.value_rows = 2
     and mc.exact_scope_rows = 2
     and mc.numeric_values = array[24435::numeric, 56819::numeric]
     and mc.current_statuses = array['rejected'::text, 'validated'::text]
     and tc.transition_rows = 2
     and tc.rejected_with_replacement = 1
     and tc.validated_without_replacement = 1
     and tc.exact_resolution_rows = 2
     and ec.evidence_rows = 2
     and ec.established_from_accessible_version = 2
     and ec.disclosed_reconstruction = 1
     and ec.correction_time_preserved = 1
     and evt.event_rows = 2
     and evt.publication_rows = 1
     and evt.correction_rows = 1
     and rc.count = 0
      then 'complete'
    else 'unexpected'
  end as load_0006_state,
  c.*,
  vr.relation_rows,
  vr.exact_relation_rows,
  mc.exact_scope_rows,
  mc.numeric_values,
  mc.current_statuses,
  tc.rejected_with_replacement,
  tc.validated_without_replacement,
  tc.exact_resolution_rows,
  ec.established_from_accessible_version,
  ec.disclosed_reconstruction,
  ec.correction_time_preserved,
  evt.publication_rows,
  evt.correction_rows,
  rc.count as relation_cycles,
  l4.count as load_0004_records,
  pr.count as pilot_records
from prior_records_snapshot p
cross join load_0006_counts c
cross join version_relation vr
cross join metric_chain mc
cross join transition_chain tc
cross join evidence_chain ec
cross join event_chain evt
cross join relation_cycles rc
cross join load_0004_records l4
cross join pilot_records pr;
