import assert from "node:assert/strict";
import test from "node:test";

import { resolveExtractorVersion } from "../../src/extractor/extractor-version.js";

test("extractor version accepts only a full lowercase Git SHA", () => {
  const version = "0123456789abcdef0123456789abcdef01234567";
  assert.equal(resolveExtractorVersion(() => `${version}\n`), version);
  for (const invalid of ["abc", "A".repeat(40), "g".repeat(40), "a".repeat(39)]) {
    assert.throws(() => resolveExtractorVersion(() => invalid), /extractor Git commit SHA/u);
  }
});
