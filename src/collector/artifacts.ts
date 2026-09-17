import { chmod, mkdir, open, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

import { canonicalJson } from "./canonical-json.js";
import { MANIFEST_FILE_NAME } from "./constants.js";
import type { CollectionManifestV1 } from "./manifest.js";
import { validateManifest } from "./manifest.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

export interface RunArtifactPaths {
  readonly directory: string;
  readonly manifest: string;
  readonly manifestPart: string;
}

export function runArtifactPaths(rootDirectory: string, runKey: string): RunArtifactPaths {
  if (!UUID.test(runKey)) {
    throw new Error("run_key must be a canonical UUID");
  }
  const directory = join(rootDirectory, ".chargebr", "collection-runs", runKey);
  return {
    directory,
    manifest: join(directory, MANIFEST_FILE_NAME),
    manifestPart: join(directory, `${MANIFEST_FILE_NAME}.part`),
  };
}

export async function writeManifestAtomic(
  rootDirectory: string,
  manifest: CollectionManifestV1,
): Promise<string> {
  validateManifest(manifest);
  const paths = runArtifactPaths(rootDirectory, manifest.envelope.run_key);
  await mkdir(paths.directory, { recursive: true, mode: 0o700 });
  await chmod(paths.directory, 0o700);

  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(paths.manifestPart, "w", 0o600);
    await handle.writeFile(canonicalJson(manifest), "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(paths.manifestPart, paths.manifest);
    await chmod(paths.manifest, 0o600);
    await syncDirectory(paths.directory);
    return paths.manifest;
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(paths.manifestPart).catch(() => undefined);
    throw error;
  }
}

async function syncDirectory(directory: string): Promise<void> {
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(directory, "r");
    await handle.sync();
  } catch (error) {
    if (process.platform !== "win32") {
      throw error;
    }
  } finally {
    await handle?.close().catch(() => undefined);
  }
}
