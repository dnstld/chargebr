import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  ANEEL_ENDPOINT_CONTRACT,
  aneelConfigFingerprint,
  collectAneel,
  type AneelAdapterDependencies,
  type CollectAneelInput,
} from "../../src/collector/aneel-adapter.js";
import { COLLECTOR_NAME, MANIFEST_VERSION } from "../../src/collector/constants.js";
import { sha256Bytes } from "../../src/collector/hash.js";
import {
  responseManifestHash,
  type CollectionManifestV1,
} from "../../src/collector/manifest.js";

const RUN_STARTED_AT = "2026-09-30T06:00:00.000Z";

interface FetchLog {
  readonly urls: string[];
  readonly inits: RequestInit[];
  readonly sleeps: number[];
  readonly timeouts: number[];
}

function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
}

function htmlResponse(
  body: string,
  options: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return new Response(Buffer.from(body, "latin1"), {
    status: options.status ?? 200,
    headers: {
      "Content-Type": "text/html; charset=iso-8859-1",
      ...options.headers,
    },
  });
}

function rawResponse(
  body: string | null,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(body, { status, headers });
}

function dependencies(sequence: Array<Response | Error>): {
  readonly deps: AneelAdapterDependencies;
  readonly log: FetchLog;
} {
  const log: FetchLog = { urls: [], inits: [], sleeps: [], timeouts: [] };
  return {
    log,
    deps: {
      fetch: async (url, init) => {
        log.urls.push(url);
        log.inits.push(init);
        const next = sequence.shift();
        assert.ok(next, "fetch sequence was exhausted");
        if (next instanceof Error) throw next;
        return next;
      },
      sleep: async (milliseconds) => { log.sleeps.push(milliseconds); },
      random: () => 0.5,
      now: () => Date.parse("2026-09-30T06:00:00.000Z"),
      createAbortTimeout: (milliseconds) => {
        log.timeouts.push(milliseconds);
        return { signal: new AbortController().signal, cancel: () => undefined };
      },
    },
  };
}

function input(priorManifest?: CollectionManifestV1 | null): CollectAneelInput {
  const base = { contract: ANEEL_ENDPOINT_CONTRACT, run_started_at: RUN_STARTED_AT };
  if (priorManifest === undefined) return base;
  if (priorManifest === null) return { ...base, prior_manifest: null };
  return {
    ...base,
    prior_manifest: {
      manifest: priorManifest,
      expected_hash: responseManifestHash(priorManifest.payload),
    },
  };
}

function successfulSequence(): Response[] {
  return [
    htmlResponse(fixture("aneel-index-final.html")),
    htmlResponse(fixture("aneel-detail-14810.html")),
    htmlResponse(fixture("aneel-detail-14809.html")),
  ];
}

test("ANEEL bootstrap uses the approved GET contract and classifies literal fixtures", async () => {
  const indexFixture = fixture("aneel-index-final.html");
  const { deps, log } = dependencies(successfulSequence());
  const outcome = await collectAneel(input(), deps);

  assert.equal(outcome.status, "succeeded");
  assert.equal(outcome.counts.items_new, 2);
  assert.equal(outcome.counts.items_found, 2);
  assert.equal(outcome.cursor_in, null);
  assert.equal(outcome.cursor_out, null);
  assert.equal(outcome.requests.length, 3);
  assert.equal(log.inits[0]?.method, "GET");
  assert.equal(log.inits[0]?.redirect, "manual");
  assert.deepEqual(log.inits[0]?.headers, { Accept: "text/html" });
  assert.deepEqual(log.timeouts, [20_000, 20_000, 20_000]);
  const firstUrl = new URL(log.urls[0] ?? "");
  assert.equal(firstUrl.hostname, "www2.aneel.gov.br");
  assert.equal(firstUrl.searchParams.get("idAreaNoticia"), "425");
  assert.equal(firstUrl.searchParams.get("page"), "1");
  assert.equal(
    outcome.requests.find(({ canonical_url }) => canonical_url.includes("?idAreaNoticia=425&page=1"))
      ?.response_body_sha256,
    sha256Bytes(Buffer.from(indexFixture, "latin1")),
  );
  assert.deepEqual(outcome.items.map(({ manifest_item }) => manifest_item.native_identity), [
    { idNoticia: 14810 },
    { idNoticia: 14809 },
  ]);
});

test("a complete prior ANEEL manifest produces no_change for identical fixtures", async () => {
  const first = await collectAneel(input(), dependencies(successfulSequence()).deps);
  const prior: CollectionManifestV1 = {
    manifest_version: MANIFEST_VERSION,
    envelope: {
      run_key: "123e4567-e89b-42d3-a456-426614174000",
      collector_name: COLLECTOR_NAME,
      collector_version: "0123456789abcdef0123456789abcdef01234567",
      started_at: RUN_STARTED_AT,
    },
    payload: first.manifest_payload,
  };
  const repeated = await collectAneel(
    { ...input(), prior_manifest: { manifest: prior, expected_hash: first.response_manifest_hash } },
    dependencies(successfulSequence()).deps,
  );
  assert.equal(repeated.status, "no_change");
  assert.equal(repeated.counts.items_unchanged, 2);
  assert.equal(repeated.counts.items_new, 0);
});

test("a missing required ANEEL baseline blocks before HTTP", async () => {
  const { deps, log } = dependencies([]);
  const outcome = await collectAneel(input(null), deps);
  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.error?.error_code, "prior_manifest_unavailable");
  assert.equal(log.urls.length, 0);
});

test("Cloudflare challenge blocks the ANEEL run without retry or retained body", async () => {
  const { deps, log } = dependencies([rawResponse("challenge body", 403, {
    "Content-Type": "text/html; charset=UTF-8",
    "CF-Mitigated": "challenge",
    "Set-Cookie": "secret=value",
  })]);
  const outcome = await collectAneel(input(), deps);
  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.error?.error_kind, "access_policy");
  assert.equal(outcome.error?.error_code, "access_challenge");
  assert.equal(outcome.counts.items_found, 0);
  assert.equal(outcome.requests[0]?.response_body_sha256, null);
  assert.equal(Object.hasOwn(outcome.requests[0]?.stable_headers ?? {}, "Set-Cookie"), false);
  assert.deepEqual(log.sleeps, []);
});

test("charset drift blocks before parsing the ANEEL body", async () => {
  const { deps } = dependencies([rawResponse(fixture("aneel-index-final.html"), 200, {
    "Content-Type": "text/html; charset=UTF-8",
  })]);
  const outcome = await collectAneel(input(), deps);
  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.error?.error_code, "content_type_unexpected");
  assert.equal(outcome.requests[0]?.response_body_sha256, null);
});

test("an inaccessible detail is retained only as a partial manifest item", async () => {
  const { deps } = dependencies([
    htmlResponse(fixture("aneel-index-final.html")),
    rawResponse(null, 403, { "Content-Type": "text/html; charset=UTF-8" }),
    htmlResponse(fixture("aneel-detail-14809.html")),
  ]);
  const outcome = await collectAneel(input(), deps);
  assert.equal(outcome.status, "partial");
  assert.equal(outcome.counts.items_inaccessible, 1);
  assert.equal(outcome.counts.items_new, 1);
  const inaccessible = outcome.items.find(({ manifest_item }) =>
    manifest_item.classification === "inaccessible"
  );
  assert.deepEqual(inaccessible?.manifest_item.native_identity, { idNoticia: 14810 });
  assert.equal(inaccessible?.manifest_item.content_fingerprint, null);
});

test("a cross-host redirect blocks ANEEL before following it", async () => {
  const { deps, log } = dependencies([
    rawResponse(null, 302, { Location: "https://example.invalid/noticias" }),
  ]);
  const outcome = await collectAneel(input(), deps);
  assert.equal(outcome.status, "blocked");
  assert.equal(outcome.error?.error_code, "redirect_host_not_allowed");
  assert.equal(log.urls.length, 1);
});

test("ANEEL config fingerprint excludes interval and includes request limits", () => {
  const baseline = aneelConfigFingerprint(ANEEL_ENDPOINT_CONTRACT);
  const intervalOnly = {
    ...ANEEL_ENDPOINT_CONTRACT,
    suggested_interval: "14 days",
  } as unknown as typeof ANEEL_ENDPOINT_CONTRACT;
  const requestChanged = {
    ...ANEEL_ENDPOINT_CONTRACT,
    request_config: { ...ANEEL_ENDPOINT_CONTRACT.request_config, timeout_ms: 19_999 },
  } as unknown as typeof ANEEL_ENDPOINT_CONTRACT;
  assert.equal(aneelConfigFingerprint(intervalOnly), baseline);
  assert.notEqual(aneelConfigFingerprint(requestChanged), baseline);
});
