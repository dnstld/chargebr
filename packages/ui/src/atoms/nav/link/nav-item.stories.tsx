import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";
import { expect, userEvent, waitFor } from "storybook/test";
import type { Theme } from "../../../../.storybook/theme";
import { resolveColor } from "../../../bench/computed";
import { NavItem } from "./nav-item";

const meta = {
  title: "Átomos/Navegação/Item",
  component: NavItem,
  args: {
    href: "#destino",
    children: "Visão geral",
  },
} satisfies Meta<typeof NavItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmRepouso: Story = {
  name: "Em repouso",
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole("link", { name: args.children as string });
    await expect(link.getAttribute("href")).toBe(args.href);
    await expect(link.hasAttribute("data-focus-visible")).toBe(false);
    // A ausência de fundo em repouso é provada por comparação, não por
    // literal — ver "Item corrente difere do repouso", abaixo.
  },
};

export const Corrente: Story = {
  name: "Corrente",
  args: { isCurrent: true },
  play: async ({ canvas, args, globals }) => {
    const theme = globals.theme as Theme;
    const link = canvas.getByRole("link", { name: args.children as string });
    await expect(getComputedStyle(link).backgroundColor).toBe(
      resolveColor(tokens["nav-item-current-background"][theme]),
    );
    await expect(getComputedStyle(link).color).toBe(
      resolveColor(tokens["nav-item-current-color"][theme]),
    );
    await expect(getComputedStyle(link).fontWeight).toBe(
      tokens["nav-item-current-weight"][theme],
    );
  },
};

// A prova direta do requisito "Item de navegação corrente é marcado por mais
// de um sinal": os dois itens, lado a lado, diferem em peso (não cromático)
// e em superfície preenchida — nunca só em cor.
export const ItemCorrenteDifereDoRepouso: Story = {
  name: "Item corrente difere do repouso em mais de uma propriedade",
  render: () => (
    <>
      <NavItem href="#um">Em repouso</NavItem>
      <NavItem href="#dois" isCurrent>
        Corrente
      </NavItem>
    </>
  ),
  play: async ({ canvas }) => {
    const repouso = canvas.getByRole("link", { name: "Em repouso" });
    const corrente = canvas.getByRole("link", { name: "Corrente" });
    const repousoStyle = getComputedStyle(repouso);
    const correnteStyle = getComputedStyle(corrente);
    await expect(correnteStyle.fontWeight).not.toBe(repousoStyle.fontWeight);
    await expect(correnteStyle.backgroundColor).not.toBe(
      repousoStyle.backgroundColor,
    );
  },
};

export const ComFocoPeloTeclado: Story = {
  name: "Com foco pelo teclado",
  play: async ({ canvas, args, globals }) => {
    const theme = globals.theme as Theme;
    const link = canvas.getByRole("link", { name: args.children as string });
    await userEvent.tab();
    await expect(document.activeElement).toBe(link);
    await waitFor(() => {
      expect(link.hasAttribute("data-focus-visible")).toBe(true);
      expect(getComputedStyle(link).outlineColor).toBe(
        resolveColor(tokens["color-focus-ring"][theme]),
      );
    });
  },
};

// A forma que a folha real de NavPanel usa: ícone ao lado do rótulo.
export const ComIcone: Story = {
  name: "Com ícone",
  args: { icon: Check, children: "Fontes" },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Fontes" });
    await expect(link.querySelector("svg")).not.toBeNull();
  },
};
