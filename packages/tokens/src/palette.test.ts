import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";
import {
  checkPalette,
  DISTANCE_SCALE,
  paletteFailures,
  paletteInput,
  SIMULATION,
  THRESHOLDS,
} from "./palette.js";
import { THEMES } from "./source.js";

// Tarefas 4.1 e 4.2 — as seis checagens sobre a paleta corrente, nos dois
// temas, contra a superfície de gráfico declarada em cada um. O modelo de
// simulação e os limiares vivem em palette.ts; aqui só se afirma que estão
// declarados e que a paleta passa.

test("o critério declara o modelo de simulação e os limiares", () => {
  expect(SIMULATION.model).toBe("Machado, Oliveira & Fernandes (2009)");
  expect(THRESHOLDS.hueAnchors.map((a) => a.name)).toEqual([
    "índigo",
    "verde",
    "amarelo",
  ]);
  expect(THRESHOLDS.surfaceContrastFloor).toBe(3);
  expect(DISTANCE_SCALE).toBe(100);
  expect(THRESHOLDS.cvdSeparationFloor).toBe(6);
  expect(THRESHOLDS.cvdSeparationTarget).toBe(8);
  expect(THRESHOLDS.normalSeparationFloor).toBe(15);
});

for (const theme of THEMES) {
  test(`a paleta categórica passa nas seis checagens no tema ${theme}`, () => {
    const input = paletteInput(theme, tokens);
    expect(input.series.map((s) => s.name)).toEqual([
      "color.chart.series.1",
      "color.chart.series.2",
      "color.chart.series.3",
    ]);

    // Superfície ausente não é tratada aqui: a própria checagem reprova
    // nomeando o tema, e é essa mensagem que precisa aparecer.
    const report = checkPalette(input);
    expect(paletteFailures(report)).toEqual([]);
    expect(report.results.map((r) => r.check)).toHaveLength(7);
    expect(report.worstPair).not.toBeNull();
  });
}

// Tarefa 4.3 — valor reprovado bloqueia a verificação nomeando a checagem, o
// par e o tema.
test("um valor que reprova é nomeado com a checagem, o par e o tema", () => {
  const report = checkPalette({
    theme: "dark",
    // Série 2 igual à série 1: reprova separação em todos os modelos.
    series: [
      { name: "color.chart.series.1", value: "#706fe2" },
      { name: "color.chart.series.2", value: "#706fe2" },
      { name: "color.chart.series.3", value: "#b28d04" },
    ],
    surface: "#18181d",
  });
  expect(report.passed).toBe(false);
  const failures = paletteFailures(report);
  expect(failures).toContain(
    "[dark] piso de separação para visão normal: par color.chart.series.1 × color.chart.series.2 = 0.0 < piso 15 (ΔEok ×100)",
  );
  expect(failures).toContain(
    "[dark] separação sob protanopia: par color.chart.series.1 × color.chart.series.2 = 0.0 < piso 6 (ΔEok ×100)",
  );
  expect(failures).toContain(
    "[dark] âncoras de matiz em ordem fixa: color.chart.series.2 tem matiz 280.4°, âncora verde 150° ± 15°",
  );
});

test("contraste insuficiente contra a superfície reprova nomeando a série e o tema", () => {
  const report = checkPalette({
    theme: "light",
    series: [
      { name: "color.chart.series.1", value: "#4640a7" },
      { name: "color.chart.series.2", value: "#036429" },
      { name: "color.chart.series.3", value: "#b28d04" },
    ],
    // Superfície cinza-claro: o amarelo cai abaixo de 3:1.
    surface: "#f7f7f8",
  });
  expect(paletteFailures(report)).toEqual([
    "[light] contraste contra a superfície do tema: color.chart.series.3 contra #f7f7f8 = 2.93:1 < 3:1",
  ]);
});

// Tarefa 4.4 — superfície ausente falha nomeando o tema, sem valor implícito.
test("superfície de gráfico ausente faz a checagem falhar nomeando o tema", () => {
  const resolved: Record<string, Record<"light" | "dark", string>> = {
    "color-chart-series-1": { light: "#4640a7", dark: "#706fe2" },
    "color-chart-series-2": { light: "#036429", dark: "#067833" },
    "color-chart-series-3": { light: "#b28d04", dark: "#b28d04" },
  };
  const input = paletteInput("dark", resolved);
  expect(input.surface).toBeUndefined();

  const report = checkPalette(input);
  expect(report.passed).toBe(false);
  expect(paletteFailures(report)).toEqual([
    "[dark] contraste contra a superfície do tema: superfície de gráfico não declarada no tema dark",
  ]);
});
