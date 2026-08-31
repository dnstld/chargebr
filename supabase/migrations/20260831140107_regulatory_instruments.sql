create table public.regulatory_instruments (
  id bigint generated always as identity primary key,
  official_content_item_id bigint,
  instrument_key text not null,
  title text not null,
  short_title text,
  instrument_type text not null,
  official_identifier text,
  issuing_authority text not null,
  jurisdiction_level text not null,
  jurisdiction_name text not null,
  current_status text not null default 'unknown',
  publication_date date,
  effective_date date,
  expiry_date date,
  scope_summary text not null,
  brazil_relevance text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint regulatory_instruments_official_content_item_id_fkey
    foreign key (official_content_item_id)
    references public.content_items (id)
    on delete restrict,
  constraint regulatory_instruments_key_not_blank
    check (btrim(instrument_key) <> ''),
  constraint regulatory_instruments_key_format
    check (instrument_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint regulatory_instruments_key_unique
    unique (instrument_key),
  constraint regulatory_instruments_title_not_blank
    check (btrim(title) <> ''),
  constraint regulatory_instruments_short_title_not_blank
    check (short_title is null or btrim(short_title) <> ''),
  constraint regulatory_instruments_type_valid
    check (
      instrument_type in (
        'law',
        'complementary_law',
        'decree',
        'provisional_measure',
        'resolution',
        'ordinance',
        'normative_instruction',
        'public_consultation',
        'bill',
        'technical_regulation',
        'other'
      )
    ),
  constraint regulatory_instruments_identifier_not_blank
    check (
      official_identifier is null
      or btrim(official_identifier) <> ''
    ),
  constraint regulatory_instruments_authority_not_blank
    check (btrim(issuing_authority) <> ''),
  constraint regulatory_instruments_jurisdiction_level_valid
    check (
      jurisdiction_level in (
        'federal',
        'state',
        'district',
        'municipal',
        'supranational',
        'foreign'
      )
    ),
  constraint regulatory_instruments_jurisdiction_name_not_blank
    check (btrim(jurisdiction_name) <> ''),
  constraint regulatory_instruments_current_status_valid
    check (
      current_status in (
        'draft',
        'under_consultation',
        'proposed',
        'approved',
        'published',
        'effective',
        'suspended',
        'revoked',
        'expired',
        'rejected',
        'unknown'
      )
    ),
  constraint regulatory_instruments_scope_summary_not_blank
    check (btrim(scope_summary) <> ''),
  constraint regulatory_instruments_brazil_relevance_not_blank
    check (btrim(brazil_relevance) <> ''),
  constraint regulatory_instruments_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.regulatory_instruments is
  'Instrumentos regulatórios canônicos acompanhados pelo ChargeBR.';

comment on column public.regulatory_instruments.official_content_item_id is
  'Documento oficial coletado, quando a publicação exata está disponível.';

comment on column public.regulatory_instruments.instrument_key is
  'Identificador estável e legível do instrumento dentro do ChargeBR.';

comment on column public.regulatory_instruments.issuing_authority is
  'Nome da autoridade emissora até sua futura normalização em organizations.';

comment on column public.regulatory_instruments.current_status is
  'Estado atual do instrumento; as mudanças históricas permanecem em eventos.';

comment on column public.regulatory_instruments.brazil_relevance is
  'Explicação da relação material do instrumento com o mercado brasileiro.';

create index regulatory_instruments_official_content_item_id_idx
  on public.regulatory_instruments (official_content_item_id)
  where official_content_item_id is not null;

create index regulatory_instruments_jurisdiction_status_type_idx
  on public.regulatory_instruments (
    jurisdiction_level,
    current_status,
    instrument_type
  );

alter table public.regulatory_instruments enable row level security;

revoke all on table public.regulatory_instruments
  from public, anon, authenticated;
revoke all on sequence public.regulatory_instruments_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.regulatory_instruments
  to service_role;

grant usage, select
  on sequence public.regulatory_instruments_id_seq
  to service_role;
