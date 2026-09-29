/// <reference types="vite/client" />
import horizontal from "./logo-charge-br-horizontal.svg";

export interface LogoProps {
  /** Nome acessível da marca — normalmente o nome do produto que a compõe. */
  label: string;
}

// Marca da ChargeBR. Referencia o SVG de marca existente, ao lado deste
// arquivo dentro do pacote, como recurso externo (import de asset do Vite)
// em vez de reescrever o desenho como marcação dentro do componente — é o
// que mantém este arquivo sem nenhum literal de cor
// (docs/decisao-identidade-visual.md; design.md, D7). Os dois SVGs de marca
// vivem aqui, não em `src/images/` na raiz — decisão do dono, para que
// `@chargebr/ui` construa a partir da própria raiz do pacote, sem depender
// por acidente do monorepo inteiro; ver histórico de packages/ui/src/atoms/logo/
// para a correção. Sem variante monocromática nesta fase: um só arquivo, a
// versão horizontal, que é a única com consumidor hoje (cabeçalho de
// AppFrame); a vertical fica ao lado, sem prop que a selecione, até um
// ciclo com esse consumidor.
export function Logo({ label }: LogoProps) {
  return <img src={horizontal} alt={label} />;
}
