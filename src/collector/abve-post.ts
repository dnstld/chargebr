import { canonicalizeUrl } from "./canonical-url.js";
import { sha256CanonicalJson } from "./hash.js";
import type { CanonicalJsonValue } from "./canonical-json.js";

const WORDPRESS_LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?$/u;

export interface NormalizedAbvePost {
  readonly date: string;
  readonly modified: string;
  readonly slug: string;
  readonly canonical_url: string;
  readonly title: { readonly rendered: string };
  readonly excerpt: { readonly rendered: string; readonly protected: boolean };
  readonly content: { readonly rendered: string; readonly protected: boolean };
}

export interface ValidatedAbvePost {
  readonly identity: CanonicalJsonValue;
  readonly canonicalUrl: string;
  readonly normalized: NormalizedAbvePost;
  readonly fingerprint: string;
  readonly publicationInstant: number;
}

export type AbvePostValidation =
  | { readonly ok: true; readonly post: ValidatedAbvePost }
  | { readonly ok: false; readonly code: "schema_mismatch"; readonly message: string };

export function validateAndNormalizeAbvePost(value: unknown): AbvePostValidation {
  if (!isRecord(value)) {
    return invalid("item must be an object");
  }

  const date = stringField(value, "date");
  const dateGmt = stringField(value, "date_gmt");
  const modified = stringField(value, "modified");
  const slug = stringField(value, "slug");
  const link = stringField(value, "link");
  const title = renderedField(value, "title", false);
  const excerpt = renderedField(value, "excerpt", true);
  const content = renderedField(value, "content", true);
  if (
    date === null || dateGmt === null || modified === null || slug === null || link === null || title === null ||
    excerpt === null || content === null
  ) {
    return invalid("item is missing a projected WordPress field or has an invalid field type");
  }

  const publicationInstant = wordpressGmtDateToInstant(dateGmt);
  if (!WORDPRESS_LOCAL_DATETIME.test(date) || publicationInstant === null) {
    return invalid("item date or date_gmt is not a supported WordPress timestamp");
  }

  let canonicalUrl: string;
  try {
    canonicalUrl = canonicalizeUrl(link);
  } catch {
    return invalid("item link is not a valid canonical HTTPS URL");
  }

  const id = value.id;
  let identity: CanonicalJsonValue;
  if (Number.isInteger(id) && (id as number) > 0) {
    identity = { id: id as number };
  } else {
    identity = { link: canonicalUrl };
  }

  const normalized: NormalizedAbvePost = {
    date: normalizeText(date),
    modified: normalizeText(modified),
    slug: normalizeText(slug),
    canonical_url: canonicalUrl,
    title: { rendered: normalizeText(title.rendered) },
    excerpt: {
      rendered: normalizeText(excerpt.rendered),
      protected: excerpt.protected,
    },
    content: {
      rendered: normalizeText(content.rendered),
      protected: content.protected,
    },
  };

  return {
    ok: true,
    post: {
      identity,
      canonicalUrl,
      normalized,
      fingerprint: sha256CanonicalJson(normalized),
      publicationInstant,
    },
  };
}

export function normalizeText(value: string): string {
  return value.replace(/\r\n?/gu, "\n").normalize("NFC");
}

function invalid(message: string): AbvePostValidation {
  return { ok: false, code: "schema_mismatch", message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: Record<string, unknown>, key: string): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function wordpressGmtDateToInstant(value: string): number | null {
  if (!WORDPRESS_LOCAL_DATETIME.test(value)) {
    return null;
  }
  const parsed = Date.parse(`${value}Z`);
  return Number.isNaN(parsed) ? null : parsed;
}

function renderedField(
  value: Record<string, unknown>,
  key: string,
  requiresProtected: boolean,
): { rendered: string; protected: boolean } | null {
  const nested = value[key];
  if (!isRecord(nested) || typeof nested.rendered !== "string") {
    return null;
  }
  if (requiresProtected && typeof nested.protected !== "boolean") {
    return null;
  }
  return {
    rendered: nested.rendered,
    protected: requiresProtected ? nested.protected as boolean : false,
  };
}
