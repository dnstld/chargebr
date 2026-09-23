import "@chargebr/tokens/tokens.css";
import "./global.css";
import { AppFrame } from "@chargebr/ui/shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// O idioma é declarado no elemento raiz do documento entregue: é por ele que a
// leitura assistida escolhe a fonética.
//
// Nenhum atributo de tema, e nenhum script de tema: a preferência do sistema é
// resolvida inteiramente em CSS pela folha publicada por @chargebr/tokens.
export const metadata: Metadata = {
  title: "ChargeBR",
};

// O texto da moldura é decisão da aplicação, e chega a ela por propriedade.
const PRODUCT_NAME = "ChargeBR";
const SKIP_LABEL = "Ir para o conteúdo";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppFrame productName={PRODUCT_NAME} skipLabel={SKIP_LABEL}>
          {children}
        </AppFrame>
      </body>
    </html>
  );
}
