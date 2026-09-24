import { canonicalJson } from "../collector/canonical-json.js";
import type { PreparedAbveHandoff } from "./handoff.js";
import {
  createExtractionPackage,
  createExtractionPayload,
  type AbveExtractionPackageV1,
  type ContentItemCandidate,
  type ExtractionPayload,
  type ObservationCandidateDraft,
} from "./package.js";

export const ABVE_PILOT_ITEM_ID = 19617 as const;
export const ABVE_PILOT_CANONICAL_URL =
  "https://abve.org.br/eletrificados-conquistam-21-de-participacao-de-mercado-em-julho-e-devem-passar-de-450-mil-este-ano" as const;

const SOURCE_CLAIM =
  "Os BEV lideraram, com 25.782 unidades [...] os emplacamentos de veículos 100% elétricos passaram de 7.010 para 25.782 unidades.";
const NORMALIZED_CLAIM =
  "Brasil: 25.782 emplacamentos de veículos leves BEV em julho de 2026.";
const PRIMARY_CLAIM_ANCHOR = "Os BEV lideraram, com 25.782 unidades";
const SECONDARY_CLAIM_ANCHOR =
  "os emplacamentos de veículos 100% elétricos passaram de 7.010 para 25.782 unidades";

const PILOT_OBSERVATION: ObservationCandidateDraft = {
  observation_type: "quantity",
  source_claim: SOURCE_CLAIM,
  normalized_claim: NORMALIZED_CLAIM,
  normalization_status: "normalized",
  normalized_value: 25_782,
  normalized_unit: "vehicle_registration",
  measured_period: {
    start: "2026-07-01",
    end: "2026-07-31",
    granularity: "month",
  },
  geography: "Brasil",
  extraction_method: "automated",
  source_term: "emplacamentos de veículos 100% elétricos",
  locator: "content.rendered: parágrafo iniciado por Os BEV lideraram",
  limitations: [
    "Não inclui participação de mercado, crescimento, acumulado ou projeções.",
    "Normalização remove somente o separador brasileiro de milhar.",
  ],
};

export class AbvePilotExtractionError extends Error {
  constructor(readonly code: "pilot_item_mismatch" | "pilot_content_unavailable") {
    super(code);
  }
}

export interface CreateAbvePilotPackageInput {
  readonly handoff: PreparedAbveHandoff;
  readonly extractor_version: string;
  readonly started_at: string;
  readonly duration_ms: number;
}

export function createAbvePilotPayload(handoff: PreparedAbveHandoff): ExtractionPayload {
  validatePilotHandoff(handoff);
  const paragraphs = htmlParagraphs(handoff.post.normalized.content.rendered);
  if (handoff.post.normalized.content.protected || paragraphs.length === 0) {
    throw new AbvePilotExtractionError("pilot_content_unavailable");
  }

  const observation = supportsPilotObservation(paragraphs) ? PILOT_OBSERVATION : null;
  const excerpt = observation === null ? minimumExcerpt(paragraphs[0] as string) : SOURCE_CLAIM;
  const contentCandidate: ContentItemCandidate = {
    canonical_url: handoff.post.canonicalUrl,
    title: htmlToText(handoff.post.normalized.title.rendered),
    published_local: handoff.post.normalized.date,
    published_at_utc: `${handoff.post.publicationDateGmt}Z`,
    language_code: null,
    section_name: null,
    publication_nature: "unknown",
    content_fingerprint: handoff.post.fingerprint,
    retention_class: "minimum_excerpt",
    evidentiary_excerpt: excerpt,
    raw_capture_reference: handoff.post.canonicalUrl,
  };

  return createExtractionPayload({
    input: handoff.extraction_input,
    content_item_candidate: contentCandidate,
    observation_candidates: observation === null ? [] : [observation],
  });
}

export function createAbvePilotPackage(
  input: CreateAbvePilotPackageInput,
): AbveExtractionPackageV1 {
  return createExtractionPackage({
    run_key: input.handoff.run_key,
    extractor_version: input.extractor_version,
    started_at: input.started_at,
    duration_ms: input.duration_ms,
    payload: createAbvePilotPayload(input.handoff),
  });
}

function validatePilotHandoff(handoff: PreparedAbveHandoff): void {
  if (
    canonicalJson(handoff.post.identity) !== canonicalJson({ id: ABVE_PILOT_ITEM_ID }) ||
    handoff.extraction_input.native_identity.id !== ABVE_PILOT_ITEM_ID ||
    handoff.post.canonicalUrl !== ABVE_PILOT_CANONICAL_URL ||
    handoff.extraction_input.canonical_url !== ABVE_PILOT_CANONICAL_URL ||
    handoff.post.fingerprint !== handoff.extraction_input.expected_content_fingerprint ||
    handoff.post.fingerprint !== handoff.extraction_input.observed_content_fingerprint
  ) {
    throw new AbvePilotExtractionError("pilot_item_mismatch");
  }
}

function supportsPilotObservation(paragraphs: readonly string[]): boolean {
  const text = paragraphs.join("\n");
  return text.includes(PRIMARY_CLAIM_ANCHOR) &&
    text.includes(SECONDARY_CLAIM_ANCHOR) &&
    /\bveículos leves\b/iu.test(text) &&
    /\bjulho de 2026\b/iu.test(text) &&
    /\b(?:Brasil|brasileir[oa]s?)\b/iu.test(text);
}

function htmlParagraphs(html: string): readonly string[] {
  const paragraphs: string[] = [];
  const withoutExecutableContent = html.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/giu,
    " ",
  );
  for (const match of withoutExecutableContent.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/giu)) {
    const text = htmlToText(match[1] ?? "");
    if (text.length > 0) {
      paragraphs.push(text);
    }
  }
  if (paragraphs.length === 0) {
    const text = htmlToText(withoutExecutableContent);
    if (text.length > 0) {
      paragraphs.push(text);
    }
  }
  return paragraphs;
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/gu, " "))
    .replace(/\s+/gu, " ")
    .trim()
    .normalize("NFC");
}

function minimumExcerpt(paragraph: string): string {
  const sentence = paragraph.match(/^.*?[.!?](?:\s|$)/u)?.[0]?.trim() ?? paragraph;
  const codePoints = [...sentence];
  return codePoints.length <= 320 ? sentence : `${codePoints.slice(0, 319).join("")}…`;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|amp|apos|gt|lt|nbsp|quot);/giu, (entity, key: string) => {
    const normalized = key.toLowerCase();
    if (normalized === "amp") return "&";
    if (normalized === "apos") return "'";
    if (normalized === "gt") return ">";
    if (normalized === "lt") return "<";
    if (normalized === "nbsp") return " ";
    if (normalized === "quot") return '"';
    const radix = normalized.startsWith("#x") ? 16 : 10;
    const digits = normalized.slice(radix === 16 ? 2 : 1);
    const codePoint = Number.parseInt(digits, radix);
    return Number.isSafeInteger(codePoint) && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity;
  });
}
