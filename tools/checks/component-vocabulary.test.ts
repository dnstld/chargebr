import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, test } from "vitest";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// O texto em português que um componente exibe não é decisão dele: vem do
// módulo de vocabulário de @chargebr/ui, no caso das primitivas de domínio, ou
// por propriedade de quem compõe, no caso da moldura. Nos dois casos a regra é
// a mesma — o componente não declara o rótulo no próprio arquivo —, e por isso
// é um guardião só, e não dois que divergem no dia em que um receber caso novo.
//
// Este guardião lê cada arquivo de componente pela árvore sintática — não por
// expressão regular sobre o texto — e reprova qualquer literal de string ou
// texto JSX que pareça rótulo: contém letra acentuada, ou é frase de duas ou
// mais palavras, ou é uma palavra capitalizada. Identificadores como "primary",
// "data-slot" ou "blocked-projection" passam; "Sem valor", "Verificação" e
// "Principal" não.
//
// Os perímetros são lista fechada e nomeada, e não packages/ui/src inteiro:
// história, fixture e arquivo de checagem de tipos exibem dado e prova, não
// declaram vocabulário, e continuam fora.
const PERIMETERS: Readonly<Record<string, string>> = {
  "primitivas de domínio": join(ROOT, "packages/ui/src/domain"),
  moldura: join(ROOT, "packages/ui/src/shell"),
};
const COMPONENT_EXTENSION = ".tsx";
const EXCLUDED_SUFFIXES = [".stories.tsx", ".typecheck.tsx", ".test.tsx"];
const SKIPPED_DIRS = new Set(["node_modules", "fixtures"]);

const ACCENTED = /[À-ÖØ-öø-ÿ]/;
const PHRASE = /\p{L}{2,}\s+\p{L}{2,}/u;
const CAPITALIZED_WORD = /^\p{Lu}\p{Ll}{2,}$/u;

function looksLikeLabel(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  return (
    ACCENTED.test(trimmed) ||
    PHRASE.test(trimmed) ||
    CAPITALIZED_WORD.test(trimmed)
  );
}

function collectComponentFiles(dir: string, found: string[]): void {
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
      collectComponentFiles(fullPath, found);
    } else if (
      fullPath.endsWith(COMPONENT_EXTENSION) &&
      !EXCLUDED_SUFFIXES.some((suffix) => fullPath.endsWith(suffix))
    ) {
      found.push(fullPath);
    }
  }
}

function isModuleSpecifier(node: ts.Node): boolean {
  const parent = node.parent;
  return (
    (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
    parent.moduleSpecifier === node
  );
}

function literalsIn(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const violations: string[] = [];
  const report = (node: ts.Node, text: string): void => {
    if (!looksLikeLabel(text)) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    violations.push(`${file.slice(ROOT.length)}:${line + 1} — "${text.trim()}"`);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      report(node, node.text);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!isModuleSpecifier(node)) report(node, node.text);
    } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      report(node, node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return violations;
}

function componentFilesIn(perimeter: string): string[] {
  const files: string[] = [];
  collectComponentFiles(perimeter, files);
  return files;
}

function labelsDeclaredInComponents(): string[] {
  return Object.values(PERIMETERS).flatMap((perimeter) =>
    componentFilesIn(perimeter).flatMap(literalsIn),
  );
}

test("nenhum componente que exibe texto declara rótulo em português no próprio arquivo", () => {
  expect(labelsDeclaredInComponents()).toEqual([]);
});

// Cada perímetro é cobrado separadamente: um perímetro que esvazie — por
// diretório movido ou renomeado — deixaria de ser varrido em silêncio, e a
// checagem passaria a valer sobre menos código sem que nada reprovasse.
test("cada perímetro nomeado contém componentes", () => {
  const empty = Object.entries(PERIMETERS)
    .filter(([, perimeter]) => componentFilesIn(perimeter).length === 0)
    .map(([name]) => name);
  expect(empty).toEqual([]);
});
