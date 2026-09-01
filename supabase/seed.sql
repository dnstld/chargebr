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

-- PILOT-03: divergência na base nacional de recarga publicada pela ABVE e Tupi.
-- Os valores permanecem como observações não normalizadas. Não há carga em
-- metric_definitions ou metric_values porque a unidade contada segue ambígua.

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
    null,
    'unresolved',
    null,
    'Brasil',
    'manual',
    'pontos públicos e semipúblicos de recarga de veículos elétricos',
    'pilot-03-abve-21061-fevereiro-2026',
    'Período de referência: fevereiro de 2026. A publicação também usa eletropostos e carregadores ao descrever a base. A unidade permanece não normalizada, e nenhuma data diária foi inferida para o período mensal.',
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
    null,
    'unresolved',
    null,
    'Brasil',
    'manual',
    'total da rede',
    'pilot-03-abve-21060-fevereiro-2026',
    'A publicação posterior referencia 21.060 como o total anterior e alterna pontos, eletroposto e carregadores ao descrever a rede. A unidade permanece não normalizada, e nenhuma data diária foi inferida para o período mensal.',
    fixture_recorded_at,
    fixture_recorded_at
  )
  returning id into june_observation_id;

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
    'O valor conflitante permanece separado de 21.061. A publicação não explica a diferença de uma unidade e não sustenta uma normalização silenciosa.',
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
