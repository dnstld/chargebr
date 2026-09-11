-- Carga canônica 0007: revisão metodológica da classificação de veículos
-- leves eletrificados da ABVE Data a partir de janeiro de 2025.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-11 10:18:30+02';
  prior_records_signature_before text;
  prior_records_signature_after text;
  abve_source_id bigint;
  abve_organization_id bigint;
  announcement_content_item_id bigint;
  result_content_item_id bigint;
  continuity_content_item_id bigint;
  announcement_observation_id bigint;
  current_result_observation_id bigint;
  prior_result_observation_id bigint;
  mhev_context_observation_id bigint;
  continuity_observation_id bigint;
  announcement_evidence_id bigint;
  current_result_evidence_id bigint;
  prior_result_evidence_id bigint;
  mhev_context_evidence_id bigint;
  continuity_evidence_id bigint;
  announcement_event_id bigint;
  result_event_id bigint;
  continuity_event_id bigint;
  canonical_metric_definition_id bigint;
  prior_methodology_version_id bigint;
  current_methodology_version_id bigint;
  current_metric_value_id bigint;
  prior_metric_value_id bigint;
begin
  -- Os filtros excluem somente os registros próprios da 0007 para permitir
  -- uma segunda execução idêntica na mesma transação.
  if (select count(*) from public.sources) <> 4
    or (select count(*) from public.content_items
         where coalesce(content_fingerprint, '') !~ '^canonical-0007-') <> 9
    or (select count(*) from public.observations
         where coalesce(observation_fingerprint, '') !~ '^canonical-0007-') <> 9
    or (select count(*) from public.evidence
         where coalesce(lineage_key, '') !~ '^canonical-0007-') <> 9
    or (select count(*) from public.events
         where coalesce(event_fingerprint, '') !~ '^canonical-0007-') <> 8
    or (select count(*)
          from public.event_evidence ee
          join public.events e on e.id = ee.event_id
         where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-') <> 10
    or (select count(*) from public.metric_definitions
         where metric_key <>
           'monthly-light-electrified-vehicle-registrations-brazil-abve-classification') <> 3
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-') <> 6
    or (select count(*) from public.organizations) <> 4
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-') <> 10
    or (select count(*) from public.content_item_relations) <> 1
    or (select count(*) from public.metric_value_resolutions) <> 1
    or (select count(*) from public.metric_value_status_transitions) <> 2
    or (select count(*) from public.regulatory_instruments) <> 0
    or (select count(*) from public.event_regulatory_instruments) <> 0
    or (select count(*) from public.regulatory_instrument_relations) <> 0
    or (select count(*) from public.metric_methodology_versions
         where methodology_key !~ '^canonical-0007-') <> 0
    or (select count(*)
          from public.metric_methodology_components mmc
          join public.metric_methodology_versions mmv
            on mmv.id = mmc.methodology_version_id
         where mmv.methodology_key !~ '^canonical-0007-') <> 0
    or (select count(*)
          from public.metric_methodology_evidence mme
          join public.metric_methodology_versions mmv
            on mmv.id = mme.methodology_version_id
         where mmv.methodology_key !~ '^canonical-0007-') <> 0
    or (select count(*)
          from public.metric_methodology_relations mmr
          join public.metric_methodology_versions earlier
            on earlier.id = mmr.earlier_methodology_version_id
          join public.metric_methodology_versions later
            on later.id = mmr.later_methodology_version_id
         where earlier.methodology_key !~ '^canonical-0007-'
           and later.methodology_key !~ '^canonical-0007-') <> 0
    or (select count(*)
          from public.metric_value_methodology_assignments mvma
          join public.metric_methodology_versions mmv
            on mmv.id = mvma.methodology_version_id
         where mmv.methodology_key !~ '^canonical-0007-') <> 0
    or (select count(*) from supabase_migrations.schema_migrations) <> 17
  then
    raise exception 'Carga 0007: o estado anterior do banco diverge da base revisada para este pacote.';
  end if;

  select md5(jsonb_build_object(
    'sources', (
      select jsonb_agg(to_jsonb(s) order by s.id)
        from public.sources s
    ),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where coalesce(ci.content_fingerprint, '') !~ '^canonical-0007-'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
       where coalesce(ev.lineage_key, '') !~ '^canonical-0007-'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'metric_definitions', (
      select jsonb_agg(to_jsonb(md) order by md.id)
        from public.metric_definitions md
       where md.metric_key <>
         'monthly-light-electrified-vehicle-registrations-brazil-abve-classification'
    ),
    'metric_values', (
      select jsonb_agg(to_jsonb(mv) order by mv.id)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-'
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
    ),
    'event_organizations', (
      select jsonb_agg(
        to_jsonb(eo)
        order by eo.event_id, eo.organization_id, eo.event_role
      )
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'content_item_relations', (
      select jsonb_agg(
        to_jsonb(cir)
        order by
          cir.earlier_content_item_id,
          cir.later_content_item_id,
          cir.relationship_type
      )
        from public.content_item_relations cir
    ),
    'metric_value_resolutions', (
      select jsonb_agg(to_jsonb(mvr) order by mvr.id)
        from public.metric_value_resolutions mvr
    ),
    'metric_value_status_transitions', (
      select jsonb_agg(to_jsonb(mvst) order by mvst.id)
        from public.metric_value_status_transitions mvst
    ),
    'regulatory_instruments', (
      select jsonb_agg(to_jsonb(ri) order by ri.id)
        from public.regulatory_instruments ri
    ),
    'event_regulatory_instruments', (
      select jsonb_agg(
        to_jsonb(eri)
        order by eri.event_id, eri.regulatory_instrument_id, eri.instrument_role
      )
        from public.event_regulatory_instruments eri
    ),
    'regulatory_instrument_relations', (
      select jsonb_agg(
        to_jsonb(rir)
        order by
          rir.source_instrument_id,
          rir.target_instrument_id,
          rir.relationship_type
      )
        from public.regulatory_instrument_relations rir
    ),
    'metric_methodology_versions', (
      select jsonb_agg(to_jsonb(mmv) order by mmv.id)
        from public.metric_methodology_versions mmv
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_components', (
      select jsonb_agg(
        to_jsonb(mmc)
        order by mmc.methodology_version_id, mmc.component_key
      )
        from public.metric_methodology_components mmc
        join public.metric_methodology_versions mmv
          on mmv.id = mmc.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_evidence', (
      select jsonb_agg(
        to_jsonb(mme)
        order by
          mme.methodology_version_id,
          mme.evidence_id,
          mme.relationship_type
      )
        from public.metric_methodology_evidence mme
        join public.metric_methodology_versions mmv
          on mmv.id = mme.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_relations', (
      select jsonb_agg(
        to_jsonb(mmr)
        order by
          mmr.earlier_methodology_version_id,
          mmr.later_methodology_version_id,
          mmr.relationship_type
      )
        from public.metric_methodology_relations mmr
        join public.metric_methodology_versions earlier
          on earlier.id = mmr.earlier_methodology_version_id
        join public.metric_methodology_versions later
          on later.id = mmr.later_methodology_version_id
       where earlier.methodology_key !~ '^canonical-0007-'
         and later.methodology_key !~ '^canonical-0007-'
    ),
    'metric_value_methodology_assignments', (
      select jsonb_agg(to_jsonb(mvma) order by mvma.metric_value_id)
        from public.metric_value_methodology_assignments mvma
        join public.metric_methodology_versions mmv
          on mmv.id = mvma.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
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
       and row(
         name,
         homepage_url,
         source_type,
         status,
         country_code,
         language_codes,
         is_primary_source,
         publisher_group,
         notes
       ) is distinct from row(
         'ABVE',
         'https://abve.org.br',
         'industry_association',
         'approved',
         'BR',
         array['pt-BR']::text[],
         true,
         'Associação Brasileira do Veículo Elétrico',
         'Canal institucional da ABVE e de seu produto de dados ABVE Data.'
       )
  ) then
    raise exception 'Carga 0007: a fonte abve está ausente ou divergente.';
  end if;

  select id into abve_organization_id
    from public.organizations
   where slug = 'abve';

  if abve_organization_id is null or exists (
    select 1
      from public.organizations
     where id = abve_organization_id
       and row(
         name,
         legal_name,
         organization_type,
         status,
         country_code,
         homepage_url,
         description,
         notes
       ) is distinct from row(
         'ABVE',
         'Associação Brasileira do Veículo Elétrico',
         'industry_association',
         'approved',
         'BR',
         'https://abve.org.br',
         'Associação setorial brasileira que publicou o resultado mensal por meio da ABVE Data.',
         'A organização representa o sujeito institucional do acontecimento; a fonte separada representa o canal de publicação.'
       )
  ) then
    raise exception 'Carga 0007: a organização abve está ausente ou divergente.';
  end if;

  select id into announcement_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url =
       'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/'
     and content_fingerprint =
       'canonical-0006-abve-emplacamentos-sp-2024-edicao-corrigida';

  if announcement_content_item_id is null or exists (
    select 1
      from public.content_items
     where id = announcement_content_item_id
       and row(
         title,
         content_type,
         published_on,
         published_at,
         author_name,
         language_code,
         section_name,
         publication_nature,
         retention_class,
         evidentiary_excerpt,
         raw_capture_reference
       ) is distinct from row(
         'Eletrificados superam previsões, passam de 170 mil e batem todos os recordes em 2024',
         'dataset_release',
         date '2025-01-06',
         null::timestamptz,
         null::text,
         'pt-BR',
         'ABVE Data',
         'original',
         'external_reference',
         null::text,
         'https://abve.org.br/eletrificados-superam-previsoes-passam-de-170-mil-e-batem-todos-os-recordes-em-2024/'
       )
  ) then
    raise exception 'Carga 0007: a publicação de anúncio da 0006 está ausente ou divergente.';
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
    'monthly-light-electrified-vehicle-registrations-brazil-abve-classification',
    'Emplacamentos mensais de veículos leves classificados como eletrificados pela ABVE no Brasil',
    'Quantidade mensal de emplacamentos de veículos leves que integram o agregado de eletrificados segundo uma versão identificada da classificação ABVE Data.',
    'vehicle_market',
    'integer',
    'vehicle_registration',
    'count',
    'month',
    'national',
    'approved',
    'A composição do agregado não é fixa nesta definição. Cada valor deve receber uma atribuição a uma versão metodológica revisada. No caso 0007, a versão anterior inclui MHEV e a versão vigente desde janeiro de 2025 publica MHEV separadamente.',
    canonical_recorded_at,
    canonical_recorded_at
  )
  on conflict on constraint metric_definitions_key_unique do nothing;

  select id into canonical_metric_definition_id
    from public.metric_definitions
   where metric_key =
     'monthly-light-electrified-vehicle-registrations-brazil-abve-classification';

  if canonical_metric_definition_id is null or exists (
    select 1
      from public.metric_definitions
     where id = canonical_metric_definition_id
       and row(
         name,
         description,
         metric_domain,
         value_type,
         canonical_unit,
         aggregation_type,
         temporal_granularity,
         geographic_granularity,
         status,
         methodology_notes
       ) is distinct from row(
         'Emplacamentos mensais de veículos leves classificados como eletrificados pela ABVE no Brasil',
         'Quantidade mensal de emplacamentos de veículos leves que integram o agregado de eletrificados segundo uma versão identificada da classificação ABVE Data.',
         'vehicle_market',
         'integer',
         'vehicle_registration',
         'count',
         'month',
         'national',
         'approved',
         'A composição do agregado não é fixa nesta definição. Cada valor deve receber uma atribuição a uma versão metodológica revisada. No caso 0007, a versão anterior inclui MHEV e a versão vigente desde janeiro de 2025 publica MHEV separadamente.'
       )
  ) then
    raise exception 'Carga 0007: a definição da métrica já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.content_items
     where (
       content_fingerprint in (
         'canonical-0007-abve-classificacao-eletrificados-janeiro-2025-2025-02-10',
         'canonical-0007-abve-confirma-classificacao-janeiro-2026-2026-02-09'
       )
       or (
         source_id = abve_source_id
         and url in (
           'https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/',
           'https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/'
         )
       )
     )
       and not (
         (
           source_id = abve_source_id
           and url =
             'https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/'
           and content_fingerprint =
             'canonical-0007-abve-classificacao-eletrificados-janeiro-2025-2025-02-10'
         )
         or (
           source_id = abve_source_id
           and url =
             'https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/'
           and content_fingerprint =
             'canonical-0007-abve-confirma-classificacao-janeiro-2026-2026-02-09'
         )
       )
  ) then
    raise exception 'Carga 0007: uma publicação possui URL ou identificador estável divergente.';
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
      'https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/',
      'ABVE aprimora classificação dos veículos eletrificados a partir de janeiro; veja os números',
      'dataset_release',
      date '2025-02-10',
      null,
      canonical_recorded_at,
      null,
      'pt-BR',
      'ABVE Data',
      'original',
      'canonical-0007-abve-classificacao-eletrificados-janeiro-2025-2025-02-10',
      'external_reference',
      null,
      'https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      abve_source_id,
      'https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/',
      'Eletrificados leves atingem 15% de participação de mercado em janeiro',
      'dataset_release',
      date '2026-02-09',
      null,
      canonical_recorded_at,
      null,
      'pt-BR',
      'ABVE Data',
      'original',
      'canonical-0007-abve-confirma-classificacao-janeiro-2026-2026-02-09',
      'external_reference',
      null,
      'https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint content_items_source_url_fingerprint_unique
  do nothing;

  select id into result_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url =
       'https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/'
     and content_fingerprint =
       'canonical-0007-abve-classificacao-eletrificados-janeiro-2025-2025-02-10';

  select id into continuity_content_item_id
    from public.content_items
   where source_id = abve_source_id
     and url =
       'https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/'
     and content_fingerprint =
       'canonical-0007-abve-confirma-classificacao-janeiro-2026-2026-02-09';

  if result_content_item_id is null
    or continuity_content_item_id is null
    or exists (
      select 1
        from public.content_items
       where id = result_content_item_id
         and row(
           title,
           content_type,
           published_on,
           published_at,
           author_name,
           language_code,
           section_name,
           publication_nature,
           retention_class,
           evidentiary_excerpt,
           raw_capture_reference
         ) is distinct from row(
           'ABVE aprimora classificação dos veículos eletrificados a partir de janeiro; veja os números',
           'dataset_release',
           date '2025-02-10',
           null::timestamptz,
           null::text,
           'pt-BR',
           'ABVE Data',
           'original',
           'external_reference',
           null::text,
           'https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/'
         )
    )
    or exists (
      select 1
        from public.content_items
       where id = continuity_content_item_id
         and row(
           title,
           content_type,
           published_on,
           published_at,
           author_name,
           language_code,
           section_name,
           publication_nature,
           retention_class,
           evidentiary_excerpt,
           raw_capture_reference
         ) is distinct from row(
           'Eletrificados leves atingem 15% de participação de mercado em janeiro',
           'dataset_release',
           date '2026-02-09',
           null::timestamptz,
           null::text,
           'pt-BR',
           'ABVE Data',
           'original',
           'external_reference',
           null::text,
           'https://abve.org.br/eletrificados-leves-atingem-15-de-participacao-de-mercado-em-janeiro/'
         )
    )
  then
    raise exception 'Carga 0007: uma publicação já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.observations
     where observation_fingerprint in (
       'canonical-0007-abve-anuncia-criterios-eletrificados-2025',
       'canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente',
       'canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior',
       'canonical-0007-abve-mhev-janeiro-2025',
       'canonical-0007-abve-confirma-classificacao-eletrificados-2026'
     )
       and not (
         (
           observation_fingerprint =
             'canonical-0007-abve-anuncia-criterios-eletrificados-2025'
           and content_item_id = announcement_content_item_id
         )
         or (
           observation_fingerprint in (
             'canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente',
             'canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior',
             'canonical-0007-abve-mhev-janeiro-2025'
           )
           and content_item_id = result_content_item_id
         )
         or (
           observation_fingerprint =
             'canonical-0007-abve-confirma-classificacao-eletrificados-2026'
           and content_item_id = continuity_content_item_id
         )
       )
  ) then
    raise exception 'Carga 0007: uma observação usa o identificador estável com outra publicação.';
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
      announcement_content_item_id,
      'claim',
      'A ABVE anunciou que, a partir dos números de janeiro de 2025, suas estatísticas mensais de eletrificados adotariam requisitos técnicos mínimos e manteriam as demais categorias híbridas em tabelas separadas.',
      'ABVE Data: mudança prospectiva da classificação mensal de veículos leves eletrificados a partir de janeiro de 2025, com categorias não enquadradas publicadas separadamente.',
      'normalized',
      date '2025-01-01',
      'Brasil',
      'manual',
      'estatísticas mensais de eletrificados; requisitos técnicos mínimos; tabelas separadas',
      'canonical-0007-abve-anuncia-criterios-eletrificados-2025',
      'A data da observação representa o início anunciado da nova aplicação. A publicação ocorreu em 6 de janeiro de 2025 e já estava preservada pela carga 0006.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_content_item_id,
      'quantity',
      'O Brasil registrou 12.556 veículos leves eletrificados em janeiro de 2025 pela nova classificação, formada por BEV, PHEV, HEV e HEV Flex, com MHEV fora do total principal.',
      'Brasil: 12.556 emplacamentos de veículos leves classificados como eletrificados pela metodologia vigente da ABVE Data entre 1º e 31 de janeiro de 2025.',
      'normalized',
      null,
      'Brasil',
      'manual',
      'nova classificação; BEV; PHEV; HEV; HEV Flex; MHEV',
      'canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente',
      'A normalização converte somente o separador brasileiro de milhar. O valor é o resultado principal publicado para o mês, não acumulado, estimativa ou cálculo do ChargeBR.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_content_item_id,
      'quantity',
      'Pelo critério anterior, que incluía os MHEV, o total de janeiro de 2025 seria 16.502 veículos leves eletrificados.',
      'Brasil: 16.502 emplacamentos de veículos leves seriam classificados como eletrificados em janeiro de 2025 pela metodologia anterior da ABVE Data, que incluía MHEV.',
      'normalized',
      null,
      'Brasil',
      'manual',
      'critério anterior; incluindo os MHEV; total seria 16.502',
      'canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior',
      'O número é uma comparação contrafactual publicada pela ABVE na mesma página do resultado principal. Não é valor antigo corrigido nem cálculo do ChargeBR.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_content_item_id,
      'quantity',
      'Os MHEV totalizaram 3.946 unidades em janeiro de 2025, sendo 2.883 MHEV de 12 V e 1.063 MHEV de 48 V.',
      'Brasil: 3.946 emplacamentos de MHEV em janeiro de 2025, publicados separadamente do total principal da nova classificação.',
      'normalized',
      null,
      'Brasil',
      'manual',
      'micro-híbridos; MHEV 12V; MHEV 48V',
      'canonical-0007-abve-mhev-janeiro-2025',
      'A observação explica a diferença entre 16.502 e 12.556. Ela não cria terceira definição de métrica nem valor em metric_values nesta carga.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      continuity_content_item_id,
      'claim',
      'A publicação sobre janeiro de 2026 reutiliza 12.556 como referência de janeiro de 2025 e reafirma que a classificação vigente inclui BEV, PHEV, HEV e HEV Flex, com MHEV acompanhados separadamente.',
      'ABVE Data: continuidade em 2026 da classificação vigente desde janeiro de 2025 e confirmação de 12.556 como referência mensal sob essa metodologia.',
      'normalized',
      null,
      'Brasil',
      'manual',
      'classificação da ABVE; janeiro de 2025; MHEV',
      'canonical-0007-abve-confirma-classificacao-eletrificados-2026',
      'A observação confirma a continuidade da metodologia. Os números de janeiro de 2026, percentuais e demais comparações da publicação ficam fora da carga.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint observations_content_fingerprint_unique
  do nothing;

  select id into announcement_observation_id
    from public.observations
   where content_item_id = announcement_content_item_id
     and observation_fingerprint =
       'canonical-0007-abve-anuncia-criterios-eletrificados-2025';

  select id into current_result_observation_id
    from public.observations
   where content_item_id = result_content_item_id
     and observation_fingerprint =
       'canonical-0007-abve-eletrificados-janeiro-2025-metodologia-vigente';

  select id into prior_result_observation_id
    from public.observations
   where content_item_id = result_content_item_id
     and observation_fingerprint =
       'canonical-0007-abve-eletrificados-janeiro-2025-criterio-anterior';

  select id into mhev_context_observation_id
    from public.observations
   where content_item_id = result_content_item_id
     and observation_fingerprint = 'canonical-0007-abve-mhev-janeiro-2025';

  select id into continuity_observation_id
    from public.observations
   where content_item_id = continuity_content_item_id
     and observation_fingerprint =
       'canonical-0007-abve-confirma-classificacao-eletrificados-2026';

  if announcement_observation_id is null
    or current_result_observation_id is null
    or prior_result_observation_id is null
    or mhev_context_observation_id is null
    or continuity_observation_id is null
    or (
      select count(*)
        from public.observations
       where observation_fingerprint like 'canonical-0007-%'
    ) <> 5
    or exists (
      select 1
        from public.observations
       where id = announcement_observation_id
         and row(
           observation_type,
           source_claim,
           normalized_claim,
           normalization_status,
           observation_date,
           geography,
           extraction_method,
           source_term,
           notes
         ) is distinct from row(
           'claim',
           'A ABVE anunciou que, a partir dos números de janeiro de 2025, suas estatísticas mensais de eletrificados adotariam requisitos técnicos mínimos e manteriam as demais categorias híbridas em tabelas separadas.',
           'ABVE Data: mudança prospectiva da classificação mensal de veículos leves eletrificados a partir de janeiro de 2025, com categorias não enquadradas publicadas separadamente.',
           'normalized',
           date '2025-01-01',
           'Brasil',
           'manual',
           'estatísticas mensais de eletrificados; requisitos técnicos mínimos; tabelas separadas',
           'A data da observação representa o início anunciado da nova aplicação. A publicação ocorreu em 6 de janeiro de 2025 e já estava preservada pela carga 0006.'
         )
    )
    or exists (
      select 1
        from public.observations
       where id = current_result_observation_id
         and row(
           observation_type,
           source_claim,
           normalized_claim,
           normalization_status,
           observation_date,
           geography,
           extraction_method,
           source_term,
           notes
         ) is distinct from row(
           'quantity',
           'O Brasil registrou 12.556 veículos leves eletrificados em janeiro de 2025 pela nova classificação, formada por BEV, PHEV, HEV e HEV Flex, com MHEV fora do total principal.',
           'Brasil: 12.556 emplacamentos de veículos leves classificados como eletrificados pela metodologia vigente da ABVE Data entre 1º e 31 de janeiro de 2025.',
           'normalized',
           null::date,
           'Brasil',
           'manual',
           'nova classificação; BEV; PHEV; HEV; HEV Flex; MHEV',
           'A normalização converte somente o separador brasileiro de milhar. O valor é o resultado principal publicado para o mês, não acumulado, estimativa ou cálculo do ChargeBR.'
         )
    )
    or exists (
      select 1
        from public.observations
       where id = prior_result_observation_id
         and row(
           observation_type,
           source_claim,
           normalized_claim,
           normalization_status,
           observation_date,
           geography,
           extraction_method,
           source_term,
           notes
         ) is distinct from row(
           'quantity',
           'Pelo critério anterior, que incluía os MHEV, o total de janeiro de 2025 seria 16.502 veículos leves eletrificados.',
           'Brasil: 16.502 emplacamentos de veículos leves seriam classificados como eletrificados em janeiro de 2025 pela metodologia anterior da ABVE Data, que incluía MHEV.',
           'normalized',
           null::date,
           'Brasil',
           'manual',
           'critério anterior; incluindo os MHEV; total seria 16.502',
           'O número é uma comparação contrafactual publicada pela ABVE na mesma página do resultado principal. Não é valor antigo corrigido nem cálculo do ChargeBR.'
         )
    )
    or exists (
      select 1
        from public.observations
       where id = mhev_context_observation_id
         and row(
           observation_type,
           source_claim,
           normalized_claim,
           normalization_status,
           observation_date,
           geography,
           extraction_method,
           source_term,
           notes
         ) is distinct from row(
           'quantity',
           'Os MHEV totalizaram 3.946 unidades em janeiro de 2025, sendo 2.883 MHEV de 12 V e 1.063 MHEV de 48 V.',
           'Brasil: 3.946 emplacamentos de MHEV em janeiro de 2025, publicados separadamente do total principal da nova classificação.',
           'normalized',
           null::date,
           'Brasil',
           'manual',
           'micro-híbridos; MHEV 12V; MHEV 48V',
           'A observação explica a diferença entre 16.502 e 12.556. Ela não cria terceira definição de métrica nem valor em metric_values nesta carga.'
         )
    )
    or exists (
      select 1
        from public.observations
       where id = continuity_observation_id
         and row(
           observation_type,
           source_claim,
           normalized_claim,
           normalization_status,
           observation_date,
           geography,
           extraction_method,
           source_term,
           notes
         ) is distinct from row(
           'claim',
           'A publicação sobre janeiro de 2026 reutiliza 12.556 como referência de janeiro de 2025 e reafirma que a classificação vigente inclui BEV, PHEV, HEV e HEV Flex, com MHEV acompanhados separadamente.',
           'ABVE Data: continuidade em 2026 da classificação vigente desde janeiro de 2025 e confirmação de 12.556 como referência mensal sob essa metodologia.',
           'normalized',
           null::date,
           'Brasil',
           'manual',
           'classificação da ABVE; janeiro de 2025; MHEV',
           'A observação confirma a continuidade da metodologia. Os números de janeiro de 2026, percentuais e demais comparações da publicação ficam fora da carga.'
         )
    )
  then
    raise exception 'Carga 0007: uma observação já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.evidence
     where lineage_key in (
       'canonical-0007-abve-anuncio-metodologia-eletrificados',
       'canonical-0007-abve-resultado-metodologia-vigente',
       'canonical-0007-abve-contrafactual-criterio-anterior',
       'canonical-0007-abve-contexto-mhev-janeiro-2025',
       'canonical-0007-abve-continuidade-metodologia-vigente'
     )
       and observation_id not in (
         announcement_observation_id,
         current_result_observation_id,
         prior_result_observation_id,
         mhev_context_observation_id,
         continuity_observation_id
       )
  ) then
    raise exception 'Carga 0007: uma chave de linhagem pertence a outra observação.';
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
      announcement_observation_id,
      announcement_content_item_id,
      null,
      'canonical-0007-abve-anuncio-metodologia-eletrificados',
      'established',
      'A publicação institucional de 6 de janeiro de 2025 anuncia a adoção prospectiva de requisitos técnicos e a publicação separada das categorias não enquadradas.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      current_result_observation_id,
      result_content_item_id,
      null,
      'canonical-0007-abve-resultado-metodologia-vigente',
      'established',
      'A publicação institucional de 10 de fevereiro de 2025 define a classificação vigente e publica 12.556 como resultado principal de janeiro.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      prior_result_observation_id,
      result_content_item_id,
      null,
      'canonical-0007-abve-contrafactual-criterio-anterior',
      'established',
      'A mesma publicação informa diretamente que o total seria 16.502 pelo critério anterior com MHEV.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      mhev_context_observation_id,
      result_content_item_id,
      null,
      'canonical-0007-abve-contexto-mhev-janeiro-2025',
      'established',
      'A mesma publicação informa 3.946 MHEV e sua composição, explicando a diferença entre os dois totais sem exigir cálculo persistido.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      continuity_observation_id,
      continuity_content_item_id,
      null,
      'canonical-0007-abve-continuidade-metodologia-vigente',
      'established',
      'A publicação institucional de 9 de fevereiro de 2026 reutiliza 12.556 para janeiro de 2025 e reafirma a composição da classificação vigente.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint evidence_observation_lineage_unique
  do nothing;

  select id into announcement_evidence_id
    from public.evidence
   where observation_id = announcement_observation_id
     and lineage_key =
       'canonical-0007-abve-anuncio-metodologia-eletrificados';

  select id into current_result_evidence_id
    from public.evidence
   where observation_id = current_result_observation_id
     and lineage_key =
       'canonical-0007-abve-resultado-metodologia-vigente';

  select id into prior_result_evidence_id
    from public.evidence
   where observation_id = prior_result_observation_id
     and lineage_key =
       'canonical-0007-abve-contrafactual-criterio-anterior';

  select id into mhev_context_evidence_id
    from public.evidence
   where observation_id = mhev_context_observation_id
     and lineage_key = 'canonical-0007-abve-contexto-mhev-janeiro-2025';

  select id into continuity_evidence_id
    from public.evidence
   where observation_id = continuity_observation_id
     and lineage_key =
       'canonical-0007-abve-continuidade-metodologia-vigente';

  if announcement_evidence_id is null
    or current_result_evidence_id is null
    or prior_result_evidence_id is null
    or mhev_context_evidence_id is null
    or continuity_evidence_id is null
    or (
      select count(*)
        from public.evidence
       where lineage_key like 'canonical-0007-%'
    ) <> 5
    or exists (
      select 1
        from public.evidence
       where lineage_key like 'canonical-0007-%'
         and (
           origin_content_item_id is null
           or origin_source_id is not null
           or lineage_status <> 'established'
         )
    )
    or exists (
      with expected(
        observation_id,
        origin_content_item_id,
        lineage_key,
        notes
      ) as (
        values
          (
            announcement_observation_id,
            announcement_content_item_id,
            'canonical-0007-abve-anuncio-metodologia-eletrificados',
            'A publicação institucional de 6 de janeiro de 2025 anuncia a adoção prospectiva de requisitos técnicos e a publicação separada das categorias não enquadradas.'
          ),
          (
            current_result_observation_id,
            result_content_item_id,
            'canonical-0007-abve-resultado-metodologia-vigente',
            'A publicação institucional de 10 de fevereiro de 2025 define a classificação vigente e publica 12.556 como resultado principal de janeiro.'
          ),
          (
            prior_result_observation_id,
            result_content_item_id,
            'canonical-0007-abve-contrafactual-criterio-anterior',
            'A mesma publicação informa diretamente que o total seria 16.502 pelo critério anterior com MHEV.'
          ),
          (
            mhev_context_observation_id,
            result_content_item_id,
            'canonical-0007-abve-contexto-mhev-janeiro-2025',
            'A mesma publicação informa 3.946 MHEV e sua composição, explicando a diferença entre os dois totais sem exigir cálculo persistido.'
          ),
          (
            continuity_observation_id,
            continuity_content_item_id,
            'canonical-0007-abve-continuidade-metodologia-vigente',
            'A publicação institucional de 9 de fevereiro de 2026 reutiliza 12.556 para janeiro de 2025 e reafirma a composição da classificação vigente.'
          )
      )
      select 1
        from expected x
        left join public.evidence e
          on e.observation_id = x.observation_id
         and e.lineage_key = x.lineage_key
       where e.id is null
          or row(
            e.origin_content_item_id,
            e.origin_source_id,
            e.lineage_status,
            e.notes
          ) is distinct from row(
            x.origin_content_item_id,
            null::bigint,
            'established',
            x.notes
          )
    )
  then
    raise exception 'Carga 0007: uma evidência já existe com conteúdo divergente.';
  end if;

  if exists (
    select 1
      from public.metric_values
     where metric_definition_id = canonical_metric_definition_id
       and period_start = date '2025-01-01'
       and period_end = date '2025-01-31'
       and geography = 'Brasil'
       and observation_id not in (
         current_result_observation_id,
         prior_result_observation_id
       )
  ) then
    raise exception 'Carga 0007: janeiro de 2025 possui outro valor para a mesma métrica e geografia.';
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
      current_result_observation_id,
      12556,
      date '2025-01-01',
      date '2025-01-31',
      'Brasil',
      'validated',
      'Resultado principal publicado pela ABVE Data segundo a classificação vigente desde janeiro de 2025. Transcrição de 12.556 para 12556 sem cálculo ou arredondamento.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      canonical_metric_definition_id,
      prior_result_observation_id,
      16502,
      date '2025-01-01',
      date '2025-01-31',
      'Brasil',
      'validated',
      'Comparação contrafactual publicada pela ABVE Data para o critério anterior com MHEV. Transcrição de 16.502 para 16502 sem cálculo ou arredondamento.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint metric_values_scope_unique
  do nothing;

  select id into current_metric_value_id
    from public.metric_values
   where metric_definition_id = canonical_metric_definition_id
     and observation_id = current_result_observation_id
     and period_start = date '2025-01-01'
     and period_end = date '2025-01-31'
     and geography = 'Brasil';

  select id into prior_metric_value_id
    from public.metric_values
   where metric_definition_id = canonical_metric_definition_id
     and observation_id = prior_result_observation_id
     and period_start = date '2025-01-01'
     and period_end = date '2025-01-31'
     and geography = 'Brasil';

  if current_metric_value_id is null
    or prior_metric_value_id is null
    or exists (
      select 1
        from public.metric_values
       where id = current_metric_value_id
         and row(numeric_value, value_status, notes)
           is distinct from row(
             12556::numeric,
             'validated',
             'Resultado principal publicado pela ABVE Data segundo a classificação vigente desde janeiro de 2025. Transcrição de 12.556 para 12556 sem cálculo ou arredondamento.'
           )
    )
    or exists (
      select 1
        from public.metric_values
       where id = prior_metric_value_id
         and row(numeric_value, value_status, notes)
           is distinct from row(
             16502::numeric,
             'validated',
             'Comparação contrafactual publicada pela ABVE Data para o critério anterior com MHEV. Transcrição de 16.502 para 16502 sem cálculo ou arredondamento.'
           )
    )
  then
    raise exception 'Carga 0007: um valor métrico já existe com conteúdo divergente.';
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
      'ABVE anuncia novos critérios para classificar veículos eletrificados a partir de janeiro de 2025',
      'A ABVE anunciou requisitos técnicos para sua classificação mensal de veículos leves eletrificados a partir dos números de janeiro de 2025 e informou que as demais categorias híbridas continuariam em tabelas separadas.',
      'market_data',
      'announcement',
      date '2025-01-06',
      'day',
      'Brasil',
      'A mudança altera a composição do indicador nacional usado para acompanhar mensalmente a adoção de veículos leves eletrificados.',
      'confirmed',
      'accepted',
      'canonical-0007-abve-anuncia-revisao-metodologica-2025-01-06',
      'A data registra a publicação do anúncio. A nova classificação passa a valer para o período medido iniciado em 1º de janeiro de 2025. Confirmed indica fonte primária, sem corroboração independente.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      'ABVE Data publica 12.556 eletrificados e comparação de 16.502 para janeiro de 2025',
      'A ABVE Data publicou 12.556 emplacamentos pela classificação vigente e informou que o total seria 16.502 pelo critério anterior com MHEV; os 3.946 MHEV foram apresentados separadamente.',
      'market_data',
      'publication',
      date '2025-02-10',
      'day',
      'Brasil',
      'A publicação oferece o primeiro resultado mensal da série nacional sob a classificação vigente e preserva a comparação com a metodologia anterior.',
      'confirmed',
      'accepted',
      'canonical-0007-abve-publica-eletrificados-janeiro-2025-2025-02-10',
      'A data é a da publicação; janeiro de 2025 é o período medido. Os dois valores são publicados pela própria ABVE e não representam auditoria independente.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      'ABVE Data confirma continuidade da classificação sem MHEV no total principal',
      'A publicação sobre janeiro de 2026 reutilizou 12.556 como referência de janeiro de 2025 e reafirmou que o total de eletrificados inclui BEV, PHEV, HEV e HEV Flex, mantendo MHEV separadamente.',
      'market_data',
      'update',
      date '2026-02-09',
      'day',
      'Brasil',
      'A continuidade permite identificar a classificação sem MHEV no total principal como metodologia vigente da série nacional.',
      'confirmed',
      'accepted',
      'canonical-0007-abve-confirma-metodologia-eletrificados-2026-02-09',
      'A carga usa a publicação somente para confirmar a continuidade metodológica e a referência a 12.556; os resultados de 2026 ficam fora do recorte.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint events_fingerprint_unique
  do nothing;

  select id into announcement_event_id
    from public.events
   where event_fingerprint =
     'canonical-0007-abve-anuncia-revisao-metodologica-2025-01-06';

  select id into result_event_id
    from public.events
   where event_fingerprint =
     'canonical-0007-abve-publica-eletrificados-janeiro-2025-2025-02-10';

  select id into continuity_event_id
    from public.events
   where event_fingerprint =
     'canonical-0007-abve-confirma-metodologia-eletrificados-2026-02-09';

  if announcement_event_id is null
    or result_event_id is null
    or continuity_event_id is null
    or (
      select count(*)
        from public.events
       where event_fingerprint like 'canonical-0007-%'
    ) <> 3
    or exists (
      select 1
        from public.events
       where id = announcement_event_id
         and row(
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
           notes
         ) is distinct from row(
           'ABVE anuncia novos critérios para classificar veículos eletrificados a partir de janeiro de 2025',
           'A ABVE anunciou requisitos técnicos para sua classificação mensal de veículos leves eletrificados a partir dos números de janeiro de 2025 e informou que as demais categorias híbridas continuariam em tabelas separadas.',
           'market_data',
           'announcement',
           date '2025-01-06',
           'day',
           'Brasil',
           'A mudança altera a composição do indicador nacional usado para acompanhar mensalmente a adoção de veículos leves eletrificados.',
           'confirmed',
           'accepted',
           'A data registra a publicação do anúncio. A nova classificação passa a valer para o período medido iniciado em 1º de janeiro de 2025. Confirmed indica fonte primária, sem corroboração independente.'
         )
    )
    or exists (
      select 1
        from public.events
       where id = result_event_id
         and row(
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
           notes
         ) is distinct from row(
           'ABVE Data publica 12.556 eletrificados e comparação de 16.502 para janeiro de 2025',
           'A ABVE Data publicou 12.556 emplacamentos pela classificação vigente e informou que o total seria 16.502 pelo critério anterior com MHEV; os 3.946 MHEV foram apresentados separadamente.',
           'market_data',
           'publication',
           date '2025-02-10',
           'day',
           'Brasil',
           'A publicação oferece o primeiro resultado mensal da série nacional sob a classificação vigente e preserva a comparação com a metodologia anterior.',
           'confirmed',
           'accepted',
           'A data é a da publicação; janeiro de 2025 é o período medido. Os dois valores são publicados pela própria ABVE e não representam auditoria independente.'
         )
    )
    or exists (
      select 1
        from public.events
       where id = continuity_event_id
         and row(
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
           notes
         ) is distinct from row(
           'ABVE Data confirma continuidade da classificação sem MHEV no total principal',
           'A publicação sobre janeiro de 2026 reutilizou 12.556 como referência de janeiro de 2025 e reafirmou que o total de eletrificados inclui BEV, PHEV, HEV e HEV Flex, mantendo MHEV separadamente.',
           'market_data',
           'update',
           date '2026-02-09',
           'day',
           'Brasil',
           'A continuidade permite identificar a classificação sem MHEV no total principal como metodologia vigente da série nacional.',
           'confirmed',
           'accepted',
           'A carga usa a publicação somente para confirmar a continuidade metodológica e a referência a 12.556; os resultados de 2026 ficam fora do recorte.'
         )
    )
  then
    raise exception 'Carga 0007: um acontecimento já existe com conteúdo divergente.';
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
      announcement_event_id,
      announcement_evidence_id,
      'supports',
      'A evidência sustenta o anúncio prospectivo da nova classificação.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_event_id,
      current_result_evidence_id,
      'supports',
      'A evidência sustenta o resultado principal e a classificação vigente.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_event_id,
      prior_result_evidence_id,
      'supports',
      'A evidência sustenta a comparação publicada para o critério anterior.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_event_id,
      mhev_context_evidence_id,
      'contextualizes',
      'A evidência explica quantitativamente a diferença entre os dois totais.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      continuity_event_id,
      continuity_evidence_id,
      'supports',
      'A evidência sustenta a continuidade da metodologia vigente.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint event_evidence_pkey
  do nothing;

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
      announcement_event_id,
      abve_organization_id,
      'subject',
      'A ABVE é a mantenedora que anunciou a revisão da classificação.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      result_event_id,
      abve_organization_id,
      'subject',
      'A ABVE é a mantenedora que publicou os resultados e as duas classificações.',
      canonical_recorded_at,
      canonical_recorded_at
    ),
    (
      continuity_event_id,
      abve_organization_id,
      'subject',
      'A ABVE é a mantenedora que confirmou a continuidade da classificação.',
      canonical_recorded_at,
      canonical_recorded_at
    )
  on conflict on constraint event_organizations_pkey
  do nothing;

  if (
    select count(*)
      from public.event_evidence ee
      join public.events e on e.id = ee.event_id
     where e.event_fingerprint like 'canonical-0007-%'
  ) <> 5
    or (
      select count(*)
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where e.event_fingerprint like 'canonical-0007-%'
    ) <> 3
    or exists (
      select 1
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where e.event_fingerprint like 'canonical-0007-%'
         and (
           eo.organization_id <> abve_organization_id
           or eo.event_role <> 'subject'
         )
    )
    or exists (
      with expected(event_id, evidence_id, relationship_type, notes) as (
        values
          (
            announcement_event_id,
            announcement_evidence_id,
            'supports',
            'A evidência sustenta o anúncio prospectivo da nova classificação.'
          ),
          (
            result_event_id,
            current_result_evidence_id,
            'supports',
            'A evidência sustenta o resultado principal e a classificação vigente.'
          ),
          (
            result_event_id,
            prior_result_evidence_id,
            'supports',
            'A evidência sustenta a comparação publicada para o critério anterior.'
          ),
          (
            result_event_id,
            mhev_context_evidence_id,
            'contextualizes',
            'A evidência explica quantitativamente a diferença entre os dois totais.'
          ),
          (
            continuity_event_id,
            continuity_evidence_id,
            'supports',
            'A evidência sustenta a continuidade da metodologia vigente.'
          )
      )
      select 1
        from expected x
        left join public.event_evidence ee
          on ee.event_id = x.event_id
         and ee.evidence_id = x.evidence_id
       where ee.event_id is null
          or row(ee.relationship_type, ee.notes)
             is distinct from row(x.relationship_type, x.notes)
    )
    or exists (
      with expected(event_id, notes) as (
        values
          (
            announcement_event_id,
            'A ABVE é a mantenedora que anunciou a revisão da classificação.'
          ),
          (
            result_event_id,
            'A ABVE é a mantenedora que publicou os resultados e as duas classificações.'
          ),
          (
            continuity_event_id,
            'A ABVE é a mantenedora que confirmou a continuidade da classificação.'
          )
      )
      select 1
        from expected x
        left join public.event_organizations eo
          on eo.event_id = x.event_id
         and eo.organization_id = abve_organization_id
       where eo.event_id is null
          or row(eo.event_role, eo.notes)
             is distinct from row('subject', x.notes)
    )
  then
    raise exception 'Carga 0007: os vínculos dos acontecimentos estão incompletos ou divergentes.';
  end if;

  insert into public.metric_methodology_versions (
    methodology_key,
    metric_definition_id,
    name,
    description,
    applies_from,
    notes,
    created_at
  )
  values
    (
      'canonical-0007-abve-classificacao-anterior-com-mhev',
      canonical_metric_definition_id,
      'Classificação ABVE Data anterior a janeiro de 2025',
      'BEV, PHEV, HEV, HEV Flex e MHEV integram o total principal de veículos leves eletrificados.',
      null,
      'A data inicial desta versão não foi determinada no recorte. A ABVE aplicou o critério anterior como comparação contrafactual para janeiro de 2025.',
      canonical_recorded_at
    ),
    (
      'canonical-0007-abve-classificacao-vigente-sem-mhev',
      canonical_metric_definition_id,
      'Classificação ABVE Data vigente desde janeiro de 2025',
      'BEV, PHEV, HEV e HEV Flex integram o total principal; MHEV continuam publicados separadamente.',
      date '2025-01-01',
      'A versão representa a classificação declarada pela ABVE Data para a série iniciada em janeiro de 2025.',
      canonical_recorded_at
    )
  on conflict on constraint metric_methodology_versions_key_unique
  do nothing;

  select id into prior_methodology_version_id
    from public.metric_methodology_versions
   where methodology_key =
     'canonical-0007-abve-classificacao-anterior-com-mhev';

  select id into current_methodology_version_id
    from public.metric_methodology_versions
   where methodology_key =
     'canonical-0007-abve-classificacao-vigente-sem-mhev';

  if prior_methodology_version_id is null
    or current_methodology_version_id is null
    or (
      select count(*)
        from public.metric_methodology_versions
       where methodology_key like 'canonical-0007-%'
    ) <> 2
    or exists (
      select 1
        from public.metric_methodology_versions
       where id = prior_methodology_version_id
         and row(
           metric_definition_id,
           name,
           description,
           applies_from,
           notes
         ) is distinct from row(
           canonical_metric_definition_id,
           'Classificação ABVE Data anterior a janeiro de 2025',
           'BEV, PHEV, HEV, HEV Flex e MHEV integram o total principal de veículos leves eletrificados.',
           null::date,
           'A data inicial desta versão não foi determinada no recorte. A ABVE aplicou o critério anterior como comparação contrafactual para janeiro de 2025.'
         )
    )
    or exists (
      select 1
        from public.metric_methodology_versions
       where id = current_methodology_version_id
         and row(
           metric_definition_id,
           name,
           description,
           applies_from,
           notes
         ) is distinct from row(
           canonical_metric_definition_id,
           'Classificação ABVE Data vigente desde janeiro de 2025',
           'BEV, PHEV, HEV e HEV Flex integram o total principal; MHEV continuam publicados separadamente.',
           date '2025-01-01',
           'A versão representa a classificação declarada pela ABVE Data para a série iniciada em janeiro de 2025.'
         )
    )
  then
    raise exception 'Carga 0007: uma versão metodológica já existe com conteúdo divergente.';
  end if;

  insert into public.metric_methodology_components (
    methodology_version_id,
    component_key,
    component_name,
    component_role,
    notes,
    created_at
  )
  values
    (
      prior_methodology_version_id,
      'bev',
      'Veículos 100% elétricos — BEV',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      prior_methodology_version_id,
      'phev',
      'Veículos híbridos plug-in — PHEV',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      prior_methodology_version_id,
      'hev',
      'Veículos híbridos sem recarga externa — HEV',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      prior_methodology_version_id,
      'hev_flex',
      'Veículos híbridos flex — HEV Flex',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      prior_methodology_version_id,
      'mhev',
      'Veículos micro-híbridos — MHEV',
      'included',
      'MHEV integra o total principal sob o critério anterior.',
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      'bev',
      'Veículos 100% elétricos — BEV',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      'phev',
      'Veículos híbridos plug-in — PHEV',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      'hev',
      'Veículos híbridos sem recarga externa — HEV',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      'hev_flex',
      'Veículos híbridos flex — HEV Flex',
      'included',
      null,
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      'mhev',
      'Veículos micro-híbridos — MHEV',
      'reported_separately',
      'MHEV não integra o total principal desde janeiro de 2025, mas permanece publicado separadamente.',
      canonical_recorded_at
    )
  on conflict on constraint metric_methodology_components_pkey
  do nothing;

  if (
    select count(*)
      from public.metric_methodology_components
     where methodology_version_id in (
       prior_methodology_version_id,
       current_methodology_version_id
     )
  ) <> 10
    or (
      select count(*)
        from public.metric_methodology_components
       where methodology_version_id = prior_methodology_version_id
         and component_role = 'included'
         and component_key in ('bev', 'phev', 'hev', 'hev_flex', 'mhev')
    ) <> 5
    or (
      select count(*)
        from public.metric_methodology_components
       where methodology_version_id = current_methodology_version_id
         and component_role = 'included'
         and component_key in ('bev', 'phev', 'hev', 'hev_flex')
    ) <> 4
    or (
      select count(*)
        from public.metric_methodology_components
       where methodology_version_id = current_methodology_version_id
         and component_key = 'mhev'
         and component_role = 'reported_separately'
    ) <> 1
    or exists (
      with expected(
        methodology_version_id,
        component_key,
        component_name,
        component_role,
        notes
      ) as (
        values
          (prior_methodology_version_id, 'bev', 'Veículos 100% elétricos — BEV', 'included', null::text),
          (prior_methodology_version_id, 'phev', 'Veículos híbridos plug-in — PHEV', 'included', null::text),
          (prior_methodology_version_id, 'hev', 'Veículos híbridos sem recarga externa — HEV', 'included', null::text),
          (prior_methodology_version_id, 'hev_flex', 'Veículos híbridos flex — HEV Flex', 'included', null::text),
          (prior_methodology_version_id, 'mhev', 'Veículos micro-híbridos — MHEV', 'included', 'MHEV integra o total principal sob o critério anterior.'),
          (current_methodology_version_id, 'bev', 'Veículos 100% elétricos — BEV', 'included', null::text),
          (current_methodology_version_id, 'phev', 'Veículos híbridos plug-in — PHEV', 'included', null::text),
          (current_methodology_version_id, 'hev', 'Veículos híbridos sem recarga externa — HEV', 'included', null::text),
          (current_methodology_version_id, 'hev_flex', 'Veículos híbridos flex — HEV Flex', 'included', null::text),
          (current_methodology_version_id, 'mhev', 'Veículos micro-híbridos — MHEV', 'reported_separately', 'MHEV não integra o total principal desde janeiro de 2025, mas permanece publicado separadamente.')
      )
      select 1
        from expected x
        left join public.metric_methodology_components mmc
          on mmc.methodology_version_id = x.methodology_version_id
         and mmc.component_key = x.component_key
       where mmc.methodology_version_id is null
          or row(mmc.component_name, mmc.component_role, mmc.notes)
             is distinct from row(x.component_name, x.component_role, x.notes)
    )
  then
    raise exception 'Carga 0007: os componentes metodológicos estão incompletos ou divergentes.';
  end if;

  insert into public.metric_methodology_evidence (
    methodology_version_id,
    evidence_id,
    relationship_type,
    notes,
    created_at
  )
  values
    (
      prior_methodology_version_id,
      prior_result_evidence_id,
      'defines',
      'A evidência identifica o critério anterior e o total contrafactual correspondente.',
      canonical_recorded_at
    ),
    (
      prior_methodology_version_id,
      mhev_context_evidence_id,
      'contextualizes',
      'A evidência quantifica o componente MHEV incluído pelo critério anterior.',
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      announcement_evidence_id,
      'announces',
      'A evidência anuncia a mudança para os números de janeiro de 2025.',
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      current_result_evidence_id,
      'defines',
      'A evidência define a composição vigente e publica seu primeiro resultado mensal.',
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      mhev_context_evidence_id,
      'contextualizes',
      'A evidência mostra que MHEV continua publicado fora do total principal.',
      canonical_recorded_at
    ),
    (
      current_methodology_version_id,
      continuity_evidence_id,
      'confirms',
      'A evidência posterior confirma a continuidade da classificação.',
      canonical_recorded_at
    )
  on conflict on constraint metric_methodology_evidence_pkey
  do nothing;

  if (
    select count(*)
      from public.metric_methodology_evidence
     where methodology_version_id in (
       prior_methodology_version_id,
       current_methodology_version_id
     )
  ) <> 6
    or (
      select count(*)
        from public.metric_methodology_evidence
       where methodology_version_id = prior_methodology_version_id
         and relationship_type = 'defines'
         and evidence_id = prior_result_evidence_id
    ) <> 1
    or (
      select count(*)
        from public.metric_methodology_evidence
       where methodology_version_id = current_methodology_version_id
         and relationship_type = 'announces'
         and evidence_id = announcement_evidence_id
    ) <> 1
    or (
      select count(*)
        from public.metric_methodology_evidence
       where methodology_version_id = current_methodology_version_id
         and relationship_type = 'defines'
         and evidence_id = current_result_evidence_id
    ) <> 1
    or (
      select count(*)
        from public.metric_methodology_evidence
       where methodology_version_id = current_methodology_version_id
         and relationship_type = 'confirms'
         and evidence_id = continuity_evidence_id
    ) <> 1
    or exists (
      with expected(
        methodology_version_id,
        evidence_id,
        relationship_type,
        notes
      ) as (
        values
          (
            prior_methodology_version_id,
            prior_result_evidence_id,
            'defines',
            'A evidência identifica o critério anterior e o total contrafactual correspondente.'
          ),
          (
            prior_methodology_version_id,
            mhev_context_evidence_id,
            'contextualizes',
            'A evidência quantifica o componente MHEV incluído pelo critério anterior.'
          ),
          (
            current_methodology_version_id,
            announcement_evidence_id,
            'announces',
            'A evidência anuncia a mudança para os números de janeiro de 2025.'
          ),
          (
            current_methodology_version_id,
            current_result_evidence_id,
            'defines',
            'A evidência define a composição vigente e publica seu primeiro resultado mensal.'
          ),
          (
            current_methodology_version_id,
            mhev_context_evidence_id,
            'contextualizes',
            'A evidência mostra que MHEV continua publicado fora do total principal.'
          ),
          (
            current_methodology_version_id,
            continuity_evidence_id,
            'confirms',
            'A evidência posterior confirma a continuidade da classificação.'
          )
      )
      select 1
        from expected x
        left join public.metric_methodology_evidence mme
          on mme.methodology_version_id = x.methodology_version_id
         and mme.evidence_id = x.evidence_id
       where mme.methodology_version_id is null
          or row(mme.relationship_type, mme.notes)
             is distinct from row(x.relationship_type, x.notes)
    )
  then
    raise exception 'Carga 0007: os vínculos de evidência metodológica estão incompletos ou divergentes.';
  end if;

  insert into public.metric_methodology_relations (
    earlier_methodology_version_id,
    later_methodology_version_id,
    relationship_type,
    effective_on,
    evidence_id,
    notes,
    created_at
  )
  values (
    prior_methodology_version_id,
    current_methodology_version_id,
    'supersedes',
    date '2025-01-01',
    current_result_evidence_id,
    'A classificação vigente substitui o critério anterior como referência do total principal a partir de janeiro de 2025; a relação não invalida valores publicados sob o método anterior.',
    canonical_recorded_at
  )
  on conflict on constraint metric_methodology_relations_pkey
  do nothing;

  if (
    select count(*)
      from public.metric_methodology_relations
     where earlier_methodology_version_id = prior_methodology_version_id
       and later_methodology_version_id = current_methodology_version_id
       and relationship_type = 'supersedes'
       and effective_on = date '2025-01-01'
       and evidence_id = current_result_evidence_id
       and notes = 'A classificação vigente substitui o critério anterior como referência do total principal a partir de janeiro de 2025; a relação não invalida valores publicados sob o método anterior.'
  ) <> 1
    or (
      select applies_from
        from public.metric_methodology_versions
       where id = current_methodology_version_id
    ) is distinct from date '2025-01-01'
    or exists (
      with recursive paths as (
        select
          earlier_methodology_version_id as origin_id,
          later_methodology_version_id as current_id,
          array[
            earlier_methodology_version_id,
            later_methodology_version_id
          ]::bigint[] as visited,
          later_methodology_version_id =
            earlier_methodology_version_id as has_cycle
        from public.metric_methodology_relations
        union all
        select
          p.origin_id,
          r.later_methodology_version_id,
          p.visited || r.later_methodology_version_id,
          r.later_methodology_version_id = any(p.visited)
        from paths p
        join public.metric_methodology_relations r
          on r.earlier_methodology_version_id = p.current_id
        where not p.has_cycle
      )
      select 1 from paths where has_cycle
    )
  then
    raise exception 'Carga 0007: a relação metodológica está ausente, divergente ou cíclica.';
  end if;

  insert into public.metric_value_methodology_assignments (
    metric_value_id,
    methodology_version_id,
    value_origin,
    value_role,
    notes,
    created_at
  )
  values
    (
      current_metric_value_id,
      current_methodology_version_id,
      'source_published',
      'primary',
      '12.556 é o resultado principal publicado pela ABVE Data sob a classificação vigente.',
      canonical_recorded_at
    ),
    (
      prior_metric_value_id,
      prior_methodology_version_id,
      'source_published',
      'counterfactual',
      '16.502 é o total que a ABVE Data informa que seria obtido pelo critério anterior com MHEV.',
      canonical_recorded_at
    )
  on conflict on constraint metric_value_methodology_assignments_pkey
  do nothing;

  if (
    select count(*)
      from public.metric_value_methodology_assignments
     where metric_value_id in (
       current_metric_value_id,
       prior_metric_value_id
     )
  ) <> 2
    or (
      select count(*)
        from public.metric_value_methodology_assignments
       where metric_value_id = current_metric_value_id
         and methodology_version_id = current_methodology_version_id
         and value_origin = 'source_published'
         and value_role = 'primary'
         and notes = '12.556 é o resultado principal publicado pela ABVE Data sob a classificação vigente.'
    ) <> 1
    or (
      select count(*)
        from public.metric_value_methodology_assignments
       where metric_value_id = prior_metric_value_id
         and methodology_version_id = prior_methodology_version_id
         and value_origin = 'source_published'
         and value_role = 'counterfactual'
         and notes = '16.502 é o total que a ABVE Data informa que seria obtido pelo critério anterior com MHEV.'
    ) <> 1
    or exists (
      select 1
        from public.metric_value_methodology_assignments mvma
        join public.metric_values mv on mv.id = mvma.metric_value_id
        join public.metric_methodology_versions mmv
          on mmv.id = mvma.methodology_version_id
       where mvma.metric_value_id in (
         current_metric_value_id,
         prior_metric_value_id
       )
         and mv.metric_definition_id <> mmv.metric_definition_id
    )
    or exists (
      select 1
        from public.metric_value_methodology_assignments mvma
        join public.metric_values mv on mv.id = mvma.metric_value_id
        join public.metric_methodology_versions mmv
          on mmv.id = mvma.methodology_version_id
       where mvma.metric_value_id = current_metric_value_id
         and mvma.value_role = 'primary'
         and (
           mmv.applies_from is null
           or mv.period_start < mmv.applies_from
         )
    )
  then
    raise exception 'Carga 0007: as atribuições metodológicas estão incompletas ou incoerentes.';
  end if;

  if (select count(*) from public.metric_value_resolutions
       where resolution_key like 'canonical-0007-%') <> 0
    or (select count(*) from public.metric_value_status_transitions
         where transition_key like 'canonical-0007-%') <> 0
    or (select count(*)
          from public.content_item_relations cir
          join public.content_items earlier
            on earlier.id = cir.earlier_content_item_id
          join public.content_items later
            on later.id = cir.later_content_item_id
         where earlier.content_fingerprint like 'canonical-0007-%'
            or later.content_fingerprint like 'canonical-0007-%') <> 0
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where o.observation_fingerprint =
           'canonical-0007-abve-mhev-janeiro-2025') <> 0
    or (select count(*)
          from public.metric_value_methodology_assignments
         where value_origin <> 'source_published') <> 0
  then
    raise exception 'Carga 0007: foram criadas estruturas ou valores deliberadamente excluídos.';
  end if;

  select md5(jsonb_build_object(
    'sources', (
      select jsonb_agg(to_jsonb(s) order by s.id)
        from public.sources s
    ),
    'content_items', (
      select jsonb_agg(to_jsonb(ci) order by ci.id)
        from public.content_items ci
       where coalesce(ci.content_fingerprint, '') !~ '^canonical-0007-'
    ),
    'observations', (
      select jsonb_agg(to_jsonb(o) order by o.id)
        from public.observations o
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-'
    ),
    'evidence', (
      select jsonb_agg(to_jsonb(ev) order by ev.id)
        from public.evidence ev
       where coalesce(ev.lineage_key, '') !~ '^canonical-0007-'
    ),
    'events', (
      select jsonb_agg(to_jsonb(e) order by e.id)
        from public.events e
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'event_evidence', (
      select jsonb_agg(to_jsonb(ee) order by ee.event_id, ee.evidence_id)
        from public.event_evidence ee
        join public.events e on e.id = ee.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'metric_definitions', (
      select jsonb_agg(to_jsonb(md) order by md.id)
        from public.metric_definitions md
       where md.metric_key <>
         'monthly-light-electrified-vehicle-registrations-brazil-abve-classification'
    ),
    'metric_values', (
      select jsonb_agg(to_jsonb(mv) order by mv.id)
        from public.metric_values mv
        join public.observations o on o.id = mv.observation_id
       where coalesce(o.observation_fingerprint, '') !~ '^canonical-0007-'
    ),
    'organizations', (
      select jsonb_agg(to_jsonb(org) order by org.id)
        from public.organizations org
    ),
    'event_organizations', (
      select jsonb_agg(
        to_jsonb(eo)
        order by eo.event_id, eo.organization_id, eo.event_role
      )
        from public.event_organizations eo
        join public.events e on e.id = eo.event_id
       where coalesce(e.event_fingerprint, '') !~ '^canonical-0007-'
    ),
    'content_item_relations', (
      select jsonb_agg(
        to_jsonb(cir)
        order by
          cir.earlier_content_item_id,
          cir.later_content_item_id,
          cir.relationship_type
      )
        from public.content_item_relations cir
    ),
    'metric_value_resolutions', (
      select jsonb_agg(to_jsonb(mvr) order by mvr.id)
        from public.metric_value_resolutions mvr
    ),
    'metric_value_status_transitions', (
      select jsonb_agg(to_jsonb(mvst) order by mvst.id)
        from public.metric_value_status_transitions mvst
    ),
    'regulatory_instruments', (
      select jsonb_agg(to_jsonb(ri) order by ri.id)
        from public.regulatory_instruments ri
    ),
    'event_regulatory_instruments', (
      select jsonb_agg(
        to_jsonb(eri)
        order by eri.event_id, eri.regulatory_instrument_id, eri.instrument_role
      )
        from public.event_regulatory_instruments eri
    ),
    'regulatory_instrument_relations', (
      select jsonb_agg(
        to_jsonb(rir)
        order by
          rir.source_instrument_id,
          rir.target_instrument_id,
          rir.relationship_type
      )
        from public.regulatory_instrument_relations rir
    ),
    'metric_methodology_versions', (
      select jsonb_agg(to_jsonb(mmv) order by mmv.id)
        from public.metric_methodology_versions mmv
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_components', (
      select jsonb_agg(
        to_jsonb(mmc)
        order by mmc.methodology_version_id, mmc.component_key
      )
        from public.metric_methodology_components mmc
        join public.metric_methodology_versions mmv
          on mmv.id = mmc.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_evidence', (
      select jsonb_agg(
        to_jsonb(mme)
        order by
          mme.methodology_version_id,
          mme.evidence_id,
          mme.relationship_type
      )
        from public.metric_methodology_evidence mme
        join public.metric_methodology_versions mmv
          on mmv.id = mme.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    ),
    'metric_methodology_relations', (
      select jsonb_agg(
        to_jsonb(mmr)
        order by
          mmr.earlier_methodology_version_id,
          mmr.later_methodology_version_id,
          mmr.relationship_type
      )
        from public.metric_methodology_relations mmr
        join public.metric_methodology_versions earlier
          on earlier.id = mmr.earlier_methodology_version_id
        join public.metric_methodology_versions later
          on later.id = mmr.later_methodology_version_id
       where earlier.methodology_key !~ '^canonical-0007-'
         and later.methodology_key !~ '^canonical-0007-'
    ),
    'metric_value_methodology_assignments', (
      select jsonb_agg(to_jsonb(mvma) order by mvma.metric_value_id)
        from public.metric_value_methodology_assignments mvma
        join public.metric_methodology_versions mmv
          on mmv.id = mvma.methodology_version_id
       where mmv.methodology_key !~ '^canonical-0007-'
    )
  )::text)
    into prior_records_signature_after;

  if prior_records_signature_after is distinct from
    prior_records_signature_before
  then
    raise exception 'Carga 0007: registros anteriores foram alterados.';
  end if;

  if (select count(*) from public.content_items
       where content_fingerprint like 'canonical-0007-%') <> 2
    or (select count(*) from public.observations
         where observation_fingerprint like 'canonical-0007-%') <> 5
    or (select count(*) from public.evidence
         where lineage_key like 'canonical-0007-%') <> 5
    or (select count(*) from public.events
         where event_fingerprint like 'canonical-0007-%') <> 3
    or (select count(*)
          from public.event_evidence ee
          join public.events e on e.id = ee.event_id
         where e.event_fingerprint like 'canonical-0007-%') <> 5
    or (select count(*)
          from public.event_organizations eo
          join public.events e on e.id = eo.event_id
         where e.event_fingerprint like 'canonical-0007-%') <> 3
    or (select count(*) from public.metric_definitions
         where metric_key =
           'monthly-light-electrified-vehicle-registrations-brazil-abve-classification') <> 1
    or (select count(*)
          from public.metric_values mv
          join public.observations o on o.id = mv.observation_id
         where o.observation_fingerprint like 'canonical-0007-%') <> 2
    or (select count(*) from public.metric_methodology_versions
         where methodology_key like 'canonical-0007-%') <> 2
    or (select count(*)
          from public.metric_methodology_components mmc
          join public.metric_methodology_versions mmv
            on mmv.id = mmc.methodology_version_id
         where mmv.methodology_key like 'canonical-0007-%') <> 10
    or (select count(*)
          from public.metric_methodology_evidence mme
          join public.metric_methodology_versions mmv
            on mmv.id = mme.methodology_version_id
         where mmv.methodology_key like 'canonical-0007-%') <> 6
    or (select count(*)
          from public.metric_methodology_relations mmr
          join public.metric_methodology_versions earlier
            on earlier.id = mmr.earlier_methodology_version_id
          join public.metric_methodology_versions later
            on later.id = mmr.later_methodology_version_id
         where earlier.methodology_key like 'canonical-0007-%'
           and later.methodology_key like 'canonical-0007-%') <> 1
    or (select count(*)
          from public.metric_value_methodology_assignments mvma
          join public.metric_methodology_versions mmv
            on mmv.id = mvma.methodology_version_id
         where mmv.methodology_key like 'canonical-0007-%') <> 2
  then
    raise exception 'Carga 0007: as contagens finais estão incompletas ou divergentes.';
  end if;
end
$$;
