import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type TestProjectConfiguration } from "vitest/config";
// Extensão explícita: o carregador nativo de configuração do Vite não resolve
// importação sem extensão.
import { BENCH_OPTIMIZE_DEPS } from "./.storybook/optimize-deps.ts";
import { THEME_LABEL, THEMES, type Theme } from "./.storybook/theme.ts";

const configDir = fileURLToPath(new URL("./.storybook", import.meta.url));

// Um projeto por tema: cada história roda duas vezes, e uma violação que só
// existe num tema reprova nomeando o projeto — e portanto o tema — na saída.
// As histórias entram no estágio de testes de `pnpm verify` pelo mesmo
// caminho de qualquer pacote: este arquivo é descoberto pela raiz.
function benchProject(theme: Theme): TestProjectConfiguration {
  return {
    plugins: [storybookTest({ configDir })],
    // Pré-empacotamento explícito, antes da execução; ver optimize-deps.ts.
    optimizeDeps: BENCH_OPTIMIZE_DEPS,
    test: {
      name: THEME_LABEL[theme].toLowerCase(),
      setupFiles: [`${configDir}/vitest.setup.${theme}.ts`],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: [{ browser: "chromium" }],
      },
    },
  };
}

// Contratos: testes que leem o que os átomos declaram e o que as histórias
// exercitam, sem renderizar. Rodam em Node, fora do navegador.
const contractsProject: TestProjectConfiguration = {
  test: {
    name: "contratos",
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
};

export default defineConfig({
  test: {
    projects: [...THEMES.map(benchProject), contractsProject],
  },
});
