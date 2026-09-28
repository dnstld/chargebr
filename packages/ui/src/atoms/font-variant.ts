// Peso e destaque genéricos, compartilhados por Texto e Número para que a
// mesma variante produza o mesmo resultado nos dois. Vêm de `font.weight.*`
// e `font.style.*` (`primitive/typography.json`) sem nome inventado: as
// chaves já são os valores da variante (ver
// docs/decisao-biblioteca-de-componentes.md, "O formato de variante").
export const FONT_WEIGHTS = ["regular", "medium", "semibold"] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const FONT_EMPHASES = ["normal", "italic"] as const;
export type FontEmphasis = (typeof FONT_EMPHASES)[number];
