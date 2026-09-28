import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import StyleDictionary from "style-dictionary";
import type { Dictionary, TransformedToken } from "style-dictionary/types";
import { formattedVariables } from "style-dictionary/utils";
import {
  GENERATED_DIR,
  isLayer,
  LAYERS,
  type Layer,
  sourceFilesForTheme,
  THEMES,
  type Theme,
  TOKENS_DIR,
} from "./source.js";

// Geração: a mesma fonte DTCG vira `tokens.css` (custom properties) e
// `tokens.ts` (constantes tipadas). O Style Dictionary resolve referências e
// transforma valores; a composição dos arquivos é deste módulo, para que a
// ordem seja fixa e a saída determinística.

export const GENERATED_FILES = [
  "tokens.css",
  "tokens.ts",
  "tokens.media.css",
] as const;

// Transforms explícitos, sem grupo pronto, para que nenhuma conversão implícita
// (px→rem, por exemplo) entre sem decisão.
const CSS_TRANSFORMS = [
  "name/kebab",
  "color/css",
  "size/rem",
  "fontFamily/css",
  "shadow/css/shorthand",
];

const HEADER =
  "Gerado por @chargebr/tokens a partir da fonte DTCG em tokens/. Não edite à mão.";

interface ThemeDictionary {
  theme: Theme;
  dictionary: Dictionary;
}

function layerOf(token: TransformedToken, sourceDir: string): Layer {
  const relativePath = token.filePath.slice(sourceDir.length);
  const layer =
    relativePath.split(/[\\/]/).find((segment) => segment.length > 0) ?? "";
  if (!isLayer(layer))
    throw new Error(`arquivo fora das camadas conhecidas: ${token.filePath}`);
  return layer;
}

function isThemed(token: TransformedToken, theme: Theme): boolean {
  return token.filePath.endsWith(`${theme}.json`);
}

// Breakpoint é o único eixo que `@media` não pode consumir por `var()` — CSS
// não aceita custom property na condição de uma media query (D6). Por isso
// não vira `--screen-md: 768px` no :root nem entrada em tokens.ts; vira só a
// declaração `@custom-media` que `postcss-custom-media` resolve.
function isScreenToken(token: TransformedToken): boolean {
  return token.path[0] === "screen";
}

function customMediaDeclarations(dictionary: Dictionary): string {
  return dictionary.allTokens
    .filter(isScreenToken)
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((t) => `@custom-media --${t.name} (min-width: ${t.$value});`)
    .join("\n");
}

function compareByLayerThenPath(sourceDir: string) {
  return (a: TransformedToken, b: TransformedToken): number => {
    const layerDelta =
      LAYERS.indexOf(layerOf(a, sourceDir)) -
      LAYERS.indexOf(layerOf(b, sourceDir));
    if (layerDelta !== 0) return layerDelta;
    return a.path
      .join(".")
      .localeCompare(b.path.join("."), "en", { numeric: true });
  };
}

async function resolveTheme(
  theme: Theme,
  sourceDir: string,
): Promise<ThemeDictionary> {
  const sd = new StyleDictionary({
    usesDtcg: true,
    source: sourceFilesForTheme(theme, sourceDir),
    log: { verbosity: "silent" },
    platforms: {
      css: { transforms: CSS_TRANSFORMS },
    },
  });
  await sd.hasInitialized;
  const dictionary = await sd.getPlatformTokens("css");
  dictionary.allTokens = [...dictionary.allTokens].sort(
    compareByLayerThenPath(sourceDir),
  );
  return { theme, dictionary };
}

function variables(dictionary: Dictionary, tokens: TransformedToken[]): string {
  return formattedVariables({
    format: "css",
    dictionary: { ...dictionary, allTokens: tokens },
    outputReferences: true,
    usesDtcg: true,
    formatting: { indentation: "  ", commentStyle: "none" },
  });
}

function renderCss(themes: ThemeDictionary[], sourceDir: string): string {
  const [light, dark] = themes;
  if (!light || !dark) throw new Error("os dois temas são obrigatórios");

  const blocks: string[] = [`/* ${HEADER} */`];

  // Tema claro é o padrão: todas as camadas, em ordem, sob :root.
  const rootLines: string[] = [];
  for (const layer of LAYERS) {
    const tokens = light.dictionary.allTokens.filter(
      (t) => layerOf(t, sourceDir) === layer && !isScreenToken(t),
    );
    if (tokens.length === 0) continue;
    rootLines.push(
      `  /* Camada ${layer} */`,
      variables(light.dictionary, tokens),
    );
  }
  blocks.push(`:root {\n${rootLines.join("\n")}\n}`);

  // Tema escuro redefine só o que muda: preferência do sistema como padrão,
  // atributo no documento como override nos dois sentidos.
  const darkTokens = dark.dictionary.allTokens.filter((t) =>
    isThemed(t, "dark"),
  );
  const darkVariables = variables(dark.dictionary, darkTokens);
  blocks.push(
    `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${indent(darkVariables)}\n  }\n}`,
    `:root[data-theme="dark"] {\n${darkVariables}\n}`,
  );

  return `${blocks.join("\n\n")}\n`;
}

// `@custom-media` não é CSS padrão — nenhum navegador nem `happy-dom` (usado
// pelos testes que carregam `tokens.css` cru num `<style>`) o reconhece; só
// `postcss-custom-media`, em build, sabe resolvê-lo. Por isso vive num
// arquivo próprio, nunca dentro de `tokens.css`, que continua CSS que
// qualquer consumidor pode carregar sem passar por PostCSS.
function renderMediaCss(themes: ThemeDictionary[]): string {
  const [light] = themes;
  if (!light) throw new Error("o tema claro é obrigatório");
  return `/* ${HEADER} */\n\n${customMediaDeclarations(light.dictionary)}\n`;
}

function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join("\n");
}

function renderTs(themes: ThemeDictionary[]): string {
  const [light, dark] = themes;
  if (!light || !dark) throw new Error("os dois temas são obrigatórios");

  const darkByName = new Map(dark.dictionary.allTokens.map((t) => [t.name, t]));
  const lines: string[] = [`// ${HEADER}`, "", "export const tokens = {"];
  for (const token of light.dictionary.allTokens) {
    if (isScreenToken(token)) continue;
    const darkToken = darkByName.get(token.name);
    if (!darkToken)
      throw new Error(
        `token ${token.name} existe no tema claro e não no escuro`,
      );
    lines.push(
      `  ${JSON.stringify(token.name)}: {`,
      `    css: ${JSON.stringify(`var(--${token.name})`)},`,
      `    light: ${JSON.stringify(String(token.$value))},`,
      `    dark: ${JSON.stringify(String(darkToken.$value))},`,
      "  },",
    );
  }
  if (darkByName.size !== light.dictionary.allTokens.length) {
    throw new Error("os dois temas precisam ter o mesmo conjunto de tokens");
  }
  lines.push(
    "} as const;",
    "",
    "export type TokenName = keyof typeof tokens;",
    "export type Token = (typeof tokens)[TokenName];",
    "",
  );
  return lines.join("\n");
}

export interface BuildOptions {
  sourceDir?: string;
  outDir?: string;
}

export interface BuildOutput {
  files: Record<(typeof GENERATED_FILES)[number], string>;
}

// Gera as duas saídas em memória a partir da fonte.
export async function renderTokens(
  sourceDir: string = TOKENS_DIR,
): Promise<BuildOutput> {
  const themes: ThemeDictionary[] = [];
  for (const theme of THEMES) themes.push(await resolveTheme(theme, sourceDir));
  return {
    files: {
      "tokens.css": renderCss(themes, sourceDir),
      "tokens.ts": renderTs(themes),
      "tokens.media.css": renderMediaCss(themes),
    },
  };
}

// Gera e grava as duas saídas em `outDir`.
export async function buildTokens({
  sourceDir = TOKENS_DIR,
  outDir = GENERATED_DIR,
}: BuildOptions = {}): Promise<BuildOutput> {
  const output = await renderTokens(sourceDir);
  mkdirSync(outDir, { recursive: true });
  for (const [name, content] of Object.entries(output.files)) {
    writeFileSync(join(outDir, name), content, "utf8");
  }
  return output;
}
