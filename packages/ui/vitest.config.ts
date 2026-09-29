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
      // Os dois projetos de tema não rodam ao mesmo tempo.
      //
      // Eles compartilham o cache de otimização que o complemento do Storybook
      // mantém em `node_modules/.cache/storybook/`, e em paralelo os dois
      // servidores escrevem e servem os mesmos arquivos: o que perde a corrida
      // recebe bytes de um arquivo em reescrita e reprova com `SyntaxError` em
      // histórias sorteadas. Medido, inclusive com `offscreenSubtreeIsHidden`
      // chegando sem o `o` inicial — conteúdo truncado, não erro de sintaxe.
      // Limpar o cache piora, porque alarga a janela de escrita.
      //
      // `cacheDir` do Vitest não resolve: foi tentado e o complemento o ignora,
      // mantendo o cache no caminho próprio dele. Grupo é o que resolve —
      // projetos do mesmo grupo rodam juntos, e os grupos rodam do menor para o
      // maior. Todo o resto da verificação fica no grupo padrão e continua em
      // paralelo; só os dois temas se revezam.
      sequence: { groupOrder: theme === "light" ? 1 : 2 },
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

// Largura real de janela: modo nativo de navegador do Vitest, sem
// `storybookTest` — o complemento roda num pool próprio que nunca troca
// `vitest/browser` pelo módulo virtual de verdade (docs/pontos-abertos.md,
// ponto 19, e o design de `close-open-points`). `page.viewport()`, daqui,
// tem efeito porque este projeto é o modo nativo, não o pool do addon.
const viewportProject: TestProjectConfiguration = {
  test: {
    name: "viewport",
    include: ["src/**/*.viewport.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
};

export default defineConfig({
  test: {
    projects: [...THEMES.map(benchProject), contractsProject, viewportProject],
  },
});
