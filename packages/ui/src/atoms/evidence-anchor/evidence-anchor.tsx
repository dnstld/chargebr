"use client";

import { Link } from "react-aria-components";
import { defineAtom } from "../contract";
import styles from "./evidence-anchor.module.css";

// Estados de interação, expostos pela primitiva de comportamento como
// atributos de dado no elemento renderizado. Só entra aqui o estado que a
// bancada verifica de forma confiável: "hovered" saiu do contrato porque sua
// história reprovava de forma intermitente no CI sem causa conhecida (ver
// docs/incidente-instabilidade-da-bancada.md), e estado declarado sem história
// verde é promessa que o contrato não cumpre. O atributo `data-hovered`
// continua vindo da primitiva em tempo de execução, e o estilo derivado dele
// continua no CSS.
export const EVIDENCE_ANCHOR_STATES = ["idle", "focus-visible"] as const;
export type EvidenceAnchorState = (typeof EVIDENCE_ANCHOR_STATES)[number];

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

export const EvidenceAnchorAtom = defineAtom({
  name: "EvidenceAnchor",
  component: EvidenceAnchor,
  states: EVIDENCE_ANCHOR_STATES,
});
