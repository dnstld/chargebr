import type { DepOptimizationOptions } from "vite";

// Dependências que a bancada pré-empacota antes de servir a primeira história.
//
// O otimizador do Vite roda sem descoberta: empacota só o que está aqui (mais
// o que os plugins do Vitest e do Storybook declaram por conta própria), dentro
// da inicialização do servidor, antes de aceitar qualquer pedido do navegador.
// Com descoberta ligada, uma dependência que o scanner não visse seria
// otimizada no meio da execução e recarregaria a página, invalidando módulos
// em voo — a classe de falha que a bancada não pode ter.
//
// Dependência importada e não listada é servida sem empacotar: ESM funciona,
// mais lento; CJS falha, sempre e com a mesma mensagem. Para que a omissão
// apareça antes disso, src/bench/optimize-deps.test.ts confere que todo
// especificador bare importado por arquivo que chega ao navegador está aqui.
//
// A lista é, por construção, o que o scanner encontrava a partir das histórias,
// dos arquivos de setup e do runtime de preview do Storybook.
export const BENCH_OPTIMIZE_DEPS: DepOptimizationOptions = {
  noDiscovery: true,
  include: [
    // O que as histórias, os átomos e as primitivas importam.
    "react",
    "react/jsx-dev-runtime",
    "react-aria-components",
    "@storybook/react-vite",
    "storybook/test",
    // O que as anotações da bancada (.storybook/) importam.
    "@storybook/addon-a11y/preview",
    "vitest",
    // O que o runtime de preview do Storybook e o complemento de
    // acessibilidade alcançam a partir daí. A sintaxe `pai > filho` resolve
    // o filho a partir do pai: com o pnpm estrito, ele não é visível daqui.
    "storybook/internal/channels",
    "storybook/internal/docs-tools",
    "storybook/internal/preview-api",
    "storybook/internal/preview-errors",
    "storybook/preview-api",
    "storybook > @storybook/global",
    "@storybook/react-vite > @storybook/react > @storybook/react-dom-shim",
    "@storybook/addon-a11y > axe-core",
    // O que o executor do Vitest no navegador alcança, além do que o próprio
    // plugin de navegador do Vitest já declara (vitest > chai etc.).
    "react-dom/test-utils",
    "vite/module-runner",
    "vitest > tinybench",
  ],
};
