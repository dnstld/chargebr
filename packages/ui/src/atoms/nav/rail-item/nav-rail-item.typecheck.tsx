import { Database } from "lucide-react";
import { NavRailItem } from "./nav-rail-item";

export const navRailItemWithoutLabel = (
  // @ts-expect-error label é obrigatório para o botão somente com ícone
  <NavRailItem icon={Database} />
);
