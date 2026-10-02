import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { BRAND_HORIZONTAL_URL, BRAND_MARK_URL } from "./brand-assets";
import { Logo } from "./logo";

const meta = {
  title: "Átomos/Marca",
  component: Logo,
  args: { label: "ChargeBR", src: BRAND_HORIZONTAL_URL },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

// A referência renderizada é a URL recebida, e não uma que o componente tenha
// resolvido por conta própria: é essa asserção que reprova se ele voltar a
// importar o arquivo de marca e ignorar a propriedade.
async function esperarMarca(
  image: HTMLImageElement,
  url: string,
): Promise<void> {
  await expect(image.getAttribute("src")).toBe(url);
  // O SVG é asset externo (Vite `@fs`): a garantia é que ele termina de
  // carregar, não que o navegador dispense a espera de rede.
  await waitFor(() => {
    expect(image.complete).toBe(true);
    expect(image.naturalWidth).toBeGreaterThan(0);
  });
}

// A marca aparece nas cores fixas dos arquivos existentes — o componente não
// declara nenhuma delas — sobre o fundo do tema corrente, claro ou escuro.
export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvas, args }) => {
    const image = canvas.getByRole("img", {
      name: args.label,
    }) as HTMLImageElement;
    await expect(image.tagName).toBe("IMG");
    await expect(image).toHaveAttribute("data-variant", "horizontal");
    await esperarMarca(image, args.src);
  },
};

export const Selo: Story = {
  name: "Selo isolado",
  args: { variant: "mark", src: BRAND_MARK_URL },
  play: async ({ canvas, args }) => {
    const image = canvas.getByRole("img", {
      name: args.label,
    }) as HTMLImageElement;
    await expect(image).toHaveAttribute("data-variant", "mark");
    await esperarMarca(image, args.src);
  },
};
