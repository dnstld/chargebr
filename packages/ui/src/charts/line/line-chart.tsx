import { DomainChart } from "../chart";
import { CHART_STATES, defineChart } from "../contract";
import type { ChartDrawProps, ChartSeries, ShapeChartProps } from "../series";

// Linhas. Liga pontos vizinhos e por isso é a forma em que a interrupção
// importa: entre um ponto resolvido e um não resolvido, ou um ausente, não há
// segmento.
export function LineChart<
  const S extends readonly ChartSeries<string>[],
  const Measure extends string,
  const Title extends string,
>(props: ShapeChartProps<"line", S, Measure, Title>) {
  return <DomainChart {...(props as ChartDrawProps)} shape="line" />;
}

export const LineChartShape = defineChart({
  name: "LineChart",
  component: LineChart,
  states: CHART_STATES,
});
