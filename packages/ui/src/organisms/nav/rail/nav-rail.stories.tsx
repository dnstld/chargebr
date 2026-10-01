import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChartNoAxesCombined,
  Database,
  FileText,
  Settings,
} from "lucide-react";
import { expect } from "storybook/test";
import { NavRail } from "./nav-rail";

const meta = {
  title: "Organismos/Navegação/Trilha",
  component: NavRail,
  args: {
    label: "Áreas do produto",
    brandLabel: "ChargeBR",
    destinations: [
      { icon: Database, label: "Fontes", isCurrent: true },
      { icon: ChartNoAxesCombined, label: "Séries" },
      { icon: FileText, label: "Instrumentos" },
      { icon: Settings, label: "Configurações" },
    ],
    avatarInitials: "DT",
    avatarLabel: "Conta de Denis Toledo",
  },
} satisfies Meta<typeof NavRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completa: Story = {
  name: "Completa",
  play: async ({ canvas }) => {
    const current = canvas.getByRole("button", { name: "Fontes" });
    await expect(current).toHaveAttribute("aria-current", "true");
    for (const name of ["Séries", "Instrumentos", "Configurações"]) {
      await expect(canvas.getByRole("button", { name })).not.toHaveAttribute(
        "aria-current",
      );
    }
    const logo = canvas.getByRole("img", {
      name: "ChargeBR",
    }) as HTMLImageElement;
    await expect(logo).toHaveAttribute("data-variant", "mark");
  },
};
