import { Text } from "../../atoms/text/text";
import { useFormattedNumber } from "../../atoms/text/use-formatted-number";
import styles from "./chart.module.css";
import { type ChartMeasure, type ChartSeries, hasValue } from "./series";

export interface ChartValueTableProps {
  title: string;
  series: readonly ChartSeries[];
  measure: ChartMeasure;
}

function ValueCell({
  value,
  format,
}: {
  value: number;
  format: (value: number) => string;
}) {
  const formatted = useFormattedNumber(value, format);
  return <Text tabular>{formatted}</Text>;
}

// A representação equivalente em texto. Não é resumo do gráfico: é a mesma
// informação por outro meio — cada valor e a categoria em que cai. É o que
// torna os valores alcançáveis sem a visão.
export function ChartValueTable({
  title,
  series,
  measure,
}: ChartValueTableProps) {
  const format = (value: number): string =>
    new Intl.NumberFormat("pt-BR", measure.format).format(value);
  return (
    <table className={styles.table} data-value-table="">
      <caption className={styles.caption}>
        Representação em texto do gráfico: {title}
      </caption>
      <thead>
        <tr>
          <th scope="col">Série</th>
          <th scope="col">Categoria</th>
          <th scope="col">{measure.label}</th>
        </tr>
      </thead>
      <tbody>
        {series.flatMap((one) =>
          one.points.map((point) => (
            <tr
              key={`${one.name}-${point.category}`}
              data-series={one.name}
              data-category={point.category}
            >
              <th scope="row">{one.name}</th>
              <td>{point.category}</td>
              <td>
                {hasValue(point) ? (
                  <ValueCell value={point.value} format={format} />
                ) : (
                  <Text>—</Text>
                )}
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}
