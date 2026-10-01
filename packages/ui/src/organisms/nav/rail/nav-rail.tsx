"use client";

import type { LucideIcon } from "lucide-react";
import type { PressEvent } from "react-aria-components";
import { Avatar } from "../../../atoms/avatar/avatar";
import { Logo } from "../../../atoms/logo/logo";
import { NavRailItem } from "../../../atoms/nav/rail-item/nav-rail-item";
import styles from "./nav-rail.module.css";

export interface NavRailDestination {
  icon: LucideIcon;
  label: string;
  isCurrent?: boolean;
  onPress?: (event: PressEvent) => void;
}

export interface NavRailProps {
  label: string;
  brandLabel: string;
  destinations: readonly [NavRailDestination, ...NavRailDestination[]];
  avatarInitials: string;
  avatarLabel: string;
  onAvatarPress?: (event: PressEvent) => void;
}

export function NavRail({
  label,
  brandLabel,
  destinations,
  avatarInitials,
  avatarLabel,
  onAvatarPress,
}: NavRailProps) {
  return (
    <aside aria-label={label} className={styles.rail ?? ""}>
      <span className={styles.mark ?? ""}>
        <Logo label={brandLabel} variant="mark" />
      </span>
      {destinations.map((destination) => (
        <NavRailItem
          key={destination.label}
          icon={destination.icon}
          label={destination.label}
          {...(destination.isCurrent ? { isCurrent: true } : {})}
          {...(destination.onPress ? { onPress: destination.onPress } : {})}
        />
      ))}
      <span className={styles.spacer ?? ""} />
      <Avatar
        initials={avatarInitials}
        label={avatarLabel}
        {...(onAvatarPress ? { onPress: onAvatarPress } : {})}
      />
    </aside>
  );
}
