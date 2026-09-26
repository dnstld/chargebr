import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { notIgnoredByVersioning } from "./versioning";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Perímetro verificado: apps/* e packages/*, e nada mais.
const PERIMETER = ["packages", "apps"];
// `.next` é saída da construção, não conteúdo verificado: o framework gera lá
// arquivos com supressão sem justificativa, e lê-los faria este guardião
// reprovar o que a própria verificação acabou de gerar.
const SKIPPED_DIRS = new Set(["node_modules", "storybook-static", ".next"]);
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];

// Montados por concatenação para o próprio guardião não casar consigo mesmo.
const EXPECT_ERROR = `@ts-${"expect-error"}`;
const IGNORE = `@ts-${"ignore"}`;

function collectSourceFiles(dir: string, found: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return; // diretório do perímetro ainda não existe (ex.: apps/)
  }
  for (const entry of entries) {
    if (SKIPPED_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectSourceFiles(fullPath, found);
    } else if (SOURCE_EXTENSIONS.some((ext) => fullPath.endsWith(ext))) {
      found.push(fullPath);
    }
  }
}

function suppressionsWithoutJustification(): string[] {
  const collected: string[] = [];
  for (const area of PERIMETER) {
    collectSourceFiles(join(ROOT, area), collected);
  }
  // Arquivo que o versionamento ignora não é conteúdo verificado, esteja ele
  // dentro do diretório de artefatos ou fora dele.
  const files = notIgnoredByVersioning(ROOT, collected);

  const offenders: string[] = [];
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const directive of [EXPECT_ERROR, IGNORE]) {
        const at = line.indexOf(directive);
        if (at === -1) continue;
        const justification = line.slice(at + directive.length).trim();
        if (justification.length === 0) {
          offenders.push(`${file.slice(ROOT.length)}:${index + 1}`);
        }
      }
    });
  }
  return offenders;
}

test("toda supressão de erro de tipo carrega justificativa na mesma linha", () => {
  expect(suppressionsWithoutJustification()).toEqual([]);
});
