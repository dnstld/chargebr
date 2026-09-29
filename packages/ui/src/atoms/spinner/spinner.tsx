import styles from "./spinner.module.css";

// Três degraus, a mesma escala nomeada que `Button.size` usa — para que o
// spinner composto dentro de um botão acompanhe o tamanho dele.
export const SPINNER_SIZES = ["sm", "md", "lg"] as const;
export type SpinnerSize = (typeof SPINNER_SIZES)[number];

export interface SpinnerProps {
  /** Variante de tamanho, alinhada à mesma escala de `Button`. */
  size?: SpinnerSize;
}

// Indicador de progresso indeterminado: anel parcial em rotação contínua, cor
// de marca. Puramente decorativo (`aria-hidden`) — medido contra
// `react-aria-components` (design.md, D8): `Button.isPending` já anuncia a
// transição de pendência a tecnologia assistiva por conta própria (um
// `aria-live="assertive"` que repete o nome do botão quando ele está
// focado), e uma região viva sem texto (o `role="status"` anterior) não
// anunciava nada — não preenchia a lacuna, só parecia preenchê-la.
// `data-spinner` é o gancho de consulta, no mesmo padrão de `data-hatch` em
// `Hatch` para um SVG decorativo.
export function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClass = styles[size] ?? "";
  return (
    <svg
      className={`${styles.spinner ?? ""} ${sizeClass}`}
      data-spinner=""
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className={styles.arc} cx="12" cy="12" r="10" strokeWidth="3" />
    </svg>
  );
}
