import { tokens } from "@chargebr/tokens";
import {
  checkPalette,
  type PairScope,
  paletteFailures,
  paletteInput,
  THEMES,
} from "@chargebr/tokens/palette";
import { expect, test } from "vitest";
import { CHART_SERIES_LIMIT, CHART_SERIES_TOKENS } from "./palette";
import { CHART_SHAPE_IDS, shapeDefinition } from "./shapes";

// A checagem de paleta por forma. O que muda de uma forma para outra não é o
// critério — são as mesmas seis checagens — e sim a lista de pares sobre a
// qual as checagens de separação correm. A lista é declarada pela forma, e
// aqui ela é executada: por forma e por tema.

const SERIES = [
  "color.chart.series.1",
  "color.chart.series.2",
  "color.chart.series.3",
] as const;

const EXPECTED_PAIRS: Record<PairScope, [string, string][]> = {
  adjacent: [
    [SERIES[0], SERIES[1]],
    [SERIES[1], SERIES[2]],
  ],
  all: [
    [SERIES[0], SERIES[1]],
    [SERIES[0], SERIES[2]],
    [SERIES[1], SERIES[2]],
  ],
};

test("o limite de séries é o tamanho da paleta validada, não um número escolhido", () => {
  expect(CHART_SERIES_LIMIT).toBe(CHART_SERIES_TOKENS.length);
});

test("as duas listas de pares são de fato diferentes", () => {
  // Sem isto, uma forma poderia declarar `adjacent` e receber a checagem mais
  // dura sem que ninguém notasse: as duas listas passariam igual.
  expect(EXPECTED_PAIRS.adjacent).not.toEqual(EXPECTED_PAIRS.all);
});

for (const shape of CHART_SHAPE_IDS) {
  const scope = shapeDefinition(shape).pairScope;
  for (const theme of THEMES) {
    test(`forma ${shape}, tema ${theme}: paleta passa com a lista ${scope}`, () => {
      const report = checkPalette(paletteInput(theme, tokens, scope));

      // A lista executada é a que a forma declara, e não a que este teste
      // gostaria: o relatório diz qual foi.
      expect(report.pairScope).toBe(scope);
      for (const result of report.results) {
        if (result.pairs === undefined) continue;
        expect(result.pairs, `pares de "${result.check}"`).toEqual(
          EXPECTED_PAIRS[scope],
        );
      }

      expect(paletteFailures(report)).toEqual([]);
      expect(report.passed).toBe(true);
    });
  }
}
