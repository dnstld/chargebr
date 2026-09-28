import type { ReactNode } from "react";
import type { FontEmphasis, FontWeight } from "../font-variant";
import styles from "./text.module.css";

export interface TextProps {
  /** Peso do texto, de `font.weight.*`. O padrão é o peso do corpo. */
  weight?: FontWeight;
  /** Destaque do texto, de `font.style.*`. O padrão é sem itálico. */
  emphasis?: FontEmphasis;
  children: ReactNode;
}

// Texto genérico. Recebe o conteúdo pronto: não formata, não busca e não
// sabe vocabulário de domínio — peso e destaque são variantes livres, quem
// compõe decide o que cada combinação significa.
export function Text({
  weight = "regular",
  emphasis = "normal",
  children,
}: TextProps) {
  return (
    <span
      className={`${styles.text} ${styles[weight]} ${styles[emphasis]}`}
      data-weight={weight}
      data-emphasis={emphasis}
    >
      {children}
    </span>
  );
}
