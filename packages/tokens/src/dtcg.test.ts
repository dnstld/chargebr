import { expect, test } from "vitest";
import { validateDtcg } from "./dtcg.js";
import { listSourceFiles, readJson } from "./source.js";

// Tarefa 1.1 — a fonte é válida no formato DTCG.
test("todo arquivo da fonte é válido no formato DTCG", () => {
  const files = listSourceFiles();
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    expect(validateDtcg(readJson(file.path), file.file)).toEqual([]);
  }
});

// O validador precisa reprovar o que a especificação reprova; senão o teste
// acima não prova nada.
test("o validador reprova token sem tipo, tipo desconhecido e nome inválido", () => {
  const problems = validateDtcg(
    {
      a: { $value: 1 },
      b: { $type: "opacity", $value: 0.5 },
      "c.d": { $type: "number", $value: 1 },
    },
    "fixture.json",
  );
  expect(problems).toEqual([
    'fixture.json › (raiz): nome "c.d" não pode conter chaves nem ponto',
    "fixture.json › a: token sem $type próprio nem herdado",
    'fixture.json › b: $type desconhecido: "opacity"',
  ]);
});

test("o validador reprova cor cujo hex não corresponde aos componentes", () => {
  const problems = validateDtcg(
    {
      color: {
        $type: "color",
        x: {
          $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#000000" },
        },
      },
    },
    "fixture.json",
  );
  expect(problems).toEqual([
    "fixture.json › color.x: hex #000000 não corresponde a components (#ffffff)",
  ]);
});

test("o validador aceita referência e reprova referência malformada", () => {
  const ok = validateDtcg(
    { color: { $type: "color", x: { $value: "{color.y}" } } },
    "fixture.json",
  );
  expect(ok).toEqual([]);
  const bad = validateDtcg(
    { color: { $type: "color", x: { $value: "{color.y" } } },
    "fixture.json",
  );
  expect(bad).toEqual([
    "fixture.json › color.x: referência malformada: {color.y",
  ]);
});
