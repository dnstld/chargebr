-- Carga canônica 0005: conflito entre totais da rede pública e semipública
-- de recarga no Brasil para fevereiro de 2026.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-08 10:44:12+02';
  prior_loads_signature_before text;
  prior_loads_signature_after text;
  abve_source_id bigint;
  abve_organization_id bigint;
  tupi_organization_id bigint;
  march_content_item_id bigint;
  june_content_item_id bigint;
  observation_21061_id bigint;
  observation_21060_id bigint;
  evidence_21061_id bigint;
  evidence_21060_id bigint;
  charging_metric_definition_id bigint;
  metric_value_21061_id bigint;
  metric_value_21060_id bigint;
  march_event_id bigint;
  june_event_id bigint;
begin
  if (select count(*) from public.sources
       where slug in (
         'jeep-stellantis-media',
         'bmw-group-pressclub-brasil',
         'diario-do-grande-abc',
         'abve'
       )) <> 4
    or (select count(*) from public.content_items
         where content_fingerprint ~ '^canonical-000[1-3]-') <> 4
    or (select count(*) from public.observations
         where observation_fingerprint ~ '^canonical-000[1-3]-') <> 4
    or (select count(*)
          from public.evidence ev
          join public.observations o on o.id = ev.observation_id
         where o.observation_fingerprint ~ '^canonical-000[1-3]-') <> 4
    or (select count(*) from public.events
         where event_fingerprint ~ '^canonical-000[1-3]-') <> 3
    or (select count(*) from public.organizations
         where slug in ('jeep', 'bmw', 'abve')) <> 3
    or (select count(*) from public.metric_definitions
         where metric_key = 'monthly-light-bev-registrations-brazil') <> 1
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where o.observation_fingerprint ~ '^canonical-000[1-3]-') <> 1
    or (select count(*)
          from public.event_evidence ee
          join public.events e on e.id = ee.event_id
         where e.event_fingerprint ~ '^canonical-000[1-3]-') <> 4
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where e.event_fingerprint ~ '^canonical-000[1-3]-') <> 3
  then
    raise exception 'Carga 0005: as cargas 0001, 0002 e 0003 não possuem todos os registros e vínculos esperados.';
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
    raise exception 'Carga 0005: a carga 0004 está presente; este pacote foi revisado para executá-la ausente.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_loads_signature_before;

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
    raise exception 'Carga 0005: a fonte abve está ausente ou possui conteúdo divergente da carga 0003.';
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
    raise exception 'Carga 0005: a organização abve está ausente ou possui conteúdo divergente da carga 0003.';
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
    'Tupi Mobilidade',
    null,
    'tupi-mobilidade',
    'company',
    'approved',
    'BR',
    'https://tupimob.com',
    'Plataforma brasileira de mobilidade elétrica apresentada pela ABVE como participante da apuração e da atualização da base nacional de recarga.',
    'O registro identifica a marca institucional usada nas fontes; não presume razão social.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint organizations_slug_unique do nothing;

  select id into tupi_organization_id
    from public.organizations
   where slug = 'tupi-mobilidade';

  if tupi_organization_id is null or exists (
    select 1
      from public.organizations
     where id = tupi_organization_id
       and (
         name is distinct from 'Tupi Mobilidade'
         or legal_name is not null
         or organization_type is distinct from 'company'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or homepage_url is distinct from 'https://tupimob.com'
         or description is distinct from 'Plataforma brasileira de mobilidade elétrica apresentada pela ABVE como participante da apuração e da atualização da base nacional de recarga.'
         or notes is distinct from 'O registro identifica a marca institucional usada nas fontes; não presume razão social.'
       )
  ) then
    raise exception 'Carga 0005: a organização tupi-mobilidade já existe com conteúdo divergente.';
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
    'public-semi-public-charging-points-brazil',
    'Pontos públicos e semipúblicos de recarga no Brasil',
    'Quantidade consolidada de pontos públicos e semipúblicos de recarga de veículos elétricos disponíveis no Brasil ao fim de um mês de referência.',
    'charging_infrastructure',
    'integer',
    'charging_point',
    'latest',
    'month',
    'national',
    'approved',
    'A métrica representa uma fotografia consolidada da rede até o mês de referência, não pontos instalados somente durante o mês. A cobertura inclui pontos públicos e semipúblicos e não presume que um ponto corresponda a um local, estabelecimento ou estação inteira. Neste recorte, pontos de recarga, eletropostos e carregadores designam a mesma unidade total. Valores conflitantes permanecem separados e provisórios até resolução documentada. Suporte documental interno mais forte pode ser registrado sem criar precedência entre valores.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint metric_definitions_key_unique do nothing;

  select id into charging_metric_definition_id
    from public.metric_definitions
   where metric_key = 'public-semi-public-charging-points-brazil';

  if charging_metric_definition_id is null or exists (
    select 1
      from public.metric_definitions
     where id = charging_metric_definition_id
       and (
         name is distinct from 'Pontos públicos e semipúblicos de recarga no Brasil'
         or description is distinct from 'Quantidade consolidada de pontos públicos e semipúblicos de recarga de veículos elétricos disponíveis no Brasil ao fim de um mês de referência.'
         or metric_domain is distinct from 'charging_infrastructure'
         or value_type is distinct from 'integer'
         or canonical_unit is distinct from 'charging_point'
         or aggregation_type is distinct from 'latest'
         or temporal_granularity is distinct from 'month'
         or geographic_granularity is distinct from 'national'
         or status is distinct from 'approved'
         or methodology_notes is distinct from 'A métrica representa uma fotografia consolidada da rede até o mês de referência, não pontos instalados somente durante o mês. A cobertura inclui pontos públicos e semipúblicos e não presume que um ponto corresponda a um local, estabelecimento ou estação inteira. Neste recorte, pontos de recarga, eletropostos e carregadores designam a mesma unidade total. Valores conflitantes permanecem separados e provisórios até resolução documentada. Suporte documental interno mais forte pode ser registrado sem criar precedência entre valores.'
       )
  ) then
    raise exception 'Carga 0005: a definição da métrica já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint in (
         'canonical-0005-abve-rede-recarga-fevereiro-2026-2026-03-04',
         'canonical-0005-abve-rede-recarga-maio-2026-2026-06-22'
       )
       or (
         source_id = abve_source_id
         and url in (
           'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/',
           'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/'
         )
       )
     )
       and not (
         source_id = abve_source_id
         and (
           (
             url = 'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/'
             and content_fingerprint = 'canonical-0005-abve-rede-recarga-fevereiro-2026-2026-03-04'
           )
           or (
             url = 'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/'
             and content_fingerprint = 'canonical-0005-abve-rede-recarga-maio-2026-2026-06-22'
           )
         )
       )
  ) then
    raise exception 'Carga 0005: uma publicação possui URL ou identificador estável divergente.';
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
      'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/',
      'Recarga pública rápida cresce 167% em um ano e chega a 31% dos 21 mil eletropostos da rede',
      'dataset_release',
      date '2026-03-04',
      null,
      canonical_recorded_at,
      null,
      'pt-BR',
      'ABVE Data',
      'original',
      'canonical-0005-abve-rede-recarga-fevereiro-2026-2026-03-04',
      'external_reference',
      null,
      'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      abve_source_id,
      'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/',
      'Recarga rápida (DC) cresce 33% em três meses e puxa a expansão da rede',
      'dataset_release',
      date '2026-06-22',
      null,
      canonical_recorded_at,
      null,
      'pt-BR',
      'ABVE Data',
      'original',
      'canonical-0005-abve-rede-recarga-maio-2026-2026-06-22',
      'external_reference',
      null,
      'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint content_items_source_url_fingerprint_unique do nothing;

  select id into march_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url = 'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/'
     and content_fingerprint = 'canonical-0005-abve-rede-recarga-fevereiro-2026-2026-03-04';

  select id into june_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url = 'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/'
     and content_fingerprint = 'canonical-0005-abve-rede-recarga-maio-2026-2026-06-22';

  if march_content_item_id is null or not exists (
    select 1 from public.content_items
     where id = march_content_item_id
       and title = 'Recarga pública rápida cresce 167% em um ano e chega a 31% dos 21 mil eletropostos da rede'
       and content_type = 'dataset_release'
       and published_on = date '2026-03-04'
       and published_at is null
       and author_name is null
       and language_code = 'pt-BR'
       and section_name = 'ABVE Data'
       and publication_nature = 'original'
       and retention_class = 'external_reference'
       and evidentiary_excerpt is null
       and raw_capture_reference = url
  ) or june_content_item_id is null or not exists (
    select 1 from public.content_items
     where id = june_content_item_id
       and title = 'Recarga rápida (DC) cresce 33% em três meses e puxa a expansão da rede'
       and content_type = 'dataset_release'
       and published_on = date '2026-06-22'
       and published_at is null
       and author_name is null
       and language_code = 'pt-BR'
       and section_name = 'ABVE Data'
       and publication_nature = 'original'
       and retention_class = 'external_reference'
       and evidentiary_excerpt is null
       and raw_capture_reference = url
  ) then
    raise exception 'Carga 0005: uma publicação já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.observations
     where observation_fingerprint in (
       'canonical-0005-abve-21061-fevereiro-2026',
       'canonical-0005-abve-21060-fevereiro-2026'
     )
       and not (
         (observation_fingerprint = 'canonical-0005-abve-21061-fevereiro-2026' and content_item_id = march_content_item_id)
         or (observation_fingerprint = 'canonical-0005-abve-21060-fevereiro-2026' and content_item_id = june_content_item_id)
       )
  ) then
    raise exception 'Carga 0005: uma observação já usa o identificador estável com outra publicação.';
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
      march_content_item_id,
      'quantity',
      'O Brasil tem 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos, segundo atualização da base nacional até fevereiro, apurada pela ABVE e Tupi Mobilidade.',
      'Brasil: 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos até fevereiro de 2026.',
      'normalized',
      null,
      'Brasil',
      'manual',
      'pontos públicos e semipúblicos de recarga de veículos elétricos',
      'canonical-0005-abve-21061-fevereiro-2026',
      'O total é afirmado diretamente pela publicação e coincide com as parcelas AC e DC. A observação não incorpora componentes, percentuais ou cálculos como valores próprios.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      june_content_item_id,
      'quantity',
      'Na comparação com o último levantamento, de fevereiro de 2026 (21.060), a rede cresceu 20,7% em apenas três meses.',
      'Brasil: 21.060 pontos públicos e semipúblicos de recarga de veículos elétricos até fevereiro de 2026.',
      'normalized',
      null,
      'Brasil',
      'manual',
      'último levantamento',
      'canonical-0005-abve-21060-fevereiro-2026',
      'O total é transcrito como publicado. As parcelas AC/DC e regionais da mesma página somam 21.061, mas a carga não presume correção nem rejeita 21.060.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint observations_content_fingerprint_unique do nothing;

  select id into observation_21061_id
    from public.observations
   where content_item_id = march_content_item_id
     and observation_fingerprint = 'canonical-0005-abve-21061-fevereiro-2026';

  select id into observation_21060_id
    from public.observations
   where content_item_id = june_content_item_id
     and observation_fingerprint = 'canonical-0005-abve-21060-fevereiro-2026';

  if observation_21061_id is null or not exists (
    select 1 from public.observations
     where id = observation_21061_id
       and observation_type = 'quantity'
       and source_claim = 'O Brasil tem 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos, segundo atualização da base nacional até fevereiro, apurada pela ABVE e Tupi Mobilidade.'
       and normalized_claim = 'Brasil: 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos até fevereiro de 2026.'
       and normalization_status = 'normalized'
       and observation_date is null
       and geography = 'Brasil'
       and extraction_method = 'manual'
       and source_term = 'pontos públicos e semipúblicos de recarga de veículos elétricos'
       and notes = 'O total é afirmado diretamente pela publicação e coincide com as parcelas AC e DC. A observação não incorpora componentes, percentuais ou cálculos como valores próprios.'
  ) or observation_21060_id is null or not exists (
    select 1 from public.observations
     where id = observation_21060_id
       and observation_type = 'quantity'
       and source_claim = 'Na comparação com o último levantamento, de fevereiro de 2026 (21.060), a rede cresceu 20,7% em apenas três meses.'
       and normalized_claim = 'Brasil: 21.060 pontos públicos e semipúblicos de recarga de veículos elétricos até fevereiro de 2026.'
       and normalization_status = 'normalized'
       and observation_date is null
       and geography = 'Brasil'
       and extraction_method = 'manual'
       and source_term = 'último levantamento'
       and notes = 'O total é transcrito como publicado. As parcelas AC/DC e regionais da mesma página somam 21.061, mas a carga não presume correção nem rejeita 21.060.'
  ) then
    raise exception 'Carga 0005: uma observação já existe com conteúdo divergente.';
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
      observation_21061_id,
      march_content_item_id,
      null,
      'canonical-0005-abve-tupi-base-nacional-fevereiro-2026',
      'likely_shared',
      'A publicação exata de março é conhecida. Likely shared registra que as duas afirmações provavelmente derivam da mesma série ABVE/Tupi, sem tratá-las como confirmações independentes.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      observation_21060_id,
      june_content_item_id,
      null,
      'canonical-0005-abve-tupi-base-nacional-fevereiro-2026',
      'likely_shared',
      'A publicação exata de junho é conhecida. Likely shared registra que sua referência retrospectiva provavelmente deriva da mesma série ABVE/Tupi da publicação de março.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint evidence_observation_lineage_unique do nothing;

  select id into evidence_21061_id
    from public.evidence
   where observation_id = observation_21061_id
     and lineage_key = 'canonical-0005-abve-tupi-base-nacional-fevereiro-2026';

  select id into evidence_21060_id
    from public.evidence
   where observation_id = observation_21060_id
     and lineage_key = 'canonical-0005-abve-tupi-base-nacional-fevereiro-2026';

  if evidence_21061_id is null or not exists (
    select 1 from public.evidence
     where id = evidence_21061_id
       and origin_content_item_id = march_content_item_id
       and origin_source_id is null
       and lineage_status = 'likely_shared'
       and notes = 'A publicação exata de março é conhecida. Likely shared registra que as duas afirmações provavelmente derivam da mesma série ABVE/Tupi, sem tratá-las como confirmações independentes.'
  ) or evidence_21060_id is null or not exists (
    select 1 from public.evidence
     where id = evidence_21060_id
       and origin_content_item_id = june_content_item_id
       and origin_source_id is null
       and lineage_status = 'likely_shared'
       and notes = 'A publicação exata de junho é conhecida. Likely shared registra que sua referência retrospectiva provavelmente deriva da mesma série ABVE/Tupi da publicação de março.'
  ) or (select count(*) from public.evidence
         where lineage_key = 'canonical-0005-abve-tupi-base-nacional-fevereiro-2026') <> 2
  then
    raise exception 'Carga 0005: a linhagem compartilhada das evidências está divergente.';
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
      charging_metric_definition_id,
      observation_21061_id,
      21061,
      date '2026-02-01',
      date '2026-02-28',
      'Brasil',
      'provisional',
      'Valor transcrito da publicação de março. Possui suporte documental interno mais forte, mas não recebe precedência nem estado validated.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      charging_metric_definition_id,
      observation_21060_id,
      21060,
      date '2026-02-01',
      date '2026-02-28',
      'Brasil',
      'provisional',
      'Valor retrospectivo transcrito da publicação de junho. Permanece provisório e não é corrigido, rejeitado ou substituído pela carga.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint metric_values_scope_unique do nothing;

  select id into metric_value_21061_id
    from public.metric_values
   where metric_definition_id = charging_metric_definition_id
     and observation_id = observation_21061_id
     and period_start = date '2026-02-01'
     and period_end = date '2026-02-28'
     and geography = 'Brasil';

  select id into metric_value_21060_id
    from public.metric_values
   where metric_definition_id = charging_metric_definition_id
     and observation_id = observation_21060_id
     and period_start = date '2026-02-01'
     and period_end = date '2026-02-28'
     and geography = 'Brasil';

  if metric_value_21061_id is null or not exists (
    select 1 from public.metric_values
     where id = metric_value_21061_id
       and numeric_value = 21061
       and value_status = 'provisional'
       and notes = 'Valor transcrito da publicação de março. Possui suporte documental interno mais forte, mas não recebe precedência nem estado validated.'
  ) or metric_value_21060_id is null or not exists (
    select 1 from public.metric_values
     where id = metric_value_21060_id
       and numeric_value = 21060
       and value_status = 'provisional'
       and notes = 'Valor retrospectivo transcrito da publicação de junho. Permanece provisório e não é corrigido, rejeitado ou substituído pela carga.'
  ) then
    raise exception 'Carga 0005: um valor da métrica já existe com conteúdo divergente.';
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
      'ABVE e Tupi publicam 21.061 pontos públicos e semipúblicos para fevereiro de 2026',
      'A ABVE publicou, com apuração atribuída à ABVE e à Tupi Mobilidade, o total de 21.061 pontos públicos e semipúblicos de recarga no Brasil na base atualizada até fevereiro de 2026.',
      'market_data',
      'publication',
      date '2026-03-04',
      'day',
      'Brasil',
      'O valor descreve a infraestrutura pública e semipública de recarga disponível no mercado brasileiro.',
      'confirmed',
      'accepted',
      'canonical-0005-abve-tupi-publicam-21061-fevereiro-2026-2026-03-04',
      'Confirmed registra o que a publicação institucional sustenta; não indica auditoria da base nem corroboração independente.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      'Atualização da ABVE e Tupi referencia 21.060 como total de fevereiro de 2026',
      'A atualização publicada pela ABVE e apresentada como trabalho da ABVE e da Tupi referenciou 21.060 pontos públicos e semipúblicos de recarga no Brasil para fevereiro de 2026.',
      'market_data',
      'publication',
      date '2026-06-22',
      'day',
      'Brasil',
      'O valor descreve retrospectivamente a infraestrutura pública e semipública de recarga disponível no mercado brasileiro.',
      'confirmed',
      'accepted',
      'canonical-0005-abve-tupi-referenciam-21060-fevereiro-2026-2026-06-22',
      'Confirmed registra o que a publicação institucional sustenta; não escolhe o total correto nem trata as páginas como confirmações independentes.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint events_fingerprint_unique do nothing;

  select id into march_event_id
    from public.events
   where event_fingerprint = 'canonical-0005-abve-tupi-publicam-21061-fevereiro-2026-2026-03-04';

  select id into june_event_id
    from public.events
   where event_fingerprint = 'canonical-0005-abve-tupi-referenciam-21060-fevereiro-2026-2026-06-22';

  if march_event_id is null or not exists (
    select 1 from public.events
     where id = march_event_id
       and title = 'ABVE e Tupi publicam 21.061 pontos públicos e semipúblicos para fevereiro de 2026'
       and summary = 'A ABVE publicou, com apuração atribuída à ABVE e à Tupi Mobilidade, o total de 21.061 pontos públicos e semipúblicos de recarga no Brasil na base atualizada até fevereiro de 2026.'
       and event_type = 'market_data'
       and event_phase = 'publication'
       and event_date = date '2026-03-04'
       and date_precision = 'day'
       and geography = 'Brasil'
       and brazil_relevance = 'O valor descreve a infraestrutura pública e semipública de recarga disponível no mercado brasileiro.'
       and verification_level = 'confirmed'
       and workflow_status = 'accepted'
       and notes = 'Confirmed registra o que a publicação institucional sustenta; não indica auditoria da base nem corroboração independente.'
  ) or june_event_id is null or not exists (
    select 1 from public.events
     where id = june_event_id
       and title = 'Atualização da ABVE e Tupi referencia 21.060 como total de fevereiro de 2026'
       and summary = 'A atualização publicada pela ABVE e apresentada como trabalho da ABVE e da Tupi referenciou 21.060 pontos públicos e semipúblicos de recarga no Brasil para fevereiro de 2026.'
       and event_type = 'market_data'
       and event_phase = 'publication'
       and event_date = date '2026-06-22'
       and date_precision = 'day'
       and geography = 'Brasil'
       and brazil_relevance = 'O valor descreve retrospectivamente a infraestrutura pública e semipública de recarga disponível no mercado brasileiro.'
       and verification_level = 'confirmed'
       and workflow_status = 'accepted'
       and notes = 'Confirmed registra o que a publicação institucional sustenta; não escolhe o total correto nem trata as páginas como confirmações independentes.'
  ) then
    raise exception 'Carga 0005: um acontecimento já existe com conteúdo divergente.';
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
      march_event_id,
      evidence_21061_id,
      'supports',
      'A publicação de março sustenta que a ABVE e a Tupi divulgaram 21.061 para a base nacional até fevereiro de 2026.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      june_event_id,
      evidence_21060_id,
      'supports',
      'A publicação de junho sustenta que a atualização da ABVE e da Tupi referenciou 21.060 para fevereiro de 2026.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint event_evidence_pkey do nothing;

  if not exists (
    select 1 from public.event_evidence
     where event_id = march_event_id
       and evidence_id = evidence_21061_id
       and relationship_type = 'supports'
       and notes = 'A publicação de março sustenta que a ABVE e a Tupi divulgaram 21.061 para a base nacional até fevereiro de 2026.'
  ) or not exists (
    select 1 from public.event_evidence
     where event_id = june_event_id
       and evidence_id = evidence_21060_id
       and relationship_type = 'supports'
       and notes = 'A publicação de junho sustenta que a atualização da ABVE e da Tupi referenciou 21.060 para fevereiro de 2026.'
  ) then
    raise exception 'Carga 0005: um vínculo entre acontecimento e evidência está divergente.';
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
    (march_event_id, abve_organization_id, 'subject', 'A ABVE publicou a página e participou da apuração declarada.', canonical_recorded_at, canonical_recorded_at),
    (march_event_id, tupi_organization_id, 'subject', 'A Tupi Mobilidade participou da apuração declarada na publicação.', canonical_recorded_at, canonical_recorded_at),
    (june_event_id, abve_organization_id, 'subject', 'A ABVE publicou a atualização e participou de sua apresentação declarada.', canonical_recorded_at, canonical_recorded_at),
    (june_event_id, tupi_organization_id, 'subject', 'A Tupi participou da apresentação declarada da atualização.', canonical_recorded_at, canonical_recorded_at)
  on conflict on constraint event_organizations_pkey do nothing;

  if not exists (
    select 1 from public.event_organizations
     where event_id = march_event_id
       and organization_id = abve_organization_id
       and event_role = 'subject'
       and notes = 'A ABVE publicou a página e participou da apuração declarada.'
  ) or not exists (
    select 1 from public.event_organizations
     where event_id = march_event_id
       and organization_id = tupi_organization_id
       and event_role = 'subject'
       and notes = 'A Tupi Mobilidade participou da apuração declarada na publicação.'
  ) or not exists (
    select 1 from public.event_organizations
     where event_id = june_event_id
       and organization_id = abve_organization_id
       and event_role = 'subject'
       and notes = 'A ABVE publicou a atualização e participou de sua apresentação declarada.'
  ) or not exists (
    select 1 from public.event_organizations
     where event_id = june_event_id
       and organization_id = tupi_organization_id
       and event_role = 'subject'
       and notes = 'A Tupi participou da apresentação declarada da atualização.'
  ) then
    raise exception 'Carga 0005: um vínculo entre acontecimento e organização está divergente.';
  end if;

  if (select count(*) from public.content_items
       where content_fingerprint ~ '^canonical-0005-') <> 2
    or (select count(*) from public.observations
         where observation_fingerprint ~ '^canonical-0005-') <> 2
    or (select count(*) from public.evidence
         where lineage_key = 'canonical-0005-abve-tupi-base-nacional-fevereiro-2026') <> 2
    or (select count(*) from public.events
         where event_fingerprint ~ '^canonical-0005-') <> 2
    or (select count(*) from public.organizations
         where slug = 'tupi-mobilidade') <> 1
    or (select count(*) from public.metric_definitions
         where metric_key = 'public-semi-public-charging-points-brazil') <> 1
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where o.observation_fingerprint ~ '^canonical-0005-') <> 2
    or (select count(*) from public.event_evidence
         where event_id in (march_event_id, june_event_id)) <> 2
    or (select count(*) from public.event_organizations
         where event_id in (march_event_id, june_event_id)) <> 4
  then
    raise exception 'Carga 0005: as contagens finais não correspondem ao pacote mínimo esperado.';
  end if;

  if (select count(*)
        from public.events e
        join public.event_evidence ee
          on ee.event_id = e.id
         and ee.relationship_type = 'supports'
        join public.evidence ev on ev.id = ee.evidence_id
        join public.observations o on o.id = ev.observation_id
        join public.content_items ci
          on ci.id = o.content_item_id
         and ci.id = ev.origin_content_item_id
        join public.sources s on s.id = ci.source_id
        join public.metric_values mv on mv.observation_id = o.id
        join public.metric_definitions md on md.id = mv.metric_definition_id
       where e.id in (march_event_id, june_event_id)
         and s.id = abve_source_id
         and o.normalization_status = 'normalized'
         and ev.lineage_status = 'likely_shared'
         and md.id = charging_metric_definition_id
         and md.status = 'approved'
         and mv.period_start = date '2026-02-01'
         and mv.period_end = date '2026-02-28'
         and mv.geography = 'Brasil'
         and mv.value_status = 'provisional'
         and e.workflow_status = 'accepted'
         and e.verification_level = 'confirmed') <> 2
    or (select array_agg(mv.numeric_value order by mv.numeric_value)
          from public.metric_values mv
         where mv.id in (metric_value_21061_id, metric_value_21060_id))
       is distinct from array[21060::numeric, 21061::numeric]
    or (select count(*)
          from public.event_organizations eo
         where eo.event_id in (march_event_id, june_event_id)
           and eo.organization_id in (abve_organization_id, tupi_organization_id)
           and eo.event_role = 'subject') <> 4
  then
    raise exception 'Carga 0005: as cadeias factuais conflitantes não podem ser reconstruídas integralmente.';
  end if;

  if exists (
    select 1 from public.metric_values mv
     where mv.id in (metric_value_21061_id, metric_value_21060_id)
       and mv.value_status <> 'provisional'
  ) then
    raise exception 'Carga 0005: nenhum valor conflitante pode deixar o estado provisional.';
  end if;

  select md5(jsonb_build_object(
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
  )::text)
    into prior_loads_signature_after;

  if prior_loads_signature_after is distinct from prior_loads_signature_before then
    raise exception 'Carga 0005: as cargas 0001, 0002 ou 0003 foram alteradas.';
  end if;

  if (
    (select count(*) from public.content_items where content_fingerprint like 'pilot-%')
    + (select count(*) from public.observations where observation_fingerprint like 'pilot-%')
    + (select count(*) from public.evidence where lineage_key like 'pilot-%')
    + (select count(*) from public.events where event_fingerprint like 'pilot-%')
  ) <> 0 then
    raise exception 'Carga 0005: foram encontrados identificadores descartáveis de piloto.';
  end if;
end
$$;
