import { DomainChart } from "../chart";
import type { ShapeChartProps } from "../series";

// Barras empilhadas. Cada série encosta na anterior e na seguinte: pares
// adjacentes.
export function StackedBarChart(props: ShapeChartProps) {
  return <DomainChart {...props} shape="stacked-bar" />;
}
