import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { parse } from "yaml";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const CONFIG = "openspec/config.yaml";

// As seções de `rules` que este guardião declara, com a contagem esperada de
// entradas de cada uma. A contagem é declarada, e não derivada do arquivo, de
// propósito: derivada, uma regra apagada mudaria o esperado junto com o lido e a
// comparação passaria sempre. Declarada, ela obriga quem acrescenta ou remove
// uma regra a dizer isso na mesma mudança.
const EXPECTED_COUNTS: Record<string, number> = {
  proposal: 2,
  specs: 8,
  design: 11,
  tasks: 2,
};

const DECLARED_SECTIONS = Object.keys(EXPECTED_COUNTS);

// Nenhuma prova deste arquivo pula quando não encontra o que procura: um arquivo
// ilegível faz todas reprovarem, cada uma nomeando o que procurava e onde. Pular
// transformaria a quebra em silêncio, que é o defeito que este guardião existe
// para fechar.
function readRules(procurava: string): Record<string, unknown> {
  const path = join(ROOT, CONFIG);
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    expect.fail(`${CONFIG} não pôde ser lido (${procurava}) — ${detail}`);
  }
  let parsed: unknown;
  try {
    parsed = parse(raw);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    expect.fail(
      `${CONFIG} não parseia (${procurava}) — ${detail.split("\n")[0]}`,
    );
  }
  if (parsed === null || typeof parsed !== "object") {
    expect.fail(`${CONFIG} não descreve um objeto (${procurava})`);
  }
  const rules = (parsed as Record<string, unknown>).rules;
  if (rules === null || typeof rules !== "object" || Array.isArray(rules)) {
    expect.fail(`${CONFIG} não tem a seção \`rules\` (${procurava})`);
  }
  return rules as Record<string, unknown>;
}

test("o arquivo de regras do projeto parseia", () => {
  const rules = readRules("a seção `rules`");
  expect(Object.keys(rules).length).toBeGreaterThan(0);
});

test("as seções declaradas são as mesmas que o arquivo tem", () => {
  const found = Object.keys(readRules("as seções de `rules`"));
  const violations = [
    ...found
      .filter((section) => !DECLARED_SECTIONS.includes(section))
      .map(
        (section) => `${section} — está em ${CONFIG} e este guardião não a declara`,
      ),
    ...DECLARED_SECTIONS.filter((section) => !found.includes(section)).map(
      (section) => `${section} — declarada neste guardião e ausente de ${CONFIG}`,
    ),
  ];
  expect(violations).toEqual([]);
});

test("nenhuma seção de regras está vazia", () => {
  const rules = readRules("as entradas de cada seção de `rules`");
  const violations = DECLARED_SECTIONS.flatMap((section) => {
    const value = rules[section];
    if (!Array.isArray(value)) {
      return [`${section} — ausente ou não é uma lista de entradas`];
    }
    return value.length === 0 ? [`${section} — sem nenhuma entrada`] : [];
  });
  expect(violations).toEqual([]);
});

// Uma entrada vazia ou só com espaço conta e não deixa a seção vazia, de modo que
// passa pelas duas provas acima: é ausência vestida de presença. Recusá-la é
// verificar presença, não julgar redação — este guardião não lê o conteúdo de
// nenhuma regra.
test("nenhuma entrada de regra é vazia ou só espaço", () => {
  const rules = readRules("o conteúdo de cada entrada de `rules`");
  const violations = DECLARED_SECTIONS.flatMap((section) => {
    const value = rules[section];
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry, index) =>
      typeof entry !== "string" || entry.trim().length === 0
        ? [`${section}[${index}] — entrada vazia ou só espaço`]
        : [],
    );
  });
  expect(violations).toEqual([]);
});

test("a contagem de cada seção bate com a declarada", () => {
  const rules = readRules("a contagem de entradas de cada seção de `rules`");
  const violations = Object.entries(EXPECTED_COUNTS).flatMap(
    ([section, expected]) => {
      const value = rules[section];
      const read = Array.isArray(value) ? value.length : 0;
      return read === expected
        ? []
        : [`${section} — esperado ${expected}, lido ${read}`];
    },
  );
  expect(violations).toEqual([]);
});
