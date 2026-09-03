-- PILOT-02: expansão da rede de recarga rápida declarada pela BYD.
-- Estes registros são dados de teste reproduzíveis para revisão independente.

do $$
declare
  fixture_recorded_at constant timestamptz :=
    timestamptz '2026-08-31 18:49:00+02';
  byd_source_id bigint;
  byd_organization_id bigint;
  byd_content_item_id bigint;
  operational_observation_id bigint;
  target_observation_id bigint;
  operational_evidence_id bigint;
  target_evidence_id bigint;
  operational_event_id bigint;
  target_event_id bigint;
begin
  insert into public.sources (
    name,
    slug,
    homepage_url,
    source_type,
    status,
    country_code,
    language_codes,
    is_primary_source,
    notes,
    created_at,
    updated_at
  )
  values (
    'BYD Brasil',
    'byd-brasil',
    'https://www.byd.com/br',
    'company',
    'under_review',
    'BR',
    array['pt-BR'],
    true,
    'Fonte oficial da empresa no Brasil; única fonte do recorte de PILOT-02.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into byd_source_id;

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
    'BYD Brasil',
    'BYD do Brasil Ltda',
    'byd-brasil',
    'company',
    'under_review',
    'BR',
    'https://www.byd.com/br',
    'Empresa que ocupa o papel de sujeito nos dois eventos de PILOT-02.',
    'O cadastro não afirma propriedade ou operação exclusiva da infraestrutura.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into byd_organization_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    byd_source_id,
    'https://www.byd.com/br/maior-rede-de-recarga-publica-do-pais-byd-alcanca-125-carregadores-rapidos-instalados-em-todo-territorio-nacional',
    'Maior rede de recarga pública do país: BYD alcança 125 carregadores rápidos instalados em todo território nacional',
    'press_release',
    date '2026-03-24',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-02-byd-2026-03-24',
    'external_reference',
    'https://www.byd.com/br/maior-rede-de-recarga-publica-do-pais-byd-alcanca-125-carregadores-rapidos-instalados-em-todo-territorio-nacional',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into byd_content_item_id;

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
    byd_content_item_id,
    'quantity',
    '125 carregadores rápidos em operação pública no Brasil',
    'A BYD declara ter atingido 125 carregadores rápidos em operação pública no Brasil em 24 de março de 2026.',
    'normalized',
    date '2026-03-24',
    'Brasil',
    'manual',
    'carregadores rápidos em operação pública',
    'pilot-02-byd-125-operacao-2026-03-24',
    'Estado realizado segundo a publicação da própria empresa; não possui confirmação independente neste recorte.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into operational_observation_id;

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
    byd_content_item_id,
    'quantity',
    'até o fim de 2026, essa malha chegue a 225 pontos de recarga rápida',
    'A BYD declara a expectativa de que sua malha alcance 225 pontos de recarga rápida até 31 de dezembro de 2026.',
    'normalized',
    date '2026-12-31',
    'Brasil',
    'manual',
    'pontos de recarga rápida',
    'pilot-02-byd-meta-225-2026-12-31',
    'Expectativa futura da própria empresa; não representa infraestrutura realizada nem confirmação independente.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into target_observation_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    operational_observation_id,
    byd_content_item_id,
    'pilot-02-byd-2026-03-24-125-operacao',
    'established',
    'Origem exata estabelecida; sustenta a declaração empresarial, não uma verificação independente.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into operational_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    target_observation_id,
    byd_content_item_id,
    'pilot-02-byd-2026-03-24-meta-225',
    'established',
    'Origem exata estabelecida; sustenta somente a expectativa publicada pela empresa.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into target_evidence_id;

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
    'BYD declara 125 carregadores rápidos em operação pública no Brasil',
    'Em publicação própria, a BYD declarou ter atingido 125 carregadores rápidos em operação pública no Brasil.',
    'infrastructure',
    'update',
    date '2026-03-24',
    'day',
    'Brasil',
    'A declaração trata de infraestrutura de recarga pública instalada no território brasileiro.',
    'reported',
    'under_review',
    'pilot-02-byd-125-operacao-2026-03-24',
    'O nível reported preserva que a única confirmação do recorte é a publicação da própria empresa.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into operational_event_id;

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
    'BYD anuncia expectativa de 225 pontos de recarga rápida até o fim de 2026',
    'Em publicação própria, a BYD apresentou a expectativa de que sua malha alcance 225 pontos de recarga rápida até o fim de 2026.',
    'infrastructure',
    'announcement',
    date '2026-03-24',
    'day',
    'Brasil',
    'A expectativa se refere à expansão de infraestrutura de recarga rápida no Brasil.',
    'reported',
    'under_review',
    'pilot-02-byd-meta-225-anuncio-2026-03-24',
    'event_date registra o anúncio; o prazo futuro permanece na observação associada.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into target_event_id;

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
      operational_event_id,
      operational_evidence_id,
      'supports',
      'Sustenta que a empresa publicou a declaração de estado realizado.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      target_event_id,
      target_evidence_id,
      'supports',
      'Sustenta que a empresa publicou a expectativa futura.',
      fixture_recorded_at,
      fixture_recorded_at
    );

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
      operational_event_id,
      byd_organization_id,
      'subject',
      'A BYD é a organização central da declaração de estado realizado.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      target_event_id,
      byd_organization_id,
      'subject',
      'A BYD é a organização central da expectativa anunciada.',
      fixture_recorded_at,
      fixture_recorded_at
    );
end
$$;

-- PILOT-01: cadeia normativa do Programa Mobilidade Verde e Inovação.
-- Publicação, produção de efeitos e encerramento de vigência permanecem
-- acontecimentos distintos. Relações entre atos só reproduzem texto oficial.

do $$
declare
  fixture_recorded_at constant timestamptz :=
    timestamptz '2026-09-02 18:00:00+02';
  legislation_source_id bigint;
  congress_source_id bigint;
  mp_content_id bigint;
  expiry_content_id bigint;
  law_content_id bigint;
  decree_content_id bigint;
  mp_instrument_id bigint;
  expiry_act_instrument_id bigint;
  law_instrument_id bigint;
  decree_instrument_id bigint;
  mp_institution_observation_id bigint;
  mp_effects_observation_id bigint;
  mp_expiry_observation_id bigint;
  law_institution_observation_id bigint;
  law_effects_observation_id bigint;
  law_convalidation_observation_id bigint;
  decree_regulation_observation_id bigint;
  decree_effective_observation_id bigint;
  mp_institution_evidence_id bigint;
  mp_effects_evidence_id bigint;
  mp_expiry_evidence_id bigint;
  law_institution_evidence_id bigint;
  law_effects_evidence_id bigint;
  law_convalidation_evidence_id bigint;
  decree_regulation_evidence_id bigint;
  decree_effective_evidence_id bigint;
  mp_publication_event_id bigint;
  mp_immediate_effect_event_id bigint;
  mp_february_effect_event_id bigint;
  mp_april_effect_event_id bigint;
  mp_expiry_event_id bigint;
  expiry_act_publication_event_id bigint;
  law_publication_event_id bigint;
  law_april_effect_event_id bigint;
  law_immediate_effect_event_id bigint;
  law_convalidation_event_id bigint;
  decree_publication_event_id bigint;
  decree_effective_event_id bigint;
begin
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
    'Legislação da Presidência da República',
    'legislacao-presidencia-republica',
    'https://www.planalto.gov.br/ccivil_03/',
    'government_regulator',
    'under_review',
    'BR',
    array['pt-BR'],
    true,
    'Governo Federal',
    'Repositório oficial consultado para a medida provisória, a lei e o decreto. As páginas indicam separadamente as publicações no Diário Oficial da União.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into legislation_source_id;

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
    'Congresso Nacional',
    'congresso-nacional',
    'https://www.congressonacional.leg.br',
    'government_regulator',
    'under_review',
    'BR',
    array['pt-BR'],
    true,
    'Poder Legislativo Federal',
    'Autoridade oficial do ato que declara o encerramento da vigência da Medida Provisória nº 1.205/2023; o recorte usa a reprodução oficial mantida no portal do Planalto.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into congress_source_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    legislation_source_id,
    'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/mpv/mpv1205.htm',
    'Medida Provisória nº 1.205, de 30 de dezembro de 2023',
    'regulatory_document',
    date '2023-12-30',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-01-mp-1205-2023',
    'external_reference',
    'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/mpv/mpv1205.htm',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_content_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    congress_source_id,
    'https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/congresso/adc-35-mpv1.205.htm',
    'Ato Declaratório do Presidente da Mesa do Congresso Nacional nº 35, de 2024',
    'regulatory_document',
    date '2024-06-11',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-01-ato-declaratorio-35-2024',
    'external_reference',
    'https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/congresso/adc-35-mpv1.205.htm',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into expiry_content_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    legislation_source_id,
    'https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm',
    'Lei nº 14.902, de 27 de junho de 2024',
    'regulatory_document',
    date '2024-06-28',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-01-lei-14902-2024',
    'external_reference',
    'https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_content_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    legislation_source_id,
    'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12435.htm',
    'Decreto nº 12.435, de 15 de abril de 2025',
    'regulatory_document',
    date '2025-04-16',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-01-decreto-12435-2025',
    'external_reference',
    'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12435.htm',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_content_id;

  insert into public.regulatory_instruments (
    official_content_item_id,
    instrument_key,
    title,
    short_title,
    instrument_type,
    official_identifier,
    issuing_authority,
    jurisdiction_level,
    jurisdiction_name,
    current_status,
    publication_date,
    effective_date,
    expiry_date,
    scope_summary,
    brazil_relevance,
    notes,
    created_at,
    updated_at
  )
  values
    (
      mp_content_id,
      'mp-1205-2023',
      'Medida Provisória nº 1.205, de 30 de dezembro de 2023',
      'MP nº 1.205/2023',
      'provisional_measure',
      'Medida Provisória nº 1.205/2023',
      'Presidência da República',
      'federal',
      'Brasil',
      'expired',
      date '2023-12-30',
      date '2023-12-30',
      date '2024-05-31',
      'Instituiu o Programa Mobilidade Verde e Inovação e definiu requisitos, incentivos e instrumentos para o setor de mobilidade e logística.',
      'O programa alcança a produção, a importação e a comercialização de veículos no Brasil e a política industrial automotiva nacional.',
      'A entrada em vigor ocorreu na publicação, mas o art. 32 estabeleceu datas distintas de produção de efeitos. O encerramento em 31 de maio de 2024 é sustentado pelo Ato Declaratório nº 35/2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      expiry_content_id,
      'ato-declaratorio-35-2024-mp-1205',
      'Ato Declaratório do Presidente da Mesa do Congresso Nacional nº 35, de 2024',
      'Ato Declaratório nº 35/2024',
      'other',
      'Ato Declaratório do Presidente da Mesa do Congresso Nacional nº 35/2024',
      'Presidência da Mesa do Congresso Nacional',
      'federal',
      'Brasil',
      'published',
      date '2024-06-11',
      null,
      null,
      'Declarou que o prazo de vigência da Medida Provisória nº 1.205/2023 se encerrou em 31 de maio de 2024.',
      'O ato documenta o encerramento da vigência do instrumento federal que havia instituído o Programa Mover.',
      'O ato foi assinado em 10 de junho e publicado no Diário Oficial da União em 11 de junho de 2024; a data declarada para o encerramento é 31 de maio de 2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_content_id,
      'lei-14902-2024',
      'Lei nº 14.902, de 27 de junho de 2024',
      'Lei nº 14.902/2024',
      'law',
      'Lei nº 14.902/2024',
      'Presidência da República e Congresso Nacional',
      'federal',
      'Brasil',
      'effective',
      date '2024-06-28',
      date '2024-06-28',
      null,
      'Instituiu o Programa Mobilidade Verde e Inovação e disciplinou medidas para o setor de mobilidade e logística.',
      'A lei disciplina o Programa Mover e requisitos aplicáveis à indústria automotiva e à comercialização e importação de veículos no Brasil.',
      'O art. 35 determina entrada em vigor na publicação, efeitos em 1º de abril de 2024 para os arts. 9º a 11 e efeitos na publicação para os demais dispositivos. O art. 33 convalida atos praticados com base na MP nº 1.205/2023.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      decree_content_id,
      'decreto-12435-2025',
      'Decreto nº 12.435, de 15 de abril de 2025',
      'Decreto nº 12.435/2025',
      'decree',
      'Decreto nº 12.435/2025',
      'Presidência da República',
      'federal',
      'Brasil',
      'effective',
      date '2025-04-16',
      date '2025-04-16',
      null,
      'Regulamentou o Programa Mover instituído pela Lei nº 14.902/2024.',
      'O decreto estabelece requisitos federais do Programa Mover aplicáveis à comercialização e à importação de veículos no Brasil.',
      'A ementa vincula expressamente o decreto à Lei nº 14.902/2024. O art. 15 determina entrada em vigor na data da publicação.',
      fixture_recorded_at,
      fixture_recorded_at
    );

  select id
  into strict mp_instrument_id
  from public.regulatory_instruments
  where instrument_key = 'mp-1205-2023';

  select id
  into strict expiry_act_instrument_id
  from public.regulatory_instruments
  where instrument_key = 'ato-declaratorio-35-2024-mp-1205';

  select id
  into strict law_instrument_id
  from public.regulatory_instruments
  where instrument_key = 'lei-14902-2024';

  select id
  into strict decree_instrument_id
  from public.regulatory_instruments
  where instrument_key = 'decreto-12435-2025';

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
    mp_content_id,
    'status',
    'Institui o Programa Mobilidade Verde e Inovação - Programa MOVER.',
    'A Medida Provisória nº 1.205/2023 instituiu o Programa Mover.',
    'normalized',
    date '2023-12-30',
    'Brasil',
    'manual',
    'institui',
    'pilot-01-mp-1205-institui-mover',
    'A observação reproduz a ementa e não afirma conversão posterior da medida provisória em lei.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_institution_observation_id;

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
    mp_content_id,
    'date',
    'A Medida Provisória entra em vigor na data de sua publicação e produz efeitos em 1º de fevereiro de 2024 para os arts. 12 a 21, em 1º de abril de 2024 para os arts. 9º a 11 e na publicação para os demais dispositivos.',
    'A MP nº 1.205/2023 entrou em vigor em 30 de dezembro de 2023 e estabeleceu três marcos de produção de efeitos: 30 de dezembro de 2023, 1º de fevereiro de 2024 e 1º de abril de 2024, conforme os grupos de dispositivos definidos no art. 32.',
    'normalized',
    null,
    'Brasil',
    'manual',
    'entra em vigor e produzirá efeitos',
    'pilot-01-mp-1205-vigencia-e-efeitos',
    'Nenhuma das três datas é usada como substituta das demais.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_effects_observation_id;

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
    expiry_content_id,
    'status',
    'A Medida Provisória nº 1.205, de 30 de dezembro de 2023, teve seu prazo de vigência encerrado no dia 31 de maio de 2024.',
    'O prazo de vigência da MP nº 1.205/2023 encerrou-se em 31 de maio de 2024, conforme declarado pelo Congresso Nacional.',
    'normalized',
    date '2024-05-31',
    'Brasil',
    'manual',
    'prazo de vigência encerrado',
    'pilot-01-mp-1205-vigencia-encerrada',
    'A data do encerramento é distinta da assinatura do ato declaratório em 10 de junho e de sua publicação em 11 de junho de 2024.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_expiry_observation_id;

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
    law_content_id,
    'status',
    'Esta Lei institui o Programa Mobilidade Verde e Inovação (Programa Mover).',
    'A Lei nº 14.902/2024 instituiu o Programa Mover.',
    'normalized',
    date '2024-06-28',
    'Brasil',
    'manual',
    'institui',
    'pilot-01-lei-14902-institui-mover',
    'A observação não classifica a lei como conversão ou substituição da MP nº 1.205/2023.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_institution_observation_id;

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
    law_content_id,
    'date',
    'A Lei entra em vigor na data de sua publicação e produz efeitos em 1º de abril de 2024 para os arts. 9º a 11 e na publicação para os demais dispositivos.',
    'A Lei nº 14.902/2024 entrou em vigor em 28 de junho de 2024; seus arts. 9º a 11 produzem efeitos desde 1º de abril de 2024 e os demais dispositivos desde a publicação.',
    'normalized',
    null,
    'Brasil',
    'manual',
    'entra em vigor e produzirá efeitos',
    'pilot-01-lei-14902-vigencia-e-efeitos',
    'O registro preserva separadamente a data de publicação, a entrada em vigor e a data de produção de efeitos indicada no art. 35.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_effects_observation_id;

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
    law_content_id,
    'relationship',
    'Ficam convalidados os atos praticados com base na Medida Provisória nº 1.205, de 30 de dezembro de 2023.',
    'O art. 33 da Lei nº 14.902/2024 convalidou os atos praticados com base na MP nº 1.205/2023.',
    'normalized',
    date '2024-06-28',
    'Brasil',
    'manual',
    'convalidados os atos praticados com base',
    'pilot-01-lei-14902-convalida-atos-mp-1205',
    'A relação é expressa no art. 33. Ela não foi ampliada para afirmar conversão, substituição ou equivalência integral entre os instrumentos.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_convalidation_observation_id;

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
    decree_content_id,
    'relationship',
    'Regulamenta o Programa Mobilidade Verde e Inovação (Programa Mover), instituído pela Lei nº 14.902, de 27 de junho de 2024.',
    'O Decreto nº 12.435/2025 regulamentou o Programa Mover instituído pela Lei nº 14.902/2024.',
    'normalized',
    date '2025-04-16',
    'Brasil',
    'manual',
    'regulamenta',
    'pilot-01-decreto-12435-regulamenta-lei-14902',
    'A relação entre o decreto e a lei é expressa na ementa e não depende apenas de continuidade temática.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_regulation_observation_id;

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
    decree_content_id,
    'date',
    'Este Decreto entra em vigor na data de sua publicação.',
    'O Decreto nº 12.435/2025 entrou em vigor em 16 de abril de 2025.',
    'normalized',
    date '2025-04-16',
    'Brasil',
    'manual',
    'entra em vigor na data de sua publicação',
    'pilot-01-decreto-12435-vigencia',
    'A assinatura ocorreu em 15 de abril; a publicação e a entrada em vigor ocorreram em 16 de abril de 2025.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_effective_observation_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    mp_institution_observation_id,
    mp_content_id,
    'pilot-01-mp-1205-texto-oficial',
    'established',
    'A ementa e o art. 1º sustentam que a medida provisória instituiu o Programa Mover.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_institution_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    mp_effects_observation_id,
    mp_content_id,
    'pilot-01-mp-1205-texto-oficial',
    'established',
    'O art. 32 sustenta a entrada em vigor e as três datas de produção de efeitos registradas.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_effects_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    mp_expiry_observation_id,
    expiry_content_id,
    'pilot-01-ato-35-encerramento-mp-1205',
    'established',
    'O ato declaratório sustenta o encerramento em 31 de maio e documenta sua própria publicação posterior.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_expiry_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    law_institution_observation_id,
    law_content_id,
    'pilot-01-lei-14902-texto-oficial',
    'established',
    'A ementa e o art. 1º sustentam que a lei instituiu o Programa Mover.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_institution_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    law_effects_observation_id,
    law_content_id,
    'pilot-01-lei-14902-texto-oficial',
    'established',
    'O art. 35 sustenta a entrada em vigor e as datas de produção de efeitos registradas.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_effects_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    law_convalidation_observation_id,
    law_content_id,
    'pilot-01-lei-14902-texto-oficial',
    'established',
    'O art. 33 sustenta somente a convalidação expressamente declarada.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_convalidation_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    decree_regulation_observation_id,
    decree_content_id,
    'pilot-01-decreto-12435-texto-oficial',
    'established',
    'A ementa sustenta que o decreto regulamenta o programa instituído pela Lei nº 14.902/2024.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_regulation_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    decree_effective_observation_id,
    decree_content_id,
    'pilot-01-decreto-12435-texto-oficial',
    'established',
    'O art. 15 sustenta a entrada em vigor na data da publicação.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_effective_evidence_id;

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
    'Publicação da MP nº 1.205 institui o Programa Mover',
    'A Medida Provisória nº 1.205/2023 foi publicada em 30 de dezembro de 2023 e instituiu o Programa Mover.',
    'regulation',
    'publication',
    date '2023-12-30',
    'day',
    'Brasil',
    'A medida provisória criou um programa federal aplicável à mobilidade e à indústria automotiva brasileira.',
    'confirmed',
    'under_review',
    'pilot-01-mp-1205-publicacao-2023-12-30',
    'Este evento registra a publicação, não todos os marcos de produção de efeitos.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_publication_event_id;

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
    'MP nº 1.205 entra em vigor e parte de seus dispositivos produz efeitos',
    'Na data da publicação, a MP nº 1.205/2023 entrou em vigor e os dispositivos não ressalvados no art. 32 começaram a produzir efeitos.',
    'regulation',
    'effective',
    date '2023-12-30',
    'day',
    'Brasil',
    'A vigência e os efeitos alcançam o Programa Mover em âmbito federal.',
    'confirmed',
    'under_review',
    'pilot-01-mp-1205-vigencia-2023-12-30',
    'A coincidência da data não funde este evento com a publicação. Os demais grupos de dispositivos possuem eventos próprios.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_immediate_effect_event_id;

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
    'Arts. 12 a 21 da MP nº 1.205 começam a produzir efeitos',
    'Os arts. 12 a 21 da MP nº 1.205/2023 começaram a produzir efeitos em 1º de fevereiro de 2024, conforme o art. 32.',
    'regulation',
    'effective',
    date '2024-02-01',
    'day',
    'Brasil',
    'Os dispositivos integram o regime federal de incentivos do Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-mp-1205-efeitos-artigos-12-21-2024-02-01',
    'O evento representa produção de efeitos de um grupo específico de dispositivos, não nova publicação.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_february_effect_event_id;

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
    'Arts. 9º a 11 da MP nº 1.205 começam a produzir efeitos',
    'Os arts. 9º a 11 da MP nº 1.205/2023 começaram a produzir efeitos em 1º de abril de 2024, conforme o art. 32.',
    'regulation',
    'effective',
    date '2024-04-01',
    'day',
    'Brasil',
    'Os dispositivos tratam da tributação de veículos no Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-mp-1205-efeitos-artigos-9-11-2024-04-01',
    'O evento representa produção de efeitos de um grupo específico de dispositivos, não nova publicação.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_april_effect_event_id;

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
    'Encerra-se a vigência da MP nº 1.205',
    'O prazo de vigência da MP nº 1.205/2023 encerrou-se em 31 de maio de 2024, conforme declaração posterior do Congresso Nacional.',
    'regulation',
    'expiry',
    date '2024-05-31',
    'day',
    'Brasil',
    'O encerramento altera o estado do instrumento federal que havia instituído o Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-mp-1205-vigencia-encerrada-2024-05-31',
    'A fase expiry identifica o encerramento em 31 de maio sem confundi-lo com a publicação posterior do ato declaratório.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into mp_expiry_event_id;

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
    'Publicação do Ato Declaratório nº 35 documenta o encerramento da MP nº 1.205',
    'O Ato Declaratório nº 35/2024 foi publicado em 11 de junho de 2024 e declarou que a vigência da MP nº 1.205/2023 havia se encerrado em 31 de maio.',
    'regulation',
    'publication',
    date '2024-06-11',
    'day',
    'Brasil',
    'O ato do Congresso Nacional documenta o estado de um instrumento federal do Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-ato-35-publicacao-2024-06-11',
    'A data de publicação do ato permanece separada da data anterior do encerramento que ele declara.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into expiry_act_publication_event_id;

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
    'Publicação da Lei nº 14.902 institui o Programa Mover',
    'A Lei nº 14.902/2024 foi publicada em 28 de junho de 2024 e instituiu o Programa Mover.',
    'regulation',
    'publication',
    date '2024-06-28',
    'day',
    'Brasil',
    'A lei federal disciplina o Programa Mover e a política industrial automotiva brasileira.',
    'confirmed',
    'under_review',
    'pilot-01-lei-14902-publicacao-2024-06-28',
    'O evento não presume que a lei seja conversão da MP nº 1.205/2023.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_publication_event_id;

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
    'Arts. 9º a 11 da Lei nº 14.902 produzem efeitos desde 1º de abril de 2024',
    'O art. 35 da Lei nº 14.902/2024 determina produção de efeitos em 1º de abril de 2024 para seus arts. 9º a 11.',
    'regulation',
    'effective',
    date '2024-04-01',
    'day',
    'Brasil',
    'Os dispositivos tratam da tributação de veículos no Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-lei-14902-efeitos-artigos-9-11-2024-04-01',
    'A data de produção de efeitos antecede a publicação da lei e permanece registrada conforme o texto do art. 35.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_april_effect_event_id;

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
    'Lei nº 14.902 entra em vigor e os demais dispositivos produzem efeitos',
    'Na data de sua publicação, a Lei nº 14.902/2024 entrou em vigor e seus dispositivos não ressalvados no art. 35 começaram a produzir efeitos.',
    'regulation',
    'effective',
    date '2024-06-28',
    'day',
    'Brasil',
    'A vigência e os efeitos alcançam o Programa Mover em âmbito federal.',
    'confirmed',
    'under_review',
    'pilot-01-lei-14902-vigencia-2024-06-28',
    'A coincidência da data não funde este evento com a publicação da lei.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_immediate_effect_event_id;

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
    'Lei nº 14.902 convalida atos praticados com base na MP nº 1.205',
    'O art. 33 da Lei nº 14.902/2024 convalidou os atos praticados com base na MP nº 1.205/2023.',
    'regulation',
    'occurrence',
    date '2024-06-28',
    'day',
    'Brasil',
    'A relação expressa conecta dois instrumentos federais ligados ao Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-lei-14902-convalidacao-mp-1205-2024-06-28',
    'O evento preserva a relação expressa de convalidação sem inferir conversão ou substituição entre os instrumentos.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into law_convalidation_event_id;

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
    'Publicação do Decreto nº 12.435 regulamenta o Programa Mover',
    'O Decreto nº 12.435/2025 foi publicado em 16 de abril de 2025 para regulamentar o Programa Mover instituído pela Lei nº 14.902/2024.',
    'regulation',
    'publication',
    date '2025-04-16',
    'day',
    'Brasil',
    'O decreto estabelece requisitos federais do Programa Mover para veículos comercializados e importados no Brasil.',
    'confirmed',
    'under_review',
    'pilot-01-decreto-12435-publicacao-2025-04-16',
    'A relação de regulamentação é expressa na ementa do decreto.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_publication_event_id;

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
    'Decreto nº 12.435 entra em vigor',
    'O Decreto nº 12.435/2025 entrou em vigor em 16 de abril de 2025, data de sua publicação.',
    'regulation',
    'effective',
    date '2025-04-16',
    'day',
    'Brasil',
    'A entrada em vigor alcança a regulamentação federal do Programa Mover.',
    'confirmed',
    'under_review',
    'pilot-01-decreto-12435-vigencia-2025-04-16',
    'A coincidência da data não funde este evento com a publicação do decreto.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into decree_effective_event_id;

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
      mp_publication_event_id,
      mp_institution_evidence_id,
      'supports',
      'Sustenta a publicação que instituiu o Programa Mover por medida provisória.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_immediate_effect_event_id,
      mp_effects_evidence_id,
      'supports',
      'Sustenta a entrada em vigor e os efeitos imediatos previstos no art. 32.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_february_effect_event_id,
      mp_effects_evidence_id,
      'supports',
      'Sustenta a produção de efeitos dos arts. 12 a 21 em 1º de fevereiro de 2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_april_effect_event_id,
      mp_effects_evidence_id,
      'supports',
      'Sustenta a produção de efeitos dos arts. 9º a 11 em 1º de abril de 2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_expiry_event_id,
      mp_expiry_evidence_id,
      'supports',
      'Sustenta o encerramento da vigência em 31 de maio de 2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      expiry_act_publication_event_id,
      mp_expiry_evidence_id,
      'supports',
      'Sustenta a publicação posterior do ato que declarou o encerramento.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_publication_event_id,
      law_institution_evidence_id,
      'supports',
      'Sustenta a publicação da lei que instituiu o Programa Mover.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_april_effect_event_id,
      law_effects_evidence_id,
      'supports',
      'Sustenta a data declarada de produção de efeitos dos arts. 9º a 11.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_immediate_effect_event_id,
      law_effects_evidence_id,
      'supports',
      'Sustenta a entrada em vigor e os efeitos dos demais dispositivos na publicação.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_convalidation_event_id,
      law_convalidation_evidence_id,
      'supports',
      'Sustenta somente a convalidação expressamente declarada no art. 33.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      decree_publication_event_id,
      decree_regulation_evidence_id,
      'supports',
      'Sustenta a publicação do decreto e sua relação expressa de regulamentação da lei.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      decree_effective_event_id,
      decree_effective_evidence_id,
      'supports',
      'Sustenta a entrada em vigor do decreto na data da publicação.',
      fixture_recorded_at,
      fixture_recorded_at
    );

  insert into public.event_regulatory_instruments (
    event_id,
    regulatory_instrument_id,
    instrument_role,
    notes,
    created_at,
    updated_at
  )
  values
    (
      mp_publication_event_id,
      mp_instrument_id,
      'subject',
      'A publicação tem a MP nº 1.205/2023 como instrumento central.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_immediate_effect_event_id,
      mp_instrument_id,
      'subject',
      'A entrada em vigor e os efeitos imediatos pertencem à MP nº 1.205/2023.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_february_effect_event_id,
      mp_instrument_id,
      'subject',
      'A produção de efeitos em fevereiro pertence à MP nº 1.205/2023.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_april_effect_event_id,
      mp_instrument_id,
      'subject',
      'A produção de efeitos em abril pertence à MP nº 1.205/2023.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      mp_expiry_event_id,
      mp_instrument_id,
      'subject',
      'O encerramento de vigência tem a MP nº 1.205/2023 como instrumento central.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      expiry_act_publication_event_id,
      expiry_act_instrument_id,
      'subject',
      'A publicação tem o Ato Declaratório nº 35/2024 como instrumento central.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_publication_event_id,
      law_instrument_id,
      'subject',
      'A publicação tem a Lei nº 14.902/2024 como instrumento central.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_april_effect_event_id,
      law_instrument_id,
      'subject',
      'A produção de efeitos retroativa pertence à Lei nº 14.902/2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_immediate_effect_event_id,
      law_instrument_id,
      'subject',
      'A entrada em vigor e os demais efeitos pertencem à Lei nº 14.902/2024.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      law_convalidation_event_id,
      law_instrument_id,
      'subject',
      'A Lei nº 14.902/2024 é o instrumento que expressa a convalidação.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      decree_publication_event_id,
      decree_instrument_id,
      'subject',
      'A publicação tem o Decreto nº 12.435/2025 como instrumento central.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      decree_effective_event_id,
      decree_instrument_id,
      'subject',
      'A entrada em vigor pertence ao Decreto nº 12.435/2025.',
      fixture_recorded_at,
      fixture_recorded_at
    );

  insert into public.regulatory_instrument_relations (
    source_instrument_id,
    target_instrument_id,
    relationship_type,
    establishing_event_id,
    notes,
    created_at,
    updated_at
  )
  values
    (
      law_instrument_id,
      mp_instrument_id,
      'convalidates_acts_based_on',
      law_convalidation_event_id,
      'A relação limita-se aos atos praticados com base na MP nº 1.205/2023, conforme o art. 33 da lei.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      decree_instrument_id,
      law_instrument_id,
      'regulates_program_established_by',
      decree_publication_event_id,
      'A relação limita-se à regulamentação do Programa Mover instituído pela Lei nº 14.902/2024.',
      fixture_recorded_at,
      fixture_recorded_at
    );
end
$$;

-- PILOT-03: divergência na base nacional de recarga publicada pela ABVE e Tupi.
-- A unidade é normalizada conforme a revisão independente, mas os valores
-- conflitantes permanecem separados e provisórios.

do $$
declare
  fixture_recorded_at constant timestamptz :=
    timestamptz '2026-09-01 18:00:00+02';
  abve_source_id bigint;
  abve_organization_id bigint;
  tupi_organization_id bigint;
  march_content_item_id bigint;
  june_content_item_id bigint;
  march_observation_id bigint;
  june_observation_id bigint;
  charging_points_metric_id bigint;
  march_evidence_id bigint;
  june_evidence_id bigint;
  march_event_id bigint;
  june_event_id bigint;
begin
  insert into public.sources (
    name,
    slug,
    homepage_url,
    source_type,
    status,
    country_code,
    language_codes,
    is_primary_source,
    notes,
    created_at,
    updated_at
  )
  values (
    'ABVE',
    'abve',
    'https://abve.org.br',
    'industry_association',
    'under_review',
    'BR',
    array['pt-BR'],
    true,
    'As duas publicações estão no site da ABVE e atribuem a apuração ou apresentação da base nacional à ABVE e à Tupi Mobilidade.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into abve_source_id;

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
    'under_review',
    'BR',
    'https://abve.org.br',
    'Associação que publica as duas atualizações da base nacional no recorte de PILOT-03.',
    'A natureza institucional não substitui seu papel de sujeito nas publicações.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into abve_organization_id;

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
    'under_review',
    'BR',
    null,
    'Plataforma de mobilidade elétrica apresentada pela ABVE como participante da base nacional.',
    'A razão social e uma página própria de origem não foram confirmadas neste recorte.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into tupi_organization_id;

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
    'public-semi-public-charging-points',
    'Pontos públicos e semipúblicos de recarga',
    'Quantidade de pontos públicos e semipúblicos de recarga de veículos elétricos em uma geografia e período de referência.',
    'charging_infrastructure',
    'integer',
    'charging_point',
    'latest',
    'month',
    'national',
    'candidate',
    'Neste recorte, pontos de recarga, eletropostos e carregadores descrevem a mesma unidade. Valores conflitantes da mesma série permanecem separados por observação e provisórios até resolução.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into charging_points_metric_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    abve_source_id,
    'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/',
    'Recarga pública rápida cresce 167% em um ano e chega a 31% dos 21 mil eletropostos da rede',
    'dataset_release',
    date '2026-03-04',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-03-abve-2026-03-04',
    'external_reference',
    'https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into march_content_item_id;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
    collected_at,
    language_code,
    publication_nature,
    content_fingerprint,
    retention_class,
    raw_capture_reference,
    created_at,
    updated_at
  )
  values (
    abve_source_id,
    'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/',
    'Recarga rápida (DC) cresce 33% em três meses e puxa a expansão da rede',
    'dataset_release',
    date '2026-06-22',
    fixture_recorded_at,
    'pt-BR',
    'original',
    'pilot-03-abve-2026-06-22',
    'external_reference',
    'https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into june_content_item_id;

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
    march_content_item_id,
    'quantity',
    'O Brasil tem 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos.',
    'Brasil: 21.061 pontos públicos e semipúblicos de recarga de veículos elétricos em fevereiro de 2026.',
    'normalized',
    null,
    'Brasil',
    'manual',
    'pontos públicos e semipúblicos de recarga de veículos elétricos',
    'pilot-03-abve-21061-fevereiro-2026',
    'Período de referência: fevereiro de 2026. A publicação também usa eletropostos e carregadores ao descrever a mesma unidade. A normalização não escolhe entre os valores conflitantes, e nenhuma data diária foi inferida para o período mensal.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into march_observation_id;

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
    june_content_item_id,
    'quantity',
    'último levantamento, de fevereiro de 2026 (21.060)',
    'Brasil: 21.060 pontos públicos e semipúblicos de recarga de veículos elétricos em fevereiro de 2026.',
    'normalized',
    null,
    'Brasil',
    'manual',
    'total da rede',
    'pilot-03-abve-21060-fevereiro-2026',
    'A publicação posterior referencia 21.060 como o total anterior e alterna pontos, eletroposto e carregadores ao descrever a mesma unidade. A normalização não escolhe entre os valores conflitantes, e nenhuma data diária foi inferida para o período mensal.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into june_observation_id;

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
      charging_points_metric_id,
      march_observation_id,
      21061,
      date '2026-02-01',
      date '2026-02-28',
      'Brasil',
      'provisional',
      'Valor publicado em março. Permanece separado de 21.060 porque a diferença de uma unidade não foi explicada.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      charging_points_metric_id,
      june_observation_id,
      21060,
      date '2026-02-01',
      date '2026-02-28',
      'Brasil',
      'provisional',
      'Valor retrospectivo publicado em junho. Permanece separado de 21.061 porque a diferença de uma unidade não foi explicada.',
      fixture_recorded_at,
      fixture_recorded_at
    );

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    march_observation_id,
    march_content_item_id,
    'pilot-03-abve-tupi-base-nacional-fevereiro-2026',
    'likely_shared',
    'A origem exata da observação é conhecida. A linhagem subjacente é provavelmente compartilhada com a atualização posterior da mesma série ABVE/Tupi.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into march_evidence_id;

  insert into public.evidence (
    observation_id,
    origin_content_item_id,
    lineage_key,
    lineage_status,
    notes,
    created_at,
    updated_at
  )
  values (
    june_observation_id,
    june_content_item_id,
    'pilot-03-abve-tupi-base-nacional-fevereiro-2026',
    'likely_shared',
    'A origem exata da observação é conhecida. A publicação referencia o levantamento anterior da mesma série, sem explicar a diferença de uma unidade.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into june_evidence_id;

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
    'ABVE e Tupi publicam 21.061 pontos públicos e semipúblicos para fevereiro de 2026',
    'A publicação de março da ABVE registra 21.061 pontos públicos e semipúblicos na atualização da base nacional apurada com a Tupi Mobilidade.',
    'market_data',
    'publication',
    date '2026-03-04',
    'day',
    'Brasil',
    'A publicação descreve a base nacional brasileira de infraestrutura pública e semipública de recarga.',
    'reported',
    'under_review',
    'pilot-03-abve-21061-publicacao-2026-03-04',
    'event_date é a data da publicação. O período de referência é fevereiro de 2026 e permanece na observação sem normalização diária.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into march_event_id;

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
    'Atualização da ABVE e Tupi referencia 21.060 como total de fevereiro de 2026',
    'A publicação de junho da ABVE registra 21.060 como o total do levantamento anterior, referente a fevereiro de 2026.',
    'market_data',
    'publication',
    date '2026-06-22',
    'day',
    'Brasil',
    'A publicação atualiza a mesma base nacional brasileira de infraestrutura de recarga.',
    'reported',
    'under_review',
    'pilot-03-abve-21060-referencia-2026-06-22',
    'O valor conflitante permanece separado de 21.061. A publicação não explica a diferença de uma unidade; a unidade comum foi normalizada de forma explícita após revisão independente.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into june_event_id;

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
      march_evidence_id,
      'supports',
      'Sustenta que a publicação de março registrou o valor 21.061 para fevereiro de 2026.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      june_event_id,
      june_evidence_id,
      'supports',
      'Sustenta que a publicação posterior referenciou 21.060 como o total de fevereiro de 2026.',
      fixture_recorded_at,
      fixture_recorded_at
    );

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
      march_event_id,
      abve_organization_id,
      'subject',
      'A ABVE publica a atualização de março em seu site.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      march_event_id,
      tupi_organization_id,
      'subject',
      'A Tupi Mobilidade participa da apuração atribuída pela publicação de março.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      june_event_id,
      abve_organization_id,
      'subject',
      'A ABVE publica a atualização de junho em seu site.',
      fixture_recorded_at,
      fixture_recorded_at
    ),
    (
      june_event_id,
      tupi_organization_id,
      'subject',
      'A Tupi Mobilidade é apresentada como participante da atualização de junho.',
      fixture_recorded_at,
      fixture_recorded_at
    );
end
$$;
