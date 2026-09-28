import type { ReactNode } from "react";
import type { FontEmphasis, FontWeight } from "../font-variant";
import styles from "./text.module.css";

export interface TextProps {
  /** Peso do texto, de `font.weight.*`. O padrão é o peso do corpo. */
  weight?: FontWeight;
  /** Destaque do texto, de `font.style.*`. O padrão é sem itálico. */
  emphasis?: FontEmphasis;
  /**
   * Ativa a escala tipográfica de dado numérico — algarismos tabulares —,
   * para que números de larguras diferentes alinhem pela mesma posição
   * quando empilhados. O padrão é a escala de corpo.
   */
  tabular?: boolean;
  children: ReactNode;
}

// Texto genérico. Recebe o conteúdo pronto: não formata, não busca e não
// sabe vocabulário de domínio — peso, destaque e a variante tabular são
// variantes livres, quem compõe decide o que cada combinação significa.
export function Text({
  weight = "regular",
  emphasis = "normal",
  tabular = false,
  children,
}: TextProps) {
  return (
    <span
      className={`${tabular ? styles.tabular : styles.text} ${styles[weight]} ${styles[emphasis]}`}
      data-weight={weight}
      data-emphasis={emphasis}
      {...(tabular ? { "data-tabular": "" } : {})}
    >
      {children}
    </span>
  );
}
