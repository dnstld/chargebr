import { ChevronRight } from "lucide-react";
import { Button } from "../../button/button";
import styles from "./nav-folder-trigger.module.css";

export interface NavFolderTriggerProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  controls: string;
  isCurrent?: boolean;
}

export function NavFolderTrigger({
  label,
  isExpanded,
  onToggle,
  controls,
  isCurrent = false,
}: NavFolderTriggerProps) {
  return (
    <span
      className={styles.trigger ?? ""}
      {...(isCurrent ? { "data-current": "" } : {})}
    >
      <Button
        icon={ChevronRight}
        aria-expanded={isExpanded}
        aria-controls={controls}
        {...(isCurrent ? { "aria-current": "page" as const } : {})}
        onPress={onToggle}
      >
        {label}
      </Button>
    </span>
  );
}
