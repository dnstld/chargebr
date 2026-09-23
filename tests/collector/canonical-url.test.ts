import assert from "node:assert/strict";
import test from "node:test";

import { canonicalizeUrl } from "../../src/collector/canonical-url.js";

test("canonical-url-v1 normalizes scheme, host, port, fragment, and path", () => {
  assert.equal(
    canonicalizeUrl("HTTPS://Example.COM:443/News/#section"),
    "https://example.com/News",
  );
  assert.equal(canonicalizeUrl("https://example.com"), "https://example.com/");
});

test("canonical-url-v1 removes only tracking parameters and sorts all others", () => {
  assert.equal(
    canonicalizeUrl("https://example.com/P?a=2&utm_source=x&z=9&a=1&fbclid=f&gclid=g&unknown=yes"),
    "https://example.com/P?a=1&a=2&unknown=yes&z=9",
  );
});

test("canonical-url-v1 preserves repeated parameters, path case, and existing encoding", () => {
  assert.equal(
    canonicalizeUrl("https://EXAMPLE.com/Case?q=%7E&q=a%20b"),
    "https://example.com/Case?q=a%20b&q=%7E",
  );
});

test("canonical-url-v1 rejects non-HTTPS and userinfo", () => {
  assert.throws(() => canonicalizeUrl("http://example.com/post"), /requires_https/u);
  assert.throws(() => canonicalizeUrl("https://user:pass@example.com/post"), /userinfo/u);
});
