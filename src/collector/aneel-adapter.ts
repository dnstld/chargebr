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
  parseAneelIndexPage,
  validateAndNormalizeAneelDetail,
  type AneelIndexItem,
  type NormalizedAneelDetail,
} from "./aneel-html.js";
import { sanitizeMessage } from "./sanitize.js";
import {
  cancelBody,
  fetchFollowingRedirects,
  isRetryableStatus,
  isTimeoutError,
  MAX_ABVE_HTTP_ATTEMPTS as MAX_ATTEMPTS,
  MAX_ABVE_RETRY_AFTER_MS as MAX_RETRY_AFTER_MS,
  parseNonNegativeInteger,
  parseRetryAfter,
  readBodyLimited,
  RedirectViolation,
  ResponseTooLarge,
  retryDelay,
} from "./abve-http.js";
import type {
  AbortTimeout,
  CollectorDiagnostic,
  PriorManifestInput,
  ProposedOperationalStatus,
} from "./abve-adapter.js";

export interface AneelEndpointContract {
  readonly source_slug: "aneel";
  readonly endpoint_key: "aneel-board-meetings-index";
  readonly endpoint_url: "https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425";
  readonly endpoint_type: "document_index";
  readonly access_method: "http_get";
  readonly response_format: "html";
  readonly status: "active";
  readonly request_config: {
    readonly timeout_ms: 20_000;
    readonly max_response_bytes: 1_000_000;
    readonly query_params: { readonly idAreaNoticia: "425" };
    readonly headers: { readonly Accept: "text/html" };
  };
  readonly pagination_strategy: "page";
  readonly pagination_config: {
    readonly page_parameter: "page";
    readonly first_page: 1;
    readonly observed_page_size: 15;
    readonly max_pages: 10;
    readonly next_link_text: "Próximas 15 >>";
    readonly allowed_path: "/aplicacoes_liferay/noticias_area/dsp_listarNoticias.cfm";
  };
  readonly cursor_strategy: "none";
  readonly cursor_config: Record<string, never>;
  readonly identity_rule: {
    readonly version: "aneel-board-meeting-index-identity-v1";
    readonly primary: { readonly query_parameter: "idNoticia" };
    readonly required_scope: { readonly idAreaNoticia: "425" };
    readonly detail_path: "/aplicacoes_liferay/noticias_area/dsp_detalheNoticia.cfm";
  };
  readonly normalization_profile: "aneel-board-meeting-html-v1";
  readonly removal_policy: "none";
  readonly suggested_interval: "7 days";
  readonly default_retention_class: "external_reference";
  readonly terms_url: "https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas";
  readonly robots_url: "https://www2.aneel.gov.br/robots.txt";
}

export const ANEEL_ENDPOINT_CONTRACT: AneelEndpointContract = {
  source_slug: "aneel",
  endpoint_key: "aneel-board-meetings-index",
  endpoint_url: "https://www2.aneel.gov.br/aplicacoes_liferay/noticias_area/?idAreaNoticia=425",
  endpoint_type: "document_index",
  access_method: "http_get",
  response_format: "html",
  status: "active",
  request_config: {
    timeout_ms: 20_000,
    max_response_bytes: 1_000_000,
    query_params: { idAreaNoticia: "425" },
    headers: { Accept: "text/html" },
  },
  pagination_strategy: "page",
  pagination_config: {
    page_parameter: "page",
    first_page: 1,
    observed_page_size: 15,
    max_pages: 10,
    next_link_text: "Próximas 15 >>",
    allowed_path: "/aplicacoes_liferay/noticias_area/dsp_listarNoticias.cfm",
  },
  cursor_strategy: "none",
  cursor_config: {},
  identity_rule: {
    version: "aneel-board-meeting-index-identity-v1",
    primary: { query_parameter: "idNoticia" },
    required_scope: { idAreaNoticia: "425" },
    detail_path: "/aplicacoes_liferay/noticias_area/dsp_detalheNoticia.cfm",
  },
  normalization_profile: "aneel-board-meeting-html-v1",
  removal_policy: "none",
  suggested_interval: "7 days",
  default_retention_class: "external_reference",
  terms_url: "https://www.gov.br/aneel/pt-br/reunioes-publicas/pautas-e-atas",
  robots_url: "https://www2.aneel.gov.br/robots.txt",
};

export interface CollectAneelInput {
  readonly contract: AneelEndpointContract;
  readonly run_started_at: string;
  readonly prior_manifest?: PriorManifestInput | null;
}

export interface CollectedAneelItem {
  readonly manifest_item: ManifestItem;
  readonly normalized: NormalizedAneelDetail | null;
  readonly published_date: string;
}

export interface AneelCollectionOutcome {
  readonly status: ProposedOperationalStatus;
  readonly error: CollectorDiagnostic | null;
  readonly cursor_in: null;
  readonly cursor_out: null;
  readonly requests: readonly ManifestRequest[];
  readonly attempt_history: readonly ManifestAttempt[];
  readonly items: readonly CollectedAneelItem[];
  readonly counts: AggregateCounts;
  readonly manifest_payload: ManifestPayload;
  readonly response_manifest_hash: string;
}

export interface AneelAdapterDependencies {
  readonly fetch: (input: string, init: RequestInit) => Promise<Response>;
  readonly sleep: (milliseconds: number) => Promise<void>;
  readonly random: () => number;
  readonly now: () => number;
  readonly createAbortTimeout: (milliseconds: number) => AbortTimeout;
  readonly isFatalError?: (error: unknown) => boolean;
}

interface HtmlSuccess {
  readonly ok: true;
  readonly html: string;
  readonly request: ManifestRequest;
}

interface HtmlFailure {
  readonly ok: false;
  readonly request: ManifestRequest;
  readonly diagnostic: CollectorDiagnostic;
  readonly terminalStatus: "failed" | "blocked";
}

type HtmlResult = HtmlSuccess | HtmlFailure;

const DEFAULT_DEPENDENCIES: AneelAdapterDependencies = {
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

export async function collectAneel(
  input: CollectAneelInput,
  dependencyOverrides: Partial<AneelAdapterDependencies> = {},
): Promise<AneelCollectionOutcome> {
  const dependencies = { ...DEFAULT_DEPENDENCIES, ...dependencyOverrides };
  const requests: ManifestRequest[] = [];
  const attempts: ManifestAttempt[] = [];
  const collected: CollectedAneelItem[] = [];

  const finish = (
    status: ProposedOperationalStatus,
    error: CollectorDiagnostic | null,
  ): AneelCollectionOutcome => {
    const safeStartedAt = isUtcInstant(input.run_started_at)
      ? input.run_started_at
      : "1970-01-01T00:00:00.000Z";
    const terminalWithoutOutput = status === "failed" || status === "blocked";
    const sorted = (terminalWithoutOutput ? [] : [...collected]).sort((left, right) =>
      right.published_date.localeCompare(left.published_date) ||
      compare(
        canonicalJson(left.manifest_item.native_identity),
        canonicalJson(right.manifest_item.native_identity),
      )
    );
    const payload = createManifestPayload({
      config_fingerprint: aneelConfigFingerprint(
        contractMatches(input.contract) ? input.contract : ANEEL_ENDPOINT_CONTRACT,
      ),
      endpoint_key: ANEEL_ENDPOINT_CONTRACT.endpoint_key,
      window: { start: null, end: safeStartedAt, freeze_before: safeStartedAt },
      requests,
      items: sorted.map(({ manifest_item }) => manifest_item),
    });
    return {
      status,
      error,
      cursor_in: null,
      cursor_out: null,
      requests: payload.requests,
      attempt_history: attempts,
      items: sorted,
      counts: payload.aggregate_counts,
      manifest_payload: payload,
      response_manifest_hash: responseManifestHash(payload),
    };
  };

  if (!contractMatches(input.contract)) {
    return finish("blocked", diagnostic(
      "contract",
      "schema_mismatch",
      "The ANEEL endpoint contract does not match the approved canonical contract",
    ));
  }
  if (!isUtcInstant(input.run_started_at)) {
    return finish("blocked", diagnostic(
      "contract",
      "schema_mismatch",
      "run_started_at must be an RFC3339 UTC instant",
    ));
  }

  const baselineResult = createBaseline(input);
  if (!baselineResult.ok) return finish("blocked", baselineResult.diagnostic);
  const baseline = baselineResult.fingerprints;
  const seenIds = new Set<number>();
  const seenPages = new Set<string>();
  let pageUrl = buildFirstPageUrl(input.contract);
  let hasInaccessible = false;
  let hasRejected = false;
  let firstItemFailure: CollectorDiagnostic | null = null;

  for (
    let page = input.contract.pagination_config.first_page;
    page <= input.contract.pagination_config.max_pages;
    page += 1
  ) {
    if (seenPages.has(pageUrl)) {
      return finish(
        collected.length === 0 ? "blocked" : "partial",
        diagnostic("contract", "pagination_inconsistent", "The ANEEL pagination repeated a page URL"),
      );
    }
    seenPages.add(pageUrl);

    const indexResult = await fetchHtml(input.contract, page, pageUrl, dependencies, attempts);
    requests.push(indexResult.request);
    if (!indexResult.ok) {
      return finish(
        collected.length === 0 ? indexResult.terminalStatus : "partial",
        indexResult.diagnostic,
      );
    }

    const parsed = parseAneelIndexPage(
      indexResult.html,
      pageUrl,
      page,
      input.contract.pagination_config.observed_page_size,
      input.contract.pagination_config.next_link_text,
      input.contract.pagination_config.allowed_path,
      input.contract.identity_rule.detail_path,
    );
    if (!parsed.ok) {
      return finish(
        collected.length === 0 ? "blocked" : "partial",
        diagnostic("contract", parsed.code, parsed.message),
      );
    }

    for (let index = 0; index < parsed.value.items.length; index += 1) {
      const item = parsed.value.items[index];
      if (item === undefined) continue;
      if (seenIds.has(item.idNoticia)) {
        return finish(
          collected.length === 0 ? "blocked" : "partial",
          diagnostic(
            "contract",
            "pagination_inconsistent",
            "A duplicate ANEEL idNoticia was observed across the collection window",
          ),
        );
      }
      seenIds.add(item.idNoticia);

      const detailResult = await fetchHtml(
        input.contract,
        page,
        item.canonicalUrl,
        dependencies,
        attempts,
      );
      requests.push(detailResult.request);
      if (!detailResult.ok) {
        hasInaccessible = true;
        firstItemFailure ??= detailResult.diagnostic;
        collected.push(inaccessibleItem(item, detailResult.diagnostic, page, index));
        continue;
      }

      const detail = validateAndNormalizeAneelDetail(detailResult.html, item);
      if (!detail.ok) {
        hasRejected = true;
        firstItemFailure ??= diagnostic("contract", detail.code, detail.message);
        collected.push(rejectedItem(item, detail.message, page, index));
        continue;
      }

      const identityKey = canonicalJson(detail.value.identity);
      const priorFingerprint = baseline.get(identityKey);
      const classification = priorFingerprint === undefined
        ? "new"
        : priorFingerprint === detail.value.fingerprint
          ? "unchanged"
          : "changed";
      collected.push({
        normalized: detail.value.normalized,
        published_date: item.publishedDate,
        manifest_item: {
          native_identity: detail.value.identity,
          canonical_url: detail.value.canonicalUrl,
          content_fingerprint: detail.value.fingerprint,
          classification,
        },
      });
    }

    if (parsed.value.nextPageUrl === null) break;
    if (page === input.contract.pagination_config.max_pages) {
      return finish("partial", diagnostic(
        "contract",
        "pagination_inconsistent",
        "The ANEEL collection reached max_pages while a next-page link remained",
      ));
    }
    pageUrl = parsed.value.nextPageUrl;
  }

  if (hasInaccessible || hasRejected) {
    return finish("partial", firstItemFailure ?? diagnostic(
      "contract",
      "schema_mismatch",
      "One or more ANEEL detail items could not be classified",
    ));
  }
  const hasChange = collected.some(({ manifest_item }) =>
    manifest_item.classification === "new" || manifest_item.classification === "changed"
  );
  return finish(hasChange ? "succeeded" : "no_change", null);
}

export function aneelConfigFingerprint(contract: AneelEndpointContract): string {
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

function createBaseline(input: CollectAneelInput):
  | { readonly ok: true; readonly fingerprints: Map<string, string> }
  | { readonly ok: false; readonly diagnostic: CollectorDiagnostic } {
  if (input.prior_manifest === undefined) {
    return { ok: true, fingerprints: new Map() };
  }
  if (input.prior_manifest === null) {
    return { ok: false, diagnostic: priorManifestUnavailable() };
  }

  const prior = input.prior_manifest;
  try {
    validateManifest(prior.manifest);
    if (
      prior.manifest.manifest_version !== MANIFEST_VERSION ||
      prior.manifest.payload.endpoint_key !== ANEEL_ENDPOINT_CONTRACT.endpoint_key ||
      prior.manifest.payload.contract_version !== CONTRACT_VERSION ||
      prior.manifest.payload.config_fingerprint !== aneelConfigFingerprint(input.contract) ||
      responseManifestHash(prior.manifest.payload) !== prior.expected_hash
    ) {
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

async function fetchHtml(
  contract: AneelEndpointContract,
  page: number,
  url: string,
  dependencies: AneelAdapterDependencies,
  attempts: ManifestAttempt[],
): Promise<HtmlResult> {
  let lastRequest = emptyRequest(page, url, 1);
  let lastDiagnostic = diagnostic("transport", "connection_reset", "The HTTP request did not complete");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const timeout = dependencies.createAbortTimeout(contract.request_config.timeout_ms);
    let response: Response;
    try {
      response = await fetchFollowingRedirects(url, contract, dependencies.fetch, timeout.signal);
    } catch (error) {
      timeout.cancel();
      if (dependencies.isFatalError?.(error) === true) throw error;
      if (error instanceof RedirectViolation) {
        attempts.push({ page, attempt, outcome: error.code, status_code: error.statusCode });
        return {
          ok: false,
          request: { ...emptyRequest(page, url, attempt), outcome: error.code, status_code: error.statusCode },
          diagnostic: diagnostic(
            "access_policy",
            error.code,
            "The HTTP redirect violates the approved ANEEL access policy",
          ),
          terminalStatus: "blocked",
        };
      }
      const timedOut = timeout.signal.aborted || isTimeoutError(error);
      const code = timedOut ? "read_timeout" : "connection_reset";
      lastDiagnostic = diagnostic(
        "transport",
        code,
        timedOut ? "The ANEEL HTTP attempt timed out" : "The ANEEL HTTP connection ended before a response was available",
      );
      lastRequest = { ...emptyRequest(page, url, attempt), outcome: code };
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

    const contentType = response.headers.get("content-type");
    const stableHeaders = collectStableHeaders(response.headers);
    lastRequest = {
      page,
      canonical_url: url,
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
        attempts.push({ page, attempt, outcome: "retry_after_too_long", status_code: response.status });
        return {
          ok: false,
          request: { ...lastRequest, outcome: "retry_after_too_long" },
          diagnostic: diagnostic(
            "rate_limit",
            "retry_after_too_long",
            "Retry-After exceeds the approved 240 second maximum",
          ),
          terminalStatus: "failed",
        };
      }
      const record: MutableAttempt = {
        page,
        attempt,
        outcome: `http_${response.status}`,
        status_code: response.status,
      };
      if (attempt < MAX_ATTEMPTS) {
        record.retry_delay_ms = retryAfter ?? retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      return {
        ok: false,
        request: lastRequest,
        diagnostic: diagnostic(
          response.status === 429 ? "rate_limit" : "http",
          response.status >= 500 ? "http_5xx_exhausted" : `http_${response.status}_exhausted`,
          `HTTP ${response.status} remained retryable after three attempts`,
        ),
        terminalStatus: "failed",
      };
    }

    if (response.status < 200 || response.status >= 300) {
      await cancelBody(response);
      timeout.cancel();
      const challenge = response.headers.get("cf-mitigated")?.toLowerCase() === "challenge";
      const accessDenied = response.status === 401 || response.status === 403;
      const code = challenge
        ? "access_challenge"
        : accessDenied
          ? "authentication_required"
          : `http_${response.status}`;
      attempts.push({ page, attempt, outcome: code, status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, outcome: code },
        diagnostic: diagnostic(
          challenge || accessDenied ? "access_policy" : "http",
          code,
          challenge
            ? "The ANEEL endpoint returned an interactive access challenge"
            : `HTTP ${response.status} is not retryable under the ANEEL endpoint contract`,
        ),
        terminalStatus: "blocked",
      };
    }

    if (!isIso88591Html(contentType)) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({ page, attempt, outcome: "content_type_unexpected", status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, outcome: "content_type_unexpected" },
        diagnostic: diagnostic(
          "format",
          "content_type_unexpected",
          "The ANEEL response is not HTML declared as ISO-8859-1",
        ),
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
        diagnostic: diagnostic("size_limit", "response_too_large", "The ANEEL response exceeds the approved byte limit"),
        terminalStatus: "blocked",
      };
    }

    let bytes: Uint8Array;
    try {
      bytes = await readBodyLimited(response, contract.request_config.max_response_bytes);
    } catch (error) {
      timeout.cancel();
      if (dependencies.isFatalError?.(error) === true) throw error;
      if (error instanceof ResponseTooLarge) {
        attempts.push({ page, attempt, outcome: "response_too_large", status_code: response.status });
        return {
          ok: false,
          request: { ...lastRequest, outcome: "response_too_large" },
          diagnostic: diagnostic("size_limit", "response_too_large", "The streamed ANEEL response exceeded the approved byte limit"),
          terminalStatus: "blocked",
        };
      }
      const timedOut = timeout.signal.aborted || isTimeoutError(error);
      const code = timedOut ? "read_timeout" : "connection_reset";
      const record: MutableAttempt = { page, attempt, outcome: code, status_code: response.status };
      lastRequest = { ...lastRequest, attempt_count: attempt, outcome: code };
      lastDiagnostic = diagnostic(
        "transport",
        code,
        timedOut ? "The ANEEL response body timed out" : "The ANEEL response body disconnected before completion",
      );
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

    let html: string;
    try {
      html = new TextDecoder("windows-1252", { fatal: true }).decode(bytes);
    } catch {
      attempts.push({ page, attempt, outcome: "html_decode_failed", status_code: response.status });
      return {
        ok: false,
        request: { ...lastRequest, byte_length: bytes.byteLength, outcome: "html_decode_failed" },
        diagnostic: diagnostic("format", "html_decode_failed", "The ANEEL response could not be decoded as ISO-8859-1"),
        terminalStatus: "blocked",
      };
    }

    lastRequest = {
      ...lastRequest,
      outcome: "success",
      byte_length: bytes.byteLength,
      response_body_sha256: sha256Bytes(bytes),
    };
    attempts.push({ page, attempt, outcome: "success", status_code: response.status });
    return { ok: true, html, request: lastRequest };
  }

  return { ok: false, request: lastRequest, diagnostic: lastDiagnostic, terminalStatus: "failed" };
}

function inaccessibleItem(
  item: AneelIndexItem,
  failure: CollectorDiagnostic,
  page: number,
  index: number,
): CollectedAneelItem {
  return {
    normalized: null,
    published_date: item.publishedDate,
    manifest_item: {
      native_identity: { idNoticia: item.idNoticia },
      canonical_url: item.canonicalUrl,
      content_fingerprint: null,
      classification: "inaccessible",
      diagnostic: {
        code: failure.error_code,
        message: failure.error_message,
        page,
        index,
      },
    },
  };
}

function rejectedItem(
  item: AneelIndexItem,
  message: string,
  page: number,
  index: number,
): CollectedAneelItem {
  return {
    normalized: null,
    published_date: item.publishedDate,
    manifest_item: {
      native_identity: { idNoticia: item.idNoticia },
      canonical_url: item.canonicalUrl,
      content_fingerprint: null,
      classification: "rejected",
      diagnostic: {
        code: "schema_mismatch",
        message: sanitizeMessage(message),
        page,
        index,
      },
    },
  };
}

function buildFirstPageUrl(contract: AneelEndpointContract): string {
  const url = new URL(contract.endpoint_url);
  for (const [name, value] of Object.entries(contract.request_config.query_params)) {
    url.searchParams.set(name, value);
  }
  url.searchParams.set(
    contract.pagination_config.page_parameter,
    String(contract.pagination_config.first_page),
  );
  return canonicalizeUrl(url.toString());
}

function collectStableHeaders(headers: Headers): ManifestStableHeaders {
  const result: Record<string, string> = {};
  for (const name of ["Content-Type", "Content-Length", "ETag", "Last-Modified"] as const) {
    const value = headers.get(name);
    if (value !== null) result[name] = sanitizeMessage(value);
  }
  return result;
}

function emptyRequest(page: number, url: string, attemptCount: number): ManifestRequest {
  return {
    page,
    canonical_url: url,
    attempt_count: attemptCount,
    outcome: "request_incomplete",
    status_code: null,
    content_type: null,
    byte_length: 0,
    response_body_sha256: null,
    stable_headers: {},
  };
}

function isIso88591Html(value: string | null): boolean {
  if (value === null) return false;
  const parts = value.split(";").map((part) => part.trim().toLowerCase());
  if (parts[0] !== "text/html") return false;
  const charset = parts.slice(1).find((part) => part.startsWith("charset="));
  return charset?.replace(/^charset=["']?|["']$/gu, "") === "iso-8859-1";
}

function contractMatches(contract: AneelEndpointContract): boolean {
  try {
    return canonicalJson(contract) === canonicalJson(ANEEL_ENDPOINT_CONTRACT);
  } catch {
    return false;
  }
}

function isUtcInstant(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function diagnostic(
  error_kind: CollectorDiagnostic["error_kind"],
  error_code: string,
  message: string,
): CollectorDiagnostic {
  return { error_kind, error_code, error_message: sanitizeMessage(message) };
}

function priorManifestUnavailable(): CollectorDiagnostic {
  return diagnostic(
    "contract",
    "prior_manifest_unavailable",
    "The required prior ANEEL manifest is unavailable or incompatible",
  );
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
