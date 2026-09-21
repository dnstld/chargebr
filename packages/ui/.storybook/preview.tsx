import "@chargebr/tokens/tokens.css";
import "./preview.css";
import type { Preview } from "@storybook/react-vite";
import { applyTheme, THEME_LABEL, THEMES, type Theme } from "./theme";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Tema resolvido pelos tokens via data-theme na raiz",
      toolbar: {
        title: "Tema",
        icon: "mirror",
        items: THEMES.map((value) => ({ value, title: THEME_LABEL[value] })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" satisfies Theme },
  decorators: [
    // O atributo é aplicado de forma síncrona, antes de a história renderizar,
    // para que a checagem de acessibilidade meça cor já resolvida no tema.
    (Story, context) => {
      applyTheme(context.globals.theme as Theme);
      return <Story />;
    },
  ],
  parameters: {
    // Reprovação é o padrão, declarado uma vez para toda história. Rebaixar
    // para "todo" é decisão local da história, e aparece na saída da
    // verificação como exceção (ver vitest.setup.ts).
    a11y: { test: "error" },
  },
};

export default preview;
