import {
  COLLECTOR_NAME,
  CONTRACT_VERSION,
  MANIFEST_VERSION,
} from "../../src/collector/constants.js";
import {
  configFingerprint,
  createManifestPayload,
  type CollectionManifestV1,
  type ManifestItem,
  type ManifestRequest,
  type PublicConfigProjection,
} from "../../src/collector/manifest.js";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);

export const PUBLIC_CONFIG_FIXTURE: PublicConfigProjection = {
  contract_version: CONTRACT_VERSION,
  source_slug: "example",
  endpoint_key: "example-posts",
  endpoint_url: "https://example.invalid/posts",
  method: "GET",
};

export const ITEM_FIXTURES: readonly ManifestItem[] = [
  {
    native_identity: { id: 2 },
    canonical_url: "https://example.invalid/post/2",
    content_fingerprint: HASH_B,
    classification: "changed",
  },
  {
    native_identity: { id: 1 },
    canonical_url: "https://example.invalid/post/1",
    content_fingerprint: HASH_A,
    classification: "new",
  },
  {
    native_identity: { id: 3 },
    canonical_url: "https://example.invalid/post/3",
    content_fingerprint: HASH_A,
    classification: "unchanged",
  },
  {
    native_identity: { id: 4 },
    canonical_url: "https://example.invalid/post/4",
    content_fingerprint: HASH_B,
    classification: "inaccessible",
  },
  {
    native_identity: { id: 5 },
    canonical_url: "https://example.invalid/post/5",
    content_fingerprint: HASH_A,
    classification: "rejected",
  },
];

export const REQUEST_FIXTURES: readonly ManifestRequest[] = [
  {
    page: 2,
    canonical_url: "https://example.invalid/posts?page=2",
    attempt_count: 1,
    outcome: "success",
    status_code: 200,
    content_type: "application/json",
    byte_length: 20,
    response_body_sha256: HASH_B,
    stable_headers: { "Content-Type": "application/json" },
  },
  {
    page: 1,
    canonical_url: "https://example.invalid/posts?page=1",
    attempt_count: 1,
    outcome: "success",
    status_code: 200,
    content_type: "application/json",
    byte_length: 10,
    response_body_sha256: HASH_A,
    stable_headers: { "Content-Type": "application/json" },
  },
];

export function createPayloadFixture() {
  return createManifestPayload({
    config_fingerprint: configFingerprint(PUBLIC_CONFIG_FIXTURE),
    endpoint_key: "example-posts",
    window: {
      start: null,
      end: "2026-01-02T03:04:05.000Z",
      freeze_before: "2026-01-02T03:04:05.000Z",
    },
    requests: REQUEST_FIXTURES,
    items: ITEM_FIXTURES,
  });
}

export function createManifestFixture(
  runKey = "123e4567-e89b-42d3-a456-426614174000",
  startedAt = "2026-01-02T03:04:05.000Z",
): CollectionManifestV1 {
  return {
    manifest_version: MANIFEST_VERSION,
    envelope: {
      run_key: runKey,
      collector_name: COLLECTOR_NAME,
      collector_version: "0123456789abcdef0123456789abcdef01234567",
      started_at: startedAt,
      request_attempt_count: 2,
      duration_ms: 123,
    },
    payload: createPayloadFixture(),
  };
}
