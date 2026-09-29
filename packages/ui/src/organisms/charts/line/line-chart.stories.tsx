import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expectLegendNamesSeries,
  expectNoInteractiveInPlot,
  expectNoLegend,
  expectNoMarkForMissingValue,
  expectNoSegmentAcross,
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
import { LineChart } from "./line-chart";

const meta = {
  title: "Gráficos/Linhas",
  component: LineChart,
} satisfies Meta<typeof LineChart>;

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
    // O ponto sem valor interrompe a ligação: os vizinhos com valor também
    // não se ligam entre si pulando por cima dele.
    await expectNoSegmentAcross(
      canvasElement,
      WITH_MISSING.name,
      "Fevereiro",
      "Abril",
    );
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
