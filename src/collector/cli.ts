import { pathToFileURL } from "node:url";

import { runAbveCollector, type AbveRunnerDependencies } from "./runner.js";
import { sanitizeMessage } from "./sanitize.js";

export interface CliResult {
  readonly exitCode: number;
  readonly stdout?: string;
  readonly stderr?: string;
}

const USAGE = "Usage: pnpm collect <abve|aneel>";

export async function executeCli(
  args: readonly string[],
  runnerDependencies: Partial<AbveRunnerDependencies> = {},
): Promise<CliResult> {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    return { exitCode: 0, stdout: `${USAGE}\n` };
  }

  if (args.length === 0) {
    return { exitCode: 64, stderr: `${USAGE}\n` };
  }

  if (args.length !== 1 || args[0]?.startsWith("-")) {
    return {
      exitCode: 64,
      stderr: `${sanitizeMessage("invalid_usage: unexpected arguments")}\n${USAGE}\n`,
    };
  }

  if (args[0] === "aneel") {
    return {
      exitCode: 69,
      stderr: `${sanitizeMessage("source_unavailable: aneel is known but unavailable")}\n`,
    };
  }

  if (args[0] === "abve") {
    return runAbveCollector(readCollectorEnvironment(), runnerDependencies);
  }

  return {
    exitCode: 64,
    stderr: `${sanitizeMessage(`invalid_usage: unknown source ${args[0]}`)}\n${USAGE}\n`,
  };
}

function readCollectorEnvironment(): {
  readonly CHARGEBR_COLLECTOR_DATABASE_URL?: string;
  readonly CHARGEBR_COLLECTOR_INITIATED_BY?: string;
} {
  const environment: {
    CHARGEBR_COLLECTOR_DATABASE_URL?: string;
    CHARGEBR_COLLECTOR_INITIATED_BY?: string;
  } = {};
  if (process.env.CHARGEBR_COLLECTOR_DATABASE_URL !== undefined) {
    environment.CHARGEBR_COLLECTOR_DATABASE_URL = process.env.CHARGEBR_COLLECTOR_DATABASE_URL;
  }
  if (process.env.CHARGEBR_COLLECTOR_INITIATED_BY !== undefined) {
    environment.CHARGEBR_COLLECTOR_INITIATED_BY = process.env.CHARGEBR_COLLECTOR_INITIATED_BY;
  }
  return environment;
}

function writeCliResult(result: CliResult): void {
  if (result.stdout !== undefined) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr !== undefined) {
    process.stderr.write(result.stderr);
  }
  process.exitCode = result.exitCode;
}

const entrypoint = process.argv[1];
if (entrypoint !== undefined && import.meta.url === pathToFileURL(entrypoint).href) {
  void executeCli(process.argv.slice(2)).then(writeCliResult);
}
