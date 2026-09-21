import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";

// Tarefa 5.2 — tokens de dado numérico ativam algarismos tabulares (tnum) e
// zero cortado (zero), expressos em CSS como font-variant-numeric.
test("o token de dado numérico resolve para algarismos tabulares e zero cortado", () => {
  for (const theme of ["light", "dark"] as const) {
    const features = tokens["text-data-numeric"][theme].split(/\s+/);
    expect(features).toContain("tabular-nums");
    expect(features).toContain("slashed-zero");
  }
});

test("os demais papéis de texto não forçam variante numérica", () => {
  expect(tokens["text-body-numeric"].light).toBe("normal");
  expect(tokens["text-label-numeric"].light).toBe("normal");
  expect(tokens["text-heading-numeric"].light).toBe("normal");
});

test("toda família de texto resolve para Inter", () => {
  for (const role of ["body", "label", "heading", "data"] as const) {
    expect(tokens[`text-${role}-family`].light).toMatch(/^Inter,/);
  }
});
