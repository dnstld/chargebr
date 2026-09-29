"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Icon } from "../icon/icon";
import styles from "./button.module.css";

// Um botão sem rótulo visível precisa de nome acessível por propriedade — o
// gatilho do hambúrguer é o caso real (ícone só, sem texto). O tipo recusa a
// combinação que deixaria o botão sem nenhum dos dois.
type ButtonContent =
  | { children: ReactNode; "aria-label"?: never }
  | { children?: never; "aria-label": string };

// Três degraus, o mesmo número de `space.inset`/`space.gap` — `size="md"`
// alinha às duas escalas no mesmo passo (design.md, D1). `md` é o padrão: o
// mesmo tamanho que o botão já usava sem variante.
export const BUTTON_SIZES = ["sm", "md", "lg"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export type ButtonProps = ButtonContent & {
  /** Ícone opcional, de `lucide-react` — decoração ao lado do rótulo, ou o único conteúdo do botão ícone-only. */
  icon?: LucideIcon;
  /** Variante de tamanho. Resolve tipografia e espaço juntos, por token de componente. */
  size?: ButtonSize;
  /** Estado desabilitado: não dispara `onPress`, aparência por token próprio. */
  isDisabled?: boolean;
  /** Ação ao ativar o botão. */
  onPress?: () => void;
};

// Botão genérico: cor de ação, com ícone opcional por composição — sempre
// via Icon, nunca um ícone importado direto aqui. Foco, teclado e ponteiro
// vêm de react-aria-components.
export function Button({
  icon: IconComponent,
  size = "md",
  onPress,
  children,
  ...rest
}: ButtonProps) {
  const sizeClass = styles[size] ?? "";
  return (
    <AriaButton
      type="button"
      className={`${styles.button ?? ""} ${sizeClass}`}
      {...(onPress ? { onPress } : {})}
      {...rest}
    >
      {IconComponent ? <Icon as={IconComponent} /> : null}
      {children}
    </AriaButton>
  );
}
