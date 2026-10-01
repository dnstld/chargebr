import { Database } from "lucide-react";
import { NavRail } from "./nav-rail";

export const navRailWithoutDestination = (
  <NavRail
    label="Áreas do produto"
    brandLabel="ChargeBR"
    // @ts-expect-error destinations exige ao menos um destino
    destinations={[]}
    avatarInitials="DT"
    avatarLabel="Conta de Denis Toledo"
  />
);

export const navRailWithDestination = (
  <NavRail
    label="Áreas do produto"
    brandLabel="ChargeBR"
    destinations={[{ icon: Database, label: "Fontes" }]}
    avatarInitials="DT"
    avatarLabel="Conta de Denis Toledo"
  />
);
