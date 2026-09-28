import { DomainChart } from "../chart";
import type { ShapeChartProps } from "../series";

// Barras agrupadas. Dentro de uma categoria cada série ocupa posição fixa, e
// por isso só as vizinhas se tocam: a checagem de paleta desta forma executa
// os pares adjacentes.
export function BarChart(props: ShapeChartProps) {
  return <DomainChart {...props} shape="bar" />;
}
