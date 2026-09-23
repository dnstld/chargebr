import assert from "node:assert/strict";
import test from "node:test";

import { validateAndNormalizeAbvePost } from "../../src/collector/abve-post.js";

function post(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 10,
    date: "2026-01-02T10:00:00",
    date_gmt: "2026-01-02T13:00:00",
    modified: "2026-01-02T11:00:00",
    slug: "notícia",
    link: "https://abve.org.br/Noticia/?utm_source=x&b=2&a=1",
    title: { rendered: "Cafe\u0301\r\nTítulo" },
    excerpt: { rendered: "<p>A\rB</p>", protected: false },
    content: { rendered: "<script>x()</script>\r\n<p>C</p>", protected: true },
    ...overrides,
  };
}

test("ABVE normalization applies NFC/newlines and preserves HTML", () => {
  const result = validateAndNormalizeAbvePost(post());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.post.normalized.title.rendered, "Café\nTítulo");
  assert.equal(result.post.normalized.excerpt.rendered, "<p>A\nB</p>");
  assert.equal(result.post.normalized.content.rendered, "<script>x()</script>\n<p>C</p>");
  assert.equal(result.post.canonicalUrl, "https://abve.org.br/Noticia?a=1&b=2");
  assert.equal(result.post.publicationInstant, Date.parse("2026-01-02T13:00:00Z"));
});

test("ABVE identity uses id first and canonical link as its only fallback", () => {
  const primary = validateAndNormalizeAbvePost(post());
  const fallback = validateAndNormalizeAbvePost(post({ id: null }));
  assert.equal(primary.ok, true);
  assert.equal(fallback.ok, true);
  if (!primary.ok || !fallback.ok) return;
  assert.deepEqual(primary.post.identity, { id: 10 });
  assert.deepEqual(fallback.post.identity, { link: "https://abve.org.br/Noticia?a=1&b=2" });
});

test("ABVE fingerprint excludes id and date_gmt and is stable after normalization", () => {
  const first = validateAndNormalizeAbvePost(post({ id: 10 }));
  const second = validateAndNormalizeAbvePost(post({
    id: 11,
    date_gmt: "2026-01-02T14:00:00",
    title: { rendered: "Café\nTítulo" },
  }));
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(first.post.fingerprint, second.post.fingerprint);
  assert.match(first.post.fingerprint, /^[0-9a-f]{64}$/u);
});

test("ABVE validator rejects malformed projected fields without retaining values", () => {
  const result = validateAndNormalizeAbvePost(post({ content: { rendered: "missing protected" } }));
  assert.deepEqual(result, {
    ok: false,
    code: "schema_mismatch",
    message: "item is missing a projected WordPress field or has an invalid field type",
  });
});

test("ABVE validator requires a valid offsetless date_gmt value", () => {
  for (const dateGmt of [undefined, "2026-01-02T13:00:00Z", "not-a-date"]) {
    const candidate = post();
    if (dateGmt === undefined) {
      delete candidate.date_gmt;
    } else {
      candidate.date_gmt = dateGmt;
    }
    const result = validateAndNormalizeAbvePost(candidate);
    assert.equal(result.ok, false);
    if (result.ok) continue;
    assert.equal(result.code, "schema_mismatch");
  }
});
