import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { DeclaredAbsence } from "./declared-absence";

const meta = {
  title: "Átomos/Ausência declarada",
  component: DeclaredAbsence,
} satisfies Meta<typeof DeclaredAbsence>;

export default meta;

type Story = StoryObj<typeof meta>;

// Conteúdo acessível do elemento: o que um leitor de tela lê. Nele não pode
// haver dígito, nem só traço ou espaço — nada que possa passar por valor. O
// elemento é localizado pelo atributo, não pelo texto, para que a asserção
// sobre o conteúdo seja a que reprova.
async function expectNoValueLike(
  canvasElement: HTMLElement,
  reason: string,
): Promise<void> {
  const element = canvasElement.querySelector<HTMLElement>("[data-kind]");
  await expect(element).not.toBeNull();
  const content = element?.textContent ?? "";
  await expect(content).not.toMatch(/\d/);
  await expect(content).not.toMatch(/^[\s\-–—]*$/);
  await expect(content).toBe(reason);
  await expect(element?.getAttribute("aria-label")).toBeNull();
}

export const ProjecaoBloqueada: Story = {
  name: "Projeção bloqueada",
  tags: ["state:blocked"],
  args: {
    kind: "blocked",
    reason: "Projeção bloqueada por cobertura insuficiente",
  },
  play: async ({ canvasElement, args }) => {
    await expectNoValueLike(canvasElement, args.reason);
  },
};

export const InformacaoDesconhecida: Story = {
  name: "Informação desconhecida",
  tags: ["state:unknown"],
  args: { kind: "unknown", reason: "Data sem precisão conhecida" },
  play: async ({ canvasElement, args }) => {
    await expectNoValueLike(canvasElement, args.reason);
  },
};
