import assert from "node:assert/strict";
import test from "node:test";

import {
  ABVE_ENDPOINT_CONTRACT,
  abveConfigFingerprint,
  collectAbve,
  type AbveCollectionOutcome,
} from "../../src/collector/abve-adapter.js";
import type {
  CollectionRunStore,
  CompleteCollectionRun,
  FinishCollectionRunInput,
  RunningCollectionRun,
  StartCollectionRunInput,
} from "../../src/collector/collection-run-store.js";
import { createManifestPayload, responseManifestHash } from "../../src/collector/manifest.js";
import { runAbveCollector } from "../../src/collector/runner.js";

const RUN_KEY = "123e4567-e89b-42d3-a456-426614174000";
const VERSION = "0123456789abcdef0123456789abcdef01234567";
const START = Date.parse("2026-09-23T10:00:00.000Z");

class FakeStore implements CollectionRunStore {
  running: RunningCollectionRun | null = null;
  previous: CompleteCollectionRun | null = null;
  endpoint = { id: "42", contract: ABVE_ENDPOINT_CONTRACT };
  interrupted = 0;
  starts: StartCollectionRunInput[] = [];
  heartbeats: Array<{ runId: string; heartbeatAt: string; staleAfterAt: string }> = [];
  finishes: Array<{ runId: string; input: FinishCollectionRunInput }> = [];
  closed = 0;

  async resolveAbveEndpoint() {
    return this.endpoint;
  }

  async findRunningRun() {
    return this.running;
  }

  async interruptStaleRun() {
    this.interrupted += 1;
    this.running = null;
    return true;
  }

  async findLatestCompleteRun() {
    return this.previous;
  }

  async startRun(input: StartCollectionRunInput) {
    this.starts.push(input);
    return "77";
  }

  async heartbeat(runId: string, heartbeatAt: string, staleAfterAt: string) {
    this.heartbeats.push({ runId, heartbeatAt, staleAfterAt });
    return true;
  }

  async finishRun(runId: string, input: FinishCollectionRunInput) {
    this.finishes.push({ runId, input });
    return true;
  }

  async close() {
    this.closed += 1;
  }
}

function succeededOutcome(): AbveCollectionOutcome {
  const payload = createManifestPayload({
    config_fingerprint: abveConfigFingerprint(ABVE_ENDPOINT_CONTRACT),
    endpoint_key: ABVE_ENDPOINT_CONTRACT.endpoint_key,
    window: {
      start: null,
      end: "2026-09-23T10:00:00.001Z",
      freeze_before: "2026-09-23T10:00:00.001Z",
    },
    requests: [{
      page: 1,
      canonical_url: "https://abve.org.br/wp-json/wp/v2/posts?page=1",
      attempt_count: 1,
      outcome: "success",
      status_code: 200,
      content_type: "application/json",
      byte_length: 123,
      response_body_sha256: "a".repeat(64),
      stable_headers: { "Content-Type": "application/json", ETag: "stable" },
    }],
    items: [{
      native_identity: { id: 10 },
      canonical_url: "https://abve.org.br/post-10",
      content_fingerprint: "b".repeat(64),
      classification: "new",
    }],
  });
  return {
    status: "succeeded",
    error: null,
    cursor_in: null,
    cursor_out: { version: "abve-time-window-v1", before: "2026-09-23T10:00:00.001Z" },
    requests: payload.requests,
    attempt_history: [{ page: 1, attempt: 1, outcome: "success", status_code: 200 }],
    items: [],
    counts: payload.aggregate_counts,
    manifest_payload: payload,
    response_manifest_hash: responseManifestHash(payload),
  };
}

function dependencies(store: FakeStore, outcome = succeededOutcome()) {
  let clock = START;
  return {
    openStore: async () => store,
    collect: async () => outcome,
    writeManifest: async () => "/tmp/manifest.v1.json",
    readManifest: async () => { throw new Error("not expected"); },
    resolveVersion: () => VERSION,
    uuid: () => RUN_KEY,
    now: () => clock++,
    sleep: async () => undefined,
    fetch: async () => { throw new Error("not expected"); },
    rootDirectory: "/workspace",
  };
}

const environment = {
  CHARGEBR_COLLECTOR_DATABASE_URL: "postgresql://collector:secret@example.invalid/db",
  CHARGEBR_COLLECTOR_INITIATED_BY: "denistoledo",
};

test("runner creates, heartbeats, manifests, and completes a successful bootstrap", async () => {
  const store = new FakeStore();
  const result = await runAbveCollector(environment, dependencies(store));

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout ?? "", /"status":"succeeded"/u);
  assert.equal(store.starts.length, 1);
  assert.equal(store.starts[0]?.cursorIn, null);
  assert.equal(store.starts[0]?.configFingerprint, abveConfigFingerprint(ABVE_ENDPOINT_CONTRACT));
  assert.ok(store.heartbeats.length >= 4);
  assert.equal(store.finishes.length, 1);
  assert.equal(store.finishes[0]?.input.status, "succeeded");
  assert.equal(store.finishes[0]?.input.handoffStatus, "ready_for_extraction");
  assert.equal(store.finishes[0]?.input.responseBytes, 123);
  assert.equal(store.closed, 1);
});

test("runner connects the real adapter to HTTP, manifest writing, and terminal state", async () => {
  const store = new FakeStore();
  let writtenManifest: unknown;
  const result = await runAbveCollector(environment, {
    ...dependencies(store),
    collect: collectAbve,
    fetch: async () => new Response(JSON.stringify([{
      id: 10,
      date: "2026-09-23T09:00:00",
      date_gmt: "2026-09-23T12:00:00",
      modified: "2026-09-23T09:00:00",
      slug: "post-10",
      link: "https://abve.org.br/post-10/",
      title: { rendered: "Title" },
      excerpt: { rendered: "Excerpt", protected: false },
      content: { rendered: "Content", protected: false },
    }]), {
      headers: {
        "Content-Type": "application/json",
        "X-WP-Total": "1",
        "X-WP-TotalPages": "1",
      },
    }),
    writeManifest: async (_root, manifest) => {
      writtenManifest = manifest;
      return "/workspace/.chargebr/manifest.v1.json";
    },
  });

  assert.equal(result.exitCode, 0);
  assert.equal(store.finishes[0]?.input.status, "succeeded");
  assert.equal(store.finishes[0]?.input.counts.items_new, 1);
  assert.equal(store.finishes[0]?.input.httpStatus, 200);
  assert.ok(writtenManifest);
});

test("runner reports an unexpired concurrent run without starting or collecting", async () => {
  const store = new FakeStore();
  store.running = {
    id: "12",
    runKey: "123e4567-e89b-42d3-a456-426614174001",
    staleAfterAt: "2026-09-23T10:10:00.000Z",
  };
  let collected = 0;
  const result = await runAbveCollector(environment, {
    ...dependencies(store),
    collect: async () => {
      collected += 1;
      return succeededOutcome();
    },
  });

  assert.equal(result.exitCode, 5);
  assert.equal(store.starts.length, 0);
  assert.equal(collected, 0);
  assert.equal(store.closed, 1);
});

test("runner reconciles an expired run before creating the next invocation", async () => {
  const store = new FakeStore();
  store.running = {
    id: "12",
    runKey: "123e4567-e89b-42d3-a456-426614174001",
    staleAfterAt: "2026-09-23T09:59:00.000Z",
  };
  const result = await runAbveCollector(environment, dependencies(store));

  assert.equal(result.exitCode, 0);
  assert.equal(store.interrupted, 1);
  assert.equal(store.starts.length, 1);
});

test("runner blocks through the adapter when a prior manifest is unavailable", async () => {
  const store = new FakeStore();
  store.previous = {
    runKey: "123e4567-e89b-42d3-a456-426614174099",
    cursorOut: { version: "abve-time-window-v1", before: "2026-09-22T10:00:00.000Z" },
    manifestHash: "c".repeat(64),
    manifestReference: "local:.chargebr/collection-runs/missing/manifest.v1.json",
  };
  let observedPrior: unknown = "not-called";
  const blocked = succeededOutcome();
  const result = await runAbveCollector(environment, {
    ...dependencies(store),
    readManifest: async () => { throw new Error("missing"); },
    collect: async (input) => {
      observedPrior = input.prior_manifest;
      return { ...blocked, status: "blocked", cursor_out: null };
    },
  });

  assert.equal(observedPrior, null);
  assert.equal(result.exitCode, 4);
  assert.equal(store.starts[0]?.cursorIn?.before, "2026-09-22T10:00:00.000Z");
});

test("runner records a terminal internal failure when manifest writing fails", async () => {
  const store = new FakeStore();
  const result = await runAbveCollector(environment, {
    ...dependencies(store),
    writeManifest: async () => { throw new Error("disk failure"); },
  });

  assert.equal(result.exitCode, 70);
  assert.equal(store.finishes.length, 1);
  assert.equal(store.finishes[0]?.input.status, "failed");
  assert.equal(store.finishes[0]?.input.diagnostic?.error_kind, "internal");
  assert.equal(store.finishes[0]?.input.manifestReference, null);
});

test("runner rejects an endpoint contract mismatch before creating a run", async () => {
  const store = new FakeStore();
  store.endpoint = {
    id: "42",
    contract: {
      ...ABVE_ENDPOINT_CONTRACT,
      request_config: {
        ...ABVE_ENDPOINT_CONTRACT.request_config,
        timeout_ms: 29_999,
      },
    } as unknown as typeof ABVE_ENDPOINT_CONTRACT,
  };
  const result = await runAbveCollector(environment, dependencies(store));

  assert.equal(result.exitCode, 69);
  assert.equal(store.starts.length, 0);
  assert.equal(store.closed, 1);
});

test("runner validates required local environment before opening the database", async () => {
  let opened = 0;
  const result = await runAbveCollector({}, {
    ...dependencies(new FakeStore()),
    openStore: async () => {
      opened += 1;
      return new FakeStore();
    },
  });
  assert.equal(result.exitCode, 70);
  assert.equal(opened, 0);
});
