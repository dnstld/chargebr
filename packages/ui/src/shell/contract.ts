import type { ComponentType } from "react";
import { type AtomContract, defineContract } from "../atoms/contract";

// Contrato da moldura: a mesma forma do contrato dos átomos, das primitivas e
// das formas de gráfico, para que a cobertura de histórias leia as quatro
// camadas com o mesmo código. O que muda é só o nome da camada na mensagem.
export type FrameContract<State extends string = string> = AtomContract<State>;

// Os estados da moldura. Carregamento, vazio e erro não estão aqui e não são
// omissão: a moldura não busca dado e não exibe valor, então nenhuma história
// conseguiria exercitá-los. Eles passam a ser exigíveis no ciclo em que a
// moldura hospedar conteúdo que dependa de dado.
export const FRAME_STATES = [
  // Salto presente e sem foco.
  "idle",
  // Link de salto em foco visível.
  "skip-focused",
] as const;
export type FrameState = (typeof FRAME_STATES)[number];

export function defineFrame(contract: {
  readonly name: string;
  readonly component: ComponentType<never>;
  readonly states: readonly FrameState[];
}): FrameContract<FrameState> {
  return defineContract("Moldura", contract);
}
