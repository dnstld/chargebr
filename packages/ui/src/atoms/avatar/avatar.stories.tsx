import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import type { Theme } from "../../../.storybook/theme";
import { resolveColor } from "../../bench/computed";
import { Avatar } from "./avatar";

const meta = {
  title: "Átomos/Avatar",
  component: Avatar,
  args: { initials: "DT", label: "Conta de Denis Toledo" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const avatar = canvas.getByRole("button", {
      name: "Conta de Denis Toledo",
    });
    const computed = getComputedStyle(avatar);
    await expect(computed.backgroundColor).toBe(
      resolveColor(tokens["avatar-background"][theme]),
    );
    await expect(computed.color).toBe(
      resolveColor(tokens["avatar-color"][theme]),
    );
  },
};
