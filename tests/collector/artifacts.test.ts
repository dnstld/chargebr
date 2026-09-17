import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runArtifactPaths, writeManifestAtomic } from "../../src/collector/artifacts.js";
import { createManifestFixture } from "./fixtures.js";

test("artifact paths accept only canonical UUID run keys", () => {
  const root = join(tmpdir(), "chargebr-root");
  const paths = runArtifactPaths(root, "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(
    paths.manifest,
    join(root, ".chargebr", "collection-runs", "123e4567-e89b-42d3-a456-426614174000", "manifest.v1.json"),
  );
  for (const invalid of ["../escape", "/absolute", "not-a-uuid", "123E4567-E89B-42D3-A456-426614174000"]) {
    assert.throws(() => runArtifactPaths(root, invalid), /canonical UUID/u);
  }
});

test("manifest write is atomic, private, and leaves no part file", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "chargebr-artifacts-"));
  context.after(async () => rm(root, { recursive: true, force: true }));
  const manifest = createManifestFixture();
  const paths = runArtifactPaths(root, manifest.envelope.run_key);

  assert.equal(await writeManifestAtomic(root, manifest), paths.manifest);
  const written = JSON.parse(await readFile(paths.manifest, "utf8")) as unknown;
  assert.deepEqual(written, manifest);
  await assert.rejects(access(paths.manifestPart));

  if (process.platform !== "win32") {
    assert.equal((await stat(paths.directory)).mode & 0o777, 0o700);
    assert.equal((await stat(paths.manifest)).mode & 0o777, 0o600);
  }
});

test("failed manifest write cleans up the part file", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "chargebr-artifacts-failure-"));
  context.after(async () => rm(root, { recursive: true, force: true }));
  const manifest = createManifestFixture();
  const paths = runArtifactPaths(root, manifest.envelope.run_key);
  await mkdir(paths.manifest, { recursive: true });

  await assert.rejects(writeManifestAtomic(root, manifest));
  await assert.rejects(access(paths.manifestPart));
});
