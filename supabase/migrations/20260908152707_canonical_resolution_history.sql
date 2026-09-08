create table public.content_item_relations (
  earlier_content_item_id bigint not null,
  later_content_item_id bigint not null,
  relationship_type text not null,
  relationship_date date not null,
  evidence_id bigint not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint content_item_relations_pkey
    primary key (
      earlier_content_item_id,
      later_content_item_id,
      relationship_type
    ),
  constraint content_item_relations_earlier_id_fkey
    foreign key (earlier_content_item_id)
    references public.content_items (id)
    on delete restrict,
  constraint content_item_relations_later_id_fkey
    foreign key (later_content_item_id)
    references public.content_items (id)
    on delete restrict,
  constraint content_item_relations_evidence_id_fkey
    foreign key (evidence_id)
    references public.evidence (id)
    on delete restrict,
  constraint content_item_relations_distinct_items
    check (earlier_content_item_id <> later_content_item_id),
  constraint content_item_relations_type_valid
    check (
      relationship_type in (
        'corrects',
        'revises',
        'replaces'
      )
    ),
  constraint content_item_relations_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.content_item_relations is
  'Relaciona versões de conteúdo e declara como a versão posterior afeta a anterior.';

comment on column public.content_item_relations.earlier_content_item_id is
  'Versão anterior do conteúdo relacionado.';

comment on column public.content_item_relations.later_content_item_id is
  'Versão posterior que corrige, revisa ou substitui a anterior.';

comment on column public.content_item_relations.relationship_type is
  'Efeito direcionado da versão posterior sobre a anterior.';

comment on column public.content_item_relations.relationship_date is
  'Data declarada da correção, revisão ou substituição.';

comment on column public.content_item_relations.evidence_id is
  'Evidência que sustenta a relação entre as versões.';

comment on column public.content_item_relations.notes is
  'Limitações ou contexto adicional da relação.';

comment on column public.content_item_relations.created_at is
  'Instante de criação do registro no ChargeBR.';

create index content_item_relations_later_id_idx
  on public.content_item_relations (later_content_item_id);

create index content_item_relations_evidence_id_idx
  on public.content_item_relations (evidence_id);

alter table public.content_item_relations enable row level security;

revoke all on table public.content_item_relations
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.content_item_relations
  to service_role;

create table public.metric_value_resolutions (
  id bigint generated always as identity primary key,
  resolution_key text not null,
  resolution_type text not null,
  resolution_event_id bigint not null,
  reviewer_name text not null,
  reviewed_on date not null,
  decision_reference text not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_value_resolutions_key_unique
    unique (resolution_key),
  constraint metric_value_resolutions_event_id_fkey
    foreign key (resolution_event_id)
    references public.events (id)
    on delete restrict,
  constraint metric_value_resolutions_key_not_blank
    check (btrim(resolution_key) <> ''),
  constraint metric_value_resolutions_type_valid
    check (
      resolution_type in (
        'material_correction',
        'methodology_revision',
        'coverage_update',
        'formal_replacement'
      )
    ),
  constraint metric_value_resolutions_reviewer_not_blank
    check (btrim(reviewer_name) <> ''),
  constraint metric_value_resolutions_reference_not_blank
    check (btrim(decision_reference) <> ''),
  constraint metric_value_resolutions_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.metric_value_resolutions is
  'Decisões canônicas que resolvem conflitos entre valores métricos.';

comment on column public.metric_value_resolutions.id is
  'Identificador interno da resolução canônica.';

comment on column public.metric_value_resolutions.resolution_key is
  'Identificador estável da resolução no fluxo do ChargeBR.';

comment on column public.metric_value_resolutions.resolution_type is
  'Natureza da correção, revisão, atualização ou substituição.';

comment on column public.metric_value_resolutions.resolution_event_id is
  'Acontecimento da fonte que sustenta a resolução.';

comment on column public.metric_value_resolutions.reviewer_name is
  'Pessoa que aceitou a representação canônica.';

comment on column public.metric_value_resolutions.reviewed_on is
  'Data do aceite canônico pelo ChargeBR.';

comment on column public.metric_value_resolutions.decision_reference is
  'Referência ao documento ou à revisão em que ocorreu o aceite.';

comment on column public.metric_value_resolutions.notes is
  'Limitações ou contexto adicional da resolução.';

comment on column public.metric_value_resolutions.created_at is
  'Instante de criação do registro no ChargeBR.';

create index metric_value_resolutions_event_id_idx
  on public.metric_value_resolutions (resolution_event_id);

alter table public.metric_value_resolutions enable row level security;

revoke all on table public.metric_value_resolutions
  from public, anon, authenticated, service_role;
revoke all on sequence public.metric_value_resolutions_id_seq
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_value_resolutions
  to service_role;

grant usage, select
  on sequence public.metric_value_resolutions_id_seq
  to service_role;

create table public.metric_value_status_transitions (
  id bigint generated always as identity primary key,
  transition_key text not null,
  resolution_id bigint not null,
  metric_value_id bigint not null,
  transition_order integer not null,
  from_status text not null,
  to_status text not null,
  replacement_metric_value_id bigint,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_value_status_transitions_key_unique
    unique (transition_key),
  constraint metric_value_status_transitions_resolution_id_fkey
    foreign key (resolution_id)
    references public.metric_value_resolutions (id)
    on delete restrict,
  constraint metric_value_status_transitions_metric_id_fkey
    foreign key (metric_value_id)
    references public.metric_values (id)
    on delete restrict,
  constraint metric_value_status_transitions_replacement_id_fkey
    foreign key (replacement_metric_value_id)
    references public.metric_values (id)
    on delete restrict,
  constraint metric_value_status_transitions_key_not_blank
    check (btrim(transition_key) <> ''),
  constraint metric_value_status_transitions_order_positive
    check (transition_order > 0),
  constraint metric_value_status_transitions_statuses_valid
    check (
      from_status in (
        'provisional',
        'validated',
        'superseded',
        'rejected'
      )
      and to_status in (
        'provisional',
        'validated',
        'superseded',
        'rejected'
      )
    ),
  constraint metric_value_status_transitions_status_changes
    check (from_status <> to_status),
  constraint metric_value_status_transitions_distinct_replacement
    check (
      replacement_metric_value_id is null
      or replacement_metric_value_id <> metric_value_id
    ),
  constraint metric_value_status_transitions_validated_without_replacement
    check (
      to_status <> 'validated'
      or replacement_metric_value_id is null
    ),
  constraint metric_value_status_transitions_superseded_with_replacement
    check (
      to_status <> 'superseded'
      or replacement_metric_value_id is not null
    ),
  constraint metric_value_status_transitions_notes_not_blank
    check (notes is null or btrim(notes) <> ''),
  constraint metric_value_status_transitions_resolution_metric_unique
    unique (resolution_id, metric_value_id),
  constraint metric_value_status_transitions_metric_order_unique
    unique (metric_value_id, transition_order)
);

comment on table public.metric_value_status_transitions is
  'Histórico ordenado das mudanças semânticas de situação de valores métricos.';

comment on column public.metric_value_status_transitions.id is
  'Identificador interno da transição.';

comment on column public.metric_value_status_transitions.transition_key is
  'Identificador estável da transição no fluxo do ChargeBR.';

comment on column public.metric_value_status_transitions.resolution_id is
  'Resolução canônica que autorizou a mudança.';

comment on column public.metric_value_status_transitions.metric_value_id is
  'Valor métrico cuja situação foi alterada.';

comment on column public.metric_value_status_transitions.transition_order is
  'Ordem semântica positiva e contínua das mudanças daquele valor.';

comment on column public.metric_value_status_transitions.from_status is
  'Situação imediatamente anterior à mudança.';

comment on column public.metric_value_status_transitions.to_status is
  'Situação resultante da mudança.';

comment on column public.metric_value_status_transitions.replacement_metric_value_id is
  'Valor que substitui ou corrige o afetado, quando aplicável.';

comment on column public.metric_value_status_transitions.notes is
  'Limitações ou contexto adicional da transição.';

comment on column public.metric_value_status_transitions.created_at is
  'Instante de criação do registro no ChargeBR.';

create index metric_value_status_transitions_replacement_id_idx
  on public.metric_value_status_transitions (replacement_metric_value_id)
  where replacement_metric_value_id is not null;

alter table public.metric_value_status_transitions enable row level security;

revoke all on table public.metric_value_status_transitions
  from public, anon, authenticated, service_role;
revoke all on sequence public.metric_value_status_transitions_id_seq
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_value_status_transitions
  to service_role;

grant usage, select
  on sequence public.metric_value_status_transitions_id_seq
  to service_role;

comment on column public.metric_values.value_status is
  'Situação atual do valor; o histórico de mudanças fica em metric_value_status_transitions.';
