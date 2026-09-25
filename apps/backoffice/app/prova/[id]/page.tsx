import { NoProductNotice } from "@/app/_components/no-product-notice";

// Rota de prova: existe para que a forma de entrega resolvida por requisição
// seja exercitada pela árvore, e não só por plantio. Não é rota de negócio.
//
// O segmento dinâmico basta para a construção resolvê-la por requisição; o
// parâmetro não é lido, e nenhum dado é exibido — só o mesmo aviso da rota
// raiz. A importação pelo apelido é deliberada: exercita, a cada verificação,
// que Biome, `tsc` e `next build` concordam sobre ele.
export default function Page() {
  return <NoProductNotice />;
}
