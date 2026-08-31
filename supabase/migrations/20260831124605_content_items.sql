create table public.content_items (
  id bigint generated always as identity primary key,
  source_id bigint not null,
  url text not null,
  title text not null,
  content_type text not null,
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  author_name text,
  language_code text,
  section_name text,
  publication_nature text not null default 'unknown',
  content_fingerprint text,
  retention_class text not null default 'metadata_only',
  evidentiary_excerpt text,
  raw_capture_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint content_items_source_id_fkey
    foreign key (source_id)
    references public.sources (id)
    on delete restrict,
  constraint content_items_url_not_blank
    check (btrim(url) <> ''),
  constraint content_items_title_not_blank
    check (btrim(title) <> ''),
  constraint content_items_content_type_valid
    check (
      content_type in (
        'article',
        'press_release',
        'regulatory_document',
        'dataset_release',
        'report',
        'public_notice',
        'social_post',
        'web_page',
        'other'
      )
    ),
  constraint content_items_publication_nature_valid
    check (
      publication_nature in (
        'original',
        'syndicated',
        'sponsored',
        'unknown'
      )
    ),
  constraint content_items_retention_class_valid
    check (
      retention_class in (
        'metadata_only',
        'minimum_excerpt',
        'full_document',
        'external_reference'
      )
    ),
  constraint content_items_language_code_not_blank
    check (language_code is null or btrim(language_code) <> ''),
  constraint content_items_fingerprint_not_blank
    check (
      content_fingerprint is null
      or btrim(content_fingerprint) <> ''
    ),
  constraint content_items_excerpt_not_blank
    check (
      evidentiary_excerpt is null
      or btrim(evidentiary_excerpt) <> ''
    ),
  constraint content_items_raw_capture_reference_not_blank
    check (
      raw_capture_reference is null
      or btrim(raw_capture_reference) <> ''
    ),
  constraint content_items_metadata_only_without_content
    check (
      retention_class <> 'metadata_only'
      or (
        evidentiary_excerpt is null
        and raw_capture_reference is null
      )
    ),
  constraint content_items_source_url_fingerprint_unique
    unique (source_id, url, content_fingerprint)
);

comment on table public.content_items is
  'Publicações ou documentos específicos coletados de uma fonte.';

comment on column public.content_items.publication_nature is
  'Indica se o item é original, sindicado, patrocinado ou desconhecido.';

comment on column public.content_items.content_fingerprint is
  'Hash ou identificador equivalente usado para detectar conteúdo repetido.';

comment on column public.content_items.retention_class is
  'Tratamento de retenção aplicado ao conteúdo coletado.';

create index content_items_source_published_at_idx
  on public.content_items (source_id, published_at desc);

alter table public.content_items enable row level security;

revoke all on table public.content_items from public, anon, authenticated;
revoke all on sequence public.content_items_id_seq
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.content_items
  to service_role;

grant usage, select
  on sequence public.content_items_id_seq
  to service_role;
