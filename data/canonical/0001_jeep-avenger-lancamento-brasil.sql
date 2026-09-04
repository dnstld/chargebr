-- Carga canônica 0001: lançamento do Jeep Avenger híbrido MHEV no Brasil.
--
-- Este arquivo não controla a transação. Para validar, execute-o entre BEGIN e
-- ROLLBACK. Para persistir depois do merge, execute-o entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-04 19:26:39+02';
  jeep_source_id bigint;
  jeep_organization_id bigint;
  jeep_content_item_id bigint;
  launch_observation_id bigint;
  launch_evidence_id bigint;
  launch_event_id bigint;
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
    'Jeep — Stellantis Media',
    'jeep-stellantis-media',
    'https://www.media.stellantis.com/br-pt/jeep',
    'company',
    'approved',
    'BR',
    array['pt-BR'],
    true,
    'Stellantis',
    'Canal oficial de imprensa da marca Jeep no Brasil.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint sources_slug_unique do nothing;

  select id
    into jeep_source_id
    from public.sources
   where slug = 'jeep-stellantis-media';

  if jeep_source_id is null or exists (
    select 1
      from public.sources
     where id = jeep_source_id
       and (
         name is distinct from 'Jeep — Stellantis Media'
         or homepage_url is distinct from 'https://www.media.stellantis.com/br-pt/jeep'
         or source_type is distinct from 'company'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or language_codes is distinct from array['pt-BR']::text[]
         or is_primary_source is distinct from true
         or publisher_group is distinct from 'Stellantis'
         or notes is distinct from 'Canal oficial de imprensa da marca Jeep no Brasil.'
       )
  ) then
    raise exception 'Carga 0001: a fonte jeep-stellantis-media já existe com conteúdo divergente.';
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
    'Jeep',
    null,
    'jeep',
    'other',
    'approved',
    null,
    'https://www.jeep.com.br/',
    'Marca automotiva que ocupa o papel de sujeito central no acontecimento.',
    'O tipo other registra que Jeep é uma marca, sem atribuir personalidade jurídica nem estruturar nesta carga sua relação com a Stellantis.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint organizations_slug_unique do nothing;

  select id
    into jeep_organization_id
    from public.organizations
   where slug = 'jeep';

  if jeep_organization_id is null or exists (
    select 1
      from public.organizations
     where id = jeep_organization_id
       and (
         name is distinct from 'Jeep'
         or legal_name is not null
         or organization_type is distinct from 'other'
         or status is distinct from 'approved'
         or country_code is not null
         or homepage_url is distinct from 'https://www.jeep.com.br/'
         or description is distinct from 'Marca automotiva que ocupa o papel de sujeito central no acontecimento.'
         or notes is distinct from 'O tipo other registra que Jeep é uma marca, sem atribuir personalidade jurídica nem estruturar nesta carga sua relação com a Stellantis.'
       )
  ) then
    raise exception 'Carga 0001: a organização jeep já existe com conteúdo divergente.';
  end if;

  insert into public.content_items (
    source_id,
    url,
    title,
    content_type,
    published_on,
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
    jeep_source_id,
    'https://www.media.stellantis.com/br-pt/jeep/press/chegou-o-novo-jeep-avenger-inovador-tecnologico-e-sofisticado-modelo-representa-a-essencia-da-marca-para-conquistar-novos-territorios-no-brasil',
    'Chegou o Novo Jeep Avenger! Inovador, tecnológico e sofisticado, modelo representa a essência da marca para conquistar novos territórios no Brasil',
    'press_release',
    date '2026-08-13',
    canonical_recorded_at,
    null,
    'pt-BR',
    'Press Releases',
    'original',
    'canonical-0001-jeep-avenger-2026-08-13',
    'external_reference',
    null,
    'https://www.media.stellantis.com/br-pt/jeep/press/chegou-o-novo-jeep-avenger-inovador-tecnologico-e-sofisticado-modelo-representa-a-essencia-da-marca-para-conquistar-novos-territorios-no-brasil',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint content_items_source_url_fingerprint_unique do nothing;

  select id
    into jeep_content_item_id
    from public.content_items
   where source_id = jeep_source_id
     and url = 'https://www.media.stellantis.com/br-pt/jeep/press/chegou-o-novo-jeep-avenger-inovador-tecnologico-e-sofisticado-modelo-representa-a-essencia-da-marca-para-conquistar-novos-territorios-no-brasil'
     and content_fingerprint = 'canonical-0001-jeep-avenger-2026-08-13';

  if jeep_content_item_id is null or exists (
    select 1
      from public.content_items
     where id = jeep_content_item_id
       and (
         title is distinct from 'Chegou o Novo Jeep Avenger! Inovador, tecnológico e sofisticado, modelo representa a essência da marca para conquistar novos territórios no Brasil'
         or content_type is distinct from 'press_release'
         or published_on is distinct from date '2026-08-13'
         or published_at is not null
         or author_name is not null
         or language_code is distinct from 'pt-BR'
         or section_name is distinct from 'Press Releases'
         or publication_nature is distinct from 'original'
         or retention_class is distinct from 'external_reference'
         or evidentiary_excerpt is not null
         or raw_capture_reference is distinct from 'https://www.media.stellantis.com/br-pt/jeep/press/chegou-o-novo-jeep-avenger-inovador-tecnologico-e-sofisticado-modelo-representa-a-essencia-da-marca-para-conquistar-novos-territorios-no-brasil'
       )
  ) then
    raise exception 'Carga 0001: a publicação já existe com conteúdo divergente.';
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
    jeep_content_item_id,
    'claim',
    '[...] Novo Jeep Avenger chega ao Brasil [...]. Todas as versões [...] são equipadas com o sistema MHEV de 12V [...] será possível reservar [...] a partir de hoje.',
    'A Jeep lançou comercialmente o Novo Jeep Avenger no Brasil em 13 de agosto de 2026, em três versões, todas equipadas com motorização híbrida MHEV de 12 V e disponíveis para reserva naquela data.',
    'normalized',
    date '2026-08-13',
    'Brasil',
    'manual',
    'motorização híbrida MHEV de 12V',
    'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13',
    'Extração manual limitada à chegada ao mercado brasileiro, às três versões, à motorização híbrida e à abertura de reservas; exclui preço, especificações detalhadas e alegações promocionais.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint observations_content_fingerprint_unique do nothing;

  select id
    into launch_observation_id
    from public.observations
   where content_item_id = jeep_content_item_id
     and observation_fingerprint = 'canonical-0001-jeep-avenger-lancamento-mhev-2026-08-13';

  if launch_observation_id is null or exists (
    select 1
      from public.observations
     where id = launch_observation_id
       and (
         observation_type is distinct from 'claim'
         or source_claim is distinct from '[...] Novo Jeep Avenger chega ao Brasil [...]. Todas as versões [...] são equipadas com o sistema MHEV de 12V [...] será possível reservar [...] a partir de hoje.'
         or normalized_claim is distinct from 'A Jeep lançou comercialmente o Novo Jeep Avenger no Brasil em 13 de agosto de 2026, em três versões, todas equipadas com motorização híbrida MHEV de 12 V e disponíveis para reserva naquela data.'
         or normalization_status is distinct from 'normalized'
         or observation_date is distinct from date '2026-08-13'
         or geography is distinct from 'Brasil'
         or extraction_method is distinct from 'manual'
         or source_term is distinct from 'motorização híbrida MHEV de 12V'
         or notes is distinct from 'Extração manual limitada à chegada ao mercado brasileiro, às três versões, à motorização híbrida e à abertura de reservas; exclui preço, especificações detalhadas e alegações promocionais.'
       )
  ) then
    raise exception 'Carga 0001: a observação já existe com conteúdo divergente.';
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
    launch_observation_id,
    jeep_content_item_id,
    null,
    'canonical-0001-jeep-avenger-lancamento-2026-08-13',
    'established',
    'A origem exata está estabelecida na publicação oficial da marca; a evidência confirma a declaração empresarial, não constitui confirmação independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint evidence_observation_lineage_unique do nothing;

  select id
    into launch_evidence_id
    from public.evidence
   where observation_id = launch_observation_id
     and lineage_key = 'canonical-0001-jeep-avenger-lancamento-2026-08-13';

  if launch_evidence_id is null or exists (
    select 1
      from public.evidence
     where id = launch_evidence_id
       and (
         origin_content_item_id is distinct from jeep_content_item_id
         or origin_source_id is not null
         or lineage_status is distinct from 'established'
         or notes is distinct from 'A origem exata está estabelecida na publicação oficial da marca; a evidência confirma a declaração empresarial, não constitui confirmação independente.'
       )
  ) then
    raise exception 'Carga 0001: a evidência já existe com conteúdo divergente.';
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
    'Jeep lança o Avenger híbrido MHEV no Brasil',
    'A Jeep lançou comercialmente o Novo Jeep Avenger no mercado brasileiro em três versões, todas com motorização híbrida MHEV de 12 V e disponíveis para reserva na data da publicação.',
    'product_service',
    'occurrence',
    date '2026-08-13',
    'day',
    'Brasil',
    'O lançamento amplia a oferta de veículos híbridos leves disponível no mercado brasileiro.',
    'confirmed',
    'accepted',
    'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13',
    'Confirmed registra que a fonte primária oficial confirma o lançamento da própria marca; não indica corroboração independente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint events_fingerprint_unique do nothing;

  select id
    into launch_event_id
    from public.events
   where event_fingerprint = 'canonical-0001-jeep-avenger-lancamento-brasil-2026-08-13';

  if launch_event_id is null or exists (
    select 1
      from public.events
     where id = launch_event_id
       and (
         title is distinct from 'Jeep lança o Avenger híbrido MHEV no Brasil'
         or summary is distinct from 'A Jeep lançou comercialmente o Novo Jeep Avenger no mercado brasileiro em três versões, todas com motorização híbrida MHEV de 12 V e disponíveis para reserva na data da publicação.'
         or event_type is distinct from 'product_service'
         or event_phase is distinct from 'occurrence'
         or event_date is distinct from date '2026-08-13'
         or date_precision is distinct from 'day'
         or geography is distinct from 'Brasil'
         or brazil_relevance is distinct from 'O lançamento amplia a oferta de veículos híbridos leves disponível no mercado brasileiro.'
         or verification_level is distinct from 'confirmed'
         or workflow_status is distinct from 'accepted'
         or notes is distinct from 'Confirmed registra que a fonte primária oficial confirma o lançamento da própria marca; não indica corroboração independente.'
       )
  ) then
    raise exception 'Carga 0001: o acontecimento já existe com conteúdo divergente.';
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
    launch_event_id,
    launch_evidence_id,
    'supports',
    'A evidência sustenta o lançamento realizado, a motorização MHEV de 12 V e a abertura de reservas no Brasil.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint event_evidence_pkey do nothing;

  if not exists (
    select 1
      from public.event_evidence
     where event_id = launch_event_id
       and evidence_id = launch_evidence_id
       and relationship_type = 'supports'
       and notes = 'A evidência sustenta o lançamento realizado, a motorização MHEV de 12 V e a abertura de reservas no Brasil.'
  ) then
    raise exception 'Carga 0001: o vínculo entre acontecimento e evidência está divergente.';
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
    launch_event_id,
    jeep_organization_id,
    'subject',
    'Jeep é a marca e o sujeito central do lançamento.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint event_organizations_pkey do nothing;

  if not exists (
    select 1
      from public.event_organizations
     where event_id = launch_event_id
       and organization_id = jeep_organization_id
       and event_role = 'subject'
       and notes = 'Jeep é a marca e o sujeito central do lançamento.'
  ) then
    raise exception 'Carga 0001: o vínculo entre acontecimento e organização está divergente.';
  end if;
end
$$;
