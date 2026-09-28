"use client";

import { Link } from "react-aria-components";
import styles from "./evidence-anchor.module.css";

export interface EvidenceAnchorProps {
  /** Caminho até a evidência. */
  href: string;
  /**
   * Nome acessível: identifica a que evidência a âncora leva. É também o texto
   * visível, para que o nome lido seja o nome mostrado.
   */
  label: string;
}

// Âncora de evidência: o caminho de um número até sua fonte. É o único átomo
// com comportamento, e por isso o único sobre uma primitiva de comportamento
// acessível: foco, teclado e ponteiro vêm dela, não de atributo à mão.
export function EvidenceAnchor({ href, label }: EvidenceAnchorProps) {
  // Com noUncheckedIndexedAccess a classe é string | undefined; a primitiva
  // exige string.
  return (
    <Link className={styles.anchor ?? ""} href={href}>
      {label}
    </Link>
  );
}
