import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "../../icon/icon";
import { Link } from "../../link/link";
import styles from "./nav-leaf.module.css";

type NavLeafContent =
  | { label: string; children?: never }
  | { label?: never; children: ReactNode };

export type NavLeafProps = NavLeafContent & {
  href: string;
  icon?: LucideIcon;
  dot?: boolean;
  meta?: ReactNode;
  isCurrent?: boolean;
};

export function NavLeaf({
  href,
  label,
  children,
  icon: IconComponent,
  dot = false,
  meta,
  isCurrent = false,
}: NavLeafProps) {
  const content = label ?? children;
  return (
    <span
      className={styles.leaf ?? ""}
      {...(isCurrent ? { "data-current": "" } : {})}
    >
      <Link href={href} {...(isCurrent ? { "aria-current": "page" } : {})}>
        {IconComponent ? <Icon as={IconComponent} /> : null}
        {dot ? <span className={styles.dot ?? ""} aria-hidden="true" /> : null}
        {IconComponent === undefined && !dot ? (
          // Sem ícone e sem marcador, a folha ganha um vão do tamanho do
          // chevron de uma pasta: é o que alinha o rótulo de uma página de
          // primeiro nível com os rótulos das pastas irmãs, como na maquete.
          // Alinhamento por estrutura, não por recuo escrito à mão — e
          // geometria, não rótulo: o vão não carrega texto nenhum.
          <span className={styles.spacer ?? ""} aria-hidden="true" />
        ) : null}
        <span>{content}</span>
        {meta !== undefined ? (
          <span className={styles.meta ?? ""}>{meta}</span>
        ) : null}
      </Link>
    </span>
  );
}
