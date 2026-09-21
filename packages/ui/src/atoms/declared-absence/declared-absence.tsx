import { defineAtom } from "../contract";
import styles from "./declared-absence.module.css";

// Por que um valor não está sendo exibido. `blocked` é projection_status =
// blocked: existe cálculo, mas exibir qualquer número, mesmo parcial, seria
// afirmar o que a projeção não sustenta. `unknown` é informação ausente ou
// sem precisão — date_precision = unknown, campo não informado — que nunca
// pode virar zero.
export const ABSENCE_KINDS = ["blocked", "unknown"] as const;
export type AbsenceKind = (typeof ABSENCE_KINDS)[number];

export interface DeclaredAbsenceProps {
  /** Natureza da ausência. */
  kind: AbsenceKind;
  /** Razão visível, em PT-BR. Obrigatória no tipo: ausência sem razão não compila. */
  reason: string;
}

// Ausência declarada. Exibe a razão e nada que possa ser lido como valor:
// nenhum dígito, nenhum traço, nenhum espaço vazio no lugar do número.
export function DeclaredAbsence({ kind, reason }: DeclaredAbsenceProps) {
  return (
    <span className={styles.absence} data-kind={kind}>
      {reason}
    </span>
  );
}

export const DeclaredAbsenceAtom = defineAtom({
  name: "DeclaredAbsence",
  component: DeclaredAbsence,
  states: ABSENCE_KINDS,
});
