import { DomainChart } from "../chart";
import type { ShapeChartProps } from "../series";

// Linhas. Liga pontos vizinhos e por isso é a forma em que a interrupção
// importa: entre um ponto com valor e um ponto sem valor, não há segmento.
export function LineChart(props: ShapeChartProps) {
  return <DomainChart {...props} shape="line" />;
}
