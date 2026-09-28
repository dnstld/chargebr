import { BarChartShape } from "./bar/bar-chart";
import type { ChartContract } from "./contract";
import { DotChartShape } from "./dot/dot-chart";
import { LineChartShape } from "./line/line-chart";
import { SmallMultiplesChartShape } from "./small-multiples/small-multiples-chart";
import { StackedBarChartShape } from "./stacked-bar/stacked-bar-chart";

export { BarChart, BarChartShape } from "./bar/bar-chart";
export { DomainChart } from "./chart";
export {
  CHART_STATES,
  type ChartContract,
  type ChartState,
  defineChart,
} from "./contract";
export { DotChart, DotChartShape } from "./dot/dot-chart";
export {
  ChartHatchPattern,
  type ChartHatchPatternProps,
  hatchFill,
} from "./hatch-pattern/hatch-pattern";
export { LineChart, LineChartShape } from "./line/line-chart";
export {
  CHART_SERIES_LIMIT,
  CHART_SERIES_TOKENS,
  SERIES_SYMBOLS,
  type SeriesLimit,
  type SeriesSymbol,
  seriesColor,
  seriesDash,
  seriesSymbol,
} from "./palette";
export {
  type ChartCommonProps,
  type ChartCoreProps,
  type ChartMeasure,
  type ChartPoint,
  type ChartSeries,
  hasValue,
  type MissingPoint,
  POINT_KINDS,
  type PointKind,
  type ResolvedPoint,
  type SeriesLimitRule,
  type ShapeChartProps,
  type SingleMeasureRule,
  type UnresolvedPoint,
} from "./series";
export {
  CHART_SHAPE_IDS,
  CHART_SHAPES,
  type ChartShape,
  type ChartShapeDefinition,
  shapeDefinition,
} from "./shapes";
export {
  SmallMultiplesChart,
  SmallMultiplesChartShape,
} from "./small-multiples/small-multiples-chart";
export {
  StackedBarChart,
  StackedBarChartShape,
} from "./stacked-bar/stacked-bar-chart";

// Todas as formas publicadas, na ordem em que foram derivadas: primeiro as que
// só encostam vizinhos, depois as que encostam qualquer marca em qualquer
// outra. A verificação de cobertura de histórias lê esta lista junto com
// ATOMS e PRIMITIVES.
export const CHARTS: readonly ChartContract[] = [
  BarChartShape,
  StackedBarChartShape,
  LineChartShape,
  DotChartShape,
  SmallMultiplesChartShape,
];
