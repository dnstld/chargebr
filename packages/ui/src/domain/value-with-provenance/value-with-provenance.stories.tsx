import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { expectRolesDistinctWithoutColor } from "../../atoms/value-role.assert";
import { accessibleNameFromContent } from "../../bench/accessible-name";
import { VOCABULARY } from "../../vocabulary/vocabulary";
import {
  expectEveryTermFromVocabulary,
  markEveryTerm,
} from "../../vocabulary/vocabulary.assert";
import {
  AS_PUBLISHED,
  CURRENT_METHODOLOGY,
} from "../fixtures/abve-janeiro-2025";
import { ValueWithProvenance } from "./value-with-provenance";

const meta = {
  title: "Primitivas de domínio/Valor com proveniência",
  component: ValueWithProvenance,
  // Os argumentos de história se somam aos daqui: o padrão é só o principal,
  // e cada história acrescenta as posições que exercita.
  args: CURRENT_METHODOLOGY,
} satisfies Meta<typeof ValueWithProvenance>;

export default meta;

type Story = StoryObj<typeof meta>;

function slot(canvasElement: HTMLElement, name: string): HTMLElement {
  const found = canvasElement.querySelector<HTMLElement>(
    `[data-slot="${name}"]`,
  );
  if (found === null) throw new Error(`posição "${name}" não renderizada`);
  return found;
}

function valueIn(slotElement: HTMLElement): HTMLElement {
  const found = slotElement.querySelector<HTMLElement>("[data-value-role]");
  if (found === null) throw new Error("posição sem valor renderizado");
  return found;
}

const FORMAT = new Intl.NumberFormat("pt-BR");

// Só o principal, como a projeção da metodologia vigente entrega: um número
// e o caminho até sua evidência, sem as outras posições.
export const MetodologiaVigente: Story = {
  name: "Metodologia vigente",
  tags: ["state:primary"],
  play: async ({ canvas, canvasElement, args }) => {
    await expect(valueIn(slot(canvasElement, "primary")).textContent).toBe(
      FORMAT.format(args.primary.value),
    );
    await expect(
      canvasElement.querySelector('[data-slot="counterfactual"]'),
    ).toBeNull();
    await expect(
      canvasElement.querySelector('[data-slot="context"]'),
    ).toBeNull();
    const anchor = canvas.getByRole("link", {
      name: args.primary.evidence.label,
    });
    await expect(anchor.getAttribute("href")).toBe(args.primary.evidence.href);
  },
};

// Os três papéis, como publicados. Contrafactual e principal ocupam
// posições distintas — o contrafactual fica inteiro abaixo do principal — e
// diferem em propriedade computada que não é cor.
export const ComoPublicado: Story = {
  name: "Como publicado",
  tags: ["state:primary", "state:counterfactual", "state:context"],
  args: AS_PUBLISHED,
  play: async ({ canvasElement }) => {
    const primary = slot(canvasElement, "primary");
    const counterfactual = slot(canvasElement, "counterfactual");
    const context = slot(canvasElement, "context");

    const primaryBox = primary.getBoundingClientRect();
    const counterfactualBox = counterfactual.getBoundingClientRect();
    const contextBox = context.getBoundingClientRect();
    await expect(counterfactualBox.top).toBeGreaterThanOrEqual(
      primaryBox.bottom,
    );
    await expect(contextBox.top).toBeGreaterThanOrEqual(
      counterfactualBox.bottom,
    );

    await expectRolesDistinctWithoutColor({
      primary: valueIn(primary),
      counterfactual: valueIn(counterfactual),
      context: valueIn(context),
    });

    // O papel entra no nome acessível de cada posição, antes do valor.
    await expect(accessibleNameFromContent(primary)).toMatch(
      new RegExp(`^${VOCABULARY.valueRole.primary}: `),
    );
    await expect(accessibleNameFromContent(counterfactual)).toMatch(
      new RegExp(`^${VOCABULARY.valueRole.counterfactual}: `),
    );
    await expect(accessibleNameFromContent(context)).toMatch(
      new RegExp(`^${VOCABULARY.valueRole.context}: `),
    );
  },
};

// O caminho até a evidência é alcançável por teclado: um Tab a partir da
// página chega nele, e o elemento focado tem o nome que identifica a
// evidência. Com as três posições, os três caminhos vêm na ordem dos papéis.
export const ProvenienciaPeloTeclado: Story = {
  name: "Proveniência pelo teclado",
  tags: ["state:primary", "state:counterfactual", "state:context"],
  args: AS_PUBLISHED,
  play: async ({ args }) => {
    const paths = [args.primary, args.counterfactual, args.context].flatMap(
      (item) => (item ? [item.evidence] : []),
    );
    await expect(paths).toHaveLength(3);
    const slots = ["primary", "counterfactual", "context"];
    for (const [index, evidence] of paths.entries()) {
      await userEvent.tab();
      const focused = document.activeElement;
      if (!(focused instanceof HTMLElement)) {
        throw new Error("nada recebeu foco");
      }
      await expect(focused.tagName).toBe("A");
      await expect(focused.getAttribute("href")).toBe(evidence.href);
      await expect(accessibleNameFromContent(focused)).toBe(evidence.label);
      await expect(
        focused.closest("[data-slot]")?.getAttribute("data-slot"),
      ).toBe(slots[index]);
    }
  },
};

// Todo termo exibido sai do vocabulário: com cada termo marcado, o que
// aparece sem marca é só o que veio por propriedade — números e caminhos.
export const TermosDoVocabulario: Story = {
  name: "Termos vêm do vocabulário",
  tags: ["state:primary", "state:counterfactual", "state:context"],
  args: { ...AS_PUBLISHED, terms: markEveryTerm() },
  play: async ({ canvasElement, args }) => {
    const supplied = [args.primary, args.counterfactual, args.context].flatMap(
      (item) =>
        item
          ? [
              "value" in item ? FORMAT.format(item.value) : item.text,
              item.evidence.label,
            ]
          : [],
    );
    await expectEveryTermFromVocabulary(canvasElement, supplied);
  },
};

// Termo sobrescrito por propriedade: o fornecido aparece, o padrão não.
export const TermoSobrescrito: Story = {
  name: "Termo sobrescrito",
  tags: ["state:primary"],
  args: {
    ...CURRENT_METHODOLOGY,
    terms: { valueRole: { primary: "Resultado principal" } },
  },
  play: async ({ canvasElement }) => {
    const name = accessibleNameFromContent(slot(canvasElement, "primary"));
    await expect(name.startsWith("Resultado principal: ")).toBe(true);
    await expect(name.startsWith(`${VOCABULARY.valueRole.primary}: `)).toBe(
      false,
    );
  },
};
