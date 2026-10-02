import { Database } from "lucide-react";
import { NavRail } from "./nav-rail";

export const navRailWithoutDestination = (
  <NavRail
    label="Áreas do produto"
    brandLabel="ChargeBR"
    brandSrc="/marca.svg"
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
    brandSrc="/marca.svg"
    destinations={[{ icon: Database, label: "Fontes" }]}
    avatarInitials="DT"
    avatarLabel="Conta de Denis Toledo"
  />
);

// `brandSrc` é obrigatório pela mesma razão que em `AppFrame`: a trilha compõe
// `Logo`, e `Logo` não resolve mais o arquivo de marca por conta própria
// (specs/shell-components, "Trilha sem a URL da marca não compila").
export const navRailWithoutBrandSrc = (
  // @ts-expect-error brandSrc é obrigatório
  <NavRail
    label="Áreas do produto"
    brandLabel="ChargeBR"
    destinations={[{ icon: Database, label: "Fontes" }]}
    avatarInitials="DT"
    avatarLabel="Conta de Denis Toledo"
  />
);
