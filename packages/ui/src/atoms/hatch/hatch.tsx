import { HATCH } from "@chargebr/tokens";
import { useId } from "react";
import { HatchPattern, hatchFill } from "./hatch-pattern";
import styles from "./hatch.module.css";

// Período do padrão, em unidades do espaço do usuário do SVG: um traço e um
// vão de mesma largura, inclinados pelo ângulo da definição compartilhada.
// Os três números vêm de HATCH, em @chargebr/tokens.
export const HATCH_PERIOD = HATCH.period;

// Menor lado, em px, em que a textura ainda é lida como hachura e não como
// cinza uniforme: três períodos, o que garante ao menos três traços visíveis
// na diagonal. Quem renderiza a hachura abaixo disso perde o sinal.
export const HATCH_MIN_SIZE = HATCH.minSize;

export interface HatchProps {
  /**
   * Nome acessível, quando a hachura é o único sinal de alguma distinção no
   * lugar em que aparece — quem usa diz qual. Sem ele, a hachura é
   * decorativa: o significado vem do texto ao lado.
   */
  label?: string;
}

// Hachura: uma textura, nada mais. Não recebe cor: desenha com currentColor.
export function Hatch({ label }: HatchProps) {
  const patternId = useId();
  const texture = (
    <>
      <defs>
        <HatchPattern id={patternId} />
      </defs>
      <rect width="100%" height="100%" fill={hatchFill(patternId)} />
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
