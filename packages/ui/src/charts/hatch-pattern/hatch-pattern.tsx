import { HATCH } from "@chargebr/tokens";

export interface ChartHatchPatternProps {
  /** Identificador do padrão, para que a marca o referencie no preenchimento. */
  id: string;
}

// Padrão SVG da hachura, para preencher marcas dentro do gráfico. O átomo
// Hachura desenha em DOM, com seu próprio elemento; aqui a textura precisa ser
// um `pattern` referenciado por `fill` de uma marca que já existe. São
// mecanismos diferentes, e por isso os dois leem os mesmos três números de
// HATCH, em @chargebr/tokens: ângulo, período e espessura. Nenhum número da
// textura é escrito neste arquivo.
//
// A igualdade entre as duas implementações não é confiada ao comentário: a
// história deste módulo renderiza as duas e compara a geometria desenhada.
export function ChartHatchPattern({ id }: ChartHatchPatternProps) {
  return (
    <pattern
      id={id}
      data-hatch-pattern=""
      patternUnits="userSpaceOnUse"
      width={HATCH.period}
      height={HATCH.period}
      patternTransform={`rotate(${HATCH.angleDegrees})`}
    >
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={HATCH.period}
        stroke="currentColor"
        strokeWidth={HATCH.strokeWidth}
      />
    </pattern>
  );
}

/** Referência de preenchimento para uma marca hachurada. */
export function hatchFill(id: string): string {
  return `url(#${id})`;
}
