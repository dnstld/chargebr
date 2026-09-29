import { HATCH } from "@chargebr/tokens";

export interface HatchPatternProps {
  /** Identificador do padrão, para que a marca o referencie no preenchimento. */
  id: string;
}

// O `<pattern>` SVG da hachura: os mesmos três números de HATCH, em
// @chargebr/tokens, que o átomo Hachura usa em seus próprios `defs`. Um
// componente só, referenciável por `fill` de qualquer marca que precise da
// mesma textura — dentro do átomo ou fora dele.
export function HatchPattern({ id }: HatchPatternProps) {
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
