import type { StorybookConfig } from "@storybook/react-vite";

// Bancada de verificação de @chargebr/ui: documentação viva a partir das
// histórias, execução das histórias como teste e checagem de acessibilidade
// sobre o resultado renderizado. Nada daqui entra no que a biblioteca publica.
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: { disableTelemetry: true },
};

export default config;
