import { expect, test } from "vitest";
import {
  checkFontFamily,
  checkLiterals,
  checkReferences,
  checkThemeCompleteness,
} from "./rules.js";
import { loadSource, type SourceToken } from "./source.js";

const source = loadSource();

function token(
  partial: Partial<SourceToken> & Pick<SourceToken, "path" | "layer" | "value">,
): SourceToken {
  return {
    theme: null,
    type: "color",
    file: `${partial.layer}/fixture.json`,
    ...partial,
  };
}

const white = { colorSpace: "srgb", components: [1, 1, 1], hex: "#FFFFFF" };

// Tarefa 2.3 — referência dirigida sobre a fonte real.
test("toda referência da fonte aponta para a camada imediatamente abaixo", () => {
  expect(checkReferences(source)).toEqual([]);
});

test("componente referenciando primitivo reprova nomeando o token e a referência", () => {
  const violations = checkReferences([
    token({ path: "color.white", layer: "primitive", value: white }),
    token({
      path: "button.background",
      layer: "component",
      value: "{color.white}",
    }),
  ]);
  expect(violations).toEqual([
    "button.background (component) referencia {color.white} (primitive); component só pode referenciar semantic",
  ]);
});

test("semântico referenciando componente reprova", () => {
  const violations = checkReferences([
    token({ path: "color.white", layer: "primitive", value: white }),
    token({
      path: "color.surface",
      layer: "semantic",
      value: "{button.background}",
    }),
    token({
      path: "button.background",
      layer: "component",
      value: "{color.surface}",
    }),
  ]);
  expect(violations).toEqual([
    "color.surface (semantic) referencia {button.background} (component); semantic só pode referenciar primitive",
  ]);
});

test("primitivo referenciando qualquer coisa reprova", () => {
  const violations = checkReferences([
    token({ path: "color.white", layer: "primitive", value: white }),
    token({ path: "color.alias", layer: "primitive", value: "{color.white}" }),
  ]);
  expect(violations).toEqual([
    "color.alias (primitive) referencia {color.white} (primitive); primitive não referencia nada",
  ]);
});

test("referência a token inexistente reprova", () => {
  const violations = checkReferences([
    token({ path: "color.surface", layer: "semantic", value: "{color.nope}" }),
  ]);
  expect(violations).toEqual([
    "color.surface (semantic) referencia {color.nope}, que não existe",
  ]);
});

// Tarefa 2.4 — valor literal só na camada primitiva.
test("nenhum token fora da camada primitiva tem valor literal", () => {
  expect(checkLiterals(source)).toEqual([]);
});

test("literal em token semântico reprova nomeando o token", () => {
  const violations = checkLiterals([
    token({ path: "color.white", layer: "primitive", value: white }),
    token({
      path: "color.surface",
      layer: "semantic",
      value: white,
      theme: "light",
    }),
    token({
      path: "space.inset",
      layer: "semantic",
      value: { value: 4, unit: "px" },
      type: "dimension",
    }),
  ]);
  expect(violations).toEqual([
    'color.surface [light] (semantic) tem valor literal: {"colorSpace":"srgb","components":[1,1,1],"hex":"#FFFFFF"}',
    'space.inset (semantic) tem valor literal: {"value":4,"unit":"px"}',
  ]);
});

// Tarefa 3.2 — todo token com tema existe nos dois temas.
test("todo token com tema está definido no claro e no escuro", () => {
  expect(checkThemeCompleteness(source)).toEqual([]);
});

test("token presente num tema e ausente no outro reprova nomeando o token e o tema", () => {
  const violations = checkThemeCompleteness([
    token({
      path: "color.surface",
      layer: "semantic",
      value: "{color.white}",
      theme: "light",
    }),
    token({
      path: "color.surface",
      layer: "semantic",
      value: "{color.gray.950}",
      theme: "dark",
    }),
    token({
      path: "color.extra",
      layer: "semantic",
      value: "{color.white}",
      theme: "light",
    }),
  ]);
  expect(violations).toEqual([
    "color.extra definido em light e ausente em dark",
  ]);
});

test("o mesmo token definido num arquivo de tema e num arquivo compartilhado reprova", () => {
  const violations = checkReferences([
    token({ path: "color.white", layer: "primitive", value: white }),
    token({
      path: "color.surface",
      layer: "semantic",
      value: "{color.white}",
      file: "semantic/shared.json",
    }),
    token({
      path: "color.surface",
      layer: "semantic",
      value: "{color.white}",
      theme: "light",
      file: "semantic/light.json",
    }),
  ]);
  expect(violations).toEqual([
    "color.surface definido em semantic/shared.json e em semantic/light.json",
  ]);
});

// Tarefa 5.1 — família tipográfica declarada uma vez, na camada primitiva.
test("a família tipográfica é declarada uma única vez, na camada primitiva", () => {
  expect(checkFontFamily(source)).toEqual([]);
});

test("família declarada fora da camada primitiva reprova nomeando o token", () => {
  const violations = checkFontFamily([
    token({
      path: "font.family.sans",
      layer: "primitive",
      value: ["Inter", "sans-serif"],
      type: "fontFamily",
    }),
    token({
      path: "text.body.family",
      layer: "semantic",
      value: "Inter",
      type: "fontFamily",
    }),
  ]);
  expect(violations).toEqual([
    'text.body.family (semantic) declara família tipográfica: "Inter"',
  ]);
});

test("família de referência em outra camada não conta como declaração", () => {
  const violations = checkFontFamily([
    token({
      path: "font.family.sans",
      layer: "primitive",
      value: ["Inter", "sans-serif"],
      type: "fontFamily",
    }),
    token({
      path: "text.body.family",
      layer: "semantic",
      value: "{font.family.sans}",
      type: "fontFamily",
    }),
  ]);
  expect(violations).toEqual([]);
});

test("Alumni Sans não pode permanecer em token algum", () => {
  const violations = checkFontFamily([
    token({
      path: "font.family.sans",
      layer: "primitive",
      value: ["Alumni Sans", "sans-serif"],
      type: "fontFamily",
    }),
  ]);
  expect(violations).toEqual(["font.family.sans referencia Alumni Sans"]);
});
