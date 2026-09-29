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

// Inclinação: o papel contrafactual é itálico por token, não por literal no
// componente. É a única inclinação semântica; o restante do sistema é normal.
test("o papel contrafactual tem inclinação por token", () => {
  expect(tokens["text-counterfactual-style"].light).toBe("italic");
  expect(tokens["text-counterfactual-style"].dark).toBe("italic");
  expect(tokens["font-style-normal"].light).toBe("normal");
});

// Tarefa 1.1 de button-variants — a escala de tamanho de controle
// (`text.control.sm/md/lg`) referencia os três primeiros degraus primitivos,
// na mesma ordem, nos dois temas (a escala não varia por tema).
test("a escala de tamanho de controle referencia os degraus primitivos 1/2/3", () => {
  const pairs = [
    ["text-control-sm", "font-size-1"],
    ["text-control-md", "font-size-2"],
    ["text-control-lg", "font-size-3"],
  ] as const;
  for (const [control, primitive] of pairs) {
    for (const theme of ["light", "dark"] as const) {
      expect(tokens[control][theme]).toBe(tokens[primitive][theme]);
    }
  }
});
