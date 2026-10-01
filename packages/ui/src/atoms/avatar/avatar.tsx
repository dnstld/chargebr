"use client";

import type { PressEvent } from "react-aria-components";
import { Button as AriaButton } from "react-aria-components";
import styles from "./avatar.module.css";

export interface AvatarProps {
  initials: string;
  label: string;
  onPress?: (event: PressEvent) => void;
}

export function Avatar({ initials, label, onPress }: AvatarProps) {
  return (
    <AriaButton
      type="button"
      className={styles.avatar ?? ""}
      aria-label={label}
      {...(onPress ? { onPress } : {})}
    >
      {initials}
    </AriaButton>
  );
}
