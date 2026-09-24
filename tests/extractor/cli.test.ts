import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { extractionArtifactPaths } from "../../src/extractor/artifacts.js";
import { executeExtractionCli } from "../../src/extractor/cli.js";
import type { PreparedAbveHandoff } from "../../src/extractor/handoff.js";
import type { AbveExtractionPackageV1 } from "../../src/extractor/package.js";
import type { AbveExtractionRunnerDependencies } from "../../src/extractor/runner.js";

const RUN_KEY = "529a3eeb-6921-417e-a750-b58bcb97899a";
const fixture = await loadFixture("abve-package-produced-v1.json");

test("extract help prints the single approved invocation", async () => {
  for (const flag of ["--help", "-h"]) {
    const result = await executeExtractionCli([flag]);
    assert.equal(result.exitCode, 0);
    assert.equal(
      result.stdout,
      "Usage: pnpm extract abve --run-key <uuid> --item-id <wordpress-id>\n",
    );
  }
});

test("extract CLI rejects alternate sources, flags, order, and extra arguments", async () => {
  const cases = [
    [],
    ["aneel", "--run-key", RUN_KEY, "--item-id", "19617"],
    ["abve", "--item-id", "19617", "--run-key", RUN_KEY],
    ["abve", "--run-key", RUN_KEY, "--item-id", "not-an-id"],
    ["abve", "--run-key", RUN_KEY, "--item-id", "19617", "--persist"],
    ["abve", "--run-key", RUN_KEY, "--item-id", "19617", "--url", "https://example.invalid"],
  ];
  for (const args of cases) {
    const result = await executeExtractionCli(args);
    assert.equal(result.exitCode, 64);
    assert.match(result.stderr ?? "", /^invalid_usage/u);
    assert.equal(result.stdout, undefined);
  }
});

test("extract CLI passes only the public run and item keys to the runner", async () => {
  const previous = process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
  process.env.CHARGEBR_COLLECTOR_DATABASE_URL = "postgresql://collector:secret@example.invalid/db";
  try {
    let observedInput: unknown;
    const result = await executeExtractionCli(
      ["abve", "--run-key", RUN_KEY, "--item-id", "19617"],
      successfulDependencies((input) => {
        observedInput = input;
      }),
    );
    assert.equal(result.exitCode, 0);
    assert.deepEqual(observedInput, { run_key: RUN_KEY, item_id: 19617 });
  } finally {
    if (previous === undefined) delete process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
    else process.env.CHARGEBR_COLLECTOR_DATABASE_URL = previous;
  }
});

test("extract CLI fails closed when the technical credential is absent", async () => {
  const previous = process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
  delete process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
  try {
    const result = await executeExtractionCli([
      "abve",
      "--run-key",
      RUN_KEY,
      "--item-id",
      "19617",
    ]);
    assert.equal(result.exitCode, 70);
    assert.equal(result.stderr, "internal_error: missing_database_url\n");
  } finally {
    if (previous !== undefined) process.env.CHARGEBR_COLLECTOR_DATABASE_URL = previous;
  }
});

function successfulDependencies(
  observe: (input: { readonly run_key: string; readonly item_id: number }) => void,
): AbveExtractionRunnerDependencies {
  return {
    openStore: async () => ({
      resolveAbveEndpoint: async () => null,
      findRunForExtraction: async () => null,
      close: async () => undefined,
    }),
    prepareHandoff: async (input) => {
      observe(input);
      return {} as PreparedAbveHandoff;
    },
    createPackage: () => fixture,
    writeArtifacts: async (root) =>
      extractionArtifactPaths(root, fixture.envelope.extraction_key),
    resolveVersion: () => "f".repeat(40),
    now: () => Date.parse("2026-09-24T18:00:00.000Z"),
    rootDirectory: "/workspace",
  };
}

async function loadFixture(name: string): Promise<AbveExtractionPackageV1> {
  return JSON.parse(
    await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8"),
  ) as AbveExtractionPackageV1;
}
