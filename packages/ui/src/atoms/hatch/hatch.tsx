import { useId } from "react";
import { defineAtom } from "../contract";
import styles from "./hatch.module.css";

// Período do padrão, em unidades do espaço do usuário do SVG: um traço e um
// vão de mesma largura, inclinados a 45°.
export const HATCH_PERIOD = 4;

// Menor lado, em px, em que a textura ainda é lida como hachura e não como
// cinza uniforme: três períodos, o que garante ao menos três traços visíveis
// na diagonal. Quem renderiza a hachura abaixo disso perde o sinal.
export const HATCH_MIN_SIZE = HATCH_PERIOD * 3;

export interface HatchProps {
  /**
   * Nome acessível, quando a hachura é o único sinal de "não resolvido" no
   * lugar em que aparece. Sem ele, a hachura é decorativa: o significado vem
   * do texto ao lado (caso do marcador de estado).
   */
  label?: string;
}

// Hachura: o preenchimento de "não resolvido". Átomo próprio para que o
// marcador de estado e, no ciclo 6, os gráficos desenhem exatamente a mesma
// textura. Não recebe cor: desenha com currentColor.
export function Hatch({ label }: HatchProps) {
  const patternId = useId();
  const texture = (
    <>
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={HATCH_PERIOD}
          height={HATCH_PERIOD}
          patternTransform="rotate(45)"
        >
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={HATCH_PERIOD}
            stroke="currentColor"
            strokeWidth={HATCH_PERIOD / 2}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </>
  );
  if (label === undefined) {
    return (
      <svg className={styles.hatch} data-hatch="" aria-hidden="true">
        {texture}
      </svg>
    );
  }
  return (
    <svg className={styles.hatch} data-hatch="" role="img" aria-label={label}>
      {texture}
    </svg>
  );
}

// A hachura não tem estado: é uma textura só, em qualquer tamanho a partir do
// mínimo declarado. Variação de densidade ou de ângulo seria uma segunda
// hachura, e é exatamente o que este átomo existe para impedir.
export const HatchAtom = defineAtom({
  name: "Hatch",
  component: Hatch,
  states: [],
});
