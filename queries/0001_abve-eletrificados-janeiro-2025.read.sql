with recursive
contract as (
  select
    'chargebr-methodology-reading-v1'::text as contract_version,
    'monthly-light-electrified-vehicle-registrations-brazil-abve-classification'::text as metric_key,
    date '2025-01-01' as period_start,
    date '2025-01-31' as period_end,
    'Brasil'::text as geography,
    'vehicle_registration'::text as canonical_unit,
    'month'::text as temporal_granularity,
    'national'::text as geographic_granularity,
    'abve'::text as source_slug
),
metric_by_key as (
  select md.*
  from public.metric_definitions md
  cross join contract c
  where md.metric_key = c.metric_key
),
metric_scope as (
  select md.*
  from metric_by_key md
  cross join contract c
  where md.canonical_unit = c.canonical_unit
    and md.temporal_granularity = c.temporal_granularity
    and md.geographic_granularity = c.geographic_granularity
),
methodologies as (
  select mmv.*
  from public.metric_methodology_versions mmv
  join metric_by_key md on md.id = mmv.metric_definition_id
),
methodology_relations as (
  select
    r.*,
    earlier.methodology_key as earlier_methodology_key,
    later.methodology_key as later_methodology_key
  from public.metric_methodology_relations r
  join methodologies earlier on earlier.id = r.earlier_methodology_version_id
  join methodologies later on later.id = r.later_methodology_version_id
),
relation_walk (start_id, current_id, visited_ids, has_cycle) as (
  select
    r.earlier_methodology_version_id,
    r.later_methodology_version_id,
    array[
      r.earlier_methodology_version_id,
      r.later_methodology_version_id
    ]::bigint[],
    r.earlier_methodology_version_id = r.later_methodology_version_id
  from methodology_relations r

  union all

  select
    rw.start_id,
    r.later_methodology_version_id,
    rw.visited_ids || r.later_methodology_version_id,
    r.later_methodology_version_id = any (rw.visited_ids)
  from relation_walk rw
  join methodology_relations r
    on r.earlier_methodology_version_id = rw.current_id
  where not rw.has_cycle
),
applicable_methodologies as (
  select mmv.*
  from methodologies mmv
  cross join contract c
  where mmv.applies_from is null
     or mmv.applies_from <= c.period_start
),
current_methodology_candidates as (
  select mmv.*
  from applicable_methodologies mmv
  cross join contract c
  where not exists (
    select 1
    from methodology_relations r
    join applicable_methodologies later
      on later.id = r.later_methodology_version_id
    where r.earlier_methodology_version_id = mmv.id
      and r.relationship_type = 'supersedes'
      and r.effective_on <= c.period_start
  )
),
current_methodology_identity as (
  select min(id) as id
  from current_methodology_candidates
  having count(*) = 1
),
case_value_candidates as (
  select
    mv.*,
    o.observation_fingerprint,
    a.methodology_version_id,
    a.value_origin,
    a.value_role,
    a.notes as assignment_notes
  from public.metric_values mv
  join metric_by_key md on md.id = mv.metric_definition_id
  join public.observations o on o.id = mv.observation_id
  left join public.metric_value_methodology_assignments a
    on a.metric_value_id = mv.id
  where o.observation_fingerprint in (
    'canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente',
    'canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior'
  )
),
scoped_values as (
  select
    mv.*,
    o.observation_fingerprint,
    o.observation_type,
    o.source_claim,
    o.normalized_claim,
    o.observation_date,
    o.geography as observation_geography,
    o.source_term,
    a.methodology_version_id,
    a.value_origin,
    a.value_role,
    a.notes as assignment_notes,
    mmv.methodology_key
  from public.metric_values mv
  join metric_scope md on md.id = mv.metric_definition_id
  join public.observations o on o.id = mv.observation_id
  left join public.metric_value_methodology_assignments a
    on a.metric_value_id = mv.id
  left join public.metric_methodology_versions mmv
    on mmv.id = a.methodology_version_id
  cross join contract c
  where mv.period_start = c.period_start
    and mv.period_end = c.period_end
    and mv.geography = c.geography
),
primary_value_candidates as (
  select sv.*
  from scoped_values sv
  join current_methodology_candidates cm
    on cm.id = sv.methodology_version_id
  where sv.value_role = 'primary'
    and sv.value_origin = 'source_published'
    and sv.value_status = 'validated'
),
primary_value_identity as (
  select min(id) as id
  from primary_value_candidates
  having count(*) = 1
),
event_sets as (
  select
    ee.evidence_id,
    jsonb_agg(
      jsonb_build_object(
        'event_fingerprint', ev.event_fingerprint,
        'title', ev.title,
        'event_phase', ev.event_phase,
        'event_date', ev.event_date,
        'date_precision', ev.date_precision,
        'verification_level', ev.verification_level,
        'workflow_status', ev.workflow_status,
        'relationship_type', ee.relationship_type
      )
      order by ev.event_date nulls last, ev.event_fingerprint
    ) as events,
    bool_or(
      ev.workflow_status = 'accepted'
      and ev.verification_level in ('confirmed', 'corroborated')
    ) as has_accepted_event,
    bool_or(
      ee.relationship_type = 'supports'
      and ev.workflow_status = 'accepted'
      and ev.verification_level in ('confirmed', 'corroborated')
    ) as has_accepted_supporting_event
  from public.event_evidence ee
  join public.events ev on ev.id = ee.event_id
  group by ee.evidence_id
),
evidence_details_base as (
  select
    e.id,
    e.observation_id,
    e.lineage_key,
    e.lineage_status,
    e.notes,
    o.observation_fingerprint,
    ci.content_fingerprint,
    ci.title as publication_title,
    ci.content_type,
    ci.published_on,
    ci.published_at,
    ci.url as publication_url,
    ci.publication_nature,
    s.name as source_name,
    s.slug as source_slug,
    s.source_type,
    s.status as source_status,
    s.is_primary_source,
    coalesce(es.events, '[]'::jsonb) as events,
    coalesce(es.has_accepted_event, false) as has_accepted_event,
    coalesce(es.has_accepted_supporting_event, false) as has_accepted_supporting_event
  from public.evidence e
  join public.observations o on o.id = e.observation_id
  left join public.content_items ci on ci.id = e.origin_content_item_id
  left join public.sources s
    on s.id = coalesce(e.origin_source_id, ci.source_id)
  left join event_sets es on es.evidence_id = e.id
),
evidence_details as (
  select
    edb.*,
    (
      edb.lineage_status = 'established'
      and edb.source_slug is not null
      and edb.source_status = 'approved'
      and edb.is_primary_source
      and edb.content_fingerprint is not null
      and edb.publication_title is not null
      and edb.published_on is not null
      and edb.publication_url is not null
      and edb.has_accepted_event
    ) as provenance_complete,
    jsonb_build_object(
      'lineage_key', edb.lineage_key,
      'lineage_status', edb.lineage_status,
      'observation_fingerprint', edb.observation_fingerprint,
      'source', jsonb_build_object(
        'name', edb.source_name,
        'slug', edb.source_slug,
        'source_type', edb.source_type,
        'status', edb.source_status,
        'is_primary_source', edb.is_primary_source
      ),
      'publication', jsonb_build_object(
        'content_fingerprint', edb.content_fingerprint,
        'title', edb.publication_title,
        'content_type', edb.content_type,
        'published_on', edb.published_on,
        'published_at', edb.published_at,
        'url', edb.publication_url,
        'publication_nature', edb.publication_nature
      ),
      'events', edb.events,
      'notes', edb.notes
    ) as evidence_payload
  from evidence_details_base edb
),
evidence_by_observation as (
  select
    ed.observation_id,
    jsonb_agg(ed.evidence_payload order by ed.lineage_key) as evidence,
    bool_or(ed.provenance_complete) as has_complete_provenance,
    bool_or(
      ed.provenance_complete
      and ed.has_accepted_supporting_event
    ) as has_complete_supporting_provenance
  from evidence_details ed
  group by ed.observation_id
),
components_by_methodology as (
  select
    mmc.methodology_version_id,
    count(*) as component_count,
    count(*) filter (
      where mmc.component_key in ('bev', 'phev', 'hev', 'hev_flex', 'mhev')
    ) as expected_component_count,
    jsonb_agg(
      jsonb_build_object(
        'component_key', mmc.component_key,
        'component_name', mmc.component_name,
        'component_role', mmc.component_role,
        'notes', mmc.notes
      )
      order by mmc.component_key
    ) as components
  from public.metric_methodology_components mmc
  join methodologies mmv on mmv.id = mmc.methodology_version_id
  group by mmc.methodology_version_id
),
methodology_evidence_by_version as (
  select
    mme.methodology_version_id,
    count(*) as evidence_count,
    bool_and(coalesce(ed.provenance_complete, false)) as provenance_complete,
    jsonb_agg(
      jsonb_build_object(
        'relationship_type', mme.relationship_type,
        'evidence', ed.evidence_payload,
        'notes', mme.notes
      )
      order by mme.relationship_type, ed.lineage_key
    ) as evidence
  from public.metric_methodology_evidence mme
  join methodologies mmv on mmv.id = mme.methodology_version_id
  left join evidence_details ed on ed.id = mme.evidence_id
  group by mme.methodology_version_id
),
values_by_methodology as (
  select
    sv.methodology_version_id,
    jsonb_agg(
      jsonb_build_object(
        'value', sv.numeric_value,
        'value_status', sv.value_status,
        'value_origin', sv.value_origin,
        'value_role', sv.value_role
      )
      order by
        case sv.value_role when 'primary' then 1 else 2 end,
        sv.numeric_value
    ) as values
  from scoped_values sv
  group by sv.methodology_version_id
),
methodology_payloads as (
  select
    mmv.id,
    mmv.methodology_key,
    jsonb_build_object(
      'methodology_key', mmv.methodology_key,
      'name', mmv.name,
      'description', mmv.description,
      'applies_from', mmv.applies_from,
      'derived_status', case
        when cm.id is not null then 'current'
        else 'historical'
      end,
      'components', coalesce(cb.components, '[]'::jsonb),
      'values', coalesce(vm.values, '[]'::jsonb),
      'evidence', coalesce(me.evidence, '[]'::jsonb),
      'notes', mmv.notes
    ) as payload
  from methodologies mmv
  left join current_methodology_candidates cm on cm.id = mmv.id
  left join components_by_methodology cb
    on cb.methodology_version_id = mmv.id
  left join values_by_methodology vm
    on vm.methodology_version_id = mmv.id
  left join methodology_evidence_by_version me
    on me.methodology_version_id = mmv.id
),
value_payloads as (
  select
    sv.id,
    sv.value_role,
    sv.numeric_value,
    jsonb_build_object(
      'value', sv.numeric_value,
      'value_status', sv.value_status,
      'value_origin', sv.value_origin,
      'value_role', sv.value_role,
      'period_start', sv.period_start,
      'period_end', sv.period_end,
      'geography', sv.geography,
      'methodology_key', sv.methodology_key,
      'observation', jsonb_build_object(
        'observation_fingerprint', sv.observation_fingerprint,
        'observation_type', sv.observation_type,
        'source_claim', sv.source_claim,
        'normalized_claim', sv.normalized_claim,
        'observation_date', sv.observation_date,
        'geography', sv.observation_geography,
        'source_term', sv.source_term
      ),
      'evidence', coalesce(ebo.evidence, '[]'::jsonb),
      'value_notes', sv.notes,
      'assignment_notes', sv.assignment_notes
    ) as payload
  from scoped_values sv
  left join evidence_by_observation ebo on ebo.observation_id = sv.observation_id
),
context_payloads as (
  select
    o.id,
    jsonb_build_object(
      'kind', 'documentary_context',
      'is_metric_value', false,
      'observation_fingerprint', o.observation_fingerprint,
      'observation_type', o.observation_type,
      'source_claim', o.source_claim,
      'normalized_claim', o.normalized_claim,
      'observation_date', o.observation_date,
      'geography', o.geography,
      'source_term', o.source_term,
      'evidence', coalesce(ebo.evidence, '[]'::jsonb)
    ) as payload,
    coalesce(ebo.has_complete_provenance, false) as provenance_complete
  from public.observations o
  left join evidence_by_observation ebo on ebo.observation_id = o.id
  where o.observation_fingerprint = 'canonical-0007-abve-mhev-janeiro-2025'
),
relation_payloads as (
  select
    r.earlier_methodology_version_id,
    r.later_methodology_version_id,
    jsonb_build_object(
      'earlier_methodology_key', r.earlier_methodology_key,
      'later_methodology_key', r.later_methodology_key,
      'relationship_type', r.relationship_type,
      'effective_on', r.effective_on,
      'evidence', ed.evidence_payload,
      'notes', r.notes
    ) as payload,
    coalesce(ed.provenance_complete, false) as provenance_complete
  from methodology_relations r
  left join evidence_details ed on ed.id = r.evidence_id
),
blocker_codes as (
  select 'METRIC_NOT_FOUND'::text as code
  where not exists (select 1 from metric_by_key)

  union all

  select 'SCOPE_MISMATCH'
  where exists (select 1 from metric_by_key)
    and (
      not exists (select 1 from metric_scope)
      or exists (
        select 1
        from case_value_candidates cvc
        cross join contract c
        where cvc.period_start <> c.period_start
           or cvc.period_end <> c.period_end
           or cvc.geography is distinct from c.geography
      )
    )

  union all

  select 'METHODOLOGY_MISSING'
  where exists (select 1 from metric_by_key)
    and not exists (select 1 from methodologies)

  union all

  select 'METHODOLOGY_CYCLE'
  where exists (select 1 from relation_walk where has_cycle)

  union all

  select 'CURRENT_METHODOLOGY_NOT_UNIQUE'
  where (select count(*) from current_methodology_candidates) <> 1

  union all

  select 'PRIMARY_VALUE_NOT_UNIQUE'
  where (select count(*) from primary_value_candidates) <> 1

  union all

  select 'VALUE_METHOD_MISMATCH'
  where exists (
    select 1
    from scoped_values sv
    left join public.metric_methodology_versions mmv
      on mmv.id = sv.methodology_version_id
    where mmv.id is null
       or mmv.metric_definition_id <> sv.metric_definition_id
  )

  union all

  select 'PRIMARY_OUTSIDE_APPLICABILITY'
  where exists (
    select 1
    from scoped_values sv
    join methodologies mmv on mmv.id = sv.methodology_version_id
    where sv.value_role = 'primary'
      and mmv.applies_from is not null
      and sv.period_start < mmv.applies_from
  )

  union all

  select 'PROVENANCE_INCOMPLETE'
  where exists (
      select 1
      from scoped_values sv
      left join evidence_by_observation ebo
        on ebo.observation_id = sv.observation_id
      where not coalesce(ebo.has_complete_supporting_provenance, false)
    )
    or exists (
      select 1
      from methodologies mmv
      left join methodology_evidence_by_version me
        on me.methodology_version_id = mmv.id
      where not coalesce(me.provenance_complete, false)
    )
    or exists (
      select 1
      from relation_payloads rp
      where not rp.provenance_complete
    )
    or exists (
      select 1
      from context_payloads cp
      where not cp.provenance_complete
    )
    or not exists (select 1 from context_payloads)
    or exists (
      select 1
      from evidence_details ed
      cross join contract c
      where ed.observation_id in (select observation_id from scoped_values)
        and ed.source_slug is distinct from c.source_slug
    )

  union all

  select 'UNSUPPORTED_VALUE_ORIGIN'
  where exists (
    select 1
    from scoped_values
    where value_origin is distinct from 'source_published'
  )

  union all

  select 'COMPONENTS_INCOMPLETE'
  where exists (
    select 1
    from methodologies mmv
    left join components_by_methodology cb
      on cb.methodology_version_id = mmv.id
    where coalesce(cb.component_count, 0) <> 5
       or coalesce(cb.expected_component_count, 0) <> 5
  )

  union all

  select 'UNEXPECTED_CARDINALITY'
  where (select count(*) from metric_by_key) <> 1
     or (select count(*) from case_value_candidates) <> 2
     or (select count(*) from scoped_values) <> 2
     or (select count(*) from methodologies) <> 2
     or (select count(*) from methodology_relations) <> 1
     or (select count(*) from public.metric_methodology_components mmc join methodologies mmv on mmv.id = mmc.methodology_version_id) <> 10
     or (select count(*) from public.metric_methodology_evidence mme join methodologies mmv on mmv.id = mme.methodology_version_id) <> 6
     or (select count(*) from context_payloads) <> 1
),
blockers as (
  select coalesce(jsonb_agg(code order by code), '[]'::jsonb) as items
  from (select distinct code from blocker_codes) deduplicated
),
metric_payload as (
  select jsonb_build_object(
    'metric_key', md.metric_key,
    'name', md.name,
    'description', md.description,
    'metric_domain', md.metric_domain,
    'value_type', md.value_type,
    'canonical_unit', md.canonical_unit,
    'aggregation_type', md.aggregation_type,
    'temporal_granularity', md.temporal_granularity,
    'geographic_granularity', md.geographic_granularity,
    'status', md.status
  ) as payload
  from metric_scope md
),
scope_payload as (
  select jsonb_build_object(
    'period_start', c.period_start,
    'period_end', c.period_end,
    'geography', c.geography,
    'canonical_unit', c.canonical_unit,
    'source_slug', c.source_slug
  ) as payload
  from contract c
),
success_projections as (
  select
    c.contract_version,
    'current_methodology'::text as projection_type,
    1::integer as projection_order,
    'complete'::text as projection_status,
    jsonb_build_object(
      'metric', mp.payload,
      'scope', sp.payload,
      'value', vp.payload,
      'methodology', meth.payload,
      'limitations', jsonb_build_array(
        'O total segue a classificação ABVE Data vigente no período.',
        'MHEV são publicados separadamente e não integram o resultado principal.',
        'O ChargeBR transcreveu o valor publicado; não recalculou o total.'
      )
    ) as payload,
    '[]'::jsonb as blockers
  from contract c
  cross join metric_payload mp
  cross join scope_payload sp
  join primary_value_identity pvi on true
  join value_payloads vp on vp.id = pvi.id
  join current_methodology_identity cmi on true
  join methodology_payloads meth on meth.id = cmi.id

  union all

  select
    c.contract_version,
    'as_published',
    2,
    'complete',
    jsonb_build_object(
      'metric', mp.payload,
      'scope', sp.payload,
      'values', (
        select jsonb_agg(
          vp.payload
          order by
            case vp.value_role when 'primary' then 1 else 2 end,
            vp.numeric_value
        )
        from value_payloads vp
      ),
      'documentary_context', (
        select jsonb_agg(cp.payload order by cp.id)
        from context_payloads cp
      ),
      'limitations', jsonb_build_array(
        '16.502 é uma comparação contrafactual publicada pela ABVE para o critério anterior, não uma correção de 12.556.',
        '3.946 MHEV permanecem como contexto documental, não como terceiro valor da métrica.',
        'Nenhum dos números desta projeção foi calculado pelo ChargeBR.'
      )
    ),
    '[]'::jsonb
  from contract c
  cross join metric_payload mp
  cross join scope_payload sp

  union all

  select
    c.contract_version,
    'methodology_comparison',
    3,
    'complete',
    jsonb_build_object(
      'metric', mp.payload,
      'scope', sp.payload,
      'methodologies', (
        select jsonb_agg(
          meth.payload
          order by
            case when meth.id = cmi.id then 2 else 1 end,
            meth.methodology_key
        )
        from methodology_payloads meth
        cross join current_methodology_identity cmi
      ),
      'relations', (
        select jsonb_agg(
          rp.payload
          order by
            (rp.payload ->> 'effective_on')::date,
            rp.payload ->> 'earlier_methodology_key'
        )
        from relation_payloads rp
      ),
      'documentary_context', (
        select jsonb_agg(cp.payload order by cp.id)
        from context_payloads cp
      ),
      'limitations', jsonb_build_array(
        'A diferença entre os resultados decorre da mudança de tratamento de MHEV.',
        'O estado current ou historical é derivado para este período e não é gravado na metodologia.',
        'A relação supersedes substitui o método principal a partir de 1º de janeiro de 2025; ela não invalida o critério anterior.'
      )
    ),
    '[]'::jsonb
  from contract c
  cross join metric_payload mp
  cross join scope_payload sp
)
select
  c.contract_version,
  'control'::text as projection_type,
  0::integer as projection_order,
  'blocked'::text as projection_status,
  null::jsonb as payload,
  b.items as blockers
from contract c
cross join blockers b
where jsonb_array_length(b.items) > 0

union all

select
  sp.contract_version,
  sp.projection_type,
  sp.projection_order,
  sp.projection_status,
  sp.payload,
  sp.blockers
from success_projections sp
cross join blockers b
where jsonb_array_length(b.items) = 0
order by projection_order;
