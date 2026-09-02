create table public.regulatory_instrument_relations (
  source_instrument_id bigint not null,
  target_instrument_id bigint not null,
  relationship_type text not null,
  establishing_event_id bigint not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint regulatory_instrument_relations_pkey
    primary key (
      source_instrument_id,
      target_instrument_id,
      relationship_type
    ),
  constraint regulatory_instrument_relations_source_id_fkey
    foreign key (source_instrument_id)
    references public.regulatory_instruments (id)
    on delete restrict,
  constraint regulatory_instrument_relations_target_id_fkey
    foreign key (target_instrument_id)
    references public.regulatory_instruments (id)
    on delete restrict,
  constraint regulatory_instrument_relations_event_id_fkey
    foreign key (establishing_event_id)
    references public.events (id)
    on delete restrict,
  constraint regulatory_instrument_relations_distinct_instruments
    check (source_instrument_id <> target_instrument_id),
  constraint regulatory_instrument_relations_type_valid
    check (
      relationship_type in (
        'convalidates_acts_based_on',
        'regulates_program_established_by'
      )
    ),
  constraint regulatory_instrument_relations_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.regulatory_instrument_relations is
  'Registra relações direcionais e sustentadas entre instrumentos regulatórios.';

comment on column public.regulatory_instrument_relations.source_instrument_id is
  'Instrumento cujo texto estabelece ou expressa a relação.';

comment on column public.regulatory_instrument_relations.target_instrument_id is
  'Instrumento anterior citado ou alcançado pela relação.';

comment on column public.regulatory_instrument_relations.relationship_type is
  'Significado direcional e preciso da relação entre os instrumentos.';

comment on column public.regulatory_instrument_relations.establishing_event_id is
  'Acontecimento que fornece data e caminho para as evidências da relação.';

create index regulatory_instrument_relations_target_id_idx
  on public.regulatory_instrument_relations (target_instrument_id);

create index regulatory_instrument_relations_event_id_idx
  on public.regulatory_instrument_relations (establishing_event_id);

alter table public.regulatory_instrument_relations enable row level security;

revoke all on table public.regulatory_instrument_relations
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.regulatory_instrument_relations
  to service_role;
