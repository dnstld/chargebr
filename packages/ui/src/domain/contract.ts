import type { ComponentType } from "react";
import { type AtomContract, defineContract } from "../atoms/contract";

// Contrato de uma primitiva de domínio: a mesma forma do contrato dos átomos,
// para que a checagem de cobertura de histórias leia as duas camadas com o
// mesmo código. O tipo é reexportado com o nome da camada.
export type PrimitiveContract<State extends string = string> =
  AtomContract<State>;

export function definePrimitive<const State extends string>(contract: {
  readonly name: string;
  readonly component: ComponentType<never>;
  readonly states: readonly State[];
}): PrimitiveContract<State> {
  return defineContract("Primitiva", contract);
}
