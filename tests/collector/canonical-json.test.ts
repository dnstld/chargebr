import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { canonicalJson } from "../../src/collector/canonical-json.js";

test("matches the literal canonical JSON v1 fixture", async () => {
  const fixture = JSON.parse(
    await readFile(new URL("./fixtures/canonical-json-v1.json", import.meta.url), "utf8"),
  ) as { input: unknown; expected: string };
  assert.equal(canonicalJson(fixture.input), fixture.expected);
});

test("object property order does not change canonical bytes", () => {
  assert.equal(canonicalJson({ b: 2, a: 1 }), canonicalJson({ a: 1, b: 2 }));
  assert.equal(canonicalJson({ z: { b: 2, a: 1 } }), '{"z":{"a":1,"b":2}}');
});

test("arrays preserve order", () => {
  assert.equal(canonicalJson([3, 2, 1]), "[3,2,1]");
  assert.notEqual(canonicalJson([3, 2, 1]), canonicalJson([1, 2, 3]));
});

test("unicode, escaped strings, and JSON primitives remain valid", () => {
  const result = canonicalJson({ unicode: "café 🚗", escaped: "a\n\"b", values: [null, true, false, 1.5] });
  assert.deepEqual(JSON.parse(result), {
    escaped: "a\n\"b",
    unicode: "café 🚗",
    values: [null, true, false, 1.5],
  });
});

test("invalid values and non-plain objects fail", () => {
  const invalidValues: unknown[] = [
    undefined,
    () => undefined,
    Symbol("value"),
    1n,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    new Date(),
    new Map(),
  ];
  for (const value of invalidValues) {
    assert.throws(() => canonicalJson(value), TypeError);
  }
  assert.throws(() => canonicalJson([, 1]), /sparse arrays/u);
  assert.throws(() => canonicalJson({ [Symbol("key")]: "value" }), /symbol keys/u);
});

test("cyclic references fail while repeated non-cyclic references work", () => {
  const cyclic: { self?: unknown } = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalJson(cyclic), /cyclic references/u);

  const shared = { id: 1 };
  assert.equal(canonicalJson({ left: shared, right: shared }), '{"left":{"id":1},"right":{"id":1}}');
});
