import { oklch, wcagContrast } from "culori";
import { THRESHOLDS } from "./palette.js";
import {
  referenceTarget,
  type SourceToken,
  THEMES,
  type Theme,
} from "./source.js";

// Os temas entram aqui pelo mesmo motivo de `palette.ts`: quem executa a
// checagem não redeclara a lista.
export { THEMES, type Theme } from "./source.js";

// As checagens de contraste dos pares que a interface realmente compõe: a cor
// de ação contra as superfícies do seu tema, e o texto sobre a ação em repouso
// e em hover. Este arquivo é o critério — os pisos e a tolerância declarados
// abaixo fazem parte da definição, e mudá-los é mudar este arquivo à vista,
// nunca contornar um teste.

export const CONTRAST_THRESHOLDS = {
  // WCAG 1.4.3, texto: vale para a cor de ação contra a superfície que a
  // hospeda e para o texto sobre a ação, nos dois estados declarados.
  textFloor: 4.5,
  // WCAG 1.4.11, objeto gráfico: vale para o anel de foco, que é forma e não
  // texto. É o mesmo piso da checagem de paleta, e vem de lá para que os dois
  // critérios não possam divergir em silêncio.
  graphicObjectFloor: THRESHOLDS.surfaceContrastFloor,
  // Diferença máxima entre o passo de hover de um tema e o do outro, em
  // luminosidade OKLCH. O que é comum aos temas é o passo, não a razão.
  hoverStepTolerance: 0.02,
} as const;

export interface ContrastToken {
  /** Nome do token, para a mensagem: `color.action.primary`. */
  name: string;
  /** Cor resolvida, em qualquer notação que `culori` leia. */
  value: string;
  /** Primitivo que o token referencia, quando conhecido; só entra em mensagem. */
  primitive?: string | undefined;
}

export interface ContrastInput {
  theme: Theme;
  /** Superfícies neutras do tema, lidas da fonte e não de uma lista escrita aqui. */
  surfaces: ContrastToken[];
  /** Superfície de gráfico; entra na varredura como qualquer outra superfície. */
  chartSurface: ContrastToken | undefined;
  action: ContrastToken | undefined;
  hover: ContrastToken | undefined;
  onAction: ContrastToken | undefined;
  focusRing: ContrastToken | undefined;
}

export interface MeasuredPair {
  pair: [string, string];
  ratio: number;
  floor: number;
  /** Distância acima do piso; negativa quando o par reprova. */
  margin: number;
}

export interface ThemeMeasurement {
  theme: Theme;
  pairs: MeasuredPair[];
  /** Razão do texto sobre a ação em repouso; `null` sem os dois tokens. */
  rest: number | null;
  /** Razão do texto sobre a ação em hover; `null` sem os dois tokens. */
  hover: number | null;
  /** Passo de luminosidade OKLCH do repouso para o hover; `null` sem os dois. */
  step: number | null;
  /** Par de pior margem sobre o piso; `null` quando nada foi medido. */
  worst: MeasuredPair | null;
}

export interface ContrastReport {
  passed: boolean;
  /** Mensagens de reprovação, já anotadas pelos diagnósticos. */
  violations: string[];
  /** Registro: o que a execução mediu, mesmo quando ela passa. */
  notes: string[];
  byTheme: Record<Theme, ThemeMeasurement>;
}

// Uma violação carrega os tokens que a produziram para que um diagnóstico
// consiga achá-la e anotá-la. O diagnóstico nunca cria violação própria.
export interface Violation {
  tokens: string[];
  message: string;
}

const CHECKS = {
  surface: "cor de ação contra superfície neutra",
  onAction: "texto sobre a ação",
  hover: "estado de hover",
  focus: "anel de foco",
  stepDirection: "sentido do passo de hover",
  stepAgreement: "passos de hover entre os temas",
  chartSurface: "superfície de gráfico fora do conjunto neutro",
  missing: "token ausente",
} as const;

const ratio = (a: string, b: string): number => wcagContrast(a, b);
const lightness = (color: string): number => oklch(color)?.l ?? Number.NaN;
const describe = (token: ContrastToken): string =>
  token.primitive === undefined
    ? `${token.name} (${token.value})`
    : `${token.name} → ${token.primitive} (${token.value})`;

// Superfícies que a cor de ação varre neste tema: as neutras declaradas mais a
// de gráfico. Não há mecanismo de isenção — uma superfície que nenhum
// componente use para hospedar ação é varrida assim mesmo.
function sweptSurfaces(input: ContrastInput): ContrastToken[] {
  return input.chartSurface === undefined
    ? input.surfaces
    : [...input.surfaces, input.chartSurface];
}

function measurePair(
  foreground: ContrastToken,
  background: ContrastToken,
  floor: number,
): MeasuredPair {
  const value = ratio(foreground.value, background.value);
  return {
    pair: [foreground.name, background.name],
    ratio: value,
    floor,
    margin: value - floor,
  };
}

// Pares medidos de um tema, na ordem em que a matriz do desenho os lista: a
// ação contra cada superfície varrida, o texto sobre a ação nos dois estados, e
// o anel de foco contra cada superfície, ao piso de objeto gráfico.
export function measureTheme(input: ContrastInput): ThemeMeasurement {
  const { textFloor, graphicObjectFloor } = CONTRAST_THRESHOLDS;
  const surfaces = sweptSurfaces(input);
  const pairs: MeasuredPair[] = [];

  if (input.action) {
    for (const surface of surfaces)
      pairs.push(measurePair(input.action, surface, textFloor));
  }
  const rest =
    input.onAction && input.action
      ? ratio(input.onAction.value, input.action.value)
      : null;
  if (input.onAction && input.action)
    pairs.push(measurePair(input.onAction, input.action, textFloor));

  const hover =
    input.onAction && input.hover
      ? ratio(input.onAction.value, input.hover.value)
      : null;
  if (input.onAction && input.hover)
    pairs.push(measurePair(input.onAction, input.hover, textFloor));

  if (input.focusRing) {
    for (const surface of surfaces)
      pairs.push(measurePair(input.focusRing, surface, graphicObjectFloor));
  }

  const step =
    input.action && input.hover
      ? lightness(input.hover.value) - lightness(input.action.value)
      : null;

  let worst: MeasuredPair | null = null;
  for (const pair of pairs) {
    if (worst === null || pair.margin < worst.margin) worst = pair;
  }

  return { theme: input.theme, pairs, rest, hover, step, worst };
}

// Violações de um tema, a partir dos seus tokens resolvidos. É esta função que
// a checagem executa por tema; o que depende dos dois temas — o acordo entre os
// passos e o diagnóstico de valor repetido — fica em `checkContrast`.
export function themeViolations(input: ContrastInput): Violation[] {
  const { theme } = input;
  const { textFloor } = CONTRAST_THRESHOLDS;
  const violations: Violation[] = [];

  const required: [string, ContrastToken | undefined][] = [
    ["color.action.primary", input.action],
    ["color.action.primary-hover", input.hover],
    ["color.text.on-action", input.onAction],
    ["color.focus.ring", input.focusRing],
    ["color.chart.surface", input.chartSurface],
  ];
  for (const [name, token] of required) {
    if (token === undefined) {
      violations.push({
        tokens: [name],
        message: `[${theme}] ${CHECKS.missing}: ${name} não está declarado`,
      });
    }
  }

  // A cor de ação contra cada superfície varrida, ao piso de texto.
  if (input.action) {
    for (const surface of sweptSurfaces(input)) {
      const measured = measurePair(input.action, surface, textFloor);
      if (measured.margin < 0) {
        violations.push({
          tokens: [input.action.name, surface.name],
          message: `[${theme}] ${CHECKS.surface}: ${input.action.name} × ${surface.name} = ${measured.ratio.toFixed(3)}:1 < piso ${textFloor}:1`,
        });
      }
    }
  }

  // O texto sobre a ação, em repouso e em hover.
  const overAction: [string, ContrastToken | undefined][] = [
    [CHECKS.onAction, input.action],
    [CHECKS.hover, input.hover],
  ];
  for (const [check, token] of overAction) {
    if (!input.onAction || !token) continue;
    const measured = measurePair(input.onAction, token, textFloor);
    if (measured.margin < 0) {
      violations.push({
        tokens: [token.name, input.onAction.name],
        message: `[${theme}] ${check}: ${input.onAction.name} × ${token.name} = ${measured.ratio.toFixed(3)}:1 < piso ${textFloor}:1`,
      });
    }
  }

  // O anel de foco é a cor de ação, e não um segundo valor parecido com ela.
  if (input.focusRing && input.action) {
    const descolado =
      input.focusRing.value !== input.action.value ||
      input.focusRing.primitive !== input.action.primitive;
    if (descolado) {
      violations.push({
        tokens: [input.focusRing.name, input.action.name],
        message: `[${theme}] ${CHECKS.focus}: ${describe(input.focusRing)} não é ${describe(input.action)}`,
      });
    }
  }

  // O hover é sempre um passo mais claro que o repouso.
  if (input.action && input.hover) {
    const rest = lightness(input.action.value);
    const step = lightness(input.hover.value);
    if (!(step > rest)) {
      violations.push({
        tokens: [input.hover.name, input.action.name],
        message: `[${theme}] ${CHECKS.stepDirection}: L do hover ${step.toFixed(3)} não é maior que L do repouso ${rest.toFixed(3)}`,
      });
    }
  }

  // A superfície de gráfico é uma das superfícies neutras do tema. Um quarto
  // valor escaparia da varredura acima por não estar declarado como superfície.
  if (input.chartSurface) {
    const declared = input.surfaces.filter(
      (surface) => surface.value === input.chartSurface?.value,
    );
    if (declared.length === 0) {
      violations.push({
        tokens: [input.chartSurface.name],
        message: `[${theme}] ${CHECKS.chartSurface}: ${input.chartSurface.name} = ${input.chartSurface.value} não é o valor de nenhuma superfície neutra do tema`,
      });
    }
  }

  return violations;
}

// Tokens de ação, na ordem em que a varredura de valor repetido os percorre.
function actionTokens(input: ContrastInput): ContrastToken[] {
  return [input.action, input.hover].filter(
    (token): token is ContrastToken => token !== undefined,
  );
}

export function checkContrast(
  byTheme: Record<Theme, ContrastInput>,
): ContrastReport {
  const violations = THEMES.flatMap((theme) => themeViolations(byTheme[theme]));
  const measured = Object.fromEntries(
    THEMES.map((theme) => [theme, measureTheme(byTheme[theme])]),
  ) as Record<Theme, ThemeMeasurement>;
  const notes: string[] = [];

  // Acordo entre os passos dos dois temas: o que é comum é o passo, não a
  // razão. Um tema sem passo medível não produz esta violação — a ausência do
  // token já foi nomeada acima.
  const steps = THEMES.map((theme) => measured[theme].step);
  const [first, second] = steps;
  if (
    first !== null &&
    first !== undefined &&
    second !== null &&
    second !== undefined
  ) {
    const gap = Math.abs(first - second);
    if (gap > CONTRAST_THRESHOLDS.hoverStepTolerance) {
      violations.push({
        tokens: THEMES.flatMap((theme) =>
          actionTokens(byTheme[theme]).map((token) => token.name),
        ),
        message: `${CHECKS.stepAgreement}: ${THEMES.map((theme, i) => `${theme} ${(steps[i] ?? Number.NaN).toFixed(3)}`).join(", ")}; diferença ${gap.toFixed(3)} > tolerância ${CONTRAST_THRESHOLDS.hoverStepTolerance}`,
      });
    }
  }
  for (const theme of THEMES) {
    const step = measured[theme].step;
    if (step !== null)
      notes.push(`[${theme}] passo de hover ${step.toFixed(3)}`);
  }

  // Diagnóstico de valor repetido entre os temas. Ele não reprova: anota a
  // violação que um piso já produziu, para que a mensagem diga a causa — "não
  // invertido" — e não só o sintoma. Repetição que sustenta os dois pisos é
  // legítima e sai apenas no registro.
  const [lightTheme, darkTheme] = THEMES;
  if (lightTheme !== undefined && darkTheme !== undefined) {
    const other = new Map(
      actionTokens(byTheme[darkTheme]).map((token) => [token.name, token]),
    );
    for (const token of actionTokens(byTheme[lightTheme])) {
      const twin = other.get(token.name);
      if (twin === undefined || twin.value !== token.value) continue;
      const cause = `${token.name} não invertido: ${token.value} nos dois temas`;
      notes.push(cause);
      for (const violation of violations) {
        if (violation.tokens.includes(token.name))
          violation.message = `${violation.message} — ${cause}`;
      }
    }
  }

  for (const theme of THEMES) {
    const worst = measured[theme].worst;
    if (worst) {
      notes.push(
        `[${theme}] pior par ${worst.pair.join(" × ")} = ${worst.ratio.toFixed(3)}:1, margem ${worst.margin.toFixed(3)} sobre o piso ${worst.floor}:1`,
      );
    }
  }

  return {
    passed: violations.length === 0,
    violations: violations.map((violation) => violation.message),
    notes,
    byTheme: measured,
  };
}

// Nome gerado de um token a partir do seu caminho DTCG: é assim que a geração
// o escreve em `tokens.ts`.
const keyOf = (path: string): string => path.replaceAll(".", "-");

const SURFACE = /^color-surface-[a-z0-9-]+$/;

// Caminho DTCG e primitivo referenciado de cada token visível num tema, lidos
// da fonte. O caminho não é derivável do nome gerado — `color-text-on-action`
// tanto poderia vir de `color.text.on-action` quanto de `color.text.on.action`
// —, e o primitivo só entra em mensagem: a comparação do anel de foco confere
// referência e valor, e o valor está sempre presente.
function sourceIndex(
  theme: Theme,
  tokens: readonly SourceToken[],
): Map<string, { path: string; primitive: string | undefined }> {
  const index = new Map<
    string,
    { path: string; primitive: string | undefined }
  >();
  for (const token of tokens) {
    if (token.theme !== null && token.theme !== theme) continue;
    index.set(keyOf(token.path), {
      path: token.path,
      primitive: referenceTarget(token.value) ?? undefined,
    });
  }
  return index;
}

function tokenAt(
  key: string,
  resolved: Record<string, Record<Theme, string>>,
  theme: Theme,
  index: Map<string, { path: string; primitive: string | undefined }>,
): ContrastToken | undefined {
  const value = resolved[key]?.[theme];
  if (value === undefined) return undefined;
  const found = index.get(key);
  return {
    name: found?.path ?? key.replaceAll("-", "."),
    value,
    primitive: found?.primitive,
  };
}

// Extrai a entrada da checagem dos tokens resolvidos de um tema. O conjunto de
// superfícies neutras vem daqui — dos próprios tokens —, e não de uma lista
// escrita no módulo: uma superfície nova entra na varredura sem edição de
// código nem de teste. A fonte DTCG entra só para nomear caminho e primitivo
// nas mensagens; sem ela a checagem mede o mesmo.
export function contrastInput(
  theme: Theme,
  resolved: Record<string, Record<Theme, string>>,
  source: readonly SourceToken[] = [],
): ContrastInput {
  const index = sourceIndex(theme, source);
  const at = (key: string): ContrastToken | undefined =>
    tokenAt(key, resolved, theme, index);

  const surfaces = Object.keys(resolved)
    .filter((key) => SURFACE.test(key))
    .sort()
    .map(at)
    .filter((token): token is ContrastToken => token !== undefined);

  return {
    theme,
    surfaces,
    chartSurface: at("color-chart-surface"),
    action: at("color-action-primary"),
    hover: at("color-action-primary-hover"),
    onAction: at("color-text-on-action"),
    focusRing: at("color-focus-ring"),
  };
}
