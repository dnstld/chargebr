import { canonicalJson, type CanonicalJsonValue } from "./canonical-json.js";
import { canonicalizeUrl } from "./canonical-url.js";
import { CONTRACT_VERSION, MANIFEST_VERSION } from "./constants.js";
import { sha256Bytes } from "./hash.js";
import {
  configFingerprint,
  createManifestPayload,
  responseManifestHash,
  validateManifest,
  type AggregateCounts,
  type CollectionManifestV1,
  type ManifestAttempt,
  type ManifestItem,
  type ManifestPayload,
  type ManifestRequest,
  type ManifestStableHeaders,
} from "./manifest.js";
import {
  validateAndNormalizeAbvePost,
  type NormalizedAbvePost,
} from "./abve-post.js";
import { sanitizeMessage } from "./sanitize.js";

const MAX_ATTEMPTS = 3;
const MAX_REDIRECTS = 3;
const MAX_RETRY_AFTER_MS = 240_000;
const RETRY_BASE_MS = [1_000, 2_000] as const;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const PUBLIC_LINK_QUERY_KEYS = new Set([
  "_fields",
  "before",
  "categories",
  "context",
  "order",
  "orderby",
  "page",
  "per_page",
]);

export interface AbveEndpointContract {
  readonly source_slug: "abve";
  readonly endpoint_key: "abve-news-wordpress-posts";
  readonly endpoint_url: "https://abve.org.br/wp-json/wp/v2/posts";
  readonly endpoint_type: "api";
  readonly access_method: "http_get";
  readonly response_format: "json";
  readonly status: "active";
  readonly request_config: {
    readonly timeout_ms: 30_000;
    readonly max_response_bytes: 2_000_000;
    readonly query_params: {
      readonly categories: 13;
      readonly context: "view";
      readonly orderby: "date";
      readonly order: "desc";
      readonly _fields: "id,date,modified,slug,link,title,excerpt,content";
    };
    readonly headers: { readonly Accept: "application/json" };
  };
  readonly pagination_strategy: "page";
  readonly pagination_config: {
    readonly page_parameter: "page";
    readonly first_page: 1;
    readonly page_size_parameter: "per_page";
    readonly page_size: 50;
    readonly max_pages: 2;
    readonly total_pages_header: "X-WP-TotalPages";
    readonly freeze_parameter: "before";
    readonly freeze_from: "run_started_at";
  };
  readonly cursor_strategy: "time_window";
  readonly cursor_config: {
    readonly request_parameter: "before";
    readonly value_format: "rfc3339";
    readonly freeze_from: "run_started_at";
  };
  readonly identity_rule: {
    readonly version: "abve-post-identity-v1";
    readonly primary: { readonly fields: readonly ["id"] };
    readonly fallback: {
      readonly fields: readonly ["link"];
      readonly normalization: "canonical-url-v1";
    };
    readonly diagnostic_fields: readonly ["modified", "slug"];
  };
  readonly normalization_profile: "abve-wordpress-post-v1";
  readonly removal_policy: "none";
  readonly suggested_interval: "7 days";
  readonly default_retention_class: "minimum_excerpt";
  readonly terms_url: null;
  readonly robots_url: "https://abve.org.br/robots.txt";
}

export const ABVE_ENDPOINT_CONTRACT: AbveEndpointContract = {
  source_slug: "abve",
  endpoint_key: "abve-news-wordpress-posts",
  endpoint_url: "https://abve.org.br/wp-json/wp/v2/posts",
  endpoint_type: "api",
  access_method: "http_get",
  response_format: "json",
  status: "active",
  request_config: {
    timeout_ms: 30_000,
    max_response_bytes: 2_000_000,
    query_params: {
      categories: 13,
      context: "view",
      orderby: "date",
      order: "desc",
      _fields: "id,date,modified,slug,link,title,excerpt,content",
    },
    headers: { Accept: "application/json" },
  },
  pagination_strategy: "page",
  pagination_config: {
    page_parameter: "page",
    first_page: 1,
    page_size_parameter: "per_page",
    page_size: 50,
    max_pages: 2,
    total_pages_header: "X-WP-TotalPages",
    freeze_parameter: "before",
    freeze_from: "run_started_at",
  },
  cursor_strategy: "time_window",
  cursor_config: {
    request_parameter: "before",
    value_format: "rfc3339",
    freeze_from: "run_started_at",
  },
  identity_rule: {
    version: "abve-post-identity-v1",
    primary: { fields: ["id"] },
    fallback: { fields: ["link"], normalization: "canonical-url-v1" },
    diagnostic_fields: ["modified", "slug"],
  },
  normalization_profile: "abve-wordpress-post-v1",
  removal_policy: "none",
  suggested_interval: "7 days",
  default_retention_class: "minimum_excerpt",
  terms_url: null,
  robots_url: "https://abve.org.br/robots.txt",
};

export interface AbveCursor {
  readonly version: "abve-time-window-v1";
  readonly before: string;
}

export interface PriorManifestInput {
  readonly manifest: CollectionManifestV1;
  readonly expected_hash: string;
}

export interface CollectAbveInput {
  readonly contract: AbveEndpointContract;
  readonly run_started_at: string;
  readonly cursor_in: AbveCursor | null;
  readonly prior_manifest?: PriorManifestInput | null;
}

export interface CollectorDiagnostic {
  readonly error_kind:
    | "transport"
    | "http"
    | "rate_limit"
    | "access_policy"
    | "contract"
    | "format"
    | "size_limit"
    | "internal";
  readonly error_code: string;
  readonly error_message: string;
}

export type ProposedOperationalStatus = "succeeded" | "no_change" | "partial" | "failed" | "blocked";

export interface CollectedAbveItem {
  readonly manifest_item: ManifestItem;
  readonly normalized: NormalizedAbvePost | null;
}

export interface AbveCollectionOutcome {
  readonly status: ProposedOperationalStatus;
  readonly error: CollectorDiagnostic | null;
  readonly cursor_in: AbveCursor | null;
  readonly cursor_out: AbveCursor | null;
  readonly requests: readonly ManifestRequest[];
  readonly attempt_history: readonly ManifestAttempt[];
  readonly items: readonly CollectedAbveItem[];
  readonly counts: AggregateCounts;
  readonly manifest_payload: ManifestPayload;
  readonly response_manifest_hash: string;
}

export interface AbortTimeout {
  readonly signal: AbortSignal;
  readonly cancel: () => void;
}

export interface AbveAdapterDependencies {
  readonly fetch: (input: string, init: RequestInit) => Promise<Response>;
  readonly sleep: (milliseconds: number) => Promise<void>;
  readonly random: () => number;
  readonly now: () => number;
  readonly createAbortTimeout: (milliseconds: number) => AbortTimeout;
}

interface PageSuccess {
  readonly ok: true;
  readonly body: unknown[];
  readonly request: ManifestRequest;
}

interface PageFailure {
  readonly ok: false;
  readonly request: ManifestRequest;
  readonly diagnostic: CollectorDiagnostic;
  readonly terminalStatus: "failed" | "blocked";
}

type PageResult = PageSuccess | PageFailure;

class RedirectViolation extends Error {
  readonly code: "redirect_host_not_allowed" | "redirect_limit_exceeded";
  readonly statusCode: number;

  constructor(code: RedirectViolation["code"], statusCode: number) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ResponseTooLarge extends Error {}

const DEFAULT_DEPENDENCIES: AbveAdapterDependencies = {
  fetch: (input, init) => fetch(input, init),
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  random: () => Math.random(),
  now: () => Date.now(),
  createAbortTimeout: (milliseconds) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), milliseconds);
    timeout.unref();
    return { signal: controller.signal, cancel: () => clearTimeout(timeout) };
  },
};

export async function collectAbve(
  input: CollectAbveInput,
  dependencyOverrides: Partial<AbveAdapterDependencies> = {},
): Promise<AbveCollectionOutcome> {
  const dependencies = { ...DEFAULT_DEPENDENCIES, ...dependencyOverrides };
  const requests: ManifestRequest[] = [];
  const attempts: ManifestAttempt[] = [];
  const collected: CollectedAbveItem[] = [];

  const finish = (
    status: ProposedOperationalStatus,
    error: CollectorDiagnostic | null,
  ): AbveCollectionOutcome => {
    const safeRunStartedAt = isUtcInstant(input.run_started_at)
      ? input.run_started_at
      : "1970-01-01T00:00:00.000Z";
    const safeWindowStart = input.cursor_in !== null && isUtcInstant(input.cursor_in.before)
      ? input.cursor_in.before
      : null;
    const terminalWithoutOutput = status === "failed" || status === "blocked";
    const sortedCollected = (terminalWithoutOutput ? [] : [...collected]).sort((left, right) =>
      compare(canonicalJson(left.manifest_item.native_identity), canonicalJson(right.manifest_item.native_identity)) ||
      (left.manifest_item.diagnostic?.page ?? 0) - (right.manifest_item.diagnostic?.page ?? 0) ||
      (left.manifest_item.diagnostic?.index ?? 0) - (right.manifest_item.diagnostic?.index ?? 0),
    );
    const payload = createManifestPayload({
      config_fingerprint: abveConfigFingerprint(contractMatches(input.contract) ? input.contract : ABVE_ENDPOINT_CONTRACT),
      endpoint_key: ABVE_ENDPOINT_CONTRACT.endpoint_key,
      window: {
        start: safeWindowStart,
        end: safeRunStartedAt,
        freeze_before: safeRunStartedAt,
      },
      requests,
      items: sortedCollected.map(({ manifest_item }) => manifest_item),
    });
    const cursorOut = status === "succeeded" || status === "no_change"
      ? { version: "abve-time-window-v1" as const, before: safeRunStartedAt }
      : null;
    return {
      status,
      error,
      cursor_in: input.cursor_in,
      cursor_out: cursorOut,
      requests: payload.requests,
      attempt_history: attempts,
      items: sortedCollected,
      counts: payload.aggregate_counts,
      manifest_payload: payload,
      response_manifest_hash: responseManifestHash(payload),
    };
  };

  const inputError = validateCollectionInput(input);
  if (inputError !== null) {
    return finish("blocked", inputError);
  }

  const baselineResult = createBaseline(input);
  if (!baselineResult.ok) {
    return finish("blocked", baselineResult.diagnostic);
  }
  const baseline = baselineResult.fingerprints;
  const isBootstrap = input.cursor_in === null;
  const seen = new Set<string>();
  let firstTotal: number | null = null;
  let firstTotalPages: number | null = null;
  let previousDate: number | null = null;
  let boundaryCrossed = false;
  let validItemCount = 0;
  let hasRejected = false;

  for (let page = 1; page <= input.contract.pagination_config.max_pages; page += 1) {
    const pageUrl = buildPageUrl(input.contract, page, input.run_started_at);
    const pageResult = await fetchPage(input.contract, page, pageUrl, dependencies, attempts);
    requests.push(pageResult.request);

    if (!pageResult.ok) {
      if (pageResult.terminalStatus === "failed" && validItemCount > 0) {
        return finish("partial", pageResult.diagnostic);
      }
      return finish(pageResult.terminalStatus, pageResult.diagnostic);
    }

    const totals = parseTotals(pageResult.request.stable_headers);
    if (totals === null) {
      return finish("blocked", diagnostic("contract", "schema_mismatch", "WordPress pagination headers are missing or invalid"));
    }
    if (firstTotal === null) {
      firstTotal = totals.total;
      firstTotalPages = totals.totalPages;
    } else if (totals.total !== firstTotal || totals.totalPages !== firstTotalPages) {
      return finish("partial", diagnostic("contract", "pagination_inconsistent", "WordPress pagination totals changed between pages"));
    }
    const paginationCardinalityError = validatePaginationCardinality(
      totals,
      page,
      input.contract.pagination_config.page_size,
      pageResult.body.length,
    );

    for (let index = 0; index < pageResult.body.length; index += 1) {
      const validation = validateAndNormalizeAbvePost(pageResult.body[index]);
      if (!validation.ok) {
        hasRejected = true;
        collected.push({
          normalized: null,
          manifest_item: {
            native_identity: null,
            canonical_url: null,
            content_fingerprint: null,
            classification: "rejected",
            diagnostic: {
              code: validation.code,
              message: sanitizeMessage(validation.message),
              page,
              index,
            },
          },
        });
        continue;
      }

      const identityKey = canonicalJson(validation.post.identity);
      if (seen.has(identityKey)) {
        return finish("partial", diagnostic("contract", "pagination_inconsistent", "A duplicate identity was observed across the collection window"));
      }
      seen.add(identityKey);

      const itemDate = comparableWpDate(validation.post.normalized.date);
      if (itemDate === null) {
        hasRejected = true;
        collected.push({
          normalized: null,
          manifest_item: {
            native_identity: validation.post.identity,
            canonical_url: validation.post.canonicalUrl,
            content_fingerprint: null,
            classification: "rejected",
            diagnostic: {
              code: "schema_mismatch",
              message: "item date is not a supported WordPress timestamp",
              page,
              index,
            },
          },
        });
        continue;
      }
      if (previousDate !== null && itemDate > previousDate) {
        return finish("partial", diagnostic("contract", "pagination_inconsistent", "WordPress items were not ordered by descending date"));
      }
      previousDate = itemDate;

      const priorFingerprint = baseline.get(identityKey);
      const classification = isBootstrap || priorFingerprint === undefined
        ? "new"
        : priorFingerprint === validation.post.fingerprint
          ? "unchanged"
          : "changed";
      const manifestItem: ManifestItem = {
        native_identity: validation.post.identity,
        canonical_url: validation.post.canonicalUrl,
        content_fingerprint: validation.post.fingerprint,
        classification,
      };
      collected.push({ normalized: validation.post.normalized, manifest_item: manifestItem });
      validItemCount += 1;

      if (input.cursor_in !== null && itemDate < Date.parse(input.cursor_in.before)) {
        boundaryCrossed = true;
      }
    }

    if (paginationCardinalityError !== null) {
      return finish(
        validItemCount > 0 ? "partial" : "blocked",
        diagnostic("contract", "pagination_inconsistent", paginationCardinalityError),
      );
    }

    if (input.cursor_in !== null && boundaryCrossed) {
      break;
    }
    if (page === input.contract.pagination_config.max_pages) {
      if (!isBootstrap) {
        return finish("partial", diagnostic("contract", "pagination_inconsistent", "The collection reached max_pages before crossing the prior boundary"));
      }
      break;
    }
    if (firstTotalPages !== null && page >= firstTotalPages) {
      if (!isBootstrap) {
        return finish("partial", diagnostic("contract", "pagination_inconsistent", "The available pages ended before crossing the prior boundary"));
      }
      break;
    }
  }

  if (validItemCount === 0 && hasRejected) {
    return finish("blocked", diagnostic("contract", "schema_mismatch", "No WordPress item satisfied the endpoint contract"));
  }
  if (hasRejected) {
    return finish("partial", diagnostic("contract", "schema_mismatch", "One or more WordPress items were rejected"));
  }

  const hasChange = collected.some(({ manifest_item }) =>
    manifest_item.classification === "new" || manifest_item.classification === "changed"
  );
  return finish(hasChange ? "succeeded" : "no_change", null);
}

function validateCollectionInput(input: CollectAbveInput): CollectorDiagnostic | null {
  if (!contractMatches(input.contract)) {
    return diagnostic("contract", "schema_mismatch", "The ABVE endpoint contract does not match the approved canonical contract");
  }
  if (!isUtcInstant(input.run_started_at)) {
    return diagnostic("contract", "schema_mismatch", "run_started_at must be an RFC3339 UTC instant");
  }
  if (
    input.cursor_in !== null &&
    (input.cursor_in.version !== "abve-time-window-v1" || !isUtcInstant(input.cursor_in.before))
  ) {
    return diagnostic("contract", "schema_mismatch", "cursor_in is invalid or version-incompatible");
  }
  return null;
}

function contractMatches(contract: AbveEndpointContract): boolean {
  try {
    return canonicalJson(contract) === canonicalJson(ABVE_ENDPOINT_CONTRACT);
  } catch {
    return false;
  }
}

function createBaseline(input: CollectAbveInput):
  | { readonly ok: true; readonly fingerprints: Map<string, string> }
  | { readonly ok: false; readonly diagnostic: CollectorDiagnostic } {
  const prior = input.prior_manifest;
  if (
    input.cursor_in !== null &&
    (prior === undefined || prior === null || typeof prior.expected_hash !== "string")
  ) {
    return { ok: false, diagnostic: priorManifestUnavailable() };
  }
  if (prior === undefined || prior === null) {
    return { ok: true, fingerprints: new Map() };
  }

  try {
    validateManifest(prior.manifest);
    if (
      prior.manifest.manifest_version !== MANIFEST_VERSION ||
      prior.manifest.payload.endpoint_key !== ABVE_ENDPOINT_CONTRACT.endpoint_key ||
      prior.manifest.payload.contract_version !== CONTRACT_VERSION
    ) {
      return { ok: false, diagnostic: priorManifestUnavailable() };
    }
    if (responseManifestHash(prior.manifest.payload) !== prior.expected_hash) {
      return { ok: false, diagnostic: priorManifestUnavailable() };
    }
  } catch {
    return { ok: false, diagnostic: priorManifestUnavailable() };
  }

  const fingerprints = new Map<string, string>();
  for (const item of prior.manifest.payload.items) {
    if (item.native_identity !== null && item.content_fingerprint !== null) {
      fingerprints.set(canonicalJson(item.native_identity), item.content_fingerprint);
    }
  }
  return { ok: true, fingerprints };
}

async function fetchPage(
  contract: AbveEndpointContract,
  page: number,
  pageUrl: string,
  dependencies: AbveAdapterDependencies,
  attempts: ManifestAttempt[],
): Promise<PageResult> {
  let lastRequest = emptyRequest(page, pageUrl, 1);
  let lastDiagnostic = diagnostic("transport", "connection_reset", "The HTTP request did not complete");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const timeout = dependencies.createAbortTimeout(contract.request_config.timeout_ms);
    let response: Response;
    try {
      response = await fetchFollowingRedirects(pageUrl, contract, dependencies.fetch, timeout.signal);
    } catch (error) {
      timeout.cancel();
      if (error instanceof RedirectViolation) {
        attempts.push({ page, attempt, outcome: error.code, status_code: error.statusCode });
        return {
          ok: false,
          request: {
            ...emptyRequest(page, pageUrl, attempt),
            outcome: error.code,
            status_code: error.statusCode,
          },
          diagnostic: diagnostic("access_policy", error.code, "The HTTP redirect violates the approved endpoint access policy"),
          terminalStatus: "blocked",
        };
      }

      const timeoutFailure = timeout.signal.aborted || isTimeoutError(error);
      const code = timeoutFailure ? "read_timeout" : "connection_reset";
      lastDiagnostic = diagnostic("transport", code, timeoutFailure ? "The HTTP attempt timed out" : "The HTTP connection ended before a response was available");
      lastRequest = emptyRequest(page, pageUrl, attempt);
      lastRequest = { ...lastRequest, outcome: code };
      const record: MutableAttempt = { page, attempt, outcome: code };
      if (attempt < MAX_ATTEMPTS) {
        record.retry_delay_ms = retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      return { ok: false, request: lastRequest, diagnostic: lastDiagnostic, terminalStatus: "failed" };
    }
    const stableHeaders = collectStableHeaders(response.headers, contract);
    const contentType = response.headers.get("content-type");
    lastRequest = {
      page,
      canonical_url: pageUrl,
      attempt_count: attempt,
      outcome: `http_${response.status}`,
      status_code: response.status,
      content_type: contentType,
      byte_length: 0,
      response_body_sha256: null,
      stable_headers: stableHeaders,
    };

    if (isRetryableStatus(response.status)) {
      await cancelBody(response);
      timeout.cancel();
      const retryAfter = parseRetryAfter(response.headers.get("retry-after"), dependencies.now());
      if (retryAfter !== null && retryAfter > MAX_RETRY_AFTER_MS) {
        attempts.push({ page, attempt, outcome: `http_${response.status}`, status_code: response.status });
        return {
          ok: false,
          request: { ...lastRequest, outcome: "retry_after_too_long" },
          diagnostic: diagnostic("rate_limit", "retry_after_too_long", "Retry-After exceeds the approved 240 second maximum"),
          terminalStatus: "failed",
        };
      }

      const record: MutableAttempt = { page, attempt, outcome: `http_${response.status}`, status_code: response.status };
      if (attempt < MAX_ATTEMPTS) {
        record.retry_delay_ms = retryAfter ?? retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      const kind = response.status === 429 ? "rate_limit" : "http";
      const code = response.status >= 500 ? "http_5xx_exhausted" : `http_${response.status}_exhausted`;
      return {
        ok: false,
        request: lastRequest,
        diagnostic: diagnostic(kind, code, `HTTP ${response.status} remained retryable after three attempts`),
        terminalStatus: "failed",
      };
    }

    if (response.status < 200 || response.status >= 300) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({ page, attempt, outcome: `http_${response.status}`, status_code: response.status });
      const accessDenied = response.status === 401 || response.status === 403;
      return {
        ok: false,
        request: lastRequest,
        diagnostic: accessDenied
          ? diagnostic("access_policy", "authentication_required", `HTTP ${response.status} requires an access decision`)
          : diagnostic("http", `http_${response.status}`, `HTTP ${response.status} is not retryable under the endpoint contract`),
        terminalStatus: "blocked",
      };
    }

    if (!isJsonContentType(contentType)) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({ page, attempt, outcome: "content_type_unexpected", status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, outcome: "content_type_unexpected" },
        diagnostic: diagnostic("format", "content_type_unexpected", "The response Content-Type is not JSON"),
        terminalStatus: "blocked",
      };
    }

    const declaredLength = parseNonNegativeInteger(response.headers.get("content-length"));
    if (declaredLength !== null && declaredLength > contract.request_config.max_response_bytes) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({ page, attempt, outcome: "response_too_large", status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, outcome: "response_too_large" },
        diagnostic: diagnostic("size_limit", "response_too_large", "The response exceeds the approved byte limit"),
        terminalStatus: "blocked",
      };
    }

    let bytes: Uint8Array;
    try {
      bytes = await readBodyLimited(response, contract.request_config.max_response_bytes);
    } catch (error) {
      timeout.cancel();
      if (error instanceof ResponseTooLarge) {
        attempts.push({ page, attempt, outcome: "response_too_large", status_code: response.status });
        return {
          ok: false,
          request: { ...lastRequest, outcome: "response_too_large" },
          diagnostic: diagnostic("size_limit", "response_too_large", "The streamed response exceeded the approved byte limit"),
          terminalStatus: "blocked",
        };
      }

      const timeoutFailure = timeout.signal.aborted || isTimeoutError(error);
      const code = timeoutFailure ? "read_timeout" : "connection_reset";
      const record: MutableAttempt = { page, attempt, outcome: code, status_code: response.status };
      lastRequest = { ...lastRequest, attempt_count: attempt, outcome: code };
      lastDiagnostic = diagnostic("transport", code, timeoutFailure ? "The response body timed out" : "The response body disconnected before completion");
      if (attempt < MAX_ATTEMPTS) {
        record.retry_delay_ms = retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      return { ok: false, request: lastRequest, diagnostic: lastDiagnostic, terminalStatus: "failed" };
    }
    timeout.cancel();
    lastRequest = { ...lastRequest, byte_length: bytes.byteLength };
    const rawResponseSha256 = sha256Bytes(bytes);

    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(bytes).toString("utf8"));
    } catch {
      attempts.push({ page, attempt, outcome: "json_invalid", status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, outcome: "json_invalid" },
        diagnostic: diagnostic("format", "json_invalid", "The response body is not valid JSON"),
        terminalStatus: "blocked",
      };
    }
    if (!Array.isArray(parsed)) {
      attempts.push({ page, attempt, outcome: "schema_mismatch", status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, outcome: "schema_mismatch" },
        diagnostic: diagnostic("contract", "schema_mismatch", "The WordPress response root is not an array"),
        terminalStatus: "blocked",
      };
    }

    lastRequest = { ...lastRequest, outcome: "success", response_body_sha256: rawResponseSha256 };
    attempts.push({ page, attempt, outcome: "success", status_code: response.status });
    return { ok: true, body: parsed, request: lastRequest };
  }

  return { ok: false, request: lastRequest, diagnostic: lastDiagnostic, terminalStatus: "failed" };
}

async function fetchFollowingRedirects(
  initialUrl: string,
  contract: AbveEndpointContract,
  fetchFunction: AbveAdapterDependencies["fetch"],
  signal: AbortSignal,
): Promise<Response> {
  let currentUrl = initialUrl;
  for (let redirects = 0; ; redirects += 1) {
    const response = await fetchFunction(currentUrl, {
      method: "GET",
      headers: contract.request_config.headers,
      redirect: "manual",
      signal,
    });
    if (!REDIRECT_STATUSES.has(response.status)) {
      return response;
    }

    const location = response.headers.get("location");
    if (location === null) {
      await cancelBody(response);
      throw new RedirectViolation("redirect_host_not_allowed", response.status);
    }
    if (redirects >= MAX_REDIRECTS) {
      await cancelBody(response);
      throw new RedirectViolation("redirect_limit_exceeded", response.status);
    }

    let next: URL;
    try {
      next = new URL(location, currentUrl);
    } catch {
      await cancelBody(response);
      throw new RedirectViolation("redirect_host_not_allowed", response.status);
    }
    const approved = new URL(contract.endpoint_url);
    if (
      next.protocol !== "https:" || next.username !== "" || next.password !== "" ||
      next.hostname !== approved.hostname
    ) {
      await cancelBody(response);
      throw new RedirectViolation("redirect_host_not_allowed", response.status);
    }
    currentUrl = next.toString();
    await cancelBody(response);
  }
}

export function abveConfigFingerprint(contract: AbveEndpointContract): string {
  return configFingerprint({
    contract_version: CONTRACT_VERSION,
    source_slug: contract.source_slug,
    endpoint_key: contract.endpoint_key,
    endpoint_url: contract.endpoint_url,
    endpoint_type: contract.endpoint_type,
    access_method: contract.access_method,
    response_format: contract.response_format,
    status: contract.status,
    request_config: contract.request_config as unknown as CanonicalJsonValue,
    pagination_strategy: contract.pagination_strategy,
    pagination_config: contract.pagination_config as unknown as CanonicalJsonValue,
    cursor_strategy: contract.cursor_strategy,
    cursor_config: contract.cursor_config as unknown as CanonicalJsonValue,
    identity_rule: contract.identity_rule as unknown as CanonicalJsonValue,
    normalization_profile: contract.normalization_profile,
    removal_policy: contract.removal_policy,
    default_retention_class: contract.default_retention_class,
    terms_url: contract.terms_url,
    robots_url: contract.robots_url,
  });
}

function validatePaginationCardinality(
  totals: { readonly total: number; readonly totalPages: number },
  page: number,
  pageSize: number,
  actualCount: number,
): string | null {
  const expectedTotalPages = totals.total === 0 ? 0 : Math.ceil(totals.total / pageSize);
  if (totals.totalPages !== expectedTotalPages) {
    return "WordPress total pages is inconsistent with total items and page size";
  }
  if (totals.total === 0) {
    return actualCount === 0 ? null : "WordPress returned items while reporting an empty result set";
  }
  if (page >= 1 && page <= totals.totalPages) {
    const remaining = Math.max(totals.total - ((page - 1) * pageSize), 0);
    const expectedCount = Math.min(pageSize, remaining);
    if (actualCount !== expectedCount) {
      return "WordPress page item count is inconsistent with pagination totals";
    }
  }
  return null;
}

function buildPageUrl(contract: AbveEndpointContract, page: number, freeze: string): string {
  const url = new URL(contract.endpoint_url);
  for (const [name, value] of Object.entries(contract.request_config.query_params)) {
    url.searchParams.set(name, String(value));
  }
  url.searchParams.set(contract.pagination_config.page_parameter, String(page));
  url.searchParams.set(contract.pagination_config.page_size_parameter, String(contract.pagination_config.page_size));
  url.searchParams.set(contract.pagination_config.freeze_parameter, freeze);
  return canonicalizeUrl(url.toString());
}

function collectStableHeaders(headers: Headers, contract: AbveEndpointContract): ManifestStableHeaders {
  const result: Record<string, string> = {};
  for (const name of [
    "Content-Type",
    "Content-Length",
    "ETag",
    "Last-Modified",
    "X-WP-Total",
    "X-WP-TotalPages",
  ] as const) {
    const value = headers.get(name);
    if (value !== null) {
      result[name] = sanitizeMessage(value);
    }
  }
  const link = headers.get("Link");
  if (link !== null) {
    const sanitized = sanitizeLinkHeader(link, contract);
    if (sanitized !== null) {
      result.Link = sanitized;
    }
  }
  return result;
}

function sanitizeLinkHeader(value: string, contract: AbveEndpointContract): string | null {
  let valid = true;
  const sanitized = sanitizeMessage(value).replace(/<([^>]*)>/gu, (_match, rawUrl: string) => {
    try {
      const url = new URL(rawUrl);
      if (url.hostname !== new URL(contract.endpoint_url).hostname) {
        valid = false;
        return "";
      }
      for (const key of [...url.searchParams.keys()]) {
        if (!PUBLIC_LINK_QUERY_KEYS.has(key)) {
          url.searchParams.delete(key);
        }
      }
      return `<${canonicalizeUrl(url.toString())}>`;
    } catch {
      valid = false;
      return "";
    }
  });
  return valid ? sanitized : null;
}

async function readBodyLimited(response: Response, maximumBytes: number): Promise<Uint8Array> {
  if (response.body === null) {
    return new Uint8Array();
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new ResponseTooLarge("response_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

async function cancelBody(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined);
}

function emptyRequest(page: number, canonicalUrl: string, attemptCount: number): ManifestRequest {
  return {
    page,
    canonical_url: canonicalUrl,
    attempt_count: attemptCount,
    outcome: "request_incomplete",
    status_code: null,
    content_type: null,
    byte_length: 0,
    response_body_sha256: null,
    stable_headers: {},
  };
}

function parseTotals(headers: ManifestStableHeaders): { total: number; totalPages: number } | null {
  const total = parseNonNegativeInteger(headers["X-WP-Total"] ?? null);
  const totalPages = parseNonNegativeInteger(headers["X-WP-TotalPages"] ?? null);
  return total === null || totalPages === null ? null : { total, totalPages };
}

function parseNonNegativeInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/u.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function isJsonContentType(value: string | null): boolean {
  return value !== null && value.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function parseRetryAfter(value: string | null, now: number): number | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (/^\d+$/u.test(trimmed)) {
    return Number(trimmed) * 1_000;
  }
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : Math.max(0, parsed - now);
}

function retryDelay(attempt: number, random: () => number): number {
  const base = RETRY_BASE_MS[attempt - 1] ?? 2_000;
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample > 1) {
    throw new Error("random must return a value between zero and one");
  }
  return Math.floor(sample * base);
}

function comparableWpDate(value: string): number | null {
  const candidate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?$/u.test(value)
    ? `${value}Z`
    : value;
  const parsed = Date.parse(candidate);
  return Number.isNaN(parsed) ? null : parsed;
}

function isUtcInstant(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

function diagnostic(
  error_kind: CollectorDiagnostic["error_kind"],
  error_code: string,
  message: string,
): CollectorDiagnostic {
  return {
    error_kind,
    error_code,
    error_message: sanitizeMessage(message),
  };
}

function priorManifestUnavailable(): CollectorDiagnostic {
  return diagnostic("contract", "prior_manifest_unavailable", "The required prior manifest is unavailable or incompatible");
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

interface MutableAttempt {
  page: number;
  attempt: number;
  outcome: string;
  status_code?: number;
  retry_delay_ms?: number;
}
