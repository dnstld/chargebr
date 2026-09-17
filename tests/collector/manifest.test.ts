import assert from "node:assert/strict";
import test from "node:test";

import { canonicalJson } from "../../src/collector/canonical-json.js";
import { CONTRACT_VERSION } from "../../src/collector/constants.js";
import {
  configFingerprint,
  deriveAggregateCounts,
  responseManifestHash,
  validateManifest,
  validateManifestPayload,
  type PublicConfigProjection,
} from "../../src/collector/manifest.js";
import {
  createManifestFixture,
  createPayloadFixture,
  ITEM_FIXTURES,
  PUBLIC_CONFIG_FIXTURE,
} from "./fixtures.js";

test("aggregate counts are derived from every exclusive classification", () => {
  const counts = deriveAggregateCounts(ITEM_FIXTURES);
  assert.deepEqual(counts, {
    items_found: 5,
    items_new: 1,
    items_unchanged: 1,
    items_changed: 1,
    items_inaccessible: 1,
    items_rejected: 1,
    items_removal_candidates: 0,
  });
  assert.equal(
    counts.items_found,
    counts.items_new + counts.items_unchanged + counts.items_changed +
      counts.items_inaccessible + counts.items_rejected,
  );
});

test("payload construction sorts items and requests explicitly", () => {
  const payload = createPayloadFixture();
  assert.deepEqual(payload.requests.map((request) => request.page), [1, 2]);
  assert.deepEqual(payload.items.map((item) => item.native_identity), [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ]);
});

test("repeated fixture runs have identical canonical bytes, fingerprints, hashes, and counts", () => {
  const first = createPayloadFixture();
  const second = createPayloadFixture();
  assert.equal(canonicalJson(first), canonicalJson(second));
  assert.equal(configFingerprint(PUBLIC_CONFIG_FIXTURE), configFingerprint(PUBLIC_CONFIG_FIXTURE));
  assert.equal(responseManifestHash(first), responseManifestHash(second));
  assert.deepEqual(first.aggregate_counts, second.aggregate_counts);
});

test("envelope changes do not affect response hash while payload changes do", () => {
  const first = createManifestFixture();
  const second = createManifestFixture(
    "123e4567-e89b-42d3-b456-426614174001",
    "2026-01-03T03:04:05.000Z",
  );
  assert.equal(responseManifestHash(first.payload), responseManifestHash(second.payload));

  const changedPayload = {
    ...first.payload,
    endpoint_key: "different-endpoint",
  };
  assert.notEqual(responseManifestHash(first.payload), responseManifestHash(changedPayload));
});

test("config fingerprint requires the contract and excludes collector_version", () => {
  assert.equal(PUBLIC_CONFIG_FIXTURE.contract_version, CONTRACT_VERSION);
  assert.match(configFingerprint(PUBLIC_CONFIG_FIXTURE), /^[0-9a-f]{64}$/u);

  const invalidProjection = {
    ...PUBLIC_CONFIG_FIXTURE,
    collector_version: "0123456789abcdef0123456789abcdef01234567",
  } as unknown as PublicConfigProjection;
  assert.throws(() => configFingerprint(invalidProjection), /collector_version/u);
});

test("manifest validation rejects incoherent aggregate counts", () => {
  const manifest = createManifestFixture();
  validateManifest(manifest);

  const invalidPayload = {
    ...manifest.payload,
    aggregate_counts: {
      ...manifest.payload.aggregate_counts,
      items_found: 999,
    },
  };
  assert.throws(() => validateManifestPayload(invalidPayload), /Aggregate counts/u);
});

test("manifest validation rejects payload arrays that bypass deterministic sorting", () => {
  const payload = createPayloadFixture();
  assert.throws(
    () => validateManifestPayload({ ...payload, requests: [...payload.requests].reverse() }),
    /requests are not deterministically sorted/u,
  );
  assert.throws(
    () => validateManifestPayload({ ...payload, items: [...payload.items].reverse() }),
    /items are not deterministically sorted/u,
  );
});
