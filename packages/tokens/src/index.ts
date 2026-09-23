import type { TokenName } from "../generated/tokens.js";

export { type Token, type TokenName, tokens } from "../generated/tokens.js";
export { HATCH, type HatchGeometry } from "./hatch.js";

// Nome da custom property de um token, para uso em CSS ou em estilo inline.
// Nome inexistente falha na checagem de tipos, não em tempo de execução.
export function cssVar(name: TokenName): `var(--${TokenName})` {
  return `var(--${name})`;
}
