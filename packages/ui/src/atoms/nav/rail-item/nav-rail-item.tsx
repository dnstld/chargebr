import type { LucideIcon } from "lucide-react";
import type { PressEvent } from "react-aria-components";
import { Button } from "../../button/button";
import styles from "./nav-rail-item.module.css";

export interface NavRailItemProps {
  icon: LucideIcon;
  label: string;
  isCurrent?: boolean;
  onPress?: (event: PressEvent) => void;
}

export function NavRailItem({
  icon,
  label,
  isCurrent = false,
  onPress,
}: NavRailItemProps) {
  return (
    <span className={styles.item ?? ""}>
      <Button
        icon={icon}
        aria-label={label}
        {...(isCurrent ? { "aria-current": true } : {})}
        {...(onPress ? { onPress } : {})}
      />
    </span>
  );
}
