import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const CHANGES_DIR = join(ROOT, "openspec/changes");
const ARCHIVE_DIR = join(CHANGES_DIR, "archive");
const PONTOS_ABERTOS = join(ROOT, "docs/pontos-abertos.md");

const ARTIFACTS = ["proposal.md", "design.md", "tasks.md"];
const CHECKBOX_LINE = /^\s*-\s\[([ xX])\]/;

// Mudança ativa: diretório de primeiro nível sob openspec/changes/, exceto
// "archive". `openspec validate --strict` aprova uma mudança sem design.md
// nem tasks.md (docs/pontos-abertos.md, ponto 17); este guardião é o
// substituto que este repositório controla.
function activeChanges(): string[] {
  let entries: string[];
  try {
    entries = readdirSync(CHANGES_DIR);
  } catch {
    return []; // openspec/changes/ ainda não existe
  }
  return entries
    .filter((entry) => entry !== "archive")
    .filter((entry) => statSync(join(CHANGES_DIR, entry)).isDirectory())
    .map((entry) => join(CHANGES_DIR, entry));
}

function missingArtifacts(change: string): string[] {
  return ARTIFACTS.filter((artifact) => !existsSync(join(change, artifact)));
}

// Sem nenhuma linha de checkbox, não há o que significar "concluída" — a
// mudança não é julgada por este critério.
function tasksAllChecked(change: string): boolean {
  const tasksPath = join(change, "tasks.md");
  if (!existsSync(tasksPath)) return false;
  const lines = readFileSync(tasksPath, "utf8").split("\n");
  const checkboxes = lines
    .map((line) => line.match(CHECKBOX_LINE))
    .filter((match): match is RegExpMatchArray => match !== null);
  if (checkboxes.length === 0) return false;
  return checkboxes.every((match) => match[1].toLowerCase() === "x");
}

function relativeToRoot(path: string): string {
  return path.slice(ROOT.length);
}

test("mudança ativa tem os três artefatos de planejamento", () => {
  const violations = activeChanges().flatMap((change) => {
    const missing = missingArtifacts(change);
    return missing.length > 0
      ? [`${relativeToRoot(change)} — falta ${missing.join(", ")}`]
      : [];
  });
  expect(violations).toEqual([]);
});

test("mudança ativa não tem todas as tarefas concluídas", () => {
  const violations = activeChanges()
    .filter((change) => tasksAllChecked(change))
    .map(
      (change) =>
        `${relativeToRoot(change)} — tarefas concluídas, mudança não arquivada`,
    );
  expect(violations).toEqual([]);
});

// Terceiro cheque: uma mudança arquivada cujo proposal.md declara fechar um
// ponto de docs/pontos-abertos.md, mas o registro ainda lista esse número
// como aberto — o defeito que o ponto 5 desta proposta expôs. Ao contrário
// do ponto 16 (intenção de um teste, não mecanizável), isto é comparação
// entre duas listas que já existem por escrito.
//
// Padrão textual medido nas 14 mudanças arquivadas: "fecha" seguido, a
// poucos caracteres, de "ponto"/"pontos", com os números do fechamento nos
// caracteres seguintes — "Fecha o ponto 5 de `docs/pontos-abertos.md`.",
// "fecha os pontos 4 e 11 citando este", "fecha os pontos 2 e 3, abre dois,",
// "Fecha o ponto aberto 7 de `docs/pontos-abertos.md`". Um padrão de
// declaração muito diferente destes quatro escapa deste guardião — lacuna
// aceita, sem exemplo real hoje.
const CLOSES_POINT = /fecha\b[^\n]{0,15}?pontos?\b/gi;
// "não"/"nem" logo antes de "fecha" é negação — "nem fecha o ponto 4" declara
// o oposto de um fechamento. Medido em `dynamic-route-readiness`.
const NEGATION_BEFORE = /\b(não|nem)\s*$/i;

function declaredClosedPoints(proposalText: string): number[] {
  const found: number[] = [];
  for (const match of proposalText.matchAll(CLOSES_POINT)) {
    const start = match.index ?? 0;
    const before = proposalText.slice(Math.max(0, start - 12), start);
    if (NEGATION_BEFORE.test(before)) continue;
    // Só o resto da mesma linha: uma janela de caracteres fixa cruzava para
    // um item de lista numerada não relacionado na linha seguinte ("1)"),
    // medido no mesmo change.
    const afterStart = start + match[0].length;
    const restOfLine = proposalText.slice(afterStart).split("\n")[0] ?? "";
    for (const digits of restOfLine.match(/\d+/g) ?? []) {
      found.push(Number(digits));
    }
  }
  return found;
}

// Números de ponto ainda abertos: cabeçalhos "## N." antes da seção
// "## Fechados".
function stillOpenPoints(pontosAbertosText: string): Set<number> {
  const closedIndex = pontosAbertosText.indexOf("## Fechados");
  const openSection =
    closedIndex === -1 ? pontosAbertosText : pontosAbertosText.slice(0, closedIndex);
  const numbers = new Set<number>();
  for (const match of openSection.matchAll(/^## (\d+)\./gm)) {
    numbers.add(Number(match[1]));
  }
  return numbers;
}

function archivedProposals(): string[] {
  let entries: string[];
  try {
    entries = readdirSync(ARCHIVE_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((entry) => statSync(join(ARCHIVE_DIR, entry)).isDirectory())
    .map((entry) => join(ARCHIVE_DIR, entry, "proposal.md"))
    .filter((path) => existsSync(path));
}

function registryViolations(): string[] {
  if (!existsSync(PONTOS_ABERTOS)) return [];
  const openPoints = stillOpenPoints(readFileSync(PONTOS_ABERTOS, "utf8"));
  return archivedProposals().flatMap((proposalPath) => {
    const text = readFileSync(proposalPath, "utf8");
    const declared = new Set(declaredClosedPoints(text));
    const changeName = relativeToRoot(proposalPath).replace(/\/proposal\.md$/, "");
    return [...declared]
      .filter((point) => openPoints.has(point))
      .map(
        (point) =>
          `${changeName} declara fechar o ponto ${point}, ainda aberto em docs/pontos-abertos.md`,
      );
  });
}

test("ponto declarado fechado por mudança arquivada não continua aberto no registro", () => {
  expect(registryViolations()).toEqual([]);
});
