import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import {
  NAV_EXEMPT,
  NAV_GRAPHIC_PAIRS,
  NAV_SURFACES,
  NAV_TEXT_PAIRS,
} from "../../packages/tokens/src/nav-pairs";

// Raiz do repositório, a partir da localização deste arquivo (tools/checks/).
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Par declarado aponta para adjacência que existe no código: o token que um par
// usa como **fundo** precisa ser consumido como `background` em algum
// componente — nunca só como borda.
//
// A regra nasceu de um defeito medido: `color.nav.edge` estava declarado como
// superfície e os cinco usos dele são borda. Nada é pintado por cima de uma
// borda, então todo par contra ela era adjacência que não acontece na tela. O
// erro passou despercebido porque `edge` e `hover` são o mesmo cinza — os
// números saíam certos, medindo a coisa errada, e o par que de fato limita a
// moldura não estava declarado. Se os dois tons se separarem um dia, esta
// checagem é o que impede a lista de continuar verde medindo a borda.
//
// A cor de um token só vale como prova de adjacência quando um componente a
// pinta como fundo; por isso a varredura é sobre o CSS entregue, e não sobre a
// fonte de tokens.
//
// Dois limites medidos desta varredura, nenhum deles com ocorrência hoje:
//
// 1. O ponto fixo de aliases adota qualquer custom property cujo valor cite um
//    alias conhecido, seja qual for a propriedade em que ele aparece. Se um dia
//    uma custom property usar um token da moldura dentro de uma sombra composta
//    (`box-shadow`) e outra pintar fundo com ela, a varredura contará como
//    fundo o que é sombra. É falso positivo permissivo — passa o que deveria
//    reprovar —, e a correção, quando houver caso, é classificar o alias pela
//    propriedade em que ele é consumido, não só pelo nome.
// 2. `BACKGROUND_PROPERTY` casa `background` e `background-color`, e nada mais.
//    Um fundo pintado por `background-image: linear-gradient(...)` passaria por
//    "não consumido como fundo" e reprovaria um par legítimo. É falso positivo
//    restritivo — reprova o que deveria passar —, e a correção é acrescentar a
//    propriedade à expressão quando o primeiro gradiente existir.

const UI_STYLES = join(ROOT, "packages/ui/src");
const COMPONENT_TOKENS = join(ROOT, "packages/tokens/tokens/component");
const SKIPPED_DIRS = new Set(["node_modules", ".next", "storybook-static"]);

const BACKGROUND_PROPERTY = /^background(-color)?$/;
const BORDER_PROPERTY = /^border(-|$)/;

function cssFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIPPED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) cssFiles(full, found);
    else if (full.endsWith(".module.css")) found.push(full);
  }
  return found;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Caminho DTCG de cada token de componente e o que ele referencia, achatado:
// `nav-leaf.background-hover` → `{color.nav.hover}`.
function componentReferences(): Map<string, string> {
  const references = new Map<string, string>();
  const walk = (node: Record<string, unknown>, prefix: string[]): void => {
    if ("$value" in node) {
      const value = node.$value;
      if (typeof value === "string") references.set(prefix.join("-"), value);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$") || !isRecord(child)) continue;
      walk(child, [...prefix, key]);
    }
  };
  for (const entry of readdirSync(COMPONENT_TOKENS)) {
    if (!entry.endsWith(".json")) continue;
    const parsed: unknown = JSON.parse(
      readFileSync(join(COMPONENT_TOKENS, entry), "utf8"),
    );
    if (isRecord(parsed)) walk(parsed, []);
  }
  return references;
}

// Declarações CSS do pacote de interface, com comentário removido, uma vez só.
interface Declaration {
  file: string;
  property: string;
  value: string;
}

let declarationCache: Declaration[] | null = null;

function declarations(): Declaration[] {
  if (declarationCache !== null) return declarationCache;
  const found: Declaration[] = [];
  const pattern = /([a-z-]+)\s*:\s*([^;{}]+);/gi;
  for (const file of cssFiles(UI_STYLES)) {
    const text = readFileSync(file, "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      (match) => match.replace(/[^\n]/g, " "),
    );
    for (const match of text.matchAll(pattern)) {
      const [, property = "", value = ""] = match;
      found.push({ file: file.slice(ROOT.length), property, value });
    }
  }
  declarationCache = found;
  return found;
}

// Nomes que resolvem para um token da moldura, seguindo a cadeia inteira de
// repasse: a semântica, os tokens de componente que a referenciam, e as custom
// properties que um componente de família redefine a partir deles
// (`--link-background: var(--nav-leaf-current-background)`). Sem fechar essa
// cadeia, um fundo pintado pela primitiva de base — que é o caso de Link e de
// Button — passaria por "não consumido".
function aliasesOf(navToken: string): string[] {
  const dtcgPath = navToken.replace(/^color-nav-/, "color.nav.");
  const aliases = new Set<string>([`--${navToken}`]);
  for (const [path, value] of componentReferences()) {
    if (value === `{${dtcgPath}}`) aliases.add(`--${path}`);
  }
  // Ponto fixo: toda custom property cujo valor cita um alias conhecido também
  // é alias. Para em uma passada sem novidade.
  for (;;) {
    const before = aliases.size;
    for (const { property, value } of declarations()) {
      if (!property.startsWith("--")) continue;
      if (aliases.has(property)) continue;
      if ([...aliases].some((alias) => value.includes(`var(${alias})`))) {
        aliases.add(property);
      }
    }
    if (aliases.size === before) break;
  }
  return [...aliases];
}

interface Usage {
  background: string[];
  border: string[];
}

function usageOf(navToken: string): Usage {
  const aliases = aliasesOf(navToken);
  const usage: Usage = { background: [], border: [] };
  for (const { file, property, value } of declarations()) {
    // Declaração de custom property é repasse, não consumo: ela já entrou na
    // cadeia de aliases acima.
    if (property.startsWith("--")) continue;
    if (!aliases.some((alias) => value.includes(`var(${alias})`))) continue;
    const where = `${file} — ${property}`;
    if (BACKGROUND_PROPERTY.test(property)) usage.background.push(where);
    else if (BORDER_PROPERTY.test(property)) usage.border.push(where);
  }
  return usage;
}

function declaredBackgrounds(): string[] {
  return [
    ...new Set([
      ...NAV_SURFACES,
      ...NAV_TEXT_PAIRS.flatMap(([, backgrounds]) => backgrounds),
      ...NAV_GRAPHIC_PAIRS.flatMap(([, backgrounds]) => backgrounds),
    ]),
  ].sort();
}

test("todo fundo de par declarado é pintado como fundo por algum componente", () => {
  const violations = declaredBackgrounds().flatMap((token) => {
    const usage = usageOf(token);
    if (usage.background.length > 0) return [];
    const onlyBorder =
      usage.border.length > 0
        ? ` — consumido só como borda em ${usage.border.join(", ")}`
        : " — não consumido em nenhum componente";
    return [`${token} é fundo de par declarado e nunca é pintado como fundo${onlyBorder}`];
  });
  expect(violations).toEqual([]);
});

test("token isento é divisor de verdade: borda em algum lugar, fundo em nenhum", () => {
  const violations = Object.keys(NAV_EXEMPT).flatMap((token) => {
    const usage = usageOf(token);
    const problems: string[] = [];
    if (usage.background.length > 0) {
      problems.push(
        `${token} está isento como divisor, mas é pintado como fundo em ${usage.background.join(", ")}`,
      );
    }
    if (usage.border.length === 0) {
      problems.push(
        `${token} está isento como divisor e não é borda em lugar nenhum`,
      );
    }
    return problems;
  });
  expect(violations).toEqual([]);
});

test("a varredura enxerga o consumo real, e não uma lista escrita aqui", () => {
  // Sem esta afirmação, um erro de resolução de alias — o segundo salto, do
  // token de componente para o semântico — faria as duas provas acima passarem
  // por não encontrar consumo nenhum.
  const hover = usageOf("color-nav-hover");
  expect(hover.background.length).toBeGreaterThan(0);
  const edge = usageOf("color-nav-edge");
  expect(edge.border.length).toBe(5);
  expect(edge.background).toEqual([]);
});
