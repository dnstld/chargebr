import { defineAtom } from "../contract";
import {
  FONT_EMPHASES,
  FONT_WEIGHTS,
  type FontEmphasis,
  type FontWeight,
} from "../font-variant";
import styles from "./numeric-value.module.css";

export interface NumericValueProps {
  /** Valor finito. Ausência de valor não passa por aqui: é DeclaredAbsence. */
  value: number;
  /** Peso do número, de `font.weight.*`. O padrão é o peso do corpo de dado. */
  weight?: FontWeight;
  /** Destaque do número, de `font.style.*`. O padrão é sem itálico. */
  emphasis?: FontEmphasis;
  /** Opções de formatação. O padrão é a formatação de pt-BR sem casa forçada. */
  format?: Intl.NumberFormatOptions;
}

const LOCALE = "pt-BR";

// Número genérico. Formata e renderiza; não busca, não agrega, não decide
// unidade nem casa decimal, e não sabe vocabulário de domínio. Não carrega
// proveniência: quem exibe um número coloca a âncora de evidência ao lado
// dele.
export function NumericValue({
  value,
  weight = "regular",
  emphasis = "normal",
  format,
}: NumericValueProps) {
  const formatted = new Intl.NumberFormat(LOCALE, format).format(value);
  return (
    <span
      className={`${styles.number} ${styles[weight]} ${styles[emphasis]}`}
      data-weight={weight}
      data-emphasis={emphasis}
    >
      {formatted}
    </span>
  );
}

const NUMERIC_VALUE_STATES = [
  ...FONT_WEIGHTS.map((weight) => `weight:${weight}` as const),
  ...FONT_EMPHASES.map((emphasis) => `emphasis:${emphasis}` as const),
];

export const NumericValueAtom = defineAtom({
  name: "NumericValue",
  component: NumericValue,
  states: NUMERIC_VALUE_STATES,
});
