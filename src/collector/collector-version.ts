import { execFileSync } from "node:child_process";

const FULL_GIT_SHA = /^[0-9a-f]{40}$/u;

export type ReadGitHead = () => string;

function readGitHead(): string {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

export function resolveCollectorVersion(readHead: ReadGitHead = readGitHead): string {
  const version = readHead().trim();
  if (!FULL_GIT_SHA.test(version)) {
    throw new Error("Unable to resolve a valid collector Git commit SHA");
  }
  return version;
}
