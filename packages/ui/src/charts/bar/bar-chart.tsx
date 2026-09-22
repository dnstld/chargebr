import { DomainChart } from "../chart";
import { CHART_STATES, defineChart } from "../contract";
import type { ChartDrawProps, ChartSeries, ShapeChartProps } from "../series";

// Barras agrupadas. Dentro de uma categoria cada série ocupa posição fixa, e
// por isso só as vizinhas se tocam: a checagem de paleta desta forma executa
// os pares adjacentes.
export function BarChart<
  const S extends readonly ChartSeries<string>[],
  const Measure extends string,
  const Title extends string,
>(props: ShapeChartProps<"bar", S, Measure, Title>) {
  return <DomainChart {...(props as ChartDrawProps)} shape="bar" />;
}

export const BarChartShape = defineChart({
  name: "BarChart",
  component: BarChart,
  states: CHART_STATES,
});
