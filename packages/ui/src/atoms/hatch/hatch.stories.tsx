import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { HATCH_MIN_SIZE, HATCH_PERIOD, Hatch } from "./hatch";
import styles from "./hatch.stories.module.css";

const meta = {
  title: "Átomos/Hachura",
  component: Hatch,
} satisfies Meta<typeof Hatch>;

export default meta;

type Story = StoryObj<typeof meta>;

// A hachura no menor tamanho em que ainda é hachura, ao lado de uma grande:
// a textura é a mesma, e a história exercita exatamente o limite declarado.
export const NoLimiteMinimo: Story = {
  name: "No limite mínimo",
  render: () => (
    <div className={styles.row}>
      <div
        className={styles.box}
        data-size="minimum"
        style={{ inlineSize: HATCH_MIN_SIZE, blockSize: HATCH_MIN_SIZE }}
      >
        <Hatch label="Não resolvido, no tamanho mínimo" />
      </div>
      <div className={`${styles.box} ${styles.large}`}>
        <Hatch label="Não resolvido, em tamanho grande" />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const minimum = canvasElement.querySelector<HTMLElement>(
      '[data-size="minimum"]',
    );
    await expect(minimum).not.toBeNull();
    const box = minimum?.getBoundingClientRect();
    await expect(box?.width).toBe(HATCH_MIN_SIZE);
    await expect(box?.height).toBe(HATCH_MIN_SIZE);

    // No mínimo cabem três períodos: três traços na diagonal, o que é o que
    // separa hachura de cinza uniforme.
    await expect(HATCH_MIN_SIZE / HATCH_PERIOD).toBeGreaterThanOrEqual(3);

    const hatch = canvas.getByRole("img", {
      name: "Não resolvido, no tamanho mínimo",
    });
    const pattern = hatch.querySelector("pattern");
    await expect(pattern?.getAttribute("width")).toBe(String(HATCH_PERIOD));
    await expect(hatch.getBoundingClientRect().width).toBe(HATCH_MIN_SIZE);
  },
};

// Sem nome, a hachura é decorativa: fica fora da árvore de acessibilidade, e
// o significado vem do texto ao lado (caso do marcador de estado).
export const Decorativa: Story = {
  name: "Decorativa, ao lado do texto",
  render: () => (
    <p className={styles.row}>
      <span
        className={styles.box}
        style={{ inlineSize: HATCH_MIN_SIZE, blockSize: HATCH_MIN_SIZE }}
      >
        <Hatch />
      </span>
      <span>Não resolvido</span>
    </p>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("img")).toBeNull();
    const hatch = canvasElement.querySelector("svg[data-hatch]");
    await expect(hatch?.getAttribute("aria-hidden")).toBe("true");
  },
};
