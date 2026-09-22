import type { FixtureOrigin } from "../../fixture-origin";
import type { ChartMeasure, ChartSeries } from "../series";

// Fixture derivada da saída real do contrato de leitura
// `chargebr-methodology-reading-v1` para a carga canônica 0007 (ABVE, veículos
// leves eletrificados, janeiro de 2025) — a mesma origem da fixture das
// primitivas em src/domain/fixtures/abve-janeiro-2025.ts, aqui na forma que a
// camada de gráficos recebe. Cada campo diz de onde veio; nada é inventado.
export const FIXTURE_ORIGIN: FixtureOrigin = "contract";
export const FIXTURE_ORIGIN_NOTE =
  "Projeção as_published da carga canônica 0007, tal como docs/revisao-contrato-leitura-0001.md registra a execução de 11 de setembro de 2026.";

// as_published.values[*].evidence[0].publication — a mesma publicação sustenta
// o resultado pela metodologia vigente e o contrafactual publicado ao lado.
const PUBLICATION = {
  href: "https://abve.org.br/abve-aprimora-classificacao-dos-eletrificados-a-partir-de-janeiro-veja-os-numeros/",
  label:
    "ABVE, 10 de fevereiro de 2025: ABVE aprimora classificação dos veículos eletrificados a partir de janeiro; veja os números",
};

// A única categoria que o contrato produz para esta carga: a observação é de
// janeiro de 2025. Uma categoria só — é o que existe, e a fixture não inventa
// meses para encher um eixo.
const JANUARY = "Janeiro de 2025";

// A escala de valor: unidades de veículos leves eletrificados. As duas séries
// abaixo estão nela, e é por isso que cabem no mesmo gráfico.
export const ELECTRIFIED_UNITS: ChartMeasure<"electrified_units"> = {
  id: "electrified_units",
  label: "Veículos leves eletrificados (unidades)",
};

// as_published.values[value_role = primary].value = 12556
export const CURRENT_METHODOLOGY: ChartSeries<"electrified_units"> = {
  name: "Metodologia vigente",
  measure: "electrified_units",
  points: [
    {
      kind: "resolved",
      category: JANUARY,
      value: 12556,
      evidence: PUBLICATION,
    },
  ],
};

// as_published.values[value_role = counterfactual].value = 16502. É série
// própria, e não outra escala: a fonte publicou os dois números na mesma
// unidade, para mostrar o efeito da mudança de critério. O nome da série diz
// qual critério produziu cada um; o gráfico não os soma nem os funde.
export const PREVIOUS_CRITERION: ChartSeries<"electrified_units"> = {
  name: "Critério anterior",
  measure: "electrified_units",
  points: [
    {
      kind: "resolved",
      category: JANUARY,
      value: 16502,
      evidence: PUBLICATION,
    },
  ],
};

export const FROM_CONTRACT = [CURRENT_METHODOLOGY, PREVIOUS_CRITERION] as const;
