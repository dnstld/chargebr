import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";
import {
  type ContrastInput,
  type MeasuredPair,
  contrastInput,
  measureTheme,
} from "./contrast.js";
import { loadSource, THEMES, type Theme } from "./source.js";

type Resolved = Record<string, Record<Theme, string>>;

const resolved = tokens as Resolved;

function navToken(key: string, name: string) {
  const value = resolved[key]?.light;
  if (value === undefined) throw new Error(`token ausente: ${key}`);
  return { name, value };
}

const textInput = (
  current = navToken("color-nav-current", "color.nav.current"),
): ContrastInput => ({
  theme: "light",
  surfaces: [],
  chartSurface: undefined,
  action: current,
  hover: undefined,
  onAction: navToken("color-nav-current-text", "color.nav.current-text"),
  focusRing: undefined,
  extraActions: [],
});

const graphicInput = (
  accent = navToken("color-nav-accent", "color.nav.accent"),
): ContrastInput => ({
  theme: "light",
  surfaces: [
    navToken("color-nav-rail", "color.nav.rail"),
    navToken("color-nav-panel", "color.nav.panel"),
    navToken("color-nav-edge", "color.nav.edge"),
  ],
  chartSurface: undefined,
  action: undefined,
  hover: undefined,
  onAction: undefined,
  focusRing: accent,
  extraActions: [],
});

function violation(pair: MeasuredPair): string | null {
  if (pair.margin >= 0) return null;
  return `${pair.pair[0]} × ${pair.pair[1]} = ${pair.ratio.toFixed(3)}:1 < piso ${pair.floor}:1`;
}

function fixedPairs(
  current = navToken("color-nav-current", "color.nav.current"),
  accent = navToken("color-nav-accent", "color.nav.accent"),
): MeasuredPair[] {
  return [
    ...measureTheme(textInput(current)).pairs,
    ...measureTheme(graphicInput(accent)).pairs,
  ];
}

test("o conjunto fixo sustenta os pisos e registra o pior par", () => {
  const pairs = fixedPairs();
  expect(pairs.map(violation).filter(Boolean)).toEqual([]);

  const worst = pairs.reduce((current, pair) =>
    pair.margin < current.margin ? pair : current,
  );
  expect(worst.pair).toEqual(["color.nav.accent", "color.nav.edge"]);
  expect(worst.ratio).toBeCloseTo(4.737, 3);
  expect(worst.margin).toBeCloseTo(1.737, 3);
});

test("par do conjunto fixo abaixo do piso nomeia par, razão e piso", () => {
  const planted = fixedPairs(
    navToken("color-nav-current", "color.nav.current"),
    { name: "color.nav.accent", value: "#302681" },
  );
  expect(planted.map(violation).filter(Boolean)).toContain(
    "color.nav.accent × color.nav.rail = 1.556:1 < piso 3:1",
  );
});

test("os tokens fixos resolvem igual nos dois temas", () => {
  for (const key of Object.keys(resolved).filter((name) =>
    name.startsWith("color-nav-"),
  )) {
    expect(resolved[key]?.light, key).toBe(resolved[key]?.dark);
  }
});

test("color.nav fica fora das superfícies e ações descobertas por tema", () => {
  const source = loadSource();
  for (const theme of THEMES) {
    const input = contrastInput(theme, resolved, source);
    const discovered = [
      ...input.surfaces,
      ...input.extraActions,
      input.action,
      input.hover,
    ]
      .filter((token) => token !== undefined)
      .map((token) => token.name);
    expect(discovered.some((name) => name.startsWith("color.nav."))).toBe(
      false,
    );
  }
});
