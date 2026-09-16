-- Carga canônica 0008: source institucional da ANEEL.
--
-- Este arquivo não controla a transação. Para validar, execute-o duas vezes
-- entre BEGIN e ROLLBACK. Para persistir depois do merge, execute-o uma vez
-- entre BEGIN e COMMIT.

do $$
declare
  canonical_recorded_at constant timestamptz :=
    timestamptz '2026-09-16 08:07:02+02';
  prior_sources_signature_before text;
  prior_sources_signature_after text;
  aneel_source_id bigint;
begin
  select md5(coalesce(
    jsonb_agg(to_jsonb(s) order by s.id),
    '[]'::jsonb
  )::text)
    into prior_sources_signature_before
    from public.sources s
   where s.slug <> 'aneel';

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
  select
    'ANEEL',
    'aneel',
    'https://www.gov.br/aneel/pt-br',
    'government_regulator',
    'approved',
    'BR',
    array['pt-BR', 'en']::text[],
    true,
    null,
    'Fonte institucional da Agência Nacional de Energia Elétrica em seus domínios e subdomínios oficiais, inclusive o Portal de Dados Abertos; a natureza primária depende de o conteúdo ter sido produzido, emitido ou custodiado pela própria Agência.',
    canonical_recorded_at,
    canonical_recorded_at
  where not exists (
    select 1
      from public.sources
     where slug = 'aneel'
  )
  on conflict on constraint sources_slug_unique do nothing;

  select id into aneel_source_id
    from public.sources
   where slug = 'aneel';

  if aneel_source_id is null or exists (
    select 1
      from public.sources
     where id = aneel_source_id
       and (
         name is distinct from 'ANEEL'
         or slug is distinct from 'aneel'
         or homepage_url is distinct from 'https://www.gov.br/aneel/pt-br'
         or source_type is distinct from 'government_regulator'
         or status is distinct from 'approved'
         or country_code is distinct from 'BR'
         or language_codes is distinct from array['pt-BR', 'en']::text[]
         or is_primary_source is distinct from true
         or publisher_group is not null
         or notes is distinct from 'Fonte institucional da Agência Nacional de Energia Elétrica em seus domínios e subdomínios oficiais, inclusive o Portal de Dados Abertos; a natureza primária depende de o conteúdo ter sido produzido, emitido ou custodiado pela própria Agência.'
       )
  ) then
    raise exception 'Carga 0008: a source aneel já existe com conteúdo divergente.';
  end if;

  if (select count(*) from public.sources where slug = 'aneel') <> 1 then
    raise exception 'Carga 0008: a source aneel não possui exatamente um registro.';
  end if;

  select md5(coalesce(
    jsonb_agg(to_jsonb(s) order by s.id),
    '[]'::jsonb
  )::text)
    into prior_sources_signature_after
    from public.sources s
   where s.slug <> 'aneel';

  if prior_sources_signature_after is distinct from
    prior_sources_signature_before
  then
    raise exception 'Carga 0008: sources anteriores foram alteradas.';
  end if;
end
$$;
