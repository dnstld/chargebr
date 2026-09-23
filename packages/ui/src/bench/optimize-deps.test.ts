/// <reference types="vite/client" />
import { expect, test } from "vitest";
import { BENCH_OPTIMIZE_DEPS } from "../../.storybook/optimize-deps";

// A bancada pré-empacota dependências sem descoberta (ver optimize-deps.ts):
// uma dependência importada e não declarada seria servida sem empacotar, e a
// omissão só apareceria como lentidão ou, no caso de CJS, como erro ao
// carregar a história. Este contrato faz a omissão aparecer aqui, nomeando o
// arquivo e o especificador.
//
// Perímetro: tudo o que chega ao navegador — componentes, histórias, módulos
// que elas importam e as anotações em .storybook/. Ficam de fora o que roda só
// em Node (testes de contrato, main.ts do Storybook, esta própria lista) e o
// que só existe para o compilador (declarações e checagens de tipo).
const browserSources = {
  ...import.meta.glob<string>("../**/*.{ts,tsx}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("../../.storybook/*.{ts,tsx}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

const NODE_ONLY = [
  /\.test\.tsx?$/,
  /\.typecheck\.tsx$/,
  /\.d\.ts$/,
  /\/\.storybook\/main\.ts$/,
  /\/\.storybook\/optimize-deps\.ts$/,
];

// Uma declaração de importação ou reexportação por linha, como o formatador
// as deixa; `[^"';]` impede que a busca atravesse uma declaração vizinha.
// Importação só de tipo é apagada pelo compilador e não chega ao navegador.
const IMPORT =
  /^(?:import|export)\s+(type\s+)?(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/gm;

// O que não é dependência de terceiros: caminho relativo, módulo de Node,
// pacote deste workspace (servido como fonte) e folha de estilo.
function isBareDependency(specifier: string): boolean {
  return !(
    specifier.startsWith(".") ||
    specifier.startsWith("node:") ||
    specifier.startsWith("@chargebr/") ||
    specifier.endsWith(".css")
  );
}

function bareImportsOf(source: string): string[] {
  const found: string[] = [];
  for (const [, typeOnly, specifier = ""] of source.matchAll(IMPORT)) {
    if (typeOnly || !isBareDependency(specifier)) continue;
    found.push(specifier);
  }
  return found;
}

// `pai > filho` declara o filho, resolvido a partir do pai; o que a fonte
// importa é o último elo da corrente.
const declared = new Set(
  (BENCH_OPTIMIZE_DEPS.include ?? []).map((entry) =>
    entry.split(">").at(-1)?.trim(),
  ),
);

test("toda dependência importada por arquivo que chega ao navegador é pré-empacotada", () => {
  const missing = Object.entries(browserSources)
    .filter(([file]) => !NODE_ONLY.some((pattern) => pattern.test(file)))
    .flatMap(([file, source]) =>
      bareImportsOf(source)
        .filter((specifier) => !declared.has(specifier))
        .map((specifier) => `${file}: "${specifier}" fora de optimize-deps.ts`),
    );
  expect(missing).toEqual([]);
});

test("a lista de pré-empacotamento não tem entrada repetida", () => {
  const include = BENCH_OPTIMIZE_DEPS.include ?? [];
  expect(new Set(include).size).toBe(include.length);
});
