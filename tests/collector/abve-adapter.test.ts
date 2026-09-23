import assert from "node:assert/strict";
import test from "node:test";

import {
  ABVE_ENDPOINT_CONTRACT,
  abveConfigFingerprint,
  collectAbve,
  type AbveAdapterDependencies,
  type AbveCursor,
  type CollectAbveInput,
} from "../../src/collector/abve-adapter.js";
import { validateAndNormalizeAbvePost } from "../../src/collector/abve-post.js";
import { COLLECTOR_NAME, MANIFEST_VERSION } from "../../src/collector/constants.js";
import { sha256Bytes } from "../../src/collector/hash.js";
import {
  createManifestPayload,
  responseManifestHash,
  type CollectionManifestV1,
  type ManifestItem,
} from "../../src/collector/manifest.js";

const RUN_STARTED_AT = "2026-01-03T00:00:00.000Z";
const CURSOR: AbveCursor = { version: "abve-time-window-v1", before: "2026-01-02T00:00:00.000Z" };

interface FetchLog {
  readonly urls: string[];
  readonly inits: RequestInit[];
  readonly sleeps: number[];
  readonly timeouts: number[];
}

function wpPost(id: number | null, date: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    date,
    modified: date,
    slug: `post-${id ?? "fallback"}`,
    link: `https://abve.org.br/post-${id ?? "fallback"}/`,
    title: { rendered: `Title ${id ?? "fallback"}` },
    excerpt: { rendered: "<p>Excerpt</p>", protected: false },
    content: { rendered: "<p>Content</p>", protected: false },
    ...overrides,
  };
}

function wpPosts(startId: number, count: number, newestTimestamp: number): Record<string, unknown>[] {
  return Array.from({ length: count }, (_value, index) =>
    wpPost(startId + index, new Date(newestTimestamp - (index * 1_000)).toISOString())
  );
}

function jsonResponse(
  body: unknown,
  options: { status?: number; total?: number; totalPages?: number; headers?: Record<string, string> } = {},
): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
    "X-WP-Total": String(options.total ?? (Array.isArray(body) ? body.length : 1)),
    "X-WP-TotalPages": String(options.totalPages ?? 1),
    ...options.headers,
  });
  return new Response(JSON.stringify(body), { status: options.status ?? 200, headers });
}

function rawResponse(
  body: string | Uint8Array | null,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(body, { status, headers });
}

function sequenceFetch(
  sequence: Array<Response | Error>,
  log: FetchLog,
): AbveAdapterDependencies["fetch"] {
  return async (url, init) => {
    log.urls.push(url);
    log.inits.push(init);
    const next = sequence.shift();
    assert.ok(next, "fetch sequence was exhausted");
    if (next instanceof Error) throw next;
    return next;
  };
}

function dependencies(
  sequence: Array<Response | Error>,
  now = Date.parse("2026-01-01T00:00:00.000Z"),
): { deps: AbveAdapterDependencies; log: FetchLog } {
  const log: FetchLog = { urls: [], inits: [], sleeps: [], timeouts: [] };
  return {
    log,
    deps: {
      fetch: sequenceFetch(sequence, log),
      sleep: async (milliseconds) => { log.sleeps.push(milliseconds); },
      random: () => 0.5,
      now: () => now,
      createAbortTimeout: (milliseconds) => {
        log.timeouts.push(milliseconds);
        return { signal: new AbortController().signal, cancel: () => undefined };
      },
    },
  };
}

function input(cursor: AbveCursor | null = null, prior?: CollectionManifestV1): CollectAbveInput {
  const base = {
    contract: ABVE_ENDPOINT_CONTRACT,
    run_started_at: RUN_STARTED_AT,
    cursor_in: cursor,
  };
  return prior === undefined
    ? base
    : {
        ...base,
        prior_manifest: {
          manifest: prior,
          expected_hash: responseManifestHash(prior.payload),
        },
      };
}

function priorManifest(
  items: readonly ManifestItem[] = [],
  boundary = CURSOR.before,
  configFingerprint = abveConfigFingerprint(ABVE_ENDPOINT_CONTRACT),
): CollectionManifestV1 {
  return {
    manifest_version: MANIFEST_VERSION,
    envelope: {
      run_key: "123e4567-e89b-42d3-a456-426614174000",
      collector_name: COLLECTOR_NAME,
      collector_version: "0123456789abcdef0123456789abcdef01234567",
      started_at: "2026-01-02T00:00:00.000Z",
    },
    payload: createManifestPayload({
      config_fingerprint: configFingerprint,
      endpoint_key: ABVE_ENDPOINT_CONTRACT.endpoint_key,
      window: {
        start: null,
        end: boundary,
        freeze_before: boundary,
      },
      requests: [],
      items,
    }),
  };
}

function validItem(value: Record<string, unknown>): ManifestItem {
  const result = validateAndNormalizeAbvePost(value);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("invalid test fixture");
  return {
    native_identity: result.post.identity,
    canonical_url: result.post.canonicalUrl,
    content_fingerprint: result.post.fingerprint,
    classification: "new",
  };
}

test("request contract uses GET, public query, Accept, timeout, and bootstrap classification", async () => {
  const { deps, log } = dependencies([jsonResponse([wpPost(1, "2026-01-02T10:00:00")])]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "succeeded");
  assert.equal(outcome.items[0]?.manifest_item.classification, "new");
  assert.equal(log.inits[0]?.method, "GET");
  assert.equal(log.inits[0]?.redirect, "manual");
  assert.deepEqual(log.inits[0]?.headers, { Accept: "application/json" });
  assert.deepEqual(log.timeouts, [30_000]);
  const url = new URL(log.urls[0] ?? "");
  assert.equal(url.origin + url.pathname, ABVE_ENDPOINT_CONTRACT.endpoint_url);
  assert.equal(url.searchParams.get("categories"), "13");
  assert.equal(url.searchParams.get("context"), "view");
  assert.equal(url.searchParams.get("orderby"), "date");
  assert.equal(url.searchParams.get("order"), "desc");
  assert.equal(url.searchParams.get("per_page"), "50");
  assert.equal(url.searchParams.get("page"), "1");
  assert.equal(url.searchParams.get("before"), RUN_STARTED_AT);
  assert.equal(outcome.counts.items_removal_candidates, 0);
});

test("baseline classifies unchanged, changed, and new by identity plus fingerprint", async () => {
  const original = wpPost(1, "2026-01-01T12:00:00");
  const changed = wpPost(2, "2026-01-01T11:00:00");
  const prior = priorManifest([validItem(original), validItem(changed)]);
  const current = [
    original,
    wpPost(2, "2026-01-01T11:00:00", { content: { rendered: "changed", protected: false } }),
    wpPost(3, "2026-01-01T10:00:00"),
  ];
  const { deps } = dependencies([jsonResponse(current)]);
  const outcome = await collectAbve(input(CURSOR, prior), deps);
  assert.equal(outcome.status, "succeeded");
  assert.deepEqual(outcome.items.map(({ manifest_item }) => manifest_item.classification), [
    "unchanged",
    "changed",
    "new",
  ]);
});

test("a complete baseline match proposes no_change", async () => {
  const original = wpPost(1, "2026-01-01T12:00:00");
  const { deps } = dependencies([jsonResponse([original])]);
  const outcome = await collectAbve(input(CURSOR, priorManifest([validItem(original)])), deps);
  assert.equal(outcome.status, "no_change");
  assert.equal(outcome.items[0]?.manifest_item.classification, "unchanged");
});

test("a missing or hash-divergent required baseline blocks without HTTP", async () => {
  const missing = dependencies([]);
  const missingOutcome = await collectAbve(input(CURSOR), missing.deps);
  assert.equal(missingOutcome.status, "blocked");
  assert.equal(missingOutcome.error?.error_code, "prior_manifest_unavailable");
  assert.equal(missing.log.urls.length, 0);

  const divergent = dependencies([]);
  const divergentOutcome = await collectAbve({
    ...input(CURSOR),
    prior_manifest: { manifest: priorManifest(), expected_hash: "f".repeat(64) },
  }, divergent.deps);
  assert.equal(divergentOutcome.status, "blocked");
  assert.equal(divergentOutcome.error?.error_code, "prior_manifest_unavailable");
  assert.equal(divergent.log.urls.length, 0);
});

test("pagination uses pages 1 and 2 and freezes before across retries and pages", async () => {
  const { deps, log } = dependencies([
    rawResponse(null, 408),
    jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")), { total: 51, totalPages: 2 }),
    jsonResponse([wpPost(51, "2026-01-02T11:00:00.000Z")], { total: 51, totalPages: 2 }),
  ]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "succeeded");
  assert.deepEqual(outcome.requests.map(({ page }) => page), [1, 2]);
  assert.deepEqual(log.urls.map((url) => new URL(url).searchParams.get("before")), [
    RUN_STARTED_AT,
    RUN_STARTED_AT,
    RUN_STARTED_AT,
  ]);
  assert.deepEqual(log.urls.map((url) => new URL(url).searchParams.get("page")), ["1", "1", "2"]);
  assert.equal(outcome.requests[0]?.attempt_count, 2);
});

test("the cursor boundary is strictly less than the prior before value", async () => {
  const { deps } = dependencies([
    jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T00:00:49.000Z")), { total: 51, totalPages: 2 }),
    jsonResponse([wpPost(51, "2026-01-01T23:59:59.000Z")], { total: 51, totalPages: 2 }),
  ]);
  const outcome = await collectAbve(input(CURSOR, priorManifest()), deps);
  assert.equal(outcome.status, "succeeded");
  assert.equal(outcome.requests.length, 2);
  assert.deepEqual(outcome.cursor_out, { version: "abve-time-window-v1", before: RUN_STARTED_AT });
});

test("ABVE local WordPress dates use the approved minus-three offset for cursor boundaries", async (context) => {
  const post = wpPost(1, "2026-09-15T10:00:00");

  for (const [name, before, expectedStatus] of [
    ["cursor before the absolute post instant", "2026-09-15T12:00:00.000Z", "partial"],
    ["cursor after the absolute post instant", "2026-09-15T14:00:00.000Z", "succeeded"],
    ["cursor equal to the absolute post instant", "2026-09-15T13:00:00.000Z", "partial"],
  ] as const) {
    await context.test(name, async () => {
      const cursor: AbveCursor = { version: "abve-time-window-v1", before };
      const { deps } = dependencies([jsonResponse([post])]);
      const outcome = await collectAbve({
        ...input(cursor, priorManifest([], before)),
        run_started_at: "2026-09-16T00:00:00.000Z",
      }, deps);
      assert.equal(outcome.status, expectedStatus);
    });
  }
});

test("incremental coverage is partial when the only page does not cross the prior boundary", async () => {
  const original = wpPost(1, "2026-01-02T00:00:00.000Z");
  const { deps } = dependencies([jsonResponse([original], { total: 1, totalPages: 1 })]);
  const outcome = await collectAbve(input(CURSOR, priorManifest([validItem(original)])), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.cursor_out, null);
});

test("max pages before the prior boundary is partial and does not advance cursor", async () => {
  const { deps } = dependencies([
    jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")), { total: 101, totalPages: 3 }),
    jsonResponse(wpPosts(51, 50, Date.parse("2026-01-02T11:59:10.000Z")), { total: 101, totalPages: 3 }),
  ]);
  const outcome = await collectAbve(input(CURSOR, priorManifest()), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.cursor_out, null);
  assert.equal(outcome.error?.error_code, "pagination_inconsistent");
});

test("duplicate identity and changing WordPress totals produce partial", async (context) => {
  await context.test("duplicate identity", async () => {
    const firstPage = wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z"));
    const { deps } = dependencies([
      jsonResponse(firstPage, { total: 51, totalPages: 2 }),
      jsonResponse([wpPost(1, "2026-01-02T12:00:00.000Z")], { total: 51, totalPages: 2 }),
    ]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "partial");
    assert.equal(outcome.error?.error_code, "pagination_inconsistent");
  });

  await context.test("changing totals", async () => {
    const { deps } = dependencies([
      jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")), { total: 51, totalPages: 2 }),
      jsonResponse([wpPost(51, "2026-01-02T11:00:00.000Z")], { total: 50, totalPages: 1 }),
    ]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "partial");
    assert.equal(outcome.error?.error_code, "pagination_inconsistent");
  });
});

test("408, 425, 429, and 5xx retry with deterministic full jitter", async (context) => {
  for (const status of [408, 425, 429, 503]) {
    await context.test(String(status), async () => {
      const { deps, log } = dependencies([
        rawResponse(null, status),
        jsonResponse([wpPost(status, "2026-01-02T10:00:00")]),
      ]);
      const outcome = await collectAbve(input(), deps);
      assert.equal(outcome.status, "succeeded");
      assert.deepEqual(log.sleeps, [500]);
      assert.deepEqual(outcome.attempt_history.map(({ outcome: value }) => value), [`http_${status}`, "success"]);
    });
  }
});

test("timeout retries and exhaustion without usable output fails", async () => {
  const timeout = new Error("not exposed");
  timeout.name = "AbortError";
  const retried = dependencies([timeout, jsonResponse([wpPost(1, "2026-01-02T10:00:00")])]);
  const success = await collectAbve(input(), retried.deps);
  assert.equal(success.status, "succeeded");
  assert.deepEqual(retried.log.sleeps, [500]);
  assert.equal(success.attempt_history[0]?.outcome, "read_timeout");

  const exhausted = dependencies([rawResponse(null, 503), rawResponse(null, 503), rawResponse(null, 503)]);
  const failure = await collectAbve(input(), exhausted.deps);
  assert.equal(failure.status, "failed");
  assert.equal(failure.error?.error_code, "http_5xx_exhausted");
  assert.deepEqual(exhausted.log.sleeps, [500, 1_000]);
});

test("a body disconnect retries, while exhaustion after a valid page is partial", async () => {
  const disconnected = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("["));
      controller.error(new Error("socket reset with sensitive detail"));
    },
  });
  const headers = {
    "Content-Type": "application/json",
    "X-WP-Total": "1",
    "X-WP-TotalPages": "1",
  };
  const retried = dependencies([
    new Response(disconnected, { status: 200, headers }),
    jsonResponse([wpPost(1, "2026-01-02T10:00:00")]),
  ]);
  const success = await collectAbve(input(), retried.deps);
  assert.equal(success.status, "succeeded");
  assert.equal(success.attempt_history[0]?.outcome, "connection_reset");
  assert.equal(JSON.stringify(success).includes("sensitive detail"), false);

  const partial = dependencies([
    jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")), { total: 51, totalPages: 2 }),
    rawResponse(null, 503),
    rawResponse(null, 503),
    rawResponse(null, 503),
  ]);
  const outcome = await collectAbve(input(), partial.deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.cursor_out, null);
  assert.equal(outcome.error?.error_code, "http_5xx_exhausted");
  assert.equal(outcome.requests[0]?.outcome, "success");
  assert.equal(outcome.items.length, 50);
  assert.equal(outcome.counts.items_new, 50);
});

test("a blocker after a valid page preserves prior evidence as partial", async (context) => {
  const firstPage = () => jsonResponse(
    wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")),
    { total: 51, totalPages: 2 },
  );
  const cases: Array<[string, () => Response, string]> = [
    ["HTTP 403", () => rawResponse(null, 403), "authentication_required"],
    ["invalid JSON", () => rawResponse("not json", 200, { "Content-Type": "application/json" }), "json_invalid"],
    [
      "invalid pagination headers",
      () => rawResponse(JSON.stringify([wpPost(51, "2026-01-02T11:00:00.000Z")]), 200, {
        "Content-Type": "application/json",
      }),
      "schema_mismatch",
    ],
    [
      "response too large",
      () => rawResponse(null, 200, {
        "Content-Type": "application/json",
        "Content-Length": "2000001",
      }),
      "response_too_large",
    ],
  ];

  for (const [name, secondPage, errorCode] of cases) {
    await context.test(name, async () => {
      const { deps } = dependencies([firstPage(), secondPage()]);
      const outcome = await collectAbve(input(), deps);
      assert.equal(outcome.status, "partial");
      assert.equal(outcome.cursor_out, null);
      assert.equal(outcome.error?.error_code, errorCode);
      assert.equal(outcome.requests[0]?.outcome, "success");
      assert.equal(outcome.requests.length, 2);
      assert.equal(outcome.items.length, 50);
      assert.equal(outcome.counts.items_new, 50);
    });
  }
});

test("Retry-After seconds and HTTP-date replace jitter", async (context) => {
  await context.test("seconds", async () => {
    const { deps, log } = dependencies([
      rawResponse(null, 429, { "Retry-After": "2" }),
      jsonResponse([wpPost(1, "2026-01-02T10:00:00")]),
    ]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "succeeded");
    assert.deepEqual(log.sleeps, [2_000]);
  });

  await context.test("HTTP-date", async () => {
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    const { deps, log } = dependencies([
      rawResponse(null, 429, { "Retry-After": "Thu, 01 Jan 2026 00:00:03 GMT" }),
      jsonResponse([wpPost(1, "2026-01-02T10:00:00")]),
    ], now);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "succeeded");
    assert.deepEqual(log.sleeps, [3_000]);
  });
});

test("Retry-After above 240 seconds fails as rate_limit", async () => {
  const { deps, log } = dependencies([rawResponse(null, 429, { "Retry-After": "241" })]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "failed");
  assert.equal(outcome.error?.error_kind, "rate_limit");
  assert.equal(outcome.error?.error_code, "retry_after_too_long");
  assert.deepEqual(log.sleeps, []);
});

test("Retry-After above 240 seconds after a valid page is partial", async () => {
  const { deps } = dependencies([
    jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")), { total: 51, totalPages: 2 }),
    rawResponse(null, 429, { "Retry-After": "241" }),
  ]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.cursor_out, null);
  assert.equal(outcome.counts.items_new, 50);
});

test("400, 401, 403, 404, and 410 block without retry", async (context) => {
  for (const status of [400, 401, 403, 404, 410]) {
    await context.test(String(status), async () => {
      const { deps, log } = dependencies([rawResponse(null, status)]);
      const outcome = await collectAbve(input(), deps);
      assert.equal(outcome.status, "blocked");
      assert.equal(log.urls.length, 1);
      assert.deepEqual(log.sleeps, []);
    });
  }
});

test("redirects allow only HTTPS on the exact approved hostname", async (context) => {
  await context.test("same host", async () => {
    const { deps, log } = dependencies([
      rawResponse(null, 302, { Location: "/wp-json/wp/v2/posts-redirected" }),
      jsonResponse([wpPost(1, "2026-01-02T10:00:00")]),
    ]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "succeeded");
    assert.equal(new URL(log.urls[1] ?? "").hostname, "abve.org.br");
  });

  await context.test("cross host", async () => {
    const { deps } = dependencies([rawResponse(null, 302, { Location: "https://www.abve.org.br/posts" })]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "blocked");
    assert.equal(outcome.error?.error_code, "redirect_host_not_allowed");
  });

  for (const [name, location] of [
    ["downgrade", "http://abve.org.br/posts"],
    ["userinfo", "https://user:pass@abve.org.br/posts"],
    ["IP literal", "https://127.0.0.1/posts"],
    ["localhost", "https://localhost/posts"],
    ["network-path cross host", "//example.invalid/posts"],
  ] as const) {
    await context.test(name, async () => {
      const { deps } = dependencies([rawResponse(null, 302, { Location: location })]);
      const outcome = await collectAbve(input(), deps);
      assert.equal(outcome.status, "blocked");
      assert.equal(outcome.error?.error_code, "redirect_host_not_allowed");
    });
  }

  await context.test("more than three", async () => {
    const { deps, log } = dependencies([
      rawResponse(null, 302, { Location: "/r1" }),
      rawResponse(null, 302, { Location: "/r2" }),
      rawResponse(null, 302, { Location: "/r3" }),
      rawResponse(null, 302, { Location: "/r4" }),
    ]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "blocked");
    assert.equal(outcome.error?.error_code, "redirect_limit_exceeded");
    assert.equal(log.urls.length, 4);
  });
});

test("streamed body above two million bytes blocks without a success hash", async () => {
  const body = new Uint8Array(2_000_001);
  const { deps } = dependencies([rawResponse(body, 200, {
    "Content-Type": "application/json",
    "X-WP-Total": "1",
    "X-WP-TotalPages": "1",
  })]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.error?.error_code, "response_too_large");
  assert.equal(outcome.requests[0]?.response_body_sha256, null);
});

test("invalid content type, JSON, and root block without retry", async (context) => {
  const cases: Array<[string, Response, string]> = [
    ["content type", rawResponse("[]", 200, { "Content-Type": "text/html" }), "content_type_unexpected"],
    ["JSON", rawResponse("not json", 200, { "Content-Type": "application/json" }), "json_invalid"],
    ["root", jsonResponse({ id: 1 }), "schema_mismatch"],
  ];
  for (const [name, response, code] of cases) {
    await context.test(name, async () => {
      const { deps, log } = dependencies([response]);
      const outcome = await collectAbve(input(), deps);
      assert.equal(outcome.status, "blocked");
      assert.equal(outcome.error?.error_code, code);
      assert.equal(log.urls.length, 1);
    });
  }
});

test("one malformed item among valid items is partial and safely rejected", async () => {
  const malformed = wpPost(2, "2026-01-02T09:00:00", { content: { rendered: "missing protected" } });
  const { deps } = dependencies([jsonResponse([wpPost(1, "2026-01-02T10:00:00"), malformed])]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.counts.items_rejected, 1);
  const rejected = outcome.items.find(({ manifest_item }) => manifest_item.classification === "rejected");
  assert.deepEqual(rejected?.manifest_item.native_identity, null);
  assert.equal(rejected?.manifest_item.diagnostic?.message.includes("missing protected"), false);
});

test("an observable descending-order inversion is partial", async () => {
  const { deps } = dependencies([jsonResponse([
    wpPost(1, "2026-01-02T10:00:00"),
    wpPost(2, "2026-01-02T11:00:00"),
  ])]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.error?.error_code, "pagination_inconsistent");
});

test("an observable pagination cardinality gap is partial", async () => {
  const { deps } = dependencies([
    jsonResponse([wpPost(1, "2026-01-02T10:00:00")], { total: 100, totalPages: 2 }),
    jsonResponse([wpPost(2, "2026-01-02T09:00:00")], { total: 100, totalPages: 2 }),
  ]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.cursor_out, null);
  assert.equal(outcome.error?.error_code, "pagination_inconsistent");
});

test("failed and blocked outcomes expose zero terminal counts", async (context) => {
  const zeroCounts = {
    items_found: 0,
    items_new: 0,
    items_unchanged: 0,
    items_changed: 0,
    items_inaccessible: 0,
    items_rejected: 0,
    items_removal_candidates: 0,
  };

  await context.test("blocked after the only item is rejected", async () => {
    const malformed = wpPost(1, "2026-01-02T10:00:00", {
      content: { rendered: "missing protected" },
    });
    const { deps } = dependencies([jsonResponse([malformed])]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "blocked");
    assert.deepEqual(outcome.counts, zeroCounts);
  });

  await context.test("failed before any usable output", async () => {
    const { deps } = dependencies([
      rawResponse(null, 503),
      rawResponse(null, 503),
      rawResponse(null, 503),
    ]);
    const outcome = await collectAbve(input(), deps);
    assert.equal(outcome.status, "failed");
    assert.deepEqual(outcome.counts, zeroCounts);
  });
});

test("incremental prior manifest requires an expected hash and detects payload tampering", async (context) => {
  const original = priorManifest();

  await context.test("missing expected hash", async () => {
    const { deps, log } = dependencies([]);
    const outcome = await collectAbve({
      ...input(CURSOR),
      prior_manifest: { manifest: original } as unknown as NonNullable<CollectAbveInput["prior_manifest"]>,
    }, deps);
    assert.equal(outcome.status, "blocked");
    assert.equal(outcome.error?.error_code, "prior_manifest_unavailable");
    assert.deepEqual(outcome.counts, {
      items_found: 0,
      items_new: 0,
      items_unchanged: 0,
      items_changed: 0,
      items_inaccessible: 0,
      items_rejected: 0,
      items_removal_candidates: 0,
    });
    assert.equal(log.urls.length, 0);
  });

  await context.test("payload changed after hashing", async () => {
    const expectedHash = responseManifestHash(original.payload);
    const tampered: CollectionManifestV1 = {
      ...original,
      payload: {
        ...original.payload,
        window: { ...original.payload.window, end: "2026-01-02T01:00:00.000Z" },
      },
    };
    const { deps, log } = dependencies([]);
    const outcome = await collectAbve({
      ...input(CURSOR),
      prior_manifest: { manifest: tampered, expected_hash: expectedHash },
    }, deps);
    assert.equal(outcome.status, "blocked");
    assert.equal(outcome.error?.error_code, "prior_manifest_unavailable");
    assert.equal(log.urls.length, 0);
  });
});

test("incremental prior manifest must match configuration and cursor window", async (context) => {
  async function assertPriorBlocked(prior: CollectionManifestV1): Promise<void> {
    const { deps, log } = dependencies([]);
    const outcome = await collectAbve(input(CURSOR, prior), deps);
    assert.equal(outcome.status, "blocked");
    assert.equal(outcome.error?.error_kind, "contract");
    assert.equal(outcome.error?.error_code, "prior_manifest_unavailable");
    assert.equal(log.urls.length, 0);
  }

  await context.test("different config fingerprint", async () => {
    await assertPriorBlocked(priorManifest([], CURSOR.before, "b".repeat(64)));
  });

  await context.test("different window end", async () => {
    const compatible = priorManifest();
    const incompatible: CollectionManifestV1 = {
      ...compatible,
      payload: {
        ...compatible.payload,
        window: { ...compatible.payload.window, end: "2026-01-01T23:59:59.000Z" },
      },
    };
    await assertPriorBlocked(incompatible);
  });

  await context.test("different freeze boundary", async () => {
    const compatible = priorManifest();
    const incompatible: CollectionManifestV1 = {
      ...compatible,
      payload: {
        ...compatible.payload,
        window: { ...compatible.payload.window, freeze_before: "2026-01-01T23:59:59.000Z" },
      },
    };
    await assertPriorBlocked(incompatible);
  });

  await context.test("fully compatible manifest", async () => {
    const original = wpPost(1, "2026-01-01T12:00:00");
    const { deps } = dependencies([jsonResponse([original])]);
    const outcome = await collectAbve(input(CURSOR, priorManifest([validItem(original)])), deps);
    assert.equal(outcome.status, "no_change");
    assert.equal(outcome.items[0]?.manifest_item.classification, "unchanged");
  });
});

test("ABVE config fingerprint excludes suggested interval and includes request config", () => {
  const baseline = abveConfigFingerprint(ABVE_ENDPOINT_CONTRACT);
  const intervalOnly = {
    ...ABVE_ENDPOINT_CONTRACT,
    suggested_interval: "14 days",
  } as unknown as typeof ABVE_ENDPOINT_CONTRACT;
  const requestChanged = {
    ...ABVE_ENDPOINT_CONTRACT,
    request_config: {
      ...ABVE_ENDPOINT_CONTRACT.request_config,
      timeout_ms: 29_999,
    },
  } as unknown as typeof ABVE_ENDPOINT_CONTRACT;
  assert.equal(abveConfigFingerprint(intervalOnly), baseline);
  assert.notEqual(abveConfigFingerprint(requestChanged), baseline);
});

test("raw response hash covers exact bytes before parsing", async () => {
  const body = ` [ ${JSON.stringify(wpPost(1, "2026-01-02T10:00:00"))} ]\n`;
  const { deps } = dependencies([rawResponse(body, 200, {
    "Content-Type": "application/json; charset=UTF-8",
    "X-WP-Total": "1",
    "X-WP-TotalPages": "1",
  })]);
  const outcome = await collectAbve(input(), deps);
  assert.equal(outcome.status, "succeeded");
  assert.equal(outcome.requests[0]?.byte_length, Buffer.byteLength(body));
  assert.equal(outcome.requests[0]?.response_body_sha256, sha256Bytes(Buffer.from(body)));
});

test("requests are sorted and deterministic headers exclude volatile values", async () => {
  const { deps } = dependencies([
    jsonResponse(wpPosts(1, 50, Date.parse("2026-01-02T12:00:00.000Z")), {
      total: 51,
      totalPages: 2,
      headers: { Date: "volatile", Server: "hidden", "Set-Cookie": "secret=value", ETag: "stable" },
    }),
    jsonResponse([wpPost(51, "2026-01-02T11:00:00.000Z")], { total: 51, totalPages: 2 }),
  ]);
  const outcome = await collectAbve(input(), deps);
  assert.deepEqual(outcome.requests.map(({ page }) => page), [1, 2]);
  assert.equal(outcome.requests[0]?.stable_headers.ETag, "stable");
  assert.equal(Object.hasOwn(outcome.requests[0]?.stable_headers ?? {}, "Date"), false);
  assert.equal(Object.hasOwn(outcome.requests[0]?.stable_headers ?? {}, "Server"), false);
  assert.equal(Object.hasOwn(outcome.requests[0]?.stable_headers ?? {}, "Set-Cookie"), false);
});
