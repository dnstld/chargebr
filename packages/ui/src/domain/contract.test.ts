import { expect, test } from "vitest";
import { definePrimitive } from "./contract";
import { PRIMITIVES } from "./index";

// Como nos átomos: os estados de cada primitiva são valor enumerável, lido em
// tempo de execução, e é essa leitura que a cobertura de histórias usa.
test("cada primitiva expõe seus estados como valor enumerável", () => {
  const declared = Object.fromEntries(
    PRIMITIVES.map((primitive) => [primitive.name, [...primitive.states]]),
  );

  expect(declared).toEqual({
    ValueWithProvenance: ["primary", "counterfactual", "context"],
    BlockedProjection: [
      "metric_not_found",
      "scope_mismatch",
      "methodology_missing",
      "methodology_cycle",
      "current_methodology_not_unique",
      "primary_value_not_unique",
      "value_method_mismatch",
      "primary_outside_applicability",
      "provenance_incomplete",
      "unsupported_value_origin",
      "components_incomplete",
      "unexpected_cardinality",
    ],
    StatusPanel: ["all_valued", "axis_unvalued"],
  });
});

test("o contrato é imutável e liga a primitiva ao seu componente", () => {
  const names = PRIMITIVES.map((primitive) => primitive.name);
  expect(new Set(names).size).toBe(names.length);
  for (const primitive of PRIMITIVES) {
    expect(Object.isFrozen(primitive)).toBe(true);
    expect(Object.isFrozen(primitive.states)).toBe(true);
    expect(typeof primitive.component).toBe("function");
  }
});

test("estado declarado duas vezes é recusado ao definir o contrato", () => {
  expect(() =>
    definePrimitive({
      name: "Duplicada",
      component: () => null,
      states: ["a", "a"],
    }),
  ).toThrow('Primitiva Duplicada declara o estado "a" duas vezes');
});
