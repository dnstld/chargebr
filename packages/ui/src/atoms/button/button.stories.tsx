import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut, Menu } from "lucide-react";
import { expect, userEvent, waitFor } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { resolveColor } from "../../bench/computed";
import { Button } from "./button";

const meta = {
  title: "Átomos/Botão",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// Botão com rótulo, sem ícone: a forma mais comum de ação de texto.
export const EmRepouso: Story = {
  name: "Em repouso",
  args: { children: "Confirmar" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(button.hasAttribute("data-focus-visible")).toBe(false);
  },
};

// Alcançável por teclado: um Tab a partir da página chega ao botão, e o foco
// vindo do teclado aparece com o anel de foco dos tokens.
export const ComFocoPeloTeclado: Story = {
  name: "Com foco pelo teclado",
  args: { children: "Confirmar" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await userEvent.tab();
    await expect(document.activeElement).toBe(button);
    await waitFor(() => {
      expect(button.hasAttribute("data-focus-visible")).toBe(true);
      expect(getComputedStyle(button).outlineColor).toBe(
        resolveColor(tokens["color-focus-ring"][theme]),
      );
      expect(getComputedStyle(button).outlineStyle).toBe("solid");
    });
  },
};

// Ícone ao lado do rótulo: a forma que a ação "Deslogar" usa no rodapé de
// NavPanel.
export const ComIconeERotulo: Story = {
  name: "Com ícone e rótulo",
  args: { children: "Sair", icon: LogOut },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Sair" });
    await expect(button.querySelector("svg")).not.toBeNull();
  },
};

// Ícone só, sem rótulo visível: a forma que o gatilho do hambúrguer usa. O
// nome acessível vem de `aria-label`, nunca do ícone — Icon nunca declara um
// nome próprio.
export const IconeSoh: Story = {
  name: "Ícone só",
  args: { icon: Menu, "aria-label": "Abrir menu" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Abrir menu" });
    await expect(button.querySelector("svg")).not.toBeNull();
    await expect(button.textContent?.trim()).toBe("");
  },
};

// Cada tamanho resolve para o `font-size` do seu próprio degrau
// (`component/button.json`) — nunca um valor fora dos três tokens.
export const TamanhoPequeno: Story = {
  name: "Tamanho pequeno",
  args: { children: "Confirmar", size: "sm" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-sm-font-size"][theme],
    );
  },
};

export const TamanhoMedio: Story = {
  name: "Tamanho médio",
  args: { children: "Confirmar", size: "md" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-md-font-size"][theme],
    );
  },
};

export const TamanhoGrande: Story = {
  name: "Tamanho grande",
  args: { children: "Confirmar", size: "lg" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-lg-font-size"][theme],
    );
  },
};

// Sem `size`, o botão resolve para o mesmo `font-size` do degrau médio — a
// aparência de antes desta variante existir não muda.
export const TamanhoNaoEspecificado: Story = {
  name: "Tamanho não especificado usa o médio",
  args: { children: "Confirmar" },
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await expect(getComputedStyle(button).fontSize).toBe(
      tokens["button-md-font-size"][theme],
    );
  },
};
