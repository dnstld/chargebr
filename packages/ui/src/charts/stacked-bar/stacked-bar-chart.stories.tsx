import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expectBlockedReplacesChart,
  expectLegendNamesSeries,
  expectMissingDeclared,
  expectNoInteractiveInPlot,
  expectNoLegend,
  expectTextEquivalent,
  expectUnresolvedHatchedAndDetached,
  expectUnresolvedOutsideStack,
} from "../chart.assert";
import {
  CURRENT_METHODOLOGY,
  ELECTRIFIED_UNITS,
} from "../fixtures/abve-eletrificados-janeiro-2025";
import {
  SYNTHETIC_UNITS,
  THREE_SERIES,
  WITH_MISSING,
  WITH_UNRESOLVED,
} from "../fixtures/synthetic-series";
import { StackedBarChart } from "./stacked-bar-chart";

const meta = {
  title: "Gráficos/Barras empilhadas",
  component: StackedBarChart,
} satisfies Meta<typeof StackedBarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TresSeries: Story = {
  name: "Três séries, com não resolvido e ausência",
  tags: [
    "state:multiple_series",
    "state:unresolved_point",
    "state:missing_point",
  ],
  args: {
    title: "Fixture sintética",
    measure: SYNTHETIC_UNITS,
    series: [...THREE_SERIES],
  },
  play: async ({ canvasElement }) => {
    await expectNoInteractiveInPlot(canvasElement);
    await expectLegendNamesSeries(
      canvasElement,
      THREE_SERIES.map((one) => one.name),
    );
    await expectUnresolvedHatchedAndDetached(
      canvasElement,
      WITH_UNRESOLVED.name,
      "Março",
    );
    await expectMissingDeclared(canvasElement, WITH_MISSING.name, "Março");
    await expectTextEquivalent(canvasElement, THREE_SERIES);
    await expectUnresolvedOutsideStack(
      canvasElement,
      "Março",
      WITH_UNRESOLVED.name,
    );
  },
};

export const UmaSerie: Story = {
  name: "Uma série, derivada do contrato",
  tags: ["state:single_series"],
  args: {
    title: "Veículos leves eletrificados",
    measure: ELECTRIFIED_UNITS,
    series: [CURRENT_METHODOLOGY],
  },
  play: async ({ canvasElement }) => {
    await expectNoInteractiveInPlot(canvasElement);
    await expectNoLegend(canvasElement);
    await expectTextEquivalent(canvasElement, [CURRENT_METHODOLOGY]);
  },
};

export const Bloqueada: Story = {
  name: "Projeção bloqueada",
  tags: ["state:blocked"],
  args: {
    title: "Veículos leves eletrificados",
    measure: ELECTRIFIED_UNITS,
    blocked: ["metric_not_found", "provenance_incomplete"],
  },
  play: async ({ canvasElement }) => {
    await expectBlockedReplacesChart(canvasElement, [
      "metric_not_found",
      "provenance_incomplete",
    ]);
  },
};
