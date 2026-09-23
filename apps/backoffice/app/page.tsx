import type { Metadata } from "next";

// A rota raiz, e a única. Texto e nada mais: sem número, sem dado e sem
// primitiva de domínio — a moldura não exibe valor, e portanto não toca em
// proveniência, eixo de estado nem projeção bloqueada.
export const metadata: Metadata = {
  description: "Shell do back office do ChargeBR, sem tela de produto.",
};

export default function Page() {
  return <p>O back office do ChargeBR ainda não tem tela de produto.</p>;
}
