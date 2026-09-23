import type { ReactNode } from "react";
import { defineAtom } from "../contract";
import { VALUE_ROLES, type ValueRole } from "../value-role";
import styles from "./text.module.css";

export interface TextProps {
  /** Papel que o valor ocupa: principal, contrafactual ou contexto. */
  valueRole: ValueRole;
  children: ReactNode;
}

// Texto com papel. Recebe o conteúdo pronto: não formata, não busca e não
// decide o que é principal — quem compõe decide. Redação original e redação
// normalizada usam o mesmo átomo, lado a lado, sem hierarquia entre elas.
export function Text({ valueRole, children }: TextProps) {
  return (
    <span
      className={`${styles.text} ${styles[valueRole]}`}
      data-value-role={valueRole}
    >
      {children}
    </span>
  );
}

export const TextAtom = defineAtom({
  name: "Text",
  component: Text,
  states: VALUE_ROLES,
});
