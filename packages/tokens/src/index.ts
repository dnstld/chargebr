import type { TokenName } from "../generated/tokens.ts";

export { type Token, type TokenName, tokens } from "../generated/tokens.ts";
export { HATCH, type HatchGeometry } from "./hatch.ts";

// Nome da custom property de um token, para uso em CSS ou em estilo inline.
// Nome inexistente falha na checagem de tipos, não em tempo de execução.
export function cssVar(name: TokenName): `var(--${TokenName})` {
  return `var(--${name})`;
}
