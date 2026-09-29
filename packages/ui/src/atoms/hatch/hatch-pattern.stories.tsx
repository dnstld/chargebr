import { HATCH } from "@chargebr/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { readDrawnHatch } from "./geometry";
import { HatchPattern, hatchFill } from "./hatch-pattern";
import styles from "./hatch-pattern.stories.module.css";

const PATTERN_ID = "hatch-pattern";

const meta = {
  title: "Átomos/Padrão de hachura",
  component: HatchPattern,
  args: { id: PATTERN_ID },
} satisfies Meta<typeof HatchPattern>;

export default meta;

type Story = StoryObj<typeof meta>;

// O `<pattern>` desenhado carrega os três números de HATCH — período, ângulo,
// espessura — lidos do próprio elemento renderizado, não comparados como
// constantes copiadas: é o que sustenta o átomo Hachura, referenciado por
// `fill` em vez de desenhado como `<svg>` próprio.
export const CarregaOsValoresDeHatch: Story = {
  name: "Carrega os valores de HATCH",
  render: ({ id }) => (
    <svg className={styles.box} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <HatchPattern id={id} />
      </defs>
      <rect width="100%" height="100%" fill={hatchFill(id)} />
    </svg>
  ),
  play: async ({ canvasElement }) => {
    const pattern = canvasElement.querySelector("pattern");
    await expect(pattern, "padrão desenhado").not.toBeNull();

    const drawn = readDrawnHatch(pattern as Element);
    await expect(drawn).toEqual({
      width: String(HATCH.period),
      height: String(HATCH.period),
      patternTransform: `rotate(${HATCH.angleDegrees})`,
      strokeWidth: String(HATCH.strokeWidth),
      strokeLength: String(HATCH.period),
      patternUnits: "userSpaceOnUse",
    });

    // A marca de fato usa o padrão, e não um preenchimento sólido que
    // passaria na comparação acima sem desenhar textura alguma.
    const filled = canvasElement.querySelector("rect");
    await expect(filled?.getAttribute("fill")).toBe(hatchFill(PATTERN_ID));
  },
};
