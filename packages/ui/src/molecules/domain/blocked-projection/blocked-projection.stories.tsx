import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { accessibleNameFromContent } from "../../../bench/accessible-name";
import { VOCABULARY } from "../../../vocabulary/vocabulary";
import {
  expectEveryTermFromVocabulary,
  markEveryTerm,
} from "../../../vocabulary/vocabulary.assert";
import { BLOCK_REASONS } from "../../../domain/block-reason";
import { BLOCKED_TRIALS } from "../../../domain/fixtures/abve-janeiro-2025";
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
  play: async ({ canvasElement, args }) => {
    await expectReasonsAndNoDigits(canvasElement, args.reasons);
  },
};

export const MetricaAusente: Story = {
  name: "Métrica ausente",
  args: BLOCKED_TRIALS.metricNotFound,
  play: async ({ canvasElement, args }) => {
    await expectReasonsAndNoDigits(canvasElement, args.reasons);
  },
};

export const MetodologiaVigenteAmbigua: Story = {
  name: "Metodologia vigente ambígua",
  args: BLOCKED_TRIALS.ambiguousCurrentMethodology,
  play: async ({ canvasElement, args }) => {
    await expectReasonsAndNoDigits(canvasElement, args.reasons);
  },
};

// Catálogo: toda razão que a biblioteca enumera, com seu termo. Exercitada
// inteira para que nenhuma razão fique sem história.
export const TodasAsRazoes: Story = {
  name: "Todas as razões",
  args: { reasons: BLOCK_REASONS },
  play: async ({ canvasElement }) => {
    await expectReasonsAndNoDigits(canvasElement, BLOCK_REASONS);
  },
};

export const TermosDoVocabulario: Story = {
  name: "Termos vêm do vocabulário",
  args: { ...BLOCKED_TRIALS.provenanceIncomplete, terms: markEveryTerm() },
  play: async ({ canvasElement }) => {
    await expectEveryTermFromVocabulary(root(canvasElement), []);
  },
};

export const TermoSobrescrito: Story = {
  name: "Termo sobrescrito",
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
