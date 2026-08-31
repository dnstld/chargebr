create table public.event_evidence (
  event_id bigint not null,
  evidence_id bigint not null,
  relationship_type text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_evidence_pkey
    primary key (event_id, evidence_id),
  constraint event_evidence_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on delete restrict,
  constraint event_evidence_evidence_id_fkey
    foreign key (evidence_id)
    references public.evidence (id)
    on delete restrict,
  constraint event_evidence_relationship_type_valid
    check (
      relationship_type in (
        'supports',
        'contradicts',
        'contextualizes'
      )
    ),
  constraint event_evidence_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.event_evidence is
  'Associa evidências a eventos e registra o papel de cada evidência.';

comment on column public.event_evidence.relationship_type is
  'Indica se a evidência sustenta, contradiz ou contextualiza o evento.';

create index event_evidence_evidence_id_idx
  on public.event_evidence (evidence_id);

alter table public.event_evidence enable row level security;

revoke all on table public.event_evidence
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.event_evidence
  to service_role;
