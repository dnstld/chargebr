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

export const SobOPonteiro: Story = {
  name: "Sob o ponteiro",
  tags: ["state:hovered"],
  play: async ({ canvas, args }) => {
    // SONDA TEMPORÁRIA: o que o ambiente reporta sobre ponteiro antes da
    // interação. Vai para o console e para a mensagem da asserção, porque o
    // reporter padrão só mostra o console de testes que falham. Remover depois
    // de capturar a saída no CI.
    const probe = `[sonda:ponteiro] ${JSON.stringify({
      "hover: hover": matchMedia("(hover: hover)").matches,
      "any-hover: hover": matchMedia("(any-hover: hover)").matches,
      "pointer: fine": matchMedia("(pointer: fine)").matches,
      maxTouchPoints: navigator.maxTouchPoints,
      userAgent: navigator.userAgent,
    })}`;
    console.log(probe);
    const anchor = canvas.getByRole("link", { name: args.label });
    await userEvent.hover(anchor);
    // Mesmo motivo da história de foco: o estado chega com o render, não com
    // o evento.
    await waitFor(() => {
      expect(anchor.hasAttribute("data-hovered"), probe).toBe(true);
      expect(getComputedStyle(anchor).textDecorationLine).toBe("none");
    });
  },
};
