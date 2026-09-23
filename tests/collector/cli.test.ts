import assert from "node:assert/strict";
import test from "node:test";

import { executeCli } from "../../src/collector/cli.js";

test("help writes stdout and succeeds", async () => {
  for (const flag of ["--help", "-h"]) {
    const result = await executeCli([flag]);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout ?? "", /^Usage:/u);
    assert.equal(result.stderr, undefined);
  }
});

test("missing command is invalid usage on stderr", async () => {
  const result = await executeCli([]);
  assert.equal(result.exitCode, 64);
  assert.match(result.stderr ?? "", /^Usage:/u);
  assert.equal(result.stdout, undefined);
});

test("unknown commands, flags, and extra arguments are invalid", async () => {
  for (const args of [["unknown"], ["--unknown"], ["abve", "extra"]]) {
    const result = await executeCli(args);
    assert.equal(result.exitCode, 64);
    assert.ok(result.stderr);
    assert.equal(result.stdout, undefined);
  }
});

test("aneel is known but unavailable", async () => {
  const result = await executeCli(["aneel"]);
  assert.equal(result.exitCode, 69);
  assert.match(result.stderr ?? "", /source_unavailable/u);
});

test("abve fails closed before connecting when required environment is missing", async () => {
  const previousUrl = process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
  const previousInitiatedBy = process.env.CHARGEBR_COLLECTOR_INITIATED_BY;
  delete process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
  delete process.env.CHARGEBR_COLLECTOR_INITIATED_BY;
  const result = await executeCli(["abve"]);
  if (previousUrl !== undefined) process.env.CHARGEBR_COLLECTOR_DATABASE_URL = previousUrl;
  if (previousInitiatedBy !== undefined) {
    process.env.CHARGEBR_COLLECTOR_INITIATED_BY = previousInitiatedBy;
  }
  assert.equal(result.exitCode, 70);
  assert.match(result.stderr ?? "", /missing_database_url/u);
});
