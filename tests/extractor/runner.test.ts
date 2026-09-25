import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { extractionArtifactPaths } from "../../src/extractor/artifacts.js";
import {
  ExtractionHandoffError,
  type ExtractionRunStore,
  type PreparedAbveHandoff,
} from "../../src/extractor/handoff.js";
import type { AbveExtractionPackageV1 } from "../../src/extractor/package.js";
import {
  runAbveExtraction,
  type AbveExtractionRunnerDependencies,
  type ExtractionStore,
} from "../../src/extractor/runner.js";

const RUN_KEY = "529a3eeb-6921-417e-a750-b58bcb97899a";
const ITEM_ID = 19617;
const DATABASE_URL = "postgresql://collector:secret@example.invalid/db";
const fixture = await loadFixture("abve-package-produced-v1.json");

class ReadOnlyFakeStore implements ExtractionStore {
  closed = 0;

  async resolveAbveEndpoint() {
    return null;
  }

  async findRunForExtraction() {
    return null;
  }

  async close() {
    this.closed += 1;
  }
}

function dependencies(store: ReadOnlyFakeStore): AbveExtractionRunnerDependencies {
  let clock = Date.parse("2026-09-24T18:00:00.000Z");
  return {
    openStore: async (connectionString) => {
      assert.equal(connectionString, DATABASE_URL);
      return store;
    },
    prepareHandoff: async (
      input: { readonly run_key: string; readonly item_id: number },
      handoffDependencies: { readonly store: ExtractionRunStore; readonly rootDirectory: string },
    ) => {
      assert.deepEqual(input, { run_key: RUN_KEY, item_id: ITEM_ID });
      assert.equal(handoffDependencies.store, store);
      assert.equal(handoffDependencies.rootDirectory, "/workspace");
      return {} as PreparedAbveHandoff;
    },
    createPackage: (input) => {
      assert.equal(input.extractor_version, "f".repeat(40));
      assert.equal(input.started_at, "2026-09-24T18:00:00.000Z");
      assert.equal(input.duration_ms, 1);
      return fixture;
    },
    writeArtifacts: async (root, extractionPackage) => {
      assert.equal(root, "/workspace");
      assert.equal(extractionPackage, fixture);
      return extractionArtifactPaths(root, fixture.envelope.extraction_key);
    },
    resolveVersion: () => "f".repeat(40),
    now: () => clock++,
    rootDirectory: "/workspace",
  };
}

test("runner performs the read-only handoff, writes artifacts, and emits a compact summary", async () => {
  const store = new ReadOnlyFakeStore();
  const result = await runAbveExtraction(
    { CHARGEBR_COLLECTOR_DATABASE_URL: DATABASE_URL },
    { run_key: RUN_KEY, item_id: ITEM_ID },
    dependencies(store),
  );
  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, undefined);
  const summary = JSON.parse(result.stdout ?? "") as Record<string, unknown>;
  assert.equal(summary.status, "produced");
  assert.equal(summary.run_key, RUN_KEY);
  assert.equal(summary.item_id, ITEM_ID);
  assert.equal(summary.extraction_key, fixture.envelope.extraction_key);
  assert.equal(JSON.stringify(summary).includes("25.782"), false);
  assert.equal(store.closed, 1);
});

test("invalid input and missing credentials fail before opening a store", async () => {
  let opens = 0;
  const openStore = async () => {
    opens += 1;
    return new ReadOnlyFakeStore();
  };
  const invalid = await runAbveExtraction(
    { CHARGEBR_COLLECTOR_DATABASE_URL: DATABASE_URL },
    { run_key: "invalid", item_id: 0 },
    { openStore },
  );
  const missing = await runAbveExtraction(
    {},
    { run_key: RUN_KEY, item_id: ITEM_ID },
    { openStore },
  );
  assert.equal(invalid.exitCode, 64);
  assert.equal(missing.exitCode, 70);
  assert.equal(opens, 0);
});

test("handoff availability errors map to 69 and contract blockers map to 4", async () => {
  for (const [code, exitCode] of [
    ["run_unavailable", 69],
    ["manifest_unavailable", 69],
    ["run_not_ready", 4],
    ["fingerprint_mismatch", 4],
  ] as const) {
    const store = new ReadOnlyFakeStore();
    const result = await runAbveExtraction(
      { CHARGEBR_COLLECTOR_DATABASE_URL: DATABASE_URL },
      { run_key: RUN_KEY, item_id: ITEM_ID },
      {
        ...dependencies(store),
        prepareHandoff: async () => {
          throw new ExtractionHandoffError(code, "sensitive detail");
        },
      },
    );
    assert.equal(result.exitCode, exitCode);
    assert.equal(result.stderr?.includes("sensitive detail"), false);
    assert.equal(store.closed, 1);
  }
});

test("unexpected failures are sanitized and still close the store", async () => {
  const store = new ReadOnlyFakeStore();
  const result = await runAbveExtraction(
    { CHARGEBR_COLLECTOR_DATABASE_URL: DATABASE_URL },
    { run_key: RUN_KEY, item_id: ITEM_ID },
    {
      ...dependencies(store),
      writeArtifacts: async () => {
        throw new Error("/private/path and editorial body");
      },
    },
  );
  assert.equal(result.exitCode, 70);
  assert.equal(result.stderr, "internal_error: extractor_internal_error\n");
  assert.equal(store.closed, 1);
});

async function loadFixture(name: string): Promise<AbveExtractionPackageV1> {
  return JSON.parse(
    await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8"),
  ) as AbveExtractionPackageV1;
}
