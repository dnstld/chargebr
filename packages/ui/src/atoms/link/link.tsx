"use client";

import type { ReactNode } from "react";
import { Link as AriaLink } from "react-aria-components";
import styles from "./link.module.css";

export interface LinkProps {
  /** Destino do link. */
  href: string;
  /** Conteúdo do link — texto ou elemento que forme o nome acessível. */
  children: ReactNode;
  /** Identifica, para tecnologia assistiva, que este link representa a página atual. */
  "aria-current"?: "page";
}

// Link genérico: o caminho de um clique até outro lugar. Comportamento de
// react-aria-components — foco, teclado e ponteiro vêm dela, não de atributo
// à mão. `aria-current` passa direto para a primitiva, que já repassa para o
// elemento — mesmo caminho de Button para `aria-expanded`/`aria-controls`.
export function Link({ href, children, ...rest }: LinkProps) {
  // Com noUncheckedIndexedAccess a classe é string | undefined; a primitiva
  // exige string.
  return (
    <AriaLink className={styles.link ?? ""} href={href} {...rest}>
      {children}
    </AriaLink>
  );
}
