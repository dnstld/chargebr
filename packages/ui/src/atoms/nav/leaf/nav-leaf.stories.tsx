import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { NavLeaf } from "./nav-leaf";

const meta = {
  title: "Átomos/Navegação/Folha",
  component: NavLeaf,
  args: { href: "#overview", label: "Visão geral" },
} satisfies Meta<typeof NavLeaf>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmRepouso: Story = {
  name: "Em repouso",
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Visão geral" });
    await expect(link).not.toHaveAttribute("aria-current");
  },
};

export const CorrenteComPontoEMeta: Story = {
  name: "Corrente com ponto e contagem",
  args: {
    href: "#abve",
    label: "ABVE — Associação Brasileira do Veículo Elétrico",
    dot: true,
    meta: "14",
    isCurrent: true,
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: "ABVE — Associação Brasileira do Veículo Elétrico 14",
    });
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(link.querySelector('[aria-hidden="true"]')).not.toBeNull();
    await expect(canvas.getByText("14")).toBeInTheDocument();
  },
};
