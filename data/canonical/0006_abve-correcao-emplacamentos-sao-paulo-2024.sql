-- Carga canônica 0006: correção material dos emplacamentos de veículos
-- leves eletrificados no Estado de São Paulo em 2024.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-08 18:37:51+02';
  prior_records_signature_before text;
  prior_records_signature_after text;
  abve_source_id bigint;
  abve_organization_id bigint;
  initial_content_item_id bigint;
  corrected_content_item_id bigint;
  initial_observation_id bigint;
  corrected_observation_id bigint;
  initial_evidence_id bigint;
  corrected_evidence_id bigint;
  canonical_metric_definition_id bigint;
  initial_metric_value_id bigint;
  corrected_metric_value_id bigint;
  publication_event_id bigint;
  correction_event_id bigint;
  canonical_resolution_id bigint;
begin
  -- O pacote foi preparado sobre as cargas 0001, 0002, 0003 e 0005 já
  -- persistidas, com a 0004 ausente e as tabelas históricas ainda vazias.
  -- Os filtros excluem somente os registros próprios da 0006 para permitir
  -- uma segunda execução idêntica na mesma transação.
  if (select count(*) from public.sources) <> 4
    or (select count(*) from public.content_items
         where coalesce(content_fingerprint, '') !~ '^canonical-0006-') <> 6
    or (select count(*) from public.observations
         where coalesce(observation_fingerprint, '') !~ '^canonical-0006-') <> 6
    or (select count(*)
          from public.evidence ev
          join public.observations o on o.id = ev.observation_id
         where coalesce(o.observation_fingerprint, '') !~ '^canonical-0006-') <> 6
    or (select count(*) from public.events
         where coalesce(event_fingerprint, '') !~ '^canonical-0006-') <> 5
    or (select count(*)
          from public.event_evidence ee
          join public.events e on e.id = ee.event_id
         where coalesce(e.event_fingerprint, '') !~ '^canonical-0006-') <> 6
    or (select count(*) from public.metric_definitions
         where metric_key <> 'annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification') <> 2
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where coalesce(o.observation_fingerprint, '') !~ '^canonical-0006-') <> 3
    or (select count(*) from public.organizations) <> 4
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where coalesce(e.event_fingerprint, '') !~ '^canonical-0006-') <> 7
    or (select count(*)
          from public.content_item_relations cir
          join public.content_items earlier on earlier.id = cir.earlier_content_item_id
          join public.content_items later on later.id = cir.later_content_item_id
         where coalesce(earlier.content_fingerprint, '') !~ '^canonical-0006-'
           and coalesce(later.content_fingerprint, '') !~ '^canonical-0006-') <> 0
    or (select count(*) from public.metric_value_resolutions
         where resolution_key <> 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024') <> 0
    or (select count(*)
          from public.metric_value_status_transitions mvst
          join public.metric_value_resolutions mvr on mvr.id = mvst.resolution_id
         where mvr.resolution_key <> 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024') <> 0
  then
    raise exception 'Carga 0006: o estado anterior do banco diverge da base revisada para este pacote.';
  end if;

  if exists (
    select 1 from public.content_items
     where content_fingerprint like 'canonical-0004-%'
  ) or exists (
    select 1 from public.observations
     where observation_fingerprint like 'canonical-0004-%'
  ) or exists (
    select 1 from public.evidence
     where lineage_key like 'canonical-0004-%'
  ) or exists (
    select 1 from public.events
     where event_fingerprint like 'canonical-0004-%'
  ) then
    raise exception 'Carga 0006: a carga 0004 está presente; este pacote foi revisado para executá-la ausente.';
  end if;

  select md5(jsonb_build_object(
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
    raise exception 'Carga 0006: a fonte abve está ausente ou possui conteúdo divergente da carga 0003.';
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
    raise exception 'Carga 0006: a organização abve está ausente ou possui conteúdo divergente da carga 0003.';
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
    'annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification',
    'Emplacamentos anuais de veículos leves eletrificados no Estado de São Paulo — classificação ABVE 2024',
    'Quantidade de veículos leves eletrificados emplacados no Estado de São Paulo durante um ano, segundo a classificação usada pela ABVE no balanço de 2024.',
    'vehicle_market',
    'integer',
    'vehicle_registration',
    'count',
    'year',
    'state',
    'approved',
    'Para o balanço de 2024, a ABVE incluiu BEV, PHEV, HEV, HEV Flex e MHEV. A definição preserva essa classificação histórica e não deve ser reutilizada automaticamente para publicações posteriores à separação metodológica anunciada para janeiro de 2025. O recorte mede emplacamentos ocorridos de janeiro a dezembro, não frota acumulada nem vendas contratadas.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint metric_definitions_key_unique do nothing;

  select id into canonical_metric_definition_id
    from public.metric_definitions
   where metric_key = 'annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification';

  if canonical_metric_definition_id is null or exists (
    select 1
      from public.metric_definitions
     where id = canonical_metric_definition_id
       and (
         name is distinct from 'Emplacamentos anuais de veículos leves eletrificados no Estado de São Paulo — classificação ABVE 2024'
         or description is distinct from 'Quantidade de veículos leves eletrificados emplacados no Estado de São Paulo durante um ano, segundo a classificação usada pela ABVE no balanço de 2024.'
         or metric_domain is distinct from 'vehicle_market'
         or value_type is distinct from 'integer'
         or canonical_unit is distinct from 'vehicle_registration'
         or aggregation_type is distinct from 'count'
         or temporal_granularity is distinct from 'year'
         or geographic_granularity is distinct from 'state'
         or status is distinct from 'approved'
         or methodology_notes is distinct from 'Para o balanço de 2024, a ABVE incluiu BEV, PHEV, HEV, HEV Flex e MHEV. A definição preserva essa classificação histórica e não deve ser reutilizada automaticamente para publicações posteriores à separação metodológica anunciada para janeiro de 2025. O recorte mede emplacamentos ocorridos de janeiro a dezembro, não frota acumulada nem vendas contratadas.'
       )
  ) then
    raise exception 'Carga 0006: a definição da métrica já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint in (
         'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao',
         'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida'
       )
       or (
         source_id = abve_source_id
         and url = 'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/'
       )
     )
       and not (
         source_id = abve_source_id
         and url = 'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/'
         and content_fingerprint in (
           'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao',
           'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida'
         )
       )
  ) then
    raise exception 'Carga 0006: a publicação possui URL ou identificador estável divergente.';
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
  values
    (
      abve_source_id,
      'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/',
      'Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024',
      'dataset_release',
      date '2025-01-06',
      null,
      canonical_recorded_at,
      null,
      'pt-BR',
      'ABVE Data',
      'original',
      'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao',
      'metadata_only',
      null,
      null,
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      abve_source_id,
      'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/',
      'Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024',
      'dataset_release',
      date '2025-01-06',
      null,
      canonical_recorded_at,
      null,
      'pt-BR',
      'ABVE Data',
      'original',
      'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida',
      'external_reference',
      null,
      'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint content_items_source_url_fingerprint_unique do nothing;

  select id into initial_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url = 'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/'
     and content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao';

  select id into corrected_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url = 'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/'
     and content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida';

  if initial_content_item_id is null or not exists (
    select 1 from public.content_items
     where id = initial_content_item_id
       and title = 'Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024'
       and content_type = 'dataset_release'
       and published_on = date '2025-01-06'
       and published_at is null
       and author_name is null
       and language_code = 'pt-BR'
       and section_name = 'ABVE Data'
       and publication_nature = 'original'
       and retention_class = 'metadata_only'
       and evidentiary_excerpt is null
       and raw_capture_reference is null
  ) or corrected_content_item_id is null or not exists (
    select 1 from public.content_items
     where id = corrected_content_item_id
       and title = 'Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024'
       and content_type = 'dataset_release'
       and published_on = date '2025-01-06'
       and published_at is null
       and author_name is null
       and language_code = 'pt-BR'
       and section_name = 'ABVE Data'
       and publication_nature = 'original'
       and retention_class = 'external_reference'
       and evidentiary_excerpt is null
       and raw_capture_reference = url
  ) then
    raise exception 'Carga 0006: uma versão da publicação já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.observations
     where observation_fingerprint in (
       'canonical-0006-abve-sp-24435-primeira-edicao',
       'canonical-0006-abve-sp-56819-edicao-corrigida'
     )
       and not (
         (observation_fingerprint = 'canonical-0006-abve-sp-24435-primeira-edicao' and content_item_id = initial_content_item_id)
         or (observation_fingerprint = 'canonical-0006-abve-sp-56819-edicao-corrigida' and content_item_id = corrected_content_item_id)
       )
  ) then
    raise exception 'Carga 0006: uma observação já usa o identificador estável com outra versão.';
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
  values
    (
      initial_content_item_id,
      'quantity',
      'Na primeira edição, o ranking estadual atribuía 24.435 emplacamentos de veículos eletrificados a São Paulo.',
      'Estado de São Paulo, Brasil: 24.435 emplacamentos de veículos leves eletrificados entre janeiro e dezembro de 2024, conforme a atribuição incorreta da primeira edição.',
      'normalized',
      null,
      'Estado de São Paulo, Brasil',
      'manual',
      'São Paulo',
      'canonical-0006-abve-sp-24435-primeira-edicao',
      'A afirmação inicial é uma reconstrução documental da nota oficial: a página atual não preserva o corpo integral incorreto, mas declara que os números estadual e municipal estavam trocados e informa o par correto.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      corrected_content_item_id,
      'quantity',
      'O Estado de São Paulo registrou 56.819 emplacamentos de veículos eletrificados de janeiro a dezembro de 2024.',
      'Estado de São Paulo, Brasil: 56.819 emplacamentos de veículos leves eletrificados entre janeiro e dezembro de 2024.',
      'normalized',
      null,
      'Estado de São Paulo, Brasil',
      'manual',
      'Estado de São Paulo',
      'canonical-0006-abve-sp-56819-edicao-corrigida',
      'A observação transcreve o escopo estadual corrigido. O número 24.435 continua correto para a cidade de São Paulo, recorte não persistido nesta carga.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint observations_content_fingerprint_unique do nothing;

  select id into initial_observation_id
    from public.observations
   where content_item_id = initial_content_item_id
     and observation_fingerprint = 'canonical-0006-abve-sp-24435-primeira-edicao';

  select id into corrected_observation_id
    from public.observations
   where content_item_id = corrected_content_item_id
     and observation_fingerprint = 'canonical-0006-abve-sp-56819-edicao-corrigida';

  if initial_observation_id is null or not exists (
    select 1 from public.observations
     where id = initial_observation_id
       and observation_type = 'quantity'
       and source_claim = 'Na primeira edição, o ranking estadual atribuía 24.435 emplacamentos de veículos eletrificados a São Paulo.'
       and normalized_claim = 'Estado de São Paulo, Brasil: 24.435 emplacamentos de veículos leves eletrificados entre janeiro e dezembro de 2024, conforme a atribuição incorreta da primeira edição.'
       and normalization_status = 'normalized'
       and observation_date is null
       and geography = 'Estado de São Paulo, Brasil'
       and extraction_method = 'manual'
       and source_term = 'São Paulo'
       and notes = 'A afirmação inicial é uma reconstrução documental da nota oficial: a página atual não preserva o corpo integral incorreto, mas declara que os números estadual e municipal estavam trocados e informa o par correto.'
  ) or corrected_observation_id is null or not exists (
    select 1 from public.observations
     where id = corrected_observation_id
       and observation_type = 'quantity'
       and source_claim = 'O Estado de São Paulo registrou 56.819 emplacamentos de veículos eletrificados de janeiro a dezembro de 2024.'
       and normalized_claim = 'Estado de São Paulo, Brasil: 56.819 emplacamentos de veículos leves eletrificados entre janeiro e dezembro de 2024.'
       and normalization_status = 'normalized'
       and observation_date is null
       and geography = 'Estado de São Paulo, Brasil'
       and extraction_method = 'manual'
       and source_term = 'Estado de São Paulo'
       and notes = 'A observação transcreve o escopo estadual corrigido. O número 24.435 continua correto para a cidade de São Paulo, recorte não persistido nesta carga.'
  ) then
    raise exception 'Carga 0006: uma observação já existe com conteúdo divergente.';
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
  values
    (
      initial_observation_id,
      corrected_content_item_id,
      null,
      'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024',
      'established',
      'A origem documental acessível é a versão corrigida e sua nota oficial. A primeira edição não possui captura primária integral nesta carga; o valor estadual 24.435 é reconstruído da declaração de que os números estadual e municipal estavam trocados e do par correto informado pela ABVE.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      corrected_observation_id,
      corrected_content_item_id,
      null,
      'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024',
      'established',
      'A página oficial corrigida exibe 56.819 para o Estado de São Paulo e registra a correção de 7 de janeiro de 2025 às 18h12. Isso confirma a atribuição publicada pela ABVE, sem auditoria independente da base subjacente.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint evidence_observation_lineage_unique do nothing;

  select id into initial_evidence_id
    from public.evidence
   where observation_id = initial_observation_id
     and lineage_key = 'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024';

  select id into corrected_evidence_id
    from public.evidence
   where observation_id = corrected_observation_id
     and lineage_key = 'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024';

  if initial_evidence_id is null or not exists (
    select 1 from public.evidence
     where id = initial_evidence_id
       and origin_content_item_id = corrected_content_item_id
       and origin_source_id is null
       and lineage_status = 'established'
       and notes = 'A origem documental acessível é a versão corrigida e sua nota oficial. A primeira edição não possui captura primária integral nesta carga; o valor estadual 24.435 é reconstruído da declaração de que os números estadual e municipal estavam trocados e do par correto informado pela ABVE.'
  ) or corrected_evidence_id is null or not exists (
    select 1 from public.evidence
     where id = corrected_evidence_id
       and origin_content_item_id = corrected_content_item_id
       and origin_source_id is null
       and lineage_status = 'established'
       and notes = 'A página oficial corrigida exibe 56.819 para o Estado de São Paulo e registra a correção de 7 de janeiro de 2025 às 18h12. Isso confirma a atribuição publicada pela ABVE, sem auditoria independente da base subjacente.'
  ) or (select count(*) from public.evidence
         where lineage_key = 'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024') <> 2
  then
    raise exception 'Carga 0006: a linhagem das evidências está divergente.';
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
  values
    (
      canonical_metric_definition_id,
      initial_observation_id,
      24435,
      date '2024-01-01',
      date '2024-12-31',
      'Estado de São Paulo, Brasil',
      'provisional',
      'Valor inicialmente atribuído ao estado e posteriormente rejeitado apenas nesse escopo geográfico. O mesmo número permanece correto para a cidade, que não integra esta carga.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      canonical_metric_definition_id,
      corrected_observation_id,
      56819,
      date '2024-01-01',
      date '2024-12-31',
      'Estado de São Paulo, Brasil',
      'provisional',
      'Valor estadual declarado correto pela ABVE na correção material e validado no escopo desta resolução.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint metric_values_scope_unique do nothing;

  select id into initial_metric_value_id
    from public.metric_values
   where metric_definition_id = canonical_metric_definition_id
     and observation_id = initial_observation_id
     and period_start = date '2024-01-01'
     and period_end = date '2024-12-31'
     and geography = 'Estado de São Paulo, Brasil';

  select id into corrected_metric_value_id
    from public.metric_values
   where metric_definition_id = canonical_metric_definition_id
     and observation_id = corrected_observation_id
     and period_start = date '2024-01-01'
     and period_end = date '2024-12-31'
     and geography = 'Estado de São Paulo, Brasil';

  if initial_metric_value_id is null or not exists (
    select 1 from public.metric_values
     where id = initial_metric_value_id
       and numeric_value = 24435
       and value_status in ('provisional', 'rejected')
       and notes = 'Valor inicialmente atribuído ao estado e posteriormente rejeitado apenas nesse escopo geográfico. O mesmo número permanece correto para a cidade, que não integra esta carga.'
  ) or corrected_metric_value_id is null or not exists (
    select 1 from public.metric_values
     where id = corrected_metric_value_id
       and numeric_value = 56819
       and value_status in ('provisional', 'validated')
       and notes = 'Valor estadual declarado correto pela ABVE na correção material e validado no escopo desta resolução.'
  ) then
    raise exception 'Carga 0006: um valor da métrica já existe com conteúdo divergente.';
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
  values
    (
      'ABVE publica ranking de 2024 com atribuição estadual de 24.435 a São Paulo',
      'Na primeira edição do balanço de 2024, a ABVE atribuiu 24.435 emplacamentos de veículos leves eletrificados ao Estado de São Paulo; a própria associação depois declarou que os números estadual e municipal estavam trocados.',
      'market_data',
      'publication',
      date '2025-01-06',
      'day',
      'Estado de São Paulo, Brasil',
      'A afirmação quantifica o mercado de veículos leves eletrificados no maior mercado estadual brasileiro segundo o ranking da ABVE.',
      'confirmed',
      'accepted',
      'canonical-0006-abve-publica-24435-estado-sp-2025-01-06',
      'O corpo incorreto não está integralmente capturado; o acontecimento é reconstruído da nota de correção oficial preservada na página.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      'ABVE corrige para 56.819 os emplacamentos de 2024 no Estado de São Paulo',
      'A ABVE corrigiu a atribuição geográfica do ranking e declarou 56.819 para o Estado de São Paulo e 24.435 para a cidade de São Paulo em 7 de janeiro de 2025, às 18h12.',
      'market_data',
      'update',
      date '2025-01-07',
      'day',
      'Estado de São Paulo, Brasil',
      'A correção resolve qual total estadual a ABVE atribui aos emplacamentos de veículos leves eletrificados de 2024.',
      'confirmed',
      'accepted',
      'canonical-0006-abve-corrige-56819-estado-sp-2025-01-07',
      'A hora 18h12 é preservada no resumo e na evidência. O acontecimento usa precisão diária porque a fonte não declara explicitamente o fuso horário.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint events_fingerprint_unique do nothing;

  select id into publication_event_id
    from public.events
   where event_fingerprint = 'canonical-0006-abve-publica-24435-estado-sp-2025-01-06';

  select id into correction_event_id
    from public.events
   where event_fingerprint = 'canonical-0006-abve-corrige-56819-estado-sp-2025-01-07';

  if publication_event_id is null or not exists (
    select 1 from public.events
     where id = publication_event_id
       and title = 'ABVE publica ranking de 2024 com atribuição estadual de 24.435 a São Paulo'
       and summary = 'Na primeira edição do balanço de 2024, a ABVE atribuiu 24.435 emplacamentos de veículos leves eletrificados ao Estado de São Paulo; a própria associação depois declarou que os números estadual e municipal estavam trocados.'
       and event_type = 'market_data'
       and event_phase = 'publication'
       and event_date = date '2025-01-06'
       and date_precision = 'day'
       and geography = 'Estado de São Paulo, Brasil'
       and brazil_relevance = 'A afirmação quantifica o mercado de veículos leves eletrificados no maior mercado estadual brasileiro segundo o ranking da ABVE.'
       and verification_level = 'confirmed'
       and workflow_status = 'accepted'
       and notes = 'O corpo incorreto não está integralmente capturado; o acontecimento é reconstruído da nota de correção oficial preservada na página.'
  ) or correction_event_id is null or not exists (
    select 1 from public.events
     where id = correction_event_id
       and title = 'ABVE corrige para 56.819 os emplacamentos de 2024 no Estado de São Paulo'
       and summary = 'A ABVE corrigiu a atribuição geográfica do ranking e declarou 56.819 para o Estado de São Paulo e 24.435 para a cidade de São Paulo em 7 de janeiro de 2025, às 18h12.'
       and event_type = 'market_data'
       and event_phase = 'update'
       and event_date = date '2025-01-07'
       and date_precision = 'day'
       and geography = 'Estado de São Paulo, Brasil'
       and brazil_relevance = 'A correção resolve qual total estadual a ABVE atribui aos emplacamentos de veículos leves eletrificados de 2024.'
       and verification_level = 'confirmed'
       and workflow_status = 'accepted'
       and notes = 'A hora 18h12 é preservada no resumo e na evidência. O acontecimento usa precisão diária porque a fonte não declara explicitamente o fuso horário.'
  ) then
    raise exception 'Carga 0006: um acontecimento já existe com conteúdo divergente.';
  end if;

  insert into public.event_evidence (
    event_id,
    evidence_id,
    relationship_type,
    notes,
    created_at,
    updated_at
  )
  values
    (
      publication_event_id,
      initial_evidence_id,
      'supports',
      'A nota oficial sustenta a reconstrução da atribuição estadual incorreta na primeira edição.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      correction_event_id,
      corrected_evidence_id,
      'supports',
      'A página corrigida e sua nota sustentam o valor estadual 56.819 e a correção em 7 de janeiro de 2025 às 18h12.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      correction_event_id,
      initial_evidence_id,
      'contextualizes',
      'A reconstrução da atribuição inicial explica qual erro estadual foi corrigido.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint event_evidence_pkey do nothing;

  if not exists (
    select 1 from public.event_evidence
     where event_id = publication_event_id
       and evidence_id = initial_evidence_id
       and relationship_type = 'supports'
       and notes = 'A nota oficial sustenta a reconstrução da atribuição estadual incorreta na primeira edição.'
  ) or not exists (
    select 1 from public.event_evidence
     where event_id = correction_event_id
       and evidence_id = corrected_evidence_id
       and relationship_type = 'supports'
       and notes = 'A página corrigida e sua nota sustentam o valor estadual 56.819 e a correção em 7 de janeiro de 2025 às 18h12.'
  ) or not exists (
    select 1 from public.event_evidence
     where event_id = correction_event_id
       and evidence_id = initial_evidence_id
       and relationship_type = 'contextualizes'
       and notes = 'A reconstrução da atribuição inicial explica qual erro estadual foi corrigido.'
  ) then
    raise exception 'Carga 0006: um vínculo entre acontecimento e evidência está divergente.';
  end if;

  insert into public.event_organizations (
    event_id,
    organization_id,
    event_role,
    notes,
    created_at,
    updated_at
  )
  values
    (
      publication_event_id,
      abve_organization_id,
      'subject',
      'A ABVE publicou o balanço e é a organização responsável pela afirmação reconstruída.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      correction_event_id,
      abve_organization_id,
      'subject',
      'A ABVE publicou a correção material e declarou o par geográfico correto.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint event_organizations_pkey do nothing;

  if not exists (
    select 1 from public.event_organizations
     where event_id = publication_event_id
       and organization_id = abve_organization_id
       and event_role = 'subject'
       and notes = 'A ABVE publicou o balanço e é a organização responsável pela afirmação reconstruída.'
  ) or not exists (
    select 1 from public.event_organizations
     where event_id = correction_event_id
       and organization_id = abve_organization_id
       and event_role = 'subject'
       and notes = 'A ABVE publicou a correção material e declarou o par geográfico correto.'
  ) then
    raise exception 'Carga 0006: um vínculo entre acontecimento e organização está divergente.';
  end if;

  if exists (
    with recursive reachable(item_id) as (
      select cir.later_content_item_id
        from public.content_item_relations cir
       where cir.earlier_content_item_id = corrected_content_item_id
      union
      select cir.later_content_item_id
        from public.content_item_relations cir
        join reachable r on r.item_id = cir.earlier_content_item_id
    )
    select 1 from reachable where item_id = initial_content_item_id
  ) then
    raise exception 'Carga 0006: a relação entre versões criaria um ciclo.';
  end if;

  insert into public.content_item_relations (
    earlier_content_item_id,
    later_content_item_id,
    relationship_type,
    relationship_date,
    evidence_id,
    notes,
    created_at
  )
  values (
    initial_content_item_id,
    corrected_content_item_id,
    'corrects',
    date '2025-01-07',
    corrected_evidence_id,
    'A versão posterior corrige a atribuição geográfica da primeira edição. As duas linhas compartilham fonte, URL, título e data editorial; o momento da correção é preservado nesta relação e no acontecimento próprio.',
    canonical_recorded_at
  )
  on conflict on constraint content_item_relations_pkey do nothing;

  if not exists (
    select 1
      from public.content_item_relations cir
      join public.content_items earlier on earlier.id = cir.earlier_content_item_id
      join public.content_items later on later.id = cir.later_content_item_id
     where cir.earlier_content_item_id = initial_content_item_id
       and cir.later_content_item_id = corrected_content_item_id
       and cir.relationship_type = 'corrects'
       and cir.relationship_date = date '2025-01-07'
       and cir.evidence_id = corrected_evidence_id
       and cir.notes = 'A versão posterior corrige a atribuição geográfica da primeira edição. As duas linhas compartilham fonte, URL, título e data editorial; o momento da correção é preservado nesta relação e no acontecimento próprio.'
       and earlier.source_id = later.source_id
       and earlier.url = later.url
       and cir.relationship_date >= earlier.published_on
       and cir.relationship_date >= later.published_on
  ) then
    raise exception 'Carga 0006: a relação entre as versões está ausente, divergente ou cronologicamente inválida.';
  end if;

  insert into public.metric_value_resolutions (
    resolution_key,
    resolution_type,
    resolution_event_id,
    reviewer_name,
    reviewed_on,
    decision_reference,
    notes,
    created_at
  )
  values (
    'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024',
    'material_correction',
    correction_event_id,
    'Denis Toledo',
    date '2026-09-08',
    'docs/revisao-carga-canonica-0006.md',
    'A correção da ABVE resolve a atribuição publicada pela própria fonte. O aceite do ChargeBR registra essa representação sem alegar auditoria independente dos emplacamentos subjacentes.',
    canonical_recorded_at
  )
  on conflict on constraint metric_value_resolutions_key_unique do nothing;

  select id into canonical_resolution_id
    from public.metric_value_resolutions
   where resolution_key = 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024';

  if canonical_resolution_id is null or not exists (
    select 1 from public.metric_value_resolutions
     where id = canonical_resolution_id
       and resolution_type = 'material_correction'
       and resolution_event_id = correction_event_id
       and reviewer_name = 'Denis Toledo'
       and reviewed_on = date '2026-09-08'
       and decision_reference = 'docs/revisao-carga-canonica-0006.md'
       and notes = 'A correção da ABVE resolve a atribuição publicada pela própria fonte. O aceite do ChargeBR registra essa representação sem alegar auditoria independente dos emplacamentos subjacentes.'
  ) then
    raise exception 'Carga 0006: a resolução canônica já existe com conteúdo divergente.';
  end if;

  if (
    not exists (
      select 1 from public.metric_value_status_transitions
       where transition_key = 'canonical-0006-abve-sp-24435-provisional-rejected'
    ) and not exists (
      select 1 from public.metric_values
       where id = initial_metric_value_id and value_status = 'provisional'
    )
  ) or (
    not exists (
      select 1 from public.metric_value_status_transitions
       where transition_key = 'canonical-0006-abve-sp-56819-provisional-validated'
    ) and not exists (
      select 1 from public.metric_values
       where id = corrected_metric_value_id and value_status = 'provisional'
    )
  ) then
    raise exception 'Carga 0006: um valor não está provisional e não possui a transição histórica esperada.';
  end if;

  insert into public.metric_value_status_transitions (
    transition_key,
    resolution_id,
    metric_value_id,
    transition_order,
    from_status,
    to_status,
    replacement_metric_value_id,
    notes,
    created_at
  )
  values
    (
      'canonical-0006-abve-sp-24435-provisional-rejected',
      canonical_resolution_id,
      initial_metric_value_id,
      1,
      'provisional',
      'rejected',
      corrected_metric_value_id,
      'O valor 24.435 é rejeitado somente para o escopo Estado de São Paulo em 2024; ele permanece correto para a cidade, escopo não persistido nesta carga.',
      canonical_recorded_at
    ),
    (
      'canonical-0006-abve-sp-56819-provisional-validated',
      canonical_resolution_id,
      corrected_metric_value_id,
      1,
      'provisional',
      'validated',
      null,
      'O valor 56.819 é validado para o Estado de São Paulo em 2024 com base na correção material publicada pela ABVE.',
      canonical_recorded_at
    )
  on conflict on constraint metric_value_status_transitions_key_unique do nothing;

  if not exists (
    select 1 from public.metric_value_status_transitions
     where transition_key = 'canonical-0006-abve-sp-24435-provisional-rejected'
       and resolution_id = canonical_resolution_id
       and metric_value_id = initial_metric_value_id
       and transition_order = 1
       and from_status = 'provisional'
       and to_status = 'rejected'
       and replacement_metric_value_id = corrected_metric_value_id
       and notes = 'O valor 24.435 é rejeitado somente para o escopo Estado de São Paulo em 2024; ele permanece correto para a cidade, escopo não persistido nesta carga.'
  ) or not exists (
    select 1 from public.metric_value_status_transitions
     where transition_key = 'canonical-0006-abve-sp-56819-provisional-validated'
       and resolution_id = canonical_resolution_id
       and metric_value_id = corrected_metric_value_id
       and transition_order = 1
       and from_status = 'provisional'
       and to_status = 'validated'
       and replacement_metric_value_id is null
       and notes = 'O valor 56.819 é validado para o Estado de São Paulo em 2024 com base na correção material publicada pela ABVE.'
  ) then
    raise exception 'Carga 0006: uma transição de situação está ausente ou divergente.';
  end if;

  update public.metric_values
     set value_status = 'rejected',
         updated_at = canonical_recorded_at
   where id = initial_metric_value_id
     and value_status = 'provisional';

  update public.metric_values
     set value_status = 'validated',
         updated_at = canonical_recorded_at
   where id = corrected_metric_value_id
     and value_status = 'provisional';

  if not exists (
    select 1 from public.metric_values
     where id = initial_metric_value_id and value_status = 'rejected'
  ) or not exists (
    select 1 from public.metric_values
     where id = corrected_metric_value_id and value_status = 'validated'
  ) then
    raise exception 'Carga 0006: a situação atual dos valores não coincide com a resolução.';
  end if;

  if exists (
    select 1
      from public.metric_values mv
      join lateral (
        select mvst.to_status
          from public.metric_value_status_transitions mvst
         where mvst.metric_value_id = mv.id
         order by mvst.transition_order desc
         limit 1
      ) latest on true
     where mv.id in (initial_metric_value_id, corrected_metric_value_id)
       and mv.value_status <> latest.to_status
  ) or (select count(*)
          from public.metric_value_status_transitions
         where metric_value_id in (initial_metric_value_id, corrected_metric_value_id)
           and transition_order = 1) <> 2
  then
    raise exception 'Carga 0006: o histórico não é contínuo ou diverge da situação atual.';
  end if;

  if (select count(*) from public.content_items
       where content_fingerprint ~ '^canonical-0006-') <> 2
    or (select count(*) from public.observations
         where observation_fingerprint ~ '^canonical-0006-') <> 2
    or (select count(*) from public.evidence
         where lineage_key = 'canonical-0006-abve-correcao-geografica-emplacamentos-sp-2024') <> 2
    or (select count(*) from public.events
         where event_fingerprint ~ '^canonical-0006-') <> 2
    or (select count(*) from public.metric_definitions
         where metric_key = 'annual-light-electrified-vehicle-registrations-sao-paulo-state-abve-2024-classification') <> 1
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where o.observation_fingerprint ~ '^canonical-0006-') <> 2
    or (select count(*)
          from public.event_evidence ee
          join public.events e on e.id = ee.event_id
         where e.event_fingerprint ~ '^canonical-0006-') <> 3
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where e.event_fingerprint ~ '^canonical-0006-') <> 2
    or (select count(*)
          from public.content_item_relations cir
          join public.content_items earlier on earlier.id = cir.earlier_content_item_id
         where earlier.content_fingerprint = 'canonical-0006-abve-emplacamentos-sp-2024-primeira-edicao') <> 1
    or (select count(*) from public.metric_value_resolutions
         where resolution_key = 'canonical-0006-abve-correcao-emplacamentos-sao-paulo-2024') <> 1
    or (select count(*) from public.metric_value_status_transitions
         where transition_key like 'canonical-0006-%') <> 2
  then
    raise exception 'Carga 0006: as contagens finais divergem do pacote aprovado.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_records_signature_after;

  if prior_records_signature_after is distinct from prior_records_signature_before then
    raise exception 'Carga 0006: registros anteriores foram alterados.';
  end if;
end
$$;
