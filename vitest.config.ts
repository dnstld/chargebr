import { defineConfig } from "vitest/config";

// O perímetro é resolvido pelo workspace: cada pacote sob `packages/*` e `apps/*`
// vira um projeto do Vitest sem edição neste arquivo quando um pacote novo entra.
export default defineConfig({
  test: {
    projects: [
      "packages/*",
      "apps/*",
      // Guardiões do repositório: verificam o próprio perímetro, sem virar
      // conteúdo verificado. Rodam junto com a etapa de testes de `verify`.
      {
        test: {
          name: "guards",
          include: ["tools/checks/**/*.test.ts"],
        },
      },
    ],
  },
});
