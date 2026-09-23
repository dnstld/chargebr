import type { FixtureOrigin } from "../../fixture-origin";
import type { ChartMeasure, ChartPoint, ChartSeries } from "../series";

// FIXTURE SINTÉTICA. Nada aqui vem do contrato de leitura, de carga canônica
// ou de publicação: os números foram escolhidos para exercitar o desenho, e
// afirmam apenas que a camada sabe desenhar aquelas formas e aqueles estados.
// Nenhum valor daqui pode ser lido como afirmação sobre o domínio.
export const FIXTURE_ORIGIN: FixtureOrigin = "synthetic";
export const FIXTURE_ORIGIN_NOTE =
  "Números inventados para exercitar formas que o contrato de leitura ainda não produz dado para exercitar: mais de uma categoria, ponto não resolvido e ponto ausente. Não descrevem nenhuma observação real.";

// A evidência também é sintética: aponta para a própria história, e o rótulo
// diz isso em voz alta, para que uma captura de tela não seja lida como
// proveniência de nada.
const SYNTHETIC_EVIDENCE = {
  href: "#fixture-sintetica",
  label: "Fixture sintética: sem evidência real",
};

export const CATEGORIES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
] as const;

export const SYNTHETIC_UNITS: ChartMeasure<"synthetic_units"> = {
  id: "synthetic_units",
  label: "Unidades (fixture sintética)",
};

function resolved(category: string, value: number): ChartPoint {
  return { kind: "resolved", category, value, evidence: SYNTHETIC_EVIDENCE };
}

function unresolved(category: string, value: number): ChartPoint {
  return { kind: "unresolved", category, value, evidence: SYNTHETIC_EVIDENCE };
}

function missing(category: string): ChartPoint {
  return { kind: "missing", category };
}

// Série completa: todos os pontos resolvidos.
export const COMPLETE: ChartSeries<"synthetic_units"> = {
  name: "Série completa",
  measure: "synthetic_units",
  points: [
    resolved("Janeiro", 1200),
    resolved("Fevereiro", 1450),
    resolved("Março", 1310),
    resolved("Abril", 1620),
    resolved("Maio", 1580),
  ],
};

// Série com um ponto não resolvido no meio: é o caso em que a ligação precisa
// ser interrompida dos dois lados, e a marca precisa sair hachurada.
export const WITH_UNRESOLVED: ChartSeries<"synthetic_units"> = {
  name: "Série com não resolvido",
  measure: "synthetic_units",
  points: [
    resolved("Janeiro", 900),
    resolved("Fevereiro", 1050),
    unresolved("Março", 980),
    resolved("Abril", 1120),
    resolved("Maio", 1190),
  ],
};

// Série com um ponto ausente no meio: nenhuma marca na posição, nenhum
// segmento a atravessando, e a ausência dita.
export const WITH_MISSING: ChartSeries<"synthetic_units"> = {
  name: "Série com ausência",
  measure: "synthetic_units",
  points: [
    resolved("Janeiro", 700),
    resolved("Fevereiro", 760),
    missing("Março"),
    resolved("Abril", 810),
    resolved("Maio", 840),
  ],
};

// As três juntas: o limite de séries que a paleta sustenta, com os três
// estados de ponto no mesmo desenho.
export const THREE_SERIES = [COMPLETE, WITH_UNRESOLVED, WITH_MISSING] as const;
