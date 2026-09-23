import type { ReactNode } from "react";
import { defineFrame, FRAME_STATES } from "./contract";
import styles from "./app-frame.module.css";

// Destino do salto, e âncora da região de conteúdo principal. É identificador,
// não rótulo: o texto que a moldura exibe vem inteiro por propriedade.
export const MAIN_CONTENT_ID = "main-content";

export interface AppFrameProps {
  /** Nome do produto, exibido no cabeçalho. Decisão da aplicação. */
  productName: string;
  /** Texto do link de salto. Decisão da aplicação. */
  skipLabel: string;
  /** O conteúdo da rota, dentro da região de conteúdo principal. */
  children: ReactNode;
}

// Moldura do shell: salto, cabeçalho e conteúdo principal num componente só.
// A garantia que importa é uma relação entre as três partes — o salto é o
// primeiro focalizável e seu destino é a região de conteúdo —, e uma relação
// partida em três componentes vira responsabilidade de quem compõe.
//
// Sem `"use client"`, e por decisão: o salto é uma âncora para o fragmento da
// região de conteúdo, que declara `tabIndex={-1}` para ser focalizável. O
// navegador move o foco para o alvo do fragmento sozinho; nenhum manipulador
// de evento participa, e a aplicação não emite script próprio por causa disto.
export function AppFrame({ productName, skipLabel, children }: AppFrameProps) {
  // Com noUncheckedIndexedAccess a classe é string | undefined.
  return (
    <div className={styles.frame ?? ""} data-frame="app">
      <a className={styles.skip ?? ""} href={`#${MAIN_CONTENT_ID}`}>
        {skipLabel}
      </a>
      <header className={styles.header ?? ""}>{productName}</header>
      <main className={styles.main ?? ""} id={MAIN_CONTENT_ID} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

export const AppFrameContract = defineFrame({
  name: "AppFrame",
  component: AppFrame,
  states: FRAME_STATES,
});
