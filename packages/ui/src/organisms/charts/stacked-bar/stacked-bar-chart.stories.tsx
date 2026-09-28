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
import { StackedBarChart } from "./stacked-bar-chart";

const meta = {
  title: "Gráficos/Barras empilhadas",
  component: StackedBarChart,
} satisfies Meta<typeof StackedBarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TresSeries: Story = {
  name: "Três séries, com preenchimento texturizado e ausência",
  args: {
    title: "Fixture sintética",
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

export const UmaSerie: Story = {
  name: "Uma série",
  args: {
    title: "Fixture sintética",
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
