import { openPostgresCollectionRunStore } from "../collector/collection-run-store.js";
import {
  EXTRACTION_CANDIDATES_FILE_NAME,
  EXTRACTION_REVIEW_FILE_NAME,
  writeExtractionArtifactsAtomic,
  type ExtractionArtifactPaths,
} from "./artifacts.js";
import { resolveExtractorVersion } from "./extractor-version.js";
import {
  ExtractionHandoffError,
  prepareAbveExtractionHandoff,
  type ExtractionRunStore,
  type PreparedAbveHandoff,
} from "./handoff.js";
import {
  AbvePilotExtractionError,
  createAbvePilotPackage,
} from "./pilot.js";
import type { AbveExtractionPackageV1 } from "./package.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

export interface ExtractionExecutionResult {
  readonly exitCode: number;
  readonly stdout?: string;
  readonly stderr?: string;
}

export interface ExtractorEnvironment {
  readonly CHARGEBR_COLLECTOR_DATABASE_URL?: string;
}

export interface ExtractionStore extends ExtractionRunStore {
  close(): Promise<void>;
}

export interface AbveExtractionRunnerDependencies {
  readonly openStore: (connectionString: string) => Promise<ExtractionStore>;
  readonly prepareHandoff: (
    input: { readonly run_key: string; readonly item_id: number },
    dependencies: { readonly store: ExtractionRunStore; readonly rootDirectory: string },
  ) => Promise<PreparedAbveHandoff>;
  readonly createPackage: typeof createAbvePilotPackage;
  readonly writeArtifacts: typeof writeExtractionArtifactsAtomic;
  readonly resolveVersion: () => string;
  readonly now: () => number;
  readonly rootDirectory: string;
}

const DEFAULT_DEPENDENCIES: AbveExtractionRunnerDependencies = {
  openStore: openPostgresCollectionRunStore,
  prepareHandoff: (input, dependencies) => prepareAbveExtractionHandoff(input, dependencies),
  createPackage: createAbvePilotPackage,
  writeArtifacts: writeExtractionArtifactsAtomic,
  resolveVersion: resolveExtractorVersion,
  now: () => Date.now(),
  rootDirectory: process.cwd(),
};

export async function runAbveExtraction(
  environment: ExtractorEnvironment,
  input: { readonly run_key: string; readonly item_id: number },
  dependencyOverrides: Partial<AbveExtractionRunnerDependencies> = {},
): Promise<ExtractionExecutionResult> {
  if (!UUID.test(input.run_key) || !Number.isSafeInteger(input.item_id) || input.item_id < 1) {
    return { exitCode: 64, stderr: "invalid_usage: invalid run key or item id\n" };
  }
  const databaseUrl = environment.CHARGEBR_COLLECTOR_DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl === "") {
    return internalFailure("missing_database_url");
  }

  const dependencies = { ...DEFAULT_DEPENDENCIES, ...dependencyOverrides };
  const startedMilliseconds = dependencies.now();
  let store: ExtractionStore | undefined;
  try {
    const extractorVersion = dependencies.resolveVersion();
    store = await dependencies.openStore(databaseUrl);
    const handoff = await dependencies.prepareHandoff(input, {
      store,
      rootDirectory: dependencies.rootDirectory,
    });
    const extractionPackage = dependencies.createPackage({
      handoff,
      extractor_version: extractorVersion,
      started_at: utcInstant(startedMilliseconds),
      duration_ms: Math.max(0, dependencies.now() - startedMilliseconds),
    });
    const paths = await dependencies.writeArtifacts(
      dependencies.rootDirectory,
      extractionPackage,
    );
    return successResult(extractionPackage, paths);
  } catch (error) {
    if (error instanceof ExtractionHandoffError) {
      return unavailableHandoffCodes.has(error.code)
        ? unavailable(error.code)
        : blocked(error.code, error.detailCode);
    }
    if (error instanceof AbvePilotExtractionError) {
      return blocked(error.code);
    }
    return internalFailure("extractor_internal_error");
  } finally {
    await store?.close().catch(() => undefined);
  }
}

const unavailableHandoffCodes = new Set([
  "endpoint_unavailable",
  "run_unavailable",
  "manifest_unavailable",
  "item_unavailable",
]);

function successResult(
  extractionPackage: AbveExtractionPackageV1,
  paths: ExtractionArtifactPaths,
): ExtractionExecutionResult {
  const { envelope, payload } = extractionPackage;
  return {
    exitCode: 0,
    stdout: `${JSON.stringify({
      run_key: envelope.run_key,
      item_id: payload.input.native_identity.id,
      status: envelope.result_status,
      extraction_key: envelope.extraction_key,
      payload_hash: envelope.payload_hash,
      candidates_reference: localReference(envelope.extraction_key, EXTRACTION_CANDIDATES_FILE_NAME),
      review_reference: localReference(envelope.extraction_key, EXTRACTION_REVIEW_FILE_NAME),
      aggregate_counts: payload.aggregate_counts,
      exit_code: 0,
    })}\n`,
  };
}

function localReference(extractionKey: string, fileName: string): string {
  return `local:.chargebr/extraction-runs/${extractionKey}/${fileName}`;
}

function unavailable(code: string): ExtractionExecutionResult {
  return { exitCode: 69, stderr: `source_unavailable: ${code}\n` };
}

function blocked(code: string, detailCode?: string): ExtractionExecutionResult {
  return {
    exitCode: 4,
    stderr: `blocked: ${code}${detailCode === undefined ? "" : `:${detailCode}`}\n`,
  };
}

function internalFailure(code: string): ExtractionExecutionResult {
  return { exitCode: 70, stderr: `internal_error: ${code}\n` };
}

function utcInstant(milliseconds: number): string {
  const value = new Date(milliseconds);
  if (Number.isNaN(value.valueOf())) {
    throw new Error("invalid extraction start time");
  }
  return value.toISOString();
}
