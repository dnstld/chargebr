BEGIN;
SELECT plan(16);

insert into public.sources (
  name,
  slug,
  homepage_url,
  source_type,
  status,
  country_code,
  language_codes,
  is_primary_source
)
values
  (
    'ABVE test fixture',
    'abve',
    'https://abve.example.test',
    'industry_association',
    'approved',
    'BR',
    array['pt-BR'],
    true
  ),
  (
    'ANEEL test fixture',
    'aneel',
    'https://aneel.example.test',
    'government_regulator',
    'approved',
    'BR',
    array['pt-BR'],
    true
  ),
  (
    'Forbidden collector fixture',
    'collector-forbidden',
    'https://forbidden.example.test',
    'discovery',
    'candidate',
    'BR',
    array['pt-BR'],
    false
  );

insert into public.source_endpoints (
  source_id,
  endpoint_key,
  name,
  endpoint_url,
  endpoint_type,
  response_format,
  status,
  request_config,
  identity_rule,
  normalization_profile,
  access_reviewed_at
)
select
  s.id,
  fixture.endpoint_key,
  fixture.name,
  fixture.endpoint_url,
  'api',
  'json',
  'active',
  '{"timeout_ms": 1000, "max_response_bytes": 1000}'::jsonb,
  '{"version": "collector-test-v1", "primary": {"fields": ["id"]}}'::jsonb,
  'collector-test-v1',
  timestamptz '2026-09-29T21:45:00Z'
from (
  values
    (
      'abve',
      'abve-news-wordpress-posts',
      'ABVE test endpoint',
      'https://abve.example.test/posts'
    ),
    (
      'aneel',
      'aneel-board-meetings-index',
      'ANEEL test endpoint',
      'https://aneel.example.test/meetings'
    ),
    (
      'collector-forbidden',
      'collector-forbidden-endpoint',
      'Forbidden test endpoint',
      'https://forbidden.example.test/items'
    )
) as fixture(source_slug, endpoint_key, name, endpoint_url)
join public.sources s on s.slug = fixture.source_slug;

do $$
declare
  forbidden_endpoint_id bigint;
begin
  select id
  into forbidden_endpoint_id
  from public.source_endpoints
  where endpoint_key = 'collector-forbidden-endpoint';

  perform set_config(
    'collector_test.forbidden_endpoint_id',
    forbidden_endpoint_id::text,
    true
  );
end
$$;

insert into public.collection_runs (
  source_endpoint_id,
  run_key,
  started_at,
  last_heartbeat_at,
  stale_after_at,
  initiated_by,
  collector_name,
  collector_version,
  contract_version,
  config_fingerprint
)
select
  se.id,
  uuid '00000000-0000-4000-8000-000000000001',
  timestamptz '2026-09-29T21:45:00Z',
  timestamptz '2026-09-29T21:45:00Z',
  timestamptz '2026-09-29T21:50:00Z',
  'collector-test',
  'chargebr-local-collector',
  repeat('1', 40),
  'chargebr-local-collector-contract-v1',
  repeat('0', 64)
from public.source_endpoints se
where se.endpoint_key = 'collector-forbidden-endpoint';

select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and policyname in (
        'sources_collector_aneel_select',
        'source_endpoints_collector_aneel_select',
        'collection_runs_collector_aneel_select',
        'collection_runs_collector_aneel_insert',
        'collection_runs_collector_aneel_update'
      )
      and 'chargebr_collector_0001' = any(roles)
  ),
  5::bigint,
  'the migration adds exactly the five approved ANEEL policies'
);

select ok(
  (
    select rolcanlogin
      and not rolsuper
      and not rolcreatedb
      and not rolcreaterole
      and not rolreplication
      and not rolbypassrls
      and rolconnlimit = 2
    from pg_roles
    where rolname = 'chargebr_collector_0001'
  ),
  'the collector role keeps its restricted attributes'
);

select ok(
  has_column_privilege(
    'chargebr_collector_0001',
    'public.sources',
    'id',
    'SELECT'
  ),
  'the collector keeps SELECT on sources.id'
);

select ok(
  not has_column_privilege(
    'chargebr_collector_0001',
    'public.sources',
    'name',
    'SELECT'
  ),
  'the collector does not gain SELECT on sources.name'
);

grant usage on schema extensions to chargebr_collector_0001;
set local role chargebr_collector_0001;

select is(
  (
    select string_agg(slug, ',' order by slug)
    from public.sources
  ),
  'abve,aneel',
  'the collector sees only the approved ABVE and ANEEL sources'
);

select throws_ok(
  $$select name from public.sources$$,
  '42501',
  'permission denied for table sources',
  'the collector cannot read ungranted source columns'
);

select is(
  (
    select string_agg(endpoint_key, ',' order by endpoint_key)
    from public.source_endpoints
  ),
  'abve-news-wordpress-posts,aneel-board-meetings-index',
  'the collector sees only the two approved endpoints'
);

select is(
  (select count(*) from public.collection_runs),
  0::bigint,
  'a run from an unapproved endpoint is hidden'
);

select lives_ok(
  $$
    insert into public.collection_runs (
      source_endpoint_id,
      run_key,
      started_at,
      last_heartbeat_at,
      stale_after_at,
      initiated_by,
      collector_name,
      collector_version,
      contract_version,
      config_fingerprint
    )
    select
      id,
      uuid '00000000-0000-4000-8000-000000000002',
      timestamptz '2026-09-29T21:45:00Z',
      timestamptz '2026-09-29T21:45:00Z',
      timestamptz '2026-09-29T21:50:00Z',
      'collector-test',
      'chargebr-local-collector',
      repeat('2', 40),
      'chargebr-local-collector-contract-v1',
      repeat('0', 64)
    from public.source_endpoints
    where endpoint_key = 'aneel-board-meetings-index'
  $$,
  'the collector can create a running manual ANEEL run'
);

select is(
  (select count(*) from public.collection_runs),
  1::bigint,
  'the collector sees the ANEEL run it created'
);

select lives_ok(
  $$
    update public.collection_runs
    set
      last_heartbeat_at = timestamptz '2026-09-29T21:46:00Z',
      stale_after_at = timestamptz '2026-09-29T21:51:00Z',
      updated_at = now()
    where run_key = uuid '00000000-0000-4000-8000-000000000002'
  $$,
  'the collector can heartbeat its ANEEL run'
);

select throws_ok(
  $$
    insert into public.collection_runs (
      source_endpoint_id,
      run_key,
      started_at,
      last_heartbeat_at,
      stale_after_at,
      initiated_by,
      collector_name,
      collector_version,
      contract_version,
      config_fingerprint
    )
    select
      current_setting('collector_test.forbidden_endpoint_id')::bigint,
      uuid '00000000-0000-4000-8000-000000000003',
      timestamptz '2026-09-29T21:45:00Z',
      timestamptz '2026-09-29T21:45:00Z',
      timestamptz '2026-09-29T21:50:00Z',
      'collector-test',
      'chargebr-local-collector',
      repeat('3', 40),
      'chargebr-local-collector-contract-v1',
      repeat('0', 64)
  $$,
  '42501',
  'new row violates row-level security policy for table "collection_runs"',
  'the collector cannot create a run for an unapproved endpoint'
);

select throws_ok(
  $$
    delete from public.collection_runs
    where run_key = uuid '00000000-0000-4000-8000-000000000002'
  $$,
  '42501',
  'permission denied for table collection_runs',
  'the collector cannot delete ANEEL runs'
);

select throws_ok(
  $$
    insert into public.sources (
      name,
      slug,
      homepage_url,
      source_type
    )
    values (
      'Denied source',
      'denied-source',
      'https://denied.example.test',
      'discovery'
    )
  $$,
  '42501',
  'permission denied for table sources',
  'the collector cannot create sources'
);

select throws_ok(
  $$
    update public.source_endpoints
    set name = 'Denied update'
    where endpoint_key = 'aneel-board-meetings-index'
  $$,
  '42501',
  'permission denied for table source_endpoints',
  'the collector cannot update endpoints'
);

select throws_ok(
  $$select count(*) from public.content_items$$,
  '42501',
  'permission denied for table content_items',
  'the collector cannot read canonical content'
);

SELECT * FROM finish();
ROLLBACK;
