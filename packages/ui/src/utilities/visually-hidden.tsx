import type { ReactNode } from "react";
import styles from "./visually-hidden.module.css";

export interface VisuallyHiddenProps {
  children: ReactNode;
}

// Conteúdo que só a tecnologia assistiva recebe: complementa o que está
// visível sem duplicá-lo na tela. É utilitário, não átomo: não tem estado nem
// história própria, e entra no nome acessível de quem o usa.
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className={styles.visuallyHidden}>{children}</span>;
}
