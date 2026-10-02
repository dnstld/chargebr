import { wcagContrast } from "culori";
import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";
import { CONTRAST_THRESHOLDS, contrastInput } from "./contrast.js";
import { loadSource, THEMES, type Theme } from "./source.js";

// A checagem do conjunto que não varia por tema — a moldura de navegação,
// escura nos dois temas. A checagem por tema (`contrast.test.ts`) não serve
// aqui: ela mede a cor de ação do tema **ativo** contra as superfícies
// **daquele tema**, e a moldura não hospeda a cor de ação do conteúdo, tem a
// própria.
//
// Os pares são declarados, e não descobertos: na varredura por tema o papel de
// cada token está no prefixo do nome (`color-surface-*` é fundo,
// `color-action-*` é primeiro plano), e aqui não está — qual primeiro plano
// pousa sobre qual fundo é fato de desenho. O que impede a lista declarada de
// ficar menor que o conjunto é a prova de cobertura, abaixo.
//
// Cada par carrega o piso do **papel** que o token cumpre: 4,5:1 para o que
// pinta texto, 3:1 para o que pinta objeto gráfico. Um tom que cumpre 3:1 como
// ícone e reprova 4,5:1 como texto é seguro enquanto só ícone o usar, e deixa
// de ser no primeiro texto que o adotar.

type Resolved = Record<string, Record<Theme, string>>;
const resolved = tokens as Resolved;

const NAV_PREFIX = "color-nav-";

function rawValue(key: string): string {
  const token = resolved[key]?.light;
  if (token === undefined) throw new Error(`token ausente na fonte: ${key}`);
  return token;
}

// Caminho DTCG do token, como a checagem por tema o escreve nas mensagens.
function path(key: string): string {
  return key.replaceAll("-", ".");
}

// Superfícies da moldura: tudo que recebe primeiro plano por cima.
const SURFACES = [
  "color-nav-rail",
  "color-nav-panel",
  "color-nav-edge",
  "color-nav-hover",
  "color-nav-current",
] as const;

const PANEL_SURFACES = [
  "color-nav-rail",
  "color-nav-panel",
  "color-nav-edge",
] as const;

// Primeiro plano de texto, ao piso de 4,5:1, com as superfícies sobre as quais
// cada um de fato aparece.
const TEXT_PAIRS: readonly (readonly [string, readonly string[]])[] = [
  ["color-nav-text", PANEL_SURFACES],
  // O texto forte é também o do estado sobre o ponteiro, e `color.nav.hover` é
  // a superfície que ele recebe nesse estado.
  ["color-nav-text-strong", [...PANEL_SURFACES, "color-nav-hover"]],
  ["color-nav-text-muted", PANEL_SURFACES],
  // O texto da entrada corrente — rótulo e contagem — só existe sobre a pílula.
  ["color-nav-current-text", ["color-nav-current"]],
];

// Primeiro plano de objeto gráfico, ao piso de 3:1: chevron de pasta, marcador
// de folha e ícone da trilha (`glyph`), barra de acento e anel de foco
// (`accent`).
const GRAPHIC_PAIRS: readonly (readonly [string, readonly string[]])[] = [
  ["color-nav-glyph", PANEL_SURFACES],
  ["color-nav-accent", PANEL_SURFACES],
];

interface Measured {
  foreground: string;
  background: string;
  ratio: number;
  floor: number;
  margin: number;
}

function measure(
  pairs: readonly (readonly [string, readonly string[]])[],
  floor: number,
  read: (key: string) => string,
): Measured[] {
  return pairs.flatMap(([foreground, backgrounds]) =>
    backgrounds.map((background) => {
      const ratio = wcagContrast(read(foreground), read(background));
      return { foreground, background, ratio, floor, margin: ratio - floor };
    }),
  );
}

function allPairs(read: (key: string) => string = rawValue): Measured[] {
  return [
    ...measure(TEXT_PAIRS, CONTRAST_THRESHOLDS.textFloor, read),
    ...measure(GRAPHIC_PAIRS, CONTRAST_THRESHOLDS.graphicObjectFloor, read),
  ];
}

// Mesma forma de mensagem que `themeViolations` usa na checagem por tema: o
// par, a razão medida e o piso.
function violationsOf(measured: readonly Measured[]): string[] {
  return measured
    .filter((pair) => pair.margin < 0)
    .map(
      (pair) =>
        `[moldura] ${path(pair.foreground)} × ${path(pair.background)} = ${pair.ratio.toFixed(3)}:1 < piso ${pair.floor}:1`,
    );
}

// Todo token do conjunto precisa aparecer em algum par — como primeiro plano ou
// como superfície. É esta lista que a prova de cobertura compara com a fonte.
function measuredTokens(): Set<string> {
  return new Set<string>([
    ...SURFACES,
    ...TEXT_PAIRS.map(([foreground]) => foreground),
    ...GRAPHIC_PAIRS.map(([foreground]) => foreground),
  ]);
}

function declaredTokens(source: Resolved): string[] {
  return Object.keys(source)
    .filter((key) => key.startsWith(NAV_PREFIX))
    .sort();
}

function uncoveredTokens(source: Resolved = resolved): string[] {
  const measured = measuredTokens();
  return declaredTokens(source).filter((key) => !measured.has(key));
}

test("os pisos vêm da checagem por tema, nunca de uma segunda declaração", () => {
  expect(CONTRAST_THRESHOLDS.textFloor).toBe(4.5);
  expect(CONTRAST_THRESHOLDS.graphicObjectFloor).toBe(3);
});

test("todo par da moldura sustenta o piso do papel que ele cumpre", () => {
  expect(violationsOf(allPairs())).toEqual([]);
});

test("todo token da moldura é medido em algum par", () => {
  // Sem esta prova, um token do conjunto fica declarado e medido contra nada —
  // foi o que aconteceu com `color.nav.text`, `text-strong`, `text-muted` e
  // `hover`, que a primeira versão desta checagem deixou de fora ao montar a
  // entrada de texto com a lista de superfícies vazia.
  expect(uncoveredTokens(), "token da moldura sem par declarado").toEqual([]);
});

test("token acrescentado sem par reprova, nomeando o token", () => {
  // Plantio na fonte resolvida: um token novo do conjunto, que nenhum par mede.
  const planted: Resolved = {
    ...resolved,
    "color-nav-overlay": { light: "#101013", dark: "#101013" },
  };
  expect(uncoveredTokens(planted)).toEqual(["color-nav-overlay"]);
});

test("a execução aprovada registra o pior par e a margem", () => {
  const worst = allPairs().reduce((a, b) => (b.margin < a.margin ? b : a));
  // O pior par é o objeto gráfico apagado contra a borda: 3,045:1 sobre o piso
  // de 3:1. É o par que limita a moldura, e esta asserção é o primeiro aviso se
  // ele mudar.
  expect(worst.foreground).toBe("color-nav-glyph");
  expect(worst.background).toBe("color-nav-edge");
  expect(worst.ratio).toBeCloseTo(3.045, 3);
  expect(worst.margin).toBeGreaterThan(0);
});

// A matriz medida, valor a valor: é o que este ciclo entrega, e é por isso que
// ela é afirmada e não só comparada a um piso.
const MATRIX: readonly (readonly [string, string, number])[] = [
  ["color-nav-text", "color-nav-panel", 10.419],
  ["color-nav-text-strong", "color-nav-panel", 15.275],
  ["color-nav-text-muted", "color-nav-panel", 6.515],
  ["color-nav-current-text", "color-nav-current", 12.21],
  ["color-nav-glyph", "color-nav-panel", 3.78],
  ["color-nav-accent", "color-nav-panel", 5.882],
];

test("a matriz medida da moldura bate com o desenho", () => {
  const measured = allPairs();
  for (const [foreground, background, expected] of MATRIX) {
    const found = measured.find(
      (pair) =>
        pair.foreground === foreground && pair.background === background,
    );
    expect(found, `${foreground} × ${background}`).toBeDefined();
    expect(found?.ratio, `${foreground} × ${background}`).toBeCloseTo(
      expected,
      3,
    );
  }
});

test("par de texto abaixo do piso reprova nomeando o par, a razão e o piso", () => {
  // Plantio: o tom apagado do texto volta ao valor da maquete (gray.500), que é
  // o defeito que a medição deste ciclo encontrou.
  const planted = (key: string): string =>
    key === "color-nav-text-muted" ? rawValue("color-gray-500") : rawValue(key);
  expect(violationsOf(allPairs(planted))).toContain(
    "[moldura] color.nav.text.muted × color.nav.panel = 3.780:1 < piso 4.5:1",
  );
});

test("objeto gráfico abaixo do piso reprova ao piso de 3:1, não ao de texto", () => {
  // Plantio: o tom gráfico escurece um degrau (gray.600).
  const planted = (key: string): string =>
    key === "color-nav-glyph" ? rawValue("color-gray-600") : rawValue(key);
  const violations = violationsOf(allPairs(planted));
  expect(violations).toContain(
    "[moldura] color.nav.glyph × color.nav.panel = 2.401:1 < piso 3:1",
  );
  expect(violations.join("\n")).not.toContain("piso 4.5:1");
});

test("o conjunto da moldura resolve igual nos dois temas", () => {
  const divergent = declaredTokens(resolved)
    .filter((key) => resolved[key]?.light !== resolved[key]?.dark)
    .map(
      (key) =>
        `${key}: ${resolved[key]?.light} no claro, ${resolved[key]?.dark} no escuro`,
    );
  expect(divergent, "token da moldura que varia por tema").toEqual([]);
});

test("nenhum token da moldura entra na varredura por tema", () => {
  // A varredura por tema descobre superfícies e ações por prefixo de nome
  // (`color-surface-*`, `color-action-*`). O conjunto da moldura fica fora
  // desses prefixos de propósito: medido contra a cor de ação do tema ativo,
  // ele compararia o que nunca se encontra na tela.
  const source = loadSource();
  for (const theme of THEMES) {
    const input = contrastInput(theme, resolved, source);
    const discovered = [
      ...input.surfaces,
      ...input.extraActions,
      input.action,
      input.hover,
      input.onAction,
      input.focusRing,
      input.chartSurface,
    ]
      .filter((token) => token !== undefined)
      .map((token) => token.name);
    expect(
      discovered.filter((name) => name.startsWith("color.nav.")),
      `[${theme}] token da moldura descoberto pela varredura por tema`,
    ).toEqual([]);
  }
});
