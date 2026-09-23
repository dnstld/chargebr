import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { expectRolesDistinctWithoutColor } from "../value-role.assert";
import { Text } from "./text";

const meta = {
  title: "Átomos/Texto",
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  name: "Principal",
  tags: ["state:primary"],
  args: {
    valueRole: "primary",
    children: "Frota eletrificada em janeiro de 2025",
  },
};

export const Contrafactual: Story = {
  name: "Contrafactual",
  tags: ["state:counterfactual"],
  args: {
    valueRole: "counterfactual",
    children: "Frota que existiria sem o incentivo",
  },
};

export const Contexto: Story = {
  name: "Contexto",
  tags: ["state:context"],
  args: { valueRole: "context", children: "Acumulado desde 2012, fonte ABVE" },
};

// Redação original e redação normalizada, lado a lado, no mesmo papel: a
// normalização não substitui a redação e não recebe hierarquia sobre ela.
export const RedacoesLadoALado: Story = {
  name: "Redações lado a lado",
  tags: ["state:primary"],
  args: { valueRole: "primary", children: "" },
  render: () => (
    <p>
      <Text valueRole="primary">veículos elétricos leves (BEV + PHEV)</Text>{" "}
      <Text valueRole="primary">Eletrificados leves</Text>
    </p>
  ),
  play: async ({ canvas }) => {
    const original = canvas.getByText("veículos elétricos leves (BEV + PHEV)");
    const normalized = canvas.getByText("Eletrificados leves");
    await expect(getComputedStyle(original).fontWeight).toBe(
      getComputedStyle(normalized).fontWeight,
    );
    await expect(getComputedStyle(original).fontSize).toBe(
      getComputedStyle(normalized).fontSize,
    );
  },
};

// Os três papéis renderizados juntos, e a prova de que se distinguem sem cor:
// o teste lê as propriedades computadas e compara as não cromáticas.
export const PapeisDistintos: Story = {
  name: "Papéis distintos sem cor",
  tags: ["state:primary", "state:counterfactual", "state:context"],
  args: { valueRole: "primary", children: "" },
  render: () => (
    <p>
      <Text valueRole="primary">12.345 veículos</Text>{" "}
      <Text valueRole="counterfactual">9.870 sem o incentivo</Text>{" "}
      <Text valueRole="context">em janeiro de 2025</Text>
    </p>
  ),
  play: async ({ canvas }) => {
    await expectRolesDistinctWithoutColor({
      primary: canvas.getByText("12.345 veículos"),
      counterfactual: canvas.getByText("9.870 sem o incentivo"),
      context: canvas.getByText("em janeiro de 2025"),
    });
  },
};
