import { parse, type DefaultTreeAdapterTypes } from "parse5";

import { canonicalizeUrl } from "./canonical-url.js";
import { sha256CanonicalJson } from "./hash.js";

type Document = DefaultTreeAdapterTypes.Document;
type Element = DefaultTreeAdapterTypes.Element;
type Node = DefaultTreeAdapterTypes.Node;

const DATE = /\b(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(20\d{2})\b/u;
const CONTENT_HINT = /(conteudo|content|noticia|materia|detalhe|texto)/iu;
const SKIPPED_TEXT_ELEMENTS = new Set(["script", "style", "noscript", "nav", "header", "footer", "form"]);

export interface AneelIndexItem {
  readonly idNoticia: number;
  readonly canonicalUrl: string;
  readonly publishedDate: string;
  readonly title: string;
}

export interface AneelIndexPage {
  readonly items: readonly AneelIndexItem[];
  readonly nextPageUrl: string | null;
}

export interface NormalizedAneelDetail {
  readonly idNoticia: number;
  readonly canonical_url: string;
  readonly published_date: string;
  readonly title: string;
  readonly editorial_text: string;
  readonly document_references: readonly string[];
}

export interface ValidatedAneelDetail {
  readonly identity: { readonly idNoticia: number };
  readonly canonicalUrl: string;
  readonly normalized: NormalizedAneelDetail;
  readonly fingerprint: string;
}

export type AneelHtmlResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly code: "schema_mismatch"; readonly message: string };

export function parseAneelIndexPage(
  html: string,
  pageUrl: string,
  expectedPage: number,
  observedPageSize: number,
  nextLinkText: string,
  allowedPaginationPath: string,
  detailPath: string,
): AneelHtmlResult<AneelIndexPage> {
  const document = parse(html);
  const anchors = findElements(document, "a");
  const items: AneelIndexItem[] = [];

  for (const anchor of anchors) {
    const href = attribute(anchor, "href");
    if (href === null) continue;
    const detail = parseScopedUrl(href, pageUrl, detailPath, ["idAreaNoticia", "idNoticia"]);
    if (detail === null) continue;
    const idText = detail.searchParams.get("idNoticia");
    if (idText === null || !/^\d+$/u.test(idText)) continue;
    const idNoticia = Number(idText);
    if (!Number.isSafeInteger(idNoticia) || idNoticia <= 0) continue;

    const title = normalizeText(textContent(anchor));
    const container = nearestDatedItemContainer(anchor, pageUrl, detailPath);
    if (title === "" || container === null) {
      return invalid("an ANEEL detail link is missing its title or publication date");
    }
    const dateMatch = DATE.exec(normalizeText(textContent(container)));
    if (dateMatch === null) {
      return invalid("an ANEEL index item has no supported publication date");
    }
    const publishedDate = toIsoDate(dateMatch[1] ?? "", dateMatch[2] ?? "", dateMatch[3] ?? "");
    if (publishedDate === null) {
      return invalid("an ANEEL index item has an invalid publication date");
    }
    items.push({
      idNoticia,
      canonicalUrl: canonicalizeUrl(detail.toString()),
      publishedDate,
      title,
    });
  }

  if (items.length === 0) {
    return invalid("the ANEEL index contains no valid meeting entries");
  }

  let nextPageUrl: string | null = null;
  for (const anchor of anchors) {
    if (normalizeText(textContent(anchor)) !== nextLinkText) continue;
    if (nextPageUrl !== null) {
      return invalid("the ANEEL index contains more than one next-page link");
    }
    const href = attribute(anchor, "href");
    const next = href === null
      ? null
      : parseScopedUrl(href, pageUrl, allowedPaginationPath, ["idAreaNoticia", "page"]);
    const pageValue = next?.searchParams.get("page") ?? null;
    if (next === null || pageValue === null || !/^\d+$/u.test(pageValue)) {
      return invalid("the ANEEL next-page link violates the approved pagination contract");
    }
    if (Number(pageValue) !== expectedPage + 1) {
      return invalid("the ANEEL next-page link does not advance exactly one page");
    }
    nextPageUrl = canonicalizeUrl(next.toString());
  }

  if (nextPageUrl !== null && items.length !== observedPageSize) {
    return invalid("a non-final ANEEL index page does not contain the observed page size");
  }
  if (items.length > observedPageSize) {
    return invalid("an ANEEL index page exceeds the approved page size");
  }

  return { ok: true, value: { items, nextPageUrl } };
}

export function validateAndNormalizeAneelDetail(
  html: string,
  indexItem: AneelIndexItem,
): AneelHtmlResult<ValidatedAneelDetail> {
  const document = parse(html);
  const normalizedTitle = normalizeText(indexItem.title);
  const candidates = findElements(document).filter((element) => {
    const marker = `${attribute(element, "id") ?? ""} ${attribute(element, "class") ?? ""}`;
    if (!CONTENT_HINT.test(marker)) return false;
    const text = visibleText(element);
    return text.length > normalizedTitle.length && text.includes(normalizedTitle);
  });

  candidates.sort((left, right) => visibleText(left).length - visibleText(right).length);
  const content = candidates[0];
  if (content === undefined) {
    return invalid("the ANEEL detail page has no approved editorial content region");
  }

  const editorialText = visibleText(content);
  if (editorialText === "" || !editorialText.includes(normalizedTitle)) {
    return invalid("the ANEEL detail page does not repeat the indexed title");
  }

  const references = new Set<string>();
  for (const anchor of findElements(content, "a")) {
    const href = attribute(anchor, "href");
    if (href === null) continue;
    let url: URL;
    try {
      url = new URL(href, indexItem.canonicalUrl);
    } catch {
      continue;
    }
    if (
      url.protocol !== "https:" || url.username !== "" || url.password !== "" ||
      !(url.hostname === "aneel.gov.br" || url.hostname.endsWith(".aneel.gov.br")) ||
      !url.pathname.toLowerCase().endsWith(".pdf")
    ) {
      continue;
    }
    references.add(canonicalizeUrl(url.toString()));
  }

  const normalized: NormalizedAneelDetail = {
    idNoticia: indexItem.idNoticia,
    canonical_url: indexItem.canonicalUrl,
    published_date: indexItem.publishedDate,
    title: normalizedTitle,
    editorial_text: editorialText,
    document_references: [...references].sort(compare),
  };
  return {
    ok: true,
    value: {
      identity: { idNoticia: indexItem.idNoticia },
      canonicalUrl: indexItem.canonicalUrl,
      normalized,
      fingerprint: sha256CanonicalJson(normalized),
    },
  };
}

function nearestDatedItemContainer(
  anchor: Element,
  baseUrl: string,
  detailPath: string,
): Element | null {
  let current: Node | null = anchor.parentNode;
  for (let depth = 0; current !== null && depth < 8; depth += 1) {
    if (isElement(current)) {
      const text = normalizeText(textContent(current));
      const detailLinks = findElements(current, "a").filter((candidate) => {
        const href = attribute(candidate, "href");
        return href !== null && parseScopedUrl(
          href,
          baseUrl,
          detailPath,
          ["idAreaNoticia", "idNoticia"],
        ) !== null;
      });
      if (DATE.test(text) && detailLinks.length === 1) return current;
    }
    current = "parentNode" in current ? current.parentNode : null;
  }
  return null;
}

function parseScopedUrl(
  value: string,
  baseUrl: string,
  expectedPath: string,
  allowedParameters: readonly string[],
): URL | null {
  let url: URL;
  try {
    url = new URL(value, baseUrl);
  } catch {
    return null;
  }
  const approved = new URL(baseUrl);
  if (
    url.protocol !== "https:" || url.username !== "" || url.password !== "" ||
    url.hostname !== approved.hostname || url.pathname !== expectedPath ||
    url.searchParams.get("idAreaNoticia") !== "425"
  ) {
    return null;
  }
  const allowed = new Set(allowedParameters);
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) return null;
  return url;
}

function findElements(node: Node, tagName?: string): Element[] {
  const found: Element[] = [];
  const visit = (current: Node): void => {
    if (isElement(current) && (tagName === undefined || current.tagName === tagName)) {
      found.push(current);
    }
    if ("childNodes" in current) {
      for (const child of current.childNodes) visit(child);
    }
    if (isElement(current) && current.tagName === "template") {
      for (const child of current.content.childNodes) visit(child);
    }
  };
  visit(node);
  return found;
}

function isElement(node: Node): node is Element {
  return "tagName" in node;
}

function attribute(element: Element, name: string): string | null {
  return element.attrs.find((attribute) => attribute.name === name)?.value ?? null;
}

function textContent(node: Node): string {
  if (node.nodeName === "#text") return node.value;
  if (!("childNodes" in node)) return "";
  return node.childNodes.map(textContent).join(" ");
}

function visibleText(node: Node): string {
  if (node.nodeName === "#text") return node.value;
  if (isElement(node) && SKIPPED_TEXT_ELEMENTS.has(node.tagName)) return "";
  if (!("childNodes" in node)) return "";
  return normalizeText(node.childNodes.map(visibleText).join(" "));
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, " ").trim().normalize("NFC");
}

function toIsoDate(day: string, month: string, year: string): string | null {
  const value = `${year}-${month}-${day}`;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : value;
}

function invalid<T>(message: string): AneelHtmlResult<T> {
  return { ok: false, code: "schema_mismatch", message };
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
