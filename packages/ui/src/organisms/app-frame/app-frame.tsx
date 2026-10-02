import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../atoms/button/button";
import { Logo } from "../../atoms/logo/logo";
import styles from "./app-frame.module.css";

// Destino do salto, e âncora da região de conteúdo principal. É identificador,
// não rótulo: o texto que a moldura exibe vem inteiro por propriedade.
export const MAIN_CONTENT_ID = "main-content";

// Invólucro do slot de navegação. `nav` é opaco para a moldura — ela não
// conhece a forma de dentro (NavPanel ou qualquer outra coisa), então
// `aria-controls` do gatilho aponta para este invólucro, não para um id que
// só quem compõe `nav` saberia nomear.
export const NAV_CONTENT_ID = "nav-content";

// Os quatro campos do slot de navegação entram juntos ou nenhum: `nav` sem
// os outros três não é um slot usável (sem rótulo do gatilho não há nome
// acessível para anunciar; sem `navOpen`/`onNavToggle` não há como o
// gatilho refletir nem mudar o estado). A moldura não guarda esse estado —
// fica em quem compõe, porque `AppFrame` continua sem "use client" (ver
// abaixo).
type AppFrameNavSlot =
  | {
      nav?: undefined;
      navToggleLabel?: undefined;
      navOpen?: undefined;
      onNavToggle?: undefined;
    }
  | {
      /** Conteúdo do slot de navegação — opaco: a moldura não conhece sua forma. */
      nav: ReactNode;
      /** Nome acessível do gatilho que abre/fecha `nav` abaixo do breakpoint. */
      navToggleLabel: string;
      /** Estado aberto/fechado de `nav` abaixo do breakpoint. Decisão de quem compõe. */
      navOpen: boolean;
      /** Alterna `navOpen`. A moldura não guarda estado — só o reflete. */
      onNavToggle: () => void;
    };

export type AppFrameProps = AppFrameNavSlot & {
  /** Nome do produto, nome acessível de `Logo` no cabeçalho. Decisão da aplicação. */
  productName: string;
  /** Texto do link de salto. Decisão da aplicação. */
  skipLabel: string;
  /** URL do arquivo da marca do cabeçalho. Decisão da aplicação: quem compõe sabe como o próprio empacotador produz URL. */
  brandSrc: string;
  /** O conteúdo da rota, dentro da região de conteúdo principal. */
  children: ReactNode;
  /** Trilha lateral independente do painel de navegação. */
  rail?: ReactNode;
};

// Moldura do shell: salto, cabeçalho, slot de navegação opcional e conteúdo
// principal num componente só. A garantia que importa é uma relação entre
// as partes — o salto é o primeiro focalizável e seu destino é a região de
// conteúdo —, e uma relação partida em componentes separados vira
// responsabilidade de quem compõe.
//
// Sem `"use client"`, e por decisão: o salto é uma âncora para o fragmento da
// região de conteúdo, que declara `tabIndex={-1}` para ser focalizável. O
// navegador move o foco para o alvo do fragmento sozinho; nenhum manipulador
// de evento participa, e a aplicação não emite script próprio por causa
// disto. `navOpen`/`onNavToggle` seguem a mesma regra: o gatilho do
// hambúrguer precisa de estado aberto/fechado (`aria-expanded`), e esse
// estado entra por propriedade, controlado por quem compõe — nunca por
// `useState` aqui dentro. Em `apps/backoffice`, que nunca passa `nav`, nada
// do slot de navegação é renderizado, e o documento emitido não muda.
export function AppFrame(props: AppFrameProps) {
  const { productName, skipLabel, brandSrc, children } = props;
  const hasShell = props.rail !== undefined || props.nav !== undefined;
  return (
    <div
      className={styles.frame ?? ""}
      data-frame="app"
      {...(hasShell ? { "data-shape": "shell" } : {})}
    >
      <a className={styles.skip ?? ""} href={`#${MAIN_CONTENT_ID}`}>
        {skipLabel}
      </a>
      {props.rail !== undefined ? (
        <div className={styles.rail ?? ""}>{props.rail}</div>
      ) : null}
      <header className={styles.header ?? ""}>
        <Logo label={productName} src={brandSrc} />
        {props.nav ? (
          // `Button` não aceita `className` — o invólucro é quem some acima
          // do breakpoint (app-frame.module.css, `.hamburger`).
          <span className={styles.hamburger ?? ""}>
            <Button
              icon={Menu}
              aria-label={props.navToggleLabel}
              aria-expanded={props.navOpen}
              aria-controls={NAV_CONTENT_ID}
              onPress={props.onNavToggle}
            />
          </span>
        ) : null}
      </header>
      {props.nav ? (
        <div
          id={NAV_CONTENT_ID}
          className={styles.nav ?? ""}
          {...(props.navOpen ? { "data-open": "" } : {})}
        >
          {props.nav}
        </div>
      ) : null}
      <main className={styles.main ?? ""} id={MAIN_CONTENT_ID} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
