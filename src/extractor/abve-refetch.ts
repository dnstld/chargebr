import type {
  AbortTimeout,
  AbveAdapterDependencies,
  AbveEndpointContract,
  CollectorDiagnostic,
} from "../collector/abve-adapter.js";
import {
  cancelBody,
  fetchFollowingRedirects,
  isJsonContentType,
  isRetryableStatus,
  isTimeoutError,
  MAX_ABVE_HTTP_ATTEMPTS,
  MAX_ABVE_RETRY_AFTER_MS,
  parseNonNegativeInteger,
  parseRetryAfter,
  readBodyLimited,
  RedirectViolation,
  ResponseTooLarge,
  retryDelay,
} from "../collector/abve-http.js";
import {
  validateAndNormalizeAbvePost,
  type ValidatedAbvePost,
} from "../collector/abve-post.js";
import { canonicalizeUrl } from "../collector/canonical-url.js";
import { sha256Bytes } from "../collector/hash.js";
import { sanitizeMessage } from "../collector/sanitize.js";

export interface AbveRefetchAttempt {
  readonly attempt: number;
  readonly outcome: string;
  readonly status_code?: number;
  readonly retry_delay_ms?: number;
}

export interface AbveRefetchResponseEvidence {
  readonly request_url: string;
  readonly attempt_count: number;
  readonly status_code: number;
  readonly content_type: string;
  readonly byte_length: number;
  readonly response_body_sha256: string;
}

export interface AbveRefetchSuccess {
  readonly ok: true;
  readonly post: ValidatedAbvePost;
  readonly response: AbveRefetchResponseEvidence;
  readonly attempts: readonly AbveRefetchAttempt[];
}

export interface AbveRefetchFailure {
  readonly ok: false;
  readonly terminal_status: "blocked" | "failed";
  readonly diagnostic: CollectorDiagnostic;
  readonly attempts: readonly AbveRefetchAttempt[];
}

export type AbveRefetchResult = AbveRefetchSuccess | AbveRefetchFailure;

export type AbveRefetchDependencies = Pick<
  AbveAdapterDependencies,
  "fetch" | "sleep" | "random" | "now" | "createAbortTimeout" | "isFatalError"
>;

const DEFAULT_DEPENDENCIES: AbveRefetchDependencies = {
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

export async function refetchAbvePost(
  contract: AbveEndpointContract,
  itemId: number,
  dependencyOverrides: Partial<AbveRefetchDependencies> = {},
): Promise<AbveRefetchResult> {
  if (!Number.isSafeInteger(itemId) || itemId < 1) {
    return blocked("contract", "item_id_invalid", "The WordPress item id is invalid", []);
  }
  const dependencies = { ...DEFAULT_DEPENDENCIES, ...dependencyOverrides };
  const requestUrl = buildPostUrl(contract, itemId);
  const attempts: AbveRefetchAttempt[] = [];
  let lastDiagnostic = diagnostic(
    "transport",
    "connection_reset",
    "The HTTP request did not complete",
  );

  for (let attempt = 1; attempt <= MAX_ABVE_HTTP_ATTEMPTS; attempt += 1) {
    const timeout = dependencies.createAbortTimeout(contract.request_config.timeout_ms);
    let response: Response;
    try {
      response = await fetchFollowingRedirects(
        requestUrl,
        contract,
        dependencies.fetch,
        timeout.signal,
      );
    } catch (error) {
      timeout.cancel();
      if (dependencies.isFatalError?.(error) === true) {
        throw error;
      }
      if (error instanceof RedirectViolation) {
        attempts.push({
          attempt,
          outcome: error.code,
          status_code: error.statusCode,
        });
        return blocked(
          "access_policy",
          error.code,
          "The HTTP redirect violates the approved endpoint access policy",
          attempts,
        );
      }
      const timeoutFailure = timeout.signal.aborted || isTimeoutError(error);
      const code = timeoutFailure ? "read_timeout" : "connection_reset";
      lastDiagnostic = diagnostic(
        "transport",
        code,
        timeoutFailure
          ? "The HTTP attempt timed out"
          : "The HTTP connection ended before a response was available",
      );
      const record: MutableAttempt = { attempt, outcome: code };
      if (attempt < MAX_ABVE_HTTP_ATTEMPTS) {
        record.retry_delay_ms = retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      return failed(lastDiagnostic, attempts);
    }

    const contentType = response.headers.get("content-type");
    if (isRetryableStatus(response.status)) {
      await cancelBody(response);
      timeout.cancel();
      const retryAfter = parseRetryAfter(
        response.headers.get("retry-after"),
        dependencies.now(),
      );
      if (retryAfter !== null && retryAfter > MAX_ABVE_RETRY_AFTER_MS) {
        attempts.push({
          attempt,
          outcome: "retry_after_too_long",
          status_code: response.status,
        });
        return failed(
          diagnostic(
            "rate_limit",
            "retry_after_too_long",
            "Retry-After exceeds the approved 240 second maximum",
          ),
          attempts,
        );
      }
      const record: MutableAttempt = {
        attempt,
        outcome: `http_${response.status}`,
        status_code: response.status,
      };
      if (attempt < MAX_ABVE_HTTP_ATTEMPTS) {
        record.retry_delay_ms = retryAfter ?? retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      const kind = response.status === 429 ? "rate_limit" : "http";
      const code = response.status >= 500
        ? "http_5xx_exhausted"
        : `http_${response.status}_exhausted`;
      return failed(
        diagnostic(
          kind,
          code,
          `HTTP ${response.status} remained retryable after three attempts`,
        ),
        attempts,
      );
    }

    if (response.status < 200 || response.status >= 300) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({
        attempt,
        outcome: `http_${response.status}`,
        status_code: response.status,
      });
      const accessDenied = response.status === 401 || response.status === 403;
      return blocked(
        accessDenied ? "access_policy" : "http",
        accessDenied ? "authentication_required" : `http_${response.status}`,
        accessDenied
          ? `HTTP ${response.status} requires an access decision`
          : `HTTP ${response.status} is not retryable under the endpoint contract`,
        attempts,
      );
    }

    if (!isJsonContentType(contentType)) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({
        attempt,
        outcome: "content_type_unexpected",
        status_code: response.status,
      });
      return blocked(
        "format",
        "content_type_unexpected",
        "The response Content-Type is not JSON",
        attempts,
      );
    }

    const declaredLength = parseNonNegativeInteger(response.headers.get("content-length"));
    if (declaredLength !== null && declaredLength > contract.request_config.max_response_bytes) {
      await cancelBody(response);
      timeout.cancel();
      attempts.push({
        attempt,
        outcome: "response_too_large",
        status_code: response.status,
      });
      return blocked(
        "size_limit",
        "response_too_large",
        "The response exceeds the approved byte limit",
        attempts,
      );
    }

    let bytes: Uint8Array;
    try {
      bytes = await readBodyLimited(response, contract.request_config.max_response_bytes);
    } catch (error) {
      timeout.cancel();
      if (dependencies.isFatalError?.(error) === true) {
        throw error;
      }
      if (error instanceof ResponseTooLarge) {
        attempts.push({
          attempt,
          outcome: "response_too_large",
          status_code: response.status,
        });
        return blocked(
          "size_limit",
          "response_too_large",
          "The streamed response exceeded the approved byte limit",
          attempts,
        );
      }
      const timeoutFailure = timeout.signal.aborted || isTimeoutError(error);
      const code = timeoutFailure ? "read_timeout" : "connection_reset";
      lastDiagnostic = diagnostic(
        "transport",
        code,
        timeoutFailure
          ? "The response body timed out"
          : "The response body disconnected before completion",
      );
      const record: MutableAttempt = {
        attempt,
        outcome: code,
        status_code: response.status,
      };
      if (attempt < MAX_ABVE_HTTP_ATTEMPTS) {
        record.retry_delay_ms = retryDelay(attempt, dependencies.random);
        attempts.push(record);
        await dependencies.sleep(record.retry_delay_ms);
        continue;
      }
      attempts.push(record);
      return failed(lastDiagnostic, attempts);
    }
    timeout.cancel();
    const responseBodySha256 = sha256Bytes(bytes);

    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(bytes).toString("utf8"));
    } catch {
      attempts.push({ attempt, outcome: "json_invalid", status_code: response.status });
      return blocked(
        "format",
        "json_invalid",
        "The response body is not valid JSON",
        attempts,
      );
    }
    const validation = validateAndNormalizeAbvePost(parsed);
    if (!validation.ok) {
      attempts.push({ attempt, outcome: validation.code, status_code: response.status });
      return blocked("contract", validation.code, validation.message, attempts);
    }

    attempts.push({ attempt, outcome: "success", status_code: response.status });
    return {
      ok: true,
      post: validation.post,
      response: {
        request_url: requestUrl,
        attempt_count: attempt,
        status_code: response.status,
        content_type: contentType as string,
        byte_length: bytes.byteLength,
        response_body_sha256: responseBodySha256,
      },
      attempts,
    };
  }

  return failed(lastDiagnostic, attempts);
}

export function buildAbvePostUrl(contract: AbveEndpointContract, itemId: number): string {
  if (!Number.isSafeInteger(itemId) || itemId < 1) {
    throw new Error("item_id_invalid");
  }
  return buildPostUrl(contract, itemId);
}

function buildPostUrl(contract: AbveEndpointContract, itemId: number): string {
  const url = new URL(`${contract.endpoint_url}/${itemId}`);
  url.searchParams.set("context", contract.request_config.query_params.context);
  url.searchParams.set("_fields", contract.request_config.query_params._fields);
  return canonicalizeUrl(url.toString());
}

function blocked(
  kind: CollectorDiagnostic["error_kind"],
  code: string,
  message: string,
  attempts: readonly AbveRefetchAttempt[],
): AbveRefetchFailure {
  return {
    ok: false,
    terminal_status: "blocked",
    diagnostic: diagnostic(kind, code, message),
    attempts,
  };
}

function failed(
  value: CollectorDiagnostic,
  attempts: readonly AbveRefetchAttempt[],
): AbveRefetchFailure {
  return { ok: false, terminal_status: "failed", diagnostic: value, attempts };
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

interface MutableAttempt {
  attempt: number;
  outcome: string;
  status_code?: number;
  retry_delay_ms?: number;
}
