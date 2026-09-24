import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { canonicalJson } from "../../src/collector/canonical-json.js";
import {
  extractionArtifactPaths,
  renderExtractionReview,
  writeExtractionArtifactsAtomic,
} from "../../src/extractor/artifacts.js";
import {
  createExtractionPackage,
  type AbveExtractionPackageV1,
} from "../../src/extractor/package.js";

const producedFixture = await loadFixture("abve-package-produced-v1.json");

test("extraction artifact paths accept only lowercase SHA-256 keys", () => {
  const root = join(tmpdir(), "chargebr-extractor-root");
  const paths = extractionArtifactPaths(root, producedFixture.envelope.extraction_key);
  assert.equal(
    paths.candidates,
    join(
      root,
      ".chargebr",
      "extraction-runs",
      producedFixture.envelope.extraction_key,
      "candidates.v1.json",
    ),
  );
  for (const invalid of ["../escape", "/absolute", "A".repeat(64), "a".repeat(63)]) {
    assert.throws(() => extractionArtifactPaths(root, invalid), /lowercase SHA-256/u);
  }
});

test("candidate and review artifacts publish atomically with private permissions", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "chargebr-extraction-artifacts-"));
  context.after(async () => rm(root, { recursive: true, force: true }));

  const paths = await writeExtractionArtifactsAtomic(root, producedFixture);
  assert.equal(await readFile(paths.candidates, "utf8"), canonicalJson(producedFixture));
  const review = await readFile(paths.review, "utf8");
  assert.match(review, /decisão humana: `pending`/u);
  assert.match(review, /&quot;fingerprint_equal&quot;:true/u);
  assert.match(review, /&quot;oracle&quot;:&quot;carga 0003&quot;/u);
  assert.match(review, /&quot;human_decision&quot;:&quot;pending&quot;/u);
  assert.doesNotMatch(review, /<p>|mercado brasileiro de veículos leves manteve/iu);

  const entries = await readdir(paths.parentDirectory);
  assert.deepEqual(entries, [producedFixture.envelope.extraction_key]);
  if (process.platform !== "win32") {
    assert.equal((await stat(paths.parentDirectory)).mode & 0o777, 0o700);
    assert.equal((await stat(paths.directory)).mode & 0o777, 0o700);
    assert.equal((await stat(paths.candidates)).mode & 0o777, 0o600);
    assert.equal((await stat(paths.review)).mode & 0o777, 0o600);
  }
});

test("writing the same deterministic artifacts twice is idempotent", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "chargebr-extraction-idempotent-"));
  context.after(async () => rm(root, { recursive: true, force: true }));

  const first = await writeExtractionArtifactsAtomic(root, producedFixture);
  const firstCandidates = await readFile(first.candidates, "utf8");
  const second = await writeExtractionArtifactsAtomic(root, producedFixture);
  assert.deepEqual(second, first);
  assert.equal(await readFile(second.candidates, "utf8"), firstCandidates);
  assert.deepEqual(await readdir(first.parentDirectory), [producedFixture.envelope.extraction_key]);
});

test("the same extraction key cannot silently overwrite different provenance", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "chargebr-extraction-conflict-"));
  context.after(async () => rm(root, { recursive: true, force: true }));
  await writeExtractionArtifactsAtomic(root, producedFixture);

  const conflicting = createExtractionPackage({
    run_key: "123e4567-e89b-42d3-b456-426614174001",
    extractor_version: producedFixture.envelope.extractor_version,
    started_at: "2026-09-24T01:02:03.000Z",
    duration_ms: 999,
    payload: producedFixture.payload,
  });
  await assert.rejects(
    writeExtractionArtifactsAtomic(root, conflicting),
    /already exist with different bytes/u,
  );
});

test("review rendering contains package evidence but no additional decision", () => {
  const review = renderExtractionReview(producedFixture);
  assert.match(review, new RegExp(producedFixture.envelope.extraction_key, "u"));
  assert.match(review, new RegExp(producedFixture.envelope.payload_hash, "u"));
  assert.match(review, /25\.782 emplacamentos de veículos leves BEV/u);
  assert.doesNotMatch(review, /decisão humana: `(?:accept_new|link_existing|correct|reject)`/u);
});

async function loadFixture(name: string): Promise<AbveExtractionPackageV1> {
  return JSON.parse(
    await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8"),
  ) as AbveExtractionPackageV1;
}
