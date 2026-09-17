import { canonicalJson, type CanonicalJsonValue } from "./canonical-json.js";
import {
  COLLECTOR_NAME,
  CONTRACT_VERSION,
  MANIFEST_VERSION,
} from "./constants.js";
import { sha256CanonicalJson } from "./hash.js";

const SHA256_HEX = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

export const ITEM_CLASSIFICATIONS = [
  "new",
  "unchanged",
  "changed",
  "inaccessible",
  "rejected",
] as const;

export type ItemClassification = (typeof ITEM_CLASSIFICATIONS)[number];

export interface ManifestItemDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly page: number;
  readonly index: number;
}

export interface ManifestItem {
  readonly native_identity: CanonicalJsonValue | null;
  readonly canonical_url: string | null;
  readonly content_fingerprint: string | null;
  readonly classification: ItemClassification;
  readonly diagnostic?: ManifestItemDiagnostic;
}

export interface ManifestStableHeaders {
  readonly "Content-Type"?: string;
  readonly "Content-Length"?: string;
  readonly ETag?: string;
  readonly "Last-Modified"?: string;
  readonly "X-WP-Total"?: string;
  readonly "X-WP-TotalPages"?: string;
  readonly Link?: string;
}

export interface ManifestRequest {
  readonly page: number;
  readonly canonical_url: string;
  readonly attempt_count: number;
  readonly outcome: string;
  readonly status_code: number | null;
  readonly content_type: string | null;
  readonly byte_length: number;
  readonly response_body_sha256: string | null;
  readonly stable_headers: ManifestStableHeaders;
}

export interface ManifestAttempt {
  readonly page: number;
  readonly attempt: number;
  readonly outcome: string;
  readonly status_code?: number;
  readonly retry_delay_ms?: number;
}

export interface ManifestWindow {
  readonly start: string | null;
  readonly end: string;
  readonly freeze_before: string;
}

export interface AggregateCounts {
  readonly items_found: number;
  readonly items_new: number;
  readonly items_unchanged: number;
  readonly items_changed: number;
  readonly items_inaccessible: number;
  readonly items_rejected: number;
  readonly items_removal_candidates: 0;
}

export interface ManifestPayload {
  readonly contract_version: typeof CONTRACT_VERSION;
  readonly config_fingerprint: string;
  readonly endpoint_key: string;
  readonly window: ManifestWindow;
  readonly requests: readonly ManifestRequest[];
  readonly items: readonly ManifestItem[];
  readonly aggregate_counts: AggregateCounts;
}

export interface ManifestEnvelope {
  readonly run_key: string;
  readonly collector_name: typeof COLLECTOR_NAME;
  readonly collector_version: string;
  readonly started_at: string;
  readonly request_attempt_count?: number;
  readonly attempt_history?: readonly ManifestAttempt[];
  readonly duration_ms?: number;
}

export interface CollectionManifestV1 {
  readonly manifest_version: typeof MANIFEST_VERSION;
  readonly envelope: ManifestEnvelope;
  readonly payload: ManifestPayload;
}

export interface PublicConfigProjection {
  readonly contract_version: typeof CONTRACT_VERSION;
  readonly [key: string]: CanonicalJsonValue;
}

export function deriveAggregateCounts(items: readonly ManifestItem[]): AggregateCounts {
  const counts = {
    new: 0,
    unchanged: 0,
    changed: 0,
    inaccessible: 0,
    rejected: 0,
  } satisfies Record<ItemClassification, number>;

  for (const item of items) {
    counts[item.classification] += 1;
  }

  return {
    items_found: items.length,
    items_new: counts.new,
    items_unchanged: counts.unchanged,
    items_changed: counts.changed,
    items_inaccessible: counts.inaccessible,
    items_rejected: counts.rejected,
    items_removal_candidates: 0,
  };
}

export function sortManifestItems(items: readonly ManifestItem[]): ManifestItem[] {
  return [...items].sort((left, right) => {
    const identityOrder = compareLexicographically(
      canonicalJson(left.native_identity),
      canonicalJson(right.native_identity),
    );
    return identityOrder !== 0
      ? identityOrder
      : compareLexicographically(left.canonical_url ?? "", right.canonical_url ?? "") ||
          (left.diagnostic?.page ?? 0) - (right.diagnostic?.page ?? 0) ||
          (left.diagnostic?.index ?? 0) - (right.diagnostic?.index ?? 0);
  });
}

export function sortManifestRequests(requests: readonly ManifestRequest[]): ManifestRequest[] {
  return [...requests].sort(
    (left, right) =>
      left.page - right.page || compareLexicographically(left.canonical_url, right.canonical_url),
  );
}

export function createManifestPayload(
  input: Omit<ManifestPayload, "contract_version" | "requests" | "items" | "aggregate_counts"> & {
    readonly requests: readonly ManifestRequest[];
    readonly items: readonly ManifestItem[];
  },
): ManifestPayload {
  const requests = sortManifestRequests(input.requests);
  const items = sortManifestItems(input.items);
  const payload: ManifestPayload = {
    contract_version: CONTRACT_VERSION,
    config_fingerprint: input.config_fingerprint,
    endpoint_key: input.endpoint_key,
    window: input.window,
    requests,
    items,
    aggregate_counts: deriveAggregateCounts(items),
  };
  validateManifestPayload(payload);
  return payload;
}

export function responseManifestHash(payload: ManifestPayload): string {
  validateManifestPayload(payload);
  return sha256CanonicalJson({
    ...payload,
    requests: payload.requests.map(({ attempt_count: _attemptCount, ...request }) => request),
  });
}

export function configFingerprint(projection: PublicConfigProjection): string {
  if (Object.hasOwn(projection, "collector_version")) {
    throw new Error("collector_version must not be part of the public config projection");
  }
  if (projection.contract_version !== CONTRACT_VERSION) {
    throw new Error("Invalid config contract_version");
  }
  return sha256CanonicalJson(projection);
}

export function validateManifest(manifest: CollectionManifestV1): void {
  if (manifest.manifest_version !== MANIFEST_VERSION) {
    throw new Error("Invalid manifest_version");
  }
  if (!UUID.test(manifest.envelope.run_key)) {
    throw new Error("Invalid run_key");
  }
  if (manifest.envelope.collector_name !== COLLECTOR_NAME) {
    throw new Error("Invalid collector_name");
  }
  if (!GIT_SHA.test(manifest.envelope.collector_version)) {
    throw new Error("Invalid collector_version");
  }
  validateUtcInstant(manifest.envelope.started_at, "started_at");
  validateManifestPayload(manifest.payload);
}

export function validateManifestPayload(payload: ManifestPayload): void {
  if (payload.contract_version !== CONTRACT_VERSION) {
    throw new Error("Invalid contract_version");
  }
  if (!SHA256_HEX.test(payload.config_fingerprint)) {
    throw new Error("Invalid config_fingerprint");
  }
  if (payload.endpoint_key.length === 0) {
    throw new Error("Invalid endpoint_key");
  }
  if (payload.window.start !== null) {
    validateUtcInstant(payload.window.start, "window.start");
  }
  validateUtcInstant(payload.window.end, "window.end");
  validateUtcInstant(payload.window.freeze_before, "window.freeze_before");

  for (const request of payload.requests) {
    if (!Number.isInteger(request.page) || request.page < 1) {
      throw new Error("Invalid request page");
    }
    if (!Number.isInteger(request.byte_length) || request.byte_length < 0) {
      throw new Error("Invalid request byte_length");
    }
    if (!Number.isInteger(request.attempt_count) || request.attempt_count < 1) {
      throw new Error("Invalid request attempt_count");
    }
    if (!/^[a-z0-9_]+$/u.test(request.outcome)) {
      throw new Error("Invalid request outcome");
    }
    if (
      request.status_code !== null &&
      (!Number.isInteger(request.status_code) || request.status_code < 100 || request.status_code > 599)
    ) {
      throw new Error("Invalid request status_code");
    }
    if (request.response_body_sha256 !== null && !SHA256_HEX.test(request.response_body_sha256)) {
      throw new Error("Invalid response_body_sha256");
    }
    validateStableHeaders(request.stable_headers);
  }

  for (const item of payload.items) {
    if (!ITEM_CLASSIFICATIONS.includes(item.classification)) {
      throw new Error("Invalid item classification");
    }
    if (
      item.content_fingerprint !== null &&
      !SHA256_HEX.test(item.content_fingerprint)
    ) {
      throw new Error("Invalid content_fingerprint");
    }
    if (
      item.classification !== "rejected" &&
      (item.native_identity === null || item.canonical_url === null || item.content_fingerprint === null)
    ) {
      throw new Error("Classified item is missing identity or fingerprint");
    }
  }

  if (canonicalJson(payload.requests) !== canonicalJson(sortManifestRequests(payload.requests))) {
    throw new Error("Manifest requests are not deterministically sorted");
  }
  if (canonicalJson(payload.items) !== canonicalJson(sortManifestItems(payload.items))) {
    throw new Error("Manifest items are not deterministically sorted");
  }

  const expectedCounts = deriveAggregateCounts(payload.items);
  if (sha256CanonicalJson(expectedCounts) !== sha256CanonicalJson(payload.aggregate_counts)) {
    throw new Error("Aggregate counts do not match items");
  }
}

const STABLE_HEADER_NAMES = new Set([
  "Content-Type",
  "Content-Length",
  "ETag",
  "Last-Modified",
  "X-WP-Total",
  "X-WP-TotalPages",
  "Link",
]);

function validateStableHeaders(headers: ManifestStableHeaders): void {
  for (const [name, value] of Object.entries(headers)) {
    if (!STABLE_HEADER_NAMES.has(name) || typeof value !== "string") {
      throw new Error("Invalid stable request header");
    }
  }
}

function compareLexicographically(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function validateUtcInstant(value: string, field: string): void {
  const parsed = new Date(value);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value) ||
    Number.isNaN(parsed.valueOf())
  ) {
    throw new Error(`Invalid ${field}`);
  }
}
