import { DomainChart } from "../chart";
import type { ShapeChartProps } from "../series";

// Pequenos múltiplos: um painel por série, todos na mesma escala de valor. É a
// saída para quem precisa de mais séries do que a paleta sustenta numa forma
// só.
export function SmallMultiplesChart(props: ShapeChartProps) {
  return <DomainChart {...props} shape="small-multiples" />;
}
