// Usos que o tipo recusa nas formas de gráfico. Como os arquivos homônimos dos
// átomos e das primitivas: não é executado, entra em `verify:types`, e cada
// supressão só compila enquanto o erro que ela anuncia existir. Se o limite de
// séries virar configuração, ou se um gráfico passar a aceitar duas escalas de
// valor, a supressão fica sem erro para suprimir e a verificação reprova.
import { BarChart } from "./bar/bar-chart";
import { DotChart } from "./dot/dot-chart";
import { LineChart } from "./line/line-chart";
import type { ChartSeries } from "./series";

const EVIDENCE = { href: "#evidencia", label: "Publicação de referência" };

const series = <Measure extends string>(
  name: string,
  measure: Measure,
): ChartSeries<Measure> => ({
  name,
  measure,
  points: [{ kind: "resolved", category: "jan", value: 1, evidence: EVIDENCE }],
});

const VEHICLES = { id: "vehicles", label: "Unidades" } as const;

export const fourSeriesInAnAllPairsShape = (
  <DotChart
    title="Emplacamentos"
    measure={VEHICLES}
    // @ts-expect-error a paleta validada sustenta três séries: a quarta não tem cor, e a forma recusa
    series={[
      series("A", "vehicles"),
      series("B", "vehicles"),
      series("C", "vehicles"),
      series("D", "vehicles"),
    ]}
  />
);

export const fourSeriesInAnAdjacentShape = (
  <BarChart
    title="Emplacamentos"
    measure={VEHICLES}
    // @ts-expect-error o limite vale em toda forma: nenhuma reordenação cria uma quarta cor
    series={[
      series("A", "vehicles"),
      series("B", "vehicles"),
      series("C", "vehicles"),
      series("D", "vehicles"),
    ]}
  />
);

export const twoValueScales = (
  <LineChart
    title="Emplacamentos"
    measure={VEHICLES}
    // @ts-expect-error duas escalas de valor no mesmo gráfico não compilam: a segunda medida é outra escala
    series={[series("A", "vehicles"), series("B", "share")]}
  />
);

export const blockedWithSeries = (
  // @ts-expect-error bloqueio substitui o gráfico: não existe gráfico bloqueado que também desenhe séries
  <BarChart
    title="Emplacamentos"
    measure={VEHICLES}
    blocked={["metric_not_found"]}
    series={[series("A", "vehicles")]}
  />
);

export const blockedWithoutReason = (
  // @ts-expect-error bloqueio sem razão não compila, como na primitiva que o exibe
  <BarChart title="Emplacamentos" measure={VEHICLES} blocked={[]} />
);

export const neitherSeriesNorBlocked = (
  // @ts-expect-error um gráfico desenha séries ou é substituído pelo bloqueio; nenhum dos dois não é estado
  <BarChart title="Emplacamentos" measure={VEHICLES} />
);

export const pointWithoutEvidence = (
  <BarChart
    title="Emplacamentos"
    measure={VEHICLES}
    series={[
      {
        name: "A",
        measure: "vehicles",
        // @ts-expect-error valor sem caminho até a evidência não é exibível, nem em gráfico
        points: [{ kind: "resolved", category: "jan", value: 1 }],
      },
    ]}
  />
);
