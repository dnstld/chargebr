import {
  type Color,
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  formatHex,
  oklch,
  parse,
  wcagContrast,
} from "culori";
import type { Theme } from "./source.js";

// Os temas entram aqui para que quem executa a checagem — este pacote ou quem
// declara formas de gráfico — não precise redeclarar a lista.
export { THEMES, type Theme } from "./source.js";

// As seis checagens da paleta categórica de gráfico. Este arquivo é o critério:
// o modelo de simulação e os limiares de corte declarados aqui fazem parte da
// definição, não do detalhe de implementação. Uma troca de biblioteca ou de
// modelo que mude os números precisa mudar este arquivo à vista.

// Simulação de daltonismo: modelo de Machado, Oliveira e Fernandes (2009),
// como implementado por `culori` em filterDeficiencyProt e
// filterDeficiencyDeuter, na severidade máxima (1.0). Tritanopia não entra
// no critério: as checagens se ancoram nas deficiências prevalentes.
export const SIMULATION = {
  model: "Machado, Oliveira & Fernandes (2009)",
  library: "culori",
  severity: 1,
} as const;

// Distância entre cores: euclidiana em OKLab (ΔEok), reportada e comparada
// na escala ×100, que é a escala em que o método documenta os limiares. Sem a
// escala explícita, 14,2 e 0,142 seriam a mesma medida lidas contra pisos
// diferentes.
export const DISTANCE_SCALE = 100;
const distanceOklab = differenceEuclidean("oklab");
const distance = (a: string, b: string): number =>
  distanceOklab(a, b) * DISTANCE_SCALE;

export const THRESHOLDS = {
  // 1. Âncoras de matiz em ordem fixa (graus OKLCH) e tolerância por série.
  hueAnchors: [
    { name: "índigo", hue: 280 },
    { name: "verde", hue: 150 },
    { name: "amarelo", hue: 90 },
  ],
  hueTolerance: 15,
  // 2. Banda de luminosidade OKLCH por tema: escura o bastante sobre claro,
  //    clara o bastante sobre escuro, sem chegar a preto ou a pastel.
  lightnessBand: {
    light: { min: 0.4, max: 0.7 },
    dark: { min: 0.48, max: 0.8 },
  },
  // 3. Piso de croma OKLCH: abaixo disso a cor lê como neutro e a âncora de
  //    matiz perde sentido.
  chromaFloor: 0.1,
  // 4. Separação ΔEok ×100 entre todos os pares sob protanopia e
  //    deuteranopia: o piso é o corte; o alvo é registrado quando não é
  //    atingido, sem reprovar.
  cvdSeparationFloor: 6,
  cvdSeparationTarget: 8,
  // 5. Piso de separação ΔEok ×100 entre todos os pares para visão normal.
  normalSeparationFloor: 15,
  // 6. Contraste WCAG mínimo de cada série contra a superfície do tema
  //    (critério 1.4.11, objetos gráficos).
  surfaceContrastFloor: 3,
} as const;

// Listas de pares que as checagens de separação podem executar. Qual delas
// vale não é preferência de quem verifica: decorre da forma que vai desenhar
// as marcas. Numa forma em que só vizinhos se tocam, comparar todos os pares
// reprovaria por um encontro que nunca acontece; numa forma em que qualquer
// marca pode encostar em qualquer outra, comparar só os adjacentes deixaria
// passar o encontro que acontece.
export const PAIR_SCOPES = ["adjacent", "all"] as const;
export type PairScope = (typeof PAIR_SCOPES)[number];

export interface PaletteSeries {
  /** Nome do token, para a mensagem: `color.chart.series.1`. */
  name: string;
  /** Cor resolvida, em qualquer notação que `culori` leia. */
  value: string;
}

export interface PaletteInput {
  theme: Theme;
  series: PaletteSeries[];
  /** Superfície de gráfico do tema; `undefined` quando não foi declarada. */
  surface: string | undefined;
  /** Lista de pares que as checagens de separação executam; o padrão é a mais dura. */
  pairScope?: PairScope;
}

export interface PairDistance {
  pair: [string, string];
  distance: number;
}

export interface CheckResult {
  check: string;
  failures: string[];
  /** Pares efetivamente comparados, quando a checagem compara pares. */
  pairs?: [string, string][];
  /** Pior par da checagem, quando ela compara pares. */
  worst?: PairDistance;
  /** Registro informativo do caso mais apertado, quando a checagem não compara pares. */
  detail?: string;
}

export interface PaletteReport {
  theme: Theme;
  /** Lista de pares executada neste relatório. */
  pairScope: PairScope;
  passed: boolean;
  results: CheckResult[];
  /** Pior par entre todas as checagens de separação, com a checagem de origem. */
  worstPair: (PairDistance & { check: string }) | null;
}

const CHECKS = {
  hue: "âncoras de matiz em ordem fixa",
  lightness: "banda de luminosidade por tema",
  chroma: "piso de croma",
  protanopia: "separação sob protanopia",
  deuteranopia: "separação sob deuteranopia",
  normal: "piso de separação para visão normal",
  contrast: "contraste contra a superfície do tema",
} as const;

function hueDelta(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

// Pares a comparar. Em `all`, cada série contra todas as outras; em
// `adjacent`, só as vizinhas na ordem declarada — que é a ordem em que a forma
// desenha as marcas.
export function pairs<T>(items: T[], scope: PairScope = "all"): [T, T][] {
  const out: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    const last =
      scope === "adjacent"
        ? Math.min(i + 1, items.length - 1)
        : items.length - 1;
    for (let j = i + 1; j <= last; j++) {
      const a = items[i];
      const b = items[j];
      if (a !== undefined && b !== undefined) out.push([a, b]);
    }
  }
  return out;
}

function separation(
  check: string,
  theme: Theme,
  series: PaletteSeries[],
  floor: number,
  simulate: (color: string) => string,
  scope: PairScope,
  target?: number,
): CheckResult {
  const failures: string[] = [];
  const compared: [string, string][] = [];
  let worst: PairDistance | undefined;
  for (const [a, b] of pairs(series, scope)) {
    compared.push([a.name, b.name]);
    const d = distance(simulate(a.value), simulate(b.value));
    const pair: [string, string] = [a.name, b.name];
    if (worst === undefined || d < worst.distance)
      worst = { pair, distance: d };
    if (d < floor) {
      failures.push(
        `[${theme}] ${check}: par ${a.name} × ${b.name} = ${d.toFixed(1)} < piso ${floor} (ΔEok ×${DISTANCE_SCALE})`,
      );
    }
  }
  if (!worst) return { check, failures, pairs: compared };
  const detail =
    target !== undefined && worst.distance < target
      ? `pior par abaixo do alvo ${target}`
      : undefined;
  return detail
    ? { check, failures, pairs: compared, worst, detail }
    : { check, failures, pairs: compared, worst };
}

function simulated(
  filter: <C extends Color>(color: C) => C,
): (color: string) => string {
  return (color) => {
    const parsed = parse(color);
    return parsed ? formatHex(filter(parsed)) : color;
  };
}

const protanopia = simulated(filterDeficiencyProt(SIMULATION.severity));
const deuteranopia = simulated(filterDeficiencyDeuter(SIMULATION.severity));

export function checkPalette(input: PaletteInput): PaletteReport {
  const { theme, series, surface } = input;
  const pairScope: PairScope = input.pairScope ?? "all";
  const results: CheckResult[] = [];

  // 1. Âncoras de matiz em ordem fixa.
  {
    const failures: string[] = [];
    if (series.length !== THRESHOLDS.hueAnchors.length) {
      failures.push(
        `[${theme}] ${CHECKS.hue}: ${series.length} séries, esperadas ${THRESHOLDS.hueAnchors.length}`,
      );
    }
    series.forEach((s, i) => {
      const anchor = THRESHOLDS.hueAnchors[i];
      const color = oklch(s.value);
      if (!anchor || !color) return;
      const hue = color.h ?? 0;
      const delta = hueDelta(hue, anchor.hue);
      if (delta > THRESHOLDS.hueTolerance) {
        failures.push(
          `[${theme}] ${CHECKS.hue}: ${s.name} tem matiz ${hue.toFixed(1)}°, âncora ${anchor.name} ${anchor.hue}° ± ${THRESHOLDS.hueTolerance}°`,
        );
      }
    });
    results.push({ check: CHECKS.hue, failures });
  }

  // 2. Banda de luminosidade por tema.
  {
    const band = THRESHOLDS.lightnessBand[theme];
    const failures: string[] = [];
    for (const s of series) {
      const l = oklch(s.value)?.l ?? Number.NaN;
      if (!(l >= band.min && l <= band.max)) {
        failures.push(
          `[${theme}] ${CHECKS.lightness}: ${s.name} tem L ${l.toFixed(3)}, fora de [${band.min}, ${band.max}]`,
        );
      }
    }
    results.push({ check: CHECKS.lightness, failures });
  }

  // 3. Piso de croma.
  {
    const failures: string[] = [];
    for (const s of series) {
      const c = oklch(s.value)?.c ?? Number.NaN;
      if (!(c >= THRESHOLDS.chromaFloor)) {
        failures.push(
          `[${theme}] ${CHECKS.chroma}: ${s.name} tem C ${c.toFixed(3)} < ${THRESHOLDS.chromaFloor}`,
        );
      }
    }
    results.push({ check: CHECKS.chroma, failures });
  }

  // 4. Separação sob protanopia e deuteranopia.
  results.push(
    separation(
      CHECKS.protanopia,
      theme,
      series,
      THRESHOLDS.cvdSeparationFloor,
      protanopia,
      pairScope,
      THRESHOLDS.cvdSeparationTarget,
    ),
  );
  results.push(
    separation(
      CHECKS.deuteranopia,
      theme,
      series,
      THRESHOLDS.cvdSeparationFloor,
      deuteranopia,
      pairScope,
      THRESHOLDS.cvdSeparationTarget,
    ),
  );

  // 5. Piso de separação para visão normal.
  results.push(
    separation(
      CHECKS.normal,
      theme,
      series,
      THRESHOLDS.normalSeparationFloor,
      (c) => c,
      pairScope,
    ),
  );

  // 6. Contraste contra a superfície do tema. Superfície ausente é falha
  //    nomeada, nunca um valor implícito.
  {
    const failures: string[] = [];
    if (surface === undefined) {
      failures.push(
        `[${theme}] ${CHECKS.contrast}: superfície de gráfico não declarada no tema ${theme}`,
      );
      results.push({ check: CHECKS.contrast, failures });
    } else {
      let lowest: { name: string; ratio: number } | undefined;
      for (const s of series) {
        const ratio = wcagContrast(s.value, surface);
        if (lowest === undefined || ratio < lowest.ratio)
          lowest = { name: s.name, ratio };
        if (!(ratio >= THRESHOLDS.surfaceContrastFloor)) {
          failures.push(
            `[${theme}] ${CHECKS.contrast}: ${s.name} contra ${surface} = ${ratio.toFixed(2)}:1 < ${THRESHOLDS.surfaceContrastFloor}:1`,
          );
        }
      }
      const detail = lowest
        ? `menor contraste ${lowest.name} contra ${surface} = ${lowest.ratio.toFixed(2)}:1`
        : undefined;
      results.push(
        detail
          ? { check: CHECKS.contrast, failures, detail }
          : { check: CHECKS.contrast, failures },
      );
    }
  }

  let worstPair: PaletteReport["worstPair"] = null;
  for (const result of results) {
    if (
      result.worst &&
      (!worstPair || result.worst.distance < worstPair.distance)
    ) {
      worstPair = { ...result.worst, check: result.check };
    }
  }

  return {
    theme,
    pairScope,
    passed: results.every((r) => r.failures.length === 0),
    results,
    worstPair,
  };
}

export function paletteFailures(report: PaletteReport): string[] {
  return report.results.flatMap((r) => r.failures);
}

// Extrai a entrada da checagem dos tokens resolvidos de um tema: as séries em
// ordem numérica e a superfície de gráfico.
export function paletteInput(
  theme: Theme,
  resolved: Record<string, Record<Theme, string>>,
  pairScope: PairScope = "all",
): PaletteInput {
  const series = Object.keys(resolved)
    .filter((name) => /^color-chart-series-\d+$/.test(name))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((name) => ({
      name: name.replaceAll("-", "."),
      value: resolved[name]?.[theme] ?? "",
    }));
  return {
    theme,
    series,
    surface: resolved["color-chart-surface"]?.[theme],
    pairScope,
  };
}
