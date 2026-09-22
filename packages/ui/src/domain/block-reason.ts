// Razões pelas quais uma projeção é bloqueada. É a enumeração própria da
// biblioteca, conferida contra os códigos de bloqueio do contrato de leitura
// metodológica, e não importada dele: a tradução de um código do contrato
// para uma razão daqui é responsabilidade de quem consome. Cada razão tem
// termo no vocabulário e história própria.
export const BLOCK_REASONS = [
  "metric_not_found",
  "scope_mismatch",
  "methodology_missing",
  "methodology_cycle",
  "current_methodology_not_unique",
  "primary_value_not_unique",
  "value_method_mismatch",
  "primary_outside_applicability",
  "provenance_incomplete",
  "unsupported_value_origin",
  "components_incomplete",
  "unexpected_cardinality",
] as const;
export type BlockReason = (typeof BLOCK_REASONS)[number];
