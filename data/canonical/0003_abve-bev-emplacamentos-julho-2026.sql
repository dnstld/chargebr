-- Carga canônica 0003: emplacamentos mensais de veículos leves BEV no Brasil.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-05 14:27:08+02';
  prior_loads_signature_before text;
  prior_loads_signature_after text;
  abve_source_id bigint;
  abve_organization_id bigint;
  abve_content_item_id bigint;
  bev_observation_id bigint;
  bev_evidence_id bigint;
  bev_event_id bigint;
  bev_metric_definition_id bigint;
  bev_metric_value_id bigint;
begin
  if (select count(*) from public.sources
       where slug in (
         'jeep-stellantis-media',
         'bmw-group-pressclub-brasil',
         'diario-do-grande-abc'
       )) <> 3
    or (select count(*) from public.content_items
         where content_fingerprint in (
           'canonical-0001-jeep-avenger-2026-08-13',
           'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
           'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
         )) <> 3
    or (select count(*) from public.observations
         where observation_fingerprint in (
           'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13',
           'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27',
           'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27'
         )) <> 3
    or (select count(*) from public.evidence
         where lineage_key in (
           'canonical-0001-jeep-avenger-lancamento-2026-08-13',
           'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
           'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
         )) <> 3
    or (select count(*) from public.events
         where event_fingerprint in (
           'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
           'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
         )) <> 2
    or (select count(*) from public.organizations
         where slug in ('jeep', 'bmw')) <> 2
  then
    raise exception 'Carga 0003: as cargas 0001 e 0002 não possuem todos os registros esperados.';
  end if;

  if (select count(*)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where e.event_fingerprint in (
         'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
         'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
       )) <> 3
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where e.event_fingerprint in (
           'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
           'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
         )) <> 2
    or (select count(*)
          from public.events
         where event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13'
           and workflow_status = 'accepted'
           and verification_level = 'confirmed') <> 1
    or (select count(*)
          from public.events
         where event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27'
           and workflow_status = 'accepted'
           and verification_level = 'corroborated') <> 1
  then
    raise exception 'Carga 0003: os estados ou vínculos das cargas anteriores estão divergentes.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_loads_signature_before;

  insert into public.sources (
    name,
    slug,
    homepage_url,
    source_type,
    status,
    country_code,
    language_codes,
    is_primary_source,
    publisher_group,
    notes,
    created_at,
    updated_at
  )
  values (
    'ABVE',
    'abve',
    'https://abve.org.br',
    'industry_association',
    'approved',
    'BR',
    array['pt-BR'],
    true,
    'Associação Brasileira do Veículo Elétrico',
    'Canal institucional da ABVE e de seu produto de dados ABVE Data.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint sources_slug_unique do nothing;

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
    raise exception 'Carga 0003: a fonte abve já existe com conteúdo divergente.';
  end if;

  insert into public.organizations (
    name,
    legal_name,
    slug,
    organization_type,
    status,
    country_code,
    homepage_url,
    description,
    notes,
    created_at,
    updated_at
  )
  values (
    'ABVE',
    'Associação Brasileira do Veículo Elétrico',
    'abve',
    'industry_association',
    'approved',
    'BR',
    'https://abve.org.br',
    'Associação setorial brasileira que publicou o resultado mensal por meio da ABVE Data.',
    'A organização representa o sujeito institucional do acontecimento; a fonte separada representa o canal de publicação.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint organizations_slug_unique do nothing;

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
    raise exception 'Carga 0003: a organização abve já existe com conteúdo divergente.';
  end if;

  insert into public.metric_definitions (
    metric_key,
    name,
    description,
    metric_domain,
    value_type,
    canonical_unit,
    aggregation_type,
    temporal_granularity,
    geographic_granularity,
    status,
    methodology_notes,
    created_at,
    updated_at
  )
  values (
    'monthly-light-bev-registrations-brazil',
    'Emplacamentos mensais de veículos leves BEV no Brasil',
    'Quantidade de veículos leves 100% elétricos, classificados como BEV, emplacados no Brasil durante um mês civil.',
    'vehicle_market',
    'integer',
    'vehicle_registration',
    'count',
    'month',
    'national',
    'approved',
    'BEV significa veículo elétrico a bateria ou veículo 100% elétrico. A métrica exclui PHEV, HEV, HEV Flex e MHEV. Cada unidade representa um emplacamento, não necessariamente um veículo único em toda a sua vida útil. A definição não incorpora participação de mercado, variação ou acumulado. Valores de outros períodos exigem observações e cargas próprias.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint metric_definitions_key_unique do nothing;

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
    raise exception 'Carga 0003: a definição da métrica já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint = 'canonical-0003-abve-data-bev-julho-2026-2026-08-11'
       or (
         source_id = abve_source_id
         and url = 'https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/'
       )
     )
       and (
         source_id is distinct from abve_source_id
         or url is distinct from 'https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/'
         or content_fingerprint is distinct from 'canonical-0003-abve-data-bev-julho-2026-2026-08-11'
       )
  ) then
    raise exception 'Carga 0003: a publicação da ABVE possui URL ou identificador estável divergente.';
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
    'https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/',
    'Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026',
    'dataset_release',
    date '2026-08-11',
    null,
    canonical_recorded_at,
    null,
    'pt-BR',
    'ABVE Data',
    'original',
    'canonical-0003-abve-data-bev-julho-2026-2026-08-11',
    'external_reference',
    null,
    'https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint content_items_source_url_fingerprint_unique do nothing;

  select id into abve_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url = 'https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/'
     and content_fingerprint = 'canonical-0003-abve-data-bev-julho-2026-2026-08-11';

  if abve_content_item_id is null or exists (
    select 1
      from public.content_items
     where id = abve_content_item_id
       and (
         title is distinct from 'Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026'
         or content_type is distinct from 'dataset_release'
         or published_on is distinct from date '2026-08-11'
         or published_at is not null
         or author_name is not null
         or language_code is distinct from 'pt-BR'
         or section_name is distinct from 'ABVE Data'
         or publication_nature is distinct from 'original'
         or retention_class is distinct from 'external_reference'
         or evidentiary_excerpt is not null
         or raw_capture_reference is distinct from 'https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano/'
       )
  ) then
    raise exception 'Carga 0003: a publicação da ABVE já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.observations
     where observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026'
       and content_item_id is distinct from abve_content_item_id
  ) then
    raise exception 'Carga 0003: a observação já usa o identificador estável com outra publicação.';
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
    abve_content_item_id,
    'quantity',
    'Os BEV lideraram, com 25.782 unidades [...] os emplacamentos de veículos 100% elétricos passaram de 7.010 para 25.782 unidades.',
    'Brasil: 25.782 emplacamentos de veículos leves BEV em julho de 2026.',
    'normalized',
    null,
    'Brasil',
    'manual',
    'emplacamentos de veículos 100% elétricos',
    'canonical-0003-abve-bev-emplacamentos-julho-2026',
    'O período é o mês civil de julho de 2026. A normalização converte somente o separador brasileiro de milhar; não inclui percentuais, comparações, outras tecnologias, acumulados ou projeções.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint observations_content_fingerprint_unique do nothing;

  select id into bev_observation_id
    from public.observations
   where content_item_id = abve_content_item_id
     and observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026';

  if bev_observation_id is null or exists (
    select 1
      from public.observations
     where id = bev_observation_id
       and (
         observation_type is distinct from 'quantity'
         or source_claim is distinct from 'Os BEV lideraram, com 25.782 unidades [...] os emplacamentos de veículos 100% elétricos passaram de 7.010 para 25.782 unidades.'
         or normalized_claim is distinct from 'Brasil: 25.782 emplacamentos de veículos leves BEV em julho de 2026.'
         or normalization_status is distinct from 'normalized'
         or observation_date is not null
         or geography is distinct from 'Brasil'
         or extraction_method is distinct from 'manual'
         or source_term is distinct from 'emplacamentos de veículos 100% elétricos'
         or notes is distinct from 'O período é o mês civil de julho de 2026. A normalização converte somente o separador brasileiro de milhar; não inclui percentuais, comparações, outras tecnologias, acumulados ou projeções.'
       )
  ) then
    raise exception 'Carga 0003: a observação da ABVE já existe com conteúdo divergente.';
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
    bev_observation_id,
    abve_content_item_id,
    null,
    'canonical-0003-abve-data-bev-julho-2026',
    'established',
    'A origem exata está estabelecida na publicação da ABVE Data. A evidência confirma o resultado publicado pela própria associação, sem auditoria ou corroboração independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint evidence_observation_lineage_unique do nothing;

  select id into bev_evidence_id
    from public.evidence
   where observation_id = bev_observation_id
     and lineage_key = 'canonical-0003-abve-data-bev-julho-2026';

  if bev_evidence_id is null or exists (
    select 1
      from public.evidence
     where id = bev_evidence_id
       and (
         origin_content_item_id is distinct from abve_content_item_id
         or origin_source_id is not null
         or lineage_status is distinct from 'established'
         or notes is distinct from 'A origem exata está estabelecida na publicação da ABVE Data. A evidência confirma o resultado publicado pela própria associação, sem auditoria ou corroboração independente.'
       )
  ) then
    raise exception 'Carga 0003: a evidência da ABVE já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.evidence
     where lineage_key = 'canonical-0003-abve-data-bev-julho-2026'
       and observation_id is distinct from bev_observation_id
  ) then
    raise exception 'Carga 0003: a chave de linhagem já pertence a outra observação.';
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
    bev_observation_id,
    25782,
    date '2026-07-01',
    date '2026-07-31',
    'Brasil',
    'validated',
    'Valor mensal transcrito de 25.782 para 25782 sem cálculo, arredondamento ou conversão de unidade; não representa o acumulado de janeiro a julho.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint metric_values_scope_unique do nothing;

  select id into bev_metric_value_id
    from public.metric_values
   where metric_definition_id = bev_metric_definition_id
     and observation_id = bev_observation_id
     and period_start = date '2026-07-01'
     and period_end = date '2026-07-31'
     and geography = 'Brasil';

  if bev_metric_value_id is null or exists (
    select 1
      from public.metric_values
     where id = bev_metric_value_id
       and (
         numeric_value is distinct from 25782::numeric
         or value_status is distinct from 'validated'
         or notes is distinct from 'Valor mensal transcrito de 25.782 para 25782 sem cálculo, arredondamento ou conversão de unidade; não representa o acumulado de janeiro a julho.'
       )
  ) then
    raise exception 'Carga 0003: o valor da métrica já existe com conteúdo divergente.';
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
    'ABVE Data publica 25.782 emplacamentos de veículos leves BEV em julho de 2026',
    'A ABVE Data publicou que o Brasil registrou 25.782 emplacamentos de veículos leves 100% elétricos, classificados como BEV, durante julho de 2026.',
    'market_data',
    'publication',
    date '2026-08-11',
    'day',
    'Brasil',
    'O valor mede a adoção mensal de veículos leves 100% elétricos no mercado brasileiro.',
    'confirmed',
    'accepted',
    'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11',
    'A data do acontecimento é a data da publicação. Julho de 2026 é o período medido. Confirmed registra a publicação pela fonte primária, sem indicar corroboração independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint events_fingerprint_unique do nothing;

  select id into bev_event_id
    from public.events
   where event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11';

  if bev_event_id is null or exists (
    select 1
      from public.events
     where id = bev_event_id
       and (
         title is distinct from 'ABVE Data publica 25.782 emplacamentos de veículos leves BEV em julho de 2026'
         or summary is distinct from 'A ABVE Data publicou que o Brasil registrou 25.782 emplacamentos de veículos leves 100% elétricos, classificados como BEV, durante julho de 2026.'
         or event_type is distinct from 'market_data'
         or event_phase is distinct from 'publication'
         or event_date is distinct from date '2026-08-11'
         or date_precision is distinct from 'day'
         or geography is distinct from 'Brasil'
         or brazil_relevance is distinct from 'O valor mede a adoção mensal de veículos leves 100% elétricos no mercado brasileiro.'
         or verification_level is distinct from 'confirmed'
         or workflow_status is distinct from 'accepted'
         or notes is distinct from 'A data do acontecimento é a data da publicação. Julho de 2026 é o período medido. Confirmed registra a publicação pela fonte primária, sem indicar corroboração independente.'
       )
  ) then
    raise exception 'Carga 0003: o acontecimento já existe com conteúdo divergente.';
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
    bev_event_id,
    bev_evidence_id,
    'supports',
    'A publicação da ABVE Data sustenta o resultado mensal de 25.782 emplacamentos de veículos leves BEV no Brasil em julho de 2026.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint event_evidence_pkey do nothing;

  if not exists (
    select 1
      from public.event_evidence
     where event_id = bev_event_id
       and evidence_id = bev_evidence_id
       and relationship_type = 'supports'
       and notes = 'A publicação da ABVE Data sustenta o resultado mensal de 25.782 emplacamentos de veículos leves BEV no Brasil em julho de 2026.'
  ) then
    raise exception 'Carga 0003: o vínculo entre acontecimento e evidência está divergente.';
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
    bev_event_id,
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
     where event_id = bev_event_id
       and organization_id = abve_organization_id
       and event_role = 'subject'
       and notes = 'A ABVE é a organização que publicou o resultado por meio da ABVE Data.'
  ) then
    raise exception 'Carga 0003: o vínculo entre acontecimento e organização está divergente.';
  end if;

  if (select count(*) from public.sources where slug = 'abve') <> 1
    or (select count(*) from public.organizations where slug = 'abve') <> 1
    or (select count(*) from public.metric_definitions
         where metric_key = 'monthly-light-bev-registrations-brazil') <> 1
    or (select count(*) from public.content_items
         where content_fingerprint = 'canonical-0003-abve-data-bev-julho-2026-2026-08-11') <> 1
    or (select count(*) from public.observations
         where observation_fingerprint = 'canonical-0003-abve-bev-emplacamentos-julho-2026') <> 1
    or (select count(*) from public.evidence
         where lineage_key = 'canonical-0003-abve-data-bev-julho-2026') <> 1
    or (select count(*) from public.metric_values
         where metric_definition_id = bev_metric_definition_id
           and observation_id = bev_observation_id
           and period_start = date '2026-07-01'
           and period_end = date '2026-07-31'
           and geography = 'Brasil') <> 1
    or (select count(*) from public.events
         where event_fingerprint = 'canonical-0003-abve-publica-emplacamentos-bev-julho-2026-2026-08-11') <> 1
    or (select count(*) from public.event_evidence
         where event_id = bev_event_id) <> 1
    or (select count(*) from public.event_organizations
         where event_id = bev_event_id) <> 1
  then
    raise exception 'Carga 0003: as contagens finais não correspondem ao pacote mínimo esperado.';
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
     where s.id = abve_source_id
       and ci.id = abve_content_item_id
       and o.id = bev_observation_id
       and ev.id = bev_evidence_id
       and e.id = bev_event_id
       and mv.id = bev_metric_value_id
       and md.id = bev_metric_definition_id
       and s.status = 'approved'
       and o.normalization_status = 'normalized'
       and ev.lineage_status = 'established'
       and e.workflow_status = 'accepted'
       and e.verification_level = 'confirmed'
       and md.status = 'approved'
       and mv.value_status = 'validated'
       and mv.numeric_value = 25782
  ) then
    raise exception 'Carga 0003: a cadeia factual e métrica não pode ser reconstruída integralmente.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_loads_signature_after;

  if prior_loads_signature_after is distinct from prior_loads_signature_before then
    raise exception 'Carga 0003: as cargas 0001 ou 0002 foram alteradas.';
  end if;
end
$$;
