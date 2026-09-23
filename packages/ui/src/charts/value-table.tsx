import { DeclaredAbsence } from "../atoms/declared-absence/declared-absence";
import { EvidenceAnchor } from "../atoms/evidence-anchor/evidence-anchor";
import { NumericValue } from "../atoms/numeric-value/numeric-value";
import { StatusMarker } from "../atoms/status-marker/status-marker";
import type { Terms } from "../vocabulary/vocabulary";
import styles from "./chart.module.css";
import { type ChartMeasure, type ChartSeries, hasValue } from "./series";
import type { ChartShape } from "./shapes";
import { shapeDefinition } from "./shapes";

export interface ChartValueTableProps {
  shape: ChartShape;
  title: string;
  series: readonly ChartSeries[];
  measure: ChartMeasure;
  vocabulary: Terms;
}

// A representação equivalente em texto. Não é resumo do gráfico: é a mesma
// informação por outro meio — cada valor, a categoria em que cai, o estado
// quando não é resolvido, e o caminho até a evidência daquele valor. É o que
// torna os valores alcançáveis sem a visão, e de quebra é o único lugar em que
// a proveniência cabe, porque nenhum pixel a carrega.
export function ChartValueTable({
  shape,
  title,
  series,
  measure,
  vocabulary,
}: ChartValueTableProps) {
  const stacks = shapeDefinition(shape).stacks;
  return (
    <table className={styles.table} data-value-table="">
      <caption className={styles.caption}>
        {vocabulary.chart.textEquivalent}: {title}
      </caption>
      <thead>
        <tr>
          <th scope="col">{vocabulary.chart.series}</th>
          <th scope="col">{vocabulary.chart.category}</th>
          <th scope="col">{measure.label}</th>
          <th scope="col">{vocabulary.chart.evidence}</th>
        </tr>
      </thead>
      <tbody>
        {series.flatMap((one) =>
          one.points.map((point) => (
            <tr
              key={`${one.name}-${point.category}`}
              data-series={one.name}
              data-category={point.category}
              data-kind={point.kind}
            >
              <th scope="row">{one.name}</th>
              <td>{point.category}</td>
              <td>
                {hasValue(point) ? (
                  <span className={styles.cellValue}>
                    <NumericValue
                      value={point.value}
                      valueRole="primary"
                      {...(measure.format ? { format: measure.format } : {})}
                    />
                    {point.kind === "unresolved" ? (
                      <StatusMarker
                        axis="normalization_status"
                        status="unresolved"
                        axisLabel={vocabulary.axis.normalization_status}
                        label={
                          stacks
                            ? `${vocabulary.status.unresolved} — ${vocabulary.chart.notAggregated}`
                            : vocabulary.status.unresolved
                        }
                      />
                    ) : null}
                  </span>
                ) : (
                  <DeclaredAbsence
                    kind="unknown"
                    reason={vocabulary.absence.pointMissing}
                  />
                )}
              </td>
              <td>
                {hasValue(point) ? (
                  <EvidenceAnchor
                    href={point.evidence.href}
                    label={point.evidence.label}
                  />
                ) : (
                  <DeclaredAbsence
                    kind="unknown"
                    reason={vocabulary.absence.pointMissing}
                  />
                )}
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}
