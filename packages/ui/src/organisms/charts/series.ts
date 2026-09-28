import type { ChartShape } from "./shapes";

export interface ChartPoint {
  /** Categoria em que o ponto cai, em PT-BR. É dado, não vocabulário. */
  category: string;
  /** Valor do ponto. `null` é a única lacuna: sem marca, sem interpolação, sem zero. */
  value: number | null;
  /**
   * Preenchimento visual da marca — escolha de quem compõe, sem significado
   * de estado nem de negócio. Sem declaração, o padrão é `"solid"`.
   */
  fill?: "solid" | "textured";
}

export function hasValue(
  point: ChartPoint,
): point is ChartPoint & { value: number } {
  return point.value !== null;
}

export interface ChartSeries {
  /** Nome visível da série, em PT-BR. É dado recebido, não vocabulário. */
  name: string;
  points: readonly ChartPoint[];
}

export interface ChartMeasure {
  /** Nome visível da escala, em PT-BR. */
  label: string;
  /** Formatação dos valores; o padrão é a de pt-BR sem casa forçada. */
  format?: Intl.NumberFormatOptions;
}

export interface ShapeChartProps {
  /** Nome do gráfico, visível. */
  title: string;
  /** A escala de valor do gráfico. Uma só, por construção: a série não declara escala própria. */
  measure: ChartMeasure;
  series: readonly ChartSeries[];
}

export interface ChartCoreProps extends ShapeChartProps {
  shape: ChartShape;
}
