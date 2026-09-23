import { randomUUID } from "node:crypto";

import { canonicalJson } from "./canonical-json.js";
import {
  ABVE_ENDPOINT_CONTRACT,
  abveConfigFingerprint,
  collectAbve,
  type AbveAdapterDependencies,
  type AbveCollectionOutcome,
  type AbveCursor,
  type PriorManifestInput,
} from "./abve-adapter.js";
import {
  manifestReference,
  readManifestReference,
  writeManifestAtomic,
} from "./artifacts.js";
import {
  ConcurrentRunError,
  openPostgresCollectionRunStore,
  type CollectionRunStore,
  type CompleteCollectionRun,
  type FinishCollectionRunInput,
} from "./collection-run-store.js";
import { resolveCollectorVersion } from "./collector-version.js";
import { COLLECTOR_NAME, MANIFEST_VERSION } from "./constants.js";
import type { CollectionManifestV1, ManifestRequest } from "./manifest.js";

const LEASE_MILLISECONDS = 5 * 60 * 1_000;
const INITIATED_BY = /^[A-Za-z0-9._@-]{1,128}$/u;

export interface CollectorExecutionResult {
  readonly exitCode: number;
  readonly stdout?: string;
  readonly stderr?: string;
}

export interface CollectorEnvironment {
  readonly CHARGEBR_COLLECTOR_DATABASE_URL?: string;
  readonly CHARGEBR_COLLECTOR_INITIATED_BY?: string;
}

export interface AbveRunnerDependencies {
  readonly openStore: (connectionString: string) => Promise<CollectionRunStore>;
  readonly collect: typeof collectAbve;
  readonly writeManifest: typeof writeManifestAtomic;
  readonly readManifest: typeof readManifestReference;
  readonly resolveVersion: () => string;
  readonly uuid: () => string;
  readonly now: () => number;
  readonly sleep: (milliseconds: number) => Promise<void>;
  readonly fetch: AbveAdapterDependencies["fetch"];
  readonly rootDirectory: string;
}

const DEFAULT_DEPENDENCIES: AbveRunnerDependencies = {
  openStore: openPostgresCollectionRunStore,
  collect: collectAbve,
  writeManifest: writeManifestAtomic,
  readManifest: readManifestReference,
  resolveVersion: resolveCollectorVersion,
  uuid: randomUUID,
  now: () => Date.now(),
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  fetch: (input, init) => fetch(input, init),
  rootDirectory: process.cwd(),
};

class RunStateError extends Error {}

export async function runAbveCollector(
  environment: CollectorEnvironment,
  dependencyOverrides: Partial<AbveRunnerDependencies> = {},
): Promise<CollectorExecutionResult> {
  const dependencies = { ...DEFAULT_DEPENDENCIES, ...dependencyOverrides };
  const databaseUrl = environment.CHARGEBR_COLLECTOR_DATABASE_URL;
  const initiatedBy = environment.CHARGEBR_COLLECTOR_INITIATED_BY;
  if (databaseUrl === undefined || databaseUrl === "") {
    return internalFailure("missing_database_url");
  }
  if (initiatedBy === undefined || !INITIATED_BY.test(initiatedBy)) {
    return internalFailure("invalid_initiated_by");
  }

  let store: CollectionRunStore | undefined;
  let runId: string | undefined;
  try {
    store = await dependencies.openStore(databaseUrl);
    const endpoint = await store.resolveAbveEndpoint();
    if (
      endpoint === null || endpoint.contract.status !== "active" ||
      !contractMatches(endpoint.contract)
    ) {
      return {
        exitCode: 69,
        stderr: "source_unavailable: ABVE endpoint is missing, inactive, or contract-incompatible\n",
      };
    }

    const reconciliationAt = utcInstant(dependencies.now());
    const concurrent = await reconcileRunningRun(store, endpoint.id, reconciliationAt);
    if (concurrent !== null) {
      return concurrent;
    }

    const previous = await store.findLatestCompleteRun(endpoint.id);
    const cursorIn = previous === null ? null : requireCursor(previous);
    const priorManifest = await loadPriorManifest(dependencies, previous);
    const runStartedAt = utcInstant(dependencies.now());
    const runKey = dependencies.uuid();
    const configFingerprint = abveConfigFingerprint(endpoint.contract);
    const collectorVersion = dependencies.resolveVersion();

    try {
      runId = await store.startRun({
        endpointId: endpoint.id,
        runKey,
        startedAt: runStartedAt,
        staleAfterAt: addLease(runStartedAt),
        initiatedBy,
        collectorVersion,
        configFingerprint,
        windowStart: cursorIn?.before ?? null,
        windowEnd: runStartedAt,
        cursorIn,
      });
    } catch (error) {
      if (error instanceof ConcurrentRunError) {
        return await store.findRunningRun(endpoint.id) === null
          ? internalFailure("concurrent_insert_without_running_run")
          : concurrentResult();
      }
      throw error;
    }

    const heartbeat = async (): Promise<void> => {
      const heartbeatAt = utcInstant(dependencies.now());
      try {
        if (!await store?.heartbeat(runId as string, heartbeatAt, addLease(heartbeatAt))) {
          throw new RunStateError("collection run is no longer running");
        }
      } catch (error) {
        if (error instanceof RunStateError) {
          throw error;
        }
        throw new RunStateError("collection run heartbeat failed");
      }
    };
    await heartbeat();
    const startedMilliseconds = dependencies.now();
    const outcome = await dependencies.collect(
      {
        contract: endpoint.contract,
        run_started_at: runStartedAt,
        cursor_in: cursorIn,
        prior_manifest: priorManifest,
      },
      {
        fetch: async (input, init) => {
          await heartbeat();
          try {
            return await dependencies.fetch(input, init);
          } finally {
            await heartbeat();
          }
        },
        sleep: async (milliseconds) => {
          await heartbeat();
          await dependencies.sleep(milliseconds);
          await heartbeat();
        },
        isFatalError: (error) => error instanceof RunStateError,
      },
    );
    await heartbeat();

    const manifest: CollectionManifestV1 = {
      manifest_version: MANIFEST_VERSION,
      envelope: {
        run_key: runKey,
        collector_name: COLLECTOR_NAME,
        collector_version: collectorVersion,
        started_at: runStartedAt,
        request_attempt_count: outcome.attempt_history.length,
        attempt_history: outcome.attempt_history,
        duration_ms: Math.max(0, dependencies.now() - startedMilliseconds),
      },
      payload: outcome.manifest_payload,
    };
    await heartbeat();
    await dependencies.writeManifest(dependencies.rootDirectory, manifest);
    await heartbeat();

    const reference = manifestReference(runKey);
    const finishedAt = utcInstant(dependencies.now());
    const terminal = terminalSnapshot(outcome, finishedAt, reference);
    if (!await store.finishRun(runId, terminal)) {
      throw new RunStateError("collection run terminal transition affected no row");
    }
    return outcomeResult(runKey, outcome, reference);
  } catch (error) {
    if (store !== undefined && runId !== undefined && !(error instanceof RunStateError)) {
      await finishUnexpectedFailure(store, runId, dependencies.now).catch(() => undefined);
    }
    return internalFailure(error instanceof RunStateError ? "run_state_changed" : "collector_internal_error");
  } finally {
    await store?.close().catch(() => undefined);
  }
}

async function reconcileRunningRun(
  store: CollectionRunStore,
  endpointId: string,
  reconciliationAt: string,
): Promise<CollectorExecutionResult | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const running = await store.findRunningRun(endpointId);
    if (running === null) {
      return null;
    }
    if (Date.parse(running.staleAfterAt) > Date.parse(reconciliationAt)) {
      return concurrentResult();
    }
    if (await store.interruptStaleRun(running.id, reconciliationAt)) {
      return null;
    }
  }
  return concurrentResult();
}

function requireCursor(previous: CompleteCollectionRun): AbveCursor {
  if (previous.cursorOut === null) {
    throw new Error("latest complete run has no cursor_out");
  }
  return previous.cursorOut;
}

async function loadPriorManifest(
  dependencies: AbveRunnerDependencies,
  previous: CompleteCollectionRun | null,
): Promise<PriorManifestInput | null> {
  if (previous === null) {
    return null;
  }
  if (previous.manifestHash === null || previous.manifestReference === null) {
    return null;
  }
  try {
    const manifest = await dependencies.readManifest(
      dependencies.rootDirectory,
      previous.manifestReference,
    );
    if (manifest.envelope.run_key !== previous.runKey) {
      return null;
    }
    return {
      manifest,
      expected_hash: previous.manifestHash,
    };
  } catch {
    return null;
  }
}

function terminalSnapshot(
  outcome: AbveCollectionOutcome,
  finishedAt: string,
  reference: string,
): FinishCollectionRunInput {
  const singleRequest = outcome.requests.length === 1 ? outcome.requests[0] : undefined;
  const stableHeaders = singleRequest?.stable_headers;
  return {
    status: outcome.status,
    finishedAt,
    staleAfterAt: addLease(finishedAt),
    cursorOut: outcome.cursor_out,
    requestAttemptCount: outcome.attempt_history.length,
    manifestHash: outcome.response_manifest_hash,
    manifestReference: reference,
    httpStatus: singleRequest?.status_code ?? null,
    responseContentType: singleRequest?.content_type ?? null,
    etag: stableHeaders?.ETag ?? null,
    lastModified: stableHeaders?.["Last-Modified"] ?? null,
    responseBytes: sumResponseBytes(outcome.requests),
    counts: outcome.counts,
    diagnostic: outcome.error,
    handoffStatus: outcome.status === "succeeded"
      ? "ready_for_extraction"
      : outcome.status === "no_change"
        ? "not_produced"
        : "withheld",
  };
}

function sumResponseBytes(requests: readonly ManifestRequest[]): number | null {
  return requests.length === 0
    ? null
    : requests.reduce((total, request) => total + request.byte_length, 0);
}

async function finishUnexpectedFailure(
  store: CollectionRunStore,
  runId: string,
  now: () => number,
): Promise<void> {
  const finishedAt = utcInstant(now());
  await store.finishRun(runId, {
    status: "failed",
    finishedAt,
    staleAfterAt: addLease(finishedAt),
    cursorOut: null,
    requestAttemptCount: 0,
    manifestHash: null,
    manifestReference: null,
    httpStatus: null,
    responseContentType: null,
    etag: null,
    lastModified: null,
    responseBytes: null,
    counts: {
      items_found: 0,
      items_new: 0,
      items_unchanged: 0,
      items_changed: 0,
      items_inaccessible: 0,
      items_rejected: 0,
      items_removal_candidates: 0,
    },
    diagnostic: {
      error_kind: "internal",
      error_code: "unexpected_error",
      error_message: "The collector stopped after an internal operational error.",
    },
    handoffStatus: "withheld",
  });
}

function outcomeResult(
  runKey: string,
  outcome: AbveCollectionOutcome,
  reference: string,
): CollectorExecutionResult {
  const exitCode = outcome.status === "partial"
    ? 2
    : outcome.status === "failed"
      ? 3
      : outcome.status === "blocked"
        ? 4
        : 0;
  const stderr = outcome.error === null
    ? undefined
    : `${outcome.error.error_kind}:${outcome.error.error_code}: ${outcome.error.error_message}\n`;
  return {
    exitCode,
    stdout: `${JSON.stringify({
      run_key: runKey,
      endpoint_key: ABVE_ENDPOINT_CONTRACT.endpoint_key,
      status: outcome.status,
      counts: outcome.counts,
      bytes: sumResponseBytes(outcome.requests),
      manifest_reference: reference,
      manifest_hash: outcome.response_manifest_hash,
      exit_code: exitCode,
    })}\n`,
    ...(stderr === undefined ? {} : { stderr }),
  };
}

function concurrentResult(): CollectorExecutionResult {
  return {
    exitCode: 5,
    stderr: "collection_in_progress: an unexpired ABVE collection run already exists\n",
  };
}

function internalFailure(code: string): CollectorExecutionResult {
  return {
    exitCode: 70,
    stderr: `internal_error: ${code}\n`,
  };
}

function addLease(value: string): string {
  return new Date(Date.parse(value) + LEASE_MILLISECONDS).toISOString();
}

function utcInstant(milliseconds: number): string {
  const date = new Date(milliseconds);
  if (Number.isNaN(date.valueOf())) {
    throw new Error("clock returned an invalid instant");
  }
  return date.toISOString();
}

function contractMatches(contract: typeof ABVE_ENDPOINT_CONTRACT): boolean {
  try {
    return canonicalJson(contract) === canonicalJson(ABVE_ENDPOINT_CONTRACT);
  } catch {
    return false;
  }
}
