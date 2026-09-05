-- Carga canônica 0002: apresentação pública do BMW iX3 no Brasil.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-04 20:21:01+02';
  load_0001_source_id bigint;
  load_0001_content_item_id bigint;
  load_0001_observation_id bigint;
  load_0001_evidence_id bigint;
  load_0001_event_id bigint;
  load_0001_organization_id bigint;
  bmw_source_id bigint;
  dgabc_source_id bigint;
  bmw_organization_id bigint;
  bmw_content_item_id bigint;
  dgabc_content_item_id bigint;
  bmw_observation_id bigint;
  dgabc_observation_id bigint;
  bmw_evidence_id bigint;
  dgabc_evidence_id bigint;
  presentation_event_id bigint;
begin
  if (select count(*) from public.sources
       where slug = 'jeep-stellantis-media') <> 1
    or (select count(*) from public.content_items
         where content_fingerprint = 'canonical-0001-jeep-avenger-2026-08-13') <> 1
    or (select count(*) from public.observations
         where observation_fingerprint = 'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13') <> 1
    or (select count(*) from public.evidence
         where lineage_key = 'canonical-0001-jeep-avenger-lancamento-2026-08-13') <> 1
    or (select count(*) from public.events
         where event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13') <> 1
    or (select count(*) from public.organizations
         where slug = 'jeep') <> 1
  then
    raise exception 'Carga 0002: a carga 0001 não possui exatamente um registro de cada tipo esperado.';
  end if;

  select id into load_0001_source_id
    from public.sources
   where slug = 'jeep-stellantis-media';

  select id into load_0001_content_item_id
    from public.content_items
   where content_fingerprint = 'canonical-0001-jeep-avenger-2026-08-13';

  select id into load_0001_observation_id
    from public.observations
   where observation_fingerprint = 'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13';

  select id into load_0001_evidence_id
    from public.evidence
   where lineage_key = 'canonical-0001-jeep-avenger-lancamento-2026-08-13';

  select id into load_0001_event_id
    from public.events
   where event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13';

  select id into load_0001_organization_id
    from public.organizations
   where slug = 'jeep';

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
     where s.id = load_0001_source_id
       and ci.id = load_0001_content_item_id
       and o.id = load_0001_observation_id
       and ev.id = load_0001_evidence_id
       and e.id = load_0001_event_id
       and s.status = 'approved'
       and o.normalization_status = 'normalized'
       and ev.lineage_status = 'established'
       and e.workflow_status = 'accepted'
       and e.verification_level = 'confirmed'
  ) or not exists (
    select 1
      from public.event_organizations eo
      join public.organizations org on org.id = eo.organization_id
     where eo.event_id = load_0001_event_id
       and eo.organization_id = load_0001_organization_id
       and eo.event_role = 'subject'
       and org.status = 'approved'
  ) then
    raise exception 'Carga 0002: os estados ou vínculos da carga 0001 estão divergentes.';
  end if;

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
  values
    (
      'BMW Group PressClub Brasil',
      'bmw-group-pressclub-brasil',
      'https://www.press.bmwgroup.com/brazil',
      'company',
      'approved',
      'BR',
      array['pt-BR'],
      true,
      'BMW Group',
      'Canal oficial de imprensa do BMW Group no Brasil.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      'Diário do Grande ABC',
      'diario-do-grande-abc',
      'https://www.dgabc.com.br/',
      'news_journalism',
      'approved',
      'BR',
      array['pt-BR'],
      false,
      null,
      'Veículo jornalístico brasileiro com controle editorial distinto do BMW Group.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint sources_slug_unique do nothing;

  select id into bmw_source_id
    from public.sources
   where slug = 'bmw-group-pressclub-brasil';

  if bmw_source_id is null or exists (
    select 1
      from public.sources
     where id = bmw_source_id
       and (
         name is distinct from 'BMW Group PressClub Brasil'
         or homepage_url is distinct from 'https://www.press.bmwgroup.com/brazil'
         or source_type is distinct from 'company'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or language_codes is distinct from array['pt-BR']::text[]
         or is_primary_source is distinct from true
         or publisher_group is distinct from 'BMW Group'
         or notes is distinct from 'Canal oficial de imprensa do BMW Group no Brasil.'
       )
  ) then
    raise exception 'Carga 0002: a fonte bmw-group-pressclub-brasil já existe com conteúdo divergente.';
  end if;

  select id into dgabc_source_id
    from public.sources
   where slug = 'diario-do-grande-abc';

  if dgabc_source_id is null or exists (
    select 1
      from public.sources
     where id = dgabc_source_id
       and (
         name is distinct from 'Diário do Grande ABC'
         or homepage_url is distinct from 'https://www.dgabc.com.br/'
         or source_type is distinct from 'news_journalism'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or language_codes is distinct from array['pt-BR']::text[]
         or is_primary_source is distinct from false
         or publisher_group is not null
         or notes is distinct from 'Veículo jornalístico brasileiro com controle editorial distinto do BMW Group.'
       )
  ) then
    raise exception 'Carga 0002: a fonte diario-do-grande-abc já existe com conteúdo divergente.';
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
    'BMW',
    null,
    'bmw',
    'other',
    'approved',
    null,
    'https://www.bmw.com.br/pt/index.html',
    'Marca automotiva que ocupa o papel de sujeito central no acontecimento.',
    'O tipo other registra a BMW como marca, sem atribuir personalidade jurídica nem estruturar nesta carga sua relação societária com o BMW Group.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint organizations_slug_unique do nothing;

  select id into bmw_organization_id
    from public.organizations
   where slug = 'bmw';

  if bmw_organization_id is null or exists (
    select 1
      from public.organizations
     where id = bmw_organization_id
       and (
         name is distinct from 'BMW'
         or legal_name is not null
         or organization_type is distinct from 'other'
         or status is distinct from 'approved'
         or country_code is not null
         or homepage_url is distinct from 'https://www.bmw.com.br/pt/index.html'
         or description is distinct from 'Marca automotiva que ocupa o papel de sujeito central no acontecimento.'
         or notes is distinct from 'O tipo other registra a BMW como marca, sem atribuir personalidade jurídica nem estruturar nesta carga sua relação societária com o BMW Group.'
       )
  ) then
    raise exception 'Carga 0002: a organização bmw já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint = 'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03'
       or (source_id = bmw_source_id and url = 'https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026')
     )
       and (
         source_id is distinct from bmw_source_id
         or url is distinct from 'https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026'
         or content_fingerprint is distinct from 'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03'
       )
  ) then
    raise exception 'Carga 0002: a publicação da BMW possui URL ou identificador estável divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint = 'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
       or (source_id = dgabc_source_id and url = 'https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais')
     )
       and (
         source_id is distinct from dgabc_source_id
         or url is distinct from 'https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais'
         or content_fingerprint is distinct from 'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
       )
  ) then
    raise exception 'Carga 0002: a reportagem do Diário do Grande ABC possui URL ou identificador estável divergente.';
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
      bmw_source_id,
      'https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026',
      'Novo BMW iX3 fez primeira aparição ao público no Brasil e foi destaque da BMW no Festival Interlagos Carros 2026',
      'press_release',
      date '2026-09-03',
      null,
      canonical_recorded_at,
      'Fabiano Severo',
      'pt-BR',
      'PressClub Brasil',
      'original',
      'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
      'external_reference',
      null,
      'https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      dgabc_source_id,
      'https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais',
      'Festival Interlagos 2026 tem enxurrada de estreias no país',
      'article',
      date '2026-08-27',
      null,
      canonical_recorded_at,
      'Vagner Aquino',
      'pt-BR',
      'Automóveis',
      'original',
      'canonical-0002-dgabc-ix3-interlagos-2026-08-27',
      'external_reference',
      null,
      'https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint content_items_source_url_fingerprint_unique do nothing;

  select id into bmw_content_item_id
    from public.content_items
   where source_id = bmw_source_id
     and url = 'https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026'
     and content_fingerprint = 'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03';

  if bmw_content_item_id is null or exists (
    select 1
      from public.content_items
     where id = bmw_content_item_id
       and (
         title is distinct from 'Novo BMW iX3 fez primeira aparição ao público no Brasil e foi destaque da BMW no Festival Interlagos Carros 2026'
         or content_type is distinct from 'press_release'
         or published_on is distinct from date '2026-09-03'
         or published_at is not null
         or author_name is distinct from 'Fabiano Severo'
         or language_code is distinct from 'pt-BR'
         or section_name is distinct from 'PressClub Brasil'
         or publication_nature is distinct from 'original'
         or retention_class is distinct from 'external_reference'
         or evidentiary_excerpt is not null
         or raw_capture_reference is distinct from 'https://www.press.bmwgroup.com/brazil/article/detail/T0460476PT/novo-bmw-ix3-fez-primeira-apari%C3%A7%C3%A3o-ao-p%C3%BAblico-no-brasil-e-foi-destaque-da-bmw-no-festival-interlagos-carros-2026'
       )
  ) then
    raise exception 'Carga 0002: a publicação da BMW já existe com conteúdo divergente.';
  end if;

  select id into dgabc_content_item_id
    from public.content_items
   where source_id = dgabc_source_id
     and url = 'https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais'
     and content_fingerprint = 'canonical-0002-dgabc-ix3-interlagos-2026-08-27';

  if dgabc_content_item_id is null or exists (
    select 1
      from public.content_items
     where id = dgabc_content_item_id
       and (
         title is distinct from 'Festival Interlagos 2026 tem enxurrada de estreias no país'
         or content_type is distinct from 'article'
         or published_on is distinct from date '2026-08-27'
         or published_at is not null
         or author_name is distinct from 'Vagner Aquino'
         or language_code is distinct from 'pt-BR'
         or section_name is distinct from 'Automóveis'
         or publication_nature is distinct from 'original'
         or retention_class is distinct from 'external_reference'
         or evidentiary_excerpt is not null
         or raw_capture_reference is distinct from 'https://www.dgabc.com.br/Noticia/4343712/festival-interlagos-2026-tem-enxurrada-de-estreias-no-pais'
       )
  ) then
    raise exception 'Carga 0002: a reportagem do Diário do Grande ABC já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.observations
     where observation_fingerprint in (
       'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27',
       'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27'
     )
       and content_item_id not in (bmw_content_item_id, dgabc_content_item_id)
  ) then
    raise exception 'Carga 0002: uma observação já usa o identificador estável com outra publicação.';
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
      bmw_content_item_id,
      'claim',
      'O novo BMW iX3 fez sua primeira aparição pública no Brasil durante o evento [...].',
      'A BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, realizado no Autódromo de Interlagos, em São Paulo, de 27 a 30 de agosto de 2026.',
      'normalized',
      date '2026-08-27',
      'São Paulo, SP, Brasil',
      'manual',
      'primeira aparição pública no Brasil',
      'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27',
      'A normalização retém a apresentação pública e o período do evento; a alegação de primeira aparição, o interesse do público, especificações e superlativos não ampliam o núcleo corroborado.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      dgabc_content_item_id,
      'claim',
      'O Festival Interlagos 2026 abriu as portas para o público nesta quinta-feira (27) [...]. Na BMW, o principal lançamento é o iX3 [...].',
      'Em 27 de agosto de 2026, o Festival Interlagos 2026 abriu ao público no Autódromo de Interlagos, em São Paulo, com o iX3 como principal lançamento da BMW e parte da nova geração de veículos elétricos da marca.',
      'normalized',
      date '2026-08-27',
      'São Paulo, SP, Brasil',
      'manual',
      'principal lançamento é o iX3',
      'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27',
      'A normalização retém a abertura ao público, o local e a apresentação do iX3; exclui outros modelos, marcas, especificações, preços e expectativas.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint observations_content_fingerprint_unique do nothing;

  select id into bmw_observation_id
    from public.observations
   where content_item_id = bmw_content_item_id
     and observation_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27';

  if bmw_observation_id is null or exists (
    select 1
      from public.observations
     where id = bmw_observation_id
       and (
         observation_type is distinct from 'claim'
         or source_claim is distinct from 'O novo BMW iX3 fez sua primeira aparição pública no Brasil durante o evento [...].'
         or normalized_claim is distinct from 'A BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, realizado no Autódromo de Interlagos, em São Paulo, de 27 a 30 de agosto de 2026.'
         or normalization_status is distinct from 'normalized'
         or observation_date is distinct from date '2026-08-27'
         or geography is distinct from 'São Paulo, SP, Brasil'
         or extraction_method is distinct from 'manual'
         or source_term is distinct from 'primeira aparição pública no Brasil'
         or notes is distinct from 'A normalização retém a apresentação pública e o período do evento; a alegação de primeira aparição, o interesse do público, especificações e superlativos não ampliam o núcleo corroborado.'
       )
  ) then
    raise exception 'Carga 0002: a observação da BMW já existe com conteúdo divergente.';
  end if;

  select id into dgabc_observation_id
    from public.observations
   where content_item_id = dgabc_content_item_id
     and observation_fingerprint = 'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27';

  if dgabc_observation_id is null or exists (
    select 1
      from public.observations
     where id = dgabc_observation_id
       and (
         observation_type is distinct from 'claim'
         or source_claim is distinct from 'O Festival Interlagos 2026 abriu as portas para o público nesta quinta-feira (27) [...]. Na BMW, o principal lançamento é o iX3 [...].'
         or normalized_claim is distinct from 'Em 27 de agosto de 2026, o Festival Interlagos 2026 abriu ao público no Autódromo de Interlagos, em São Paulo, com o iX3 como principal lançamento da BMW e parte da nova geração de veículos elétricos da marca.'
         or normalization_status is distinct from 'normalized'
         or observation_date is distinct from date '2026-08-27'
         or geography is distinct from 'São Paulo, SP, Brasil'
         or extraction_method is distinct from 'manual'
         or source_term is distinct from 'principal lançamento é o iX3'
         or notes is distinct from 'A normalização retém a abertura ao público, o local e a apresentação do iX3; exclui outros modelos, marcas, especificações, preços e expectativas.'
       )
  ) then
    raise exception 'Carga 0002: a observação do Diário do Grande ABC já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.evidence
     where lineage_key in (
       'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
       'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
     )
       and observation_id not in (bmw_observation_id, dgabc_observation_id)
  ) then
    raise exception 'Carga 0002: uma evidência já usa a chave de linhagem com outra observação.';
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
      bmw_observation_id,
      bmw_content_item_id,
      null,
      'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
      'established',
      'A origem exata está estabelecida no comunicado oficial da BMW. Esta linhagem confirma a declaração do sujeito, mas não é independente dele.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      dgabc_observation_id,
      dgabc_content_item_id,
      null,
      'canonical-0002-dgabc-ix3-interlagos-2026-08-27',
      'established',
      'A origem exata está estabelecida na reportagem contemporânea, assinada e com fotografia própria. Seu controle editorial é distinto e sua publicação antecede o comunicado da BMW.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint evidence_observation_lineage_unique do nothing;

  select id into bmw_evidence_id
    from public.evidence
   where observation_id = bmw_observation_id
     and lineage_key = 'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03';

  if bmw_evidence_id is null or exists (
    select 1
      from public.evidence
     where id = bmw_evidence_id
       and (
         origin_content_item_id is distinct from bmw_content_item_id
         or origin_source_id is not null
         or lineage_status is distinct from 'established'
         or notes is distinct from 'A origem exata está estabelecida no comunicado oficial da BMW. Esta linhagem confirma a declaração do sujeito, mas não é independente dele.'
       )
  ) then
    raise exception 'Carga 0002: a evidência da BMW já existe com conteúdo divergente.';
  end if;

  select id into dgabc_evidence_id
    from public.evidence
   where observation_id = dgabc_observation_id
     and lineage_key = 'canonical-0002-dgabc-ix3-interlagos-2026-08-27';

  if dgabc_evidence_id is null or exists (
    select 1
      from public.evidence
     where id = dgabc_evidence_id
       and (
         origin_content_item_id is distinct from dgabc_content_item_id
         or origin_source_id is not null
         or lineage_status is distinct from 'established'
         or notes is distinct from 'A origem exata está estabelecida na reportagem contemporânea, assinada e com fotografia própria. Seu controle editorial é distinto e sua publicação antecede o comunicado da BMW.'
       )
  ) then
    raise exception 'Carga 0002: a evidência do Diário do Grande ABC já existe com conteúdo divergente.';
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
    'BMW apresenta o iX3 ao público brasileiro no Festival Interlagos',
    'A BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, no Autódromo de Interlagos, em São Paulo. O evento abriu ao público em 27 de agosto de 2026.',
    'product_service',
    'occurrence',
    date '2026-08-27',
    'day',
    'São Paulo, SP, Brasil',
    'A apresentação ocorreu no Brasil e tornou um novo veículo elétrico da marca acessível ao público brasileiro durante um evento automotivo nacional.',
    'corroborated',
    'accepted',
    'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27',
    'A data representa o início do período público do Festival, realizado de 27 a 30 de agosto. Corroborated aplica-se somente à apresentação pública, sustentada pelo comunicado da BMW e pela cobertura contemporânea independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint events_fingerprint_unique do nothing;

  select id into presentation_event_id
    from public.events
   where event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27';

  if presentation_event_id is null or exists (
    select 1
      from public.events
     where id = presentation_event_id
       and (
         title is distinct from 'BMW apresenta o iX3 ao público brasileiro no Festival Interlagos'
         or summary is distinct from 'A BMW apresentou o iX3 elétrico ao público brasileiro durante o Festival Interlagos Carros 2026, no Autódromo de Interlagos, em São Paulo. O evento abriu ao público em 27 de agosto de 2026.'
         or event_type is distinct from 'product_service'
         or event_phase is distinct from 'occurrence'
         or event_date is distinct from date '2026-08-27'
         or date_precision is distinct from 'day'
         or geography is distinct from 'São Paulo, SP, Brasil'
         or brazil_relevance is distinct from 'A apresentação ocorreu no Brasil e tornou um novo veículo elétrico da marca acessível ao público brasileiro durante um evento automotivo nacional.'
         or verification_level is distinct from 'corroborated'
         or workflow_status is distinct from 'accepted'
         or notes is distinct from 'A data representa o início do período público do Festival, realizado de 27 a 30 de agosto. Corroborated aplica-se somente à apresentação pública, sustentada pelo comunicado da BMW e pela cobertura contemporânea independente.'
       )
  ) then
    raise exception 'Carga 0002: o acontecimento já existe com conteúdo divergente.';
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
      presentation_event_id,
      bmw_evidence_id,
      'supports',
      'O comunicado oficial sustenta que a BMW apresentou o iX3 ao público brasileiro durante o Festival Interlagos.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      presentation_event_id,
      dgabc_evidence_id,
      'supports',
      'A reportagem independente sustenta que o Festival abriu ao público em São Paulo e que o iX3 foi apresentado como lançamento da BMW.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint event_evidence_pkey do nothing;

  if not exists (
    select 1
      from public.event_evidence
     where event_id = presentation_event_id
       and evidence_id = bmw_evidence_id
       and relationship_type = 'supports'
       and notes = 'O comunicado oficial sustenta que a BMW apresentou o iX3 ao público brasileiro durante o Festival Interlagos.'
  ) or not exists (
    select 1
      from public.event_evidence
     where event_id = presentation_event_id
       and evidence_id = dgabc_evidence_id
       and relationship_type = 'supports'
       and notes = 'A reportagem independente sustenta que o Festival abriu ao público em São Paulo e que o iX3 foi apresentado como lançamento da BMW.'
  ) then
    raise exception 'Carga 0002: um vínculo entre acontecimento e evidência está divergente.';
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
    presentation_event_id,
    bmw_organization_id,
    'subject',
    'BMW é a marca e o sujeito central da apresentação pública do iX3.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint event_organizations_pkey do nothing;

  if not exists (
    select 1
      from public.event_organizations
     where event_id = presentation_event_id
       and organization_id = bmw_organization_id
       and event_role = 'subject'
       and notes = 'BMW é a marca e o sujeito central da apresentação pública do iX3.'
  ) then
    raise exception 'Carga 0002: o vínculo entre acontecimento e organização está divergente.';
  end if;

  if (select count(*) from public.sources
       where slug in ('bmw-group-pressclub-brasil', 'diario-do-grande-abc')) <> 2
    or (select count(*) from public.content_items
         where content_fingerprint in (
           'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
           'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
         )) <> 2
    or (select count(*) from public.observations
         where observation_fingerprint in (
           'canonical-0002-bmw-ix3-apresentacao-publica-2026-08-27',
           'canonical-0002-dgabc-ix3-apresentacao-publica-2026-08-27'
         )) <> 2
    or (select count(*) from public.evidence
         where lineage_key in (
           'canonical-0002-bmw-pressclub-ix3-interlagos-2026-09-03',
           'canonical-0002-dgabc-ix3-interlagos-2026-08-27'
         )) <> 2
    or (select count(*) from public.events
         where event_fingerprint = 'canonical-0002-bmw-ix3-apresentacao-publica-brasil-2026-08-27') <> 1
    or (select count(*) from public.organizations
         where slug = 'bmw') <> 1
    or (select count(*) from public.event_evidence
         where event_id = presentation_event_id) <> 2
    or (select count(*) from public.event_organizations
         where event_id = presentation_event_id
           and organization_id = bmw_organization_id
           and event_role = 'subject') <> 1
  then
    raise exception 'Carga 0002: as contagens finais não correspondem ao pacote mínimo esperado.';
  end if;

  if (
    select count(*)
      from public.event_evidence ee
      join public.evidence ev on ev.id = ee.evidence_id
      join public.observations o on o.id = ev.observation_id
      join public.content_items ci on ci.id = o.content_item_id
      join public.sources s on s.id = ci.source_id
     where ee.event_id = presentation_event_id
       and ee.relationship_type = 'supports'
       and ev.lineage_status = 'established'
       and ev.origin_content_item_id = ci.id
       and s.id in (bmw_source_id, dgabc_source_id)
  ) <> 2 then
    raise exception 'Carga 0002: as duas linhagens não podem ser reconstruídas integralmente.';
  end if;

  if (select count(distinct s.id)
        from public.event_evidence ee
        join public.evidence ev on ev.id = ee.evidence_id
        join public.observations o on o.id = ev.observation_id
        join public.content_items ci on ci.id = o.content_item_id
        join public.sources s on s.id = ci.source_id
       where ee.event_id = presentation_event_id) <> 2
  then
    raise exception 'Carga 0002: as evidências não alcançam duas fontes distintas.';
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
     where s.id = load_0001_source_id
       and ci.id = load_0001_content_item_id
       and o.id = load_0001_observation_id
       and ev.id = load_0001_evidence_id
       and e.id = load_0001_event_id
       and s.status = 'approved'
       and o.normalization_status = 'normalized'
       and ev.lineage_status = 'established'
       and e.workflow_status = 'accepted'
       and e.verification_level = 'confirmed'
  ) or not exists (
    select 1
      from public.event_organizations eo
      join public.organizations org on org.id = eo.organization_id
     where eo.event_id = load_0001_event_id
       and eo.organization_id = load_0001_organization_id
       and eo.event_role = 'subject'
       and org.status = 'approved'
  ) then
    raise exception 'Carga 0002: a carga 0001 não permaneceu invariável.';
  end if;
end
$$;
