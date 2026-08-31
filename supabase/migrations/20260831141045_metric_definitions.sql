create table public.metric_definitions (
  id bigint generated always as identity primary key,
  metric_key text not null,
  name text not null,
  description text not null,
  metric_domain text not null,
  value_type text not null,
  canonical_unit text not null,
  aggregation_type text not null,
  temporal_granularity text not null,
  geographic_granularity text not null,
  status text not null default 'candidate',
  methodology_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint metric_definitions_key_not_blank
    check (btrim(metric_key) <> ''),
  constraint metric_definitions_key_format
    check (metric_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint metric_definitions_key_unique
    unique (metric_key),
  constraint metric_definitions_name_not_blank
    check (btrim(name) <> ''),
  constraint metric_definitions_description_not_blank
    check (btrim(description) <> ''),
  constraint metric_definitions_domain_valid
    check (
      metric_domain in (
        'vehicle_market',
        'charging_infrastructure',
        'energy_grid',
        'regulation',
        'investment',
        'operations',
        'environment',
        'other'
      )
    ),
  constraint metric_definitions_value_type_valid
    check (
      value_type in (
        'integer',
        'decimal',
        'percentage',
        'currency',
        'duration',
        'index'
      )
    ),
  constraint metric_definitions_canonical_unit_not_blank
    check (btrim(canonical_unit) <> ''),
  constraint metric_definitions_canonical_unit_format
    check (canonical_unit ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint metric_definitions_aggregation_type_valid
    check (
      aggregation_type in (
        'sum',
        'count',
        'average',
        'median',
        'minimum',
        'maximum',
        'latest',
        'cumulative',
        'ratio',
        'none'
      )
    ),
  constraint metric_definitions_temporal_granularity_valid
    check (
      temporal_granularity in (
        'event',
        'day',
        'week',
        'month',
        'quarter',
        'year',
        'irregular'
      )
    ),
  constraint metric_definitions_geographic_granularity_valid
    check (
      geographic_granularity in (
        'national',
        'state',
        'district',
        'municipal',
        'site',
        'organization',
        'other',
        'not_applicable'
      )
    ),
  constraint metric_definitions_status_valid
    check (status in ('candidate', 'approved', 'deprecated')),
  constraint metric_definitions_methodology_notes_not_blank
    check (
      methodology_notes is null
      or btrim(methodology_notes) <> ''
    )
);

comment on table public.metric_definitions is
  'Catálogo canônico das métricas acompanhadas pelo ChargeBR.';

comment on column public.metric_definitions.metric_key is
  'Identificador estável e legível da métrica.';

comment on column public.metric_definitions.canonical_unit is
  'Unidade técnica usada para armazenar e comparar valores da métrica.';

comment on column public.metric_definitions.aggregation_type is
  'Regra semântica de agregação aplicável à métrica.';

comment on column public.metric_definitions.temporal_granularity is
  'Menor granularidade temporal prevista para a métrica.';

comment on column public.metric_definitions.geographic_granularity is
  'Menor granularidade geográfica prevista para a métrica.';

create index metric_definitions_domain_status_idx
  on public.metric_definitions (metric_domain, status);

alter table public.metric_definitions enable row level security;

revoke all on table public.metric_definitions
  from public, anon, authenticated;
revoke all on sequence public.metric_definitions_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.metric_definitions
  to service_role;

grant usage, select
  on sequence public.metric_definitions_id_seq
  to service_role;
