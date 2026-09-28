import { DomainChart } from "../chart";
import { CHART_STATES, defineChart } from "../contract";
import type { ChartDrawProps, ChartSeries, ShapeChartProps } from "../series";

// Barras empilhadas. Cada série encosta na anterior e na seguinte: pares
// adjacentes. Valor não resolvido nunca entra na pilha — fica acima, separado
// e hachurado, porque a altura da pilha é lida como soma.
export function StackedBarChart<
  const S extends readonly ChartSeries<string>[],
  const Measure extends string,
  const Title extends string,
>(props: ShapeChartProps<"stacked-bar", S, Measure, Title>) {
  return <DomainChart {...(props as ChartDrawProps)} shape="stacked-bar" />;
}

export const StackedBarChartShape = defineChart({
  name: "StackedBarChart",
  component: StackedBarChart,
  states: CHART_STATES,
});
