import { cssVar, type TokenName } from "@chargebr/tokens";

// As cores de série da paleta categórica validada, na ordem das âncoras de
// matiz. A camada não gera cor: o que existe é o que está aqui.
export const CHART_SERIES_TOKENS = [
  "color-chart-series-1",
  "color-chart-series-2",
  "color-chart-series-3",
] as const satisfies readonly TokenName[];

// O limite de séries é consequência da paleta, não configuração: é o número
// de cores validadas. Uma série a mais exigiria cor nova, e cor nova não
// passou por checagem nenhuma.
export type SeriesLimit = (typeof CHART_SERIES_TOKENS)["length"];
export const CHART_SERIES_LIMIT: SeriesLimit = CHART_SERIES_TOKENS.length;

export function seriesColor(index: number): string {
  const token = CHART_SERIES_TOKENS[index];
  if (token === undefined) {
    throw new Error(
      `série ${index + 1} sem cor: a paleta validada tem ${CHART_SERIES_LIMIT} cores`,
    );
  }
  return cssVar(token);
}

// O canal não cromático de cada série: a forma da marca. É o que faz a
// identidade da série não depender da cor — na legenda e no desenho, a mesma
// série tem a mesma forma, e duas séries nunca têm a mesma.
export const SERIES_SYMBOLS = ["circle", "square", "triangle"] as const;
export type SeriesSymbol = (typeof SERIES_SYMBOLS)[number];

// O segundo canal não cromático, para as formas que desenham traço contínuo.
// Em unidades do espaço do usuário do SVG; `null` é traço cheio.
export const SERIES_DASHES: readonly (string | null)[] = [null, "7 4", "2 3"];

export function seriesSymbol(index: number): SeriesSymbol {
  const symbol = SERIES_SYMBOLS[index];
  if (symbol === undefined) {
    throw new Error(
      `série ${index + 1} sem forma de marca: há ${SERIES_SYMBOLS.length} formas`,
    );
  }
  return symbol;
}

export function seriesDash(index: number): string | null {
  return SERIES_DASHES[index] ?? null;
}
