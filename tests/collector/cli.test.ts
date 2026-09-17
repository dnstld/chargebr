import assert from "node:assert/strict";
import test from "node:test";

import { executeCli } from "../../src/collector/cli.js";

test("help writes stdout and succeeds", () => {
  for (const flag of ["--help", "-h"]) {
    const result = executeCli([flag]);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout ?? "", /^Usage:/u);
    assert.equal(result.stderr, undefined);
  }
});

test("missing command is invalid usage on stderr", () => {
  const result = executeCli([]);
  assert.equal(result.exitCode, 64);
  assert.match(result.stderr ?? "", /^Usage:/u);
  assert.equal(result.stdout, undefined);
});

test("unknown commands, flags, and extra arguments are invalid", () => {
  for (const args of [["unknown"], ["--unknown"], ["abve", "extra"]]) {
    const result = executeCli(args);
    assert.equal(result.exitCode, 64);
    assert.ok(result.stderr);
    assert.equal(result.stdout, undefined);
  }
});

test("aneel is known but unavailable", () => {
  const result = executeCli(["aneel"]);
  assert.equal(result.exitCode, 69);
  assert.match(result.stderr ?? "", /source_unavailable/u);
});

test("abve fails closed with the temporary stage B placeholder", () => {
  const result = executeCli(["abve"]);
  assert.equal(result.exitCode, 70);
  assert.match(result.stderr ?? "", /runtime_not_integrated/u);
});
