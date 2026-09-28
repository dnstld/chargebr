import { DomainChart } from "../chart";
import { CHART_STATES, defineChart } from "../contract";
import type { ChartDrawProps, ChartSeries, ShapeChartProps } from "../series";

// Dispersão por categoria. Qualquer marca pode encostar em qualquer outra, e
// por isso a checagem de paleta desta forma executa todos os pares.
export function DotChart<
  const S extends readonly ChartSeries<string>[],
  const Measure extends string,
  const Title extends string,
>(props: ShapeChartProps<"dot", S, Measure, Title>) {
  return <DomainChart {...(props as ChartDrawProps)} shape="dot" />;
}

export const DotChartShape = defineChart({
  name: "DotChart",
  component: DotChart,
  states: CHART_STATES,
});
