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
