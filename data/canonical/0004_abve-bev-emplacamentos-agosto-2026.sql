-- Carga canônica 0004: emplacamentos mensais de veículos leves BEV
-- no Brasil durante agosto de 2026.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-10 19:49:34+02';
  prior_records_signature_before text;
  prior_records_signature_after text;
  abve_source_id bigint;
  abve_organization_id bigint;
  bev_metric_definition_id bigint;
  august_content_item_id bigint;
  august_observation_id bigint;
  august_evidence_id bigint;
  august_event_id bigint;
  august_metric_value_id bigint;
begin
  -- A carga foi preparada sobre 0001, 0002, 0003, 0005 e 0006 já
  -- persistidas. Os filtros excluem somente os registros próprios da 0004
  -- para permitir uma segunda execução idêntica na mesma transação.
  if (select count(*) from public.sources) <> 4
    or (select count(*) from public.content_items
         where coalesce(content_fingerprint, '') !~ '^canonical-0004-') <> 8
    or (select count(*) from public.observations
         where coalesce(observation_fingerprint, '') !~ '^canonical-0004-') <> 8
    or (select count(*) from public.evidence
         where coalesce(lineage_key, '') !~ '^canonical-0004-') <> 8
    or (select count(*) from public.events
         where coalesce(event_fingerprint, '') !~ '^canonical-0004-') <> 7
    or (select count(*)
          from public.event_evidence ee
          join public.events e on e.id = ee.event_id
         where coalesce(e.event_fingerprint, '') !~ '^canonical-0004-') <> 9
    or (select count(*) from public.metric_definitions) <> 3
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where coalesce(o.observation_fingerprint, '') !~ '^canonical-0004-') <> 5
    or (select count(*) from public.organizations) <> 4
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where coalesce(e.event_fingerprint, '') !~ '^canonical-0004-') <> 9
    or (select count(*) from public.content_item_relations) <> 1
    or (select count(*) from public.metric_value_resolutions) <> 1
    or (select count(*) from public.metric_value_status_transitions) <> 2
    or (select count(*) from public.regulatory_instruments) <> 0
    or (select count(*) from public.event_regulatory_instruments) <> 0
    or (select count(*) from public.regulatory_instrument_relations) <> 0
  then
    raise exception 'Carga 0004: o estado anterior do banco diverge da base revisada para este pacote.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_records_signature_before;

  select id into abve_source_id
    from public.sources
   where slug = 'abve';

  if abve_source_id is null or exists (
    select 1
      from public.sources
     where id = abve_source_id
       and (
         name is distinct from 'ABVE'
         or homepage_url is distinct from 'https://abve.org.br'
         or source_type is distinct from 'industry_association'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or language_codes is distinct from array['pt-BR']::text[]
         or is_primary_source is distinct from true
         or publisher_group is distinct from 'Associação Brasileira do Veículo Elétrico'
         or notes is distinct from 'Canal institucional da ABVE e de seu produto de dados ABVE Data.'
       )
  ) then
    raise exception 'Carga 0004: a fonte abve está ausente ou diverge da carga 0003.';
  end if;

  select id into abve_organization_id
    from public.organizations
   where slug = 'abve';

  if abve_organization_id is null or exists (
    select 1
      from public.organizations
     where id = abve_organization_id
       and (
         name is distinct from 'ABVE'
         or legal_name is distinct from 'Associação Brasileira do Veículo Elétrico'
         or organization_type is distinct from 'industry_association'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or homepage_url is distinct from 'https://abve.org.br'
         or description is distinct from 'Associação setorial brasileira que publicou o resultado mensal por meio da ABVE Data.'
         or notes is distinct from 'A organização representa o sujeito institucional do acontecimento; a fonte separada representa o canal de publicação.'
       )
  ) then
    raise exception 'Carga 0004: a organização abve está ausente ou diverge da carga 0003.';
  end if;

  select id into bev_metric_definition_id
    from public.metric_definitions
   where metric_key = 'monthly-light-bev-registrations-brazil';

  if bev_metric_definition_id is null or exists (
    select 1
      from public.metric_definitions
     where id = bev_metric_definition_id
       and (
         name is distinct from 'Emplacamentos mensais de veículos leves BEV no Brasil'
         or description is distinct from 'Quantidade de veículos leves 100% elétricos, classificados como BEV, emplacados no Brasil durante um mês civil.'
         or metric_domain is distinct from 'vehicle_market'
         or value_type is distinct from 'integer'
         or canonical_unit is distinct from 'vehicle_registration'
         or aggregation_type is distinct from 'count'
         or temporal_granularity is distinct from 'month'
         or geographic_granularity is distinct from 'national'
         or status is distinct from 'approved'
         or methodology_notes is distinct from 'BEV significa veículo elétrico a bateria ou veículo 100% elétrico. A métrica exclui PHEV, HEV, HEV Flex e MHEV. Cada unidade representa um emplacamento, não necessariamente um veículo único em toda a sua vida útil. A definição não incorpora participação de mercado, variação ou acumulado. Valores de outros períodos exigem observações e cargas próprias.'
       )
  ) then
    raise exception 'Carga 0004: a definição da métrica está ausente ou diverge da carga 0003.';
  end if;

  if (select count(*)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where mv.metric_definition_id = bev_metric_definition_id
         and o.observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026'
         and mv.numeric_value = 25782
         and mv.period_start = date '2026-07-01'
         and mv.period_end = date '2026-07-31'
         and mv.geography = 'Brasil'
         and mv.value_status = 'validated') <> 1
  then
    raise exception 'Carga 0004: o valor de julho da carga 0003 está ausente ou divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint = 'canonical-0004-abve-data-bev-agosto-2026-2026-09-09'
       or (
         source_id = abve_source_id
         and url = 'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/'
       )
     )
       and (
         source_id is distinct from abve_source_id
         or url is distinct from 'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/'
         or content_fingerprint is distinct from 'canonical-0004-abve-data-bev-agosto-2026-2026-09-09'
       )
  ) then
    raise exception 'Carga 0004: a publicação possui URL ou identificador estável divergente.';
  end if;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    published_at,
    collected_at,
    author_name,
    language_code,
    section_name,
    publication_nature,
    content_fingerprint,
    retention_class,
    evidentiary_excerpt,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    abve_source_id,
    'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/',
    'Com 57 mil emplacamentos em agosto, eletrificados abrem a corrida para o milhão em setembro',
    'dataset_release',
    date '2026-09-09',
    null,
    canonical_recorded_at,
    null,
    'pt-BR',
    'ABVE Data',
    'original',
    'canonical-0004-abve-data-bev-agosto-2026-2026-09-09',
    'external_reference',
    null,
    'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint content_items_source_url_fingerprint_unique do nothing;

  select id into august_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url = 'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/'
     and content_fingerprint = 'canonical-0004-abve-data-bev-agosto-2026-2026-09-09';

  if august_content_item_id is null or exists (
    select 1
      from public.content_items
     where id = august_content_item_id
       and (
         title is distinct from 'Com 57 mil emplacamentos em agosto, eletrificados abrem a corrida para o milhão em setembro'
         or content_type is distinct from 'dataset_release'
         or published_on is distinct from date '2026-09-09'
         or published_at is not null
         or author_name is not null
         or language_code is distinct from 'pt-BR'
         or section_name is distinct from 'ABVE Data'
         or publication_nature is distinct from 'original'
         or retention_class is distinct from 'external_reference'
         or evidentiary_excerpt is not null
         or raw_capture_reference is distinct from 'https://abve.org.br/com-57-mil-emplacamentos-em-agosto-eletrificados-abrem-a-corrida-para-o-milhao-em-setembro/'
       )
  ) then
    raise exception 'Carga 0004: a publicação já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.observations
     where observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026'
       and content_item_id is distinct from august_content_item_id
  ) then
    raise exception 'Carga 0004: a observação já usa o identificador estável com outra publicação.';
  end if;

  insert into public.observations (
    content_item_id,
    observation_type,
    source_claim,
    normalized_claim,
    normalization_status,
    observation_date,
    geography,
    extraction_method,
    source_term,
    observation_fingerprint,
    notes,
    created_at,
    updated_at
  )
  values (
    august_content_item_id,
    'quantity',
    'Os BEV lideraram as vendas do segmento e alcançaram novo recorde mensal, com 27.166 emplacamentos e participação de 47,3%.',
    'Brasil: 27.166 emplacamentos de veículos leves BEV em agosto de 2026.',
    'normalized',
    null,
    'Brasil',
    'manual',
    'BEV; modelos 100% elétricos; emplacamentos',
    'canonical-0004-abve-bev-emplacamentos-agosto-2026',
    'O período é agosto de 2026. A normalização converte somente o separador brasileiro de milhar e exclui participação, crescimento, acumulados, projeções e outras tecnologias.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint observations_content_fingerprint_unique do nothing;

  select id into august_observation_id
    from public.observations
   where content_item_id = august_content_item_id
     and observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026';

  if august_observation_id is null or exists (
    select 1
      from public.observations
     where id = august_observation_id
       and (
         observation_type is distinct from 'quantity'
         or source_claim is distinct from 'Os BEV lideraram as vendas do segmento e alcançaram novo recorde mensal, com 27.166 emplacamentos e participação de 47,3%.'
         or normalized_claim is distinct from 'Brasil: 27.166 emplacamentos de veículos leves BEV em agosto de 2026.'
         or normalization_status is distinct from 'normalized'
         or observation_date is not null
         or geography is distinct from 'Brasil'
         or extraction_method is distinct from 'manual'
         or source_term is distinct from 'BEV; modelos 100% elétricos; emplacamentos'
         or notes is distinct from 'O período é agosto de 2026. A normalização converte somente o separador brasileiro de milhar e exclui participação, crescimento, acumulados, projeções e outras tecnologias.'
       )
  ) then
    raise exception 'Carga 0004: a observação já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.evidence
     where lineage_key = 'canonical-0004-abve-data-bev-agosto-2026'
       and observation_id is distinct from august_observation_id
  ) then
    raise exception 'Carga 0004: a chave de linhagem já pertence a outra observação.';
  end if;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    origin_source_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    august_observation_id,
    august_content_item_id,
    null,
    'canonical-0004-abve-data-bev-agosto-2026',
    'established',
    'A origem exata está estabelecida na publicação da ABVE Data. A evidência confirma o resultado publicado pela associação, sem auditoria ou corroboração independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint evidence_observation_lineage_unique do nothing;

  select id into august_evidence_id
    from public.evidence
   where observation_id = august_observation_id
     and lineage_key = 'canonical-0004-abve-data-bev-agosto-2026';

  if august_evidence_id is null or exists (
    select 1
      from public.evidence
     where id = august_evidence_id
       and (
         origin_content_item_id is distinct from august_content_item_id
         or origin_source_id is not null
         or lineage_status is distinct from 'established'
         or notes is distinct from 'A origem exata está estabelecida na publicação da ABVE Data. A evidência confirma o resultado publicado pela associação, sem auditoria ou corroboração independente.'
       )
  ) then
    raise exception 'Carga 0004: a evidência já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.metric_values
     where metric_definition_id = bev_metric_definition_id
       and period_start = date '2026-08-01'
       and period_end = date '2026-08-31'
       and geography = 'Brasil'
       and observation_id is distinct from august_observation_id
  ) then
    raise exception 'Carga 0004: agosto já possui outro valor para a mesma métrica e geografia.';
  end if;

  insert into public.metric_values (
    metric_definition_id,
    observation_id,
    numeric_value,
    period_start,
    period_end,
    geography,
    value_status,
    notes,
    created_at,
    updated_at
  )
  values (
    bev_metric_definition_id,
    august_observation_id,
    27166,
    date '2026-08-01',
    date '2026-08-31',
    'Brasil',
    'validated',
    'Valor mensal transcrito de 27.166 para 27166 sem cálculo, arredondamento ou conversão de unidade; não representa acumulado nem total de eletrificados.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint metric_values_scope_unique do nothing;

  select id into august_metric_value_id
    from public.metric_values
   where metric_definition_id = bev_metric_definition_id
     and observation_id = august_observation_id
     and period_start = date '2026-08-01'
     and period_end = date '2026-08-31'
     and geography = 'Brasil';

  if august_metric_value_id is null or exists (
    select 1
      from public.metric_values
     where id = august_metric_value_id
       and (
         numeric_value is distinct from 27166::numeric
         or value_status is distinct from 'validated'
         or notes is distinct from 'Valor mensal transcrito de 27.166 para 27166 sem cálculo, arredondamento ou conversão de unidade; não representa acumulado nem total de eletrificados.'
       )
  ) then
    raise exception 'Carga 0004: o valor de agosto já existe com conteúdo divergente.';
  end if;

  insert into public.events (
    title,
    summary,
    event_type,
    event_phase,
    event_date,
    date_precision,
    geography,
    brazil_relevance,
    verification_level,
    workflow_status,
    event_fingerprint,
    notes,
    created_at,
    updated_at
  )
  values (
    'ABVE Data publica 27.166 emplacamentos de veículos leves BEV em agosto de 2026',
    'A ABVE Data publicou que o Brasil registrou 27.166 emplacamentos de veículos leves 100% elétricos, classificados como BEV, durante agosto de 2026.',
    'market_data',
    'publication',
    date '2026-09-09',
    'day',
    'Brasil',
    'O valor acrescenta agosto de 2026 à métrica mensal de adoção de veículos leves 100% elétricos no mercado brasileiro.',
    'confirmed',
    'accepted',
    'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09',
    'A data do acontecimento é a data da publicação. Agosto de 2026 é o período medido. Confirmed registra a publicação pela fonte primária, sem indicar corroboração independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint events_fingerprint_unique do nothing;

  select id into august_event_id
    from public.events
   where event_fingerprint = 'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09';

  if august_event_id is null or exists (
    select 1
      from public.events
     where id = august_event_id
       and (
         title is distinct from 'ABVE Data publica 27.166 emplacamentos de veículos leves BEV em agosto de 2026'
         or summary is distinct from 'A ABVE Data publicou que o Brasil registrou 27.166 emplacamentos de veículos leves 100% elétricos, classificados como BEV, durante agosto de 2026.'
         or event_type is distinct from 'market_data'
         or event_phase is distinct from 'publication'
         or event_date is distinct from date '2026-09-09'
         or date_precision is distinct from 'day'
         or geography is distinct from 'Brasil'
         or brazil_relevance is distinct from 'O valor acrescenta agosto de 2026 à métrica mensal de adoção de veículos leves 100% elétricos no mercado brasileiro.'
         or verification_level is distinct from 'confirmed'
         or workflow_status is distinct from 'accepted'
         or notes is distinct from 'A data do acontecimento é a data da publicação. Agosto de 2026 é o período medido. Confirmed registra a publicação pela fonte primária, sem indicar corroboração independente.'
       )
  ) then
    raise exception 'Carga 0004: o acontecimento já existe com conteúdo divergente.';
  end if;

  insert into public.event_evidence (
    event_id,
    evidence_id,
    relationship_type,
    notes,
    created_at,
    updated_at
  )
  values (
    august_event_id,
    august_evidence_id,
    'supports',
    'A publicação da ABVE Data sustenta 27.166 emplacamentos de veículos leves BEV no Brasil durante agosto de 2026.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint event_evidence_pkey do nothing;

  if not exists (
    select 1
      from public.event_evidence
     where event_id = august_event_id
       and evidence_id = august_evidence_id
       and relationship_type = 'supports'
       and notes = 'A publicação da ABVE Data sustenta 27.166 emplacamentos de veículos leves BEV no Brasil durante agosto de 2026.'
  ) then
    raise exception 'Carga 0004: o vínculo entre acontecimento e evidência está divergente.';
  end if;

  insert into public.event_organizations (
    event_id,
    organization_id,
    event_role,
    notes,
    created_at,
    updated_at
  )
  values (
    august_event_id,
    abve_organization_id,
    'subject',
    'A ABVE é a organização que publicou o resultado por meio da ABVE Data.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint event_organizations_pkey do nothing;

  if not exists (
    select 1
      from public.event_organizations
     where event_id = august_event_id
       and organization_id = abve_organization_id
       and event_role = 'subject'
       and notes = 'A ABVE é a organização que publicou o resultado por meio da ABVE Data.'
  ) then
    raise exception 'Carga 0004: o vínculo entre acontecimento e organização está divergente.';
  end if;

  if (select count(*) from public.sources) <> 4
    or (select count(*) from public.content_items) <> 9
    or (select count(*) from public.observations) <> 9
    or (select count(*) from public.evidence) <> 9
    or (select count(*) from public.events) <> 8
    or (select count(*) from public.event_evidence) <> 10
    or (select count(*) from public.metric_definitions) <> 3
    or (select count(*) from public.metric_values) <> 6
    or (select count(*) from public.organizations) <> 4
    or (select count(*) from public.event_organizations) <> 10
    or (select count(*) from public.content_item_relations) <> 1
    or (select count(*) from public.metric_value_resolutions) <> 1
    or (select count(*) from public.metric_value_status_transitions) <> 2
    or (select count(*) from public.content_items
         where content_fingerprint = 'canonical-0004-abve-data-bev-agosto-2026-2026-09-09') <> 1
    or (select count(*) from public.observations
         where observation_fingerprint = 'canonical-0004-abve-bev-emplacamentos-agosto-2026') <> 1
    or (select count(*) from public.evidence
         where lineage_key = 'canonical-0004-abve-data-bev-agosto-2026') <> 1
    or (select count(*) from public.events
         where event_fingerprint = 'canonical-0004-abve-publica-emplacamentos-bev-agosto-2026-2026-09-09') <> 1
    or (select count(*) from public.event_evidence
         where event_id = august_event_id) <> 1
    or (select count(*) from public.event_organizations
         where event_id = august_event_id) <> 1
  then
    raise exception 'Carga 0004: as contagens finais divergem do pacote mínimo esperado.';
  end if;

  if (select count(*)
        from public.metric_values mv
       where mv.metric_definition_id = bev_metric_definition_id
         and mv.geography = 'Brasil'
         and (
           (
             mv.numeric_value = 25782
             and mv.period_start = date '2026-07-01'
             and mv.period_end = date '2026-07-31'
             and mv.value_status = 'validated'
           )
           or (
             mv.id = august_metric_value_id
             and mv.numeric_value = 27166
             and mv.period_start = date '2026-08-01'
             and mv.period_end = date '2026-08-31'
             and mv.value_status = 'validated'
           )
         )) <> 2
    or (select count(*)
          from public.metric_values mv
         where mv.metric_definition_id = bev_metric_definition_id) <> 2
  then
    raise exception 'Carga 0004: a série BEV não contém exatamente julho e agosto como aprovados.';
  end if;

  if not exists (
    select 1
      from public.sources s
      join public.content_items ci on ci.source_id = s.id
      join public.observations o on o.content_item_id = ci.id
      join public.evidence ev
        on ev.observation_id = o.id
       and ev.origin_content_item_id = ci.id
      join public.event_evidence ee
        on ee.evidence_id = ev.id
       and ee.relationship_type = 'supports'
      join public.events e on e.id = ee.event_id
      join public.metric_values mv on mv.observation_id = o.id
      join public.metric_definitions md on md.id = mv.metric_definition_id
      join public.event_organizations eo
        on eo.event_id = e.id
       and eo.organization_id = abve_organization_id
       and eo.event_role = 'subject'
     where s.id = abve_source_id
       and ci.id = august_content_item_id
       and o.id = august_observation_id
       and ev.id = august_evidence_id
       and e.id = august_event_id
       and mv.id = august_metric_value_id
       and md.id = bev_metric_definition_id
       and s.status = 'approved'
       and o.normalization_status = 'normalized'
       and ev.lineage_status = 'established'
       and e.workflow_status = 'accepted'
       and e.verification_level = 'confirmed'
       and md.status = 'approved'
       and mv.value_status = 'validated'
       and mv.numeric_value = 27166
  ) then
    raise exception 'Carga 0004: a cadeia factual e métrica não pode ser reconstruída integralmente.';
  end if;

  if (
    (select count(*) from public.content_items where content_fingerprint like 'pilot-%')
    + (select count(*) from public.observations where observation_fingerprint like 'pilot-%')
    + (select count(*) from public.evidence where lineage_key like 'pilot-%')
    + (select count(*) from public.events where event_fingerprint like 'pilot-%')
  ) <> 0 then
    raise exception 'Carga 0004: foram encontrados identificadores descartáveis de piloto.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_records_signature_after;

  if prior_records_signature_after is distinct from prior_records_signature_before then
    raise exception 'Carga 0004: registros anteriores foram alterados.';
  end if;
end
$$;
