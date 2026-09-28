import { DomainChart } from "../chart";
import type { ShapeChartProps } from "../series";

// Dispersão por categoria. Qualquer marca pode encostar em qualquer outra, e
// por isso a checagem de paleta desta forma executa todos os pares.
export function DotChart(props: ShapeChartProps) {
  return <DomainChart {...props} shape="dot" />;
}
