import { tokens } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import type { Theme } from "../../.storybook/theme";
import styles from "./bench.module.css";
import { resolveColor } from "./computed";

// Esta história existe para provar a bancada, não para entregar interface:
// renderiza texto sobre a superfície base consumindo tokens, e verifica que o
// valor resolvido no documento é o do tema em que a história está rodando.
function BenchSurface() {
  return <p className={styles.surface}>Bancada de verificação do ChargeBR</p>;
}

const meta = {
  title: "Bancada/Tokens",
  component: BenchSurface,
} satisfies Meta<typeof BenchSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SuperficieBase: Story = {
  name: "Superfície base",
  play: async ({ canvas, globals }) => {
    const theme = globals.theme as Theme;
    const element = canvas.getByText("Bancada de verificação do ChargeBR");
    const computed = getComputedStyle(element);

    await expect(computed.backgroundColor).toBe(
      resolveColor(tokens["color-surface-base"][theme]),
    );
    await expect(computed.color).toBe(
      resolveColor(tokens["color-text-primary"][theme]),
    );
    await expect(computed.paddingBlockStart).toBe(
      tokens["space-inset-md"].light,
    );
  },
};
