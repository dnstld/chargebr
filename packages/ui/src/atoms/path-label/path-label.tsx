import { Text } from "../text/text";

export interface PathLabelProps {
  /** Segmentos do caminho, do mais geral ao mais específico. */
  segments: readonly string[];
}

// Rótulo de caminho: texto, nunca navegação — sem link, sem foco, sem papel
// de região. Existe para os casos em que o caminho não tem tela própria,
// como "Fontes / ABEV" (specs/shell-components/spec.md).
export function PathLabel({ segments }: PathLabelProps) {
  return <Text>{segments.join(" / ")}</Text>;
}
