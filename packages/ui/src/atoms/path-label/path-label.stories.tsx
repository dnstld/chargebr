import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { PathLabel } from "./path-label";

const meta = {
  title: "Átomos/Rótulo de caminho",
  component: PathLabel,
  args: {
    segments: ["Fontes", "ABEV"],
  },
} satisfies Meta<typeof PathLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvas, args }) => {
    const label = canvas.getByText(args.segments.join(" / "));
    await expect(label).toBeInTheDocument();
  },
};

// Prova direta do requisito: nem landmark, nem alcançável por teclado.
export const NaoENavegacao: Story = {
  name: "Não é região de navegação nem alcançável por teclado",
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("navigation")).toBeNull();
    const focusable = canvasElement.querySelectorAll(
      "a[href], button, [tabindex]",
    );
    await expect(focusable.length).toBe(0);
  },
};
