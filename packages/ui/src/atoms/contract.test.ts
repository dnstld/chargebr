import { expect, test } from "vitest";
import { defineAtom } from "./contract";
import { ATOMS } from "./index";

// A enumeração é legível por código: o que segue lê os estados de cada átomo
// em tempo de execução, sem inspecionar tipo nem comentário. É a mesma leitura
// que a cobertura de histórias faz.
test("cada átomo expõe seus estados como valor enumerável", () => {
  const declared = Object.fromEntries(
    ATOMS.map((atom) => [atom.name, [...atom.states]]),
  );

  expect(declared).toEqual({
    Text: ["primary", "counterfactual", "context"],
    NumericValue: ["primary", "counterfactual", "context"],
    Hatch: [],
    StatusMarker: [
      "confirmed",
      "corroborated",
      "unverified",
      "accepted",
      "under_review",
      "candidate",
      "normalized",
      "not_attempted",
      "unresolved",
    ],
    DeclaredAbsence: ["blocked", "unknown"],
    EvidenceAnchor: ["idle", "hovered", "focus-visible"],
  });
});

test("o contrato é imutável e liga o átomo ao seu componente", () => {
  const names = ATOMS.map((atom) => atom.name);
  expect(new Set(names).size).toBe(names.length);
  for (const atom of ATOMS) {
    expect(Object.isFrozen(atom)).toBe(true);
    expect(Object.isFrozen(atom.states)).toBe(true);
    expect(typeof atom.component).toBe("function");
  }
});

test("estado declarado duas vezes é recusado ao definir o contrato", () => {
  expect(() =>
    defineAtom({
      name: "Duplicado",
      component: () => null,
      states: ["a", "a"],
    }),
  ).toThrow('Átomo Duplicado declara o estado "a" duas vezes');
});
