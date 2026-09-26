import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, inject, test } from "vitest";
import { type Listing, TYPE_STAGE_LISTINGS } from "./type-stage.setup";

// Raiz do repositório, a partir da localização deste arquivo
// (apps/backoffice/tests/).
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

// A checagem de tipos não pode ler arquivo que o versionamento ignora — fora
// das dependências instaladas —, esteja ele dentro ou fora do diretório de
// artefatos. A prova é sobre o que a etapa lê, e não sobre o veredito dela:
// medido com a configuração do repositório, o `tsc` passa lendo artefato de
// construção, presente ou ausente, porque importação de efeito colateral não
// reporta especificador não resolvido e `skipLibCheck` pula o `.d.ts`.
//
// Este arquivo mora no projeto que constrói porque só aqui a construção já
// rodou: os projetos do Vitest não têm ordem entre si, e um guardião em
// tools/checks/ olharia às vezes uma árvore sem artefato algum. O que a etapa
// lê é listado no preparo, por `type-stage.setup.ts`, depois da construção;
// as afirmações leem o que foi guardado, e são elas que reprovam.
//
// A aplicação que constrói é esta, e o dia em que houver uma segunda a prova
// olharia a leitura dela sem os artefatos dela — sem ordem entre projetos,
// nada garante que ela já construiu. Os artefatos exigidos são por isso
// derivados de `apps/`, e não uma lista fixa: com uma segunda aplicação, a
// prova reprova nomeando o artefato que falta, em vez de passar calada. O
// ciclo que trouxer a segunda decide onde a prova mora; o que não depende de
// ninguém lembrar é o aviso.

// Sem estes pacotes na enumeração, a varredura teria deixado de casar com o
// workspace e passaria sem ter olhado nada.
const EXPECTED_PACKAGES = ["apps/backoffice", "packages/tokens", "packages/ui"];

// O par pelo qual a dependência passaria, em cada aplicação: o arquivo que a
// construção gera fora do diretório de artefatos e o que ele importa de dentro.
// Sem eles presentes, a afirmação sobre o que a etapa lê seria vazia.
const BUILD_ARTIFACT_NAMES = ["next-env.d.ts", ".next/types/routes.d.ts"];

// Toda aplicação sob `apps/`, e não só a que constrói neste projeto. Aplicação
// que não seja do mesmo framework reprova aqui, o que é a direção certa: ela
// obriga o ciclo que a trouxer a dizer o que a etapa de tipos lê nela.
function buildArtifacts(): string[] {
  let entries: string[];
  try {
    entries = readdirSync(join(ROOT, "apps"));
  } catch {
    return [];
  }
  return entries
    .filter((entry) => existsSync(join(ROOT, "apps", entry, "package.json")))
    .flatMap((entry) =>
      BUILD_ARTIFACT_NAMES.map((name) => `apps/${entry}/${name}`),
    )
    .sort();
}

// Sem o preparo declarado no projeto, não há listagem: a ausência reprova,
// nomeando o que faltou, em vez de a prova afirmar sobre uma lista vazia.
function typeStageListings(): Listing[] {
  const listings = inject(TYPE_STAGE_LISTINGS);
  if (listings === undefined) {
    throw new Error(
      `nenhuma listagem em "${TYPE_STAGE_LISTINGS}": tests/type-stage.setup.ts não está no globalSetup deste projeto`,
    );
  }
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
  const artifacts = buildArtifacts();
  expect(artifacts).not.toEqual([]);
  const missing = artifacts.filter(
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
