// Geometria efetivamente desenhada por um `pattern` de hachura, lida do
// elemento renderizado. É o que permite comparar as duas implementações pelo
// resultado, e não pelo código que ambas dizem consumir: um `pattern` que
// tivesse os números certos nos atributos errados passaria numa comparação de
// constantes e reprovaria aqui.
export interface DrawnHatch {
  /** Período do padrão, nos dois eixos. */
  width: string;
  height: string;
  /** Inclinação aplicada ao padrão. */
  patternTransform: string;
  /** Espessura e comprimento do traço. */
  strokeWidth: string;
  strokeLength: string;
  /** Unidades do espaço em que o padrão é resolvido. */
  patternUnits: string;
}

export function readDrawnHatch(pattern: Element): DrawnHatch {
  const line = pattern.querySelector("line");
  if (line === null) {
    throw new Error("padrão de hachura sem traço");
  }
  return {
    width: pattern.getAttribute("width") ?? "",
    height: pattern.getAttribute("height") ?? "",
    patternTransform: pattern.getAttribute("patternTransform") ?? "",
    strokeWidth: line.getAttribute("stroke-width") ?? "",
    strokeLength: line.getAttribute("y2") ?? "",
    patternUnits: pattern.getAttribute("patternUnits") ?? "",
  };
}
