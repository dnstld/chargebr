import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { NavFolderTrigger } from "./nav-folder-trigger";

const meta = {
  title: "Átomos/Navegação/Gatilho de pasta",
  component: NavFolderTrigger,
  args: {
    label: "Associações do setor",
    isExpanded: false,
    controls: "association-items",
    onToggle: () => undefined,
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <div id="association-items" />
        <div id="current-items" />
      </>
    ),
  ],
} satisfies Meta<typeof NavFolderTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulTrigger() {
  const [expanded, setExpanded] = useState(false);
  return (
    <NavFolderTrigger
      label="Associações do setor"
      isExpanded={expanded}
      controls="association-items"
      onToggle={() => setExpanded((current) => !current)}
    />
  );
}

export const AlternaExpansao: Story = {
  name: "Alterna expansão",
  render: () => <StatefulTrigger />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Associações do setor" });
    const icon = button.querySelector("svg");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toHaveAttribute("aria-controls", "association-items");
    const before = icon === null ? "" : getComputedStyle(icon).transform;
    await userEvent.click(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("aria-expanded", "true"),
    );
    if (
      icon !== null &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      await waitFor(() =>
        expect(getComputedStyle(icon).transform).not.toBe(before),
      );
    }
  },
};

export const Corrente: Story = {
  name: "Pasta corrente",
  args: {
    label: "Associações do setor",
    isExpanded: true,
    controls: "current-items",
    isCurrent: true,
    onToggle: () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Associações do setor" }),
    ).toHaveAttribute("aria-current", "page");
  },
};
