import { useId } from "react";
import { DeclaredAbsence } from "../atoms/declared-absence/declared-absence";
import { BlockedProjection } from "../domain/blocked-projection/blocked-projection";
import { resolveTerms } from "../vocabulary/vocabulary";
import styles from "./chart.module.css";
import { ChartLegend } from "./legend";
import { ChartPlot } from "./plot";
import type { ChartCoreProps } from "./series";
import { ChartValueTable } from "./value-table";

// Quantas séries exigem legenda. Com uma só, o nome do gráfico já a nomeia;
// a partir de duas, distinguir séries passa a ser necessário, e a legenda é o
// que impede que a distinção dependa da cor.
const LEGEND_FROM = 2;

// O gráfico. É o núcleo que todas as formas usam: recebe séries já verificadas
// pelo tipo, ou um bloqueio, e nunca os dois.
//
// Bloqueado, não sobra nada do gráfico: nem eixo, nem grade, nem rótulo de
// escala. Eixo vazio comunica intervalo e ordem de grandeza, e isso é
// informação sobre um dado que a metodologia mandou não exibir.
export function DomainChart({
  shape,
  title,
  measure,
  series,
  blocked,
  terms,
}: ChartCoreProps) {
  const vocabulary = resolveTerms(terms);
  const hatchPrefix = useId();

  if (blocked !== undefined) {
    return (
      <figure
        className={styles.chart}
        data-chart=""
        data-shape={shape}
        data-blocked=""
      >
        <figcaption className={styles.title}>{title}</figcaption>
        <BlockedProjection
          reasons={blocked}
          {...(terms === undefined ? {} : { terms })}
        />
      </figure>
    );
  }

  const drawn = series ?? [];
  const absences = drawn.flatMap((one) =>
    one.points
      .filter((point) => point.kind === "missing")
      .map((point) => ({ series: one.name, category: point.category })),
  );

  return (
    <figure className={styles.chart} data-chart="" data-shape={shape}>
      <figcaption className={styles.title}>{title}</figcaption>
      {drawn.length >= LEGEND_FROM ? (
        <ChartLegend series={drawn} vocabulary={vocabulary} />
      ) : null}
      <p className={styles.scaleLabel} data-scale-label="">
        {measure.label}
      </p>
      <div className={styles.plot}>
        <ChartPlot
          shape={shape}
          series={drawn}
          measure={measure}
          hatchPrefix={hatchPrefix}
        />
      </div>
      {absences.length > 0 ? (
        // Ausência declarada, fora do desenho: na posição do ponto ausente não
        // há marca nenhuma, e é aqui que a ausência é dita. Nem zero, nem
        // interpolação, nem silêncio.
        <ul className={styles.absences} data-absences="">
          {absences.map((absence) => (
            <li
              key={`${absence.series}-${absence.category}`}
              data-series={absence.series}
              data-category={absence.category}
            >
              <DeclaredAbsence
                kind="unknown"
                reason={`${vocabulary.absence.pointMissing} — ${absence.series}, ${absence.category}`}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <ChartValueTable
        shape={shape}
        title={title}
        series={drawn}
        measure={measure}
        vocabulary={vocabulary}
      />
    </figure>
  );
}
