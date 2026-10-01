import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Logo } from "./logo";

const meta = {
  title: "Átomos/Marca",
  component: Logo,
  args: { label: "ChargeBR" },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

// A marca aparece nas cores fixas dos arquivos existentes — o componente não
// declara nenhuma delas — sobre o fundo do tema corrente, claro ou escuro.
export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvas, args }) => {
    const image = canvas.getByRole("img", {
      name: args.label,
    }) as HTMLImageElement;
    await expect(image.tagName).toBe("IMG");
    // O SVG é asset externo (Vite `@fs`): a garantia é que ele termina de
    // carregar, não que o navegador dispense a espera de rede.
    await waitFor(() => {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
    });
  },
};

export const Selo: Story = {
  name: "Selo isolado",
  args: { variant: "mark" },
  play: async ({ canvas, args }) => {
    const image = canvas.getByRole("img", {
      name: args.label,
    }) as HTMLImageElement;
    await waitFor(() => {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
    });
    await expect(image).toHaveAttribute("data-variant", "mark");
  },
};
