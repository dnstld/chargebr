import { useId } from "react";
import styles from "./chart.module.css";
import { ChartLegend } from "./legend";
import { CHART_SERIES_LIMIT } from "./palette";
import { ChartPlot } from "./plot";
import type { ChartCoreProps } from "./series";
import { ChartValueTable } from "./value-table";

// Quantas séries exigem legenda. Com uma só, o nome do gráfico já a nomeia;
// a partir de duas, distinguir séries passa a ser necessário, e a legenda é o
// que impede que a distinção dependa da cor.
const LEGEND_FROM = 2;

// O gráfico. É o núcleo que todas as formas usam.
export function DomainChart({ shape, title, measure, series }: ChartCoreProps) {
  if (series.length > CHART_SERIES_LIMIT) {
    throw new Error(
      `O gráfico "${title}", na forma ${shape}, recebeu ${series.length} séries; a paleta validada sustenta ${CHART_SERIES_LIMIT}. Agrupe o excedente ou use pequenos múltiplos.`,
    );
  }

  const hatchPrefix = useId();

  return (
    <figure className={styles.chart} data-chart="" data-shape={shape}>
      <figcaption className={styles.title}>{title}</figcaption>
      {series.length >= LEGEND_FROM ? <ChartLegend series={series} /> : null}
      <p className={styles.scaleLabel} data-scale-label="">
        {measure.label}
      </p>
      <div className={styles.plot}>
        <ChartPlot
          shape={shape}
          series={series}
          measure={measure}
          hatchPrefix={hatchPrefix}
        />
      </div>
      <ChartValueTable title={title} series={series} measure={measure} />
    </figure>
  );
}
