import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Hatch } from "../../atoms/hatch/hatch";
import { readDrawnHatch } from "./geometry";
import { ChartHatchPattern, hatchFill } from "./hatch-pattern";
import styles from "./hatch-pattern.stories.module.css";

const PATTERN_ID = "hatch-unica";

const meta = {
  title: "Gráficos/Hachura do gráfico",
  component: ChartHatchPattern,
  args: { id: PATTERN_ID },
} satisfies Meta<typeof ChartHatchPattern>;

export default meta;

type Story = StoryObj<typeof meta>;

// A checagem da hachura única. As duas implementações são renderizadas lado a
// lado e a geometria de cada uma é lida do elemento desenhado; divergência
// reprova nomeando as duas definições. É verificação por execução, e não
// comparação de constantes: as duas poderiam ler HATCH e ainda assim desenhar
// texturas diferentes.
export const HachuraUnica: Story = {
  name: "A mesma hachura dentro e fora do gráfico",
  render: ({ id }) => (
    <div className={styles.row}>
      <div className={styles.box} data-source="atom">
        <Hatch label="Não resolvido, fora do gráfico" />
      </div>
      <svg
        className={styles.box}
        data-source="chart"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <defs>
          <ChartHatchPattern id={id} />
        </defs>
        <rect width="100%" height="100%" fill={hatchFill(id)} />
      </svg>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const patterns = new Map<string, Element>();
    for (const source of ["atom", "chart"]) {
      const host = canvasElement.querySelector(`[data-source="${source}"]`);
      const pattern = host?.querySelector("pattern") ?? null;
      await expect(pattern, `padrão da definição "${source}"`).not.toBeNull();
      if (pattern !== null) patterns.set(source, pattern);
    }

    const atom = readDrawnHatch(patterns.get("atom") as Element);
    const chart = readDrawnHatch(patterns.get("chart") as Element);

    // A mensagem nomeia as duas definições: quem lê a reprovação sabe quais
    // implementações divergiram, não apenas que algo divergiu.
    await expect(
      chart,
      "a hachura do gráfico (ChartHatchPattern) divergiu da hachura fora do gráfico (átomo Hatch); as duas derivam de HATCH em @chargebr/tokens",
    ).toEqual(atom);

    // A marca do gráfico de fato usa o padrão, e não um preenchimento sólido
    // que passaria na comparação acima sem desenhar textura alguma.
    const filled = canvasElement.querySelector('[data-source="chart"] rect');
    await expect(filled?.getAttribute("fill")).toBe(hatchFill(PATTERN_ID));
  },
};
