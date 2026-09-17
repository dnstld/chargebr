import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeMessage } from "../../src/collector/sanitize.js";

test("normal messages are preserved", () => {
  assert.equal(sanitizeMessage("collector phase complete"), "collector phase complete");
});

test("dangerous control characters are removed", () => {
  assert.equal(sanitizeMessage("line\nnext\u0000\u001b\u007fend"), "linenextend");
});

test("messages are truncated to 2000 Unicode characters", () => {
  const value = sanitizeMessage(`${"a".repeat(1_999)}🚗tail`);
  assert.equal(Array.from(value).length, 2_000);
  assert.ok(value.endsWith("🚗"));
});

test("sanitization rejects non-string values without serializing them", () => {
  assert.throws(() => sanitizeMessage({ secret: "value" } as unknown as string), /strings only/u);
});
