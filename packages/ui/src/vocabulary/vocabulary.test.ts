import { expect, test } from "vitest";
import { STATUS_AXES, STATUSES } from "../atoms/status-marker/status-marker";
import { VALUE_ROLES } from "../atoms/value-role";
import { BLOCK_REASONS } from "../domain/block-reason";
import { resolveTerms, VOCABULARY } from "./vocabulary";

// O vocabulário cobre tudo que a biblioteca enumera: eixos, estados, papéis
// e razões. A comparação é por valor em tempo de execução, a mesma leitura
// que as primitivas fazem; o tipo já exige isso, e o teste impede que uma
// enumeração cresça sem termo.
test("o vocabulário tem um termo para cada eixo, estado, papel e razão", () => {
  expect(Object.keys(VOCABULARY.axis).sort()).toEqual(
    Object.keys(STATUS_AXES).sort(),
  );
  expect(Object.keys(VOCABULARY.status).sort()).toEqual([...STATUSES].sort());
  expect(Object.keys(VOCABULARY.valueRole).sort()).toEqual(
    [...VALUE_ROLES].sort(),
  );
  expect(Object.keys(VOCABULARY.blockReason).sort()).toEqual(
    [...BLOCK_REASONS].sort(),
  );
});

test("nenhum termo é vazio e nenhum termo de razão contém dígito", () => {
  for (const group of Object.values(VOCABULARY)) {
    for (const term of Object.values(group)) {
      expect(term.trim().length).toBeGreaterThan(0);
    }
  }
  // Razão de bloqueio vira conteúdo da projeção bloqueada, que não pode
  // exibir nada que se leia como número.
  for (const term of Object.values(VOCABULARY.blockReason)) {
    expect(term).not.toMatch(/\d/);
  }
  expect(VOCABULARY.absence.blockedProjection).not.toMatch(/\d/);
});

test("um termo fornecido substitui o padrão e os demais permanecem", () => {
  const terms = resolveTerms({ status: { confirmed: "Confirmada" } });
  expect(terms.status.confirmed).toBe("Confirmada");
  expect(terms.status.corroborated).toBe(VOCABULARY.status.corroborated);
  expect(terms.axis).toEqual(VOCABULARY.axis);
});

test("sem sobrescrita, os termos resolvidos são o vocabulário", () => {
  expect(resolveTerms()).toEqual(VOCABULARY);
  expect(resolveTerms({})).toEqual(VOCABULARY);
});
