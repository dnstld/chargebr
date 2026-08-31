create table public.observations (
  id bigint generated always as identity primary key,
  content_item_id bigint not null,
  observation_type text not null,
  source_claim text not null,
  normalized_claim text,
  normalization_status text not null default 'not_attempted',
  observation_date date,
  geography text,
  extraction_method text not null default 'manual',
  source_term text,
  observation_fingerprint text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint observations_content_item_id_fkey
    foreign key (content_item_id)
    references public.content_items (id)
    on delete restrict,
  constraint observations_observation_type_valid
    check (
      observation_type in (
        'claim',
        'quantity',
        'date',
        'status',
        'relationship',
        'other'
      )
    ),
  constraint observations_source_claim_not_blank
    check (btrim(source_claim) <> ''),
  constraint observations_normalization_status_valid
    check (
      normalization_status in (
        'not_attempted',
        'normalized',
        'unresolved'
      )
    ),
  constraint observations_normalized_claim_consistent
    check (
      (
        normalization_status = 'normalized'
        and normalized_claim is not null
        and btrim(normalized_claim) <> ''
      )
      or (
        normalization_status <> 'normalized'
        and normalized_claim is null
      )
    ),
  constraint observations_geography_not_blank
    check (geography is null or btrim(geography) <> ''),
  constraint observations_extraction_method_valid
    check (
      extraction_method in (
        'manual',
        'assisted',
        'automated'
      )
    ),
  constraint observations_source_term_not_blank
    check (source_term is null or btrim(source_term) <> ''),
  constraint observations_fingerprint_not_blank
    check (
      observation_fingerprint is null
      or btrim(observation_fingerprint) <> ''
    ),
  constraint observations_content_fingerprint_unique
    unique (content_item_id, observation_fingerprint)
);

comment on table public.observations is
  'Afirmações estruturadas extraídas de itens de conteúdo.';

comment on column public.observations.source_claim is
  'Afirmação ou valor conforme observado no item de conteúdo.';

comment on column public.observations.normalized_claim is
  'Representação canônica criada somente quando a normalização é defensável.';

comment on column public.observations.normalization_status is
  'Indica se a normalização não foi tentada, foi concluída ou segue não resolvida.';

comment on column public.observations.extraction_method is
  'Método usado para extrair a observação: manual, assistido ou automatizado.';

create index observations_content_item_date_idx
  on public.observations (content_item_id, observation_date desc);

alter table public.observations enable row level security;

revoke all on table public.observations from public, anon, authenticated;
revoke all on sequence public.observations_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.observations
  to service_role;

grant usage, select
  on sequence public.observations_id_seq
  to service_role;
