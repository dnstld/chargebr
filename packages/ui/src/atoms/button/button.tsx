"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { defineAtom } from "../contract";
import { Icon } from "../icon/icon";
import styles from "./button.module.css";

// Estados de interação, mesma restrição de EvidenceAnchor: "hovered" e
// "pressed" não entram como estado coberto por história — o incidente de
// docs/incidente-instabilidade-da-bancada.md segue aberto para toda
// primitiva nova (docs/decisao-biblioteca-de-componentes.md, R1). O atributo
// de dado continua vindo da primitiva em tempo de execução; só a cobertura
// por história fica de fora.
export const BUTTON_STATES = ["idle", "focus-visible"] as const;
export type ButtonState = (typeof BUTTON_STATES)[number];

// Um botão sem rótulo visível precisa de nome acessível por propriedade — o
// gatilho do hambúrguer é o caso real (ícone só, sem texto). O tipo recusa a
// combinação que deixaria o botão sem nenhum dos dois.
type ButtonContent =
  | { children: ReactNode; "aria-label"?: never }
  | { children?: never; "aria-label": string };

export type ButtonProps = ButtonContent & {
  /** Ícone opcional, de `lucide-react` — decoração ao lado do rótulo, ou o único conteúdo do botão ícone-only. */
  icon?: LucideIcon;
  /** Ação ao ativar o botão. */
  onPress?: () => void;
};

// Botão genérico: cor de ação, com ícone opcional por composição — sempre
// via Icon, nunca um ícone importado direto aqui. Foco, teclado e ponteiro
// vêm de react-aria-components, a mesma primitiva de comportamento de
// EvidenceAnchor.
export function Button({
  icon: IconComponent,
  onPress,
  children,
  ...rest
}: ButtonProps) {
  return (
    <AriaButton
      type="button"
      className={styles.button ?? ""}
      {...(onPress ? { onPress } : {})}
      {...rest}
    >
      {IconComponent ? <Icon as={IconComponent} /> : null}
      {children}
    </AriaButton>
  );
}

export const ButtonAtom = defineAtom({
  name: "Button",
  component: Button,
  states: BUTTON_STATES,
});
