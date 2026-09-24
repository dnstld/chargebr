import {
  ABVE_ENDPOINT_CONTRACT,
  abveConfigFingerprint,
  type AbveEndpointContract,
} from "../collector/abve-adapter.js";
import {
  manifestReference,
  readManifestReference,
} from "../collector/artifacts.js";
import { canonicalJson } from "../collector/canonical-json.js";
import { canonicalizeUrl } from "../collector/canonical-url.js";
import type {
  ExtractionCollectionRun,
  ResolvedAbveEndpoint,
} from "../collector/collection-run-store.js";
import { COLLECTOR_NAME, CONTRACT_VERSION } from "../collector/constants.js";
import {
  responseManifestHash,
  validateManifest,
  type CollectionManifestV1,
  type ItemClassification,
  type ManifestItem,
} from "../collector/manifest.js";
import {
  refetchAbvePost,
  type AbveRefetchResponseEvidence,
  type AbveRefetchResult,
} from "./abve-refetch.js";
import {
  ABVE_ENDPOINT_KEY,
  ABVE_NORMALIZATION_PROFILE,
} from "./constants.js";
import type { ExtractionInput } from "./package.js";
import type { ValidatedAbvePost } from "../collector/abve-post.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const SHA256_HEX = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;

export type ExtractionHandoffErrorCode =
  | "input_invalid"
  | "endpoint_unavailable"
  | "endpoint_contract_mismatch"
  | "run_unavailable"
  | "run_not_ready"
  | "run_contract_mismatch"
  | "manifest_unavailable"
  | "manifest_reference_mismatch"
  | "manifest_hash_mismatch"
  | "manifest_contract_mismatch"
  | "item_unavailable"
  | "item_ambiguous"
  | "item_ineligible"
  | "item_contract_mismatch"
  | "refetch_failed"
  | "identity_mismatch"
  | "url_mismatch"
  | "fingerprint_mismatch";

export class ExtractionHandoffError extends Error {
  constructor(
    readonly code: ExtractionHandoffErrorCode,
    message: string,
    readonly detailCode?: string,
  ) {
    super(message);
  }
}

export interface ExtractionRunStore {
  resolveAbveEndpoint(): Promise<ResolvedAbveEndpoint | null>;
  findRunForExtraction(
    endpointId: string,
    runKey: string,
  ): Promise<ExtractionCollectionRun | null>;
}

export interface PrepareAbveHandoffInput {
  readonly run_key: string;
  readonly item_id: number;
}

export interface PreparedAbveHandoff {
  readonly run_key: string;
  readonly extraction_input: ExtractionInput;
  readonly classification: Extract<ItemClassification, "new" | "changed">;
  readonly post: ValidatedAbvePost;
  readonly response: AbveRefetchResponseEvidence;
}

export interface AbveHandoffDependencies {
  readonly store: ExtractionRunStore;
  readonly rootDirectory: string;
  readonly readManifest: typeof readManifestReference;
  readonly refetch: (
    contract: AbveEndpointContract,
    itemId: number,
  ) => Promise<AbveRefetchResult>;
}

export async function prepareAbveExtractionHandoff(
  input: PrepareAbveHandoffInput,
  dependencyOverrides: Partial<Omit<AbveHandoffDependencies, "store" | "rootDirectory">> &
    Pick<AbveHandoffDependencies, "store" | "rootDirectory">,
): Promise<PreparedAbveHandoff> {
  validateInput(input);
  const dependencies: AbveHandoffDependencies = {
    readManifest: readManifestReference,
    refetch: (contract, itemId) => refetchAbvePost(contract, itemId),
    ...dependencyOverrides,
  };

  const endpoint = await dependencies.store.resolveAbveEndpoint();
  if (endpoint === null) {
    throw new ExtractionHandoffError(
      "endpoint_unavailable",
      "The approved ABVE endpoint is unavailable",
    );
  }
  if (!contractMatches(endpoint.contract)) {
    throw new ExtractionHandoffError(
      "endpoint_contract_mismatch",
      "The ABVE endpoint contract is not the approved version",
    );
  }

  const run = await dependencies.store.findRunForExtraction(endpoint.id, input.run_key);
  if (run === null || run.runKey !== input.run_key) {
    throw new ExtractionHandoffError(
      "run_unavailable",
      "The requested ABVE collection run is unavailable",
    );
  }
  validateReadyRun(run, endpoint.contract);

  const expectedReference = manifestReference(input.run_key);
  if (run.manifestReference !== expectedReference) {
    throw new ExtractionHandoffError(
      "manifest_reference_mismatch",
      "The collection run does not reference its canonical local manifest",
    );
  }

  let manifest: CollectionManifestV1;
  try {
    manifest = await dependencies.readManifest(
      dependencies.rootDirectory,
      run.manifestReference,
    );
    validateManifest(manifest);
  } catch {
    throw new ExtractionHandoffError(
      "manifest_unavailable",
      "The referenced collection manifest is unavailable or invalid",
    );
  }
  validateManifestAgainstRun(manifest, run, endpoint.contract);
  const item = resolveEligibleItem(manifest, input.item_id);
  validateManifestItem(item);

  const refetched = await dependencies.refetch(endpoint.contract, input.item_id);
  if (!refetched.ok) {
    throw new ExtractionHandoffError(
      "refetch_failed",
      "The exact ABVE post could not be re-fetched under the approved contract",
      refetched.diagnostic.error_code,
    );
  }
  if (canonicalJson(refetched.post.identity) !== canonicalJson({ id: input.item_id })) {
    throw new ExtractionHandoffError(
      "identity_mismatch",
      "The re-fetched post identity differs from the manifest item",
    );
  }
  if (refetched.post.canonicalUrl !== item.canonical_url) {
    throw new ExtractionHandoffError(
      "url_mismatch",
      "The re-fetched canonical URL differs from the manifest item",
    );
  }
  if (refetched.post.fingerprint !== item.content_fingerprint) {
    throw new ExtractionHandoffError(
      "fingerprint_mismatch",
      "The re-fetched content fingerprint differs from the manifest item",
    );
  }

  return {
    run_key: run.runKey,
    extraction_input: {
      endpoint_key: ABVE_ENDPOINT_KEY,
      manifest_hash: run.manifestHash as string,
      native_identity: { id: input.item_id },
      canonical_url: item.canonical_url,
      expected_content_fingerprint: item.content_fingerprint,
      observed_content_fingerprint: refetched.post.fingerprint,
      normalization_profile: ABVE_NORMALIZATION_PROFILE,
    },
    classification: item.classification as Extract<ItemClassification, "new" | "changed">,
    post: refetched.post,
    response: refetched.response,
  };
}

function contractMatches(contract: AbveEndpointContract): boolean {
  try {
    return canonicalJson(contract) === canonicalJson(ABVE_ENDPOINT_CONTRACT);
  } catch {
    return false;
  }
}

function validateInput(input: PrepareAbveHandoffInput): void {
  if (!UUID.test(input.run_key) || !Number.isSafeInteger(input.item_id) || input.item_id < 1) {
    throw new ExtractionHandoffError(
      "input_invalid",
      "The run key or WordPress item id is invalid",
    );
  }
}

function validateReadyRun(
  run: ExtractionCollectionRun,
  contract: AbveEndpointContract,
): void {
  if (run.status !== "succeeded" || run.handoffStatus !== "ready_for_extraction") {
    throw new ExtractionHandoffError(
      "run_not_ready",
      "The collection run is not ready for extraction",
    );
  }
  if (run.manifestHash === null || !SHA256_HEX.test(run.manifestHash)) {
    throw new ExtractionHandoffError(
      "run_contract_mismatch",
      "The collection run manifest hash is invalid",
    );
  }
  if (
    run.collectorName !== COLLECTOR_NAME ||
    !GIT_SHA.test(run.collectorVersion) ||
    run.contractVersion !== CONTRACT_VERSION ||
    run.configFingerprint !== abveConfigFingerprint(contract)
  ) {
    throw new ExtractionHandoffError(
      "run_contract_mismatch",
      "The collection run metadata is contract-incompatible",
    );
  }
}

function validateManifestAgainstRun(
  manifest: CollectionManifestV1,
  run: ExtractionCollectionRun,
  contract: AbveEndpointContract,
): void {
  if (responseManifestHash(manifest.payload) !== run.manifestHash) {
    throw new ExtractionHandoffError(
      "manifest_hash_mismatch",
      "The deterministic manifest hash differs from the collection run",
    );
  }
  if (
    manifest.envelope.run_key !== run.runKey ||
    manifest.envelope.collector_name !== run.collectorName ||
    manifest.envelope.collector_version !== run.collectorVersion ||
    manifest.payload.contract_version !== run.contractVersion ||
    manifest.payload.endpoint_key !== contract.endpoint_key ||
    manifest.payload.config_fingerprint !== run.configFingerprint
  ) {
    throw new ExtractionHandoffError(
      "manifest_contract_mismatch",
      "The manifest provenance differs from the collection run or endpoint",
    );
  }
}

function resolveEligibleItem(
  manifest: CollectionManifestV1,
  itemId: number,
): ManifestItem & {
  readonly native_identity: { readonly id: number };
  readonly canonical_url: string;
  readonly content_fingerprint: string;
} {
  const matches = manifest.payload.items.filter(
    (item) => canonicalJson(item.native_identity) === canonicalJson({ id: itemId }),
  );
  if (matches.length === 0) {
    throw new ExtractionHandoffError(
      "item_unavailable",
      "The requested WordPress item is absent from the manifest",
    );
  }
  if (matches.length !== 1) {
    throw new ExtractionHandoffError(
      "item_ambiguous",
      "The requested WordPress item appears more than once in the manifest",
    );
  }
  const item = matches[0];
  if (item === undefined || !new Set(["new", "changed"]).has(item.classification)) {
    throw new ExtractionHandoffError(
      "item_ineligible",
      "Only new or changed manifest items are eligible for extraction",
    );
  }
  if (
    item.native_identity === null ||
    item.canonical_url === null ||
    item.content_fingerprint === null
  ) {
    throw new ExtractionHandoffError(
      "item_contract_mismatch",
      "The manifest item lacks identity, URL, or fingerprint",
    );
  }
  return item as ManifestItem & {
    readonly native_identity: { readonly id: number };
    readonly canonical_url: string;
    readonly content_fingerprint: string;
  };
}

function validateManifestItem(
  item: ManifestItem & {
    readonly canonical_url: string;
    readonly content_fingerprint: string;
  },
): void {
  let canonicalUrl: string;
  try {
    canonicalUrl = canonicalizeUrl(item.canonical_url);
  } catch {
    throw new ExtractionHandoffError(
      "item_contract_mismatch",
      "The manifest item URL is invalid",
    );
  }
  if (
    canonicalUrl !== item.canonical_url ||
    new URL(canonicalUrl).hostname !== "abve.org.br" ||
    !SHA256_HEX.test(item.content_fingerprint)
  ) {
    throw new ExtractionHandoffError(
      "item_contract_mismatch",
      "The manifest item URL or fingerprint is contract-incompatible",
    );
  }
}
