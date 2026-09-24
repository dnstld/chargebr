import assert from "node:assert/strict";
import test from "node:test";

import {
  ABVE_ENDPOINT_CONTRACT,
  abveConfigFingerprint,
} from "../../src/collector/abve-adapter.js";
import { manifestReference } from "../../src/collector/artifacts.js";
import { validateAndNormalizeAbvePost } from "../../src/collector/abve-post.js";
import {
  COLLECTOR_NAME,
  CONTRACT_VERSION,
  MANIFEST_VERSION,
} from "../../src/collector/constants.js";
import {
  createManifestPayload,
  responseManifestHash,
  type CollectionManifestV1,
  type ItemClassification,
  type ManifestItem,
} from "../../src/collector/manifest.js";
import type {
  ExtractionCollectionRun,
  ResolvedAbveEndpoint,
} from "../../src/collector/collection-run-store.js";
import type { AbveRefetchResult } from "../../src/extractor/abve-refetch.js";
import {
  ExtractionHandoffError,
  prepareAbveExtractionHandoff,
  type ExtractionRunStore,
} from "../../src/extractor/handoff.js";

const RUN_KEY = "529a3eeb-6921-417e-a750-b58bcb97899a";
const ITEM_ID = 19617;
const COLLECTOR_VERSION = "0123456789abcdef0123456789abcdef01234567";
const URL =
  "https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano";

function rawPost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: ITEM_ID,
    date: "2026-08-11T17:09:21",
    date_gmt: "2026-08-11T20:09:21",
    modified: "2026-08-26T14:07:23",
    slug: "eletrificados-conquistam-21-de-participacao-de-mercado-em-julho",
    link: `${URL}/`,
    title: {
      rendered:
        "Eletrificados conquistam 21% de participação de mercado e devem atingir 450 mil em 2026",
    },
    excerpt: { rendered: "<p>Resumo público.</p>", protected: false },
    content: { rendered: "<p>Os BEV lideraram, com 25.782 unidades.</p>", protected: false },
    ...overrides,
  };
}

function validatedPost(overrides: Record<string, unknown> = {}) {
  const validation = validateAndNormalizeAbvePost(rawPost(overrides));
  assert.equal(validation.ok, true);
  if (!validation.ok) throw new Error("invalid test post");
  return validation.post;
}

function createManifest(
  options: {
    readonly classification?: ItemClassification;
    readonly items?: readonly ManifestItem[];
    readonly collectorVersion?: string;
  } = {},
): CollectionManifestV1 {
  const post = validatedPost();
  const items = options.items ?? [{
    native_identity: { id: ITEM_ID },
    canonical_url: URL,
    content_fingerprint: post.fingerprint,
    classification: options.classification ?? "new",
  }];
  return {
    manifest_version: MANIFEST_VERSION,
    envelope: {
      run_key: RUN_KEY,
      collector_name: COLLECTOR_NAME,
      collector_version: options.collectorVersion ?? COLLECTOR_VERSION,
      started_at: "2026-09-23T19:42:41.659Z",
    },
    payload: createManifestPayload({
      config_fingerprint: abveConfigFingerprint(ABVE_ENDPOINT_CONTRACT),
      endpoint_key: ABVE_ENDPOINT_CONTRACT.endpoint_key,
      window: {
        start: null,
        end: "2026-09-23T19:42:41.659Z",
        freeze_before: "2026-09-23T19:42:41.659Z",
      },
      requests: [],
      items,
    }),
  };
}

function createRun(
  manifest: CollectionManifestV1,
  overrides: Partial<ExtractionCollectionRun> = {},
): ExtractionCollectionRun {
  return {
    runKey: RUN_KEY,
    status: "succeeded",
    handoffStatus: "ready_for_extraction",
    manifestHash: responseManifestHash(manifest.payload),
    manifestReference: manifestReference(RUN_KEY),
    collectorName: COLLECTOR_NAME,
    collectorVersion: COLLECTOR_VERSION,
    contractVersion: CONTRACT_VERSION,
    configFingerprint: abveConfigFingerprint(ABVE_ENDPOINT_CONTRACT),
    ...overrides,
  };
}

function refetchSuccess(overrides: Record<string, unknown> = {}): AbveRefetchResult {
  return {
    ok: true,
    post: validatedPost(overrides),
    response: {
      request_url: `${ABVE_ENDPOINT_CONTRACT.endpoint_url}/${ITEM_ID}?context=view`,
      attempt_count: 1,
      status_code: 200,
      content_type: "application/json",
      byte_length: 1234,
      response_body_sha256: "c".repeat(64),
    },
    attempts: [{ attempt: 1, outcome: "success", status_code: 200 }],
  };
}

class FakeStore implements ExtractionRunStore {
  endpointCalls = 0;
  runCalls = 0;

  constructor(
    readonly endpoint: ResolvedAbveEndpoint | null,
    readonly run: ExtractionCollectionRun | null,
  ) {}

  async resolveAbveEndpoint() {
    this.endpointCalls += 1;
    return this.endpoint;
  }

  async findRunForExtraction(endpointId: string, runKey: string) {
    this.runCalls += 1;
    assert.equal(endpointId, "42");
    assert.equal(runKey, RUN_KEY);
    return this.run;
  }
}

function approvedEndpoint(): ResolvedAbveEndpoint {
  return { id: "42", contract: ABVE_ENDPOINT_CONTRACT };
}

test("handoff proves run, manifest, item, URL, and fingerprint before exposing the post", async () => {
  const manifest = createManifest();
  const store = new FakeStore(approvedEndpoint(), createRun(manifest));
  let readCalls = 0;
  let refetchCalls = 0;
  const result = await prepareAbveExtractionHandoff(
    { run_key: RUN_KEY, item_id: ITEM_ID },
    {
      store,
      rootDirectory: "/workspace",
      readManifest: async (root, reference) => {
        readCalls += 1;
        assert.equal(root, "/workspace");
        assert.equal(reference, manifestReference(RUN_KEY));
        return manifest;
      },
      refetch: async (contract, itemId) => {
        refetchCalls += 1;
        assert.deepEqual(contract, ABVE_ENDPOINT_CONTRACT);
        assert.equal(itemId, ITEM_ID);
        return refetchSuccess();
      },
    },
  );

  assert.equal(store.endpointCalls, 1);
  assert.equal(store.runCalls, 1);
  assert.equal(readCalls, 1);
  assert.equal(refetchCalls, 1);
  assert.equal(result.classification, "new");
  assert.deepEqual(result.extraction_input, {
    endpoint_key: "abve-news-wordpress-posts",
    manifest_hash: responseManifestHash(manifest.payload),
    native_identity: { id: ITEM_ID },
    canonical_url: URL,
    expected_content_fingerprint: validatedPost().fingerprint,
    observed_content_fingerprint: validatedPost().fingerprint,
    normalization_profile: "abve-wordpress-post-v1",
  });
  assert.equal(result.post.normalized.content.rendered.includes("25.782"), true);
});

test("invalid public input blocks before endpoint or HTTP access", async () => {
  const manifest = createManifest();
  const store = new FakeStore(approvedEndpoint(), createRun(manifest));
  let refetchCalls = 0;
  await assert.rejects(
    prepareAbveExtractionHandoff(
      { run_key: "not-a-uuid", item_id: 0 },
      {
        store,
        rootDirectory: "/workspace",
        refetch: async () => {
          refetchCalls += 1;
          return refetchSuccess();
        },
      },
    ),
    (error: unknown) => handoffCode(error) === "input_invalid",
  );
  assert.equal(store.endpointCalls, 0);
  assert.equal(refetchCalls, 0);
});

test("an endpoint contract mismatch blocks before run lookup or HTTP", async () => {
  const manifest = createManifest();
  const incompatibleEndpoint = {
    id: "42",
    contract: { ...ABVE_ENDPOINT_CONTRACT, status: "inactive" },
  } as unknown as ResolvedAbveEndpoint;
  const store = new FakeStore(incompatibleEndpoint, createRun(manifest));
  let refetchCalls = 0;
  await assert.rejects(
    prepareAbveExtractionHandoff(
      { run_key: RUN_KEY, item_id: ITEM_ID },
      {
        store,
        rootDirectory: "/workspace",
        refetch: async () => {
          refetchCalls += 1;
          return refetchSuccess();
        },
      },
    ),
    (error: unknown) => handoffCode(error) === "endpoint_contract_mismatch",
  );
  assert.equal(store.runCalls, 0);
  assert.equal(refetchCalls, 0);
});

test("run readiness and manifest reference block before local read or HTTP", async (context) => {
  const manifest = createManifest();
  for (const [name, overrides, expectedCode] of [
    ["failed status", { status: "failed" }, "run_not_ready"],
    ["withheld handoff", { handoffStatus: "withheld" }, "run_not_ready"],
    ["config fingerprint", { configFingerprint: "b".repeat(64) }, "run_contract_mismatch"],
    ["wrong reference", { manifestReference: "local:.chargebr/collection-runs/other/manifest.v1.json" }, "manifest_reference_mismatch"],
  ] as const) {
    await context.test(name, async () => {
      const store = new FakeStore(approvedEndpoint(), createRun(manifest, overrides));
      let readCalls = 0;
      let refetchCalls = 0;
      await assert.rejects(
        prepareAbveExtractionHandoff(
          { run_key: RUN_KEY, item_id: ITEM_ID },
          {
            store,
            rootDirectory: "/workspace",
            readManifest: async () => {
              readCalls += 1;
              return manifest;
            },
            refetch: async () => {
              refetchCalls += 1;
              return refetchSuccess();
            },
          },
        ),
        (error: unknown) => handoffCode(error) === expectedCode,
      );
      assert.equal(readCalls, 0);
      assert.equal(refetchCalls, 0);
    });
  }
});

test("an unavailable or invalid local manifest blocks before HTTP", async () => {
  const manifest = createManifest();
  const store = new FakeStore(approvedEndpoint(), createRun(manifest));
  let refetchCalls = 0;
  await assert.rejects(
    prepareAbveExtractionHandoff(
      { run_key: RUN_KEY, item_id: ITEM_ID },
      {
        store,
        rootDirectory: "/workspace",
        readManifest: async () => {
          throw new Error("local detail must not escape");
        },
        refetch: async () => {
          refetchCalls += 1;
          return refetchSuccess();
        },
      },
    ),
    (error: unknown) =>
      error instanceof ExtractionHandoffError &&
      error.code === "manifest_unavailable" &&
      !error.message.includes("local detail"),
  );
  assert.equal(refetchCalls, 0);
});

test("manifest hash and provenance mismatches block before HTTP", async (context) => {
  const cases: ReadonlyArray<{
    readonly name: string;
    readonly manifest: CollectionManifestV1;
    readonly runOverrides: Partial<ExtractionCollectionRun>;
    readonly code: string;
  }> = [
    {
      name: "hash",
      manifest: createManifest(),
      runOverrides: { manifestHash: "b".repeat(64) },
      code: "manifest_hash_mismatch",
    },
    {
      name: "collector version",
      manifest: createManifest({ collectorVersion: "f".repeat(40) }),
      runOverrides: {},
      code: "manifest_contract_mismatch",
    },
  ];

  for (const item of cases) {
    await context.test(item.name, async () => {
      const store = new FakeStore(
        approvedEndpoint(),
        createRun(item.manifest, item.runOverrides),
      );
      let refetchCalls = 0;
      await assert.rejects(
        prepareAbveExtractionHandoff(
          { run_key: RUN_KEY, item_id: ITEM_ID },
          {
            store,
            rootDirectory: "/workspace",
            readManifest: async () => item.manifest,
            refetch: async () => {
              refetchCalls += 1;
              return refetchSuccess();
            },
          },
        ),
        (error: unknown) => handoffCode(error) === item.code,
      );
      assert.equal(refetchCalls, 0);
    });
  }
});

test("only one new or changed item is eligible for HTTP", async (context) => {
  const post = validatedPost();
  const duplicate: ManifestItem = {
    native_identity: { id: ITEM_ID },
    canonical_url: URL,
    content_fingerprint: post.fingerprint,
    classification: "new",
  };
  const cases: ReadonlyArray<{
    readonly name: string;
    readonly manifest: CollectionManifestV1;
    readonly code: string;
  }> = [
    { name: "missing", manifest: createManifest({ items: [] }), code: "item_unavailable" },
    {
      name: "duplicate",
      manifest: createManifest({ items: [duplicate, duplicate] }),
      code: "item_ambiguous",
    },
    {
      name: "unchanged",
      manifest: createManifest({ classification: "unchanged" }),
      code: "item_ineligible",
    },
  ];

  for (const item of cases) {
    await context.test(item.name, async () => {
      const store = new FakeStore(approvedEndpoint(), createRun(item.manifest));
      let refetchCalls = 0;
      await assert.rejects(
        prepareAbveExtractionHandoff(
          { run_key: RUN_KEY, item_id: ITEM_ID },
          {
            store,
            rootDirectory: "/workspace",
            readManifest: async () => item.manifest,
            refetch: async () => {
              refetchCalls += 1;
              return refetchSuccess();
            },
          },
        ),
        (error: unknown) => handoffCode(error) === item.code,
      );
      assert.equal(refetchCalls, 0);
    });
  }
});

test("re-fetch must prove exact id, URL, and fingerprint", async (context) => {
  const manifest = createManifest();
  const cases: ReadonlyArray<{
    readonly name: string;
    readonly result: AbveRefetchResult;
    readonly code: string;
  }> = [
    {
      name: "id",
      result: refetchSuccess({ id: ITEM_ID + 1 }),
      code: "identity_mismatch",
    },
    {
      name: "URL",
      result: refetchSuccess({ link: "https://abve.org.br/outro-post/" }),
      code: "url_mismatch",
    },
    {
      name: "fingerprint",
      result: refetchSuccess({ title: { rendered: "Título alterado" } }),
      code: "fingerprint_mismatch",
    },
  ];

  for (const item of cases) {
    await context.test(item.name, async () => {
      const store = new FakeStore(approvedEndpoint(), createRun(manifest));
      await assert.rejects(
        prepareAbveExtractionHandoff(
          { run_key: RUN_KEY, item_id: ITEM_ID },
          {
            store,
            rootDirectory: "/workspace",
            readManifest: async () => manifest,
            refetch: async () => item.result,
          },
        ),
        (error: unknown) => handoffCode(error) === item.code,
      );
    });
  }
});

test("a sanitized re-fetch failure is preserved only as a detail code", async () => {
  const manifest = createManifest();
  const store = new FakeStore(approvedEndpoint(), createRun(manifest));
  await assert.rejects(
    prepareAbveExtractionHandoff(
      { run_key: RUN_KEY, item_id: ITEM_ID },
      {
        store,
        rootDirectory: "/workspace",
        readManifest: async () => manifest,
        refetch: async () => ({
          ok: false,
          terminal_status: "blocked",
          diagnostic: {
            error_kind: "http",
            error_code: "http_404",
            error_message: "sanitized",
          },
          attempts: [{ attempt: 1, outcome: "http_404", status_code: 404 }],
        }),
      },
    ),
    (error: unknown) =>
      error instanceof ExtractionHandoffError &&
      error.code === "refetch_failed" &&
      error.detailCode === "http_404" &&
      !error.message.includes("sanitized"),
  );
});

function handoffCode(error: unknown): string | undefined {
  return error instanceof ExtractionHandoffError ? error.code : undefined;
}
