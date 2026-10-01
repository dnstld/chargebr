import type { Meta, StoryObj } from "@storybook/react-vite";
import { Database } from "lucide-react";
import { expect } from "storybook/test";
import { NavRailItem } from "./nav-rail-item";

const meta = {
  title: "Átomos/Navegação/Item da trilha",
  component: NavRailItem,
  args: { icon: Database, label: "Fontes" },
} satisfies Meta<typeof NavRailItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmRepouso: Story = {
  name: "Em repouso",
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Fontes" }),
    ).not.toHaveAttribute("aria-current");
  },
};

export const Corrente: Story = {
  name: "Corrente",
  args: { isCurrent: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Fontes" }),
    ).toHaveAttribute("aria-current", "true");
  },
};
