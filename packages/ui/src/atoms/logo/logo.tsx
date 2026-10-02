export const LOGO_VARIANTS = ["horizontal", "mark"] as const;
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

export interface LogoProps {
  /** Nome acessível da marca — normalmente o nome do produto que a compõe. */
  label: string;
  /** URL do arquivo da marca, produzida pelo empacotador de quem compõe. */
  src: string;
  /** Forma da marca que `src` aponta. A versão horizontal permanece o padrão. */
  variant?: LogoVariant;
}

// Marca da ChargeBR. A marca continua sendo recurso externo — os dois SVGs vivem
// ao lado deste arquivo, dentro do pacote, e são publicados por subpath — em vez
// de desenho reescrito como marcação aqui: é o que mantém este arquivo sem nenhum
// literal de cor (docs/decisao-identidade-visual.md; design.md, D7). Os arquivos
// não estão em `src/images/` na raiz por decisão do dono, para que `@chargebr/ui`
// construa a partir da própria raiz do pacote. Sem variante monocromática nesta
// fase: as duas variantes têm cor própria, fixada no arquivo.
//
// A URL chega por propriedade, e não por import de asset aqui dentro, porque o
// resultado de um import de asset depende do empacotador de quem consome: o da
// bancada devolve cadeia, o da aplicação devolve objeto de imagem estática, e
// `src={objeto}` serializa para `[object Object]` — foi assim que a marca saiu
// quebrada em três documentos emitidos. Quem compõe sabe como o próprio
// empacotador produz URL; este componente não tem como saber, e não adivinha.
export function Logo({ label, src, variant = "horizontal" }: LogoProps) {
  return <img src={src} alt={label} data-variant={variant} />;
}
