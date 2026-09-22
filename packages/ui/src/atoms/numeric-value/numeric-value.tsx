import { defineAtom } from "../contract";
import { VALUE_ROLES, type ValueRole } from "../value-role";
import styles from "./numeric-value.module.css";

export interface NumericValueProps {
  /** Valor finito. Ausência de valor não passa por aqui: é DeclaredAbsence. */
  value: number;
  /** Papel que o valor ocupa: principal, contrafactual ou contexto. */
  valueRole: ValueRole;
  /** Opções de formatação. O padrão é a formatação de pt-BR sem casa forçada. */
  format?: Intl.NumberFormatOptions;
}

const LOCALE = "pt-BR";

// Número com papel. Formata e renderiza; não busca, não agrega, não decide
// unidade nem casa decimal. Não carrega proveniência: quem exibe um número
// coloca a âncora de evidência ao lado dele.
export function NumericValue({ value, valueRole, format }: NumericValueProps) {
  const formatted = new Intl.NumberFormat(LOCALE, format).format(value);
  return (
    <span
      className={`${styles.number} ${styles[valueRole]}`}
      data-value-role={valueRole}
    >
      {formatted}
    </span>
  );
}

export const NumericValueAtom = defineAtom({
  name: "NumericValue",
  component: NumericValue,
  states: VALUE_ROLES,
});
