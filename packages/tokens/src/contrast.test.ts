import { expect, test } from "vitest";
import { tokens } from "../generated/tokens.js";
import {
  CONTRAST_THRESHOLDS,
  type ContrastInput,
  checkContrast,
  contrastInput,
  measureTheme,
} from "./contrast.js";
import { loadSource, THEMES, type Theme } from "./source.js";

// Tarefas 2.3 a 2.7 e 5.1 — as checagens de contraste dos pares de ação. O
// critério vive em contrast.ts; aqui se afirma que ele está declarado, que a
// paleta corrente o satisfaz, e que cada reprovação sai com o par, a razão, o
// piso e o tema nomeados.

type Resolved = Record<string, Record<Theme, string>>;

const source = loadSource();

function inputsFrom(resolved: Resolved): Record<Theme, ContrastInput> {
  return Object.fromEntries(
    THEMES.map((theme) => [theme, contrastInput(theme, resolved, source)]),
  ) as Record<Theme, ContrastInput>;
}

const current = (): Resolved => tokens as Resolved;

// Entrada sintética de um tema, para os testes de plantio. Os valores padrão
// são os do tema escuro proposto; cada teste troca só o que quer provar.
function darkInput(over: Partial<ContrastInput> = {}): ContrastInput {
  const merged: ContrastInput = {
    theme: "dark",
    surfaces: [
      { name: "color.surface.base", value: "#101013" },
      { name: "color.surface.raised", value: "#18181d" },
      { name: "color.surface.sunken", value: "#101013" },
    ],
    chartSurface: { name: "color.chart.surface", value: "#18181d" },
    action: { name: "color.action.primary", value: "#8788fe" },
    hover: { name: "color.action.primary-hover", value: "#a8aefe" },
    onAction: { name: "color.text.on-action", value: "#101013" },
    focusRing: undefined,
    ...over,
  };
  // O anel de foco segue a cor de ação a menos que o teste o descole de
  // propósito: um plantio que mexe na ação não deve reprovar também no anel.
  return merged.focusRing === undefined && merged.action !== undefined
    ? {
        ...merged,
        focusRing: {
          name: "color.focus.ring",
          value: merged.action.value,
          primitive: merged.action.primitive,
        },
      }
    : merged;
}

function lightInput(over: Partial<ContrastInput> = {}): ContrastInput {
  const merged: ContrastInput = {
    theme: "light",
    surfaces: [
      { name: "color.surface.base", value: "#ffffff" },
      { name: "color.surface.raised", value: "#ffffff" },
      { name: "color.surface.sunken", value: "#f7f7f8" },
    ],
    chartSurface: { name: "color.chart.surface", value: "#ffffff" },
    action: { name: "color.action.primary", value: "#302681" },
    hover: { name: "color.action.primary-hover", value: "#4640a7" },
    onAction: { name: "color.text.on-action", value: "#ffffff" },
    focusRing: undefined,
    ...over,
  };
  return merged.focusRing === undefined && merged.action !== undefined
    ? {
        ...merged,
        focusRing: {
          name: "color.focus.ring",
          value: merged.action.value,
          primitive: merged.action.primitive,
        },
      }
    : merged;
}

test("o critério declara os pisos e a tolerância entre os passos", () => {
  expect(CONTRAST_THRESHOLDS.textFloor).toBe(4.5);
  expect(CONTRAST_THRESHOLDS.graphicObjectFloor).toBe(3);
  expect(CONTRAST_THRESHOLDS.hoverStepTolerance).toBe(0.02);
});

// Tarefa 2.3 — a checagem sobre os tokens correntes, nos dois temas. Antes dos
// grupos 3 e 4 este teste reprova, nomeando `color.action.primary` ×
// `color.surface.raised` no escuro (4,263:1) e o hover no escuro (2,308:1).
test("os pares de ação sustentam os pisos nos dois temas", () => {
  const report = checkContrast(inputsFrom(current()));
  expect(report.violations).toEqual([]);
  expect(report.passed).toBe(true);
});

// A matriz de `design.md`, medida sobre os tokens correntes. É o que o ciclo
// entrega, e é por isso que ela é afirmada valor a valor.
const MATRIX: Record<Theme, [string, string, number][]> = {
  light: [
    ["color.action.primary", "color.surface.base", 12.21],
    ["color.action.primary", "color.surface.sunken", 11.404],
    ["color.action.primary", "color.surface.raised", 12.21],
    ["color.action.primary", "color.chart.surface", 12.21],
    ["color.text.on-action", "color.action.primary", 12.21],
    ["color.text.on-action", "color.action.primary-hover", 8.23],
    ["color.focus.ring", "color.surface.raised", 12.21],
  ],
  dark: [
    ["color.action.primary", "color.surface.base", 6.316],
    ["color.action.primary", "color.surface.sunken", 6.316],
    ["color.action.primary", "color.surface.raised", 5.882],
    ["color.action.primary", "color.chart.surface", 5.882],
    ["color.text.on-action", "color.action.primary", 6.316],
    ["color.text.on-action", "color.action.primary-hover", 9.181],
    ["color.focus.ring", "color.surface.raised", 5.882],
  ],
};

for (const theme of THEMES) {
  test(`a matriz medida no tema ${theme} bate com o desenho`, () => {
    const measured = measureTheme(inputsFrom(current())[theme]);
    const found = (a: string, b: string): number | undefined =>
      measured.pairs.find((pair) => pair.pair[0] === a && pair.pair[1] === b)
        ?.ratio;
    for (const [a, b, expected] of MATRIX[theme]) {
      expect(found(a, b), `${a} × ${b}`).toBeCloseTo(expected, 3);
    }
  });
}

test("a execução aprovada registra o pior par e a margem de cada tema", () => {
  const report = checkContrast(inputsFrom(current()));
  expect(report.byTheme.dark.worst?.pair).toEqual([
    "color.action.primary",
    "color.surface.raised",
  ]);
  expect(report.byTheme.dark.worst?.margin).toBeCloseTo(1.382, 3);
  expect(report.byTheme.light.worst?.margin).toBeGreaterThan(0);
  expect(report.notes.join("\n")).toContain("pior par");
});

// Tarefa 2.4 — um plantio por cenário do requisito "Cor de ação legível contra
// toda superfície neutra do tema".

test("par abaixo do piso reprova nomeando o par, a razão, o piso e o tema", () => {
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      action: { name: "color.action.primary", value: "#4640a7" },
    }),
  });
  expect(report.violations).toContain(
    "[dark] cor de ação contra superfície neutra: color.action.primary × color.surface.base = 2.308:1 < piso 4.5:1",
  );
});

test("superfície que reprova em um tema só é nomeada, e não apenas o tema", () => {
  // `indigo.400`, o defeito de hoje: passa contra `surface.base` e reprova
  // contra `surface.raised`, no mesmo tema.
  const violations = checkContrast({
    light: lightInput(),
    dark: darkInput({
      action: { name: "color.action.primary", value: "#706fe2" },
    }),
  }).violations.filter((message) =>
    message.includes("cor de ação contra superfície neutra"),
  );
  expect(violations).toContain(
    "[dark] cor de ação contra superfície neutra: color.action.primary × color.surface.raised = 4.263:1 < piso 4.5:1",
  );
  expect(violations.join("\n")).not.toContain("color.surface.base");
});

test("superfície neutra nova entra na varredura sem editar este arquivo", () => {
  // A superfície é plantada na fonte resolvida, e nada aqui a enumera: quem a
  // encontra é a checagem, lendo os tokens.
  const planted: Resolved = {
    ...current(),
    "color-surface-overlay": { light: "#ffffff", dark: "#5d5dcf" },
  };
  const report = checkContrast(inputsFrom(planted));
  expect(report.violations.join("\n")).toContain("color.surface.overlay");
});

test("anel de foco descolado da cor de ação reprova nomeando os dois primitivos", () => {
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      action: {
        name: "color.action.primary",
        value: "#8788fe",
        primitive: "color.indigo.300",
      },
      focusRing: {
        name: "color.focus.ring",
        value: "#706fe2",
        primitive: "color.indigo.400",
      },
    }),
  });
  expect(report.violations).toContain(
    "[dark] anel de foco: color.focus.ring → color.indigo.400 (#706fe2) não é color.action.primary → color.indigo.300 (#8788fe)",
  );
});

// Tarefa 2.5 — um plantio por cenário do requisito "Estado de interação com
// legibilidade provada".

test("hover abaixo do piso reprova nomeando o estado, o tema, a razão e o piso", () => {
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      hover: { name: "color.action.primary-hover", value: "#3f3f9e" },
    }),
  });
  expect(report.violations).toContain(
    "[dark] estado de hover: color.text.on-action × color.action.primary-hover = 2.185:1 < piso 4.5:1",
  );
});

test("valor de ação repetido entre temas sai com a razão medida e a causa nomeada", () => {
  // O defeito exato deste ciclo: `indigo.600` no hover dos dois temas.
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      hover: { name: "color.action.primary-hover", value: "#4640a7" },
    }),
  });
  const hover = report.violations.filter((message) =>
    message.includes("estado de hover"),
  );
  expect(hover).toHaveLength(1);
  expect(hover[0]).toContain("2.308:1 < piso 4.5:1");
  expect(hover[0]).toContain(
    "color.action.primary-hover não invertido: #4640a7 nos dois temas",
  );
});

test("hover mais escuro que o repouso reprova nomeando as duas luminosidades", () => {
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      hover: { name: "color.action.primary-hover", value: "#4640a7" },
    }),
  });
  expect(report.violations.join("\n")).toContain(
    "[dark] sentido do passo de hover: L do hover 0.440 não é maior que L do repouso 0.680",
  );
});

test("passos que divergem entre os temas reprovam nomeando os dois passos", () => {
  const report = checkContrast({
    light: lightInput(),
    // `indigo.100` hipotético: hover legível, mas com passo muito maior.
    dark: darkInput({
      hover: { name: "color.action.primary-hover", value: "#d6d9ff" },
    }),
  });
  const divergentes = report.violations.filter((message) =>
    message.startsWith("passos de hover entre os temas"),
  );
  expect(divergentes).toHaveLength(1);
  expect(divergentes[0]).toContain("light 0.096");
  expect(divergentes[0]).toContain("tolerância 0.02");
});

// Tarefa 2.6 — o diagnóstico não reprova sozinho.
test("valor repetido que sustenta os dois pisos sai só no registro", () => {
  // Par de temas sintético: superfícies escuras nos dois, e a mesma cor de
  // ação em ambos. A repetição é legítima porque os dois pisos se sustentam.
  const escuro = (theme: Theme): ContrastInput => ({
    ...darkInput(),
    theme,
  });
  const report = checkContrast({
    light: escuro("light"),
    dark: escuro("dark"),
  });
  expect(report.violations).toEqual([]);
  expect(report.passed).toBe(true);
  expect(report.notes.join("\n")).toContain(
    "color.action.primary não invertido: #8788fe nos dois temas",
  );
});

// Tarefa 2.7 — superfície neutra sem consumidor de ação é varrida assim mesmo.
test("superfície neutra sem consumidor de ação é varrida ao piso de texto", () => {
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      surfaces: [
        { name: "color.surface.base", value: "#101013" },
        { name: "color.surface.raised", value: "#18181d" },
        // Superfície declarada e sem nenhum componente que ponha ação nela.
        { name: "color.surface.scrim", value: "#6f6fe0" },
      ],
    }),
  });
  expect(report.violations).toContain(
    "[dark] cor de ação contra superfície neutra: color.action.primary × color.surface.scrim = 1.389:1 < piso 4.5:1",
  );
});

// Tarefa 5.1 — a superfície de gráfico é uma das superfícies neutras do tema.
test("a superfície de gráfico de cada tema é uma das superfícies neutras", () => {
  const report = checkContrast(inputsFrom(current()));
  expect(
    report.violations.filter((message) =>
      message.includes("superfície de gráfico fora do conjunto neutro"),
    ),
  ).toEqual([]);
});

test("superfície de gráfico com valor próprio reprova nomeando o tema e o valor", () => {
  const report = checkContrast({
    light: lightInput(),
    dark: darkInput({
      chartSurface: { name: "color.chart.surface", value: "#1f1f26" },
    }),
  });
  expect(report.violations).toContain(
    "[dark] superfície de gráfico fora do conjunto neutro: color.chart.surface = #1f1f26 não é o valor de nenhuma superfície neutra do tema",
  );
});
