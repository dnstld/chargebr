import assert from "node:assert/strict";
import test from "node:test";

import { ABVE_ENDPOINT_CONTRACT } from "../../src/collector/abve-adapter.js";
import {
  ConcurrentRunError,
  PostgresCollectionRunStore,
} from "../../src/collector/collection-run-store.js";

interface QueuedResult {
  readonly rows: unknown[];
  readonly rowCount: number | null;
}

class FakeDatabaseClient {
  readonly calls: Array<{ text: string; values: readonly unknown[] }> = [];
  readonly queue: Array<QueuedResult | Error> = [];
  ended = 0;

  async query(text: string, values: readonly unknown[] = []) {
    this.calls.push({ text, values });
    const result = this.queue.shift();
    if (result === undefined) throw new Error("database result queue exhausted");
    if (result instanceof Error) throw result;
    return result;
  }

  async end() {
    this.ended += 1;
  }
}

function store(client: FakeDatabaseClient): PostgresCollectionRunStore {
  return new PostgresCollectionRunStore(
    client as unknown as ConstructorParameters<typeof PostgresCollectionRunStore>[0],
  );
}

test("database store requires the exact dedicated collector role", async () => {
  const accepted = new FakeDatabaseClient();
  accepted.queue.push({ rows: [{ current_user: "chargebr_collector_0001" }], rowCount: 1 });
  await store(accepted).assertDedicatedRole();

  const rejected = new FakeDatabaseClient();
  rejected.queue.push({ rows: [{ current_user: "postgres" }], rowCount: 1 });
  await assert.rejects(store(rejected).assertDedicatedRole(), /dedicated collector role/u);
});

test("database store resolves exactly one ABVE endpoint contract", async () => {
  const client = new FakeDatabaseClient();
  client.queue.push({
    rows: [{ id: "42", contract: ABVE_ENDPOINT_CONTRACT }],
    rowCount: 1,
  });
  const resolved = await store(client).resolveAbveEndpoint();
  assert.deepEqual(resolved, { id: "42", contract: ABVE_ENDPOINT_CONTRACT });
  assert.deepEqual(client.calls[0]?.values, ["abve", "abve-news-wordpress-posts"]);

  const ambiguous = new FakeDatabaseClient();
  ambiguous.queue.push({ rows: [{}, {}], rowCount: 2 });
  assert.equal(await store(ambiguous).resolveAbveEndpoint(), null);
});

test("database store maps running and complete run state", async () => {
  const client = new FakeDatabaseClient();
  client.queue.push({
    rows: [{
      id: "10",
      run_key: "123e4567-e89b-42d3-a456-426614174000",
      stale_after_at: new Date("2026-09-23T10:05:00.000Z"),
    }],
    rowCount: 1,
  });
  client.queue.push({
    rows: [{
      run_key: "123e4567-e89b-42d3-a456-426614174000",
      cursor_out: { version: "abve-time-window-v1", before: "2026-09-23T10:00:00.000Z" },
      response_manifest_hash: "a".repeat(64),
      response_manifest_reference: "local:.chargebr/collection-runs/run/manifest.v1.json",
    }],
    rowCount: 1,
  });
  const database = store(client);
  assert.equal((await database.findRunningRun("42"))?.staleAfterAt, "2026-09-23T10:05:00.000Z");
  assert.equal((await database.findLatestCompleteRun("42"))?.cursorOut?.before, "2026-09-23T10:00:00.000Z");
});

test("database store recognizes the one-running-run uniqueness race", async () => {
  const client = new FakeDatabaseClient();
  const conflict = new Error("unique violation") as Error & { code: string };
  conflict.code = "23505";
  client.queue.push(conflict);
  await assert.rejects(
    store(client).startRun({
      endpointId: "42",
      runKey: "123e4567-e89b-42d3-a456-426614174000",
      startedAt: "2026-09-23T10:00:00.000Z",
      staleAfterAt: "2026-09-23T10:05:00.000Z",
      initiatedBy: "denistoledo",
      collectorVersion: "0".repeat(40),
      configFingerprint: "a".repeat(64),
      windowStart: null,
      windowEnd: "2026-09-23T10:00:00.000Z",
      cursorIn: null,
    }),
    ConcurrentRunError,
  );
});

test("database store makes heartbeat and terminal transitions conditional on running", async () => {
  const client = new FakeDatabaseClient();
  client.queue.push({ rows: [], rowCount: 1 });
  client.queue.push({ rows: [], rowCount: 1 });
  const database = store(client);
  assert.equal(await database.heartbeat(
    "77",
    "2026-09-23T10:01:00.000Z",
    "2026-09-23T10:06:00.000Z",
  ), true);
  assert.equal(await database.finishRun("77", {
    status: "no_change",
    finishedAt: "2026-09-23T10:02:00.000Z",
    staleAfterAt: "2026-09-23T10:07:00.000Z",
    cursorOut: { version: "abve-time-window-v1", before: "2026-09-23T10:00:00.000Z" },
    requestAttemptCount: 1,
    manifestHash: "a".repeat(64),
    manifestReference: "local:.chargebr/collection-runs/run/manifest.v1.json",
    httpStatus: 200,
    responseContentType: "application/json",
    etag: null,
    lastModified: null,
    responseBytes: 2,
    counts: {
      items_found: 1,
      items_new: 0,
      items_unchanged: 1,
      items_changed: 0,
      items_inaccessible: 0,
      items_rejected: 0,
      items_removal_candidates: 0,
    },
    diagnostic: null,
    handoffStatus: "not_produced",
  }), true);
  assert.match(client.calls[0]?.text ?? "", /status = 'running'/u);
  assert.match(client.calls[1]?.text ?? "", /status = 'running'/u);
});
