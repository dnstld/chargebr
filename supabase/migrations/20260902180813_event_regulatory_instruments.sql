create table public.event_regulatory_instruments (
  event_id bigint not null,
  regulatory_instrument_id bigint not null,
  instrument_role text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_regulatory_instruments_pkey
    primary key (event_id, regulatory_instrument_id, instrument_role),
  constraint event_regulatory_instruments_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on delete restrict,
  constraint event_regulatory_instruments_instrument_id_fkey
    foreign key (regulatory_instrument_id)
    references public.regulatory_instruments (id)
    on delete restrict,
  constraint event_regulatory_instruments_role_valid
    check (instrument_role in ('subject')),
  constraint event_regulatory_instruments_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.event_regulatory_instruments is
  'Associa acontecimentos aos instrumentos regulatórios que constituem seu objeto central.';

comment on column public.event_regulatory_instruments.instrument_role is
  'Papel contextual do instrumento no acontecimento; inicialmente, apenas objeto central.';

create index event_regulatory_instruments_instrument_id_idx
  on public.event_regulatory_instruments (regulatory_instrument_id);

alter table public.event_regulatory_instruments enable row level security;

revoke all on table public.event_regulatory_instruments
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.event_regulatory_instruments
  to service_role;
