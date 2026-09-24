import assert from "node:assert/strict";
import test from "node:test";

import { ABVE_ENDPOINT_CONTRACT } from "../../src/collector/abve-adapter.js";
import {
  buildAbvePostUrl,
  refetchAbvePost,
  type AbveRefetchDependencies,
} from "../../src/extractor/abve-refetch.js";

interface DependencyLog {
  readonly urls: string[];
  readonly inits: RequestInit[];
  readonly sleeps: number[];
  readonly timeouts: number[];
}

function wpPost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 19617,
    date: "2026-08-11T17:09:21",
    date_gmt: "2026-08-11T20:09:21",
    modified: "2026-08-26T14:07:23",
    slug: "eletrificados-conquistam-21-de-participacao-de-mercado-em-julho",
    link: "https://abve.org.br/post-piloto/",
    title: { rendered: "Post piloto" },
    excerpt: { rendered: "<p>Resumo.</p>", protected: false },
    content: { rendered: "<p>Conteúdo piloto.</p>", protected: false },
    ...overrides,
  };
}

function jsonResponse(value: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8", ...headers },
  });
}

function rawResponse(
  value: string | null,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(value, { status, headers });
}

function dependencies(queue: Array<Response | Error>): {
  readonly deps: AbveRefetchDependencies;
  readonly log: DependencyLog;
} {
  const log: DependencyLog = { urls: [], inits: [], sleeps: [], timeouts: [] };
  const deps: AbveRefetchDependencies = {
    fetch: async (url, init) => {
      log.urls.push(url);
      log.inits.push(init);
      const next = queue.shift();
      if (next === undefined) throw new Error("response queue exhausted");
      if (next instanceof Error) throw next;
      return next;
    },
    sleep: async (milliseconds) => {
      log.sleeps.push(milliseconds);
    },
    random: () => 0.5,
    now: () => Date.parse("2026-09-24T00:00:00.000Z"),
    createAbortTimeout: (milliseconds) => {
      log.timeouts.push(milliseconds);
      const controller = new AbortController();
      return { signal: controller.signal, cancel: () => undefined };
    },
  };
  return { deps, log };
}

test("post re-fetch uses the exact approved GET projection and returns evidence", async () => {
  const { deps, log } = dependencies([jsonResponse(wpPost())]);
  const result = await refetchAbvePost(ABVE_ENDPOINT_CONTRACT, 19617, deps);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const requestUrl = new URL(log.urls[0] ?? "");
  assert.equal(requestUrl.origin + requestUrl.pathname, `${ABVE_ENDPOINT_CONTRACT.endpoint_url}/19617`);
  assert.deepEqual([...requestUrl.searchParams.keys()].sort(), ["_fields", "context"]);
  assert.equal(
    requestUrl.searchParams.get("_fields"),
    "id,date,date_gmt,modified,slug,link,title,excerpt,content",
  );
  assert.equal(requestUrl.searchParams.get("context"), "view");
  assert.equal(log.inits[0]?.method, "GET");
  assert.deepEqual(log.inits[0]?.headers, { Accept: "application/json" });
  assert.equal(log.inits[0]?.redirect, "manual");
  assert.deepEqual(log.timeouts, [30_000]);
  assert.deepEqual(result.post.identity, { id: 19617 });
  assert.equal(result.post.publicationDateGmt, "2026-08-11T20:09:21");
  assert.match(result.post.fingerprint, /^[0-9a-f]{64}$/u);
  assert.equal(result.response.request_url, buildAbvePostUrl(ABVE_ENDPOINT_CONTRACT, 19617));
  assert.equal(result.response.status_code, 200);
  assert.match(result.response.response_body_sha256, /^[0-9a-f]{64}$/u);
  assert.equal(JSON.stringify(result.response).includes("Conteúdo piloto"), false);
});

test("post re-fetch shares bounded retry and Retry-After behavior", async () => {
  const retryable = dependencies([
    rawResponse(null, 503),
    jsonResponse(wpPost()),
  ]);
  const success = await refetchAbvePost(ABVE_ENDPOINT_CONTRACT, 19617, retryable.deps);
  assert.equal(success.ok, true);
  assert.deepEqual(retryable.log.sleeps, [500]);
  assert.deepEqual(success.attempts.map(({ outcome }) => outcome), ["http_503", "success"]);

  const tooLong = dependencies([
    rawResponse(null, 429, { "Retry-After": "241" }),
  ]);
  const failure = await refetchAbvePost(ABVE_ENDPOINT_CONTRACT, 19617, tooLong.deps);
  assert.equal(failure.ok, false);
  if (failure.ok) return;
  assert.equal(failure.terminal_status, "failed");
  assert.equal(failure.diagnostic.error_code, "retry_after_too_long");
  assert.deepEqual(tooLong.log.sleeps, []);
});

test("post re-fetch blocks cross-host redirects before consuming a body", async () => {
  const { deps, log } = dependencies([
    rawResponse(null, 302, { Location: "https://example.invalid/post" }),
  ]);
  const result = await refetchAbvePost(ABVE_ENDPOINT_CONTRACT, 19617, deps);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.terminal_status, "blocked");
  assert.equal(result.diagnostic.error_code, "redirect_host_not_allowed");
  assert.equal(log.urls.length, 1);
});

test("post re-fetch blocks invalid format, schema, and declared size", async (context) => {
  const cases: ReadonlyArray<{
    readonly name: string;
    readonly response: () => Response;
    readonly code: string;
  }> = [
    {
      name: "content type",
      response: () => rawResponse("{}", 200, { "Content-Type": "text/html" }),
      code: "content_type_unexpected",
    },
    {
      name: "invalid JSON",
      response: () => rawResponse("not json", 200, { "Content-Type": "application/json" }),
      code: "json_invalid",
    },
    {
      name: "schema mismatch",
      response: () => jsonResponse([wpPost()]),
      code: "schema_mismatch",
    },
    {
      name: "declared size",
      response: () => rawResponse(null, 200, {
        "Content-Type": "application/json",
        "Content-Length": "2000001",
      }),
      code: "response_too_large",
    },
  ];

  for (const item of cases) {
    await context.test(item.name, async () => {
      const { deps } = dependencies([item.response()]);
      const result = await refetchAbvePost(ABVE_ENDPOINT_CONTRACT, 19617, deps);
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.terminal_status, "blocked");
      assert.equal(result.diagnostic.error_code, item.code);
    });
  }
});

test("post re-fetch rejects invalid item ids without HTTP", async () => {
  const { deps, log } = dependencies([]);
  const result = await refetchAbvePost(ABVE_ENDPOINT_CONTRACT, 0, deps);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.diagnostic.error_code, "item_id_invalid");
  assert.deepEqual(log.urls, []);
  assert.throws(() => buildAbvePostUrl(ABVE_ENDPOINT_CONTRACT, 0), /item_id_invalid/u);
});
