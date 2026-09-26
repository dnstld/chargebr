import { defineConfig } from "vitest/config";

// Camada 2 — o documento emitido. Roda em Node, lê o que `next build` emitiu e
// não renderiza nada: o objeto da prova é a saída da construção, não a fonte.
//
// A construção acontece uma vez por execução, no `globalSetup`, antes de
// qualquer afirmação. Não é estágio novo de `pnpm verify`: acontece dentro do
// estágio de testes, como a bancada acontece. A listagem do que a checagem de
// tipos lê vem depois dela, na ordem declarada, porque lê a árvore construída.
export default defineConfig({
  test: {
    name: "documento emitido",
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globalSetup: ["./tests/build.setup.ts", "./tests/type-stage.setup.ts"],
    // A construção domina o tempo do arquivo; o padrão não a cobre.
    hookTimeout: 180_000,
  },
});
