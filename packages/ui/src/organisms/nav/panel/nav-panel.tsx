"use client";

import type { ReactNode } from "react";
// react-aria-components 1.21.1 não reexporta FocusScope — só Dialog/Modal,
// com semântica de diálogo (portal, ESC-para-fechar) que este painel não
// quer. FocusScope vem de react-aria, a camada que react-aria-components já
// usa por dentro; fixado na mesma versão que ele já resolve (3.52.1), para
// não duplicar instância.
import { FocusScope } from "react-aria";
import { NavTree, type NavTreeNode } from "../tree/nav-tree";
import styles from "./nav-panel.module.css";

export const NAV_PANEL_MODES = ["persistent", "overlay"] as const;
export type NavPanelMode = (typeof NAV_PANEL_MODES)[number];

export interface NavPanelProps {
  /** Nome acessível da região de navegação. */
  label: string;
  /** Persistente fica sempre visível; sobreposto prende o foco enquanto aberto. */
  mode: NavPanelMode;
  /** Rótulo visível do conjunto de destinos apresentado. */
  heading: string;
  /** Árvore de navegação — ao menos uma entrada. */
  tree: readonly [NavTreeNode, ...NavTreeNode[]];
  /** Conteúdo do rodapé — decisão de quem compõe; NavPanel não sabe o que é. */
  footer?: ReactNode;
}

// Painel de navegação: organismo — a barra lateral inteira, sem família
// (não especializa nenhum organismo genérico existente, é a base). Só na
// bancada nesta mudança (design.md, D5): `backoffice-shell` proíbe região
// de navegação no documento emitido enquanto não existir rota de negócio
// real, e ligar isso a `apps/backoffice` reproduziria o defeito que aquele
// requisito já recusa.
export function NavPanel({
  label,
  mode,
  heading,
  tree,
  footer,
}: NavPanelProps) {
  const content = (
    <nav aria-label={label} className={styles.panel ?? ""} data-mode={mode}>
      <p className={styles.heading ?? ""}>{heading}</p>
      <div className={styles.body ?? ""}>
        <NavTree tree={tree} />
      </div>
      {footer ? <div className={styles.footer ?? ""}>{footer}</div> : null}
    </nav>
  );
  // Foco preso só no modo sobreposto: uma barra persistente prenderia quem
  // navega por teclado fora do conteúdo (specs/shell-components/spec.md,
  // "Foco preso só no modo sobreposto").
  return mode === "overlay" ? (
    <FocusScope contain>{content}</FocusScope>
  ) : (
    content
  );
}
