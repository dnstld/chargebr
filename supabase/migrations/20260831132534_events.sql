create table public.events (
  id bigint generated always as identity primary key,
  title text not null,
  summary text not null,
  event_type text not null,
  event_phase text not null default 'occurrence',
  event_date date,
  date_precision text not null default 'unknown',
  geography text,
  brazil_relevance text not null,
  verification_level text not null default 'unverified',
  workflow_status text not null default 'candidate',
  event_fingerprint text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_title_not_blank
    check (btrim(title) <> ''),
  constraint events_summary_not_blank
    check (btrim(summary) <> ''),
  constraint events_event_type_valid
    check (
      event_type in (
        'regulation',
        'public_policy',
        'market_entry',
        'market_exit',
        'investment',
        'partnership',
        'merger_acquisition',
        'infrastructure',
        'product_service',
        'market_data',
        'energy_grid',
        'operations',
        'other'
      )
    ),
  constraint events_event_phase_valid
    check (
      event_phase in (
        'announcement',
        'approval',
        'publication',
        'effective',
        'occurrence',
        'update'
      )
    ),
  constraint events_date_precision_valid
    check (date_precision in ('day', 'month', 'year', 'unknown')),
  constraint events_date_precision_consistent
    check (
      (date_precision = 'unknown' and event_date is null)
      or (date_precision = 'day' and event_date is not null)
      or (
        date_precision = 'month'
        and event_date is not null
        and extract(day from event_date) = 1
      )
      or (
        date_precision = 'year'
        and event_date is not null
        and extract(month from event_date) = 1
        and extract(day from event_date) = 1
      )
    ),
  constraint events_geography_not_blank
    check (geography is null or btrim(geography) <> ''),
  constraint events_brazil_relevance_not_blank
    check (btrim(brazil_relevance) <> ''),
  constraint events_verification_level_valid
    check (
      verification_level in (
        'unverified',
        'confirmed',
        'corroborated',
        'reported',
        'analysis'
      )
    ),
  constraint events_workflow_status_valid
    check (
      workflow_status in (
        'candidate',
        'under_review',
        'accepted',
        'rejected',
        'superseded'
      )
    ),
  constraint events_accepted_must_be_verified
    check (
      workflow_status <> 'accepted'
      or verification_level <> 'unverified'
    ),
  constraint events_fingerprint_not_blank
    check (event_fingerprint is null or btrim(event_fingerprint) <> ''),
  constraint events_fingerprint_unique
    unique (event_fingerprint),
  constraint events_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.events is
  'Acontecimentos canônicos relevantes para a mobilidade elétrica no Brasil.';

comment on column public.events.event_type is
  'Classificação temática do acontecimento.';

comment on column public.events.event_phase is
  'Etapa temporal distinguida como anúncio, aprovação, publicação, vigência, realização ou atualização.';

comment on column public.events.event_date is
  'Data do acontecimento ou início do período indicado por date_precision.';

comment on column public.events.date_precision is
  'Precisão conhecida da data: dia, mês, ano ou desconhecida.';

comment on column public.events.brazil_relevance is
  'Explicação da relação material do acontecimento com o mercado brasileiro.';

comment on column public.events.verification_level is
  'Nível de suporte disponível conforme a metodologia do ChargeBR.';

comment on column public.events.workflow_status is
  'Estado do registro no fluxo de triagem, revisão e aceitação.';

create index events_workflow_date_idx
  on public.events (workflow_status, event_date desc nulls last);

create index events_type_date_idx
  on public.events (event_type, event_date desc nulls last);

alter table public.events enable row level security;

revoke all on table public.events from public, anon, authenticated;
revoke all on sequence public.events_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.events
  to service_role;

grant usage, select
  on sequence public.events_id_seq
  to service_role;
