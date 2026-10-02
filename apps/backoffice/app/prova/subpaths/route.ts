import "@chargebr/tokens/tokens.css";
import "@chargebr/tokens/tokens.media.css";
import { tokens } from "@chargebr/tokens";
import { PAIR_SCOPES } from "@chargebr/tokens/palette";
import { Logo } from "@chargebr/ui";
import { Button } from "@chargebr/ui/atoms";
import brandHorizontal from "@chargebr/ui/brand/logo-horizontal.svg";
import brandMark from "@chargebr/ui/brand/logo-mark.svg";
import { BarChart } from "@chargebr/ui/charts";
import { AppFrame } from "@chargebr/ui/shell";

// Arquivo de consumo dos subpaths publicados. Existe para que **todo** subpath
// que os pacotes sob `packages/` publicam em `exports` seja alcançado pela
// construção desta aplicação — não é rota de negócio, como `/prova/[id]` não é.
//
// Resolver não é compilar, e por isso a prova é a construção. Medido com o
// defeito que este ciclo conserta presente: a resolução pelo mapa de exportações
// devolvia 8 de 8 resolvidos, a importação em Node sob `tsx` errava nos dois
// sentidos, `tsc` passava — e só `next build` reprovava, nomeando
// `../generated/tokens.js`, `./hatch.js` e `./source.js`.
//
// É manipulador de rota, e não página, por custo medido sobre o documento que a
// aplicação entrega: como página, o documento da raiz passa a entregar três
// folhas de estilo; como manipulador, duas. A contagem é declarada e afirmada em
// tests/emitted-document.test.ts, para que crescer de novo exija dizer isso na
// mesma mudança.
//
// A lista de subpaths não é declarada aqui: ela é descoberta do `exports` de cada
// pacote e comparada contra o que este arquivo importa, nos dois sentidos, em
// tests/published-subpaths.test.ts. Subpath novo reprova lá até entrar aqui.
export function GET(): Response {
  const loaded = [
    tokens,
    PAIR_SCOPES,
    Button,
    BarChart,
    AppFrame,
    Logo,
    brandHorizontal,
    brandMark,
  ].map((value) => typeof value);
  return new Response(loaded.join(","), {
    headers: { "content-type": "text/plain" },
  });
}
