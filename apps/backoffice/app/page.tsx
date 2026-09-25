import type { Metadata } from "next";
import { NoProductNotice } from "./_components/no-product-notice";

// A rota raiz. Exibe o aviso de que não há tela de produto — o mesmo da rota
// de prova: nenhuma rota do back office tem tela de produto.
export const metadata: Metadata = {
  description: "Shell do back office do ChargeBR, sem tela de produto.",
};

export default function Page() {
  return <NoProductNotice />;
}
