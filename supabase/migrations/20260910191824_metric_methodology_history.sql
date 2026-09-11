create table public.metric_methodology_versions (
  id bigint generated always as identity primary key,
  methodology_key text not null,
  metric_definition_id bigint not null,
  name text not null,
  description text not null,
  applies_from date,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_methodology_versions_key_unique
    unique (methodology_key),
  constraint metric_methodology_versions_definition_id_fkey
    foreign key (metric_definition_id)
    references public.metric_definitions (id)
    on delete restrict,
  constraint metric_methodology_versions_key_not_blank
    check (btrim(methodology_key) <> ''),
  constraint metric_methodology_versions_key_format
    check (methodology_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint metric_methodology_versions_name_not_blank
    check (btrim(name) <> ''),
  constraint metric_methodology_versions_description_not_blank
    check (btrim(description) <> ''),
  constraint metric_methodology_versions_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.metric_methodology_versions is
  'Versões imutáveis das metodologias usadas para produzir valores de métricas canônicas.';

comment on column public.metric_methodology_versions.id is
  'Identificador interno da versão metodológica.';

comment on column public.metric_methodology_versions.methodology_key is
  'Identificador estável e legível da versão metodológica.';

comment on column public.metric_methodology_versions.metric_definition_id is
  'Métrica conceitual à qual a versão metodológica pertence.';

comment on column public.metric_methodology_versions.name is
  'Rótulo humano da versão metodológica.';

comment on column public.metric_methodology_versions.description is
  'Descrição resumida das regras da versão metodológica.';

comment on column public.metric_methodology_versions.applies_from is
  'Primeiro período de aplicação conhecido; nulo quando a fonte não informa o início.';

comment on column public.metric_methodology_versions.notes is
  'Limitações ou contexto adicional da versão metodológica.';

comment on column public.metric_methodology_versions.created_at is
  'Instante de criação do registro no ChargeBR.';

create index metric_methodology_versions_definition_applies_idx
  on public.metric_methodology_versions (
    metric_definition_id,
    applies_from
  );

alter table public.metric_methodology_versions enable row level security;

revoke all on table public.metric_methodology_versions
  from public, anon, authenticated, service_role;
revoke all on sequence public.metric_methodology_versions_id_seq
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_methodology_versions
  to service_role;

grant usage, select
  on sequence public.metric_methodology_versions_id_seq
  to service_role;

create table public.metric_methodology_components (
  methodology_version_id bigint not null,
  component_key text not null,
  component_name text not null,
  component_role text not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_methodology_components_pkey
    primary key (methodology_version_id, component_key),
  constraint metric_methodology_components_version_id_fkey
    foreign key (methodology_version_id)
    references public.metric_methodology_versions (id)
    on delete restrict,
  constraint metric_methodology_components_key_not_blank
    check (btrim(component_key) <> ''),
  constraint metric_methodology_components_key_format
    check (component_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint metric_methodology_components_name_not_blank
    check (btrim(component_name) <> ''),
  constraint metric_methodology_components_role_valid
    check (
      component_role in (
        'included',
        'excluded',
        'reported_separately'
      )
    ),
  constraint metric_methodology_components_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.metric_methodology_components is
  'Tratamento estruturado das categorias que compõem uma versão metodológica.';

comment on column public.metric_methodology_components.methodology_version_id is
  'Versão metodológica que classifica o componente.';

comment on column public.metric_methodology_components.component_key is
  'Identificador estável do componente dentro da versão metodológica.';

comment on column public.metric_methodology_components.component_name is
  'Nome do componente exibido ao usuário.';

comment on column public.metric_methodology_components.component_role is
  'Indica se o componente é incluído, excluído ou publicado separadamente.';

comment on column public.metric_methodology_components.notes is
  'Limitações ou contexto adicional do tratamento do componente.';

comment on column public.metric_methodology_components.created_at is
  'Instante de criação do registro no ChargeBR.';

alter table public.metric_methodology_components enable row level security;

revoke all on table public.metric_methodology_components
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_methodology_components
  to service_role;

create table public.metric_methodology_evidence (
  methodology_version_id bigint not null,
  evidence_id bigint not null,
  relationship_type text not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_methodology_evidence_pkey
    primary key (
      methodology_version_id,
      evidence_id,
      relationship_type
    ),
  constraint metric_methodology_evidence_version_id_fkey
    foreign key (methodology_version_id)
    references public.metric_methodology_versions (id)
    on delete restrict,
  constraint metric_methodology_evidence_evidence_id_fkey
    foreign key (evidence_id)
    references public.evidence (id)
    on delete restrict,
  constraint metric_methodology_evidence_type_valid
    check (
      relationship_type in (
        'defines',
        'announces',
        'confirms',
        'contextualizes'
      )
    ),
  constraint metric_methodology_evidence_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.metric_methodology_evidence is
  'Evidências que definem, anunciam, confirmam ou contextualizam versões metodológicas.';

comment on column public.metric_methodology_evidence.methodology_version_id is
  'Versão metodológica apoiada pela evidência.';

comment on column public.metric_methodology_evidence.evidence_id is
  'Evidência ligada à versão metodológica.';

comment on column public.metric_methodology_evidence.relationship_type is
  'Papel da evidência em relação à versão metodológica.';

comment on column public.metric_methodology_evidence.notes is
  'Limitações ou contexto adicional do vínculo probatório.';

comment on column public.metric_methodology_evidence.created_at is
  'Instante de criação do vínculo no ChargeBR.';

create index metric_methodology_evidence_evidence_id_idx
  on public.metric_methodology_evidence (evidence_id);

alter table public.metric_methodology_evidence enable row level security;

revoke all on table public.metric_methodology_evidence
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_methodology_evidence
  to service_role;

create table public.metric_methodology_relations (
  earlier_methodology_version_id bigint not null,
  later_methodology_version_id bigint not null,
  relationship_type text not null,
  effective_on date not null,
  evidence_id bigint not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_methodology_relations_pkey
    primary key (
      earlier_methodology_version_id,
      later_methodology_version_id,
      relationship_type
    ),
  constraint metric_methodology_relations_earlier_id_fkey
    foreign key (earlier_methodology_version_id)
    references public.metric_methodology_versions (id)
    on delete restrict,
  constraint metric_methodology_relations_later_id_fkey
    foreign key (later_methodology_version_id)
    references public.metric_methodology_versions (id)
    on delete restrict,
  constraint metric_methodology_relations_evidence_id_fkey
    foreign key (evidence_id)
    references public.evidence (id)
    on delete restrict,
  constraint metric_methodology_relations_distinct_versions
    check (earlier_methodology_version_id <> later_methodology_version_id),
  constraint metric_methodology_relations_type_valid
    check (relationship_type = 'supersedes'),
  constraint metric_methodology_relations_earlier_unique
    unique (earlier_methodology_version_id),
  constraint metric_methodology_relations_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.metric_methodology_relations is
  'Relações imutáveis de substituição entre versões metodológicas da mesma métrica.';

comment on column public.metric_methodology_relations.earlier_methodology_version_id is
  'Versão anterior que deixa de orientar a série principal.';

comment on column public.metric_methodology_relations.later_methodology_version_id is
  'Versão posterior que passa a orientar a série principal.';

comment on column public.metric_methodology_relations.relationship_type is
  'Efeito direcionado da versão posterior sobre a anterior.';

comment on column public.metric_methodology_relations.effective_on is
  'Data a partir da qual a substituição metodológica produz efeito.';

comment on column public.metric_methodology_relations.evidence_id is
  'Evidência que sustenta a substituição e sua vigência.';

comment on column public.metric_methodology_relations.notes is
  'Limitações ou contexto adicional da relação metodológica.';

comment on column public.metric_methodology_relations.created_at is
  'Instante de criação da relação no ChargeBR.';

create index metric_methodology_relations_later_id_idx
  on public.metric_methodology_relations (later_methodology_version_id);

create index metric_methodology_relations_evidence_id_idx
  on public.metric_methodology_relations (evidence_id);

alter table public.metric_methodology_relations enable row level security;

revoke all on table public.metric_methodology_relations
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_methodology_relations
  to service_role;

create table public.metric_value_methodology_assignments (
  metric_value_id bigint primary key,
  methodology_version_id bigint not null,
  value_origin text not null,
  value_role text not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint metric_value_methodology_assignments_value_id_fkey
    foreign key (metric_value_id)
    references public.metric_values (id)
    on delete restrict,
  constraint metric_value_methodology_assignments_version_id_fkey
    foreign key (methodology_version_id)
    references public.metric_methodology_versions (id)
    on delete restrict,
  constraint metric_value_methodology_assignments_origin_valid
    check (value_origin = 'source_published'),
  constraint metric_value_methodology_assignments_role_valid
    check (value_role in ('primary', 'counterfactual')),
  constraint metric_value_methodology_assignments_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.metric_value_methodology_assignments is
  'Atribui uma versão metodológica e um papel documental a valores métricos revisados.';

comment on column public.metric_value_methodology_assignments.metric_value_id is
  'Valor métrico que recebeu atribuição metodológica formal.';

comment on column public.metric_value_methodology_assignments.methodology_version_id is
  'Versão metodológica usada para produzir o valor.';

comment on column public.metric_value_methodology_assignments.value_origin is
  'Origem do número; inicialmente somente valores publicados pela fonte são permitidos.';

comment on column public.metric_value_methodology_assignments.value_role is
  'Papel do valor na publicação: resultado principal ou comparação contrafactual.';

comment on column public.metric_value_methodology_assignments.notes is
  'Limitações ou contexto adicional da atribuição metodológica.';

comment on column public.metric_value_methodology_assignments.created_at is
  'Instante de criação da atribuição no ChargeBR.';

create index metric_value_methodology_assignments_version_role_idx
  on public.metric_value_methodology_assignments (
    methodology_version_id,
    value_role
  );

alter table public.metric_value_methodology_assignments enable row level security;

revoke all on table public.metric_value_methodology_assignments
  from public, anon, authenticated, service_role;

grant select, insert
  on table public.metric_value_methodology_assignments
  to service_role;
