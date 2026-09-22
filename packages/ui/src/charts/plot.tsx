import { cssVar } from "@chargebr/tokens";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import type { ReactNode } from "react";
import { ChartHatchPattern, hatchFill } from "./hatch-pattern/hatch-pattern";
import { seriesColor, seriesDash, seriesSymbol } from "./palette";
import {
  type ChartMeasure,
  type ChartPoint,
  type ChartSeries,
  hasValue,
} from "./series";
import { type ChartShape, shapeDefinition } from "./shapes";

// Geometria do desenho, em unidades do espaço do usuário do SVG. Não são
// medidas de tela: o gráfico é escalado pelo contêiner, e estes números só
// fixam as proporções internas.
export const PLOT = {
  width: 560,
  height: 260,
  panelHeight: 84,
  panelGap: 20,
  margin: { top: 16, right: 16, bottom: 40, left: 64 },
  markSize: 11,
  // Vão que separa uma marca não resolvida do empilhamento dos resolvidos.
  // É o que impede que a altura da pilha seja lida como soma que inclui o
  // não resolvido.
  stackGap: 7,
  strokeWidth: 2,
  tickCount: 4,
} as const;

const LOCALE = "pt-BR";

export interface ChartPlotProps {
  shape: ChartShape;
  series: readonly ChartSeries[];
  measure: ChartMeasure;
  /** Prefixo dos identificadores de padrão, único por gráfico renderizado. */
  hatchPrefix: string;
}

export function categoriesOf(series: readonly ChartSeries[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const one of series) {
    for (const point of one.points) {
      if (seen.has(point.category)) continue;
      seen.add(point.category);
      out.push(point.category);
    }
  }
  return out;
}

function pointAt(one: ChartSeries, category: string): ChartPoint | undefined {
  return one.points.find((point) => point.category === category);
}

// Teto da escala de valor. Nas formas que empilham, é a maior soma por
// categoria — e a soma inclui o não resolvido só para reservar espaço, nunca
// como total exibido: nenhum total é desenhado nem escrito.
function domainTop(
  series: readonly ChartSeries[],
  categories: readonly string[],
  stacks: boolean,
): number {
  const values = series.flatMap((one) =>
    one.points.filter(hasValue).map((point) => point.value),
  );
  if (!stacks) return Math.max(1, ...values);
  const totals = categories.map((category) =>
    series.reduce((sum, one) => {
      const point = pointAt(one, category);
      return point !== undefined && hasValue(point) ? sum + point.value : sum;
    }, 0),
  );
  return Math.max(1, ...totals);
}

// O desenho. Não decide o que exibir: recebe séries já verificadas pelo tipo e
// põe cada marca no lugar. Fica fora da árvore de acessibilidade — os valores
// alcançáveis sem a visão estão na representação em texto, ao lado.
export function ChartPlot({
  shape,
  series,
  measure,
  hatchPrefix,
}: ChartPlotProps) {
  const definition = shapeDefinition(shape);
  const categories = categoriesOf(series);
  const panels = definition.panelsPerSeries
    ? series.map((one) => [one])
    : [series];

  const innerWidth = PLOT.width - PLOT.margin.left - PLOT.margin.right;
  const panelHeight = definition.panelsPerSeries
    ? PLOT.panelHeight
    : PLOT.height - PLOT.margin.top - PLOT.margin.bottom;
  const height = definition.panelsPerSeries
    ? PLOT.margin.top +
      panels.length * (PLOT.panelHeight + PLOT.panelGap) +
      PLOT.margin.bottom
    : PLOT.height;

  const x = scaleBand<string>({
    domain: [...categories],
    range: [0, innerWidth],
    padding: 0.28,
  });
  // Uma escala de valor, compartilhada por todos os painéis: é o que permite
  // comparar painéis de pequenos múltiplos sem que a comparação minta.
  const y = scaleLinear<number>({
    domain: [0, domainTop(series, categories, definition.stacks)],
    range: [panelHeight, 0],
    nice: true,
  });
  const baseline = y(0);

  const indexOf = (one: ChartSeries): number =>
    series.findIndex((candidate) => candidate.name === one.name);

  const format = (value: number): string =>
    new Intl.NumberFormat(LOCALE, measure.format).format(value);

  const bandStart = (category: string): number => x(category) ?? 0;

  // Marca de uma série: a forma é o canal não cromático, e é a mesma na
  // legenda. Não resolvido recebe hachura no lugar do preenchimento sólido.
  function mark(
    one: ChartSeries,
    point: ChartPoint,
    cx: number,
    cy: number,
  ): ReactNode {
    if (!hasValue(point)) return null;
    const index = indexOf(one);
    const color = seriesColor(index);
    const unresolved = point.kind === "unresolved";
    const size = PLOT.markSize;
    const half = size / 2;
    const common = {
      "data-mark": "",
      "data-kind": point.kind,
      "data-series": one.name,
      "data-category": point.category,
      "data-symbol": seriesSymbol(index),
      fill: unresolved ? hatchFill(`${hatchPrefix}-${index}`) : color,
      stroke: color,
      strokeWidth: PLOT.strokeWidth,
    };
    switch (seriesSymbol(index)) {
      case "circle":
        return <circle cx={cx} cy={cy} r={half} {...common} />;
      case "square":
        return (
          <rect
            x={cx - half}
            y={cy - half}
            width={size}
            height={size}
            {...common}
          />
        );
      default:
        return (
          <polygon
            points={`${cx},${cy - half} ${cx + half},${cy + half} ${cx - half},${cy + half}`}
            {...common}
          />
        );
    }
  }

  function bar(
    one: ChartSeries,
    point: ChartPoint,
    left: number,
    width: number,
    top: number,
    barHeight: number,
  ): ReactNode {
    const index = indexOf(one);
    const unresolved = point.kind === "unresolved";
    return (
      <rect
        key={`${one.name}-${point.category}`}
        x={left}
        y={top}
        width={width}
        height={barHeight}
        data-mark=""
        data-kind={point.kind}
        data-series={one.name}
        data-category={point.category}
        data-symbol={seriesSymbol(index)}
        fill={
          unresolved ? hatchFill(`${hatchPrefix}-${index}`) : seriesColor(index)
        }
        stroke={seriesColor(index)}
        strokeWidth={unresolved ? PLOT.strokeWidth : 0}
      />
    );
  }

  // Barras agrupadas: uma posição fixa por série dentro da categoria.
  function groupedBars(panelSeries: readonly ChartSeries[]): ReactNode[] {
    const inner = scaleBand<string>({
      domain: panelSeries.map((one) => one.name),
      range: [0, x.bandwidth()],
      padding: 0.12,
    });
    return panelSeries.flatMap((one) =>
      one.points
        .filter(hasValue)
        .map((point) =>
          bar(
            one,
            point,
            bandStart(point.category) + (inner(one.name) ?? 0),
            inner.bandwidth(),
            y(point.value),
            baseline - y(point.value),
          ),
        ),
    );
  }

  // Barras empilhadas: os resolvidos se empilham; os não resolvidos ficam
  // acima, separados por um vão e hachurados. A pilha nunca contém um valor
  // não resolvido, porque a altura da pilha é lida como soma.
  function stackedBars(panelSeries: readonly ChartSeries[]): ReactNode[] {
    const out: ReactNode[] = [];
    for (const category of categories) {
      const left = bandStart(category);
      const width = x.bandwidth();
      let top = baseline;
      for (const one of panelSeries) {
        const point = pointAt(one, category);
        if (point === undefined || point.kind !== "resolved") continue;
        const barHeight = baseline - y(point.value);
        top -= barHeight;
        out.push(bar(one, point, left, width, top, barHeight));
      }
      for (const one of panelSeries) {
        const point = pointAt(one, category);
        if (point === undefined || point.kind !== "unresolved") continue;
        const barHeight = baseline - y(point.value);
        top -= PLOT.stackGap + barHeight;
        out.push(bar(one, point, left, width, top, barHeight));
      }
    }
    return out;
  }

  // Linhas: um segmento entre dois pontos resolvidos vizinhos, e só. Ponto não
  // resolvido e ponto ausente interrompem a ligação, porque ligá-los afirmaria
  // uma continuidade que o dado não sustenta.
  function lines(panelSeries: readonly ChartSeries[]): ReactNode[] {
    const center = (category: string): number =>
      bandStart(category) + x.bandwidth() / 2;
    return panelSeries.flatMap((one) => {
      const index = indexOf(one);
      const dash = seriesDash(index);
      const segments: ReactNode[] = [];
      for (let i = 0; i + 1 < categories.length; i++) {
        const from = categories[i];
        const to = categories[i + 1];
        if (from === undefined || to === undefined) continue;
        const start = pointAt(one, from);
        const end = pointAt(one, to);
        if (start?.kind !== "resolved" || end?.kind !== "resolved") continue;
        segments.push(
          <line
            key={`${one.name}-${from}-${to}`}
            data-segment=""
            data-series={one.name}
            data-from={from}
            data-to={to}
            x1={center(from)}
            y1={y(start.value)}
            x2={center(to)}
            y2={y(end.value)}
            stroke={seriesColor(index)}
            strokeWidth={PLOT.strokeWidth}
            {...(dash === null ? {} : { strokeDasharray: dash })}
          />,
        );
      }
      const marks = one.points.map((point) => (
        <g key={`${one.name}-${point.category}`}>
          {mark(
            one,
            point,
            center(point.category),
            hasValue(point) ? y(point.value) : 0,
          )}
        </g>
      ));
      return [...segments, ...marks];
    });
  }

  function dots(panelSeries: readonly ChartSeries[]): ReactNode[] {
    const inner = scaleBand<string>({
      domain: panelSeries.map((one) => one.name),
      range: [0, x.bandwidth()],
      padding: 0.2,
    });
    return panelSeries.flatMap((one) =>
      one.points.map((point) => (
        <g key={`${one.name}-${point.category}`}>
          {mark(
            one,
            point,
            bandStart(point.category) +
              (inner(one.name) ?? 0) +
              inner.bandwidth() / 2,
            hasValue(point) ? y(point.value) : 0,
          )}
        </g>
      )),
    );
  }

  function marksOf(panelSeries: readonly ChartSeries[]): ReactNode[] {
    switch (shape) {
      case "bar":
        return groupedBars(panelSeries);
      case "stacked-bar":
        return stackedBars(panelSeries);
      case "line":
        return lines(panelSeries);
      case "small-multiples":
        return groupedBars(panelSeries);
      default:
        return dots(panelSeries);
    }
  }

  const axisColor = cssVar("color-chart-axis");
  const tickLabel = {
    fill: cssVar("color-text-secondary"),
    fontFamily: cssVar("text-label-family"),
    fontSize: cssVar("text-label-size"),
  };

  return (
    <svg
      viewBox={`0 0 ${PLOT.width} ${height}`}
      data-plot=""
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {series.map((one, index) => (
          // `currentColor` dentro do padrão resolve pela cor herdada no ponto
          // em que o padrão está declarado, e não pela cor da marca que o
          // referencia: a cor da série entra aqui.
          <g key={one.name} style={{ color: seriesColor(index) }}>
            <ChartHatchPattern id={`${hatchPrefix}-${index}`} />
          </g>
        ))}
      </defs>
      {panels.map((panelSeries, panel) => {
        const top = PLOT.margin.top + panel * (panelHeight + PLOT.panelGap);
        const last = panel === panels.length - 1;
        return (
          <Group
            key={panelSeries.map((one) => one.name).join("|")}
            left={PLOT.margin.left}
            top={top}
            data-panel={panelSeries[0]?.name ?? ""}
          >
            <g data-grid="">
              <GridRows
                scale={y}
                width={innerWidth}
                numTicks={PLOT.tickCount}
                stroke={cssVar("color-chart-grid")}
              />
            </g>
            {marksOf(panelSeries)}
            <g data-axis="left">
              <AxisLeft
                scale={y}
                numTicks={PLOT.tickCount}
                stroke={axisColor}
                tickStroke={axisColor}
                tickFormat={(value) => format(Number(value))}
                tickLabelProps={{ ...tickLabel, textAnchor: "end", dx: -4 }}
              />
            </g>
            {last ? (
              <g data-axis="bottom">
                <AxisBottom
                  scale={x}
                  top={panelHeight}
                  stroke={axisColor}
                  tickStroke={axisColor}
                  tickLabelProps={{ ...tickLabel, textAnchor: "middle" }}
                />
              </g>
            ) : null}
          </Group>
        );
      })}
    </svg>
  );
}
