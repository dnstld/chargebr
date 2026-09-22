import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { accessibleNameFromContent } from "../../bench/accessible-name";
import { VOCABULARY } from "../../vocabulary/vocabulary";
import {
  expectEveryTermFromVocabulary,
  markEveryTerm,
} from "../../vocabulary/vocabulary.assert";
import { BLOCK_REASONS } from "../block-reason";
import { BLOCKED_TRIALS } from "../fixtures/abve-janeiro-2025";
import { BlockedProjection } from "./blocked-projection";

const meta = {
  title: "Primitivas de domínio/Projeção bloqueada",
  component: BlockedProjection,
  args: BLOCKED_TRIALS.provenanceIncomplete,
} satisfies Meta<typeof BlockedProjection>;

export default meta;

type Story = StoryObj<typeof meta>;

function root(canvasElement: HTMLElement): HTMLElement {
  const found = canvasElement.querySelector<HTMLElement>(
    '[data-primitive="blocked-projection"]',
  );
  if (found === null) throw new Error("projeção bloqueada não renderizada");
  return found;
}

// Nenhum caractere numérico no conteúdo acessível: nem no texto, nem em
// rótulo ARIA — a primitiva não usa ARIA, e a prova confere isso também.
// A razão de cada bloqueio aparece, pelo termo do vocabulário.
async function expectReasonsAndNoDigits(
  canvasElement: HTMLElement,
  reasons: readonly string[],
): Promise<void> {
  const element = root(canvasElement);
  const content = accessibleNameFromContent(element);
  await expect(content).not.toMatch(/\d/);
  await expect(element.textContent ?? "").not.toMatch(/\d/);
  await expect(element.querySelectorAll("[aria-label]")).toHaveLength(0);
  await expect(content).toContain(VOCABULARY.absence.blockedProjection);

  const items = [...element.querySelectorAll<HTMLElement>("[data-reason]")];
  await expect(items.map((item) => item.getAttribute("data-reason"))).toEqual([
    ...reasons,
  ]);
  for (const item of items) {
    const reason = item.getAttribute(
      "data-reason",
    ) as keyof typeof VOCABULARY.blockReason;
    await expect(accessibleNameFromContent(item)).toBe(
      VOCABULARY.blockReason[reason],
    );
    await expect(item.querySelector('[data-kind="blocked"]')).not.toBeNull();
  }
}

export const ProvenienciaIncompleta: Story = {
  name: "Proveniência incompleta",
  tags: ["state:provenance_incomplete"],
  play: async ({ canvasElement, args }) => {
    await expectReasonsAndNoDigits(canvasElement, args.reasons);
  },
};

export const MetricaAusente: Story = {
  name: "Métrica ausente",
  tags: [
    "state:current_methodology_not_unique",
    "state:metric_not_found",
    "state:primary_value_not_unique",
    "state:unexpected_cardinality",
  ],
  args: BLOCKED_TRIALS.metricNotFound,
  play: async ({ canvasElement, args }) => {
    await expectReasonsAndNoDigits(canvasElement, args.reasons);
  },
};

export const MetodologiaVigenteAmbigua: Story = {
  name: "Metodologia vigente ambígua",
  tags: [
    "state:components_incomplete",
    "state:current_methodology_not_unique",
    "state:provenance_incomplete",
    "state:unexpected_cardinality",
  ],
  args: BLOCKED_TRIALS.ambiguousCurrentMethodology,
  play: async ({ canvasElement, args }) => {
    await expectReasonsAndNoDigits(canvasElement, args.reasons);
  },
};

// Catálogo: toda razão que a biblioteca enumera, com seu termo. Não é
// saída do contrato; é a enumeração, exercitada inteira para que nenhuma
// razão fique sem história. As tags são literais porque o indexador só lê
// literais; a prova confere que elas cobrem a enumeração inteira.
export const TodasAsRazoes: Story = {
  name: "Todas as razões",
  tags: [
    "state:metric_not_found",
    "state:scope_mismatch",
    "state:methodology_missing",
    "state:methodology_cycle",
    "state:current_methodology_not_unique",
    "state:primary_value_not_unique",
    "state:value_method_mismatch",
    "state:primary_outside_applicability",
    "state:provenance_incomplete",
    "state:unsupported_value_origin",
    "state:components_incomplete",
    "state:unexpected_cardinality",
  ],
  args: { reasons: BLOCK_REASONS },
  play: async ({ canvasElement }) => {
    await expect(TodasAsRazoes.tags).toEqual(
      BLOCK_REASONS.map((reason) => `state:${reason}`),
    );
    await expectReasonsAndNoDigits(canvasElement, BLOCK_REASONS);
  },
};

export const TermosDoVocabulario: Story = {
  name: "Termos vêm do vocabulário",
  tags: ["state:provenance_incomplete"],
  args: { ...BLOCKED_TRIALS.provenanceIncomplete, terms: markEveryTerm() },
  play: async ({ canvasElement }) => {
    await expectEveryTermFromVocabulary(root(canvasElement), []);
  },
};

export const TermoSobrescrito: Story = {
  name: "Termo sobrescrito",
  tags: ["state:provenance_incomplete"],
  args: {
    ...BLOCKED_TRIALS.provenanceIncomplete,
    terms: {
      blockReason: { provenance_incomplete: "Cadeia de evidência incompleta" },
    },
  },
  play: async ({ canvasElement }) => {
    const content = accessibleNameFromContent(root(canvasElement));
    await expect(content).toContain("Cadeia de evidência incompleta");
    await expect(content).not.toContain(
      VOCABULARY.blockReason.provenance_incomplete,
    );
    await expect(content).not.toMatch(/\d/);
  },
};
