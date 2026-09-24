import { Client, type QueryResultRow } from "pg";

import type {
  AbveCursor,
  AbveEndpointContract,
  CollectorDiagnostic,
  ProposedOperationalStatus,
} from "./abve-adapter.js";
import type { AggregateCounts } from "./manifest.js";

const COLLECTOR_ROLE = "chargebr_collector_0001";

export interface ResolvedAbveEndpoint {
  readonly id: string;
  readonly contract: AbveEndpointContract;
}

export interface RunningCollectionRun {
  readonly id: string;
  readonly runKey: string;
  readonly staleAfterAt: string;
}

export interface CompleteCollectionRun {
  readonly runKey: string;
  readonly cursorOut: AbveCursor | null;
  readonly manifestHash: string | null;
  readonly manifestReference: string | null;
}

export interface ExtractionCollectionRun {
  readonly runKey: string;
  readonly status: string;
  readonly handoffStatus: string;
  readonly manifestHash: string | null;
  readonly manifestReference: string | null;
  readonly collectorName: string;
  readonly collectorVersion: string;
  readonly contractVersion: string;
  readonly configFingerprint: string;
}

export interface StartCollectionRunInput {
  readonly endpointId: string;
  readonly runKey: string;
  readonly startedAt: string;
  readonly staleAfterAt: string;
  readonly initiatedBy: string;
  readonly collectorVersion: string;
  readonly configFingerprint: string;
  readonly windowStart: string | null;
  readonly windowEnd: string;
  readonly cursorIn: AbveCursor | null;
}

export interface FinishCollectionRunInput {
  readonly status: ProposedOperationalStatus;
  readonly finishedAt: string;
  readonly staleAfterAt: string;
  readonly cursorOut: AbveCursor | null;
  readonly requestAttemptCount: number;
  readonly manifestHash: string | null;
  readonly manifestReference: string | null;
  readonly httpStatus: number | null;
  readonly responseContentType: string | null;
  readonly etag: string | null;
  readonly lastModified: string | null;
  readonly responseBytes: number | null;
  readonly counts: AggregateCounts;
  readonly diagnostic: CollectorDiagnostic | null;
  readonly handoffStatus: "not_produced" | "ready_for_extraction" | "withheld";
}

export interface CollectionRunStore {
  resolveAbveEndpoint(): Promise<ResolvedAbveEndpoint | null>;
  findRunningRun(endpointId: string): Promise<RunningCollectionRun | null>;
  interruptStaleRun(runId: string, reconciliationAt: string): Promise<boolean>;
  findLatestCompleteRun(endpointId: string): Promise<CompleteCollectionRun | null>;
  startRun(input: StartCollectionRunInput): Promise<string>;
  heartbeat(runId: string, heartbeatAt: string, staleAfterAt: string): Promise<boolean>;
  finishRun(runId: string, input: FinishCollectionRunInput): Promise<boolean>;
  close(): Promise<void>;
}

export class ConcurrentRunError extends Error {}

interface DatabaseClient {
  query<Row extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ readonly rows: Row[]; readonly rowCount: number | null }>;
  end(): Promise<void>;
}

interface EndpointRow extends QueryResultRow {
  readonly id: string;
  readonly contract: unknown;
}

interface RunningRow extends QueryResultRow {
  readonly id: string;
  readonly run_key: string;
  readonly stale_after_at: Date | string;
}

interface CompleteRow extends QueryResultRow {
  readonly run_key: string;
  readonly cursor_out: unknown;
  readonly response_manifest_hash: string | null;
  readonly response_manifest_reference: string | null;
}

interface ExtractionRunRow extends QueryResultRow {
  readonly run_key: string;
  readonly status: string;
  readonly handoff_status: string;
  readonly response_manifest_hash: string | null;
  readonly response_manifest_reference: string | null;
  readonly collector_name: string;
  readonly collector_version: string;
  readonly contract_version: string;
  readonly config_fingerprint: string;
}

export class PostgresCollectionRunStore implements CollectionRunStore {
  constructor(private readonly client: DatabaseClient) {}

  async assertDedicatedRole(): Promise<void> {
    const result = await this.client.query<{ readonly current_user: string }>(
      "select current_user",
    );
    if (result.rows.length !== 1 || result.rows[0]?.current_user !== COLLECTOR_ROLE) {
      throw new Error("database connection is not using the dedicated collector role");
    }
  }

  async resolveAbveEndpoint(): Promise<ResolvedAbveEndpoint | null> {
    const result = await this.client.query<EndpointRow>(
      `select
         se.id::text as id,
         jsonb_build_object(
           'source_slug', s.slug,
           'endpoint_key', se.endpoint_key,
           'endpoint_url', se.endpoint_url,
           'endpoint_type', se.endpoint_type,
           'access_method', se.access_method,
           'response_format', se.response_format,
           'status', se.status,
           'request_config', se.request_config,
           'pagination_strategy', se.pagination_strategy,
           'pagination_config', se.pagination_config,
           'cursor_strategy', se.cursor_strategy,
           'cursor_config', se.cursor_config,
           'identity_rule', se.identity_rule,
           'normalization_profile', se.normalization_profile,
           'removal_policy', se.removal_policy,
           'suggested_interval', se.suggested_interval::text,
           'default_retention_class', se.default_retention_class,
           'terms_url', se.terms_url,
           'robots_url', se.robots_url
         ) as contract
       from public.sources s
       join public.source_endpoints se on se.source_id = s.id
       where s.slug = $1 and se.endpoint_key = $2`,
      ["abve", "abve-news-wordpress-posts"],
    );
    if (result.rows.length !== 1) {
      return null;
    }
    const row = result.rows[0];
    if (row === undefined || !isAbveEndpointContract(row.contract)) {
      return null;
    }
    return { id: row.id, contract: row.contract };
  }

  async findRunningRun(endpointId: string): Promise<RunningCollectionRun | null> {
    const result = await this.client.query<RunningRow>(
      `select id::text, run_key::text, stale_after_at
         from public.collection_runs
        where source_endpoint_id = $1 and status = 'running'
        order by id desc
        limit 1`,
      [endpointId],
    );
    const row = result.rows[0];
    return row === undefined
      ? null
      : {
          id: row.id,
          runKey: row.run_key,
          staleAfterAt: toUtcInstant(row.stale_after_at),
        };
  }

  async interruptStaleRun(runId: string, reconciliationAt: string): Promise<boolean> {
    const result = await this.client.query(
      `update public.collection_runs
          set status = 'interrupted',
              finished_at = $2,
              cursor_out = null,
              error_kind = 'interrupted',
              error_code = 'stale_run_reconciled',
              error_message = 'A stale collection run was reconciled before a new invocation.',
              handoff_status = 'withheld',
              updated_at = $2
        where id = $1
          and status = 'running'
          and stale_after_at <= $2`,
      [runId, reconciliationAt],
    );
    return result.rowCount === 1;
  }

  async findLatestCompleteRun(endpointId: string): Promise<CompleteCollectionRun | null> {
    const result = await this.client.query<CompleteRow>(
      `select run_key::text, cursor_out, response_manifest_hash, response_manifest_reference
         from public.collection_runs
        where source_endpoint_id = $1
          and status in ('succeeded', 'no_change')
        order by finished_at desc, id desc
        limit 1`,
      [endpointId],
    );
    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }
    return {
      runKey: row.run_key,
      cursorOut: isAbveCursor(row.cursor_out) ? row.cursor_out : null,
      manifestHash: row.response_manifest_hash,
      manifestReference: row.response_manifest_reference,
    };
  }

  async findRunForExtraction(
    endpointId: string,
    runKey: string,
  ): Promise<ExtractionCollectionRun | null> {
    const result = await this.client.query<ExtractionRunRow>(
      `select
         run_key::text,
         status,
         handoff_status,
         response_manifest_hash,
         response_manifest_reference,
         collector_name,
         collector_version,
         contract_version,
         config_fingerprint
       from public.collection_runs
       where source_endpoint_id = $1 and run_key = $2
       limit 2`,
      [endpointId, runKey],
    );
    if (result.rows.length !== 1) {
      return null;
    }
    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }
    return {
      runKey: row.run_key,
      status: row.status,
      handoffStatus: row.handoff_status,
      manifestHash: row.response_manifest_hash,
      manifestReference: row.response_manifest_reference,
      collectorName: row.collector_name,
      collectorVersion: row.collector_version,
      contractVersion: row.contract_version,
      configFingerprint: row.config_fingerprint,
    };
  }

  async startRun(input: StartCollectionRunInput): Promise<string> {
    try {
      const result = await this.client.query<{ readonly id: string }>(
        `insert into public.collection_runs (
           source_endpoint_id, run_key, started_at, last_heartbeat_at,
           stale_after_at, initiated_by, collector_name, collector_version,
           contract_version, config_fingerprint, window_start, window_end, cursor_in
         ) values (
           $1, $2, $3, $3, $4, $5, 'chargebr-local-collector', $6,
           'chargebr-local-collector-contract-v1', $7, $8, $9, $10
         )
         returning id::text`,
        [
          input.endpointId,
          input.runKey,
          input.startedAt,
          input.staleAfterAt,
          input.initiatedBy,
          input.collectorVersion,
          input.configFingerprint,
          input.windowStart,
          input.windowEnd,
          input.cursorIn,
        ],
      );
      const id = result.rows[0]?.id;
      if (id === undefined) {
        throw new Error("collection run insert returned no id");
      }
      return id;
    } catch (error) {
      if (isPostgresError(error, "23505")) {
        throw new ConcurrentRunError("another collection run was created concurrently");
      }
      throw error;
    }
  }

  async heartbeat(runId: string, heartbeatAt: string, staleAfterAt: string): Promise<boolean> {
    const result = await this.client.query(
      `update public.collection_runs
          set last_heartbeat_at = $2,
              stale_after_at = $3,
              updated_at = $2
        where id = $1 and status = 'running'`,
      [runId, heartbeatAt, staleAfterAt],
    );
    return result.rowCount === 1;
  }

  async finishRun(runId: string, input: FinishCollectionRunInput): Promise<boolean> {
    const result = await this.client.query(
      `update public.collection_runs
          set status = $2,
              finished_at = $3,
              last_heartbeat_at = $3,
              stale_after_at = $4,
              cursor_out = $5,
              request_attempt_count = $6,
              response_manifest_hash = $7,
              response_manifest_reference = $8,
              http_status = $9,
              response_content_type = $10,
              etag = $11,
              last_modified = $12,
              response_bytes = $13,
              items_found = $14,
              items_new = $15,
              items_unchanged = $16,
              items_changed = $17,
              items_removal_candidates = $18,
              items_inaccessible = $19,
              items_rejected = $20,
              error_kind = $21,
              error_code = $22,
              error_message = $23,
              handoff_status = $24,
              updated_at = $3
        where id = $1 and status = 'running'`,
      [
        runId,
        input.status,
        input.finishedAt,
        input.staleAfterAt,
        input.cursorOut,
        input.requestAttemptCount,
        input.manifestHash,
        input.manifestReference,
        input.httpStatus,
        input.responseContentType,
        input.etag,
        input.lastModified,
        input.responseBytes,
        input.counts.items_found,
        input.counts.items_new,
        input.counts.items_unchanged,
        input.counts.items_changed,
        input.counts.items_removal_candidates,
        input.counts.items_inaccessible,
        input.counts.items_rejected,
        input.diagnostic?.error_kind ?? null,
        input.diagnostic?.error_code ?? null,
        input.diagnostic?.error_message ?? null,
        input.handoffStatus,
      ],
    );
    return result.rowCount === 1;
  }

  async close(): Promise<void> {
    await this.client.end();
  }
}

export async function openPostgresCollectionRunStore(
  connectionString: string,
): Promise<PostgresCollectionRunStore> {
  const validatedUrl = validateConnectionString(connectionString);
  for (const parameter of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    validatedUrl.searchParams.delete(parameter);
  }
  const client = new Client({
    connectionString: validatedUrl.toString(),
    application_name: "chargebr-local-collector",
    connectionTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();
  const store = new PostgresCollectionRunStore(client);
  try {
    await store.assertDedicatedRole();
    return store;
  } catch (error) {
    await store.close().catch(() => undefined);
    throw error;
  }
}

function validateConnectionString(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("collector database URL is invalid");
  }
  if (!new Set(["postgres:", "postgresql:"]).has(url.protocol) || url.hostname === "") {
    throw new Error("collector database URL is invalid");
  }
  if (url.username === "" || url.password === "") {
    throw new Error("collector database URL must contain dedicated credentials");
  }
  return url;
}

function isAbveEndpointContract(value: unknown): value is AbveEndpointContract {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbveCursor(value: unknown): value is AbveCursor {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.version === "abve-time-window-v1" &&
    typeof record.before === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(record.before) &&
    !Number.isNaN(Date.parse(record.before));
}

function toUtcInstant(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error("database returned an invalid timestamp");
  }
  return parsed.toISOString();
}

function isPostgresError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null &&
    (error as { readonly code?: unknown }).code === code;
}
