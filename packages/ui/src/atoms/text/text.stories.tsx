import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Text } from "./text";

const meta = {
  title: "Átomos/Texto",
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

// Peso e destaque no padrão: o corpo de texto comum, sem variante aplicada.
export const Padrao: Story = {
  name: "Padrão",
  args: { children: "Frota eletrificada em janeiro de 2025" },
};

// Peso médio: usado quando um trecho precisa de destaque sem chegar ao
// peso mais forte.
export const PesoMedio: Story = {
  name: "Peso médio",
  args: {
    weight: "medium",
    children: "Frota eletrificada em janeiro de 2025",
  },
};

// Peso semibold: quem compõe usa este peso para o valor que deve pesar mais
// que os outros ao lado dele.
export const PesoSemibold: Story = {
  name: "Peso semibold",
  args: {
    weight: "semibold",
    children: "Frota eletrificada em janeiro de 2025",
  },
};

// Itálico: quem compõe usa este destaque para um valor que precisa se
// distinguir de outro sem depender só de cor.
export const Italico: Story = {
  name: "Itálico",
  args: {
    emphasis: "italic",
    children: "Frota que existiria sem o incentivo",
  },
};

// Redação original e redação normalizada, lado a lado, com o mesmo peso e o
// mesmo destaque: o átomo não introduz diferença entre as duas — hierarquia
// entre redação original e normalizada, se existir, é decisão de quem compõe.
export const RedacoesLadoALado: Story = {
  name: "Redações lado a lado",
  args: { children: "" },
  render: () => (
    <p>
      <Text>veículos elétricos leves (BEV + PHEV)</Text>{" "}
      <Text>Eletrificados leves</Text>
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
