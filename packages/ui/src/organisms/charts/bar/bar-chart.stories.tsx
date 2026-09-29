import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expectLegendNamesSeries,
  expectNoInteractiveInPlot,
  expectNoLegend,
  expectNoMarkForMissingValue,
  expectTextEquivalent,
  expectTextOutsideChartSurface,
  expectTexturedFill,
} from "../chart.assert";
import {
  COMPLETE,
  SYNTHETIC_UNITS,
  THREE_SERIES,
  WITH_MISSING,
  WITH_TEXTURED,
} from "../fixtures/synthetic-series";
import { BarChart } from "./bar-chart";

const meta = {
  title: "Gráficos/Barras agrupadas",
  component: BarChart,
} satisfies Meta<typeof BarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

// Três séries — o limite que a paleta sustenta — com preenchimento
// texturizado e um ponto sem valor no mesmo desenho.
export const TresSeries: Story = {
  name: "Três séries, com preenchimento texturizado e ausência",
  args: {
    title: "Fixture sintética de barras",
    measure: SYNTHETIC_UNITS,
    series: [...THREE_SERIES],
  },
  play: async ({ canvasElement }) => {
    await expectNoInteractiveInPlot(canvasElement);
    await expectTextOutsideChartSurface(canvasElement);
    await expectLegendNamesSeries(
      canvasElement,
      THREE_SERIES.map((one) => one.name),
    );
    await expectTexturedFill(canvasElement, WITH_TEXTURED.name, "Março");
    await expectNoMarkForMissingValue(
      canvasElement,
      WITH_MISSING.name,
      "Março",
    );
    await expectTextEquivalent(canvasElement, THREE_SERIES);
  },
};

// Uma série só: sem legenda obrigatória, porque não há o que distinguir.
export const UmaSerie: Story = {
  name: "Uma série",
  args: {
    title: "Fixture sintética de barras",
    measure: SYNTHETIC_UNITS,
    series: [COMPLETE],
  },
  play: async ({ canvasElement }) => {
    await expectNoInteractiveInPlot(canvasElement);
    await expectTextOutsideChartSurface(canvasElement);
    await expectNoLegend(canvasElement);
    await expectTextEquivalent(canvasElement, [COMPLETE]);
  },
};
