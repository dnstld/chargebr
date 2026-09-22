import { oklch } from "culori";
import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";
import { THRESHOLDS } from "./palette.js";

// Tarefa 3.3 — os dois primitivos novos são passos da rampa índigo que já
// existe, e não cores inventadas: o matiz é o da família, e o passo de
// luminosidade de `indigo.300` para `indigo.200` é o mesmo que o tema claro usa
// entre `indigo.700` e `indigo.600`. Qualquer alteração nos hexadecimais
// reprova aqui.

// Matiz da família índigo, em graus OKLCH, e a tolerância da checagem de
// paleta: a rampa nova não pode sair da família que a paleta ancora.
const FAMILY_HUE = 280.4;
const { hueTolerance } = THRESHOLDS;

// Passo de luminosidade entre dois degraus vizinhos da ponta que um tema usa,
// e a tolerância com que os dois temas precisam concordar. Vive junto do valor
// que ele descreve; o critério que o impõe está em contrast.ts.
const HOVER_STEP = 0.096;
const STEP_TOLERANCE = 0.02;

const lightnessOf = (name: "color-indigo-200" | "color-indigo-300"): number =>
  oklch(tokens[name].light)?.l ?? Number.NaN;

test.each(["color-indigo-200", "color-indigo-300"] as const)(
  "%s está na família índigo",
  (name) => {
    const color = oklch(tokens[name].light);
    expect(color?.h ?? Number.NaN).toBeGreaterThanOrEqual(
      FAMILY_HUE - hueTolerance,
    );
    expect(color?.h ?? Number.NaN).toBeLessThanOrEqual(
      FAMILY_HUE + hueTolerance,
    );
  },
);

test("o passo de indigo.300 para indigo.200 é o passo de hover da rampa", () => {
  const step =
    lightnessOf("color-indigo-200") - lightnessOf("color-indigo-300");
  expect(Math.abs(step - HOVER_STEP)).toBeLessThanOrEqual(STEP_TOLERANCE);
});

test("os dois primitivos novos conservam os hexadecimais declarados", () => {
  // Primitivo não tem tema: os dois valores saem iguais da geração.
  expect(tokens["color-indigo-300"]).toMatchObject({
    light: "#8788fe",
    dark: "#8788fe",
  });
  expect(tokens["color-indigo-200"]).toMatchObject({
    light: "#a8aefe",
    dark: "#a8aefe",
  });
});

// Tarefa 3.4 — `indigo.400` conserva seu valor byte a byte: o que sai dele é a
// cor de ação, não o valor.
test("indigo.400 conserva #706fe2 e segue sendo a série 1 do tema escuro", () => {
  expect(tokens["color-indigo-400"].dark).toBe("#706fe2");
  expect(tokens["color-chart-series-1"].dark).toBe(
    tokens["color-indigo-400"].dark,
  );
});
