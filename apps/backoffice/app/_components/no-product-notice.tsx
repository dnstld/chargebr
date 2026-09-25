// O aviso de que o back office não tem tela de produto. Texto e nada mais: sem
// número, sem dado e sem primitiva de domínio — não exibe valor, e portanto não
// toca em proveniência, eixo de estado nem projeção bloqueada.
//
// A pasta `_components` é privada pela convenção de rotas: nada nela vira rota.
export function NoProductNotice() {
  return <p>O back office do ChargeBR ainda não tem tela de produto.</p>;
}
