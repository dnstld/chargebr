import type { Terms } from "../vocabulary/vocabulary";
import { seriesColor, seriesSymbol } from "./palette";
import type { ChartSeries } from "./series";
import styles from "./chart.module.css";

export interface ChartLegendProps {
  series: readonly ChartSeries[];
  vocabulary: Terms;
}

const SWATCH = 14;
const CENTER = SWATCH / 2;
const RADIUS = 5;

// Legenda. Existe a partir de duas séries e nomeia cada uma; a amostra carrega
// a mesma forma que a marca desenhada, e não só a cor. É HTML, fora do SVG,
// para que a leitura assistida a alcance como alcança qualquer lista.
export function ChartLegend({ series, vocabulary }: ChartLegendProps) {
  return (
    <div className={styles.legend} data-legend="">
      <p className={styles.legendTitle}>{vocabulary.chart.legend}</p>
      <ul className={styles.legendItems}>
        {series.map((one, index) => (
          <li
            key={one.name}
            className={styles.legendItem}
            data-series={one.name}
          >
            <svg
              className={styles.swatch}
              viewBox={`0 0 ${SWATCH} ${SWATCH}`}
              data-symbol={seriesSymbol(index)}
              aria-hidden="true"
              style={{ color: seriesColor(index) }}
            >
              <Swatch index={index} />
            </svg>
            <span>{one.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Swatch({ index }: { index: number }) {
  const fill = "currentColor";
  switch (seriesSymbol(index)) {
    case "circle":
      return <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={fill} />;
    case "square":
      return (
        <rect
          x={CENTER - RADIUS}
          y={CENTER - RADIUS}
          width={RADIUS * 2}
          height={RADIUS * 2}
          fill={fill}
        />
      );
    default:
      return (
        <polygon
          points={`${CENTER},${CENTER - RADIUS} ${CENTER + RADIUS},${CENTER + RADIUS} ${CENTER - RADIUS},${CENTER + RADIUS}`}
          fill={fill}
        />
      );
  }
}
