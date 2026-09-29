import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { resolveColor } from "../../bench/computed";
import { Link } from "./link";

const meta = {
  title: "Átomos/Link",
  component: Link,
  args: {
    href: "#destino",
    children: "Ver mais",
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmRepouso: Story = {
  name: "Em repouso",
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole("link", { name: args.children as string });
    await expect(link.getAttribute("href")).toBe(args.href);
    await expect(link.hasAttribute("data-hovered")).toBe(false);
    await expect(link.hasAttribute("data-focus-visible")).toBe(false);
  },
};

// Alcançável por teclado: um Tab a partir da página chega ao link, e o foco
// vindo do teclado aparece com o anel de foco dos tokens.
export const ComFocoPeloTeclado: Story = {
  name: "Com foco pelo teclado",
  play: async ({ canvas, args, globals }) => {
    const theme = globals.theme as Theme;
    const link = canvas.getByRole("link", { name: args.children as string });
    await userEvent.tab();
    await expect(document.activeElement).toBe(link);
    // O atributo e o estilo dele derivado só aparecem depois que o React
    // confirma o render que a interação disparou: a leitura é repetida até o
    // estado chegar, em vez de feita uma vez logo após o evento.
    await waitFor(() => {
      expect(link.hasAttribute("data-focus-visible")).toBe(true);
      expect(getComputedStyle(link).outlineColor).toBe(
        resolveColor(tokens["color-focus-ring"][theme]),
      );
      expect(getComputedStyle(link).outlineStyle).toBe("solid");
    });
  },
};
