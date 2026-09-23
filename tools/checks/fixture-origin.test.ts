import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, test } from "vitest";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Toda fixture diz, no próprio arquivo, de onde veio. Uma fixture derivada do
// contrato de leitura afirma um estado do domínio que existe; uma fixture
// sintética afirma apenas capacidade de renderização. Sem esta checagem, a
// distinção dura até alguém copiar um arquivo — e uma fixture sintética passa
// a ser lida como derivada do contrato, que é exatamente o que a mudança que
// as autorizou não pode permitir.
//
// Perímetro: todo arquivo sob um diretório chamado `fixtures` em
// packages/ui/src. A declaração é lida pela árvore sintática: precisa ser
// `export const FIXTURE_ORIGIN: FixtureOrigin = "<origem>"` com origem
// conhecida, e `export const FIXTURE_ORIGIN_NOTE = "<texto não vazio>"`.
const PERIMETER = join(ROOT, "packages/ui/src");
const FIXTURE_DIR = "fixtures";
const SKIPPED_DIRS = new Set(["node_modules", "storybook-static"]);
const EXTENSIONS = [".ts", ".tsx"];

const ORIGIN = "FIXTURE_ORIGIN";
const NOTE = "FIXTURE_ORIGIN_NOTE";
const KNOWN_ORIGINS = ["contract", "synthetic"];

function collectFixtureFiles(dir: string, inFixtures: boolean, found: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIPPED_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectFixtureFiles(fullPath, inFixtures || entry === FIXTURE_DIR, found);
    } else if (inFixtures && EXTENSIONS.some((ext) => fullPath.endsWith(ext))) {
      found.push(fullPath);
    }
  }
}

interface Declarations {
  origin: string | null;
  note: string | null;
}

function declarationsIn(file: string): Declarations {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found: Declarations = { origin: null, note: null };
  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const initializer = declaration.initializer;
        if (initializer === undefined || !ts.isStringLiteral(initializer)) continue;
        if (declaration.name.text === ORIGIN) found.origin = initializer.text;
        if (declaration.name.text === NOTE) found.note = initializer.text;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function fixtureFiles(): string[] {
  const found: string[] = [];
  collectFixtureFiles(PERIMETER, false, found);
  return found;
}

function violations(): string[] {
  return fixtureFiles().flatMap((file) => {
    const where = file.slice(ROOT.length);
    const { origin, note } = declarationsIn(file);
    const problems: string[] = [];
    if (origin === null) {
      problems.push(`${where} — sem \`export const ${ORIGIN}\``);
    } else if (!KNOWN_ORIGINS.includes(origin)) {
      problems.push(
        `${where} — ${ORIGIN} = "${origin}", fora de ${KNOWN_ORIGINS.join(", ")}`,
      );
    }
    if (note === null || note.trim().length === 0) {
      problems.push(`${where} — sem \`export const ${NOTE}\` com texto`);
    }
    return problems;
  });
}

test("toda fixture declara de onde veio, no próprio arquivo", () => {
  expect(violations()).toEqual([]);
});

test("o perímetro encontra as fixtures que existem", () => {
  // Sem isto, um perímetro que deixasse de casar passaria como se não
  // houvesse fixture alguma a verificar.
  const files = fixtureFiles().map((file) => basename(file));
  expect(files).toContain("abve-janeiro-2025.ts");
  expect(files).toContain("synthetic-series.ts");
});
