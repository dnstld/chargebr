import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expectBlockedReplacesChart,
  expectLegendNamesSeries,
  expectMissingDeclared,
  expectNoInteractiveInPlot,
  expectNoLegend,
  expectNoSegmentAcross,
  expectTextEquivalent,
  expectTextOutsideChartSurface,
  expectUnresolvedHatchedAndDetached,
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
import { LineChart } from "./line-chart";

const meta = {
  title: "Gráficos/Linhas",
  component: LineChart,
} satisfies Meta<typeof LineChart>;

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
    await expectTextOutsideChartSurface(canvasElement);
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
    // A ligação não pula o ponto: os vizinhos resolvidos do não resolvido
    // também não se ligam entre si.
    await expectNoSegmentAcross(
      canvasElement,
      WITH_UNRESOLVED.name,
      "Fevereiro",
      "Abril",
    );
    await expectNoSegmentAcross(
      canvasElement,
      WITH_MISSING.name,
      "Fevereiro",
      "Abril",
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
    await expectTextOutsideChartSurface(canvasElement);
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
