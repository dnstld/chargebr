import type { LucideIcon } from "lucide-react";
import { defineAtom } from "../contract";
import styles from "./icon.module.css";

export interface IconProps {
  /** Componente de ícone de `lucide-react` a renderizar. */
  as: LucideIcon;
}

// Ícone genérico. Recebe o componente pronto por propriedade — nunca importa
// nem nomeia um ícone específico. O traço segue `currentColor` pelo padrão do
// próprio lucide-react (Icon.mjs, contextColor): este átomo não declara cor
// própria, então herda a cor de texto de quem compõe. O tamanho vem de `1em`
// — não existe token de tamanho de ícone hoje — para acompanhar o texto ao
// redor em vez do padrão fixo de 24px que o pacote aplicaria sozinho.
export function Icon({ as: IconComponent }: IconProps) {
  return <IconComponent className={styles.icon} />;
}

export const ICON_STATES = ["default"] as const;

export const IconAtom = defineAtom({
  name: "Icon",
  component: Icon,
  states: ICON_STATES,
});
