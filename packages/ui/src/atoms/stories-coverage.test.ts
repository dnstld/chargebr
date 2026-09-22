/// <reference types="vite/client" />
import { expect, test } from "vitest";
import { PRIMITIVES } from "../domain/index";
import { type AtomContract, STATE_TAG_PREFIX } from "./contract";
import { ATOMS } from "./index";

// Todo estado declarado no contrato de um átomo ou de uma primitiva tem
// história. A comparação é por enumeração: os estados vêm do contrato (valor
// em tempo de execução), e as histórias vêm dos próprios módulos de história,
// ligadas ao componente pela identidade em `meta.component` e ao estado pela
// tag `state:<estado>`. Sem esta checagem, "todo estado tem história" é
// promessa que decai no terceiro átomo.
//
// As duas camadas entram na mesma lista: o contrato é o mesmo, e a varredura
// cobre src/ inteiro, não só este diretório.
const CONTRACTS: readonly AtomContract[] = [...ATOMS, ...PRIMITIVES];

interface StoryMeta {
  component?: unknown;
  tags?: readonly string[];
}

interface StoryModule {
  default?: StoryMeta;
  [storyExport: string]: unknown;
}

const storyModules = import.meta.glob<StoryModule>("../**/*.stories.tsx", {
  eager: true,
});

interface Coverage {
  /** Histórias do átomo, como `arquivo#Exportação`. */
  stories: string[];
  /** Estado → histórias que o exercitam. */
  byState: Map<string, string[]>;
}

function storyTags(meta: StoryMeta, story: unknown): readonly string[] {
  const own =
    typeof story === "object" && story !== null && "tags" in story
      ? ((story as { tags?: readonly string[] }).tags ?? [])
      : [];
  return [...(meta.tags ?? []), ...own];
}

function collectCoverage(): Map<unknown, Coverage> {
  const coverage = new Map<unknown, Coverage>();
  for (const [file, mod] of Object.entries(storyModules)) {
    const meta = mod.default;
    if (meta?.component === undefined) continue;
    const entry: Coverage = coverage.get(meta.component) ?? {
      stories: [],
      byState: new Map(),
    };
    coverage.set(meta.component, entry);
    for (const [exportName, story] of Object.entries(mod)) {
      if (
        exportName === "default" ||
        typeof story !== "object" ||
        story === null
      )
        continue;
      const storyId = `${file}#${exportName}`;
      entry.stories.push(storyId);
      for (const tag of storyTags(meta, story)) {
        if (!tag.startsWith(STATE_TAG_PREFIX)) continue;
        const state = tag.slice(STATE_TAG_PREFIX.length);
        entry.byState.set(state, [
          ...(entry.byState.get(state) ?? []),
          storyId,
        ]);
      }
    }
  }
  return coverage;
}

const coverage = collectCoverage();

function coverageOf(atom: AtomContract): Coverage {
  return coverage.get(atom.component) ?? { stories: [], byState: new Map() };
}

test("todo átomo e toda primitiva têm história", () => {
  const without = CONTRACTS.filter(
    (atom) => coverageOf(atom).stories.length === 0,
  ).map((atom) => atom.name);
  expect(without).toEqual([]);
});

test("todo estado declarado tem história", () => {
  const missing = CONTRACTS.flatMap((atom) =>
    atom.states
      .filter((state) => !coverageOf(atom).byState.has(state))
      .map((state) => `${atom.name}: estado "${state}" sem história`),
  );
  expect(missing).toEqual([]);
});

test("toda tag de estado nomeia estado declarado pelo componente", () => {
  const unknown = CONTRACTS.flatMap((atom) => {
    const declared = new Set<string>(atom.states);
    return [...coverageOf(atom).byState.entries()]
      .filter(([state]) => !declared.has(state))
      .flatMap(([state, stories]) =>
        stories.map(
          (story) =>
            `${story}: "${STATE_TAG_PREFIX}${state}" não é estado de ${atom.name}`,
        ),
      );
  });
  expect(unknown).toEqual([]);
});
