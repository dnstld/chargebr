import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { resolveColor } from "../../bench/computed";
import { EvidenceAnchor } from "./evidence-anchor";

const meta = {
  title: "Átomos/Âncora de evidência",
  component: EvidenceAnchor,
  args: {
    href: "#evidencia-abve-2025-01",
    label: "Evidência: boletim ABVE de janeiro de 2025",
  },
} satisfies Meta<typeof EvidenceAnchor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmRepouso: Story = {
  name: "Em repouso",
  tags: ["state:idle"],
  play: async ({ canvas, args }) => {
    const anchor = canvas.getByRole("link", { name: args.label });
    await expect(anchor.getAttribute("href")).toBe(args.href);
    await expect(anchor.hasAttribute("data-hovered")).toBe(false);
    await expect(anchor.hasAttribute("data-focus-visible")).toBe(false);
  },
};

// Alcançável por teclado: um Tab a partir da página chega à âncora, e o foco
// vindo do teclado aparece com o anel de foco dos tokens.
export const ComFocoPeloTeclado: Story = {
  name: "Com foco pelo teclado",
  tags: ["state:focus-visible"],
  play: async ({ canvas, args, globals }) => {
    const theme = globals.theme as Theme;
    const anchor = canvas.getByRole("link", { name: args.label });
    await userEvent.tab();
    await expect(document.activeElement).toBe(anchor);
    // O atributo e o estilo dele derivado só aparecem depois que o React
    // confirma o render que a interação disparou: a leitura é repetida até o
    // estado chegar, em vez de feita uma vez logo após o evento.
    await waitFor(() => {
      expect(anchor.hasAttribute("data-focus-visible")).toBe(true);
      expect(getComputedStyle(anchor).outlineColor).toBe(
        resolveColor(tokens["color-focus-ring"][theme]),
      );
      expect(getComputedStyle(anchor).outlineStyle).toBe("solid");
    });
  },
};
