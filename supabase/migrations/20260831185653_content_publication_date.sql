alter table public.content_items
  add column published_on date,
  add constraint content_items_publication_date_exclusive
    check (num_nonnulls(published_on, published_at) <= 1);

comment on column public.content_items.published_on is
  'Data de publicação quando a fonte informa o dia, mas não um horário.';

comment on column public.content_items.published_at is
  'Instante de publicação quando a fonte informa horário suficiente.';

create index content_items_source_published_on_idx
  on public.content_items (source_id, published_on desc)
  where published_on is not null;
