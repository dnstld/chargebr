import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { NavSection } from "./nav-section";

const meta = {
  title: "Moléculas/Navegação/Seção",
  component: NavSection,
  args: {
    label: "Fontes",
    items: [
      { href: "#abev", label: "ABEV" },
      { href: "#raizen", label: "Raízen" },
      { href: "#vibra", label: "Vibra" },
    ],
  },
} satisfies Meta<typeof NavSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.label)).toBeInTheDocument();
    for (const item of args.items) {
      await expect(
        canvas.getByRole("link", { name: item.label as string }),
      ).toBeInTheDocument();
    }
  },
};

// Prova direta do requisito: o rótulo nunca recebe foco, cada folha recebe.
export const RotuloNaoEFocalizavel: Story = {
  name: "O rótulo da seção não é focalizável",
  play: async ({ canvas, args }) => {
    const label = canvas.getByText(args.label);
    await expect(label.hasAttribute("href")).toBe(false);
    await expect(label.hasAttribute("tabindex")).toBe(false);
    await expect(label.getAttribute("role")).not.toBe("button");

    const primeiraFolha = canvas.getByRole("link", {
      name: args.items[0]?.label as string,
    });
    await userEvent.tab();
    // O primeiro Tab a partir da página alcança a primeira folha direto —
    // se o rótulo fosse focalizável, ele viria antes na ordem de tabulação.
    await expect(document.activeElement).toBe(primeiraFolha);
  },
};
