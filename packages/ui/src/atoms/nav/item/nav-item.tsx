import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "../../icon/icon";
import { Link } from "../../link/link";
import styles from "./nav-item.module.css";

export interface NavItemProps {
  /** Destino do item. */
  href: string;
  /** Rótulo do item — texto ou elemento que forme o nome acessível. */
  children: ReactNode;
  /** Ícone opcional, de `lucide-react` — decoração ao lado do rótulo. */
  icon?: LucideIcon;
  /** Estado corrente: a página em que se está agora. */
  isCurrent?: boolean;
}

// Item de navegação: família de Link (atoms/link/), para o contexto visual
// de uma folha de navegação. Compõe Link e redefine os tokens dela — nunca
// reimplementa a âncora, o foco ou o teclado, que continuam vindo inteiros
// de react-aria-components por dentro de Link.
export function NavItem({
  href,
  children,
  icon: IconComponent,
  isCurrent = false,
}: NavItemProps) {
  return (
    <span
      className={styles.navItem ?? ""}
      {...(isCurrent ? { "data-current": "" } : {})}
    >
      <Link href={href} {...(isCurrent ? { "aria-current": "page" } : {})}>
        {IconComponent ? <Icon as={IconComponent} /> : null}
        {children}
      </Link>
    </span>
  );
}
