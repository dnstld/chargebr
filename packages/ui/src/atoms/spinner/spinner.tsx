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
// de marca. `role="status"` o identifica como indicador de progresso sem
// exigir nome acessível próprio — não é um papel que o ARIA obriga a nomear,
// e por isso não conflita nem duplica o nome de um controle que já o tem
// (`Button` em pendência, design.md D3).
export function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClass = styles[size] ?? "";
  return (
    <svg
      className={`${styles.spinner ?? ""} ${sizeClass}`}
      role="status"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className={styles.arc} cx="12" cy="12" r="10" strokeWidth="3" />
    </svg>
  );
}
