create table public.organizations (
  id bigint generated always as identity primary key,
  name text not null,
  legal_name text,
  slug text not null,
  organization_type text not null,
  status text not null default 'candidate',
  country_code text,
  homepage_url text,
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_name_not_blank
    check (btrim(name) <> ''),
  constraint organizations_legal_name_not_blank
    check (
      legal_name is null
      or btrim(legal_name) <> ''
    ),
  constraint organizations_slug_not_blank
    check (btrim(slug) <> ''),
  constraint organizations_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint organizations_slug_unique
    unique (slug),
  constraint organizations_type_valid
    check (
      organization_type in (
        'government',
        'regulator',
        'company',
        'industry_association',
        'research_institution',
        'financial_institution',
        'media',
        'nonprofit',
        'other'
      )
    ),
  constraint organizations_status_valid
    check (
      status in (
        'candidate',
        'under_review',
        'approved',
        'rejected',
        'inactive'
      )
    ),
  constraint organizations_country_code_format
    check (
      country_code is null
      or country_code ~ '^[A-Z]{2}$'
    ),
  constraint organizations_homepage_url_not_blank
    check (
      homepage_url is null
      or btrim(homepage_url) <> ''
    ),
  constraint organizations_description_not_blank
    check (
      description is null
      or btrim(description) <> ''
    ),
  constraint organizations_notes_not_blank
    check (
      notes is null
      or btrim(notes) <> ''
    )
);

comment on table public.organizations is
  'Cadastro canônico das organizações relevantes para o ChargeBR.';

comment on column public.organizations.slug is
  'Identificador estável e legível da organização.';

comment on column public.organizations.organization_type is
  'Natureza institucional da organização, sem representar seu papel em um contexto específico.';

comment on column public.organizations.status is
  'Estado da revisão da organização no cadastro canônico.';

comment on column public.organizations.country_code is
  'Código ISO 3166-1 alfa-2 do país associado à organização, quando aplicável.';

create index organizations_type_status_idx
  on public.organizations (organization_type, status);

alter table public.organizations enable row level security;

revoke all on table public.organizations
  from public, anon, authenticated;
revoke all on sequence public.organizations_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.organizations
  to service_role;

grant usage, select
  on sequence public.organizations_id_seq
  to service_role;
