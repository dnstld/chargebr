import { chmod, mkdir, mkdtemp, open, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";

import { canonicalJson } from "../collector/canonical-json.js";
import {
  serializeExtractionPackage,
  validateExtractionPackage,
  type AbveExtractionPackageV1,
} from "./package.js";

const SHA256_HEX = /^[0-9a-f]{64}$/u;
export const EXTRACTION_CANDIDATES_FILE_NAME = "candidates.v1.json" as const;
export const EXTRACTION_REVIEW_FILE_NAME = "review.v1.md" as const;

export interface ExtractionArtifactPaths {
  readonly parentDirectory: string;
  readonly directory: string;
  readonly candidates: string;
  readonly review: string;
}

export function extractionArtifactPaths(
  rootDirectory: string,
  extractionKey: string,
): ExtractionArtifactPaths {
  if (!SHA256_HEX.test(extractionKey)) {
    throw new Error("extraction_key must be a lowercase SHA-256 hash");
  }
  const parentDirectory = join(rootDirectory, ".chargebr", "extraction-runs");
  const directory = join(parentDirectory, extractionKey);
  return {
    parentDirectory,
    directory,
    candidates: join(directory, EXTRACTION_CANDIDATES_FILE_NAME),
    review: join(directory, EXTRACTION_REVIEW_FILE_NAME),
  };
}

export async function writeExtractionArtifactsAtomic(
  rootDirectory: string,
  extractionPackage: AbveExtractionPackageV1,
): Promise<ExtractionArtifactPaths> {
  validateExtractionPackage(extractionPackage);
  const candidates = serializeExtractionPackage(extractionPackage);
  const review = renderExtractionReview(extractionPackage);
  const paths = extractionArtifactPaths(
    rootDirectory,
    extractionPackage.envelope.extraction_key,
  );

  await mkdir(paths.parentDirectory, { recursive: true, mode: 0o700 });
  await chmod(paths.parentDirectory, 0o700);
  const existing = await existingArtifactState(paths, candidates, review);
  if (existing === "match") {
    return paths;
  }
  if (existing === "conflict") {
    throw new Error("extraction artifacts already exist with different bytes");
  }

  const stagingDirectory = await mkdtemp(
    join(paths.parentDirectory, `.${extractionPackage.envelope.extraction_key}.part-`),
  );
  try {
    await chmod(stagingDirectory, 0o700);
    await writePrivateFile(
      join(stagingDirectory, EXTRACTION_CANDIDATES_FILE_NAME),
      candidates,
    );
    await writePrivateFile(join(stagingDirectory, EXTRACTION_REVIEW_FILE_NAME), review);
    await syncDirectory(stagingDirectory);
    try {
      await rename(stagingDirectory, paths.directory);
    } catch (error) {
      const raced = await existingArtifactState(paths, candidates, review);
      if (raced !== "match") {
        throw error;
      }
    }
    await syncDirectory(paths.parentDirectory);
    return paths;
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true }).catch(() => undefined);
  }
}

export function renderExtractionReview(
  extractionPackage: AbveExtractionPackageV1,
): string {
  validateExtractionPackage(extractionPackage);
  const { envelope, payload } = extractionPackage;
  const observation = payload.observation_candidates[0] ?? null;
  const comparison = {
    oracle: "carga 0003",
    canonical_url: {
      candidate: payload.content_item_candidate.canonical_url,
      expected: "https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano",
    },
    normalized_value: {
      candidate: observation?.normalized_value ?? null,
      expected: 25_782,
    },
    measured_period: {
      candidate: observation?.measured_period ?? null,
      expected: { start: "2026-07-01", end: "2026-07-31", granularity: "month" },
    },
    geography: {
      candidate: observation?.geography ?? null,
      expected: "Brasil",
    },
    human_decision: "pending",
  };

  return [
    "# Revisão da extração ABVE v1",
    "",
    "## Estado",
    "",
    "- decisão humana: `pending`",
    `- resultado do extrator: \`${envelope.result_status}\``,
    "- o extrator não promove nem vincula registros canônicos",
    "",
    "## Proveniência e prova de versão",
    "",
    htmlJson({
      run_key: envelope.run_key,
      extraction_key: envelope.extraction_key,
      payload_hash: envelope.payload_hash,
      endpoint_key: payload.input.endpoint_key,
      native_identity: payload.input.native_identity,
      manifest_hash: payload.input.manifest_hash,
      expected_content_fingerprint: payload.input.expected_content_fingerprint,
      observed_content_fingerprint: payload.input.observed_content_fingerprint,
      fingerprint_equal:
        payload.input.expected_content_fingerprint === payload.input.observed_content_fingerprint,
    }),
    "",
    "## Candidato de conteúdo",
    "",
    htmlJson(payload.content_item_candidate),
    "",
    "## Candidato de observação",
    "",
    htmlJson(observation),
    "",
    "## Comparação para revisão humana",
    "",
    htmlJson(comparison),
    "",
    "## Decisão",
    "",
    "`pending`",
    "",
    "Vocabulário permitido: `accept_new`, `link_existing`, `correct` ou `reject`.",
    "A decisão deve ser registrada separadamente e nunca pelo extrator.",
    "",
  ].join("\n");
}

async function writePrivateFile(path: string, contents: string): Promise<void> {
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.writeFile(contents, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await chmod(path, 0o600);
}

async function existingArtifactState(
  paths: ExtractionArtifactPaths,
  candidates: string,
  review: string,
): Promise<"absent" | "match" | "conflict"> {
  try {
    const [existingCandidates, existingReview] = await Promise.all([
      readFile(paths.candidates, "utf8"),
      readFile(paths.review, "utf8"),
    ]);
    return existingCandidates === candidates && existingReview === review ? "match" : "conflict";
  } catch (error) {
    if (isMissing(error)) {
      try {
        await readFile(paths.directory);
        return "conflict";
      } catch (directoryError) {
        return isMissing(directoryError) ? "absent" : "conflict";
      }
    }
    return "conflict";
  }
}

function htmlJson(value: unknown): string {
  return `<pre>${escapeHtml(canonicalJson(value))}</pre>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
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
