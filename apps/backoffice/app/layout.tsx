import "@chargebr/tokens/tokens.css";
import "./global.css";
import { AppFrame } from "@chargebr/ui/shell";
import brandHorizontal from "@chargebr/ui/brand/logo-horizontal.svg";
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

// A URL do arquivo de marca também é decisão da aplicação, pela mesma razão: só
// ela sabe como o próprio empacotador transforma o import num endereço. O pacote
// publica o arquivo por subpath e recebe a URL por propriedade.
//
// O tipo que o framework declara para um import de `*.svg` é `any`, de propósito
// (ver image-imports.d.ts), então nada aqui reprova se esta linha voltar a passar
// o objeto inteiro em vez de `.src`. Quem pega isso é a afirmação sobre a
// referência da marca em tests/emitted-document.test.ts.
const BRAND_SRC: string = brandHorizontal.src;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppFrame
          productName={PRODUCT_NAME}
          skipLabel={SKIP_LABEL}
          brandSrc={BRAND_SRC}
        >
          {children}
        </AppFrame>
      </body>
    </html>
  );
}
