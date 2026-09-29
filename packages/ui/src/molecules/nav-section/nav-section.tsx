import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NavItem } from "../../atoms/nav/link/nav-item";
import { Text } from "../../atoms/text/text";
import styles from "./nav-section.module.css";

export interface NavSectionItem {
  /** Destino da folha. */
  href: string;
  /** Rótulo da folha — texto ou elemento que forme o nome acessível. */
  label: ReactNode;
  /** Ícone opcional, de `lucide-react` — decoração ao lado do rótulo. */
  icon?: LucideIcon;
  /** Estado corrente: a página em que se está agora. */
  isCurrent?: boolean;
}

export interface NavSectionProps {
  /** Rótulo da seção — texto não interativo. */
  label: string;
  /** Folhas da seção — a tupla exige ao menos uma; seção sem folha não compila. */
  items: readonly [NavSectionItem, ...NavSectionItem[]];
}

// Seção de navegação: molécula — compõe um rótulo não clicável (Text) com
// uma lista de folhas (NavItem). O rótulo nunca recebe foco: não é link,
// não é botão, não declara tabIndex — só as folhas são alcançáveis por
// teclado.
export function NavSection({ label, items }: NavSectionProps) {
  return (
    <div className={styles.section ?? ""}>
      <Text weight="semibold">{label}</Text>
      <ul className={styles.list ?? ""}>
        {items.map((item) => (
          <li key={item.href}>
            <NavItem
              href={item.href}
              {...(item.icon ? { icon: item.icon } : {})}
              {...(item.isCurrent !== undefined
                ? { isCurrent: item.isCurrent }
                : {})}
            >
              {item.label}
            </NavItem>
          </li>
        ))}
      </ul>
    </div>
  );
}
