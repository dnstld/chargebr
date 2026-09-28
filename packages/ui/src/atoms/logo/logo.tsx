/// <reference types="vite/client" />
// biome-ignore lint/style/noRestrictedImports: "**/src/**" mira árvore herdada de dado (collector/extractor); src/images/ é asset de marca, território da frente de interface mesmo fora de apps|packages|openspec|tools (CLAUDE.md), e é a origem externa que design.md (D7) exige para não inlinear cor no .tsx.
import horizontal from "../../../../../src/images/logo-charge-br-horizontal.svg";
import { defineAtom } from "../contract";

export interface LogoProps {
  /** Nome acessível da marca — normalmente o nome do produto que a compõe. */
  label: string;
}

// Marca da ChargeBR. Referencia o SVG de marca existente como recurso
// externo (import de asset do Vite) em vez de reescrever o desenho como
// marcação dentro do componente — é o que mantém este arquivo sem nenhum
// literal de cor (docs/decisao-identidade-visual.md; design.md, D7). Sem
// variante monocromática nesta fase: um só arquivo, a versão horizontal, que
// é a única com consumidor hoje (cabeçalho de AppFrame).
export function Logo({ label }: LogoProps) {
  return <img src={horizontal} alt={label} />;
}

export const LOGO_STATES = ["default"] as const;

export const LogoAtom = defineAtom({
  name: "Logo",
  component: Logo,
  states: LOGO_STATES,
});
