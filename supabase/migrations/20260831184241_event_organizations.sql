create table public.event_organizations (
  event_id bigint not null,
  organization_id bigint not null,
  event_role text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_organizations_pkey
    primary key (event_id, organization_id, event_role),
  constraint event_organizations_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on delete restrict,
  constraint event_organizations_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,
  constraint event_organizations_event_role_valid
    check (event_role in ('subject')),
  constraint event_organizations_notes_not_blank
    check (notes is null or btrim(notes) <> '')
);

comment on table public.event_organizations is
  'Associa organizações a eventos e registra seu papel contextual.';

comment on column public.event_organizations.event_role is
  'Papel da organização no evento; inicialmente, apenas sujeito central.';

create index event_organizations_organization_id_idx
  on public.event_organizations (organization_id);

alter table public.event_organizations enable row level security;

revoke all on table public.event_organizations
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.event_organizations
  to service_role;
