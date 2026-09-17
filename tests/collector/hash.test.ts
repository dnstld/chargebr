import assert from "node:assert/strict";
import test from "node:test";

import { sha256Bytes, sha256CanonicalJson, sha256Utf8 } from "../../src/collector/hash.js";

test("SHA-256 helpers match known vectors", () => {
  assert.equal(
    sha256Bytes(Buffer.alloc(0)),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
  assert.equal(
    sha256Utf8("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("canonical JSON hashing is order independent and lowercase hex", () => {
  const left = sha256CanonicalJson({ b: 2, a: 1 });
  const right = sha256CanonicalJson({ a: 1, b: 2 });
  assert.equal(left, right);
  assert.match(left, /^[0-9a-f]{64}$/u);
});
