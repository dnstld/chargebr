import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { canonicalJson } from "../../src/collector/canonical-json.js";
import {
  candidateKey,
  createExtractionPackage,
  createExtractionPayload,
  createObservationCandidate,
  extractionKey,
  extractionPayloadHash,
  serializeExtractionPackage,
  validateExtractionPackage,
  validateExtractionPayload,
  type AbveExtractionPackageV1,
  type ContentItemCandidate,
  type ExtractionPayload,
  type ObservationCandidateDraft,
} from "../../src/extractor/package.js";

const HASH_B = "b".repeat(64);

const producedFixture = await loadFixture("abve-package-produced-v1.json");
const noCandidatesFixture = await loadFixture("abve-package-no-candidates-v1.json");

test("literal produced and no-candidates fixtures satisfy the v1 contract", () => {
  validateExtractionPackage(producedFixture);
  validateExtractionPackage(noCandidatesFixture);
  assert.equal(producedFixture.envelope.result_status, "produced");
  assert.equal(noCandidatesFixture.envelope.result_status, "no_candidates");
  assert.equal(
    producedFixture.envelope.extraction_key,
    noCandidatesFixture.envelope.extraction_key,
  );
  assert.notEqual(producedFixture.envelope.payload_hash, noCandidatesFixture.envelope.payload_hash);
});

test("builders reproduce the literal produced fixture byte for byte", () => {
  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const { candidate_key: _candidateKey, ...draft } = fixtureCandidate;
  const payload = createExtractionPayload({
    input: producedFixture.payload.input,
    content_item_candidate: producedFixture.payload.content_item_candidate,
    observation_candidates: [draft],
  });
  const extractionPackage = createExtractionPackage({
    run_key: producedFixture.envelope.run_key,
    extractor_version: producedFixture.envelope.extractor_version,
    started_at: producedFixture.envelope.started_at,
    duration_ms: producedFixture.envelope.duration_ms,
    payload,
  });
  assert.deepEqual(extractionPackage, producedFixture);
  assert.equal(serializeExtractionPackage(extractionPackage), canonicalJson(producedFixture));
});

test("the no-candidates fixture has an empty deterministic observation list", () => {
  const payload = createExtractionPayload({
    input: noCandidatesFixture.payload.input,
    content_item_candidate: noCandidatesFixture.payload.content_item_candidate,
    observation_candidates: [],
  });
  const extractionPackage = createExtractionPackage({
    run_key: noCandidatesFixture.envelope.run_key,
    extractor_version: noCandidatesFixture.envelope.extractor_version,
    started_at: noCandidatesFixture.envelope.started_at,
    duration_ms: noCandidatesFixture.envelope.duration_ms,
    payload,
  });
  assert.deepEqual(extractionPackage, noCandidatesFixture);
  assert.equal(payload.aggregate_counts.observation_candidates, 0);
});

test("operational envelope changes do not change deterministic identities", () => {
  const changedEnvelope = createExtractionPackage({
    run_key: "123e4567-e89b-42d3-b456-426614174001",
    extractor_version: "fedcba9876543210fedcba9876543210fedcba98",
    started_at: "2026-09-24T01:02:03.000Z",
    duration_ms: 999,
    payload: producedFixture.payload,
  });
  assert.equal(changedEnvelope.envelope.extraction_key, producedFixture.envelope.extraction_key);
  assert.equal(changedEnvelope.envelope.payload_hash, producedFixture.envelope.payload_hash);
  assert.equal(
    changedEnvelope.payload.observation_candidates[0]?.candidate_key,
    producedFixture.payload.observation_candidates[0]?.candidate_key,
  );
});

test("candidate identity covers value, period, geography, claim, term, and locator", () => {
  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const { candidate_key: fixtureKey, ...draft } = fixtureCandidate;
  const mutations: ObservationCandidateDraft[] = [
    { ...draft, normalized_value: 25783 },
    { ...draft, normalized_claim: `${draft.normalized_claim} Alterada.` },
    {
      ...draft,
      measured_period: { start: "2026-08-01", end: "2026-08-31", granularity: "month" },
    },
    { ...draft, geography: "Argentina" },
    { ...draft, source_claim: `${draft.source_claim} Alterada.` },
    { ...draft, source_term: `${draft.source_term} alterado` },
    { ...draft, locator: `${draft.locator} alterado` },
  ];
  for (const mutation of mutations) {
    assert.notEqual(candidateKey(producedFixture.payload.input, mutation), fixtureKey);
  }

  const invalidUnit = {
    ...draft,
    normalized_unit: "vehicle",
  } as unknown as ObservationCandidateDraft;
  assert.throws(() => candidateKey(producedFixture.payload.input, invalidUnit), /normalized_unit/u);
});

test("extraction identity covers endpoint, native identity, and content fingerprint", () => {
  const original = producedFixture.payload.input;
  assert.notEqual(
    extractionKey({ ...original, native_identity: { id: original.native_identity.id + 1 } }),
    producedFixture.envelope.extraction_key,
  );
  const changedFingerprint = {
    ...original,
    expected_content_fingerprint: HASH_B,
    observed_content_fingerprint: HASH_B,
  };
  assert.notEqual(extractionKey(changedFingerprint), producedFixture.envelope.extraction_key);
});

test("builders sort limitations deterministically and enforce the one-candidate scope", () => {
  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const { candidate_key: _candidateKey, ...draft } = fixtureCandidate;
  const reversedDraft = { ...draft, limitations: [...draft.limitations].reverse() };
  const candidate = createObservationCandidate(producedFixture.payload.input, reversedDraft);
  assert.deepEqual(candidate.limitations, fixtureCandidate.limitations);

  const secondDraft: ObservationCandidateDraft = {
    ...draft,
    normalized_value: 25783,
    normalized_claim: "Brasil: 25.783 emplacamentos de veículos leves BEV em julho de 2026.",
  };
  assert.throws(
    () =>
      createExtractionPayload({
        input: producedFixture.payload.input,
        content_item_candidate: producedFixture.payload.content_item_candidate,
        observation_candidates: [secondDraft, draft],
      }),
    /at most one observation/u,
  );
});

test("fingerprint drift blocks before a payload can be created", () => {
  const invalidInput = {
    ...producedFixture.payload.input,
    observed_content_fingerprint: HASH_B,
  };
  assert.throws(
    () =>
      createExtractionPayload({
        input: invalidInput,
        content_item_candidate: producedFixture.payload.content_item_candidate,
        observation_candidates: [],
      }),
    /does not match manifest/u,
  );
});

test("the contract rejects noncanonical URLs, inferred metadata, and oversized excerpts", () => {
  const content = producedFixture.payload.content_item_candidate;
  const invalidCandidates: ContentItemCandidate[] = [
    { ...content, canonical_url: `${content.canonical_url}/` },
    { ...content, canonical_url: "https://example.com/post" },
    { ...content, language_code: "pt-BR" } as unknown as ContentItemCandidate,
    { ...content, publication_nature: "original" } as unknown as ContentItemCandidate,
    { ...content, evidentiary_excerpt: "x".repeat(321) },
  ];
  for (const content_item_candidate of invalidCandidates) {
    assert.throws(() =>
      createExtractionPayload({
        input: producedFixture.payload.input,
        content_item_candidate,
        observation_candidates: [],
      }),
    );
  }
});

test("unknown fields are rejected so a full body cannot leak into the package", () => {
  const withBody = {
    ...producedFixture.payload.content_item_candidate,
    body: "full editorial body",
  } as unknown as ContentItemCandidate;
  assert.throws(
    () =>
      createExtractionPayload({
        input: producedFixture.payload.input,
        content_item_candidate: withBody,
        observation_candidates: [],
      }),
    /Invalid content_item_candidate fields/u,
  );
});

test("the retained excerpt must be the exact source claim of the single observation", () => {
  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const { candidate_key: _candidateKey, ...draft } = fixtureCandidate;
  assert.throws(
    () =>
      createExtractionPayload({
        input: producedFixture.payload.input,
        content_item_candidate: {
          ...producedFixture.payload.content_item_candidate,
          evidentiary_excerpt: "Trecho diferente.",
        },
        observation_candidates: [draft],
      }),
    /must match the observation source claim/u,
  );
});

test("all free-text observation fields enforce the bounded excerpt policy", () => {
  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const { candidate_key: _candidateKey, ...draft } = fixtureCandidate;
  const longText = "x".repeat(321);
  const mutations: ObservationCandidateDraft[] = [
    { ...draft, source_claim: longText },
    { ...draft, normalized_claim: longText },
    { ...draft, geography: longText },
    { ...draft, source_term: longText },
    { ...draft, locator: longText },
    { ...draft, limitations: [longText] },
  ];
  for (const mutation of mutations) {
    assert.throws(() => candidateKey(producedFixture.payload.input, mutation), /exceeds 320/u);
  }

  assert.throws(
    () =>
      candidateKey(producedFixture.payload.input, {
        ...draft,
        limitations: Array.from({ length: 9 }, (_, index) => `Limitação ${index}.`),
      }),
    /exceed 8/u,
  );
});

test("timestamps and candidate text must be canonical", () => {
  const content = producedFixture.payload.content_item_candidate;
  assert.throws(() =>
    createExtractionPayload({
      input: producedFixture.payload.input,
      content_item_candidate: { ...content, published_local: "2026-02-30T12:00:00" },
      observation_candidates: [],
    }),
  );
  assert.throws(() =>
    createExtractionPayload({
      input: producedFixture.payload.input,
      content_item_candidate: { ...content, published_at_utc: "2026-02-30T12:00:00Z" },
      observation_candidates: [],
    }),
  );

  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const { candidate_key: _candidateKey, ...draft } = fixtureCandidate;
  assert.throws(
    () => candidateKey(producedFixture.payload.input, { ...draft, geography: "Pai\u0301s" }),
    /not normalized/u,
  );
});

test("tampered hashes, statuses, counts, and candidate keys are rejected", () => {
  const tamperedHash = {
    ...producedFixture,
    envelope: { ...producedFixture.envelope, payload_hash: HASH_B },
  };
  assert.throws(() => validateExtractionPackage(tamperedHash), /Payload hash/u);

  const tamperedStatus = {
    ...producedFixture,
    envelope: { ...producedFixture.envelope, result_status: "no_candidates" as const },
  };
  assert.throws(() => validateExtractionPackage(tamperedStatus), /Result status/u);

  const tamperedCounts: ExtractionPayload = {
    ...producedFixture.payload,
    aggregate_counts: {
      ...producedFixture.payload.aggregate_counts,
      observation_candidates: 99,
    },
  };
  assert.throws(() => validateExtractionPayload(tamperedCounts), /Aggregate counts/u);

  const fixtureCandidate = producedFixture.payload.observation_candidates[0];
  assert.ok(fixtureCandidate);
  const tamperedCandidate: ExtractionPayload = {
    ...producedFixture.payload,
    observation_candidates: [{ ...fixtureCandidate, candidate_key: HASH_B }],
  };
  assert.throws(() => validateExtractionPayload(tamperedCandidate), /Candidate key/u);
});

test("payload hash is the SHA-256 of the canonical deterministic payload", () => {
  assert.equal(
    extractionPayloadHash(producedFixture.payload),
    producedFixture.envelope.payload_hash,
  );
  assert.equal(
    extractionPayloadHash(noCandidatesFixture.payload),
    noCandidatesFixture.envelope.payload_hash,
  );
});

async function loadFixture(name: string): Promise<AbveExtractionPackageV1> {
  return JSON.parse(
    await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8"),
  ) as AbveExtractionPackageV1;
}
