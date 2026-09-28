import type { FixtureOrigin } from "../../../fixture-origin";
import type { ChartMeasure, ChartPoint, ChartSeries } from "../series";

// FIXTURE SINTÉTICA. Nada aqui vem do contrato de leitura, de carga canônica
// ou de publicação: os números foram escolhidos para exercitar o desenho.
// Nenhum valor daqui pode ser lido como afirmação sobre o domínio.
export const FIXTURE_ORIGIN: FixtureOrigin = "synthetic";
export const FIXTURE_ORIGIN_NOTE =
  "Números inventados para exercitar formas com mais de uma categoria, preenchimento texturizado e ponto sem valor. Não descrevem nenhuma observação real.";

export const CATEGORIES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
] as const;

export const SYNTHETIC_UNITS: ChartMeasure = {
  label: "Unidades (fixture sintética)",
};

function point(
  category: string,
  value: number,
  fill?: ChartPoint["fill"],
): ChartPoint {
  return fill === undefined ? { category, value } : { category, value, fill };
}

function missing(category: string): ChartPoint {
  return { category, value: null };
}

// Série completa: todos os pontos com valor, preenchimento sólido.
export const COMPLETE: ChartSeries = {
  name: "Série completa",
  points: [
    point("Janeiro", 1200),
    point("Fevereiro", 1450),
    point("Março", 1310),
    point("Abril", 1620),
    point("Maio", 1580),
  ],
};

// Série com um ponto de preenchimento texturizado no meio — escolha visual,
// sem significado de estado.
export const WITH_TEXTURED: ChartSeries = {
  name: "Série com preenchimento texturizado",
  points: [
    point("Janeiro", 900),
    point("Fevereiro", 1050),
    point("Março", 980, "textured"),
    point("Abril", 1120),
    point("Maio", 1190),
  ],
};

// Série com um ponto sem valor no meio: nenhuma marca na posição, nenhum
// segmento a atravessando.
export const WITH_MISSING: ChartSeries = {
  name: "Série com ausência",
  points: [
    point("Janeiro", 700),
    point("Fevereiro", 760),
    missing("Março"),
    point("Abril", 810),
    point("Maio", 840),
  ],
};

// As três juntas: o limite de séries que a paleta sustenta, com preenchimento
// texturizado e ponto sem valor no mesmo desenho.
export const THREE_SERIES = [COMPLETE, WITH_TEXTURED, WITH_MISSING] as const;
