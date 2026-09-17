import assert from "node:assert/strict";
import test from "node:test";

import { resolveCollectorVersion } from "../../src/collector/collector-version.js";

test("collector version accepts an injected full lowercase Git SHA", () => {
  const sha = "0123456789abcdef0123456789abcdef01234567";
  assert.equal(resolveCollectorVersion(() => `${sha}\n`), sha);
});

test("collector version fails closed for invalid values", () => {
  for (const value of ["", "abc", "A".repeat(40), "0".repeat(39), "0".repeat(41)]) {
    assert.throws(() => resolveCollectorVersion(() => value), /valid collector Git commit SHA/u);
  }
  assert.throws(
    () => resolveCollectorVersion(() => {
      throw new Error("git unavailable");
    }),
    /git unavailable/u,
  );
});
