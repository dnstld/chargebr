import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

// Raiz do repositório, a partir da localização deste arquivo
// (apps/backoffice/tests/).
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

// O mesmo binário que `verify:types` executa: `pnpm -r exec tsc` resolve o
// `tsc` da raiz, porque nenhum pacote do workspace instala o próprio.
const TSC = join(ROOT, "node_modules/.bin/tsc");

// A checagem de tipos não pode ler arquivo que o versionamento ignora — fora
// das dependências instaladas —, esteja ele dentro ou fora do diretório de
// artefatos. A prova é sobre o que a etapa lê, e não sobre o veredito dela:
// medido com a configuração do repositório, o `tsc` passa lendo artefato de
// construção, presente ou ausente, porque importação de efeito colateral não
// reporta especificador não resolvido e `skipLibCheck` pula o `.d.ts`.
//
// Este arquivo mora no projeto que constrói porque só aqui a construção já
// rodou: os projetos do Vitest não têm ordem entre si, e um guardião em
// tools/checks/ olharia às vezes uma árvore sem artefato algum.

// Pacote do workspace, para `verify:types`: cada diretório sob estas áreas com
// `package.json` — o conjunto que `pnpm -r exec` alcança.
const WORKSPACE_AREAS = ["apps", "packages"];
const INSTALLED_DEPENDENCIES = "node_modules";

// Sem estes pacotes na enumeração, a varredura teria deixado de casar com o
// workspace e passaria sem ter olhado nada.
const EXPECTED_PACKAGES = ["apps/backoffice", "packages/tokens", "packages/ui"];

// O par pelo qual a dependência passaria: o arquivo que a construção gera fora
// do diretório de artefatos e o que ele importa de dentro. Sem eles presentes,
// a afirmação sobre o que a etapa lê seria vazia.
const BUILD_ARTIFACTS = [
  "apps/backoffice/next-env.d.ts",
  "apps/backoffice/.next/types/routes.d.ts",
];

interface Listing {
  pkg: string;
  files: string[];
  error: string | null;
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

// Uma listagem por pacote e por execução, compartilhada pelas afirmações que
// precisam dela.
let listings: Listing[] | undefined;
function typeStageListings(): Listing[] {
  listings ??= workspacePackages().map(listTypeStageInputs);
  return listings;
}

// `git check-ignore` sai com 0 quando algum caminho é ignorado e com 1 quando
// nenhum é. Qualquer outro código é o git sem responder — repositório ausente,
// caminho fora dele —, e aí a prova reprova com a saída de erro, em vez de ler
// o silêncio como "nada ignorado".
function ignoredByVersioning(files: string[]): Set<string> {
  const result = spawnSync("git", ["check-ignore", "--stdin"], {
    cwd: ROOT,
    input: `${files.join("\n")}\n`,
    encoding: "utf8",
  });
  if (result.error !== undefined) {
    throw new Error(`git check-ignore não executou: ${result.error.message}`);
  }
  if (result.status === 1) return new Set();
  if (result.status !== 0) {
    throw new Error(
      `git check-ignore saiu com ${result.status}: ${result.stderr.trim()}`,
    );
  }
  return new Set(result.stdout.split("\n").filter((line) => line.length > 0));
}

test("a construção deixou os artefatos sobre os quais a prova afirma", () => {
  const missing = BUILD_ARTIFACTS.filter(
    (artifact) => !existsSync(join(ROOT, artifact)),
  );
  expect(missing).toEqual([]);
});

test("a enumeração alcança o workspace, e cada pacote tem o que a etapa lê", () => {
  const packages = typeStageListings().map((listing) => listing.pkg);
  expect(packages).toEqual(expect.arrayContaining(EXPECTED_PACKAGES));

  const problems = typeStageListings().flatMap(({ pkg, error, files }) => {
    if (error !== null) return [`${pkg} — ${error}`];
    if (files.length === 0) return [`${pkg} — a etapa de tipos não lê nada`];
    return [];
  });
  expect(problems).toEqual([]);
});

test("a checagem de tipos não lê arquivo que o versionamento ignora", () => {
  const read = [
    ...new Set(typeStageListings().flatMap((listing) => listing.files)),
  ];
  const ignored = ignoredByVersioning(read);

  const offenders = typeStageListings().flatMap(({ pkg, files }) =>
    files.filter((file) => ignored.has(file)).map((file) => `${pkg} — ${file}`),
  );
  expect(offenders).toEqual([]);
});
