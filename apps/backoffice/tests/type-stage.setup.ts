import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { TestProject } from "vitest/node";

// Raiz do repositório, a partir da localização deste arquivo
// (apps/backoffice/tests/).
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

// O mesmo binário que `verify:types` executa: `pnpm -r exec tsc` resolve o
// `tsc` da raiz, porque nenhum pacote do workspace instala o próprio.
const TSC = join(ROOT, "node_modules/.bin/tsc");

// Pacote do workspace, para `verify:types`: cada diretório sob estas áreas com
// `package.json` — o conjunto que `pnpm -r exec` alcança.
const WORKSPACE_AREAS = ["apps", "packages"];
const INSTALLED_DEPENDENCIES = "node_modules";

// O que a checagem de tipos lê num pacote, fora das dependências instaladas,
// com caminhos relativos à raiz. Quando o `tsc` não lista, o erro é guardado no
// lugar da lista: quem reprova é a afirmação, nomeando o pacote.
export interface Listing {
  pkg: string;
  files: string[];
  error: string | null;
}

export const TYPE_STAGE_LISTINGS = "typeStageListings";

declare module "vitest" {
  export interface ProvidedContext {
    typeStageListings: Listing[];
  }
}

function workspacePackages(): string[] {
  return WORKSPACE_AREAS.flatMap((area) => {
    let entries: string[];
    try {
      entries = readdirSync(join(ROOT, area));
    } catch {
      return []; // área do workspace ainda não existe
    }
    return entries
      .filter((entry) => existsSync(join(ROOT, area, entry, "package.json")))
      .map((entry) => `${area}/${entry}`);
  }).sort();
}

function listTypeStageInputs(pkg: string): Listing {
  const result = spawnSync(
    TSC,
    ["--noEmit", "-p", join(pkg, "tsconfig.json"), "--listFilesOnly"],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.error !== undefined) {
    return { pkg, files: [], error: result.error.message };
  }
  if (result.status !== 0) {
    const output = `${result.stdout}${result.stderr}`.trim();
    return {
      pkg,
      files: [],
      error: `tsc saiu com ${result.status}: ${output}`,
    };
  }
  const files = result.stdout
    .split("\n")
    .filter((line) => line.length > 0)
    .map((file) => relative(ROOT, file))
    .filter((file) => !file.split(sep).includes(INSTALLED_DEPENDENCIES));
  return { pkg, files, error: null };
}

// A listagem é preparo, como a construção: custa uma execução do `tsc` por
// pacote, e cobrá-la dentro de uma afirmação punha esse custo sob o limite por
// teste, no teste que chamasse primeiro. Roda depois de `build.setup.ts` — os
// arquivos de `globalSetup` são preparados na ordem declarada —, para ler a
// árvore já construída.
export default function setup(project: TestProject): void {
  project.provide(
    TYPE_STAGE_LISTINGS,
    workspacePackages().map(listTypeStageInputs),
  );
}
