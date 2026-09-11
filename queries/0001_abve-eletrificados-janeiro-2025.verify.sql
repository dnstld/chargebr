with recursive
target_metric as (
  select md.*
  from public.metric_definitions md
  where md.metric_key = 'monthly-light-electrified-vehicle-registrations-brazil-abve-classification'
    and md.canonical_unit = 'vehicle_registration'
    and md.temporal_granularity = 'month'
    and md.geographic_granularity = 'national'
),
target_methods as (
  select mmv.*
  from public.metric_methodology_versions mmv
  join target_metric md on md.id = mmv.metric_definition_id
),
target_relations as (
  select r.*
  from public.metric_methodology_relations r
  join target_methods earlier
    on earlier.id = r.earlier_methodology_version_id
  join target_methods later
    on later.id = r.later_methodology_version_id
),
relation_walk (current_id, visited_ids, has_cycle) as (
  select
    r.later_methodology_version_id,
    array[
      r.earlier_methodology_version_id,
      r.later_methodology_version_id
    ]::bigint[],
    r.earlier_methodology_version_id = r.later_methodology_version_id
  from target_relations r

  union all

  select
    r.later_methodology_version_id,
    rw.visited_ids || r.later_methodology_version_id,
    r.later_methodology_version_id = any (rw.visited_ids)
  from relation_walk rw
  join target_relations r
    on r.earlier_methodology_version_id = rw.current_id
  where not rw.has_cycle
),
current_methods as (
  select tm.*
  from target_methods tm
  where (tm.applies_from is null or tm.applies_from <= date '2025-01-01')
    and not exists (
      select 1
      from target_relations tr
      join target_methods later
        on later.id = tr.later_methodology_version_id
      where tr.earlier_methodology_version_id = tm.id
        and tr.relationship_type = 'supersedes'
        and tr.effective_on <= date '2025-01-01'
        and (later.applies_from is null or later.applies_from <= date '2025-01-01')
    )
),
target_values as (
  select
    mv.*,
    o.observation_fingerprint,
    a.value_origin,
    a.value_role,
    mmv.methodology_key,
    mmv.metric_definition_id as methodology_metric_definition_id
  from public.metric_values mv
  join target_metric md on md.id = mv.metric_definition_id
  join public.observations o on o.id = mv.observation_id
  left join public.metric_value_methodology_assignments a
    on a.metric_value_id = mv.id
  left join public.metric_methodology_versions mmv
    on mmv.id = a.methodology_version_id
  where mv.period_start = date '2025-01-01'
    and mv.period_end = date '2025-01-31'
    and mv.geography = 'Brasil'
),
target_evidence_ids as (
  select e.id
  from public.evidence e
  join target_values tv on tv.observation_id = e.observation_id

  union

  select mme.evidence_id
  from public.metric_methodology_evidence mme
  join target_methods tm on tm.id = mme.methodology_version_id

  union

  select tr.evidence_id
  from target_relations tr

  union

  select e.id
  from public.evidence e
  join public.observations o on o.id = e.observation_id
  where o.observation_fingerprint = 'canonical-0007-abve-mhev-janeiro-2025'
),
evidence_checks as (
  select
    e.id,
    (
      e.lineage_status = 'established'
      and s.slug = 'abve'
      and s.status = 'approved'
      and s.is_primary_source
      and ci.content_fingerprint is not null
      and ci.published_on is not null
      and ci.url is not null
      and exists (
        select 1
        from public.event_evidence ee
        join public.events ev on ev.id = ee.event_id
        where ee.evidence_id = e.id
          and ev.workflow_status = 'accepted'
          and ev.verification_level in ('confirmed', 'corroborated')
      )
    ) as complete
  from target_evidence_ids tei
  join public.evidence e on e.id = tei.id
  left join public.content_items ci on ci.id = e.origin_content_item_id
  left join public.sources s
    on s.id = coalesce(e.origin_source_id, ci.source_id)
),
checks as (
  select
    (select count(*) from target_metric) = 1 as metric_ok,
    (
      select coalesce(array_agg(numeric_value order by numeric_value), '{}'::numeric[])
      from target_values
    ) = array[12556, 16502]::numeric[] as values_ok,
    (
      select coalesce(array_agg(value_role order by value_role), '{}'::text[])
      from target_values
    ) = array['counterfactual', 'primary']::text[] as roles_ok,
    (
      select count(*) = 2
      and bool_and(value_origin = 'source_published')
      and bool_and(value_status = 'validated')
      and bool_and(metric_definition_id = methodology_metric_definition_id)
      from target_values
    ) as value_assignments_ok,
    (select count(*) from target_methods) = 2 as methods_ok,
    (
      select count(*) = 1
      and min(methodology_key) = 'canonical-0007-abve-classificacao-vigente-sem-mhev'
      from current_methods
    ) as current_method_ok,
    (
      select count(*) = 10
      from public.metric_methodology_components mmc
      join target_methods tm on tm.id = mmc.methodology_version_id
    ) as components_ok,
    (
      select count(*) = 2
      and bool_or(
        tm.methodology_key = 'canonical-0007-abve-classificacao-anterior-com-mhev'
        and mmc.component_role = 'included'
      )
      and bool_or(
        tm.methodology_key = 'canonical-0007-abve-classificacao-vigente-sem-mhev'
        and mmc.component_role = 'reported_separately'
      )
      from public.metric_methodology_components mmc
      join target_methods tm on tm.id = mmc.methodology_version_id
      where mmc.component_key = 'mhev'
    ) as mhev_treatment_ok,
    (
      select count(*) = 1
      and bool_and(relationship_type = 'supersedes')
      and bool_and(effective_on = date '2025-01-01')
      from target_relations
    ) as relation_ok,
    not exists (select 1 from relation_walk where has_cycle) as no_cycle_ok,
    (
      select count(*) = 6
      from public.metric_methodology_evidence mme
      join target_methods tm on tm.id = mme.methodology_version_id
    ) as methodology_evidence_ok,
    (
      select count(*) = 5 and bool_and(complete)
      from evidence_checks
    ) as provenance_ok,
    (
      select count(*) = 1
      from public.observations o
      where o.observation_fingerprint = 'canonical-0007-abve-mhev-janeiro-2025'
        and o.normalized_claim like '%3.946%'
    ) as context_ok,
    not exists (
      select 1
      from public.metric_values mv
      join public.observations o on o.id = mv.observation_id
      where o.observation_fingerprint = 'canonical-0007-abve-mhev-janeiro-2025'
    ) as context_not_metric_value_ok
),
result as (
  select
    case when
      metric_ok
      and values_ok
      and roles_ok
      and value_assignments_ok
      and methods_ok
      and current_method_ok
      and components_ok
      and mhev_treatment_ok
      and relation_ok
      and no_cycle_ok
      and methodology_evidence_ok
      and provenance_ok
      and context_ok
      and context_not_metric_value_ok
    then 'complete'
    else 'blocked'
    end as verification_status,
    to_jsonb(checks) as checks
  from checks
)
select
  'chargebr-methodology-reading-v1'::text as contract_version,
  verification_status,
  checks
from result;
