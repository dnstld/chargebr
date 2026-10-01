import { NavLeaf } from "./nav-leaf";

export const navLeafWithoutAccessibleName = (
  // @ts-expect-error label ou children é obrigatório
  <NavLeaf href="#destino" />
);
