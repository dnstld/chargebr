create table public.metric_values (
  id bigint generated always as identity primary key,
  metric_definition_id bigint not null,
  observation_id bigint not null,
  numeric_value numeric not null,
  period_start date not null,
  period_end date not null,
  geography text,
  value_status text not null default 'provisional',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint metric_values_metric_definition_id_fkey
    foreign key (metric_definition_id)
    references public.metric_definitions (id)
    on delete restrict,
  constraint metric_values_observation_id_fkey
    foreign key (observation_id)
    references public.observations (id)
    on delete restrict,
  constraint metric_values_period_valid
    check (period_end >= period_start),
  constraint metric_values_geography_not_blank
    check (
      geography is null
      or btrim(geography) <> ''
    ),
  constraint metric_values_status_valid
    check (
      value_status in (
        'provisional',
        'validated',
        'superseded',
        'rejected'
      )
    ),
  constraint metric_values_notes_not_blank
    check (
      notes is null
      or btrim(notes) <> ''
    ),
  constraint metric_values_scope_unique
    unique nulls not distinct (
      metric_definition_id,
      observation_id,
      period_start,
      period_end,
      geography
    )
);

comment on table public.metric_values is
  'Valores normalizados de métricas com proveniência em observações.';

comment on column public.metric_values.metric_definition_id is
  'Métrica canônica à qual o valor pertence.';

comment on column public.metric_values.observation_id is
  'Observação de origem que sustenta o valor.';

comment on column public.metric_values.numeric_value is
  'Valor armazenado na unidade canônica definida para a métrica.';

comment on column public.metric_values.period_start is
  'Início do período de referência; igual ao fim para medições pontuais.';

comment on column public.metric_values.period_end is
  'Fim inclusivo do período de referência.';

comment on column public.metric_values.geography is
  'Recorte geográfico textual do valor, quando aplicável.';

create index metric_values_metric_period_idx
  on public.metric_values (metric_definition_id, period_start desc);

create index metric_values_observation_id_idx
  on public.metric_values (observation_id);

alter table public.metric_values enable row level security;

revoke all on table public.metric_values
  from public, anon, authenticated;
revoke all on sequence public.metric_values_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.metric_values
  to service_role;

grant usage, select
  on sequence public.metric_values_id_seq
  to service_role;
