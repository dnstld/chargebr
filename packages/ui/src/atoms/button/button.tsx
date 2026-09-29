"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button as AriaButton, type PressEvent } from "react-aria-components";
import { Icon } from "../icon/icon";
import { Spinner } from "../spinner/spinner";
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
  /**
   * Estado de pendência: `react-aria-components` desliga press/hover mantendo
   * o elemento focalizável. O conteúdo normal permanece — react-aria-components
   * nunca o troca sozinho — e o átomo `Spinner` aparece ao lado dele, nunca no
   * lugar, para que o nome acessível de um botão rotulado por texto não se perca.
   */
  isPending?: boolean;
  /** Identifica, para tecnologia assistiva, o painel que este botão expande ou recolhe. */
  "aria-expanded"?: boolean;
  /** Identifica, para tecnologia assistiva, o elemento que este botão controla. */
  "aria-controls"?: string;
  /** Identifica, para tecnologia assistiva, o texto que descreve este botão. */
  "aria-describedby"?: string;
  /** Ação ao ativar o botão. Recebe o evento de ativação completo da primitiva. */
  onPress?: (e: PressEvent) => void;
};

// Botão genérico: cor de ação, com ícone opcional por composição — sempre
// via Icon, nunca um ícone importado direto aqui. Foco, teclado e ponteiro
// vêm de react-aria-components.
export function Button({
  icon: IconComponent,
  size = "md",
  isPending,
  onPress,
  children,
  ...rest
}: ButtonProps) {
  const sizeClass = styles[size] ?? "";
  return (
    <AriaButton
      type="button"
      className={`${styles.button ?? ""} ${sizeClass}`}
      {...(isPending !== undefined ? { isPending } : {})}
      {...(onPress ? { onPress } : {})}
      {...rest}
    >
      {(renderProps) => (
        <>
          {IconComponent ? <Icon as={IconComponent} /> : null}
          {children}
          {renderProps.isPending ? <Spinner size={size} /> : null}
        </>
      )}
    </AriaButton>
  );
}
