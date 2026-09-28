import type { ElementType, ReactNode } from "react";
import styles from "./heading.module.css";

// Sete graus — o mesmo domínio de `font.size.*`, sem subconjunto inventado
// (design.md, D3: "variante level mapeada a font.size.*"). Nível maior é
// texto maior: é o mesmo sentido do índice do token — o padrão de
// "subtítulo" é uma segunda chamada com nível menor, e portanto texto
// menor.
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

// `verify:lint` (useSemanticElements) exige elemento nativo, não
// role="heading" solto — e h1-h6 são seis tags para sete níveis. Nível
// maior escolhe a tag mais rasa (mais provável de ser título de página);
// os dois níveis mais discretos, 1 e 2, compartilham <h6>, a mais funda —
// mecânico, muda só a tag, nunca o tamanho (esse continua vindo direto de
// font.size.<nível>). Nenhum requisito observável desta mudança distingue
// nível 1 de nível 2 no documento; se um dia distinguir, esta tabela ganha
// uma tag a mais só se o HTML ganhar uma.
const TAG_BY_LEVEL: Record<HeadingLevel, ElementType> = {
  7: "h1",
  6: "h2",
  5: "h3",
  4: "h4",
  3: "h5",
  2: "h6",
  1: "h6",
};

export interface HeadingProps {
  /**
   * Nível do título: decide o tamanho, de `font.size.<nível>`, e a tag
   * nativa. Decisão de quem compõe a página, não do componente
   * (design.md, D3) — não existe padrão embutido de "subtítulo"; duas
   * chamadas de `Heading`, a segunda com nível menor, é o padrão de uso.
   */
  level: HeadingLevel;
  children: ReactNode;
}

// Título genérico: Text especializado com papel de heading nativo e uma
// variante de nível que decide o tamanho.
export function Heading({ level, children }: HeadingProps) {
  const Tag = TAG_BY_LEVEL[level];
  const levelClass = styles[`level${level}`] ?? "";
  return (
    <Tag className={`${styles.heading ?? ""} ${levelClass}`} data-level={level}>
      {children}
    </Tag>
  );
}
