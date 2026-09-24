const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const RETRY_BASE_MS = [1_000, 2_000] as const;

export const MAX_ABVE_HTTP_ATTEMPTS = 3;
export const MAX_ABVE_REDIRECTS = 3;
export const MAX_ABVE_RETRY_AFTER_MS = 240_000;

export interface AbveHttpContract {
  readonly endpoint_url: string;
  readonly request_config: {
    readonly headers: Readonly<Record<string, string>>;
  };
}

export type AbveFetch = (input: string, init: RequestInit) => Promise<Response>;

export class RedirectViolation extends Error {
  readonly code: "redirect_host_not_allowed" | "redirect_limit_exceeded";
  readonly statusCode: number;

  constructor(code: RedirectViolation["code"], statusCode: number) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ResponseTooLarge extends Error {}

export async function fetchFollowingRedirects(
  initialUrl: string,
  contract: AbveHttpContract,
  fetchFunction: AbveFetch,
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
    if (redirects >= MAX_ABVE_REDIRECTS) {
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

export async function readBodyLimited(
  response: Response,
  maximumBytes: number,
): Promise<Uint8Array> {
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

export async function cancelBody(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined);
}

export function parseNonNegativeInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/u.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function isJsonContentType(value: string | null): boolean {
  return value !== null && value.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function parseRetryAfter(value: string | null, now: number): number | null {
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

export function retryDelay(attempt: number, random: () => number): number {
  const base = RETRY_BASE_MS[attempt - 1] ?? 2_000;
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample > 1) {
    throw new Error("random must return a value between zero and one");
  }
  return Math.floor(sample * base);
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}
