-- Verificação reutilizável da carga canônica 0008.
-- Retorna absent antes da carga e complete após a execução integral.

with prior_sources_snapshot as (
  select
    count(*) as count,
    md5(coalesce(
      jsonb_agg(to_jsonb(s) order by s.id),
      '[]'::jsonb
    )::text) as signature
  from public.sources s
  where s.slug <> 'aneel'
),
aneel_source as (
  select
    count(*) as count,
    count(*) filter (
      where name = 'ANEEL'
        and slug = 'aneel'
        and homepage_url = 'https://www.gov.br/aneel/pt-br'
        and source_type = 'government_regulator'
        and status = 'approved'
        and country_code = 'BR'
        and language_codes = array['pt-BR', 'en']::text[]
        and is_primary_source = true
        and publisher_group is null
        and notes = 'Fonte institucional da Agência Nacional de Energia Elétrica em seus domínios e subdomínios oficiais, inclusive o Portal de Dados Abertos; a natureza primária depende de o conteúdo ter sido produzido, emitido ou custodiado pela própria Agência.'
    ) as exact_rows,
    jsonb_agg(jsonb_build_object(
      'name', name,
      'slug', slug,
      'homepage_url', homepage_url,
      'source_type', source_type,
      'status', status,
      'country_code', country_code,
      'language_codes', language_codes,
      'is_primary_source', is_primary_source,
      'publisher_group', publisher_group,
      'notes', notes
    ) order by id) as records
  from public.sources
  where slug = 'aneel'
)
select
  p.signature as prior_sources_signature,
  p.count as prior_sources,
  case
    when a.count = 0 then 'absent'
    when a.count = 1 and a.exact_rows = 1 then 'complete'
    else 'unexpected'
  end as load_0008_state,
  a.count as aneel_sources,
  a.exact_rows,
  coalesce(a.records, '[]'::jsonb) as aneel_records
from prior_sources_snapshot p
cross join aneel_source a;
