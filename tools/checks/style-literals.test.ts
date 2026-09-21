import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Fora de @chargebr/tokens, nenhum arquivo declara valor literal de cor,
// espaço, raio, sombra ou tipografia: só consome token. O pacote de tokens é a
// única fonte de literais, por definição, e por isso fica fora do perímetro.
const PERIMETER = join(ROOT, "packages");
const EXEMPT_PACKAGES = new Set(["tokens"]);
const SKIPPED_DIRS = new Set(["node_modules", "storybook-static"]);
const CSS_EXTENSIONS = [".css"];
const SCRIPT_EXTENSIONS = [".ts", ".tsx"];

// Propriedades cujo valor precisa vir inteiro de token.
const GUARDED_PROPERTIES = [
  /^color$/,
  /^background(-color)?$/,
  /^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?-color$/,
  /^outline-color$/,
  /^(fill|stroke|caret-color|accent-color|text-decoration-color)$/,
  /^(padding|margin)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/,
  /^(gap|row-gap|column-gap)$/,
  /^inset(-(block|inline)(-(start|end))?)?$/,
  /^border(-(top|bottom)-(left|right)|-(start|end)-(start|end))?-radius$/,
  /^(box-shadow|text-shadow)$/,
  /^font(-family|-size|-weight|-style|-variant-numeric)?$/,
  /^(line-height|letter-spacing)$/,
];

// O que pode sobrar num valor guardado depois de retirar as referências a token.
const ALLOWED_KEYWORDS =
  /\b(inherit|initial|unset|revert|revert-layer|currentColor|transparent|none|auto|normal|0)\b/gi;

// Literal de cor, em qualquer propriedade e em qualquer arquivo.
const COLOR_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;

// Literal de medida em código TypeScript: só dentro de string, para não casar
// com número de outra natureza.
const UNIT_LITERAL_IN_STRING = /["'`][^"'`]*\b\d+(\.\d+)?(px|rem|em|pt)\b[^"'`]*["'`]/;

function collectFiles(dir: string, extensions: string[], found: string[]): void {
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
      collectFiles(fullPath, extensions, found);
    } else if (extensions.some((ext) => fullPath.endsWith(ext))) {
      found.push(fullPath);
    }
  }
}

function packagesInPerimeter(): string[] {
  let entries: string[];
  try {
    entries = readdirSync(PERIMETER);
  } catch {
    return [];
  }
  return entries
    .filter((entry) => !EXEMPT_PACKAGES.has(entry))
    .map((entry) => join(PERIMETER, entry))
    .filter((path) => statSync(path).isDirectory());
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "));
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

// Declarações CSS: `propriedade: valor;` fora de comentário. Propriedade
// guardada não pode ter nada além de token e palavra-chave; qualquer
// propriedade reprova se carregar literal de cor.
function cssViolations(file: string): string[] {
  const text = stripComments(readFileSync(file, "utf8"));
  const violations: string[] = [];
  const declaration = /([a-z-]+)\s*:\s*([^;{}]+);/gi;
  for (const match of text.matchAll(declaration)) {
    const [, property = "", value = ""] = match;
    const location = `${file.slice(ROOT.length)}:${lineOf(text, match.index)}`;
    if (property.startsWith("--")) continue;
    if (COLOR_LITERAL.test(value)) {
      violations.push(`${location} — ${property}: ${value.trim()} (literal de cor)`);
      continue;
    }
    if (!GUARDED_PROPERTIES.some((pattern) => pattern.test(property))) continue;
    const remainder = value
      .replace(/var\(--[a-z0-9-]+\)/gi, "")
      .replace(ALLOWED_KEYWORDS, "")
      .replace(/[\s,/]/g, "");
    if (remainder.length > 0) {
      violations.push(`${location} — ${property}: ${value.trim()} (literal de estilo)`);
    }
  }
  return violations;
}

function scriptViolations(file: string): string[] {
  const violations: string[] = [];
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, "");
    if (COLOR_LITERAL.test(code) || UNIT_LITERAL_IN_STRING.test(code)) {
      violations.push(`${file.slice(ROOT.length)}:${index + 1} — ${line.trim()}`);
    }
  });
  return violations;
}

function styleLiterals(): string[] {
  const cssFiles: string[] = [];
  const scriptFiles: string[] = [];
  for (const pkg of packagesInPerimeter()) {
    collectFiles(pkg, CSS_EXTENSIONS, cssFiles);
    collectFiles(pkg, SCRIPT_EXTENSIONS, scriptFiles);
  }
  return [
    ...cssFiles.flatMap(cssViolations),
    ...scriptFiles.filter((f) => !f.endsWith(".d.ts")).flatMap(scriptViolations),
  ];
}

test("fora de @chargebr/tokens, nenhum arquivo declara valor literal de estilo", () => {
  expect(styleLiterals()).toEqual([]);
});
