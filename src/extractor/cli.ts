import { pathToFileURL } from "node:url";

import {
  runAbveExtraction,
  type AbveExtractionRunnerDependencies,
  type ExtractionExecutionResult,
} from "./runner.js";

const USAGE = "Usage: pnpm extract abve --run-key <uuid> --item-id <wordpress-id>";

export async function executeExtractionCli(
  args: readonly string[],
  runnerDependencies: Partial<AbveExtractionRunnerDependencies> = {},
): Promise<ExtractionExecutionResult> {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    return { exitCode: 0, stdout: `${USAGE}\n` };
  }
  if (
    args.length !== 5 ||
    args[0] !== "abve" ||
    args[1] !== "--run-key" ||
    args[3] !== "--item-id"
  ) {
    return { exitCode: 64, stderr: `invalid_usage\n${USAGE}\n` };
  }

  const runKey = args[2] as string;
  const rawItemId = args[4] as string;
  if (!/^\d+$/u.test(rawItemId)) {
    return { exitCode: 64, stderr: `invalid_usage\n${USAGE}\n` };
  }
  const itemId = Number(rawItemId);
  return runAbveExtraction(
    readExtractorEnvironment(),
    { run_key: runKey, item_id: itemId },
    runnerDependencies,
  );
}

function readExtractorEnvironment(): { readonly CHARGEBR_COLLECTOR_DATABASE_URL?: string } {
  return process.env.CHARGEBR_COLLECTOR_DATABASE_URL === undefined
    ? {}
    : { CHARGEBR_COLLECTOR_DATABASE_URL: process.env.CHARGEBR_COLLECTOR_DATABASE_URL };
}

function writeCliResult(result: ExtractionExecutionResult): void {
  if (result.stdout !== undefined) process.stdout.write(result.stdout);
  if (result.stderr !== undefined) process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}

const entrypoint = process.argv[1];
if (entrypoint !== undefined && import.meta.url === pathToFileURL(entrypoint).href) {
  void executeExtractionCli(process.argv.slice(2)).then(writeCliResult);
}
