import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  STATUS_AXES,
  type StatusAxis,
} from "../../atoms/status-marker/status-marker";
import { accessibleNameFromContent } from "../../bench/accessible-name";
import { VOCABULARY } from "../../vocabulary/vocabulary";
import {
  expectEveryTermFromVocabulary,
  markEveryTerm,
} from "../../vocabulary/vocabulary.assert";
import {
  STATUSES_FROM_CONTRACT,
  STATUSES_FROM_LOAD,
} from "../fixtures/abve-janeiro-2025";
import { StatusPanel } from "./status-panel";

const meta = {
  title: "Primitivas de domínio/Painel de estados",
  component: StatusPanel,
  args: { statuses: STATUSES_FROM_LOAD },
} satisfies Meta<typeof StatusPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

const AXES = Object.keys(STATUS_AXES) as readonly StatusAxis[];

function items(canvasElement: HTMLElement): HTMLElement[] {
  const panel = canvasElement.querySelector<HTMLElement>(
    '[data-primitive="status-panel"]',
  );
  if (panel === null) throw new Error("painel não renderizado");
  return [...panel.querySelectorAll<HTMLElement>(":scope > li")];
}

// Três itens, um por eixo, e o nome acessível de cada um contém o eixo. Os
// itens são localizados pelo nome, não pela ordem: é a leitura assistida
// que precisa distinguir os eixos.
async function expectThreeAxes(canvasElement: HTMLElement): Promise<void> {
  const found = items(canvasElement);
  await expect(found).toHaveLength(3);
  for (const axis of AXES) {
    const term = VOCABULARY.axis[axis];
    const named = found.filter((item) =>
      accessibleNameFromContent(item).startsWith(`${term}: `),
    );
    await expect(named, `item do eixo ${axis}`).toHaveLength(1);
    await expect(named[0]?.getAttribute("data-axis")).toBe(axis);
  }
}

export const TresEixosComValor: Story = {
  name: "Três eixos com valor",
  tags: ["state:all_valued"],
  play: async ({ canvasElement, args }) => {
    await expectThreeAxes(canvasElement);
    for (const item of items(canvasElement)) {
      const axis = item.getAttribute("data-axis") as StatusAxis;
      const status = args.statuses[axis];
      // O item é o marcador do ciclo 4, não uma reimplementação: o eixo e
      // o estado estão nos atributos que o átomo emite.
      const marker = item.querySelector<HTMLElement>(
        `[data-axis="${axis}"][data-status="${status}"]`,
      );
      await expect(marker).not.toBeNull();
      await expect(marker?.querySelector("[data-fill]")).not.toBeNull();
      await expect(accessibleNameFromContent(item)).toBe(
        `${VOCABULARY.axis[axis]}: ${VOCABULARY.status[status as keyof typeof VOCABULARY.status]}`,
      );
    }
  },
};

// A saída do contrato não traz estado de normalização: o eixo continua no
// painel, como item que declara a ausência, e os outros dois seguem com
// seus marcadores.
export const EixoSemValor: Story = {
  name: "Eixo sem valor",
  tags: ["state:axis_unvalued"],
  args: { statuses: STATUSES_FROM_CONTRACT },
  play: async ({ canvasElement }) => {
    await expectThreeAxes(canvasElement);
    const found = items(canvasElement);
    const unvalued = found.filter(
      (item) => item.getAttribute("data-valued") === "false",
    );
    await expect(unvalued).toHaveLength(1);
    const [item] = unvalued;
    await expect(item?.getAttribute("data-axis")).toBe("normalization_status");
    await expect(item ? accessibleNameFromContent(item) : "").toBe(
      `${VOCABULARY.axis.normalization_status}: ${VOCABULARY.absence.statusMissing}`,
    );
    await expect(item?.querySelector("[data-status]")).toBeNull();
    await expect(item?.querySelector('[data-kind="unknown"]')).not.toBeNull();
    await expect(item?.textContent ?? "").not.toMatch(/\d/);

    const valued = found.filter(
      (item) => item.getAttribute("data-valued") === "true",
    );
    await expect(valued).toHaveLength(2);
    for (const item of valued) {
      await expect(item.querySelector("[data-status]")).not.toBeNull();
    }
  },
};

// Não resolvido dentro do painel continua hachurado: a garantia é do átomo,
// e o painel não a sobrescreve.
export const NaoResolvidoNoPainel: Story = {
  name: "Não resolvido no painel",
  tags: ["state:all_valued"],
  args: {
    statuses: { ...STATUSES_FROM_LOAD, normalization_status: "unresolved" },
  },
  play: async ({ canvasElement }) => {
    await expectThreeAxes(canvasElement);
    const fill = canvasElement.querySelector<HTMLElement>(
      '[data-axis="normalization_status"][data-status="unresolved"] [data-fill]',
    );
    await expect(fill?.getAttribute("data-fill")).toBe("hatch");
    await expect(fill?.querySelector("svg[data-hatch]")).not.toBeNull();
  },
};

export const TermosDoVocabulario: Story = {
  name: "Termos vêm do vocabulário",
  tags: ["state:all_valued", "state:axis_unvalued"],
  args: { statuses: STATUSES_FROM_CONTRACT, terms: markEveryTerm() },
  play: async ({ canvasElement }) => {
    await expectEveryTermFromVocabulary(canvasElement, []);
  },
};

export const TermoSobrescrito: Story = {
  name: "Termo sobrescrito",
  tags: ["state:all_valued"],
  args: {
    statuses: STATUSES_FROM_LOAD,
    terms: {
      axis: { verification_level: "Nível de verificação" },
      status: { confirmed: "Confirmada" },
    },
  },
  play: async ({ canvasElement }) => {
    const names = items(canvasElement).map(accessibleNameFromContent);
    await expect(names).toContain("Nível de verificação: Confirmada");
    await expect(names).not.toContain(
      `${VOCABULARY.axis.verification_level}: ${VOCABULARY.status.confirmed}`,
    );
  },
};
