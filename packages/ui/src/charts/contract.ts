import type { ComponentType } from "react";
import { type AtomContract, defineContract } from "../atoms/contract";

// Contrato de uma forma de gráfico: a mesma forma do contrato dos átomos e
// das primitivas, para que a cobertura de histórias leia as três camadas com
// o mesmo código. Uma forma sem história para algum estado reprova ali.
export type ChartContract<State extends string = string> = AtomContract<State>;

// Os estados que uma forma exercita. Não são variações de aparência: são os
// estados do domínio que a camada precisa preservar, e cada um tem prova
// própria em história.
export const CHART_STATES = [
  // Uma série só: sem legenda obrigatória.
  "single_series",
  // Duas ou mais: legenda presente, e identidade que não depende de cor.
  "multiple_series",
  // Ponto não resolvido: hachura, sem ligação e sem agregação.
  "unresolved_point",
  // Ponto ausente: sem marca, sem interpolação, ausência declarada.
  "missing_point",
  // Projeção bloqueada: nada do gráfico sobra.
  "blocked",
] as const;
export type ChartState = (typeof CHART_STATES)[number];

export function defineChart(contract: {
  readonly name: string;
  readonly component: ComponentType<never>;
  readonly states: readonly ChartState[];
}): ChartContract<ChartState> {
  return defineContract("Forma", contract);
}
