import { canonicalJson } from "../collector/canonical-json.js";
import { canonicalizeUrl } from "../collector/canonical-url.js";
import { sha256CanonicalJson } from "../collector/hash.js";
import {
  ABVE_ENDPOINT_KEY,
  ABVE_EXTRACTION_CONTRACT_VERSION,
  ABVE_EXTRACTION_PACKAGE_VERSION,
  ABVE_EXTRACTOR_NAME,
  ABVE_NORMALIZATION_PROFILE,
  CANDIDATE_LIMITATIONS_MAX_COUNT,
  CANDIDATE_TEXT_MAX_CODEPOINTS,
} from "./constants.js";

const SHA256_HEX = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?$/u;
const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/u;

export type ExtractionResultStatus = "produced" | "no_candidates";

export interface ExtractionNativeIdentity {
  readonly id: number;
}

export interface ExtractionInput {
  readonly endpoint_key: typeof ABVE_ENDPOINT_KEY;
  readonly manifest_hash: string;
  readonly native_identity: ExtractionNativeIdentity;
  readonly canonical_url: string;
  readonly expected_content_fingerprint: string;
  readonly observed_content_fingerprint: string;
  readonly normalization_profile: typeof ABVE_NORMALIZATION_PROFILE;
}

export interface ContentItemCandidate {
  readonly canonical_url: string;
  readonly title: string;
  readonly published_local: string;
  readonly published_at_utc: string;
  readonly language_code: null;
  readonly section_name: null;
  readonly publication_nature: "unknown";
  readonly content_fingerprint: string;
  readonly retention_class: "minimum_excerpt";
  readonly evidentiary_excerpt: string;
  readonly raw_capture_reference: string;
}

export interface MeasuredPeriod {
  readonly start: string;
  readonly end: string;
  readonly granularity: "month";
}

export interface ObservationCandidateDraft {
  readonly observation_type: "quantity";
  readonly source_claim: string;
  readonly normalized_claim: string;
  readonly normalization_status: "normalized";
  readonly normalized_value: number;
  readonly normalized_unit: "vehicle_registration";
  readonly measured_period: MeasuredPeriod;
  readonly geography: string;
  readonly extraction_method: "automated";
  readonly source_term: string;
  readonly locator: string;
  readonly limitations: readonly string[];
}

export interface ObservationCandidate extends ObservationCandidateDraft {
  readonly candidate_key: string;
}

export interface ExtractionAggregateCounts {
  readonly items_considered: 1;
  readonly content_candidates: 1;
  readonly observation_candidates: number;
  readonly candidates_blocked: 0;
}

export interface ExtractionPayload {
  readonly input: ExtractionInput;
  readonly content_item_candidate: ContentItemCandidate;
  readonly observation_candidates: readonly ObservationCandidate[];
  readonly aggregate_counts: ExtractionAggregateCounts;
}

export interface ExtractionEnvelope {
  readonly package_version: typeof ABVE_EXTRACTION_PACKAGE_VERSION;
  readonly extraction_key: string;
  readonly run_key: string;
  readonly extractor_name: typeof ABVE_EXTRACTOR_NAME;
  readonly extractor_version: string;
  readonly contract_version: typeof ABVE_EXTRACTION_CONTRACT_VERSION;
  readonly result_status: ExtractionResultStatus;
  readonly payload_hash: string;
  readonly started_at: string;
  readonly duration_ms: number;
}

export interface AbveExtractionPackageV1 {
  readonly envelope: ExtractionEnvelope;
  readonly payload: ExtractionPayload;
}

export interface CreateExtractionPayloadInput {
  readonly input: ExtractionInput;
  readonly content_item_candidate: ContentItemCandidate;
  readonly observation_candidates: readonly ObservationCandidateDraft[];
}

export interface CreateExtractionPackageInput {
  readonly run_key: string;
  readonly extractor_version: string;
  readonly started_at: string;
  readonly duration_ms: number;
  readonly payload: ExtractionPayload;
}

export function extractionKey(input: ExtractionInput): string {
  validateExtractionInput(input);
  return sha256CanonicalJson({
    contract_version: ABVE_EXTRACTION_CONTRACT_VERSION,
    endpoint_key: input.endpoint_key,
    native_identity: input.native_identity,
    content_fingerprint: input.expected_content_fingerprint,
  });
}

export function candidateKey(
  input: ExtractionInput,
  candidate: ObservationCandidateDraft,
): string {
  validateExtractionInput(input);
  validateObservationCandidateDraft(candidate);
  return sha256CanonicalJson({
    contract_version: ABVE_EXTRACTION_CONTRACT_VERSION,
    endpoint_key: input.endpoint_key,
    native_identity: input.native_identity,
    content_fingerprint: input.expected_content_fingerprint,
    observation_type: candidate.observation_type,
    source_claim: candidate.source_claim,
    normalized_claim: candidate.normalized_claim,
    normalized_value: candidate.normalized_value,
    normalized_unit: candidate.normalized_unit,
    measured_period: candidate.measured_period,
    geography: candidate.geography,
    source_term: candidate.source_term,
    locator: candidate.locator,
  });
}

export function createObservationCandidate(
  input: ExtractionInput,
  draft: ObservationCandidateDraft,
): ObservationCandidate {
  const limitations = [...draft.limitations].sort(compareLexicographically);
  const normalizedDraft: ObservationCandidateDraft = { ...draft, limitations };
  validateObservationCandidateDraft(normalizedDraft);
  return {
    candidate_key: candidateKey(input, normalizedDraft),
    ...normalizedDraft,
  };
}

export function createExtractionPayload(input: CreateExtractionPayloadInput): ExtractionPayload {
  validateExtractionInput(input.input);
  validateContentItemCandidate(input.content_item_candidate, input.input);
  const observationCandidates = input.observation_candidates
    .map((candidate) => createObservationCandidate(input.input, candidate))
    .sort((left, right) => compareLexicographically(left.candidate_key, right.candidate_key));
  const payload: ExtractionPayload = {
    input: input.input,
    content_item_candidate: input.content_item_candidate,
    observation_candidates: observationCandidates,
    aggregate_counts: {
      items_considered: 1,
      content_candidates: 1,
      observation_candidates: observationCandidates.length,
      candidates_blocked: 0,
    },
  };
  validateExtractionPayload(payload);
  return payload;
}

export function extractionPayloadHash(payload: ExtractionPayload): string {
  validateExtractionPayload(payload);
  return sha256CanonicalJson(payload);
}

export function createExtractionPackage(
  input: CreateExtractionPackageInput,
): AbveExtractionPackageV1 {
  validateExtractionPayload(input.payload);
  const resultStatus = resultStatusFor(input.payload);
  const extractionPackage: AbveExtractionPackageV1 = {
    envelope: {
      package_version: ABVE_EXTRACTION_PACKAGE_VERSION,
      extraction_key: extractionKey(input.payload.input),
      run_key: input.run_key,
      extractor_name: ABVE_EXTRACTOR_NAME,
      extractor_version: input.extractor_version,
      contract_version: ABVE_EXTRACTION_CONTRACT_VERSION,
      result_status: resultStatus,
      payload_hash: extractionPayloadHash(input.payload),
      started_at: input.started_at,
      duration_ms: input.duration_ms,
    },
    payload: input.payload,
  };
  validateExtractionPackage(extractionPackage);
  return extractionPackage;
}

export function serializeExtractionPackage(extractionPackage: AbveExtractionPackageV1): string {
  validateExtractionPackage(extractionPackage);
  return canonicalJson(extractionPackage);
}

export function validateExtractionPackage(extractionPackage: AbveExtractionPackageV1): void {
  assertExactKeys(extractionPackage, ["envelope", "payload"], "package");
  const { envelope, payload } = extractionPackage;
  assertExactKeys(
    envelope,
    [
      "package_version",
      "extraction_key",
      "run_key",
      "extractor_name",
      "extractor_version",
      "contract_version",
      "result_status",
      "payload_hash",
      "started_at",
      "duration_ms",
    ],
    "envelope",
  );
  validateExtractionPayload(payload);
  if (envelope.package_version !== ABVE_EXTRACTION_PACKAGE_VERSION) {
    throw new Error("Invalid package_version");
  }
  if (envelope.extractor_name !== ABVE_EXTRACTOR_NAME) {
    throw new Error("Invalid extractor_name");
  }
  if (envelope.contract_version !== ABVE_EXTRACTION_CONTRACT_VERSION) {
    throw new Error("Invalid contract_version");
  }
  if (!UUID.test(envelope.run_key)) {
    throw new Error("Invalid run_key");
  }
  if (!GIT_SHA.test(envelope.extractor_version)) {
    throw new Error("Invalid extractor_version");
  }
  validateUtcInstant(envelope.started_at, "started_at");
  if (!Number.isSafeInteger(envelope.duration_ms) || envelope.duration_ms < 0) {
    throw new Error("Invalid duration_ms");
  }
  if (envelope.extraction_key !== extractionKey(payload.input)) {
    throw new Error("Extraction key does not match payload input");
  }
  if (envelope.payload_hash !== extractionPayloadHash(payload)) {
    throw new Error("Payload hash does not match payload");
  }
  if (envelope.result_status !== resultStatusFor(payload)) {
    throw new Error("Result status does not match candidates");
  }
}

export function validateExtractionPayload(payload: ExtractionPayload): void {
  assertExactKeys(
    payload,
    ["input", "content_item_candidate", "observation_candidates", "aggregate_counts"],
    "payload",
  );
  validateExtractionInput(payload.input);
  validateContentItemCandidate(payload.content_item_candidate, payload.input);
  if (!Array.isArray(payload.observation_candidates)) {
    throw new Error("Invalid observation_candidates");
  }
  if (payload.observation_candidates.length > 1) {
    throw new Error("Extraction v1 accepts at most one observation candidate");
  }
  for (const candidate of payload.observation_candidates) {
    validateObservationCandidate(candidate, payload.input);
  }
  if (
    payload.observation_candidates.length === 1 &&
    payload.observation_candidates[0]?.source_claim !==
      payload.content_item_candidate.evidentiary_excerpt
  ) {
    throw new Error("Evidentiary excerpt must match the observation source claim");
  }
  const sortedCandidates = [...payload.observation_candidates].sort((left, right) =>
    compareLexicographically(left.candidate_key, right.candidate_key),
  );
  if (canonicalJson(payload.observation_candidates) !== canonicalJson(sortedCandidates)) {
    throw new Error("Observation candidates are not deterministically sorted");
  }
  const candidateKeys = new Set(payload.observation_candidates.map(({ candidate_key }) => candidate_key));
  if (candidateKeys.size !== payload.observation_candidates.length) {
    throw new Error("Duplicate observation candidate");
  }
  assertExactKeys(
    payload.aggregate_counts,
    ["items_considered", "content_candidates", "observation_candidates", "candidates_blocked"],
    "aggregate_counts",
  );
  const expectedCounts: ExtractionAggregateCounts = {
    items_considered: 1,
    content_candidates: 1,
    observation_candidates: payload.observation_candidates.length,
    candidates_blocked: 0,
  };
  if (canonicalJson(payload.aggregate_counts) !== canonicalJson(expectedCounts)) {
    throw new Error("Aggregate counts do not match candidates");
  }
}

function validateExtractionInput(input: ExtractionInput): void {
  assertExactKeys(
    input,
    [
      "endpoint_key",
      "manifest_hash",
      "native_identity",
      "canonical_url",
      "expected_content_fingerprint",
      "observed_content_fingerprint",
      "normalization_profile",
    ],
    "input",
  );
  if (input.endpoint_key !== ABVE_ENDPOINT_KEY) {
    throw new Error("Invalid endpoint_key");
  }
  if (!SHA256_HEX.test(input.manifest_hash)) {
    throw new Error("Invalid manifest_hash");
  }
  assertExactKeys(input.native_identity, ["id"], "native_identity");
  if (!Number.isSafeInteger(input.native_identity.id) || input.native_identity.id < 1) {
    throw new Error("Invalid native_identity");
  }
  validateAbveCanonicalUrl(input.canonical_url, "canonical_url");
  if (!SHA256_HEX.test(input.expected_content_fingerprint)) {
    throw new Error("Invalid expected_content_fingerprint");
  }
  if (!SHA256_HEX.test(input.observed_content_fingerprint)) {
    throw new Error("Invalid observed_content_fingerprint");
  }
  if (input.expected_content_fingerprint !== input.observed_content_fingerprint) {
    throw new Error("Observed content fingerprint does not match manifest");
  }
  if (input.normalization_profile !== ABVE_NORMALIZATION_PROFILE) {
    throw new Error("Invalid normalization_profile");
  }
}

function validateContentItemCandidate(
  candidate: ContentItemCandidate,
  input: ExtractionInput,
): void {
  assertExactKeys(
    candidate,
    [
      "canonical_url",
      "title",
      "published_local",
      "published_at_utc",
      "language_code",
      "section_name",
      "publication_nature",
      "content_fingerprint",
      "retention_class",
      "evidentiary_excerpt",
      "raw_capture_reference",
    ],
    "content_item_candidate",
  );
  validateAbveCanonicalUrl(candidate.canonical_url, "content candidate canonical_url");
  if (candidate.canonical_url !== input.canonical_url) {
    throw new Error("Content candidate URL does not match input");
  }
  validateCandidateText(candidate.title, "title");
  validateLocalDateTime(candidate.published_local, "published_local");
  validateUtcInstant(candidate.published_at_utc, "published_at_utc");
  if (candidate.language_code !== null || candidate.section_name !== null) {
    throw new Error("Unsupported inferred editorial metadata");
  }
  if (candidate.publication_nature !== "unknown") {
    throw new Error("Invalid publication_nature");
  }
  if (candidate.content_fingerprint !== input.expected_content_fingerprint) {
    throw new Error("Content candidate fingerprint does not match input");
  }
  if (candidate.retention_class !== "minimum_excerpt") {
    throw new Error("Invalid retention_class");
  }
  validateCandidateText(candidate.evidentiary_excerpt, "evidentiary_excerpt");
  if (candidate.raw_capture_reference !== candidate.canonical_url) {
    throw new Error("Raw capture reference must be the canonical URL");
  }
}

function validateObservationCandidate(
  candidate: ObservationCandidate,
  input: ExtractionInput,
): void {
  assertExactKeys(
    candidate,
    [
      "candidate_key",
      "observation_type",
      "source_claim",
      "normalized_claim",
      "normalization_status",
      "normalized_value",
      "normalized_unit",
      "measured_period",
      "geography",
      "extraction_method",
      "source_term",
      "locator",
      "limitations",
    ],
    "observation_candidate",
  );
  const { candidate_key: key, ...draft } = candidate;
  validateObservationCandidateDraft(draft);
  if (key !== candidateKey(input, draft)) {
    throw new Error("Candidate key does not match candidate");
  }
}

function validateObservationCandidateDraft(candidate: ObservationCandidateDraft): void {
  assertExactKeys(
    candidate,
    [
      "observation_type",
      "source_claim",
      "normalized_claim",
      "normalization_status",
      "normalized_value",
      "normalized_unit",
      "measured_period",
      "geography",
      "extraction_method",
      "source_term",
      "locator",
      "limitations",
    ],
    "observation_candidate_draft",
  );
  if (candidate.observation_type !== "quantity") {
    throw new Error("Invalid observation_type");
  }
  validateCandidateText(candidate.source_claim, "source_claim");
  validateCandidateText(candidate.normalized_claim, "normalized_claim");
  if (candidate.normalization_status !== "normalized") {
    throw new Error("Invalid normalization_status");
  }
  if (!Number.isSafeInteger(candidate.normalized_value) || candidate.normalized_value < 0) {
    throw new Error("Invalid normalized_value");
  }
  if (candidate.normalized_unit !== "vehicle_registration") {
    throw new Error("Invalid normalized_unit");
  }
  validateMeasuredPeriod(candidate.measured_period);
  validateCandidateText(candidate.geography, "geography");
  if (candidate.extraction_method !== "automated") {
    throw new Error("Invalid extraction_method");
  }
  validateCandidateText(candidate.source_term, "source_term");
  validateCandidateText(candidate.locator, "locator");
  if (!Array.isArray(candidate.limitations)) {
    throw new Error("Invalid limitations");
  }
  if (candidate.limitations.length > CANDIDATE_LIMITATIONS_MAX_COUNT) {
    throw new Error(`Limitations exceed ${CANDIDATE_LIMITATIONS_MAX_COUNT} entries`);
  }
  for (const limitation of candidate.limitations) {
    validateCandidateText(limitation, "limitation");
  }
  const sortedLimitations = [...candidate.limitations].sort(compareLexicographically);
  if (canonicalJson(candidate.limitations) !== canonicalJson(sortedLimitations)) {
    throw new Error("Limitations are not deterministically sorted");
  }
  if (new Set(candidate.limitations).size !== candidate.limitations.length) {
    throw new Error("Duplicate limitation");
  }
}

function validateMeasuredPeriod(period: MeasuredPeriod): void {
  assertExactKeys(period, ["start", "end", "granularity"], "measured_period");
  validateDateOnly(period.start, "measured_period.start");
  validateDateOnly(period.end, "measured_period.end");
  if (period.granularity !== "month") {
    throw new Error("Invalid measured_period.granularity");
  }
  const [startYear, startMonth, startDay] = period.start.split("-").map(Number);
  const [endYear, endMonth, endDay] = period.end.split("-").map(Number);
  const lastDay = new Date(Date.UTC(startYear as number, startMonth as number, 0)).getUTCDate();
  if (
    startYear !== endYear ||
    startMonth !== endMonth ||
    startDay !== 1 ||
    endDay !== lastDay
  ) {
    throw new Error("Measured month must cover one complete calendar month");
  }
}

function resultStatusFor(payload: ExtractionPayload): ExtractionResultStatus {
  return payload.observation_candidates.length === 0 ? "no_candidates" : "produced";
}

function validateAbveCanonicalUrl(value: string, field: string): void {
  let normalized: string;
  try {
    normalized = canonicalizeUrl(value);
  } catch {
    throw new Error(`Invalid ${field}`);
  }
  if (normalized !== value || new URL(value).hostname !== "abve.org.br") {
    throw new Error(`Invalid ${field}`);
  }
}

function validateCandidateText(value: string, field: string): void {
  validateNonBlank(value, field);
  if (value !== value.normalize("NFC") || value.includes("\r")) {
    throw new Error(`${field} is not normalized text`);
  }
  if ([...value].length > CANDIDATE_TEXT_MAX_CODEPOINTS) {
    throw new Error(`${field} exceeds ${CANDIDATE_TEXT_MAX_CODEPOINTS} code points`);
  }
}

function validateNonBlank(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${field}`);
  }
}

function validateLocalDateTime(value: string, field: string): void {
  const parsed = new Date(`${value}Z`);
  const expected = value.includes(".") ? `${value}Z` : `${value}.000Z`;
  if (
    !LOCAL_DATE_TIME.test(value) ||
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString() !== expected
  ) {
    throw new Error(`Invalid ${field}`);
  }
}

function validateUtcInstant(value: string, field: string): void {
  const parsed = new Date(value);
  const expected = value.includes(".") ? value : value.replace("Z", ".000Z");
  if (
    !UTC_INSTANT.test(value) ||
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString() !== expected
  ) {
    throw new Error(`Invalid ${field}`);
  }
}

function validateDateOnly(value: string, field: string): void {
  if (!DATE_ONLY.test(value)) {
    throw new Error(`Invalid ${field}`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ${field}`);
  }
}

function assertExactKeys(
  value: object,
  expectedKeys: readonly string[],
  field: string,
): void {
  const actual = Object.keys(value).sort(compareLexicographically);
  const expected = [...expectedKeys].sort(compareLexicographically);
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(`Invalid ${field} fields`);
  }
}

function compareLexicographically(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
