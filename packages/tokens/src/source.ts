import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath, URL as NodeURL } from "node:url";

// Diretório da fonte DTCG e da saída gerada, a partir da localização deste
// arquivo (packages/tokens/src/). A URL do Node é usada de propósito: num
// ambiente de DOM simulado a URL global resolve caminhos file: contra
// http://localhost e o resultado deixa de ser um caminho.
export const TOKENS_DIR = fileURLToPath(
  new NodeURL("../tokens/", import.meta.url),
);
export const GENERATED_DIR = fileURLToPath(
  new NodeURL("../generated/", import.meta.url),
);

// As três camadas, na ordem em que uma pode referenciar a anterior.
export const LAYERS = ["primitive", "semantic", "component"] as const;
export type Layer = (typeof LAYERS)[number];

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export interface SourceFile {
  /** Caminho absoluto. */
  path: string;
  /** Caminho relativo ao diretório da fonte, para mensagens. */
  file: string;
  layer: Layer;
  /** `null` quando o arquivo vale nos dois temas. */
  theme: Theme | null;
}

export interface SourceToken {
  /** Caminho DTCG do token, com ponto: `color.gray.900`. */
  path: string;
  layer: Layer;
  theme: Theme | null;
  /** `$type` próprio ou herdado do grupo; `undefined` quando nenhum dos dois existe. */
  type: string | undefined;
  /** `$value` como foi escrito na fonte, sem resolver referências. */
  value: unknown;
  file: string;
}

const REFERENCE = /^\{([^{}]+)\}$/;

export function isLayer(value: string): value is Layer {
  return (LAYERS as readonly string[]).includes(value);
}

function themeOfFile(path: string): Theme | null {
  const name = basename(path, ".json");
  return (THEMES as readonly string[]).includes(name) ? (name as Theme) : null;
}

// Um subdiretório por camada; dentro dele, `light.json` e `dark.json` valem num
// tema só e qualquer outro arquivo vale nos dois.
export function listSourceFiles(dir: string = TOKENS_DIR): SourceFile[] {
  const files: SourceFile[] = [];
  for (const layer of LAYERS) {
    const layerDir = join(dir, layer);
    let entries: string[];
    try {
      entries = readdirSync(layerDir);
    } catch {
      continue;
    }
    for (const entry of entries.sort()) {
      if (!entry.endsWith(".json")) continue;
      const path = join(layerDir, entry);
      files.push({
        path,
        file: relative(dir, path),
        layer,
        theme: themeOfFile(path),
      });
    }
  }
  return files;
}

// Arquivos que compõem um tema: tudo que vale nos dois temas mais os do tema pedido.
export function sourceFilesForTheme(
  theme: Theme,
  dir: string = TOKENS_DIR,
): string[] {
  return listSourceFiles(dir)
    .filter((f) => f.theme === null || f.theme === theme)
    .map((f) => f.path);
}

export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flatten(
  node: Record<string, unknown>,
  prefix: string[],
  inheritedType: string | undefined,
  file: SourceFile,
  out: SourceToken[],
): void {
  const type = typeof node.$type === "string" ? node.$type : inheritedType;
  if ("$value" in node) {
    out.push({
      path: prefix.join("."),
      layer: file.layer,
      theme: file.theme,
      type,
      value: node.$value,
      file: file.file,
    });
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (isRecord(child)) flatten(child, [...prefix, key], type, file, out);
  }
}

export function loadSource(dir: string = TOKENS_DIR): SourceToken[] {
  const tokens: SourceToken[] = [];
  for (const file of listSourceFiles(dir)) {
    const root = readJson(file.path);
    if (isRecord(root)) flatten(root, [], undefined, file, tokens);
  }
  return tokens;
}

// Tokens visíveis num tema: os que valem nos dois mais os daquele tema.
export function tokensForTheme(
  tokens: SourceToken[],
  theme: Theme,
): SourceToken[] {
  return tokens.filter((t) => t.theme === null || t.theme === theme);
}

export function referenceTarget(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = REFERENCE.exec(value);
  return match?.[1] ?? null;
}

// Folhas de um valor: o próprio valor quando é escalar, ou cada campo de um
// valor composto (sombra, tipografia), em profundidade.
export function leaves(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(leaves);
  if (isRecord(value)) return Object.values(value).flatMap(leaves);
  return [value];
}

export function referencesIn(value: unknown): string[] {
  return leaves(value)
    .map(referenceTarget)
    .filter((t): t is string => t !== null);
}

// Uma referência inteira conta como referência; um objeto composto cujos campos
// são todos referências também. Qualquer folha que não seja referência é literal.
export function literalLeaves(value: unknown): unknown[] {
  return leaves(value).filter((leaf) => referenceTarget(leaf) === null);
}

// Cor DTCG: as folhas são colorSpace, components e hex; nenhuma delas é
// referência e todas juntas formam um literal só. Serve para que uma mensagem
// de erro mostre o valor inteiro, não cada campo.
export function describeValue(value: unknown): string {
  return JSON.stringify(value);
}
