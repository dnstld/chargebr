import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expectBlockedReplacesChart,
  expectLegendNamesSeries,
  expectMissingDeclared,
  expectNoInteractiveInPlot,
  expectNoLegend,
  expectTextEquivalent,
  expectTextOutsideChartSurface,
  expectUnresolvedHatchedAndDetached,
} from "../chart.assert";
import {
  CURRENT_METHODOLOGY,
  ELECTRIFIED_UNITS,
  FROM_CONTRACT,
} from "../fixtures/abve-eletrificados-janeiro-2025";
import {
  SYNTHETIC_UNITS,
  THREE_SERIES,
  WITH_MISSING,
  WITH_UNRESOLVED,
} from "../fixtures/synthetic-series";
import { BarChart } from "./bar-chart";

const meta = {
  title: "Gráficos/Barras agrupadas",
  component: BarChart,
} satisfies Meta<typeof BarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

// Três séries — o limite que a paleta sustenta — com os três estados de ponto
// no mesmo desenho: resolvido, não resolvido e ausente.
export const TresSeries: Story = {
  name: "Três séries, com não resolvido e ausência",
  tags: [
    "state:multiple_series",
    "state:unresolved_point",
    "state:missing_point",
  ],
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
    await expectUnresolvedHatchedAndDetached(
      canvasElement,
      WITH_UNRESOLVED.name,
      "Março",
    );
    await expectMissingDeclared(canvasElement, WITH_MISSING.name, "Março");
    await expectTextEquivalent(canvasElement, THREE_SERIES);
  },
};

// Uma série só, e desta vez do contrato de leitura: sem legenda obrigatória,
// porque não há o que distinguir.
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

// O resultado publicado e o contrafactual publicado ao lado dele, na mesma
// escala e na mesma publicação: as duas séries que o contrato produz.
export const DuasSeriesDoContrato: Story = {
  name: "Metodologia vigente e critério anterior",
  args: {
    title: "Veículos leves eletrificados",
    measure: ELECTRIFIED_UNITS,
    series: [...FROM_CONTRACT],
  },
  play: async ({ canvasElement }) => {
    await expectNoInteractiveInPlot(canvasElement);
    await expectTextOutsideChartSurface(canvasElement);
    await expectLegendNamesSeries(
      canvasElement,
      FROM_CONTRACT.map((one) => one.name),
    );
    await expectTextEquivalent(canvasElement, FROM_CONTRACT);
  },
};

export const Bloqueada: Story = {
  name: "Projeção bloqueada",
  tags: ["state:blocked"],
  args: {
    title: "Veículos leves eletrificados",
    measure: ELECTRIFIED_UNITS,
    blocked: ["provenance_incomplete"],
  },
  play: async ({ canvasElement }) => {
    await expectBlockedReplacesChart(canvasElement, ["provenance_incomplete"]);
  },
};
