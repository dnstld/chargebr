create table public.evidence (
  id bigint generated always as identity primary key,
  observation_id bigint not null,
  origin_content_item_id bigint,
  origin_source_id bigint,
  lineage_key text not null,
  lineage_status text not null default 'unknown',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint evidence_observation_id_fkey
    foreign key (observation_id)
    references public.observations (id)
    on delete restrict,
  constraint evidence_origin_content_item_id_fkey
    foreign key (origin_content_item_id)
    references public.content_items (id)
    on delete restrict,
  constraint evidence_origin_source_id_fkey
    foreign key (origin_source_id)
    references public.sources (id)
    on delete restrict,
  constraint evidence_lineage_key_not_blank
    check (btrim(lineage_key) <> ''),
  constraint evidence_lineage_status_valid
    check (
      lineage_status in (
        'established',
        'likely_shared',
        'unknown',
        'disputed'
      )
    ),
  constraint evidence_origin_reference_exclusive
    check (num_nonnulls(origin_content_item_id, origin_source_id) <= 1),
  constraint evidence_established_origin_required
    check (
      lineage_status <> 'established'
      or num_nonnulls(origin_content_item_id, origin_source_id) = 1
    ),
  constraint evidence_notes_not_blank
    check (notes is null or btrim(notes) <> ''),
  constraint evidence_observation_lineage_unique
    unique (observation_id, lineage_key)
);

comment on table public.evidence is
  'Registros de proveniência que documentam a linhagem de observações.';

comment on column public.evidence.origin_content_item_id is
  'Item de conteúdo de origem quando a publicação exata é conhecida.';

comment on column public.evidence.origin_source_id is
  'Fonte de origem quando a publicação exata ainda não foi identificada.';

comment on column public.evidence.lineage_key is
  'Identificador estável usado para agrupar registros da mesma linhagem.';

comment on column public.evidence.lineage_status is
  'Grau de certeza sobre a origem e a linhagem da observação.';

create index evidence_origin_content_item_id_idx
  on public.evidence (origin_content_item_id)
  where origin_content_item_id is not null;

create index evidence_origin_source_id_idx
  on public.evidence (origin_source_id)
  where origin_source_id is not null;

create index evidence_lineage_key_idx
  on public.evidence (lineage_key);

alter table public.evidence enable row level security;

revoke all on table public.evidence from public, anon, authenticated;
revoke all on sequence public.evidence_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.evidence
  to service_role;

grant usage, select
  on sequence public.evidence_id_seq
  to service_role;
