create table public.sources (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null,
  homepage_url text not null,
  source_type text not null,
  status text not null default 'candidate',
  country_code text,
  language_codes text[] not null default '{}'::text[],
  is_primary_source boolean not null default false,
  publisher_group text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sources_name_not_blank
    check (btrim(name) <> ''),
  constraint sources_slug_not_blank
    check (btrim(slug) <> ''),
  constraint sources_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint sources_slug_unique
    unique (slug),
  constraint sources_homepage_url_not_blank
    check (btrim(homepage_url) <> ''),
  constraint sources_source_type_valid
    check (
      source_type in (
        'government_regulator',
        'company',
        'industry_association',
        'news_journalism',
        'specialized_media',
        'research_data',
        'discovery'
      )
    ),
  constraint sources_status_valid
    check (
      status in (
        'candidate',
        'under_review',
        'approved',
        'rejected',
        'inactive'
      )
    ),
  constraint sources_country_code_format
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint sources_language_codes_without_nulls
    check (array_position(language_codes, null) is null)
);

comment on table public.sources is
  'Lista canônica de fontes avaliadas ou monitoradas pelo ChargeBR.';

comment on column public.sources.slug is
  'Identificador estável e legível da fonte.';

comment on column public.sources.source_type is
  'Classificação controlada do tipo de fonte.';

comment on column public.sources.language_codes is
  'Códigos BCP 47 dos idiomas publicados pela fonte, como pt-BR ou en.';

comment on column public.sources.is_primary_source is
  'Indica se a fonte pode atuar como origem primária de evidência.';

alter table public.sources enable row level security;

revoke all on table public.sources from public, anon, authenticated;
revoke all on sequence public.sources_id_seq from public, anon, authenticated;

grant select, insert, update, delete on table public.sources to service_role;
grant usage, select on sequence public.sources_id_seq to service_role;
