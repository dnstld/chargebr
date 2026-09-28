import { DomainChart } from "../chart";
import { CHART_STATES, defineChart } from "../contract";
import type { ChartDrawProps, ChartSeries, ShapeChartProps } from "../series";

// Pequenos múltiplos: um painel por série, todos na mesma escala de valor. É a
// saída para quem precisa de mais séries do que a paleta sustenta numa forma
// só.
export function SmallMultiplesChart<
  const S extends readonly ChartSeries<string>[],
  const Measure extends string,
  const Title extends string,
>(props: ShapeChartProps<"small-multiples", S, Measure, Title>) {
  return <DomainChart {...(props as ChartDrawProps)} shape="small-multiples" />;
}

export const SmallMultiplesChartShape = defineChart({
  name: "SmallMultiplesChart",
  component: SmallMultiplesChart,
  states: CHART_STATES,
});
