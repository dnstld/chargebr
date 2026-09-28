"use client";

import type { ReactNode } from "react";
import { Link as AriaLink } from "react-aria-components";
import styles from "./link.module.css";

export interface LinkProps {
  /** Destino do link. */
  href: string;
  /** Conteúdo do link — texto ou elemento que forme o nome acessível. */
  children: ReactNode;
}

// Link genérico: o caminho de um clique até outro lugar. Comportamento de
// react-aria-components, mesma primitiva de EvidenceAnchor antes dele — foco,
// teclado e ponteiro vêm dela, não de atributo à mão.
export function Link({ href, children }: LinkProps) {
  // Com noUncheckedIndexedAccess a classe é string | undefined; a primitiva
  // exige string.
  return (
    <AriaLink className={styles.link ?? ""} href={href}>
      {children}
    </AriaLink>
  );
}
